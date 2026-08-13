# 召回｜Retrieval

## 1. 目标与位置

召回从大规模 eligible 商品/内容池中，低延迟地产生几百到几千个高潜候选。它追求的是高价值候选覆盖，而不是最终列表精度。

```text
Eligible pool → Multi-channel recall → Merge / Dedup / Filter → Pre-rank
```

## 2. 多路召回

| 通道 | 核心信号 | 适合解决 |
|---|---|---|
| ItemCF | 商品行为共现 | 从近期点击、加购或购买扩展相似商品 |
| UserCF | 相似用户行为 | 行为密集场景中的兴趣迁移 |
| Two-Tower | 用户—商品向量匹配 | 大规模个性化语义/行为召回 |
| Graph | 用户、商品、内容、商家关系 | 多跳兴趣与稀疏关系 |
| Popular/Trending | 市场或人群热度 | 稳定覆盖和弱个性化 fallback |
| Fresh | 发布时间/上架时间 | 新商品探索与供给发现 |
| Category/Seller | 类目、品牌、店铺偏好 | 强兴趣覆盖和业务可解释性 |

分析时同时看新增候选和渠道重叠；“召回量增加”不代表有效增量。

## 3. Collaborative Filtering

ItemCF 依据共同交互用户计算商品相似度。原始共现容易被热门商品支配，可用 cosine、Jaccard、lift 或对热门节点降权。行为也不应等价处理：购买、加购、点击的意图强度和稀疏性不同。

UserCF 通过相似用户发现候选，但大规模系统的计算和行为漂移使其通常需要近似化或离线索引。

共同限制：曝光偏差、热门偏差、新用户/新商品冷启动和交互稀疏。

### 3.1 ItemCF 相似度

令 `U(i)` 为与商品 `i` 发生过目标行为的用户集合。常见相似度包括：

$$
\text{cosine}(i,j)=\frac{|U(i)\cap U(j)|}{\sqrt{|U(i)|\,|U(j)|}}
$$

$$
\text{Jaccard}(i,j)=\frac{|U(i)\cap U(j)|}{|U(i)\cup U(j)|}
$$

Cosine 会对商品热度做一定归一化；Jaccard 更强调共同用户占并集的比例。实际系统通常还会加入时间衰减、行为权重和热门惩罚：

$$
w_{ij}=\sum_{u\in U(i)\cap U(j)}
\frac{a_{ui}a_{uj}\exp(-\lambda\Delta t)}{\log(1+|I(u)|)}
$$

其中 `a` 表示点击、加购或购买的行为权重，分母用于降低高活跃用户对共现统计的支配。

```python
def build_itemcf(user_items):
    cooccur = defaultdict(float)
    item_count = defaultdict(int)

    for _, items in user_items.items():
        unique_items = list(dict.fromkeys(items))
        user_weight = 1.0 / log(2.0 + len(unique_items))
        for i in unique_items:
            item_count[i] += 1
            for j in unique_items:
                if i != j:
                    cooccur[i, j] += user_weight

    return {
        (i, j): cij / sqrt(item_count[i] * item_count[j])
        for (i, j), cij in cooccur.items()
    }
```

离线计算时应设置行为窗口，避免把数月前的弱相关共现当成当前替代或互补关系。

## 4. Two-Tower

```text
User tower(context, profile, behavior) → u
Item tower(product, content, seller)   → v
score(u, v) = dot(u, v) or cosine(u, v)
```

商品向量可离线计算并写入 ANN 索引；线上只需生成用户向量并检索 Top-K。Two-Tower 是架构范式，两侧不要求使用 BERT。

### 4.1 样本设计

- 正样本：曝光后发生目标行为的 user-item pair；
- 随机负样本：易获得但可能过于简单；
- In-batch negatives：高效，但受 batch 组成影响；
- Hard negatives：曝光未点击或相似但未选择的候选，信息量高；
- Debiasing：处理位置、曝光策略和热门度造成的选择偏差。

训练目标必须匹配召回意图。以点击为正样本可能提升 click recall，却未必提升 purchase recall。

### 4.2 对比学习目标

双塔常使用 sampled softmax 或 InfoNCE。对一个正样本 `(u, i⁺)` 和一组负样本 `N`：

$$
\mathcal{L}=-\log
\frac{\exp(s(u,i^+)/\tau)}
{\exp(s(u,i^+)/\tau)+\sum_{j\in N}\exp(s(u,j)/\tau)}
$$

`τ` 是 temperature。较小的 `τ` 会放大相似度差异，但也可能使训练更不稳定。若用 in-batch negatives，需要留意同一用户可能真正喜欢 batch 中其他商品，从而产生 false negatives。

```python
def in_batch_retrieval_loss(user_vec, item_vec, temperature=0.07):
    user_vec = F.normalize(user_vec, dim=1)
    item_vec = F.normalize(item_vec, dim=1)
    logits = user_vec @ item_vec.T / temperature
    labels = torch.arange(logits.size(0), device=logits.device)
    return F.cross_entropy(logits, labels)
```

### 4.3 Hard Negative Mining

有效的 hard negative 可以来自：

