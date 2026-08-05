# 推荐系统指标体系｜Recommendation System Metrics

---

## 1. 指标定义原则｜Metric Definition Principles

推荐系统指标必须同时明确统计对象、时间窗口、分子、分母、去重规则、聚合粒度、归因窗口和数据延迟。

在使用任何指标前，需要明确以下内容：

- **统计对象**：用户、会话、请求、曝光、内容、创作者或订单
- **统计时间窗口**：小时、天、周、月或滚动窗口
- **分子与分母**
- **是否去重**
- **是否排除异常、取消、退款或无效行为**
- **聚合方式**：整体比例还是用户平均
- **归因窗口**：点击、转化和订单之间允许间隔多久
- **数据延迟**：指标是否包含尚未完全回流的数据

相同名称的指标，如果统计口径不同，不能直接比较。

例如，点赞率可能存在以下不同定义：

```text
Like Rate = Likes / Impressions
Like Rate = Likes / Clicks
Like Rate = Likes / Valid Views
Like User Rate = Users Who Liked / Users Who Viewed
```

因此，在数据报表、模型评估和实验文档中，应始终标明指标口径。

---

---

## 2. 北极星指标｜North Star Metrics

北极星指标用于衡量产品整体健康度和长期增长。

它通常不是某个模型的直接优化目标，而是推荐系统、产品功能、运营策略和内容生态共同作用的结果。

### 2.1 用户规模｜User Scale

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 日活跃用户数 | Daily Active Users | DAU | 一天内至少完成一次有效活跃行为的去重用户数 | `COUNT(DISTINCT user_id)` within one day |
| 周活跃用户数 | Weekly Active Users | WAU | 一周内至少完成一次有效活跃行为的去重用户数 | `COUNT(DISTINCT user_id)` within one week |
| 月活跃用户数 | Monthly Active Users | MAU | 一个月内至少完成一次有效活跃行为的去重用户数 | `COUNT(DISTINCT user_id)` within one month |
| 活跃率 | Active User Rate | - | 目标用户中产生活跃行为的用户占比 | `Active Users / Eligible Users` |
| 用户粘性 | User Stickiness | DAU/MAU | 月活用户在平均一天内活跃的比例 | `DAU / MAU` |

### 2.2 有效活跃行为｜Qualified Active Action

不同产品对“活跃”的定义不同，可能包括：

- 打开应用
- 浏览推荐流
- 播放视频
- 阅读文章
- 搜索内容
- 点赞、评论或收藏
- 发布内容
- 下单或支付

例如：

```text
DAU = 2,000,000
MAU = 10,000,000

User Stickiness
= DAU / MAU
= 20%
```

这表示月活用户中，平均每天约有 20% 会使用产品。

因此，DAU、WAU 和 MAU 必须结合具体业务定义理解。

---

---

## 3. 用户消费指标｜User Consumption Metrics

用户消费指标用于衡量用户使用推荐产品的频率、时长和消费深度。

### 3.1 核心指标

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 人均使用时长 | Average Usage Time per User | - | 每位活跃用户平均使用产品的时长 | `Total Usage Time / Active Users` |
| 人均消费内容数 | Average Content Consumed per User | - | 每位活跃用户平均消费的内容数量 | `Total Content Consumed / Active Users` |
| 人均阅读数 | Average Reads per User | - | 每位活跃用户平均阅读的文章或笔记数量 | `Total Reads / Active Users` |
| 人均播放数 | Average Plays per User | - | 每位活跃用户平均播放的视频数量 | `Total Plays / Active Users` |
| 人均会话数 | Average Sessions per User | - | 每位活跃用户平均产生的会话数量 | `Total Sessions / Active Users` |
| 平均会话时长 | Average Session Duration | - | 每次用户会话的平均持续时间 | `Total Session Duration / Total Sessions` |
| 人均推荐请求数 | Average Requests per User | - | 每位活跃用户平均产生的推荐请求数量 | `Total Requests / Active Users` |

### 3.2 Session 定义

平均会话时长和人均会话数会受到 Session 切分规则影响。

例如，可以规定：

```text
如果用户连续 30 分钟没有产生任何行为，
则认为当前 Session 结束。
```

不同的 Session 切分规则会影响：

- Session Count
- Average Session Duration
- Sessions per User

