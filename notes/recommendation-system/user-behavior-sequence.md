# 用户行为序列｜User Behavior Sequence Modeling

<a name="top"></a>

## 目录

- [1. 为什么序列重要](#sec-1)
- [2. LastN Baseline](#sec-2)
  - [2.1 序列模块能放在哪一阶段](#sec-2-1)
- [3. DIN](#sec-3)
- [4. DIEN](#sec-4)
  - [4.1 Auxiliary Loss](#sec-4-1)
  - [4.2 AUGRU](#sec-4-2)
- [5. SIM：长序列先检索再精确交互](#sec-5)
- [6. Transformer 序列模型](#sec-6)
- [7. 序列模型横向对比](#sec-7)
- [8. 电商序列设计](#sec-8)
  - [8.1 不同决策面的序列差异](#sec-8-1)
  - [8.2 多行为序列如何融合](#sec-8-2)
- [9. 评估与诊断](#sec-9)
- [10. 数据泄漏与线上一致性](#sec-10)
- [11. 工业案例](#sec-11)
  - [11.1 短视频商品内容：区分内容兴趣与购物意图](#sec-11-1)
  - [11.2 直播内容流：用户历史与房间商品序列双边建模](#sec-11-2)
  - [11.3 商城商品卡：Session 购买任务与长期复购并存](#sec-11-3)
  - [11.4 搜索与类目浏览：查询改写链刻画任务收敛](#sec-11-4)

---

<a name="sec-1"></a>

## 1. 为什么序列重要

用户画像表达长期倾向，近期序列表达当前 session 意图。电商推荐常需要同时区分：

```text
长期兴趣：稳定的类目、品牌和价格偏好
短期意图：最近点击、搜索、加购所反映的购物任务
```

例如，一个用户长期偏好运动用品，但当前 session 先完整观看跑鞋短视频、点击绑定商品、随后进入讲解跑鞋的直播间，最后在商城比较三个鞋款。长期画像只能告诉模型“可能喜欢运动”，近期序列则表明此刻更具体的任务是“比较跑鞋”。如果下一个候选是跑鞋商品卡，近期行为应被强激活；如果候选是瑜伽垫，同属运动类目但与当前任务较远，权重应更低。

这个例子也说明序列事件不能只存一个 `item_id`。短视频行为至少要区分视频与绑定商品，直播行为要保存 room session 和当时讲解商品，商城行为要区分 SPU、SKU 或 offer；否则模型可能把“喜欢某段内容”误当成“喜欢其所有绑定商品”。

<a name="sec-2"></a>

## 2. LastN Baseline

将最近 N 个交互商品 embedding 做 mean/sum pooling 是稳定基线。实现前需定义：行为类型、时间窗口、去重、截断、padding、时间衰减和未曝光/未点击行为是否进入序列。

平均池化的问题是所有历史行为权重相同，并丢失顺序与候选相关性。

一个更强但仍易解释的基线是时间衰减池化：

```math
h_u=\frac{\sum_{i=1}^{N}\exp(-\lambda\Delta t_i)e_i}
{\sum_{i=1}^{N}\exp(-\lambda\Delta t_i)}
```

它可以回答复杂 attention 的提升究竟来自候选相关性，还是仅来自“最近行为更重要”。

<a name="sec-2-1"></a>

### 2.1 序列模块能放在哪一阶段

候选无关的 pooling、RNN 或 Transformer 可以预先生成用户向量，适用于召回用户塔和粗排用户分支。DIN/SIM 的 query 是当前候选，因此必须逐候选运行，只能放在粗排的轻量交互 head 或精排：

```text
Candidate-independent sequence encoder
→ retrieval / cached pre-ranking user representation

Candidate-aware sequence interaction
→ joint pre-ranking head / full ranking
```

因此“注意力不能用于双塔”并不完全准确：self-attention 可以在用户塔内部编码历史；不能保留纯双塔可分离性的，是让当前候选参与用户表示计算的 cross-attention 或 DIN activation。

<a name="sec-3"></a>

## 3. DIN

DIN 用候选感知 attention 聚合历史：同一用户面对运动鞋与美妆商品时，应激活不同的历史兴趣。

```text
candidate item + each historical item
→ relevance weight
→ weighted user interest
→ prediction
```

attention weight 可用于诊断，但不等同于因果解释。

继续使用上面的例子：给跑鞋候选打分时，跑鞋视频点击、直播间内的鞋款停留和商城鞋款比较应获得较高权重；给护肤品候选打分时，这些行为的权重应下降，模型转而寻找历史中的护肤行为。DIN 的价值不是简单地“记住更多历史”，而是为每个候选重新回答“哪些历史与它有关”。

对候选向量 `q` 和历史行为 `e_i`，DIN 常将 `[e_i, q, e_i-q, e_i⊙q]` 输入 activation unit：

```math
\alpha_i=f(e_i,q),\qquad
h(q)=\sum_i\alpha_i e_i
```

```python
def din_pool(history, candidate, attention_mlp, mask):
    # history: [B, T, D], candidate: [B, D]
    query = candidate.unsqueeze(1).expand_as(history)
    features = torch.cat(
        [history, query, history - query, history * query], dim=-1
    )
    logits = attention_mlp(features).squeeze(-1)
    logits = logits.masked_fill(~mask, -1e9)
    weights = torch.softmax(logits, dim=1)
    return (history * weights.unsqueeze(-1)).sum(dim=1)
```

若原始 DIN 实现采用非归一化权重，聚合向量还会携带兴趣强度；使用 softmax 时则更接近兴趣分布。两者语义不同，应通过 ablation 验证。

<a name="sec-4"></a>

## 4. DIEN

DIEN 在兴趣激活之外进一步建模兴趣随时间演化，适合顺序、时间间隔与兴趣漂移明显的场景。复杂度提升后，要验证增量是否来自真正的序列结构，而非更多参数或更长历史。

DIEN 通常包含：

1. GRU 提取逐步兴趣状态；
2. auxiliary loss 用相邻真实行为和负样本监督中间状态；
3. candidate-aware attention 选择相关兴趣；
4. AUGRU 用 attention 调节更新门，表达兴趣演化。

辅助损失能让中间状态更贴近行为转移，而不是只依赖最终点击标签反向传播。

<a name="sec-4-1"></a>

### 4.1 Auxiliary Loss

令 GRU 在时刻 `t` 的兴趣状态为 `h_t`，下一次真实行为 embedding 为 `e_{t+1}`，负样本为 `\tilde e_{t+1}`。原始实现可使用小型辅助网络判别“真实下一行为/负采样行为”；若 `h_t` 与 item embedding 同维，可用点积作为简化判别器，否则应先加入可学习投影或辅助 MLP。点积版本可写成：

```math
\mathcal L_{aux}=-\sum_t[
\log\sigma(h_t^{\top}e_{t+1})+
\log(1-\sigma(h_t^{\top}\tilde e_{t+1}))
]
```

总损失为：

```math
\mathcal L=\mathcal L_{target}+\alpha\mathcal L_{aux}
```

该损失鼓励状态 `h_t` 预测下一步行为，使兴趣序列更有语义。负样本质量和 `α` 过大都可能让辅助任务压过主任务。

<a name="sec-4-2"></a>

### 4.2 AUGRU

普通 GRU 的更新门为 `u_t`。AUGRU 使用候选相关 attention `a_t` 调节更新强度：

```math
\tilde u_t=a_tu_t
```

```math
h_t=(1-\tilde u_t)\odot h_{t-1}+
\tilde u_t\odot\tilde h_t
```

候选不相关的历史行为获得较小 `a_t`，从而减少其对兴趣演化状态的影响。

<a name="sec-5"></a>

## 5. SIM：长序列先检索再精确交互

DIN 对长度为 `T` 的历史逐候选计算 attention，长到数千或数万行为时成本过高。Search-based Interest Model（SIM）采用两级级联：

```text
Lifelong history of length T
→ General Search Unit: 取与候选相关的 K 条行为
→ Exact Search Unit: 对 K 条行为做候选感知建模
→ candidate-specific interest
```

General Search Unit（GSU）可以是：

- Hard Search：按类目、品牌、商家、内容 cluster 或行为类型建倒排索引；
- Soft Search：候选 embedding 在用户历史向量中做 ANN/Top-K 检索；
- Hybrid Search：多个硬规则与语义检索结果取并集，再轻量去重。

Exact Search Unit（ESU）再使用 DIN、attention 或小型 Transformer 建模候选与筛选序列。若预先构建用户历史索引，昂贵交互从 `O(Td)` 降到约 `O(Kd)`，但还需计入检索与索引维护成本，且 `K` 远小于 `T`。

优势：可以同时利用长期历史和精确候选相关性；局限是 GSU 一旦漏掉关键行为，ESU 无法恢复。评估要分别报告 search recall、最终排序增量、历史索引新鲜度和不同 `K` 下的延迟，而不是只看最终 AUC。

<a name="sec-6"></a>

## 6. Transformer 序列模型

Self-attention 可以同时建模序列中任意两个行为的依赖：

```math
\text{Attention}(Q,K,V)=
\text{softmax}(\frac{QK^{\top}}{\sqrt{d_k}}+M)V
```

其中 `d_k` 是 Key 向量维度，`M` 可用于 padding mask 或 causal mask。相较 RNN，它更容易并行，并能捕捉长距离依赖；但标准 attention 的时间和内存复杂度为 `O(T²)`。

常见方法：

- SASRec：causal self-attention，预测下一交互商品；
- BERT4Rec：双向 masked-item prediction，利用左右上下文；
- BST：将 Transformer 行为表示用于 CTR 预估；
- Long-sequence models：通过兴趣检索、稀疏 attention 或分层建模降低成本。

SASRec 更贴近自回归 next-item prediction；BERT4Rec 的双向上下文适合离线 representation learning，但线上使用必须避免未来信息泄漏。

<a name="sec-7"></a>

## 7. 序列模型横向对比

| 模型 | 候选感知 | 顺序建模 | 长距离依赖 | 计算特点 | 主要局限 |
|---|---:|---:|---:|---|---|
| Mean Pooling | 否 | 否 | 弱 | `O(T)`，最便宜 | 丢失顺序和候选相关性 |
| Time-decay Pooling | 否 | 部分 | 弱 | `O(T)` | 时间衰减形式需手工设定 |
| DIN | 是 | 否 | 通过加权聚合 | `O(T)` | 不显式表达兴趣演化 |
| DIEN | 是 | 是，GRU/AUGRU | 中等 | 顺序计算，训练较慢 | 结构复杂，长序列仍困难 |
| SIM | 是 | 取决于 ESU | 强，先检索长期历史 | 检索 + `O(K)` 精确交互 | GSU 漏召回与索引成本 |
| SASRec/BERT4Rec | 可加入候选 | 是 | 强 | 标准 `O(T²)` | 延迟、显存和线上一致性挑战 |

选择顺序模型时，首先用长度和新鲜度 slice 证明序列确实存在增量；如果大多数用户历史很短，复杂 Transformer 未必优于 DIN。

<a name="sec-8"></a>

## 8. 电商序列设计

- 多行为：click、PDP、ATC、purchase 的意图强度不同；
- 多实体：商品、类目、品牌、商家和内容作者；
- 时间：session 内分钟级意图与跨月长期兴趣；
- 负反馈：跳过、快速返回、取消、退款；
- 交易状态：加购不等于购买，订单不等于履约；
- 隐私与可用性：只使用在打分时已知且合规的特征。

<a name="sec-8-1"></a>

### 8.1 不同决策面的序列差异

| 决策面 | 用户侧序列 | 候选侧动态历史 | 建模重点 |
|---|---|---|---|
| 短视频商品内容流 | 视频曝光、有效播放、跳过、互动、商品点击/购买 | 视频内容与绑定商品版本 | 同时识别内容兴趣与购物意图；播放行为要带时长、完成度和时间间隔 |
| 直播内容流 | 进房、停留、互动、商品点击/加购/支付、主播访问 | 主播历史场次、当前场次已讲/正在讲商品序列 | 用户—主播—商品三元关系；房间当前状态比旧 room ID 更重要 |
| 商城商品卡 | 浏览、PDP、收藏、加购、下单、复购、搜索/筛选 | 商品价格/促销/库存变化历史 | session 购买任务、替代/互补、价格比较和复购周期 |
| 搜索与类目浏览 | 查询、改写、筛选、结果曝光、PDP、返回搜索 | 查询词、筛选条件与结果集合版本 | 从宽泛需求到明确属性的任务收敛；查询文本、点击商品和筛选变化要按真实时间交错编码 |
| 商品详情页与店铺/创作者橱窗 | 进入来源、内容观看、关联商品点击、店内浏览、加购 | 当前页商品、内容绑定和橱窗陈列版本 | 区分对当前商品、内容表达和店铺/创作者的兴趣；避免把页面内重复曝光当成新偏好 |
| 创作者选品 | 查询/筛选商品、查看合作条件、申请样品、接受、发布 | 商品库存、佣金、样品和合作状态历史 | 选品任务会随内容计划和容量变化；接受、发布与买家转化是不同成熟阶段 |

直播排序可同时存在用户历史与房间商品历史。若逐一比较两侧长序列，成本接近二者长度的乘积；可先按类目/商品向量做 co-retrieval，再对少量相关行为做双边交互。商品卡序列则要避免把同一 SPU 的多个 offer 连续行为误当成多个独立兴趣。

<a name="sec-8-2"></a>

### 8.2 多行为序列如何融合

常见方案包括：

1. 分行为序列：点击、加购、购买分别 pooling/attention，解释清楚但网络与特征成本更高；
2. 单序列 + behavior embedding：保留真实时间顺序，用行为类型向量区分强弱；
3. 层级序列：先在 session 内编码，再聚合跨 session 长期兴趣。

不能只给购买行为更大固定权重：购买稀疏且具有周期性，近期浏览可能更能解释当前候选。应按事件类型、时间间隔和候选相关性共同学习，并做单行为 removal ablation。

<a name="sec-9"></a>

## 9. 评估与诊断

除总体 AUC/NDCG 外，重点比较：

- 新用户、短历史和长历史用户；
- 不同序列长度、行为类型与时间间隔；
- session intent 强弱和兴趣切换场景；
- sequence feature missing/fallback rate；
- SIM/长序列检索的 relevant-history Recall@K；
- 不同决策面的机制切片，例如短视频时长桶、直播开播阶段、商品卡复购周期与查询改写深度；
- latency、截断率及线上特征新鲜度。

典型 ablation：无序列 → mean pooling → time decay → DIN/DIEN → SIM 或 Transformer。序列长度增长、候选感知、检索和模型容量应分别做 ablation，否则无法判断收益来源。每一步同时报告效果与成本。

<a name="sec-10"></a>

## 10. 数据泄漏与线上一致性

- 序列只能包含 prediction timestamp 之前发生的事件；
- 支付、取消和退款有延迟，必须使用当时可见的状态；
- 离线 join 应使用 point-in-time correct feature，而非最新快照；
- 线上截断方向要与训练一致，通常保留最近 N 个行为；
- 缓存延迟会改变“最近行为”的含义，应报告 feature freshness。
- 直播训练样本只能使用打分时已发生的房间互动和已展示商品，不能回填整场直播最终热度；
- 视频—商品绑定、商品价格和库存应按事件时间取版本，不能用当前快照覆盖历史；
- 同一请求内的曝光顺序既是输入上下文也是旧策略结果，使用时要防止 position/policy leakage。

<a name="sec-11"></a>

## 11. 工业案例

以下行为数量和指标变化均为示例。这里不再重复通用排序模型选择，而是专门观察顺序、时间间隔、兴趣切换和双边序列是否提供了静态画像无法表达的证据。序列模型应从 LastN 基线逐步升级，并在对应机制切片上验证增量。

<a name="sec-11-1"></a>

### 11.1 短视频商品内容：区分内容兴趣与购物意图

- **现象（示例）**：某用户过去 50 次有效观看主要是美妆内容，但当前 session 连续完整观看 2 条跑鞋视频、点击其中 1 个绑定商品并比较尺码。平均池化仍把美妆作为主兴趣，接下来 10 条推荐中有 7 条是美妆，Fast Skip 比该用户平时高 24%。
- **定位证据**：构造“长期主类目与最近 3/5 次强行为类目不一致”的兴趣切换切片；比较候选相关历史被选中的比例、最近强行为的 attention mass 与不同时间窗的校准。若整体指标变化很小但切换切片明显失败，问题是序列聚合而非用户无兴趣。
- **候选方案或模型对比**：LastN mean pooling 和 time decay 为基线；DIN 让跑鞋候选查询相关历史；DIEN 比较兴趣状态如何随连续行为演化；历史超过服务预算时，SIM 先检索与候选商品或视频相关的少量行为，再做候选感知交互。内容序列与商品序列分别编码。
- **为何有效**：候选感知注意力不会要求一个固定用户向量同时代表所有兴趣；时间与行为强度使当前商品点击比数周前的普通观看更能表达正在发生的购物任务。
- **离线指标**：兴趣切换切片的 PR-AUC、Log Loss 和 ECE，Relevant-history Recall@K、NDCG、序列截断率，以及短/长历史与强/弱行为切片。
- **在线指标**：Fast Skip、Qualified View、Product Clicks per User、Session 类目切换后的命中率、成熟净价值、序列服务 P99 latency 和 Fallback Rate。
- **失败边界**：自动播放完成或停留不一定代表主动兴趣；事件发生后才更新的商品绑定不能回填历史；过强候选注意力可能只复制最近点击并压缩探索空间。

<a name="sec-11-2"></a>

### 11.2 直播内容流：用户历史与房间商品序列双边建模

- **现象（示例）**：一名用户最近 12 个商品强行为中有 5 个与露营相关。某直播间过去一小时主要讲数码商品，但最近 6 分钟已依次讲解帐篷灯和睡袋；仅使用用户序列与主播历史的模型仍低估该房间，导致露营人群进房覆盖低 17%。
- **定位证据**：分别保存用户行为序列和 room session 的事件时商品序列，按“当前商品与主播历史主类目是否一致”切片；比较用户侧相关历史 Recall、房间侧最近商品新鲜度和双边匹配残差。若永久主播表示失准而当前商品序列匹配良好，说明候选侧序列不可省略。
- **候选方案或模型对比**：用户 LastN 与当前商品 attention 为低成本基线；用户侧 DIN 加房间最近商品 pooling 为中等方案；两侧历史较长时，先按类目或商品向量 co-retrieval，再对少量用户事件和房间事件做双边 attention。DIEN 只负责用户兴趣演化，room online state 仍走独立实时特征。
- **为何有效**：直播候选本身随商品切换而变化。双边序列同时回答“用户最近在找什么”和“房间此刻在讲什么”，避免永久主播画像掩盖当前场次的短期匹配。
- **离线指标**：进房、当前商品点击和支付任务的 PR-AUC/ECE；Current-product Match Recall@K；商品切换后 1/5/10 分钟切片；用户与房间序列截断率及推理复杂度。
- **在线指标**：Eligible Room Coverage、Qualified Entry、Quick Exit、当前商品点击、成熟净价值、房间序列 Feature Age、P99 latency 和无效 session rate。
- **失败边界**：未来将讲商品、整场最终热度和结束后成交不能进入请求时序列；房间切换快于特征更新时模型仍会读到旧序列；双边全量 attention 的成本随两侧长度相乘，需要先检索或截断。

<a name="sec-11-3"></a>

### 11.3 商城商品卡：Session 购买任务与长期复购并存

- **现象（示例）**：用户通常每 35–45 天复购咖啡胶囊，但当前 session 刚浏览过 6 张节日礼品卡。固定 time decay 将 41 天前的胶囊支付压到很低权重，首屏几乎全是礼品；复购到期人群的胶囊 Recall@20 比普通人群低 19%。
- **定位证据**：按商品可补货性和用户历史复购间隔建立“预计到期”切片，分别计算 session 行为贡献与长期支付贡献；比较不同衰减函数下相关历史召回。若固定衰减只在周期购切片失效，而近期礼品点击校准正常，就不应简单增大整个历史窗口。
- **候选方案或模型对比**：LastN+固定衰减为基线；DIN 用候选商品激活相关支付与浏览；层级模型先编码当前 session 任务，再编码长期类目、品牌和复购周期；超长历史使用 SIM 检索相同或可替代 SPU 的成熟购买记录。周期信号作为候选相关时间特征，而非全局 boost。
- **为何有效**：session 编码保留用户正在挑选礼品的短期任务，长期层又允许补货型商品在接近个人复购周期时恢复权重，两种兴趣不必被压成单一平均向量。
- **离线指标**：PDP、加购、支付和复购任务的 PR-AUC/ECE；周期购 Recall@K、Time-to-next-purchase 误差、Relevant-history Recall、不同历史长度与复购间隔切片。
- **在线指标**：Product-card CTR、ATC、复购买家率、成熟净价值、Session 商品覆盖、重复 offer rate、序列服务 P99 latency 和长期兴趣曝光占比。
- **失败边界**：取消或退款订单不能作为正向成熟复购；同一 SPU 的多个 offer 需要去重；使用未来实际复购间隔会泄漏；周期模型不适用于低频耐用品，必须按类目或可补货属性启用。

<a name="sec-11-4"></a>

### 11.4 搜索与类目浏览：查询改写链刻画任务收敛

- **现象（示例）**：用户依次搜索“徒步鞋”→“防水徒步鞋”→“女 37 码”，并在第二次查询后点击两个商品。只对最后一个查询做静态编码的模型虽然理解尺码，却忽略用户先前比较过的价格带与防水属性，Top 10 中仍出现大量不合尺码或重复看过的商品，返回搜索率提高 14%。
- **定位证据**：把查询、筛选、结果点击、详情页停留和返回搜索按事件时间组成 session，按改写深度、属性增加/删除、重复点击和任务中断切片。比较模型选中的 Relevant-history、约束保持率和每次改写后的校准；若错误集中在多轮收敛而单轮查询正常，问题来自任务序列而非商品表示。
- **候选方案或模型对比**：LastN 查询/点击 pooling 为基线；DIN 让候选商品激活相关查询和商品历史；层级模型先编码每轮 query–result 交互，再聚合整个搜索 session；长会话可用 SIM 按候选属性检索相关历史。Transformer 适合显式建模改写顺序，但需与同参数预算的 DIN 比较，并把硬筛选条件单独传给约束层。
- **为何有效**：查询序列显示意图如何从宽类目收敛到属性和规格，点击与返回搜索又说明哪些候选只满足了部分需求。候选感知编码可以利用有信息量的早期比较，同时让后出现的明确条件拥有更高新鲜度。
- **离线指标**：Query/Item NDCG、Attribute Match Rate、Relevant-history Recall@K、改写深度切片的 PR-AUC/ECE、重复候选率、序列截断率和推理成本。
- **在线指标**：Zero-result Rate、Reformulation Rate、Return-to-search Rate、PDP per Searcher、加购/支付买家率、成熟净价值、P99 latency 和序列 Fallback Rate。
- **失败边界**：后续改写和点击不能回填为早先请求特征；无点击可能来自结果未真正可见或查询中断，不能一律作为负兴趣。明确规格和筛选条件必须由 eligibility 保证，序列模型只能在合格候选内学习偏好；跨设备或跨长时间窗口拼接查询需防止把不同购物任务误连。


相关：[粗排与精排](./ranking.md)、[冷启动](./cold-start.md)。