1. 同一次请求中被曝光但未产生目标行为的商品；
2. 旧模型召回且得分较高、但用户未选择的商品；
3. 与正样本同类目或相近价格带的商品；
4. ANN 检索到的近邻误匹配。

Hard negative 过难时可能包含未观测正例，因此通常混合随机负样本与困难负样本，并按曝光概率或采样概率修正损失。

## 5. ANN 与线上服务

ANN 用少量精度换取大规模低延迟检索。需要联合评估：

- exact recall / ANN recall；
- 索引新鲜度与增量更新延迟；
- P50/P95/P99 latency；
- 内存、分片、fallback 与超时率；
- 市场、库存和 eligibility 过滤后的有效返回量。

Bloom Filter 可用于高效判断近期已曝光集合，但存在 false positive，需衡量对新颖性与有效候选的影响。

### 5.1 ANN 索引方法对比

| 方法 | 核心思想 | 查询特点 | 内存/构建 | 适用情况 |
|---|---|---|---|---|
| Flat / Brute Force | 与所有向量精确比较 | Recall 最高，`O(Nd)` | 构建简单 | 小规模、离线基准 |
| IVF | 先检索聚类中心，再扫描部分 inverted lists | `nprobe` 控制 recall/latency | 需要训练 coarse quantizer | 大规模、可调延迟预算 |
| PQ / IVFPQ | 将向量分块量化并用码本近似距离 | 内存低、距离近似 | 有量化误差 | 超大规模、内存敏感 |
| HNSW | 多层近邻图上的贪心搜索 | 高 recall、低延迟 | 内存较高，动态维护复杂 | 高质量在线 ANN |

HNSW 的 `efSearch`、IVF 的 `nprobe` 都体现 recall–latency trade-off。ANN 评估必须与精确 Top-K 对照：

$$
ANN\ Recall@K=\frac{|TopK_{ANN}\cap TopK_{Exact}|}{K}
$$

这衡量索引逼近质量，不等同于以用户行为标签计算的推荐 Recall@K。

## 6. 召回模型横向对比

| 方法 | 个性化 | 冷启动 | 实时性 | 可解释性 | 主要优势 | 主要局限 |
|---|---:|---:|---:|---:|---|---|
| Popular/Trending | 弱 | 强 | 强 | 强 | 稳定、便宜、fallback 可靠 | 缺少个性化，放大热门偏差 |
| ItemCF | 中 | 弱 | 中 | 强 | 共现关系直接、工程成熟 | 新商品困难，受曝光偏差影响 |
| UserCF | 中 | 弱 | 弱 | 中 | 兴趣迁移直观 | 大规模计算重，用户兴趣漂移 |
| Matrix Factorization | 强 | 弱 | 中 | 中 | 学习紧凑 latent factors | 依赖 ID 和历史交互 |
| Two-Tower | 强 | 中到强 | 强 | 弱 | 可融合丰富特征，适合 ANN | 点积交互受限，负采样敏感 |
| Graph Retrieval | 强 | 中 | 较弱 | 中 | 表达多跳关系和高阶协同 | 训练、更新和服务复杂 |
| Content Retrieval | 中 | 强 | 强 | 中 | 适合新商品和语义匹配 | 行为个性化较弱 |

Two-Tower 的最大工程优势是 item embedding 可预计算；代价是 user 与 item 在最终打分前几乎不做深度交互。Cross-encoder 表达更强，但通常无法直接对全库商品在线计算，因此更适合后续排序。

## 7. 评估框架

| 层级 | 指标 |
|---|---|
| Offline | Recall@K、HitRate@K、NDCG@K、coverage |
| Channel | quota、return rate、unique contribution、overlap |
| Funnel | pre-rank pass、rank top-K、final exposure rate |
| Distribution | category/seller/price/new-item mix、concentration |
| System | latency、timeout、empty result、index freshness |
| Online | CTR、CVR、Net GMV、buyer/seller guardrails |

离线 Recall@K 上升后，应追踪新候选是否真正通过粗排、精排和重排并获得曝光。

## 8. 常见失败模式

- 某通道占满配额但 unique contribution 很低；
- 训练负样本与线上曝光分布不一致；
- 热门商品表示更充分，进一步放大头部偏差；
- ANN 索引陈旧，召回缺货或已失效商品；
- 新通道提高 CTR，却通过低价/低质量 mix 损害 Net GMV；
- 去重和 eligibility 改动被误判为召回模型效果。

## 9. 召回渠道增量分析

只看每个渠道的归因成交会重复计算多个渠道共同召回的商品。更有用的是计算 unique contribution 和 leave-one-channel-out loss：

```sql
SELECT
    channel,
    COUNT(DISTINCT item_id) AS candidate_items,
    COUNT(DISTINCT CASE WHEN channel_count = 1 THEN item_id END) AS unique_items,
    AVG(passed_prerank) AS prerank_pass_rate,
    AVG(final_exposed) AS final_exposure_rate
FROM candidate_log
WHERE event_date = '${date}'
GROUP BY channel;
```

若移除一个渠道后 Top-K 质量几乎不变，它可能主要消耗配额和延迟，而没有提供边际价值。


下一步：[粗排与精排](./ranking.md)；冷启动专题：[cold-start.md](./cold-start.md)。