因此，在不同系统或报表之间比较会话指标前，需要先确认 Session 定义是否一致。

---

---

## 4. 内容供给指标｜Content Supply Metrics

推荐系统不仅需要用户消费，也需要稳定、丰富且高质量的内容供给。

### 4.1 核心指标

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 发布渗透率 | Posting Penetration Rate | - | 活跃用户中至少发布一次内容的用户占比 | `Posting Users / Active Users` |
| 创作者渗透率 | Creator Penetration Rate | - | 目标用户中创作者的占比 | `Creators / Eligible Users` |
| 活跃创作者数 | Active Creators | - | 统计周期内至少发布一次有效内容的创作者数 | `COUNT(DISTINCT creator_id)` |
| 人均发布量 | Average Posts per Active User | - | 每位活跃用户平均发布的内容数 | `Total Posts / Active Users` |
| 发布用户人均发布量 | Average Posts per Posting User | - | 每位实际发布用户平均发布的内容数 | `Total Posts / Posting Users` |
| 有效内容发布量 | Qualified Content Supply | - | 满足质量、合规或消费门槛的新内容数量 | `COUNT(Qualified New Content)` |
| 内容审核通过率 | Content Approval Rate | - | 提交内容中通过审核的比例 | `Approved Content / Submitted Content` |
| 内容冷启动成功率 | Content Cold-start Success Rate | - | 新内容中成功获得有效消费或进入后续流量池的比例 | `Successful New Content / New Content` |

### 4.2 人均发布量的分母

“人均发布量”常见两种口径：

```text
Average Posts per Active User
= Total Posts / Active Users
```

该指标同时受到发布渗透率和发布频率影响。

```text
Average Posts per Posting User
= Total Posts / Posting Users
```

该指标更直接反映实际创作者的内容生产频率。

两者业务含义不同，使用时必须明确分母。

---

---

## 5. 互动指标｜Engagement Metrics

互动指标用于衡量用户是否愿意点击、阅读、观看以及进一步产生互动行为。

### 5.1 核心指标

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 点击率 | Click-Through Rate | CTR | 曝光后产生点击的比例 | `Clicks / Impressions` |
| 点赞率 | Like Rate | - | 内容消费后产生点赞的比例 | `Likes / Clicks` 或 `Likes / Valid Views` |
| 收藏率 | Save Rate / Favorite Rate | - | 内容消费后产生收藏的比例 | `Saves / Clicks` 或 `Saves / Valid Views` |
| 分享率 | Share Rate | - | 内容消费后产生分享的比例 | `Shares / Clicks` 或 `Shares / Valid Views` |
| 评论率 | Comment Rate | - | 内容消费后产生评论的比例 | `Comments / Clicks` 或 `Comments / Valid Views` |
| 关注率 | Follow Rate | - | 内容消费后关注创作者的比例 | `Follows / Valid Views` |
| 负反馈率 | Negative Feedback Rate | - | 曝光或消费后产生不感兴趣、举报或拉黑的比例 | `Negative Feedback / Impressions or Views` |
| 阅读完成率 | Read Completion Rate | - | 有效阅读中达到完成条件的比例 | `Completed Reads / Valid Reads` |
| 视频完播率 | Video Completion Rate | VCR | 视频开始播放后完整播放的比例 | `Completed Plays / Video Starts` |
| 有效播放率 | Qualified View Rate | QVR | 视频播放达到有效消费门槛的比例 | `Qualified Views / Video Starts` |
| 平均停留时长 | Average Dwell Time | - | 每次有效内容消费的平均停留时间 | `Total Dwell Time / Valid Views` |
| 跳出率 | Bounce Rate | - | 用户快速离开且未产生有效消费的比例 | `Bounced Visits / Total Visits` |

### 5.2 曝光定义｜Impression Definition

不同系统可能采用不同曝光口径：

1. 服务端返回内容
2. 客户端成功渲染内容
3. 内容进入用户可视区域
4. 内容在可视区域停留超过一定时间
5. 内容达到最低可见面积比例

如果曝光定义改变，即使模型没有变化，CTR 也可能明显变化。

因此，CTR 必须和曝光埋点口径一起解释。

### 5.3 互动行为的业务含义

不同互动行为通常代表不同的用户价值：

