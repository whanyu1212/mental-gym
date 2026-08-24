# 召回｜Retrieval

<a name="top"></a>

## 目录

- [1. 目标与位置](#sec-1)
- [2. 多路召回](#sec-2)
  - [2.1 不同决策面的召回对象](#sec-2-1)
- [3. Collaborative Filtering](#sec-3)
  - [3.1 ItemCF 相似度](#sec-3-1)
  - [3.2 Swing](#sec-3-2)
  - [3.3 UserCF](#sec-3-3)
  - [3.4 ItemCF、Swing 与 UserCF 对比](#sec-3-4)
  - [3.5 不同决策面的使用方式](#sec-3-5)
- [4. Two-Tower](#sec-4)
  - [4.1 样本设计](#sec-4-1)
  - [4.2 对比学习目标](#sec-4-2)
  - [4.3 Hard Negative Mining](#sec-4-3)
  - [4.4 单向量与多兴趣召回](#sec-4-4)
  - [4.5 长尾表示与更新频率](#sec-4-5)
    - [4.5.1 不同更新对象不能混为一谈](#sec-4-5-1)
    - [4.5.2 新 Item 向量如何进入召回](#sec-4-5-2)
    - [4.5.3 何时必须重编码与重建索引](#sec-4-5-3)
    - [4.5.4 冷启动状态与实时倒排](#sec-4-5-4)
  - [4.6 召回覆盖与兴趣多样性](#sec-4-6)
- [5. 训练样本与负采样](#sec-5)
  - [5.1 正样本、时间截点与标签窗口](#sec-5-1)
  - [5.2 正样本分布：过采样、降采样与权重](#sec-5-2)
  - [5.3 曝光未点击为什么不是天然负样本](#sec-5-3)
  - [5.4 负样本家族：优缺点与使用边界](#sec-5-4)
  - [5.5 In-batch Negative、流行度概率与 log Q 校正](#sec-5-5)
  - [5.6 Hard Negative 难度阶梯](#sec-5-6)
  - [5.7 False Negative 与混合负样本](#sec-5-7)
  - [5.8 时间切分与数据泄漏](#sec-5-8)
  - [5.9 Importance Weight 与校正边界](#sec-5-9)
  - [5.10 工业案例：跨场景的具体样本设计](#sec-5-10)
    - [5.10.1 短视频商品内容：新内容进入交易召回](#sec-5-10-1)
    - [5.10.2 直播内容流：新场次与当前商品切换](#sec-5-10-2)
    - [5.10.3 商城商品卡：替代、互补与多 Offer](#sec-5-10-3)
    - [5.10.4 搜索与类目浏览：词项召回和语义召回协同](#sec-5-10-4)
- [6. ANN 与线上服务](#sec-6)
  - [6.1 ANN 索引方法对比](#sec-6-1)
- [7. Graph 与结构化召回](#sec-7)
- [8. 召回模型横向对比](#sec-8)
- [9. 评估框架](#sec-9)
- [10. 常见失败模式](#sec-10)
- [11. 召回渠道增量分析](#sec-11)

---

<a name="sec-1"></a>

## 1. 目标与位置

召回从大规模 eligible 商品/内容池中，低延迟地产生几百到几千个高潜候选。它追求的是高价值候选覆盖，而不是最终列表精度。

```text
Eligible pool → Multi-channel recall → Merge / Dedup / Filter → Pre-rank
```

<a name="sec-2"></a>

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
| Carry-over Cache | 前几次精排靠前但尚未曝光的候选 | 减少重复计算并延续 session 意图 |

分析时同时看新增候选和渠道重叠；“召回量增加”不代表有效增量。

Carry-over cache 只应保存尚未真实曝光且仍有效的高分候选，并设置曝光即退场、最大召回次数、容量和 TTL。直播间下播、商品缺货或视频绑定变化时必须立即失效；否则缓存会把旧请求的高分变成当前请求的脏候选。

<a name="sec-2-1"></a>

### 2.1 不同决策面的召回对象

| 决策面 | 主要候选实体 | 高价值召回通道 | 必须在线处理的条件 |
|---|---|---|---|
| 短视频商品内容流 | 可推荐视频 | 视频/作者 I2I、用户—视频双塔、多模态内容、关注作者、实时趋势、商品兴趣扩展 | 内容安全、视频状态、商品绑定和可售性；避免只因商品相似就忽略内容兴趣 |
| 直播内容流 | 在线 room session | 关注/常看主播、用户—直播间匹配、同看房间、当前商品类目、实时热门房间 | 开播/下播、地域可见、当前商品、库存和风险状态；索引需要短 TTL 与曝光前复核 |
| 商城商品卡 | SKU/SPU/offer | ItemCF/Swing、双塔、同类替代、购物篮互补、类目/品牌/商家、价格带 | 库存、价格、配送范围、商家状态和重复 offer；替代品与互补品应分通道建模 |
| 搜索与类目浏览 | 与查询、筛选条件匹配的 SKU/SPU/offer | 词项倒排、查询—商品双塔、类目路径、属性过滤、查询改写 | 词项约束、筛选一致性、可售性与地域；语义扩展不能越过明确品牌、规格或价格条件 |
| 商品详情页与店铺/创作者橱窗 | 关联商品、解释内容或橱窗商品 | 同款替代、购物篮互补、内容—商品相似、店铺/创作者亲和 | 当前页面上下文、重复商品、绑定有效性；购买前替代与购买后互补要分开 |
| 创作者选品 | 适合创作与带货的商品或商家 offer | 创作者—商品双塔、受众—商品匹配、内容主题、历史合作图 | 商品样品/库存、合作资格、佣金与履约；创作者接受不等于最终买家转化 |

直播不是普通商品召回：候选房间集合持续变化，用户兴趣还要与“主播当前正在卖什么”匹配。短视频召回则有两层相关性——用户是否愿意消费内容、用户是否可能对绑定商品产生交易行为——两者可分别建通道或训练多目标表示。商品卡召回更接近交易意图，需要区分浏览相似、替代关系和购物篮互补关系。

<a name="sec-3"></a>

## 3. Collaborative Filtering

协同过滤（Collaborative Filtering, CF）不要求先理解商品文本或视频画面，而是从“哪些用户与哪些对象发生过行为”中寻找重复结构：

- ItemCF：如果很多用户都与 `i`、`j` 交互，就把 `j` 作为 `i` 的邻居；
- UserCF：如果用户 `u`、`v` 的历史相似，就用 `v` 喜欢而 `u` 尚未见过的对象扩展候选；
- Swing：仍生成 item-to-item 邻居，但进一步判断共同用户提供的是独立证据，还是来自高度重叠的小圈层。

三者学习的是行为关系，不等于内容语义相似。两个外观完全不同的商品可能因为互补购买而相近；两个画面相似的视频也可能因为受众和交易意图不同而相距很远。共同限制包括曝光偏差、热门偏差、交互稀疏，以及没有历史行为的新用户或新对象冷启动。

<a name="sec-3-1"></a>

### 3.1 ItemCF 相似度

#### 3.1.1 从二值交互矩阵到 cosine

先把日志转成用户—对象交互矩阵。令 `x_ui` 表示用户 `u` 是否与对象 `i` 发生过目标行为；二值场景中，发生过记为 1，否则记为 0。一个对象对应矩阵中的一列，因此 ItemCF 的 cosine similarity 就是两列向量的夹角相似度：

```math
x_{ui}\in\{0,1\},\qquad
\mathrm{sim}_{bin}(i,j)=
\frac{\sum_{u}x_{ui}x_{uj}}
{\sqrt{\sum_{u}x_{ui}^{2}}\sqrt{\sum_{u}x_{uj}^{2}}}
```

令 `U(i)` 为与对象 `i` 发生过目标行为的用户集合。因为二值变量的平方仍等于自身，上式也可以写成集合形式：

```math
\mathrm{sim}_{bin}(i,j)=
\frac{|U(i)\cap U(j)|}
{\sqrt{|U(i)|\,|U(j)|}}
```

这个式子的三个部分分别表示：

- 分子：同时与 `i`、`j` 交互的用户数，是两者共现证据；
- 第一个分母项：对象 `i` 的用户规模；
- 第二个分母项：对象 `j` 的用户规模。

分母避免仅凭绝对共现次数就判定相似。例如热门对象可能与几乎所有对象都有大量共同用户；cosine 会按两边各自的用户规模归一化。不过它只能缓解热门偏差，不能消除曝光机制带来的偏差：热门对象获得更多曝光，覆盖的人群也更宽，仍可能成为许多对象的“通用邻居”。实践中还会设置最小共同用户数、过滤极热门对象、使用 lift/Jaccard，或在共现累计时降低热门节点和高活跃用户的权重。

一步步看一个二值例子：

| 用户 | 交互历史 |
|---|---|
| A | 相机、存储卡 |
| B | 相机、存储卡 |
| C | 相机、三脚架 |

`相机` 有 3 个用户，`存储卡` 有 2 个用户，两者有 2 个共同用户，因此：

```math
\mathrm{sim}_{bin}(\text{相机},\text{存储卡})
=\frac{2}{\sqrt{3\times2}}\approx0.816
```

`相机` 与 `三脚架` 只有 1 个共同用户：

```math
\mathrm{sim}_{bin}(\text{相机},\text{三脚架})
=\frac{1}{\sqrt{3\times1}}\approx0.577
```

所以在这批行为中，存储卡是相机更强的邻居。这个结论表示“行为上经常一起出现”，可能是互补关系，并不表示两个对象在内容上相像。

Jaccard 是另一个常用归一化方式：

```math
\mathrm{Jaccard}(i,j)=
\frac{|U(i)\cap U(j)|}
{|U(i)\cup U(j)|}
```

Cosine 按两侧向量长度归一化；Jaccard 则直接衡量共同用户占两侧全部用户的比例。当两个对象热度相差很大时，两者的排序可能不同，因此应该根据下游关系和离线—在线验证选择，而不是默认其中一个总是更好。

#### 3.1.2 加权 cosine

点击、有效观看、加购和购买不应全部记成同样的 1。令 `r_ui` 为用户 `u` 对对象 `i` 的非负交互强度，它可以同时包含行为类型、时间衰减和有效性权重。加权 cosine 为：

```math
\mathrm{sim}_{w}(i,j)=
\frac{\sum_{u}r_{ui}r_{uj}}
{\sqrt{\sum_{u}r_{ui}^{2}}\sqrt{\sum_{u}r_{uj}^{2}}}
```

分子要求同一用户在两侧都具有较强权重；分母按两个对象的总加权强度归一化。若购买权重大于点击，则共同购买对相似度贡献更大。但权重并非越激进越好：购买更接近交易意图，却更稀疏，也更容易让少量重度用户主导结果。短视频的有效观看与商品点击、直播的进房与下单、商城的详情页浏览与购买通常应分别设权或分别建图，避免一个相似度混合不同含义。

实际系统也可以先累计带时间与活跃度惩罚的共现，再做热门度归一化。下面是一种共现累计形式：

```math
\mathrm{cooc}(i,j)=\sum_{u\in U(i)\cap U(j)}
\frac{a_{ui}a_{uj}\exp(-\lambda\Delta t_{uij})}
{\log(1+|I(u)|)}
```

其中 `I(u)` 是用户 `u` 的历史对象集合，`a_ui` 是行为权重，`lambda` 是非负时间衰减强度。`Delta t_uij` 必须明确表示两次行为的时间间隔、较晚事件距当前的年龄，或二者的组合；不同定义对应“相邻行为更相关”或“近期行为更相关”等不同假设。分母降低超长历史用户对所有对象对的支配。`cooc(i,j)` 仍是共现强度，若要得到归一化相似度，还需再除以两侧对象的加权规模。

```python
def build_binary_itemcf(user_items):
    cooccur = {}
    item_count = {}

    for _, items in user_items.items():
        unique_items = list(dict.fromkeys(items))
        for i in unique_items:
            item_count[i] = item_count.get(i, 0) + 1
            for j in unique_items:
                if i != j:
                    pair = (i, j)
                    cooccur[pair] = cooccur.get(pair, 0) + 1

    return {
        (i, j): cij / (item_count[i] * item_count[j]) ** 0.5
        for (i, j), cij in cooccur.items()
    }
```

这段代码展示的是二值 cosine ItemCF 的离线骨架：先按用户产生对象对并累计共同用户数，再除以两侧对象规模。真实实现通常会先截断每个用户参与建图的历史长度，设置行为窗口与最小共现阈值，然后只保留每个对象的 Top-K 邻居；否则离线对象对数量最坏会随单个用户历史长度的平方增长。若使用前面的加权 cosine，计数表还需同时累计交互乘积和每个对象的权重平方和。

#### 3.1.3 从用户历史到候选分数

相似度回答“对象和对象有多相关”，召回还要回答“当前用户应该从哪些邻居开始扩展”。令 `H(u)` 为用户 `u` 的历史种子集合，`g_ui` 为该种子的行为强度与时间权重，用户对候选 `j` 的分数可以写成：

```math
s_{ItemCF}(u,j)=
\sum_{i\in H(u)}g_{ui}\mathrm{sim}(i,j)
\mathbf{1}[j\notin H(u)]
```

指示函数用于排除已经消费过的对象；是否排除已购商品要由场景决定，例如消耗品复购可能需要保留。`g_ui` 可以让近期购买种子比很久以前的浅点击贡献更大。为避免长历史用户仅靠求和得到更大的分数，也可以按种子总权重归一化，其中 `epsilon` 是防止分母为零的正数：

```math
\bar{s}_{ItemCF}(u,j)=
\frac{\sum_{i\in H(u)}g_{ui}\mathrm{sim}(i,j)
\mathbf{1}[j\notin H(u)]}
{\epsilon+\sum_{i\in H(u)}g_{ui}}
```

例如某用户近期点击相机，种子权重为 1；又购买笔记本电脑，种子权重为 2。若存储卡与相机、笔记本电脑的相似度分别为 0.82、0.20，则它的未归一化候选分数为：

```math
s_{ItemCF}(u,\text{存储卡})=1\times0.82+2\times0.20=1.22
```

这个分数不是点击率或购买概率，只是该召回通道内部的候选优先级。它与其他召回通道合并前通常还要做通道内归一化、截断或校准。

#### 3.1.4 两层索引与线上合并

ItemCF 的低延迟来自把计算拆成两层：第一层读取用户的近期种子，第二层查询每个种子的预计算邻居。

```text
User-state index
user_id → [(seed_id, seed_weight), ...]

Item-neighbor index
seed_id → [(candidate_id, similarity), ...]

Online request
user_id → seeds → neighbors → aggregate → deduplicate → eligibility filter → Top-N
```

线上步骤可以拆成：

1. 从 user-state index 读取最近或最强的若干种子；`seed_weight` 已融合行为类型、事件时间和种子质量，原始元数据可随索引另外保存；
2. 用每个 `seed_id` 查询 item-neighbor index 的 Top-K 邻居；
3. 按“种子权重 × 邻居相似度”累计同一候选的多条路径；
4. 去除重复和不符合资格的对象，按场景决定是否过滤已消费或已购对象，并保留贡献最大的种子作为解释；
5. 对不足的候选做补召回，最终返回通道 Top-N。

```python
def itemcf_recall(user_id, user_seed_index, item_neighbor_index, eligible, top_n):
    scores = {}
    reasons = {}

    for seed_id, seed_weight in user_seed_index.get(user_id, []):
        for candidate_id, similarity in item_neighbor_index.get(seed_id, []):
            # eligible 同时封装状态、库存及已消费对象是否允许返回等规则。
            if not eligible(candidate_id):
                continue
            contribution = seed_weight * similarity
            scores[candidate_id] = scores.get(candidate_id, 0.0) + contribution
            if contribution > reasons.get(candidate_id, (None, -1.0))[1]:
                reasons[candidate_id] = (seed_id, contribution)

    ranked = sorted(scores, key=scores.get, reverse=True)
    return [(candidate_id, scores[candidate_id], reasons[candidate_id])
            for candidate_id in ranked[:top_n]]
```

若每个请求使用 `S` 个种子、每个种子读取 `K` 个邻居，候选展开与聚合成本近似为 `O(SK)`。若合并后有 `M` 个不同候选，完整排序还需约 `O(M log M)`；只维护 Top-N heap 时约为 `O(M log N)`。线上瓶颈经常不是乘加本身，而是多次索引读取、热点 key、去重、资格过滤以及邻居失效后的候选补齐。

<a name="sec-3-2"></a>

### 3.2 Swing

ItemCF 把每个共同用户看成一份证据，却没有判断这些证据是否相互独立。假设 20 个高度相似的账号总是一起浏览同一批对象，它们可能来自一个极窄兴趣圈层、同一组织或异常协同行为；把 20 次共现直接相加，会让局部关系看起来像全局强关系。

Swing 的关键直觉是：不仅看“哪些用户同时与 `i`、`j` 交互”，还把共同用户两两组成用户对。若一对用户除 `i`、`j` 外还重叠大量对象，那么这对用户再次共同选择 `i`、`j` 所提供的新信息较少，应该降权。

先令 `P_ij` 表示共同用户集合中所有满足 `u < v` 的无序用户对。一个常见的简化形式为：

```math
S_{ij}^{Swing}
=
\sum_{(u,v)\in P_{ij}}
\frac{w_u w_v}
{\alpha+|I(u)\cap I(v)|}
```

这里先给用户规定任意固定顺序，`u < v` 仅用于让每个不同的无序用户对计算一次，不表示用户大小；`I(u)` 是用户 `u` 的历史集合，`w_u`、`w_v` 是可选的非负用户活跃度权重，`alpha` 是正平滑项。竖线表示集合大小。分母越大，表示这两个用户整体越相似，对当前对象对提供的独立信息越少。有些实现会遍历有序用户对，使总分相差一个固定倍数；只要建图与阈值口径一致，邻居排序不受该倍数影响。

取 `alpha=1` 且暂令 `w_u=w_v=1`，如果用户 A、B 一共重叠 20 个对象，则该用户对的基础贡献为：

```math
\frac{1}{1+20}\approx0.048
```

如果用户 C、D 只共同出现于当前两个对象，交集大小为 2，则贡献为：

```math
\frac{1}{1+2}\approx0.333
```

因此，历史行为重叠较小的用户对共同选择 `i`、`j` 时，这份证据更有区分度。`alpha` 越大，用户重叠大小造成的相对差异越弱；它也避免分母过小。生产实现还常限制用户序列长度、每个对象参与计算的用户数、共现时间跨度，并降低超活跃用户贡献，否则构造用户对的开销可能很高。

Swing 最终仍然输出 `item → neighbors`，线上可以复用 ItemCF 的“用户种子 → 邻居展开 → 聚合”服务链路，只是离线邻居权重的计算不同。它不是 UserCF，也不是图神经网络；只有一个共同用户时，无法形成用户对，通常需要 ItemCF、内容召回或热门召回补充覆盖。

<a name="sec-3-3"></a>

### 3.3 UserCF

UserCF 交换了 ItemCF 的观察方向：ItemCF 找“和种子对象相似的对象”，UserCF 先找“和当前用户相似的用户”，再从这些邻居用户的历史中生成候选。

令 `I(u)`、`I(v)` 分别为用户 `u`、`v` 的二值交互集合，用户 cosine similarity 为：

```math
\mathrm{sim}_{user}(u,v)=
\frac{|I(u)\cap I(v)|}
{\sqrt{|I(u)|\,|I(v)|}}
```

先为目标用户保留最相似的 `K` 个邻居，记作 `N_K(u)`。再用邻居用户对候选 `j` 的非负行为强度 `r_vj` 聚合得分；若用户 `v` 未与 `j` 交互，则令 `r_vj=0`：

```math
s_{UserCF}(u,j)=
\sum_{v\in N_K(u)}
\mathrm{sim}_{user}(u,v)r_{vj}
\mathbf{1}[j\notin I(u)]
```

若不同请求能够找到的邻居数量或相似度总量差异很大，可使用归一化形式；这里 `epsilon` 同样是防止分母为零的正数：

```math
\bar{s}_{UserCF}(u,j)=
\frac{\sum_{v\in N_K(u)}\mathrm{sim}_{user}(u,v)r_{vj}}
{\epsilon+\sum_{v\in N_K(u)}
|\mathrm{sim}_{user}(u,v)|
\mathbf{1}[r_{vj}>0]}
\mathbf{1}[j\notin I(u)]
```

这里分母只累计真正为候选 `j` 提供行为证据的邻居相似度；若用全部 Top-K 邻居作分母，则会额外惩罚只被少量邻居消费的候选，那是另一种带流行度倾向的打分口径，应单独验证。

一个小例子：目标用户 A 看过相机和三脚架；用户 B 看过相机、三脚架和存储卡；用户 C 看过相机、运动鞋和存储卡。于是：

```math
\mathrm{sim}_{user}(A,B)=\frac{2}{\sqrt{2\times3}}\approx0.816
```

```math
\mathrm{sim}_{user}(A,C)=\frac{1}{\sqrt{2\times3}}\approx0.408
```

如果 B、C 对存储卡的行为权重都为 1，则 A 对存储卡的候选分数为：

```math
s_{UserCF}(A,\text{存储卡})=0.816+0.408=1.224
```

UserCF 可以把相似用户的新兴趣直接迁移给当前用户，但有四个明显边界：

1. 用户状态变化快，邻居关系比 item-to-item 关系更容易过期；
2. 用户规模通常远大于单个请求能实时比较的范围，需要倒排共现、近似近邻或离线 Top-K user-neighbor index；
3. 高活跃用户之间更容易产生交集，需要活跃度归一化、时间窗口和最小共同交互阈值；
4. 相似用户看过某对象不代表目标用户有机会看到它，曝光偏差和热门偏差仍会进入候选。

在大规模线上服务中，UserCF 通常读取 `user → similar users`，再展开 `similar user → recent items`。如果每个目标用户取 `K_u` 个邻居、每个邻居展开 `L` 个对象，候选生成近似为 `O(K_uL)`，还要控制邻居历史长度与对象时效。它更适合作为多路召回中的补充通道，而不是唯一候选来源。

<a name="sec-3-4"></a>

### 3.4 ItemCF、Swing 与 UserCF 对比

| 方法 | 优点 | 局限 | 更适合的关系 |
|---|---|---|---|
| ItemCF | 邻居稳定、解释路径直接、线上只需展开种子邻居 | 热门对象和局部圈层仍可能支配共现 | 通用共看、共点、共购与序列邻接 |
| Swing | 降低高度重叠用户对的重复证据，I2I 线上链路可复用 | 离线用户对计算更重；窗口、截断和 `alpha` 敏感 | 用户群重叠高、异常协同或圈层噪声较多的行为 I2I |
| UserCF | 能从相似人群迁移当前用户尚未表现出的兴趣 | 用户邻居漂移快，索引规模大，候选受邻居历史影响 | 行为较密集、群体兴趣具有可迁移性的场景 |

三者的服务路径可以简化为：

```text
ItemCF: user → seed items → similar items
Swing:  user → seed items → Swing-weighted similar items
UserCF: user → similar users → their items
```

ItemCF 和 Swing 的线上复杂度通常更稳定，因为 item-neighbor index 可以离线预计算，并按新鲜度要求批量或增量更新。UserCF 更直接地利用人群迁移，但用户表示与邻居集合随 session 和兴趣漂移更快。三者都依赖历史行为，因此对完全没有交互的新对象无能为力，需要内容召回、属性规则、商家/作者关系或受控探索补位。

<a name="sec-3-5"></a>

### 3.5 不同决策面的使用方式

下表只比较协同过滤中的种子、邻居和在线使用方式；对象身份的粒度选择在表后单独说明，不替代前面对完整多路召回的讨论。

| 决策面 | ItemCF / Swing 案例 | UserCF 案例 | 关键在线边界 |
|---|---|---|---|
| 短视频商品内容 | 从近期有效观看或商品点击的视频，扩展受众共现但内容不同的视频；Swing 可降低同一小圈层批量共看造成的伪相似 | 从观看与商品兴趣都相近的用户迁移尚未消费的视频 | 必须复核视频状态、内容安全、商品绑定与可售性；视频相似不能只由同款商品决定 |
| 直播电商 | 从近期进入或有效观看的直播 session，扩展同看用户还进入的在线 session；短窗口比长期共现更重要 | 从当前时段兴趣相近的用户迁移其正在观看的在线直播 | 必须复核在线状态、当前商品与库存；主播亲和、当前 session 和正在售卖商品应分开建实体或特征 |
| 商城商品卡 | ItemCF 可从浏览、加购、购买种子扩展替代品或互补品；基于共看/共点的 Swing 更常用于行为相似或替代关系，并抑制重度购物群体造成的共现膨胀 | 从相似购物篮或相似价格带用户迁移未见商品 | 价格、库存、配送和商家状态需实时过滤；替代与互补关系最好分图、分配额 |
| 搜索与类目浏览 | 从查询后点击或购买的商品扩展同义需求、同类替代与常见属性组合；共现关系作为补充而非唯一相关性证据 | 从查询和购买任务相近的用户迁移候选，但需保留查询词项约束 | 用户共现不能覆盖显式品牌、规格、价格和筛选条件；无结果查询与改写链应单独诊断 |
| 创作者选品 | 从历史成功合作商品扩展相似主题、价格带或受众适配商品；合作图可区分一次性热门与稳定匹配 | 从受众结构和内容主题相近的创作者迁移尚未合作商品 | 接受、发布和买家转化属于不同漏斗；样品、佣金、库存与履约约束需在召回时复核 |

#### Item identity 是模型定义的一部分

协同过滤中的 `item` 不是天然固定的，它必须与线上实际候选、行为标签和失效规则一致：

- 短视频：若候选是视频，就应以 video identity 建共看图。把绑定同一商品的多个视频直接折叠为一个 item，会丢失创作者、内容质量和观看偏好；若目标是商品召回，应另建 product-level 图；
- 直播：可服务候选通常是一次正在进行的 live session。永久 room/creator identity 可以建立长期亲和或召回索引，但必须先映射并复核当前在线 session；若直接把永久实体当作当前候选，可能把历史场次的商品、热度和受众错误迁移过来；
- 商城：SKU 区分规格，SPU 聚合同一标准商品，seller offer 还区分商家、价格与履约。粒度太细会使行为稀疏，粒度太粗会混淆库存、价格和商家质量，可以在多个 namespace 分别建图并在合并层去重。

跨 namespace 的 ID 不能在缺少实体类型时共享 key space，也不能把不同关系图的分数未经校准就直接比较。例如数值相同的 `video_id=123` 与 `sku_id=123` 没有任何身份关系；物理存储可以共用，但索引 key 应显式携带实体类型和市场等必要边界。实体映射发生变化时，还要同步更新用户种子、邻居索引和候选去重逻辑。

替代品与互补品不应混成一个相似度：同款不同商家通常是替代关系，相机与存储卡更接近互补关系。若训练标签和下游用法不同，最好拆成独立 I2I 图与召回配额。

<a name="sec-4"></a>

## 4. Two-Tower

```text
User tower(context, profile, behavior) → u
Item tower(product, content, seller)   → v
score(u, v) = dot(u, v) or cosine(u, v)
```

商品向量可离线计算并写入 ANN 索引；线上只需生成用户向量并检索 Top-K。Two-Tower 是架构范式，两侧不要求使用 BERT。

<a name="sec-4-1"></a>

### 4.1 样本设计

一条召回训练样本至少要固定用户上下文的时间截点、目标行为、标签成熟窗口、正样本对象和负样本来源。点击、有效观看、进房、商品访问与支付对应不同召回意图，不能只把行为强弱改成一个权重就假定任务等价。

负样本也不是“没有正标签的全部对象”。未召回、召回但未曝光、曝光但未真正可见，以及可见后在成熟窗口内没有目标行为，证据强度依次不同。随机负样本、In-batch Negative、Hard Negative、采样校正、时间切分与跨场景案例集中在第 5 节说明。

<a name="sec-4-2"></a>

### 4.2 对比学习目标

双塔常使用 sampled softmax 或 InfoNCE。对一个正样本 `(u, i⁺)` 和一组负样本 `N`：

```math
\mathcal{L}=-\log
\frac{\exp(s(u,i^+)/\tau)}
{\exp(s(u,i^+)/\tau)+\sum_{j\in N}\exp(s(u,j)/\tau)}
```

`τ` 是 temperature。较小的 `τ` 会放大相似度差异，但也可能使训练更不稳定。若用 in-batch negatives，需要留意同一用户可能真正喜欢 batch 中其他商品，从而产生 false negatives。

```python
def in_batch_retrieval_loss(user_vec, item_vec, temperature=0.07):
    user_vec = F.normalize(user_vec, dim=1)
    item_vec = F.normalize(item_vec, dim=1)
    logits = user_vec @ item_vec.T / temperature
    labels = torch.arange(logits.size(0), device=logits.device)
    return F.cross_entropy(logits, labels)
```

#### 4.2.1 Pointwise、Pairwise 与 Listwise

| 训练形式 | 目标 | 优点 | 局限 |
|---|---|---|---|
| Pointwise | 独立判断 user-item 是否为正例 | 简单，容易组合多种标签与权重 | 大量简单负例主导，和 Top-K 检索不完全一致 |
| Pairwise | 让正例分数高于一个负例 | 直接优化相对偏好 | 对负例难度敏感，一次只比较少量候选 |
| Listwise / sampled softmax | 在一个正例和多个负例中识别正例 | 与检索竞争更接近，充分利用 in-batch negatives | 受采样分布、batch false negative 和温度影响 |

Pairwise logistic loss 可写为：

```math
\mathcal L_{pair}=\log(1+\exp(s(u,i^-)-s(u,i^+)))
```

带 margin 的 triplet hinge loss 为：

```math
\mathcal L_{hinge}=\max(0,\;m+s(u,i^-)-s(u,i^+))
```

Hinge 在正负分差超过 `m` 后不再产生梯度，适合明确要求最小间隔；logistic 始终平滑更新，但可能继续把已正确排序的样本拉开。两者都依赖负例质量，不能替代 listwise 候选竞争评估。

在大规模召回中，listwise in-batch loss 常有更高的负例利用率，但“batch 大”不自动等于负例好；batch 构成与采样校正同样重要。

#### 4.2.2 In-batch Negative 的采样校正

Batch softmax 的损失形式保留在本节，采样概率的定义、`log Q` 校正和适用边界统一放在第 5 节。关键点是使用对象实际进入随机 Batch 或负样本集合的概率，而不是直接把点击次数代入公式。

<a name="sec-4-3"></a>

### 4.3 Hard Negative Mining

Hard Negative Mining 的工程重点是定期刷新候选池、记录来源模型与版本，并监控不同来源的损失占比和 False Negative mask rate。旧模型召回、粗排淘汰或精排靠后的对象只是“对模型困难”，不自动等于用户负反馈。难度阶梯、混合比例和标签边界见第 5 节。

<a name="sec-4-4"></a>

### 4.4 单向量与多兴趣召回

单个用户向量把美妆、数码和食品等兴趣压缩到同一点，可能落在多个兴趣中心之间。多兴趣模型输出 `M` 个用户向量，并让候选与最匹配的兴趣向量计算分数：

```math
s(u,i)=\max_{m=1,\ldots,M}\langle u_m,v_i\rangle
```

优点是提高多兴趣覆盖并减少头部兴趣吞噬；代价是 ANN 查询数、合并去重成本和兴趣塌缩风险增加。应监控每个兴趣向量的候选贡献与利用率，而不是只看总体 Recall@K。

<a name="sec-4-5"></a>

### 4.5 长尾表示与更新频率

热门 item 获得更多梯度，ID embedding 往往学得更充分；内容特征、自监督增强和多模态蒸馏可以改善长尾与新供给表示。常见做法包括随机遮盖属性、对同一 item 的两个增强视图做对比学习，以及让内容编码器拟合成熟商品的协同 embedding。自监督目标必须与主检索损失联合验证，避免只学到类目或拍摄风格而忽略交易意图。

<a name="sec-4-5-1"></a>

#### 4.5.1 不同更新对象不能混为一谈

召回链路至少包含五种不同对象：

| 对象 | 更新动作 | 是否训练 | 主要风险 |
|---|---|---:|---|
| 用户近期状态 | 写入新行为、时间上下文和 session 特征，请求时重算 query vector | 否 | 事件乱序、缓存陈旧、线上/离线截断不一致 |
| Network 与 ID Embedding 参数 | 在成熟训练样本上计算梯度，可更新全部或部分参数 | 是 | 反馈环、遗忘、optimizer state 与标签延迟 |
| Item Tower 参数 | 更新内容/属性编码器或共享层 | 是 | 新旧 item vector 不在同一坐标空间 |
| Materialized Item Vector | 用固定版本 Item Tower 编码 item corpus 或单个新 item | 否 | 编码失败、部分回填、向量归一化或维度错配 |
| ANN / 倒排索引 | 写入、删除、合并或重建物化向量 | 否 | 重复 ID、tombstone 延迟、Base/Delta 漂移和 Recall 下降 |

Warm-start 只是从旧 checkpoint 初始化训练，既可用于 full-window retraining，也可用于 incremental training，不能与“全量训练”并列成互斥类别。用户行为到达后立即重算 query vector 也只是实时状态更新；只有可训练参数或模型状态通过学习规则发生改变时，才属于模型学习。

<a name="sec-4-5-2"></a>

#### 4.5.2 新 Item 向量如何进入召回

新 item 尚无协同行为时，纯 ID embedding 没有足够信息。若 Item Tower 支持内容、类目、作者/商家和其他上架时属性，可以在网络参数冻结时生成初始向量：

```text
new item + point-in-time content/attributes
→ frozen item encoder
→ normalized materialized vector
→ eligibility validation
→ ANN Delta Index
```

这条路径是 inference + index mutation，不是 Online Learning。若模型仅依赖 item ID，新 ID 只能使用 OOV、哈希或类目 fallback，直到积累行为并进入后续训练。

行为信号到达后，可以在增量或周期性训练中更新相关 ID rows，也可以通过已经训练过的融合模块组合内容与协同表示。不能直接手写一个固定比例，把来自不同版本或不同尺度的内容向量与协同向量相加；融合权重、归一化和冷启动切换条件需要在训练与评估中确定。

<a name="sec-4-5-3"></a>

#### 4.5.3 何时必须重编码与重建索引

- Item Tower 的共享权重、归一化方式或 embedding dimension 改变：旧 Item Vectors 通常全部失效，需要全库重编码，并重新构建或装载 ANN；
- Item Tower 冻结，只有新 item 上架或少数 item 内容变化：只需编码受影响对象并写入 Delta Index；
- 只更新部分 item ID embedding rows：至少重新物化对应 rows；若共享层也变化，则不能只刷新活跃对象；
- User Tower 改变但 item space 冻结：只有在训练时明确对齐固定 item space，并通过精确检索基准验证兼容后，才能复用旧 Item Vectors；
- 仅有房间下播、商品缺货或内容失效：这是 eligibility/index 删除问题，不需要为了删除候选重新训练模型。

发布时应把 `network_version`、`item_encoder_version`、`embedding_snapshot`、`feature_schema` 和 `index_version` 绑定为同一个 release manifest。ANN 可以采用 Base Index + Delta Index 吸收新对象，但需要监控 Delta 占比、重复 ID、tombstone、向量年龄和 ANN Recall，并周期性 compaction。切换与回滚必须恢复整套兼容版本，而不是只替换 User Tower 权重。

<a name="sec-4-5-4"></a>

#### 4.5.4 冷启动状态与实时倒排

新对象的召回路径应随“证据状态”变化，而不是只由对象年龄决定：

| 证据状态 | 主要召回机制 | 在线数据结构 | 迁移或维护条件 |
|---|---|---|---|
| 零交互 | 类目/关键词匹配、内容近邻、内容可用的 Two-Tower、趋势与受控探索 | `term/category → newest eligible IDs`、`cluster → newest eligible IDs` | 获得最低数量的高置信行为，且数据链路完整 |
| 少量交互 | Seed 用户或 Seed 对象聚合、cluster 扩展、内容与行为置信度融合 | `item → cluster`、Seed Feature Store、Delta Index | 后验不确定性下降，成熟标签达到预设支持量 |
| 反馈充分 | 行为权重更高的 Two-Tower、ItemCF/Swing、Graph 与常规多路召回 | Base ANN、协同索引、Graph Store | 按常规更新与失效规则维护 |

一条 Seed 扩展链路可以是：用户近期有效行为 → Seed Item → Content Cluster → Cluster 内最新 Eligible Items。用户 Seed 必须满足可见曝光、有效消费、时间窗口和反作弊条件；若只用一次浅点击，热门或误触会快速污染新供给索引。`cluster → newest items` 还应按市场、库存、风险和内容状态做 Point-in-time Eligibility，而不是把发布过的全部对象直接返回。内容或属性塔完整的 Two-Tower 可以从零交互阶段参与召回；需要等待反馈的是依赖行为或新 ID 表示的通道，而不是所有 Two-Tower。

发布到召回可见的 SLA 应拆开监控：事件接入、资格校验、特征生成、编码、向量物化、Delta 写入、查询可见与缓存失效。每次召回应保留 `item_age`、Eligibility Reason、Seed/Channel、Feature Time、Encoder/Index Version 和去重来源，并在多通道合并时按稳定对象键去重。Stale/Tombstone 泄漏、错误 Cluster 污染或 Delta Recall 异常时，应回退到可审计的类目/关键词或内容通道，而不是继续扩大污染。这样才能区分“模型没有召回新对象”“向量尚未写入索引”和“对象已被库存或风险规则过滤”。更完整的 Pacing、毕业和停止机制见 [冷启动与探索](./cold-start.md)。

<a name="sec-4-6"></a>

### 4.6 召回覆盖与兴趣多样性

如果所有查询都由同一个近期主兴趣生成，召回集合可能在进入粗排前就已高度同质，后续重排无法恢复缺失的兴趣方向。常见改进包括：

- 使用多兴趣向量分别查询，再按兴趣配额合并；
- 对历史种子做分层抽样，例如保留最近行为，同时从更早历史中按类目、行为强度或时间段抽样；
- 为内容、协同、趋势、新供给和关注关系等通道设置最小覆盖与动态配额；
- 在受控实验中对 query embedding 做小幅扰动以发现近邻边界外候选，但要固定随机种子、限制向量范数变化并保留无扰动主查询。

随机性本身不是质量。向量加噪或历史抽样会提高集合差异，也可能降低相关性并造成结果难以复现。应同时报告带行为标签的 Recall@K、粗排 Top-K retention、类目/创作者/商家覆盖、请求间稳定性和额外 ANN 查询成本；不能只用“候选更分散”判断成功。

<a name="sec-5"></a>

## 5. 训练样本与负采样

召回模型面对的是全库竞争，但日志只记录旧系统选择并展示过的一小部分对象。训练样本设计因此同时决定模型学习什么意图、看到多难的竞争对象，以及继承多少旧策略偏差。

<a name="sec-5-1"></a>

### 5.1 正样本、时间截点与标签窗口

令 `t` 为构造查询特征的时间截点，`H_k` 为目标行为 `k` 的标签窗口。只有发生在截点之后且落入成熟窗口的行为才可作为该样本的正标签：

```math
y_{ui}^{(k)}=
\mathbf{1}\{\mathrm{event}_k(u,i)\in(t,t+H_k]\}
```

构造一条正样本时需要回答：

1. Query 是用户长期画像、当前 session，还是二者组合；
2. Candidate identity 是视频、直播 session、SKU、SPU 还是 seller offer；
3. 正行为是有效观看、进房、商品访问、加购、支付还是净成交；
4. 一个请求有多个正对象时，是拆成多条样本、使用多正例 softmax，还是按目标行为分 head；
5. 标签何时成熟，例如点击通常较快，支付、取消和退款需要更长观察窗口。

以点击训练只保证模型学习点击相关表示，不自动优化支付召回。内容消费与交易行为相关但不等价，常见做法是分任务训练、使用多任务表示，或至少分别报告不同标签的 Recall@K。

<a name="sec-5-2"></a>

### 5.2 正样本分布：过采样、降采样与权重

隐式反馈正样本通常呈明显的头部集中：少数热门视频、直播间或商品贡献大量点击和支付。如果直接按事件均匀抽取训练行，模型优化的是“再次拟合高频事件”，并不等于让每个对象、类目或商家获得同等学习机会。

令 `f_i^+` 为对象 `i` 在训练窗口中的成熟正样本数，并令 `I_+` 表示至少拥有一个正样本的对象集合。可以用指数 `beta` 调整正样本对象分布：

```math
P_{sample}^{+}(i)=
\frac{(f_i^+)^{\beta}}
{\sum_{j\in\mathcal{I}_{+}}(f_j^+)^{\beta}},
\qquad i\in\mathcal{I}_{+},\quad 0\leq\beta\leq1
```

- `beta=1` 接近原始事件频率，头部对象贡献最大；
- `beta=0` 在至少拥有一个正样本的对象之间近似均匀，长尾对象会被强烈过采样；
- 中间值会压平头部集中度，同时保留一定的真实频率结构。

过采样与降采样解决的问题不同：

| 方法 | 做法 | 优点 | 主要风险 |
|---|---|---|---|
| 长尾正样本过采样 | 重复抽取低频对象，或提高其被选入 Batch 的概率 | 增加长尾 embedding 和内容编码器的更新机会 | 重复少量噪声、过拟合单个用户、改变训练分布与校准 |
| 头部正样本降采样 | 对单对象、单用户或单 session 设置上限，随机丢弃部分重复事件 | 降低冗余和训练成本，避免头部梯度淹没长尾 | 丢失头部内部的细粒度偏好与时段变化 |
| 分层抽样 | 按类目、价格带、新旧对象、商家或行为强度分层后设配额 | 能明确控制每个业务 slice 的学习机会 | 配额设计复杂，分层变量本身可能随时间漂移 |
| 保留原样本并调权 | 不复制或删除记录，只调整每条正例的 loss weight | 数据血缘更清楚，便于做敏感性分析 | 极端权重会放大梯度方差，仍需截断和监控 |

这个对象级概率还不是单条训练记录的概率。若先按上式抽对象，再从该对象的 `f_i^+` 条正例中均匀抽一条，那么正例记录 `z` 的实际抽样概率为：

```math
q_{sample}^{+}(z)=
\frac{P_{sample}^{+}(i(z))}{f_{i(z)}^+}
```

如果抽样只是为了节省计算，但目标仍是某个原始分布 `P_target^+(z)`，应使用一般的密度比权重：

```math
w^+(z)\propto
\frac{P_{target}^{+}(z)}{q_{sample}^{+}(z)}
```

原始目标若是对所有正例事件均匀，则 `P_target^+(z)=1/N_+`。只有在“每条记录按已知保留概率 `a(z)` 独立降采样”这一特殊设计中，Horvitz–Thompson 权重才简化为 `1/a(z)`；实际训练还常对权重归一化或截断，以控制梯度方差。

如果目标本来就是强调对象均衡、长尾覆盖或新供给，则不应再用权重完全恢复原分布，因为那会抵消重新采样的目的。此时需要明确模型优化的是新的 Target Distribution，并另外检查事件级校准、头部质量和线上增量。正样本重采样与后文的负样本 `log Q` 校正也不是同一件事：前者改变正例进入训练集的机会，后者处理 sampled-softmax 竞争集合的采样频率。

不同决策面的常见处理方式不同：

- 短视频商品内容：可限制单视频或单创作者每日贡献的正例数，再按商品类目和绑定有效性补充长尾内容；不能把同一用户的重复自动播放都当成独立强正例。
- 直播内容流：应在 `room session × time block` 内限频，避免一个头部房间整场产生的海量进房事件淹没其他场次；同时保留开播阶段和商品切换后的分布变化。
- 商城商品卡：可以对畅销 SPU 的重复购买正例降采样，并提高成熟长尾支付样本的训练机会；但退款尚未成熟、库存极浅或同一 SPU 的重复 offer 不能为了“长尾”被无条件放大。
- 搜索与类目浏览：应按查询频次、查询意图和类目深度分层，限制头部词贡献并保留长尾查询；无点击查询不能直接当作所有返回商品的强负例，因为零结果、结果不可见和查询改写可能是检索失败。
- 创作者选品：可限制单个头部创作者或爆款商品对合作正例的贡献，并分别保留接受、发布与成熟交易样本；只有被创作者真实看到且具备合作资格的商品，未接受才提供带选择偏差的负反馈。

没有通用的“正负样本各 50%”或“长尾过采样几倍”。至少要报告抽样前后 Item Frequency、类目/商家覆盖、有效样本量、各来源 Loss Share、分 slice Recall 与校准，并通过在线实验确认覆盖收益没有以交易质量为代价。

<a name="sec-5-3"></a>

### 5.3 曝光未点击为什么不是天然负样本

“没有点击”混合了多种观测状态：

| 日志状态 | 能否直接作为行为负例 | 原因与建议 |
|---|---|---|
| 在 eligible pool，但未被召回 | 否 | 用户没有机会看到，只能作为随机库内负样本 |
| 已召回，但未进入最终曝光 | 否 | 反映旧模型或后续阶段选择，可作模型困难样本，但不是用户拒绝 |
| 已曝光，但不可确认真正可见 | 通常否 | 位置、快速滑过、加载失败和遮挡会混入标签 |
| 可见且标签窗口成熟，未发生目标行为 | 可以谨慎使用 | 是 observational negative，仍需处理位置和旧策略偏差 |
| 已点击但未支付 | 对点击是正例；对支付需等待成熟 | 任务标签和归因窗口不同，不能提前写成支付负例 |

召回的职责是覆盖潜在相关对象，因此将全部“曝光未点击”赋予强负权重，容易压低位置靠后、长尾或当次未被注意到的对象。可见性可靠时仍可使用，但应按曝光位置、停留条件和标签成熟度分层，并与随机负样本分开记录来源。

<a name="sec-5-4"></a>

### 5.4 负样本家族：优缺点与使用边界

| 负样本来源 | 优点 | 局限 | 更适合解决 |
|---|---|---|---|
| 全库均匀随机 | 覆盖广、实现简单、采样概率清楚 | 通常太容易，可能过多抽到极冷对象 | 学习基本 user-item 区分和长尾边界 |
| 流行度采样 | 更常抽到线上高竞争对象 | 热门对象更频繁被惩罚，必须记录真实采样概率 | 模拟头部竞争，提高热门对象间区分 |
| In-batch Negative | 一次矩阵乘法产生大量负例，吞吐高 | Batch 组成决定分布，重复对象和 False Negative 常见 | 大规模双塔对比学习 |
| 语义或同类近邻 | 比随机负例更难，能学习细粒度边界 | 相似对象可能也是潜在正例 | 区分类目内、价格带内或内容近邻 |
| 旧漏斗阶段淘汰对象 | 接近线上真实竞争集合 | 继承旧模型偏差，淘汰不代表用户不喜欢 | 蒸馏、Teacher consistency 和模型难例训练 |
| 可见但未行动对象 | 与实际展示分布接近 | 受位置、策略和未观测兴趣影响 | 有可靠可见性日志时的行为判别 |

单一负样本源通常不足：全库随机样本提供覆盖，In-batch Negative 提供训练效率，Hard Negative 提供局部决策边界。比较方案时应固定总负例数或总损失权重，否则收益可能只来自更多训练计算。

<a name="sec-5-5"></a>

### 5.5 In-batch Negative、流行度概率与 log Q 校正

一个 Batch 含有多个正 user-item pair 时，可把其他 pair 的正对象当作当前用户的负例。它把一次 user matrix 与 item matrix 的乘法转成 Batch 内多分类问题，但热门对象更容易进入 Batch，也更频繁地成为其他用户的负例。

令 `f_i` 为一个统计窗口内对象 `i` 的正例频次，原始流行度占比为：

```math
p_i=\frac{f_i}{\sum_j f_j}
```

如果 Batch 由点击正例构造，`f_i` 可以取点击正例次数；若目标是进房、有效观看或支付，则应使用与 Batch 构造一致的正例频次。它仍只是实际 Batch sampling probability 的近似。

一种近似采样构造是对流行度做指数平滑：

```math
Q_{\alpha}(i)=
\frac{p_i^{\alpha}}{\sum_j p_j^{\alpha}},
\qquad 0\leq\alpha\leq1
```

指数采样定义在 `f_i>0` 的统计支持集上：`alpha=0` 对应该支持集内的近似均匀采样，`alpha=1` 接近按正例频次采样。零频新对象需要由全库均匀、内容或新供给样本池补充。但 `p_i` 或 `Q_alpha(i)` 仍只是构造分布的近似。真正用于 Batch 校正的 `p_j_batch` 应表示对象 `j` 出现在随机 Batch 或采样集合中的 inclusion/sampling probability：

```math
p_j^{batch}=\Pr(j\in\mathcal B_{item})
```

Batch 组装、去重、多正例规则、跨设备聚合和 without-replacement 抽样都会使它不同于“点击次数除以总点击次数”。在 Batch softmax 中，可按实际采样概率校正 logit：

```math
s_c(u,j)=s(u,j)-\log p_j^{batch}
```

对显式负采样分布 `Q`，同一思想写成：

```math
s_c(u,j)=s(u,j)-\log Q(j)
```

若实现按预期抽样次数而不是 inclusion probability 校正，应使用与采样器一致的 expected count；额外的共同常数只有在所有候选一致处理时才会在 softmax 中抵消。对极小概率需要设置下界，避免校正项无界增大。

这项修正只针对训练负例分布造成的 logit 偏移，不是线上给热门对象固定降权，也不能自动消除曝光、位置或旧策略选择偏差。还应屏蔽同一用户在标签窗口内的其他正例、Batch 中重复对象和已知等价实体。

<a name="sec-5-6"></a>

### 5.6 Hard Negative 难度阶梯

Hard Negative 应按来源分层，而不是合成一个无法解释的池：

| 难度层 | 来源示例 | 它提供的训练信息 | 主要标签风险 |
|---|---|---|---|
| 低 | 全库随机对象 | 学习明显不相关边界 | 过于简单，梯度很快消失 |
| 中 | 同类目、相近价格带、内容或向量近邻 | 学习细粒度偏好 | 近邻可能是未观测正例 |
| 中高 | 旧召回模型的 Top-K，但未进入曝光 | 学习旧召回边界附近对象 | 没有用户反馈，只能视为 model-mined negative |
| 高 | 被粗排淘汰或精排排在后部的候选 | 对齐更强 Teacher 或后续漏斗阶段 | 容易复制旧排序器偏差，不能当作真实负标签 |
| 高 | 已召回、实际可见且成熟窗口内未点击 | 接近线上真实竞争 | 仍有位置、注意力和当次无行动偏差 |
| 目标特定 | 快速跳过、隐藏、不感兴趣等显式行为 | 较强的当前目标负反馈 | 只对定义一致的对象与任务有效 |

“召回未点击”必须继续拆分：若对象根本没有曝光，未点击不提供行为信息；若确认可见且窗口成熟，才是带偏差的 observational negative。粗排淘汰与精排靠后对象适合用 Teacher margin、蒸馏目标或较低权重训练，不应伪装成用户明确拒绝。

Hard Negative 过强还可能让模型只学习旧系统的局部边界，牺牲全库覆盖。因此需要同时保留随机负样本，并按 source、teacher version、candidate stage 和 mining date 记录来源。

<a name="sec-5-7"></a>

### 5.7 False Negative 与混合负样本

False Negative 是被采成负例、但用户实际可能喜欢的对象，常见来源包括：

- 同一用户在标签窗口内的其他正对象；
- 同一 SPU 的等价 SKU、同一商品的其他 seller offer，或同一内容的重复版本；
- 用户没有机会看到、但后来在另一个入口完成目标行为的对象；
- 绑定相同商品但内容表达不同的视频，以及同一主播不同直播 session；
- 过窄标签窗口造成的延迟点击、支付或复购。

可通过多正例 mask、等价实体映射、成熟窗口和来源降权减少 False Negative，但不能用标签窗口之后的未来信息改写当时特征。mask rate 应按样本源和场景监控；Hard Negative 的 mask rate 突然升高，往往意味着挖掘器过强或实体映射失效。

混合负采样可以把均匀、Batch 和困难样本组合：

```math
Q_{mix}(j\mid u)=
\pi_rQ_{rand}(j)+
\pi_bQ_{batch}(j)+
\pi_hQ_{hard}(j\mid u)
```

```math
\pi_r,\pi_b,\pi_h\geq0,
\qquad \pi_r+\pi_b+\pi_h=1
```

Batch Negative 与 uniform negative 混合，可以减弱只从隐式正反馈日志形成 Batch 所带来的流行度与选择偏差；Hard Negative 则补充局部竞争。没有通用最优比例，例如将总负例预算按 `50% / 25% / 25%` 分给随机、Batch、Hard 只能作为实验起点示例，必须按召回覆盖、False Negative、训练稳定性和线上增量调整。

若要做 `log Q` 或 Importance Weight 校正，必须使用实际 mixture probability，而不是只用某个分量的概率。确定性 Top-K Hard Mining 往往没有已知采样概率，此时不应声称得到了严格无偏校正；可以分 source 设损失权重并做敏感性分析。

下面的伪代码保留负例来源并执行基本 mask；输入池应已按各自策略排序或打乱：

```python
def build_negative_set(source_pools, quotas, positive_ids, equivalent_ids):
    blocked = set(positive_ids) | set(equivalent_ids)
    negatives = []

    for source in ("uniform", "batch", "hard"):
        quota = quotas.get(source, 0)
        if quota <= 0:
            continue

        selected = 0
        for item_id, source_probability in source_pools.get(source, []):
            if item_id in blocked:
                continue
            negatives.append({
                "item_id": item_id,
                "source": source,
                "source_probability": source_probability,
            })
            blocked.add(item_id)
            selected += 1
            if selected >= quota:
                break

    return negatives
```

这段代码只负责配额、去重和来源留痕；`source_probability` 是对象在单一来源采样器下的概率，不等于经过混合、去重和 without-replacement 规则后的最终 inclusion probability。若训练损失需要 `log Q` 或 Importance Weight，必须由实际 Batch 组装器另行计算并记录最终概率。

<a name="sec-5-8"></a>

### 5.8 时间切分与数据泄漏

推荐训练应按事件时间构造，而不是先随机拆行再回填最新特征：

```text
feature cutoff t
    → label window (t, t + H]
    → label maturity
    → chronological validation / test
```

至少检查：

1. 用户序列、流行度、价格、库存、内容绑定和直播状态都使用 `t` 时可见版本；
2. 负样本必须在 `t` 时 eligible，不能从尚未上架或已失效对象中抽取简单负例；
3. Teacher score、ANN embedding 和 Hard Negative pool 不得由验证期或测试期之后的数据训练；
4. 同一 session 不应跨越训练与验证边界，否则几乎相同的上下文会泄漏；
5. 支付、退款等延迟标签未成熟的样本应排除或视为 censored，不能提前标零；
6. 时间切分后分别估计采样分布，避免用未来流行度计算当前 `Q`。

随机划分 user-item pair 往往高估对兴趣漂移、新对象和新直播 session 的泛化能力。更可靠的验证是按时间前推，并分别报告新用户、新对象与已有对象等 slice。

<a name="sec-5-9"></a>

### 5.9 Importance Weight 与校正边界

若训练样本来自分布 `Q_train`，而目标风险定义在 `P_target` 下，可使用 Importance Weight：

```math
w(z)=\frac{P_{target}(z)}{Q_{train}(z)}
```

```math
\mathcal L_{IW}=\frac{1}{B}\sum_{b=1}^{B}
\min\{w(z_b),w_{max}\}\,\ell(z_b)
```

截断 `w_max` 会降低方差，但也引入偏差。该方法成立需要概率可估计且满足 overlap：目标分布有质量的区域，在训练采样分布中也必须有非零概率。对曝光日志做 inverse propensity weighting 时同样需要可靠 propensity；确定性旧策略从未展示的对象无法靠无限权重恢复信息。

需要区分以下问题：

- `log Q` 修正：处理 sampled softmax 或 In-batch Negative 的采样频率；
- Importance Weight：把一个已知采样分布下的经验风险转换到另一个目标分布；
- 曝光与位置纠偏：处理用户是否有机会看到对象，通常需要 propensity、随机化流量或额外因果假设。

它们都不能自动修复标签定义错误、False Negative、特征泄漏或旧策略没有支持度的区域。校正前后应同时报告权重分布、有效样本量、梯度范数和关键 slice，避免少量超大权重主导训练。

<a name="sec-5-10"></a>

### 5.10 工业案例：跨场景的具体样本设计

ItemCF/Swing 与 Two-Tower 使用行为日志的方式不同：前者累计共现图并产生 item-to-item 邻居，后者从正负 user-item pair 学习向量空间。它们可以作为多路召回通道在线合并，但不能把双塔负采样直接解释为 ItemCF/Swing 的负边。以下事件与数字均为示例，用于展示从样本到线上诊断的完整链路。

<a name="sec-5-10-1"></a>

#### 5.10.1 短视频商品内容：新内容进入交易召回

**具体事件。** 用户在时点 `t` 完整观看跑鞋视频 `v_seed`，随后访问其绑定商品；一个新视频 `v_new` 讲解同类跑鞋，但刚上架、没有稳定共看历史。示例标签窗口可以把 `30` 分钟内的商品访问作为快速交易正例，把 `7` 天内的成熟支付另作稀疏正例；两者必须分任务记录。

**多路候选如何产生。**

- ItemCF 从 `v_seed` 扩展历史共看视频，适合已有行为的内容；
- Swing 对高度重叠用户群产生的共看降权，减少小圈层或异常协同把某组视频推成强邻居；
- Two-Tower 用用户近期视频/商品兴趣查询视频内容与绑定商品表示，因此可以覆盖尚无共现的 `v_new`；
- Fresh、关注作者、商品类目与实时趋势通道补充新供给和显式关系；
- 合并层保留 channel、seed、score 与 embedding/index version，再做视频状态、绑定有效性和商品可售过滤。

**样本。** 内容双塔可把有效观看作为正例；交易双塔把可归因的商品访问、加购或成熟支付分别作为正例。旧模型召回但未曝光的 `v_new` 只能作为 model-mined candidate；只有确认视频可见且窗口成熟后未发生目标行为，才可作为带偏差的行为负例。同商品的其他高质量视频可能是 False Negative，需要在 Batch 中识别等价关系或保留为多正例。

- **症状**：总体视频 Recall@K 正常，但新商品内容的商品访问 Recall@K 和粗排保留率低；Fresh 通道有候选，Two-Tower 通道没有返回。
- **诊断**：先检查 `v_new` 是否生成内容向量、是否写入正确 Delta Index、绑定商品版本是否有效，再按通道比较 unique contribution 与过滤后返回率；不要先归因于用户塔退化。
- **改动**：修复新视频编码与增量入库，为 Fresh 设置受控配额；内容/交易双塔分开定义正例，并在交易模型中加入绑定商品表示。不要为没有历史的 `v_new` 伪造 ItemCF/Swing 共现。
- **指标**：Content Recall@K、Product-visit/Pay Recall@K、新视频 Vector Age、Index Coverage、通道 Unique Contribution、粗排 Top-K Retention、绑定有效率、P99 latency 和成熟净价值。
- **边界**：Candidate identity 是视频，不是绑定商品；同一商品的不同视频既不能直接折叠，也不能因为商品相同就全部视为负例或正例。支付标签必须使用成熟窗口与明确归因。

<a name="sec-5-10-2"></a>

#### 5.10.2 直播内容流：新场次与当前商品切换

**具体事件。** 直播 session `r_new` 开播后先讲护肤品，随后切换到小家电。用户过去常看该主播，但近期商品行为集中在护肤。请求时的 Candidate 必须是当前仍在线的 `r_new`，并携带当时正在讲解的商品，而不是只使用永久 room/creator ID。

**多路候选如何产生。**

- User–room Two-Tower 融合用户商品/主播历史、直播内容、当前商品和 session 状态；
- 主播亲和、当前商品类目、关注关系与实时热门形成独立通道；
- ItemCF/Swing 可以利用成熟直播 session 的同看关系；也可先从用户近期商品种子扩展相关商品，再映射到当前正在售卖这些商品的在线房间。对刚开播的 `r_new`，session 级历史不足，不能由协同通道承担唯一覆盖；
- 合并后必须按 online state、地域、当前商品、库存与风险状态再次过滤。

**样本。** 进房、有效观看、当前商品访问和支付分别建标签。负例只能从时点 `t` 真正在线且 eligible 的房间中采样；下播房间不是有信息量的简单负例。精排靠后或召回未曝光房间可以作为 Teacher/模型困难样本，不能冒充用户拒绝。最终整场热度与未来商品序列不可回填到训练特征。

- **症状**：主播亲和通道返回率高，但商品切换后 Quick Exit 上升，当前商品访问下降，同时出现少量下播误召。
- **诊断**：按 request replay 对齐 room state version、current-product timestamp、Two-Tower embedding version 和各通道 seed；区分兴趣不匹配、状态过期与索引删除延迟。
- **改动**：为新 session 使用内容/当前商品向量和短生命周期 Delta Index；商品切换时更新实时特征或 session vector；下播写入 tombstone 并在曝光前复核。ItemCF/Swing 邻居按 session 和时间窗构建，永久主播亲和单独保留。
- **指标**：Online-room Coverage、Valid-at-exposure Rate、Current-product Consistency、进房/有效观看/商品访问 Recall@K、Quick Exit、Feature Age、Tombstone Delay 和 P99 latency。
- **边界**：实时状态更新不等于 Online Learning；永久主播 embedding 可以表达长期亲和，但不能替代当前 session、当前商品和库存。

<a name="sec-5-10-3"></a>

#### 5.10.3 商城商品卡：替代、互补与多 Offer

**具体事件。** 用户先访问一款相机，在同一购物任务中比较其他相机，随后把存储卡加入购物车。同款相机存在多个 seller offer，价格、库存和履约不同。这里至少包含“相机之间的替代”和“相机到存储卡的互补”两种关系。

**多路候选如何产生。**

- 基于共看/共点的 Swing 更适合构建行为相似或替代邻居，并降低高度重叠购物群体的重复证据；
- ItemCF 可分别用浏览共现或购物篮/有序购买构建替代图与互补图，不能把两种标签混成一个 score；
- Two-Tower 根据用户类目、品牌、价格带和长期交易兴趣覆盖协同稀疏或长尾商品；
- 类目、品牌、商家、价格带、Fresh 与 Popular 通道提供可解释覆盖，合并后按 SKU/SPU/offer namespace 去重。

**样本。** Two-Tower 的 PDP、加购、支付与净成交使用不同成熟窗口；同类目、相近价格带、同 SPU 其他 offer 可构成困难候选，但等价 offer 很可能是 False Negative。ItemCF/Swing 使用行为窗口和共现权重建图，不把“未共现”直接记成负边。

- **症状**：候选数增加，但同一 SPU 的 offer 重复率和头部商品占比上升，互补商品的粗排保留率下降。
- **诊断**：分通道检查 substitute/complement relation type、SKU/SPU/offer 映射、channel overlap、unique contribution 和粗排淘汰；确认是否由错误去重或统一配额挤压互补通道。
- **改动**：拆分替代图与互补图，分别校准 ItemCF/Swing score 和配额；Two-Tower Hard Negative 在同类目与价格带内采样，同时 mask 等价 offer；合并层先保留关系类型，再按目标页面与库存策略去重。
- **指标**：Substitute/Complement Recall@K、Unique Contribution、SPU Duplicate Rate、粗排 Top-K Retention、PDP/加购/支付命中、可售率、Seller Coverage、成熟退款率和端到端延迟。
- **边界**：SKU、SPU 与 seller offer 粒度必须贯穿日志、建图、训练和去重；支付后推荐互补品与购买前提供替代品是不同任务，不能用同一离线命中率代表。

<a name="sec-5-10-4"></a>

#### 5.10.4 搜索与类目浏览：词项召回和语义召回协同

**具体事件。** 用户搜索“防水徒步鞋 37 码”，先点击一双外观相似但不防水的商品，随后增加“女”并筛选尺码。纯语义双塔可能把“户外鞋”近邻全部拉回，纯词项倒排又可能漏掉标题使用“雨天登山鞋”的等价商品。请求上下文必须保存原始查询、改写链、筛选条件和当时可售集合。

**多路候选如何产生。**

- 倒排通道保证品牌、型号、尺码和否定词等强约束，并通过同义词或属性词典扩展可解释召回；
- Query–Item Two-Tower 结合查询语义、用户近期任务和商品文本/图像，覆盖表述不同但意图一致的长尾商品；
- 类目路径、属性过滤和用户近期点击种子形成独立通道，合并时保留 query version、channel 和约束命中状态；
- ANN 后必须重新执行库存、地域、尺码和筛选一致性校验，语义相似不能绕过硬条件。

**样本。** 查询后的商品点击、详情页有效停留、加购与成熟支付分别建任务。被返回但位于不可见位置的商品不是可靠行为负例；同一查询会话中后来点击的商品应从 earlier batch negative 中 mask。困难负样本可来自同类且语义相近、但违反一个明确属性的商品，同时单独记录违反的属性，避免模型学会忽略约束。

- **症状**：整体 Recall@100 上升，但带规格词查询的零点击率和查询改写率恶化；新增候选主要来自语义通道，精确属性命中率下降。
- **诊断**：按头部/长尾查询、约束数量、零结果和改写链切片，比较词项与语义通道的 Unique Contribution、属性一致率、粗排保留率和 ANN 后过滤率；再回放查询版本与商品属性快照。
- **改动**：对强约束采用 lexical-first 或 constraint-aware fusion，语义通道只在满足硬条件的子集中扩展；训练中加入属性冲突困难负例，并为零结果查询建立受控改写与类目 fallback。
- **指标**：Query Recall@K、Attribute Match Rate、Zero-result Rate、Reformulation Rate、PDP/加购/支付命中、Unique Contribution、可售率、ANN Filter Loss 和 P99 latency。
- **边界**：点击高不代表查询相关性高；展示位置、标题质量和价格会共同影响点击。后续查询改写可用于构造会话序列，但不能回填到早先请求的特征；显式筛选条件不能被个性化模型静默放宽。

<a name="sec-6"></a>

## 6. ANN 与线上服务

ANN 用少量精度换取大规模低延迟检索。需要联合评估：

- exact recall / ANN recall；
- 索引新鲜度与增量更新延迟；
- P50/P95/P99 latency；
- 内存、分片、fallback 与超时率；
- 市场、库存和 eligibility 过滤后的有效返回量。

Bloom Filter 可用于高效判断近期已曝光集合，但存在 false positive，需衡量对新颖性与有效候选的影响。

对直播间等短生命周期候选，ANN 相似不等于当前可召回。可以先在分区索引中只保留在线房间，或 ANN 后按 online state 过滤并补召回；无论哪种方式，都要记录过滤后的有效返回量和补齐延迟。若状态更新慢于房间上下线，离线 Recall@K 再高也可能产生大量无效候选。

<a name="sec-6-1"></a>

### 6.1 ANN 索引方法对比

| 方法 | 核心思想 | 查询特点 | 内存/构建 | 适用情况 |
|---|---|---|---|---|
| Flat / Brute Force | 与所有向量精确比较 | Recall 最高，`O(Nd)` | 构建简单 | 小规模、离线基准 |
| IVF | 先检索聚类中心，再扫描部分 inverted lists | `nprobe` 控制 recall/latency | 需要训练 coarse quantizer | 大规模、可调延迟预算 |
| PQ / IVFPQ | 将向量分块量化并用码本近似距离 | 内存低、距离近似 | 有量化误差 | 超大规模、内存敏感 |
| HNSW | 多层近邻图上的贪心搜索 | 高 recall、低延迟 | 内存较高，动态维护复杂 | 高质量在线 ANN |

HNSW 的 `efSearch`、IVF 的 `nprobe` 都体现 recall–latency trade-off。ANN 评估必须与精确 Top-K 对照：

```math
ANN\ Recall@K=
\frac{|TopK_{ANN}\cap TopK_{Exact}|}{K}
```

这衡量索引逼近质量，不等同于以用户行为标签计算的推荐 Recall@K。

<a name="sec-7"></a>

## 7. Graph 与结构化召回

图召回把用户、视频、创作者/主播、商家和商品看作异构节点，边可表示点击、购买、关注、同看或商品绑定。它适合表达 `user → video → product`、`user → room → product`、`user → creator → item` 和 `user → seller → item` 等多跳关系。`user → creator → item` 可以来自显式关注，也可以来自稳定的隐式偏好；两者置信度与新鲜度不同，不应混成同一种边。

常见路径包括：

- random walk / graph co-occurrence：便宜、可解释，适合生成 I2I 或 author/seller 邻居；
- graph embedding / GNN：融合图结构和内容特征，能缓解纯 ID 表示的稀疏问题；
- path-based retrieval：显式区分关注、共购、替代和互补路径；
- tree/path retrieval：把大规模 item 组织为可检索树或路径，用 beam search 找候选。

图模型的主要难点不是只在离线训练：还包括负采样、邻居截断、热门节点支配、边的新鲜度、增量 embedding 和线上索引版本。多跳并不天然更好，过多传播会把“相关”变成“热门”。

<a name="sec-8"></a>

## 8. 召回模型横向对比

| 方法 | 个性化 | 冷启动 | 实时性 | 可解释性 | 主要优势 | 主要局限 |
|---|---:|---:|---:|---:|---|---|
| Popular/Trending | 弱 | 强 | 强 | 强 | 稳定、便宜、fallback 可靠 | 缺少个性化，放大热门偏差 |
| ItemCF | 中 | 弱 | 中 | 强 | 共现关系直接、工程成熟 | 新商品困难，受曝光偏差影响 |
| Swing | 中 | 弱 | 中 | 中到强 | 抑制局部圈层噪声，适合商品 I2I | 用户对计算和超参数更复杂 |
| UserCF | 中 | 弱 | 弱 | 中 | 兴趣迁移直观 | 大规模计算重，用户兴趣漂移 |
| Matrix Factorization | 强 | 弱 | 中 | 中 | 学习紧凑 latent factors | 依赖 ID 和历史交互 |
| Two-Tower | 强 | 纯 ID 时弱；内容/属性塔可达中到强 | 强 | 弱 | 可融合丰富特征，适合 ANN | 点积交互受限，负采样敏感；新 item 需及时生成向量并入索引 |
| Graph Retrieval | 强 | ID-only 时弱；归纳式内容图可达中 | 较弱 | 中 | 表达多跳关系和高阶协同 | 全新 item 需内容、属性或邻居特征；训练、更新和服务复杂 |
| Content Retrieval | 中 | 强 | 强 | 中 | 适合新商品和语义匹配 | 行为个性化较弱 |

Two-Tower 的最大工程优势是 item embedding 可预计算；代价是 user 与 item 在最终打分前几乎不做深度交互。它只有在 item tower 使用可泛化的内容或属性特征，并支持新 item 及时生成向量、写入 ANN 索引时，才具有较强冷启动能力；纯 ID 双塔仍然依赖历史交互。Cross-encoder 表达更强，但通常无法直接对全库商品在线计算，因此更适合后续排序。

<a name="sec-9"></a>

## 9. 评估框架

| 层级 | 指标 |
|---|---|
| Offline | Recall@K、HitRate@K、NDCG@K、coverage |
| Channel | quota、return rate、unique contribution、overlap |
| Funnel | pre-rank pass、rank top-K、final exposure rate |
| Distribution | category/seller/price/new-item mix、concentration |
| System | latency、timeout、empty result、index freshness |
| Validity | 可售率、直播在线率、视频—商品绑定有效率、过滤后补齐率 |
| Online | CTR、CVR、Net GMV、buyer/seller guardrails |

离线 Recall@K 上升后，应追踪新候选是否真正通过粗排、精排和重排并获得曝光。

同一条召回通道还应按决策面使用不同的“成功标签”：短视频可能看 video watch/interaction 与 product click 两套命中；直播至少区分进房、有效观看和交易；商品卡则区分 PDP、加购和净成交；搜索还要检查查询相关性与属性约束。把所有行为压成一个正标签会掩盖通道究竟在优化内容消费、意图满足还是交易。

<a name="sec-10"></a>

## 10. 常见失败模式

- 某通道占满配额但 unique contribution 很低；
- 训练负样本与线上曝光分布不一致；
- 热门商品表示更充分，进一步放大头部偏差；
- ANN 索引陈旧，召回缺货或已失效商品；
- 新通道提高 CTR，却通过低价/低质量 mix 损害 Net GMV；
- 去重和 eligibility 改动被误判为召回模型效果。

<a name="sec-11"></a>

## 11. 召回渠道增量分析

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