- **Like**：显式正向反馈
- **Save**：长期参考或重复消费价值
- **Share**：传播价值和社交价值
- **Comment**：更深的互动意愿
- **Follow**：用户与创作者建立长期关系
- **Negative Feedback**：内容不相关、质量较低或用户体验较差

点赞率、收藏率和分享率可以使用 Clicks 或 Valid Views 作为分母，但必须在指标名称或报表说明中写清楚。

例如：

```text
Like Rate by Click
Like Rate by Valid View
```

### 5.4 阅读完成率与内容长度

基础阅读完成率为：

```text
Read Completion Rate
= Completed Reads / Valid Reads
```

有些系统会根据内容长度进行校正：

```text
Normalized Completion Score
= Observed Completion Rate
  - Expected Completion Rate at the Same Length
```

或者：

```text
Normalized Completion Ratio
= Observed Completion Rate
  / Expected Completion Rate at the Same Length
```

之所以需要长度校正，是因为长内容天然比短内容更难完成。

例如：

| 内容 | 长度 | 原始完成率 |
|---|---:|---:|
| Content A | 200 words | 80% |
| Content B | 3,000 words | 60% |

虽然 Content B 的原始完成率更低，但对于 3,000 字内容而言，60% 可能已经表现非常好。

常见处理方式包括：

- 按内容长度分桶后比较
- 预测相同长度下的期望完成率
- 使用实际完成率与期望完成率的差值或比值

### 5.5 用户消费漏斗｜User Engagement Funnel

```text
曝光 Impression
    ↓
点击或播放 Click / Play
    ↓
有效消费 Qualified Consumption
    ↓
完成消费 Completion
    ↓
点赞 / 收藏 / 评论 / 分享
    ↓
关注或重复消费
    ↓
长期留存 Long-term Retention
```

| 阶段 | 核心问题 | 常见指标 |
|---|---|---|
| 曝光 → 点击 | 内容是否吸引用户 | CTR |
| 点击 → 有效消费 | 用户是否真正开始消费 | QVR, Bounce Rate |
| 有效消费 → 完成 | 内容能否持续留住注意力 | Completion Rate, Dwell Time |
| 消费 → 互动 | 用户是否认可内容 | Like Rate, Save Rate, Share Rate |
| 短期互动 → 长期行为 | 推荐是否产生长期价值 | Retention, DAU, Usage Time |

---

---

## 6. 留存指标｜Retention Metrics

留存指标衡量用户首次使用产品后，是否持续返回和活跃。

### 6.1 核心指标

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 次日留存率 | Day-1 Retention Rate | D1 Retention | 新用户在第 1 天再次活跃的比例 | `Users Active on Day 1 / Day 0 Users` |
| 7 日留存率 | Day-7 Retention Rate | D7 Retention | 新用户在第 7 天再次活跃的比例 | `Users Active on Day 7 / Day 0 Users` |
| 30 日留存率 | Day-30 Retention Rate | D30 Retention | 新用户在第 30 天再次活跃的比例 | `Users Active on Day 30 / Day 0 Users` |
| 滚动留存率 | Rolling Retention Rate | - | 用户在第 N 天或之后再次活跃的比例 | `Users Active on or after Day N / Cohort Users` |
| 流失率 | Churn Rate | - | 用户停止使用或不再活跃的比例 | `Churned Users / Eligible Users` |
| 回访率 | Repeat Visit Rate | - | 首次访问后再次访问产品的用户比例 | `Returning Users / First-time Users` |
| 复购率 | Repeat Purchase Rate | - | 首次购买后再次购买的用户比例 | `Repeat Purchasers / Purchasers` |
| 创作者留存率 | Creator Retention Rate | - | 创作者在后续周期继续发布内容的比例 | `Retained Creators / Original Creators` |

### 6.2 点留存与滚动留存

点留存要求用户恰好在第 N 天活跃：

```text
D7 Retention
= Users Active Exactly on Day 7 / Day 0 Users
```

滚动留存只要求用户在第 N 天或之后任意一天活跃：

```text
Rolling D7 Retention
= Users Active on or after Day 7 / Day 0 Users
```

通常：

```text
Rolling D7 Retention >= D7 Retention
```

### 6.3 Cohort Analysis

留存应按照用户首次注册、首次访问或首次完成关键行为的日期进行 Cohort 分析。

| Cohort | Day 0 Users | D1 | D7 | D30 |
|---|---:|---:|---:|---:|
| 2026-07-01 | 100,000 | 40% | 20% | 10% |
| 2026-07-02 | 120,000 | 42% | 21% | 11% |
| 2026-07-03 | 90,000 | 38% | 18% | 9% |

Cohort Analysis 可以避免新增用户规模变化掩盖真实留存趋势。

---

---

## 7. 商业与转化指标｜Business and Conversion Metrics

商业指标用于衡量推荐系统对交易、收入和利润的贡献。

这些指标在电商、直播电商、本地生活、付费内容和游戏内购场景中尤其重要。

### 7.1 核心指标

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 商品交易总额 | Gross Merchandise Value | GMV | 统计周期内产生的商品交易总金额 | `SUM(Order Value)` |
| 净商品交易额 | Net Gross Merchandise Value | Net GMV | 扣除取消和退款后的交易金额 | `Gross GMV - Cancelled GMV - Refunded GMV` |
| 订单量 | Number of Orders | Orders | 统计周期内产生的有效订单数 | `COUNT(Valid Orders)` |
| 加购率 | Add-to-Cart Rate | ATC Rate | 商品点击或详情页访问后加入购物车的比例 | `Add-to-Cart Events / Product Clicks or Detail Views` |
| 下单转化率 | Order Conversion Rate | CVR | 点击商品后最终产生订单的比例 | `Orders / Product Clicks` |
| 支付转化率 | Payment Conversion Rate | - | 进入购买链路后完成支付的比例 | `Paid Orders / Checkout Users or Submitted Orders` |
| 客单价 | Average Order Value | AOV | 每个订单的平均交易金额 | `GMV / Orders` |
| 人均交易额 | GMV per User | - | 每位用户平均产生的交易额 | `GMV / Users` |
| 收入 | Revenue | - | 平台实际获得的收入 | `SUM(Platform Revenue)` |
| 人均收入 | Average Revenue per User | ARPU | 每位活跃用户平均贡献的收入 | `Revenue / Active Users` |
| 付费用户人均收入 | Average Revenue per Paying User | ARPPU | 每位付费用户平均贡献的收入 | `Revenue / Paying Users` |
| 利润 | Profit | - | 收入减去成本、补贴和其他支出 | `Revenue - Total Cost` |
| 退款率 | Refund Rate | - | 已支付订单中发生退款的比例 | `Refunded Orders / Paid Orders` |
| 取消率 | Cancellation Rate | - | 已提交订单中被取消的比例 | `Cancelled Orders / Submitted Orders` |
| 投资回报率 | Return on Investment | ROI | 投入带来的增量利润与成本之比 | `Incremental Profit / Investment Cost` |
| 用户生命周期价值 | Customer Lifetime Value | LTV / CLV | 用户生命周期内预计贡献的收入或利润 | 根据业务模型计算 |

### 7.2 GMV、Revenue 与 Profit

三者需要明确区分：

```text
GMV = 商品交易总金额
Revenue = 平台实际获得的收入
Profit = Revenue - Total Cost
```

如果平台从交易中按比例抽佣：

```text
Revenue = GMV × Take Rate
```

GMV 口径还需要明确是否包含：

- 未支付订单
- 已取消订单
- 退款订单
- 运费
- 税费
- 平台补贴

因此，分析商业价值时通常需要同时观察：

- Gross GMV
- Net GMV
- Revenue
- Profit
- Refund Rate
- Cancellation Rate

### 7.3 转化率的分母

CVR 可能存在多种定义：

```text
Click-to-Order CVR
= Orders / Product Clicks
```

```text
Impression-to-Order CVR
= Orders / Product Impressions
```

```text
User Conversion Rate
= Purchasing Users / Eligible Users
```

这些指标不能直接混用。报告 CVR 时必须明确转化起点和分母。

### 7.4 GMV 分解｜GMV Decomposition

```text
GMV
= Impressions × CTR × Order CVR × AOV
```

展开后：

```text
GMV
= Impressions
  × (Clicks / Impressions)
  × (Orders / Clicks)
  × (GMV / Orders)
```

该分解可以帮助定位 GMV 变化来自：

- 流量变化
- CTR 变化
- CVR 变化
- AOV 变化

例如：

```text
CTR ↑
CVR ↓
AOV ↓
GMV unchanged or ↓
```

因此，电商推荐不能只优化 CTR。

### 7.5 电商漏斗｜Commerce Funnel

```text
商品曝光 Product Impression
    ↓
商品点击 Product Click
    ↓
详情页访问 Product Detail View
    ↓
加入购物车 Add to Cart
    ↓
提交订单 Order Submission
    ↓
支付完成 Payment
    ↓
确认收货 Order Completion
    ↓
复购 Repeat Purchase
```

---

---

## 8. 广告指标｜Advertising Metrics

广告推荐系统需要同时平衡用户体验、广告主收益和平台收入。

### 8.1 核心指标

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 广告点击率 | Ad Click-Through Rate | CTR | 广告曝光后产生点击的比例 | `Clicks / Impressions` |
| 广告转化率 | Conversion Rate | CVR | 广告点击后产生目标转化的比例 | `Conversions / Clicks` |
| 每千次曝光成本 | Cost per Mille | CPM | 广告主每获得 1,000 次曝光支付的成本 | `Cost / Impressions × 1,000` |
| 每次点击成本 | Cost per Click | CPC | 广告主为每次点击支付的平均成本 | `Cost / Clicks` |
| 每次行动成本 | Cost per Action | CPA | 广告主为每次转化支付的平均成本 | `Cost / Conversions` |
| 有效千次曝光收入 | Effective Cost per Mille | eCPM | 平台每 1,000 次广告曝光获得的有效收入 | `Revenue / Impressions × 1,000` |
| 广告填充率 | Ad Fill Rate | Fill Rate | 广告请求中成功返回广告的比例 | `Filled Requests / Ad Requests` |
| 广告负载 | Ad Load | - | 推荐内容中广告曝光所占比例 | `Ad Impressions / Total Feed Impressions` |
| 广告投入产出比 | Return on Ad Spend | ROAS | 每单位广告成本产生的收入或 GMV | `Revenue or GMV / Ad Spend` |

### 8.2 广告收入与用户体验的权衡

对于 CPC 广告：

```text
eCPM ≈ CTR × CPC × 1,000
```

对于 CPA 广告：

```text
eCPM ≈ CTR × CVR × CPA × 1,000
```

因此，广告排序系统通常同时预测 CTR 和 CVR，而不是只预测点击概率。

广告负载过高可能导致：

- 用户满意度下降
- 使用时长下降
- 留存下降
- 负反馈增加

广告负载过低则可能导致平台收入下降。

广告系统需要在短期收入和长期用户价值之间进行权衡。

---

---

## 9. 推荐质量指标｜Recommendation Quality Metrics

推荐质量指标用于衡量推荐结果的相关性、排序质量、覆盖率、多样性和新颖性。

### 9.1 排序质量指标

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 精确率 | Precision | Precision@K | Top-K 推荐中相关内容的比例 | `Relevant Items in Top-K / K` |
| 召回率 | Recall | Recall@K | 所有相关内容中被 Top-K 找回的比例 | `Relevant Items in Top-K / Total Relevant Items` |
| 命中率 | Hit Rate | HR@K | Top-K 中至少出现一个相关内容的用户比例 | `Users with a Hit / Total Users` |
| 平均倒数排名 | Mean Reciprocal Rank | MRR | 第一个相关结果排名倒数的平均值 | `Average(1 / Rank of First Relevant Item)` |
| 归一化折损累计增益 | Normalized Discounted Cumulative Gain | NDCG@K | 同时考虑相关性等级和排序位置 | `DCG@K / Ideal DCG@K` |
| 平均精确率均值 | Mean Average Precision | MAP | 多个用户或 Query 的 Average Precision 平均值 | `Average(AP)` |

### 9.2 指标适用场景

- **Precision@K**：关注推荐出来的内容有多少是相关的
- **Recall@K**：关注用户感兴趣的内容有多少被找回
- **Hit Rate@K**：关注是否至少命中一个相关结果
- **MRR**：关注第一个相关结果是否足够靠前
- **NDCG@K**：关注多级相关性和排序位置
- **MAP**：关注多个相关结果在列表中的整体排序质量

### 9.3 列表质量指标

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 目录覆盖率 | Catalog Coverage | Coverage | 推荐系统覆盖的物品范围 | `Unique Items Recommended / Total Eligible Items` |
| 列表内多样性 | Intra-list Diversity | ILD | 同一推荐列表中物品之间的差异程度 | `Average Pairwise Dissimilarity in Top-K` |
| 新颖性 | Novelty | - | 推荐内容对用户而言不常见的程度 | 可基于物品流行度计算 |
| 意外性 | Serendipity | - | 推荐内容既相关又超出用户原有预期的程度 | 根据相关性和意外性联合计算 |
| 新鲜度 | Freshness | - | 推荐结果中新内容和时效性内容的占比 | `Fresh Items / Recommended Items` |

多样性可以基于以下信息计算：

- Embedding Similarity
- Category Similarity
- Topic Similarity
- Creator Overlap
- Content Format

新颖性可以基于物品流行度定义：

```text
Novelty of Item
= -log2(Item Consumer Count / Total User Count)
```

新颖性高并不代表推荐质量一定高，还需要同时保证内容与用户兴趣相关。

---

---

## 10. 内容生态指标｜Content Ecosystem Metrics

推荐系统不仅影响消费者，也会影响创作者能否获得曝光、互动和收入。

如果流量长期集中在少数头部创作者，可能导致：

- 中小创作者流失
- 新内容难以冷启动
- 内容同质化
- 内容供给下降
- 长期用户体验下降

### 10.1 核心指标

| 中文指标 | English Metric | 缩写 | 定义 | 公式 |
|---|---|---:|---|---|
| 创作者曝光覆盖率 | Creator Exposure Coverage | - | 获得至少一次有效曝光的创作者占比 | `Exposed Creators / Eligible Creators` |
| 内容曝光覆盖率 | Content Exposure Coverage | - | 获得至少一次有效曝光的内容占比 | `Exposed Content / Eligible Content` |
| 曝光集中度 | Exposure Concentration | - | 流量是否集中在少数内容或创作者上 | `Top-N Exposure / Total Exposure` |
| 头部创作者曝光占比 | Top Creator Exposure Share | - | 头部创作者获得的曝光比例 | `Top Creator Exposure / Total Exposure` |
| 长尾内容曝光占比 | Long-tail Exposure Share | - | 长尾内容获得的曝光比例 | `Long-tail Exposure / Total Exposure` |
| 基尼系数 | Gini Coefficient | Gini | 衡量曝光、收入或互动分配的不均衡程度 | 根据曝光或收入分布计算 |
| 新创作者冷启动成功率 | New Creator Cold-start Success Rate | - | 新创作者成功获得有效曝光或消费的比例 | `Successful New Creators / New Creators` |
| 新内容冷启动成功率 | New Content Cold-start Success Rate | - | 新内容成功进入后续流量池的比例 | `Successful New Content / New Content` |
| 创作者留存率 | Creator Retention Rate | - | 创作者在后续周期继续发布内容的比例 | `Retained Creators / Original Creators` |

### 10.2 曝光公平性与流量效率

曝光越平均不代表推荐系统越好。

高质量内容和高质量创作者通常应该获得更多流量。生态指标的目标不是绝对平均，而是避免：

- 无法解释的流量垄断
- 新创作者完全没有冷启动机会
- 长尾内容永久无法获得曝光
- 单一内容类型长期占据主要流量
- 创作者收益过度不稳定

Gini 通常在 0 到 1 之间：

- 接近 0：分配相对均匀
- 接近 1：分配高度集中

实际系统需要在内容质量、用户体验和创作者公平性之间寻找平衡。

### 10.3 创作者侧体验

除曝光和收入外，还可以关注：

- 创作者发布频率
- 创作者回访率
- 创作者流失率
- 新内容首次曝光等待时间
- 新内容首次互动等待时间
- 创作者收入稳定性
- 内容审核申诉率

---

---

## 11. 实验指标角色与时间范围｜Metric Roles and Time Horizons

### 11.1 目标指标｜Primary Metric

目标指标是实验或策略希望直接改善的核心结果。

例如：

- CTR
- Watch Time
- Average Reads per User
- D7 Retention
- Posting Penetration Rate
- GMV
- Revenue

### 11.2 次要指标｜Secondary Metrics

次要指标用于解释目标指标为什么发生变化。

例如，当目标指标是 GMV 时，可以同时观察：

- Impressions
- CTR
- Add-to-Cart Rate
- CVR
- Orders
- AOV

### 11.3 护栏指标｜Guardrail Metrics

护栏指标用于防止策略以牺牲其他重要目标为代价。

常见护栏指标包括：

- Crash Rate
- Error Rate
- Latency
- Negative Feedback Rate
- Unfollow Rate
- User Retention
- Content Diversity
- Creator Exposure Fairness
- Safety Metrics
- Refund Rate
- Cancellation Rate

典型决策逻辑：

```text
Primary Metric ↑
Guardrail Metrics stable
System Health stable
→ Candidate for rollout
```

```text
CTR ↑
Dwell Time ↓
Retention ↓
→ 可能存在标题党或目标错配
```

```text
GMV ↑
Refund Rate ↑
Customer Complaints ↑
→ 商业提升可能不可持续
```

---

### 11.4 短期、中期与长期指标｜Short-term and Long-term Metrics

| 类型 | 常见指标 | 特点 |
|---|---|---|
| 短期指标 | CTR, Like Rate, Completion Rate | 反馈快、样本多、容易优化 |
| 中期指标 | Usage Time, Sessions per User, Repeat Visit Rate | 反映消费深度和使用习惯 |
| 长期指标 | Retention, DAU, Creator Retention, LTV | 更接近长期业务价值，但反馈较慢 |

只优化 CTR 可能带来：

- 标题党和封面党
- 内容同质化
- 低质量高刺激内容增加
- 点击增加但停留时长下降
- 短期互动增加但长期留存下降

因此，工业推荐系统通常需要：

- Multi-objective Optimization
- Guardrail Metrics
- Long-term Value Modeling
- Holdout Experiments
- Delayed Feedback Modeling

---

---

## 12. 指标聚合方式｜Metric Aggregation

同一个指标采用不同聚合方式，可能得到不同结果。

### 12.1 Ratio of Sums

先汇总所有点击和曝光，再计算整体 CTR：

```text
Global CTR
= Sum of Clicks / Sum of Impressions
```

这种方法会给予高曝光用户更高权重。

### 12.2 Average of User-level Ratios

先计算每个用户的 CTR，再计算用户平均：

```text
User-average CTR
= Average(Clicks per User / Impressions per User)
```

这种方法给予每个用户相同权重。

### 12.3 示例

| User | Impressions | Clicks | CTR |
|---|---:|---:|---:|
| A | 1,000 | 100 | 10% |
| B | 10 | 5 | 50% |

```text
Ratio of Sums
= (100 + 5) / (1,000 + 10)
= 10.40%
```

```text
Average of Ratios
= (10% + 50%) / 2
= 30%
```

两种结果差异很大，因此必须明确聚合方式。

---

---

## 13. 常见指标陷阱｜Common Metric Pitfalls

### 13.1 分母不一致

同一个指标使用不同分母时，数值和业务含义可能完全不同。

### 13.2 曝光定义变化

客户端修改曝光埋点后，CTR 可能变化，即使模型没有更新。

### 13.3 重复事件

网络重试或日志重复可能导致：

- Clicks 大于 Impressions
- Orders 被重复计算
- Revenue 被高估
- Session Duration 被放大

通常需要使用以下标识去重：

- Event ID
- Request ID
- Order ID

### 13.4 延迟转化

用户可能今天点击，几天后才购买。

因此必须定义 Attribution Window：

```text
1-day Attribution
7-day Attribution
30-day Attribution
```

### 13.5 退款和取消

GMV 上升但退款率同时上涨，并不一定代表真实商业价值提高。

### 13.6 幸存者偏差｜Survivorship Bias

只分析当前活跃用户，可能忽略已经流失的用户。

### 13.7 辛普森悖论｜Simpson's Paradox

整体指标上升，但不同用户分群中的指标可能全部下降。

因此需要结合以下维度进行分群分析：

- 新用户与老用户
- 高活跃与低活跃用户
- 国家和地区
- 设备类型
- 内容类别
- 创作者规模
- 用户兴趣群体

### 13.8 指标博弈｜Metric Gaming

当系统只优化一个指标时，可能以非预期方式提升该指标。

例如：

- 通过标题党提高 CTR
- 通过自动播放提高 Watch Time
- 通过低价补贴提高 Orders，但降低 Profit
- 通过高频通知提高 DAU，但增加长期流失

---
