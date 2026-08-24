# 电商推荐指标体系｜E-commerce Recommendation Metrics

<a name="top"></a>

指标体系的目的不是收集尽可能多的数字，而是把模型变化连接到用户体验、交易质量、供给生态和上线决策。短视频商品内容、直播内容、商城商品卡、搜索、商品详情页、主体橱窗、供给匹配与跨渠道分配都可能连接交易尾部，但各自拥有不同的决策单元、前置行为和诊断路径。

## 目录

- [1. 通用指标定义与 Metric Contract](#sec-1)
  - [1.1 两个正交维度：价值域与决策角色](#sec-1-1)
  - [1.2 North Star Metric｜北极星指标](#sec-1-2)
  - [1.3 Consumption Metrics｜消费指标](#sec-1-3)
  - [1.4 Outcome、Diagnostic、Guardrail 与 Data Quality](#sec-1-4)
  - [1.5 Metric Contract｜指标契约](#sec-1-5)
- [2. 统一事件与订单状态](#sec-2)
  - [2.1 推荐事件主干](#sec-2-1)
  - [2.2 订单状态表优先于事件相减](#sec-2-2)
- [3. 主要推荐场景的漏斗与决策指标](#sec-3)
  - [3.1 短视频商品内容流](#sec-3-1)
  - [3.2 直播内容流](#sec-3-2)
  - [3.3 商城商品卡](#sec-3-3)
  - [3.4 搜索与类目浏览](#sec-3-4)
  - [3.5 商品详情页、店铺页与个人橱窗](#sec-3-5)
  - [3.6 创作者选品与合作匹配](#sec-3-6)
  - [3.7 自然、联盟与付费流量协同](#sec-3-7)
  - [3.8 为什么不能横向比较一个“CTR”](#sec-3-8)
- [4. 买家与交易转化指标](#sec-4)
  - [4.1 核心漏斗](#sec-4-1)
  - [4.2 Count、User 与 Value 口径](#sec-4-2)
  - [4.3 漏斗指标应保留无行为用户](#sec-4-3)
- [5. Gross GMV、Net GMV 与商业价值](#sec-5)
  - [5.1 状态化 GMV](#sec-5-1)
  - [5.2 Net-to-Gross 与成熟曲线](#sec-5-2)
  - [5.3 Revenue、Take Rate 与 Margin](#sec-5-3)
  - [5.4 常用商业指标](#sec-5-4)
- [6. Metric Tree｜指标树](#sec-6)
  - [6.1 统一交易树](#sec-6-1)
  - [6.2 短视频指标树](#sec-6-2)
  - [6.3 直播指标树](#sec-6-3)
  - [6.4 商城指标树](#sec-6-4)
  - [6.5 搜索指标树](#sec-6-5)
  - [6.6 创作者选品与合作指标树](#sec-6-6)
  - [6.7 跨渠道贡献树](#sec-6-7)
  - [6.8 加法分解用于定位来源](#sec-6-8)
- [7. 用户体验与长期价值](#sec-7)
  - [7.1 短期体验](#sec-7-1)
  - [7.2 留存与复购](#sec-7-2)
  - [7.3 代理指标的边界](#sec-7-3)
  - [7.4 活跃用户与场景渗透](#sec-7-4)
  - [7.5 跨场景消费权衡](#sec-7-5)
- [8. 推荐模型与阶段指标](#sec-8)
  - [8.1 召回](#sec-8-1)
  - [8.2 粗排](#sec-8-2)
  - [8.3 精排与多任务预测](#sec-8-3)
  - [8.4 重排与列表质量](#sec-8-4)
- [9. 商品、商家、创作者与实时供给生态](#sec-9)
  - [9.1 有效供给](#sec-9-1)
  - [9.2 曝光与成交覆盖](#sec-9-2)
  - [9.3 集中度与分布](#sec-9-3)
  - [9.4 创作者合作与内容供给](#sec-9-4)
  - [9.5 商家质量与可持续性](#sec-9-5)
- [10. 实验中的指标角色](#sec-10)
  - [10.1 一个精排实验的指标组合](#sec-10-1)
  - [10.2 决策不是“Primary 显著即可”](#sec-10-2)
- [11. Ratio Metrics 与聚合口径](#sec-11)
  - [11.1 Ratio of Sums](#sec-11-1)
  - [11.2 Mean of User-level Ratios](#sec-11-2)
  - [11.3 Per-user Outcome](#sec-11-3)
  - [11.4 一个例子](#sec-11-4)
  - [11.5 Ratio Metric 的推断](#sec-11-5)
- [12. 异质性与分布分析](#sec-12)
  - [12.1 预设分群](#sec-12-1)
  - [12.2 分布指标](#sec-12-2)
  - [12.3 Winsorization 与日志变换](#sec-12-3)
- [13. 归因、成熟窗口与数据质量](#sec-13)
  - [13.1 Attribution Window 与 Maturity Window](#sec-13-1)
  - [13.2 跨入口重复归因](#sec-13-2)
  - [13.3 数据质量指标](#sec-13-3)
  - [13.4 去重键与时间](#sec-13-4)
- [14. 常见诊断模式与陷阱](#sec-14)
  - [14.1 常见模式](#sec-14-1)
  - [14.2 常见陷阱](#sec-14-2)
- [15. 指标在实验生命周期中的使用](#sec-15)
- [16. 工业案例：用指标树避免局部最优](#sec-16)
  - [16.1 短视频商品内容：播放指标改善，商品漏斗收缩](#sec-16-1)
  - [16.2 直播内容：进房率提升来自无效房间](#sec-16-2)
  - [16.3 商城商品卡：CTR 下降是否应阻止上线](#sec-16-3)
  - [16.4 搜索排序：CTR 上升但用户更频繁改写 Query](#sec-16-4)
  - [16.5 创作者选品：加入率上升但内容供给没有增加](#sec-16-5)
  - [16.6 跨渠道协同：归因交易增长但总增量不变](#sec-16-6)
- [17. 关联文档](#sec-17)

---

<a name="sec-1"></a>

## 1. 通用指标定义与 Metric Contract

推荐指标可以从两个互不替代的维度理解：指标在衡量哪一类价值，以及它在当前决策中承担什么角色。先把这两个维度分开，才能避免把“消费指标”“北极星指标”和“护栏指标”混成同一层分类。

<a name="sec-1-1"></a>

### 1.1 两个正交维度：价值域与决策角色

| 维度 | 常见类别 | 回答的问题 |
|---|---|---|
| Value Domain｜价值域 | Consumption、Commerce、Supply、Long-term、System | 指标衡量的是哪一类用户或生态价值 |
| Decision Role｜决策角色 | North Star、Primary、Secondary、Diagnostic、Guardrail、Data Quality | 指标在当前产品治理或实验决策中怎样被使用 |

例如，`Qualified Watch Time per Eligible User` 属于消费指标；在以有效内容消费为核心目标的产品层决策中，它可以是 North Star，在交易模型实验中则更可能是 Secondary 或 Guardrail。`Mature Net Value per Eligible User` 属于交易价值指标；它可以是长期维护的 North Star，也可以是某个排序实验的 Primary。

因此，不应问“这个指标到底是 Consumption 还是 Guardrail”，而应分别回答：

```text
Value Domain: 它衡量什么价值？
Decision Role: 它在这次决策中承担什么角色？
```

<a name="sec-1-2"></a>

### 1.2 North Star Metric｜北极星指标

North Star Metric 是长期、稳定地代表产品核心用户价值的指标，用于让不同模型、页面和团队围绕同一个最终方向优化。它不等于“当前 Dashboard 最大的数字”，也不意味着整个系统只能保留一个指标。

一个可靠的 North Star 通常满足：

- **价值一致**：增长代表用户或生态获得更多可持续价值，而不是单纯产生更多事件；
- **Population 稳定**：分母覆盖完整 Eligible Population，不只保留点击、购买或其他处理后人群；
- **可响应**：策略改变能够在合理时间内影响它，同时不会只反映季节性或流量规模；
- **难以 Gaming**：不能通过增加无效曝光、诱导点击、过度补贴或牺牲长期质量轻易抬高；
- **可分解**：能够沿消费、交易、供给和系统链路定位变化来源；
- **有护栏**：North Star 改善仍需满足用户体验、售后、供给集中度和系统稳定性边界。

常见候选示例：

| 核心价值 | North Star 候选 | 为什么比单一 CTR 更接近最终价值 |
|---|---|---|
| 有效内容消费 | `Qualified Consumption Time per Eligible User` | 同时保留零消费用户，并排除过短或无效消费 |
| 购物效率与交易质量 | `Mature Net Value per Eligible User` | 覆盖购买渗透、订单价值以及成熟后的取消退款结果 |
| 长期买家价值 | `T-day Retained Buyer Value per Eligible User` | 连接当前策略与固定窗口内的留存、复购和成熟价值 |
| 供给生态 | `Quality-adjusted Active Supply per Eligible Demand Unit` | 同时要求供给获得机会且满足质量、库存和履约条件 |

**North Star 与实验 Primary 不完全相同。** North Star 是跨周期保持稳定的产品级方向；Primary Metric 是针对一个具体假设、在看结果前选定的实验决策指标。搜索相关性实验可以用 `Mature Net Value per Pre-treatment Eligible Searcher` 作为 Primary，同时继续用全局用户级 North Star 判断是否出现跨场景影响。Primary 更贴近局部机制，但不能与长期方向冲突。

**为什么 CTR 通常不适合作为全局 North Star。** CTR 可以因更突出的位置、减少曝光分母、诱导式标题或向少数易点击商品集中而上升。它很适合诊断“曝光是否转化为点击”，却无法单独回答用户是否获得有效消费、高质量购买或长期价值。

<a name="sec-1-3"></a>

### 1.3 Consumption Metrics｜消费指标

Consumption Metrics 衡量用户是否真正开始、持续并完成一次有意义的内容或页面消费。服务端返回结果不等于消费，Rendered 也不一定等于用户看到；消费指标通常从 Viewable Opportunity 开始，再区分开始、深度、质量和负向反馈。

| 层级 | 常见指标 | 推荐分母 | 主要解释 |
|---|---|---|---|
| Opportunity / Reach | Viewable Impressions、Reach、Results with Viewable Content | Eligible User / Request / Query | 用户是否真正获得可消费机会 |
| Start / Entry | Play Start、Qualified Room Entry、PDP Open、Search Result Engagement | Viewable Opportunity 或 Eligible Unit | 用户是否开始消费 |
| Depth | Watch Time、Dwell Time、Session Depth、Products Examined | Eligible User、Start 或 Consumer | 消费覆盖与消费深度 |
| Quality | Qualified View、Completion、Return-to-search、Meaningful Interaction | Viewable Opportunity 或 Start | 消费是否达到预先定义的质量门槛 |
| Positive Action | Save、Share、Follow、Product Detail View、Add to Cart | Eligible Unit 或对应可见机会 | 消费是否形成进一步意图 |
| Negative Action | Fast Skip、Quick Exit、Hide、Report、Negative Feedback | Viewable Opportunity 或 Start | 消费是否失配、重复或产生伤害 |
| Long-term Consumption | Revisit、Retention、Repeat Qualified Consumption | 固定 Day-0 Cohort | 当前体验是否带来持续使用 |

常见估计目标不能混用：

```text
Qualified Consumption per Eligible User
= Total Qualified Consumption / Eligible Users

Qualified Consumption Rate
= Viewable Opportunities reaching the Qualified Consumption threshold
  / Viewable Opportunities

Average Depth per Consumer
= Total Consumption Depth / Users with Valid Consumption
```

- `per Eligible User` 同时包含“是否获得机会”和“获得机会后消费多深”，通常更接近用户级实验总效果；
- `per Viewable Opportunity` 解释一次可见机会的消费效率，适合漏斗诊断；
- `per Consumer` 只描述已消费人群。若 Treatment 会改变谁成为 Consumer，它是处理后条件指标，不能替代 ITT。

消费指标还需要场景校正。例如 Completion Rate 受内容长度影响，直播观看受进房时刻和房间剩余时长影响，页面 Dwell Time 可能因加载慢而虚高，搜索改写既可能表示需求收敛，也可能表示结果不相关。单个消费数字必须结合机会、内容长度、延迟、负反馈和下游行为解释。

`Qualified Click` 也属于消费质量定义，而不是一种天然存在的事件。它通常要求点击后满足预先声明的停留时长、页面可见性或后续有效动作，用于排除误触和立即退出。例如，商品卡点击后详情页至少前台可见 3 秒，和“点击后加购”回答的是两个不同问题，不能合并成同一个合格点击口径。计时应从可见渲染完成开始，并暂停后台或离屏时间。阈值必须在看实验结果前固定，并同时报告原始 Click、Quick Exit 与下游交易；否则通过改变阈值也能机械地制造指标提升。

同一个分子可以对应不同问题：`Qualified Clicks per Eligible User` 适合用户级总效果，`Qualified CTR = Qualified Clicks / Viewable Impressions` 解释机会效率，`Qualification Rate = Qualified Clicks / All Clicks` 描述已点击人群。推荐策略通常会同时改变 Viewable Impressions 和 Clicks，因此后两者都是漏斗诊断；`Qualification Rate` 还额外条件在已点击集合上，处理后选择更强。二者都不能替代 ITT。

<a name="sec-1-4"></a>

### 1.4 Outcome、Diagnostic、Guardrail 与 Data Quality

| 决策角色 | 通用定义 | 使用边界 |
|---|---|---|
| North Star | 长期代表产品核心价值的稳定指标 | 用于跨周期方向，不由单次实验临时更换 |
| Primary / Outcome | 针对当前假设预先选定的主要决策指标 | 应声明 MDE、成熟窗口和实际意义阈值 |
| Secondary | 补充描述其他价值或长期方向 | 不能在 Primary 不支持时事后替代 Primary |
| Diagnostic | 解释效果来自漏斗的哪一环 | 常含条件分母，适合定位机制，不自动代表总因果效果 |
| Guardrail | 定义不能接受的用户、交易、生态或系统伤害 | 应预先声明风险边界与 Continue / Pause / Rollback 规则 |
| Data Quality | 判断分流、日志和指标是否足以支持解释 | SRM、覆盖、延迟或订单 Join 失败时，应先停止业务解读 |

同一指标的角色会随假设改变。例如排序实验可以将 `Mature Net Value per Eligible User` 设为 Primary、`Qualified Watch Time per User` 设为 Secondary、退款率设为 Guardrail、CTR 设为 Diagnostic、SRM 设为 Data Quality。角色必须在看结果前声明，不能因为某个指标显著才临时升级为 Primary。

更完整的实验指标组合见[第 10 章](#sec-10)。

<a name="sec-1-5"></a>

### 1.5 Metric Contract｜指标契约

任何关键指标在进入 Dashboard、离线评估或在线实验前，都应先形成可版本化的 Metric Contract。

| 字段 | 必须回答的问题 | 示例 |
|---|---|---|
| Metric Name | 名称是否唯一且包含关键口径 | ITT Mature Net GMV per Eligible User |
| Business Meaning | 指标代表哪种用户或业务价值 | 每位随机化合格用户贡献的成熟净交易额 |
| Population | 哪些对象进入分析 | 随机化时满足预处理资格的全部用户 |
| Analysis Unit | 每个观测单位是什么 | User / Session / Request / Order / Seller |
| Trigger | 是否只分析真正有机会受影响的对象 | ITT 不使用实验后行为；如使用 Trigger，必须预先确定或不受 Treatment 影响 |
| Numerator | 分子事件及去重规则 | 达到固定订单年龄的 ever-paid Cohort 净额之和 |
| Denominator | 分母及零分母处理 | Eligible Users，包括零购买用户 |
| Aggregation | Ratio of Sums 还是 Unit-level Mean | User-level Mean |
| Observation Window | 行为在哪段时间发生 | 实验期间 14 天 |
| Attribution Window | 触点之后多久的转化可归因 | ITT 不按触点筛选；点击后 7 天仅用于单独的描述性归因指标 |
| Maturity Window | 取消退款回流到什么年龄 | 支付后 30 天 |
| Order State | Created、Paid、Fulfilled 还是 Mature Net | Mature Net |
| Filters | 排除哪些流量 | Bot、测试账号、重复事件、无效订单 |
| Currency / Timezone | 汇率日和业务日边界 | 当日固定汇率、市场本地日 |
| Data Availability | 什么时候数据完整 | 最后一笔纳入支付 + 30 天成熟窗口 + ETL SLA |
| Estimator | 如何计算 Treatment Effect 与不确定性 | Difference in Means + Cluster Bootstrap |
| Owner / Version | 谁维护，定义何时生效 | Metric owner + version date |

上表示例刻意使用 ITT 指标：Treatment 可能同时改变进入入口、点击和跨入口购买，因此分子不能只保留“点击后归因订单”。若另做触点归因指标，应使用不同名称、独立 Attribution Window，并明确它只描述路径，不替代随机实验的总效果。

**为什么分母必须保留零购买用户。** 假设两组各随机化 100,000 位用户，新策略让更多人进入商城，但进入后的购买率略降。若只看访问商城或点击商品的人，会丢掉策略对“是否进入漏斗”的影响；`Mature Net GMV per Eligible User` 才保留完整的总效果。

指标名相同不代表口径相同。例如 `CVR` 至少可能表示：

```text
Impression-to-Pay CVR = Paid Orders / Product Impressions
Click-to-Pay CVR      = Paid Orders / Product Clicks
PDP-to-Pay CVR        = Paid Orders / Product Detail Views
Buyer Conversion      = Purchasing Users / Eligible Users
```

报告中只写“CVR +1%”无法判断业务含义。应同时写清起点、终点、分母和相对或绝对变化。

---

<a name="sec-2"></a>

## 2. 统一事件与订单状态

<a name="sec-2-1"></a>

### 2.1 推荐事件主干

```text
Eligible Request
→ Served Result
→ Rendered Result
→ Viewable Impression
→ Surface-specific Engagement
→ Product Detail View
→ Add to Cart
→ Checkout
→ Order Created
→ Paid
→ Shipped / Fulfilled / Delivered
→ Cancelled / Returned / Refunded
→ Mature Net Transaction
```

| 事件 | 推荐分析中的定义重点 |
|---|---|
| Eligible Request | 用户、入口、市场和版本满足策略资格 |
| Served Result | 服务端返回候选，不等于用户看到 |
| Rendered Result | 客户端渲染成功，不等于进入可视区域 |
| Viewable Impression | 达到可见面积和最短停留阈值；阈值必须版本化 |
| Product Click | 点击明确的商品入口，而不是泛内容点击 |
| Product Detail View | 商品详情页成功打开；需处理重复加载 |
| Add to Cart | 商品与数量进入购物车；需区分加购事件和去重加购用户 |
| Order Created | 订单建立，可能尚未支付 |
| Paid | 支付成功；仍可能出现取消、退货或退款 |
| Mature Net Transaction | 固定成熟窗口后保留的净金额和有效商品件数 |

<a name="sec-2-2"></a>

### 2.2 订单状态表优先于事件相减

取消、退货和退款可能重叠，订单也可能发生部分退款。稳健做法是以订单行或 SKU 行构建状态表，在固定快照上计算金额，而不是用多个可能重叠的事件总额简单相减。

建议保留：

- `order_id` 与 `order_line_id`；
- 创建、支付、发货、送达、取消、退款时间；
- 原始支付金额、平台折扣、商家折扣、运费、税费；
- 取消金额、部分退款金额和退款原因；
- 商品、SKU、商家、入口与可审计的推荐触点；
- 订单年龄与数据快照日期。

**一个订单成熟例子。** 两笔订单分别支付 120 元和 80 元。第一笔后来部分退款 20 元，第二笔全额退款 80 元；同一成熟 Cohort 的 Paid Gross GMV 是 200 元，Mature Net GMV 是 100 元。不能先按“取消订单”扣一次、再按退款事件重复扣一次，也不能把已退款订单移出 ever-paid 分母。

---

<a name="sec-3"></a>

## 3. 主要推荐场景的漏斗与决策指标

<a name="sec-3-1"></a>

### 3.1 短视频商品内容流

```text
视频可见曝光
→ 播放开始
→ 有效观看
→ 深度观看 / 完播 / 互动
→ 商品入口曝光
→ 商品点击
→ PDP
→ ATC
→ 支付
→ 成熟净交易
```

| 指标 | 稳定定义示例 | 主要回答的问题 |
|---|---|---|
| Play Rate | `Video Starts / Viewable Video Impressions` | 用户是否开始消费内容 |
| Qualified View Rate | `Qualified Views / Video Starts` | 是否达到有效观看阈值 |
| Skip Rate | `Fast Skips / Video Starts` | 内容是否快速失配 |
| Average Watch Time | `Total Watch Time / Video Starts` | 每次开始播放后的平均消费深度 |
| Watch Time per User | `Total Watch Time / Eligible Users` | 同时包含覆盖与消费深度 |
| Completion Rate | `Completed Plays / Video Starts` | 完播表现；需要按视频长度分层 |
| Product-entry Exposure Rate | `Viewable Video Impressions with Product-entry Exposure / Viewable Video Impressions` | 有多少可见内容曝光真正提供商品入口 |
| Product CTR | `Product Clicks / Product-entry Impressions` | 内容兴趣是否转成商品兴趣 |
| Product Clicks per User | `Product Clicks / Eligible Users` | 避免只看点击用户条件分布 |
| Paid CVR | `Eligible Product Clicks with at least one Attributed Paid Order / Eligible Product Clicks` | 商品点击后发生支付的概率；按点击去重 |
| Surface-attributed Mature Net GMV per User | `Surface-attributed Mature Net GMV / Eligible Users` | 按固定触点规则描述该入口关联的成熟交易价值 |

观看完成率受内容长度强烈影响。可按长度分桶，或比较 `Observed Completion Rate / Expected Completion Rate at Same Length`，不宜直接把长视频与短视频混在一起。

<a name="sec-3-2"></a>

### 3.2 直播内容流

```text
直播间卡片可见曝光
→ 进房
→ 有效观看
→ 商品组件曝光
→ 商品点击
→ ATC
→ 支付
→ 履约与成熟净交易
```

| 指标 | 稳定定义示例 | 主要回答的问题 |
|---|---|---|
| Room Entry Rate | `Eligible Live-card Impressions with at least one Attributed Room Entry / Eligible Live-card Impressions` | 房间卡片是否吸引用户进入；按来源曝光去重 |
| Qualified Entry Rate | `Eligible Live-card Impressions with at least one Attributed Qualified Room View / Eligible Live-card Impressions` | 进房是否形成有效观看；按来源曝光去重 |
| Quick Exit Rate | `Room Views below Threshold / Room Entries` | 进房是否由误导或失配驱动 |
| Watch Time per Entrant | `Live Watch Time / Room Entrants` | 进房后的消费深度 |
| Product-module Exposure Rate | `Qualified Room Views with at least one Product-module Impression / Qualified Room Views` | 有多少有效观看至少获得一次商品机会 |
| Live Product CTR | `Product Clicks / Product-module Impressions` | 当前商品是否匹配观看意图 |
| Paid Buyers per Viewer | `Paid Buyers / Qualified Room Viewers` | 观看到购买的用户级效率 |
| Surface-attributed Mature Net GMV per Entrant | `Surface-attributed Mature Net GMV / Unique Room Entrants` | 按固定触点规则描述每位进房用户关联的成熟交易价值 |
| Offline-room Exposure Rate | `Offline Room Impressions / Live-card Impressions` | 候选状态是否及时 |
| Out-of-stock Exposure Rate | `OOS Product Impressions / Product Impressions` | 实时库存是否准确 |

进房率上升同时 Quick Exit Rate 上升，说明卡片吸引力可能超过实际内容质量。直播指标还必须结合房间在线状态、当前挂载商品、库存和特征新鲜度诊断。

<a name="sec-3-3"></a>

### 3.3 商城商品卡

```text
商品卡可见曝光
→ 商品点击
→ PDP
→ ATC
→ Checkout
→ Paid Order
→ Fulfilled / Delivered
→ Mature Net Transaction
→ Repeat Purchase
```

| 指标 | 稳定定义示例 | 主要回答的问题 |
|---|---|---|
| Product-card CTR | `Product Clicks / Viewable Product-card Impressions` | 商品卡是否匹配购物意图 |
| PDP-to-ATC CVR | `Eligible PDP Sessions with at least one ATC / Eligible PDP Sessions` | 商品详情是否推动考虑购买 |
| ATC-to-Checkout CVR | `Eligible ATC Sessions with at least one Checkout / Eligible ATC Sessions` | 购物车到结算是否顺畅 |
| Checkout-to-Pay CVR | `Checkout Attempts with at least one Paid Order / Eligible Checkout Attempts` | 支付链路是否完成 |
| Buyer Conversion | `Paid Buyers / Eligible Users` | 用户级购买渗透 |
| Orders per Buyer | `Paid Orders / Paid Buyers` | 购买用户的下单频率 |
| Items per Order | `Paid Units / Paid Orders` | 每单件数 |
| AOV | `Paid Gross GMV / Paid Orders` | 每单支付金额 |
| Surface-attributed Mature Net GMV per User | `Surface-attributed Mature Net GMV / Eligible Users` | 按固定触点规则描述该入口关联的成熟交易价值 |

<a name="sec-3-4"></a>

### 3.4 搜索与类目浏览

搜索首先要满足 Query、类目和筛选条件，再讨论个性化。若只看点击，热门但不符合型号、尺寸或配送约束的商品也可能获得不错的 CTR，却迫使用户反复改写 Query。

```text
Eligible Searcher / Query
→ 召回到至少一个合格结果
→ 结果可见曝光
→ 商品点击
→ PDP
→ ATC / 支付
→ 成熟净交易
```

| 指标 | 稳定定义示例 | 主要回答的问题 |
|---|---|---|
| Zero-result Rate | `Queries with zero eligible result / Eligible Queries` | 召回、过滤或供给是否使请求无结果 |
| Reformulation Rate | `Queries followed by a reformulated query / Eligible Queries` | 用户是否需要再次表达同一需求 |
| Product Clicks per Query | `Search-result Product Clicks / Eligible Queries` | 每次明确需求产生多少商品访问 |
| Paid Query Rate | `Queries with at least one attributed paid conversion / Eligible Queries` | Query 到支付的描述性转化概率 |
| Mature Net Value per Searcher | `Mature Net Value / Randomized Eligible Searchers` | 搜索策略对合格搜索用户的总价值 |
| Constraint Violation Rate | `Impressions violating query/filter constraints / Result Impressions` | 个性化是否压过硬约束 |

Query 级相关性和 NDCG 适合定位检索与排序质量；用户级 ITT 更适合做实验主结果。若 Treatment 会改变用户是否搜索或改写 Query，只分析实验后产生的 Query 会发生后处理选择，主分析应回到随机化时可确定的人群。

<a name="sec-3-5"></a>

### 3.5 商品详情页、店铺页与个人橱窗

详情页已经包含一个明确的商品上下文，可以推荐解释当前商品的内容、可替代商品或搭配商品；店铺页与个人橱窗则是在主体可陈列的候选集合中排序。它们不应沿用全库发现页的同一分母。

```text
Eligible Page View
→ 推荐模块可见
→ 内容有效消费 / 关联商品 PDP
→ 当前商品 ATC 或搭配商品加入购物篮
→ 支付
→ 成熟净交易
```

| 指标 | 稳定定义示例 | 主要回答的问题 |
|---|---|---|
| Module Coverage | `Eligible Page Views with a renderable module / Eligible Page Views` | 有多少页面真正具备推荐机会 |
| Exact-binding Rate | `Content Impressions correctly bound to current product / Content Impressions` | 内容是否解释当前商品而非其他型号 |
| Current-product ATC per PDP | `Current-product ATC Users / Eligible PDP Visitors` | 推荐模块是否帮助当前决策 |
| Related-product PDP per Page | `Related-product PDP Visits / Eligible Page Views` | 替代或搭配发现效率 |
| Attach Rate | `Order-level deduplicated orders containing target and complement / Eligible target-product Orders` | 条件机制诊断；分母可能被 Treatment 改变，不能代替端到端因果指标 |
| Pinned Display Share | `Manually pinned displayed slots / Final displayed slots` | 最终展示列表中有多少位置由人工置顶 |
| Hidden Candidate Rate | `Eligible candidates hidden manually / Eligible candidates before manual actions` | 候选在展示前被人工隐藏的程度 |

内容观看、关联商品点击和 Attach Rate 都是机制指标。若上游策略同时改变页面到访或目标商品订单，页面访问者与订单分母都可能是处理后变量；端到端主结果应回到随机化前可确定的 Eligible User、Page 或 Request。若人工置顶、隐藏或候选编辑发生在推荐之后，也应记录为最终展示链路的一部分，而不是将其影响归给模型。

<a name="sec-3-6"></a>

### 3.6 创作者选品与合作匹配

供给侧推荐的“用户”可能是创作者或商家，推荐对象是商品、合作方或活动机会。反馈链比买家点击长得多：一次匹配可能先产生查看、样品申请和内容发布，之后才产生买家曝光与成熟交易。

```text
Eligible Creator–Product / Seller–Creator Pair
→ 推荐机会可见
→ 查看详情 / 接受合作 / 申请样品
→ 加入橱窗或内容发布
→ 买家获得可见曝光
→ 支付与成熟净交易
```

| 指标 | 稳定定义示例 | 主要回答的问题 |
|---|---|---|
| Eligible Match Coverage | `Pairs receiving an opportunity / Eligible Pairs` | 是否覆盖足够的供需关系 |
| Acceptance per Impression | `Accepted Opportunities / Viewable Opportunity Impressions` | 推荐是否形成初步合作意愿 |
| T-day Cumulative Publisher Rate | `Creators publishing by day T / Randomized Eligible Creators` | 固定观察期内有多少合格主体形成内容 |
| Restricted Mean Waiting Time through T | `Mean of min(Time-to-First-Content, T)`；未发布者贡献 `T` | 在不丢弃未发布者的情况下描述供给形成速度 |
| Mature Value per Pre-assignment Eligible Unit | 使用 Treatment 前固定的 Match Unit；订单采用互斥去重 Credit | 完整长链路的最终价值；无法排他认领时改用随机化 Eligible Creator / Seller 分母 |
| Top-k Match Opportunity Share | `Matched opportunities assigned to top-k creators or sellers / Total matched opportunities` | 按预先声明的 Opportunity、Exposure 或 Value 口径衡量集中度 |

“接受合作”“加入橱窗”和“发布内容”都可能被 Treatment 改变，不能只在完成这些动作的人群中估计总效果。创作者产能、商家预算、样品和库存还会产生跨单元竞争；内容进入共享买家分发后，同一买家还可能接触不同实验组创作者。设计需要覆盖实际资源共享与两侧混流边界，而不是机械选择 Creator、Seller 或 Campaign Cluster；同时监控覆盖、集中度和履约质量。

<a name="sec-3-7"></a>

### 3.7 自然、联盟与付费流量协同

跨渠道分配的目标不是让每个渠道的归因交易都最大，而是在去重后提高总增量价值。付费触达可能只是把原本会从自然或联盟渠道发生的订单重新标记，因此渠道归因不能直接相加。

```text
Eligible User–Product–Campaign
→ Channel / Creative / Budget Allocation
→ Deduplicated Viewable Exposure
→ 支付与成熟净交易
→ 广告、佣金和补贴成本
→ 增量贡献
```

| 指标 | 稳定定义示例 | 主要回答的问题 |
|---|---|---|
| Deduplicated Reach | `Unique exposed users / Eligible Users` | 跨渠道实际覆盖多少不同用户 |
| Duplicate Exposure Share | `Users exposed through multiple channels / Exposed Users` | 渠道是否在重复争夺同一人群 |
| All-channel Mature Net Value | `Deduplicated Mature Net Value / Eligible Units` | 总交易结果是否真正改善 |
| Contribution after Cost | `Mature Transaction Revenue - Ads - Commission - Subsidy - Variable Cost` | 增长是否覆盖获得流量的成本 |
| Organic Displacement Contrast | 同期随机对照中 `Organic outcome per Eligible Unit` 的 Treatment - Control | 在同一人群和窗口中诊断付费调整伴随的自然结果变化；需与全渠道总效果共同解释 |
| Incremental Return on Spend | `Incremental contribution / Incremental spend` | 新增预算带来多少净增量 |

渠道报表适合描述路径和结算，不自动代表因果增量。联合策略应在用户、商家或活动等可执行单位上保留 Holdout，并确保订单、曝光、成本和币种使用同一窗口与去重规则。

<a name="sec-3-8"></a>

### 3.8 为什么不能横向比较一个“CTR”

不同场景的点击事件并不等价：视频点击可能表示播放或展开，直播点击可能表示进房，商城点击通常表示商品详情访问，搜索点击还受到 Query 约束，供给匹配中的关键动作则可能是接受合作。跨场景对比应使用统一终点和统一分析单位，例如：

```text
Paid Buyers / Eligible Users
Mature Net GMV / Eligible Users
Product Detail Views / Eligible Users
```

即便使用统一终点，也要控制入口用户意图与可用供给差异，描述性差异不能直接解释为某个入口的因果优势。

场景级漏斗中的 `Surface-attributed` 指标属于描述性机制诊断，各入口必须使用互斥订单归因后才能相加。在线实验的主结果应使用全局去重的 `ITT Mature Net GMV / Randomized Eligible Users`，不以点击、进房或归因订单为条件。

**同一个增长数字可能代表不同机制。** Product Clicks per Eligible User 同样增长 10%，在短视频中可能来自更多商品入口曝光，在直播中可能来自更多有效进房，在商城中可能来自更高商品卡 CTR。先沿各自漏斗定位变化，再判断是模型相关性提升、界面曝光变化，还是实时供给变多。

---

<a name="sec-4"></a>

## 4. 买家与交易转化指标

<a name="sec-4-1"></a>

### 4.1 核心漏斗

| 指标 | 分子 | 分母 | 推荐分析中的注意点 |
|---|---|---|---|
| Impression Reach | 至少一次可见曝光的用户 | Eligible Users | 区分没有请求、无结果和渲染失败 |
| Product CTR | 商品点击 | 可见商品入口曝光 | 入口定义必须一致 |
| PDP Rate per User | PDP 去重访问 | Eligible Users | 包含零行为用户 |
| ATC Rate | 加购事件或加购用户 | PDP、商品点击或 Eligible Users | 名称必须标明分母和去重粒度 |
| Order Creation CVR | 创建订单 | 商品点击、PDP 或用户 | 不代表支付成功 |
| Paid CVR | 支付订单 | 商品点击、PDP、Checkout 或用户 | 说明 Attribution Window |
| Payment Success Rate | 支付成功订单 | 支付尝试或提交订单 | 更偏支付链路诊断 |
| Cancellation Rate | 取消订单或取消金额 | 对应状态的订单或金额 | 区分支付前与支付后取消 |
| Refund Rate | 退款订单、商品件数或金额 | 成熟的支付订单、件数或金额 | 必须标明 count-based 或 value-based |
| Repeat Purchase Rate | 再次购买用户 | 首购用户 Cohort | 定义复购窗口与成熟条件 |

<a name="sec-4-2"></a>

### 4.2 Count、User 与 Value 口径

退款率至少有三种常见估计目标：

```text
Order Refund Rate = Refunded Ever-paid Orders / Matured Ever-paid Order Cohort
Unit Refund Rate  = Refunded Ever-paid Units / Matured Ever-paid Unit Cohort
Value Refund Rate = Refunded Amount / Original Paid Gross GMV of the Same Matured Cohort
```

这里的 `Matured` 表示订单年龄已经达到固定成熟窗口，不表示订单成熟时仍处于 Paid 状态。已经退款的订单、件数和原始支付额仍保留在各自分母中；分子与分母必须来自同一 ever-paid Cohort。三种口径回答不同问题，高价商品退款会显著影响 Value Refund Rate，但对 Order Refund Rate 的影响可能很小。

<a name="sec-4-3"></a>

### 4.3 漏斗指标应保留无行为用户

如果策略改变了商品点击概率，只在点击用户中计算购买率会对 Treatment 产生后处理条件化。主业务结论更适合使用：

```text
Paid Buyers per Eligible User
Paid Orders per Eligible User
Mature Net GMV per Eligible User
```

Click-to-Pay CVR 可用来诊断点击后的质量，但不应单独代表策略的总增量。

---

<a name="sec-5"></a>

## 5. Gross GMV、Net GMV 与商业价值

<a name="sec-5-1"></a>

### 5.1 状态化 GMV

| 指标 | 推荐定义 | 不应混入的内容 |
|---|---|---|
| Created GMV | 已创建订单的商品金额 | 未创建成功的 Checkout |
| Paid Gross GMV | 支付成功时的商品金额 | 未支付订单 |
| Fulfilled GMV | 已完成约定履约状态的金额 | 未发货或已取消金额 |
| Mature Net GMV | 固定成熟窗口后保留的支付金额 | 已取消金额、全额和部分退款金额 |

当 Paid Gross GMV 已排除未支付订单时，不能再扣除支付前取消金额。净额应来自互斥的订单行状态或明确的金额字段，避免重复扣减。

<a name="sec-5-2"></a>

### 5.2 Net-to-Gross 与成熟曲线

```text
Net-to-Gross Ratio
= Mature Net GMV / Paid Gross GMV of the Same Order Cohort
```

按支付日建立 Order Cohort，并计算订单年龄 1、7、14、30 天的累计净额，可以观察取消退款曲线何时趋于稳定：

| Order Age | Gross GMV | Cumulative Cancel / Refund | Net-to-Gross |
|---:|---:|---:|---:|
| D1 | 1,000,000 | 40,000 | 96.0% |
| D7 | 1,000,000 | 90,000 | 91.0% |
| D30 | 1,000,000 | 120,000 | 88.0% |

不同实验组必须在相同 Order Age 比较，不能用 Treatment 的 D7 净额对比 Control 的 D30 净额。

<a name="sec-5-3"></a>

### 5.3 Revenue、Take Rate 与 Margin

```text
Mature Transaction Revenue = Commissions + Transaction Fees - Transaction Revenue Reversals
Transaction Take Rate = Mature Transaction Revenue / Mature Net GMV of the Same Order Cohort
Aligned Total Platform Revenue = Mature Transaction Revenue + Window-aligned Advertising Revenue + Window-aligned Other Revenue
Contribution Margin = Aligned Total Platform Revenue - Variable Costs - Subsidies - Fulfillment Support
```

广告收入单列，因为它不属于交易 Take Rate 的分子。计算 Total Revenue 或 Margin 时，各收入与成本项必须使用同一 Eligible Population、币种和报告窗口，并为延迟回流项声明成熟规则。GMV 上升不一定意味着 Revenue 或 Margin 上升，例如策略可能更多推荐高补贴、低抽佣或高售后成本的商品。

<a name="sec-5-4"></a>

### 5.4 常用商业指标

| 指标 | 公式 | 业务含义 |
|---|---|---|
| AOV | `Paid Gross GMV / Paid Orders` | 每单支付金额 |
| Units per Order | `Paid Units / Paid Orders` | 每单商品件数 |
| GMV per Buyer | `Paid Gross GMV / Paid Buyers` | 购买用户交易深度 |
| GMV per Eligible User | `Paid Gross GMV / Eligible Users` | 覆盖购买渗透与客单价 |
| Net GMV per Eligible User | `Mature Net GMV / Eligible Users` | 更接近真实保留交易价值 |
| Total Revenue per Eligible User | `Aligned Total Platform Revenue / Eligible Users` | 同一报告窗口下的平台总收入效率 |
| Margin per Eligible User | `Contribution Margin / Eligible Users` | 扣除可变成本后的业务价值 |

金额指标通常长尾且零值很多，应同时报告均值、置信区间、零值占比、P50 / P90 / P99 和 Top Share。

---

<a name="sec-6"></a>

## 6. Metric Tree｜指标树

<a name="sec-6-1"></a>

### 6.1 统一交易树

以下恒等式描述单个入口的触点归因漏斗。只有在订单归因互斥，且分子、分母、订单 Cohort、订单年龄、币种和去重规则完全对齐时，入口分项才能与全局交易额核对：

```text
Surface-attributed Paid Gross GMV per Eligible User
= Impressions per Eligible User
  × Product Clicks per Impression
  × Paid Orders per Product Click
  × Paid Gross GMV per Paid Order
```

```text
Surface-attributed Mature Net GMV per Eligible User
= Surface-attributed Paid Gross GMV per Eligible User
  × Mature Net GMV / Paid Gross GMV of the Same Matured Ever-paid Cohort
```

这个分解是乘法恒等式，不表示各因子彼此独立。CTR 上升可能改变点击用户构成，进而让 Click-to-Pay CVR 下降。

<a name="sec-6-2"></a>

### 6.2 短视频指标树

```text
Short-video-attributed Mature Net GMV per Eligible User
├─ Video Impressions per User
├─ Product-entry Impressions per Video Impression
├─ Product Clicks per Product-entry Impression
├─ Paid Orders per Product Click
└─ Mature Net GMV per Paid Order
```

观看指标作为机制与体验诊断：

```text
Watch Time per Eligible User
= Video Starts per User × Watch Time per Start
```

<a name="sec-6-3"></a>

### 6.3 直播指标树

```text
Live-attributed Mature Net GMV per Eligible User
├─ Live-card Impressions per User
├─ Qualified Room Entries per Live-card Impression
├─ Product-module Impressions per Qualified Entry
├─ Product Clicks per Product-module Impression
├─ Paid Orders per Product Click
└─ Mature Net GMV per Paid Order
```

应在树旁同时监控在线房间供给、可售商品覆盖、状态新鲜度和缺货曝光，否则前端漏斗变化可能只是候选可用性变化。

<a name="sec-6-4"></a>

### 6.4 商城指标树

```text
Mall-attributed Mature Net GMV per Eligible User
├─ Product-card Impressions per User
├─ Product Clicks per Impression
├─ Surface-attributed Paid Orders per Product Click
└─ Mature Net GMV per Paid Order
```

PDP-to-ATC、ATC-to-Checkout 和 Checkout-to-Pay 作为诊断分支单独观察；若混用事件数、Session 数和订单数，它们不能直接嵌入同一个乘法恒等式。

<a name="sec-6-5"></a>

### 6.5 搜索指标树

```text
Search-attributed Mature Net Value per Eligible Searcher
├─ Eligible Queries per Searcher
├─ Queries with at least one Viewable Result per Eligible Query
├─ Product Clicks per Query with Results
├─ Paid Orders per Product Click
└─ Mature Net Value per Paid Order
```

Zero-result、Query Reformulation、Search Exit、Constraint Violation 和结果相关性是树旁的关键诊断。若模型会改变 Query 数量，上式的第一项也是 Treatment 机制的一部分，不能只在产生 Query 的用户中比较后续条件率。

<a name="sec-6-6"></a>

### 6.6 创作者选品与合作指标树

```text
Mature Net Value per Eligible Creator
├─ Eligible Opportunities per Creator
├─ Viewable Opportunity Impressions per Opportunity
├─ Accepted Opportunities per Impression
├─ Published Content per Accepted Opportunity
├─ Buyer Impressions per Published Content
├─ Paid Orders per Buyer Impression
└─ Mature Net Value per Paid Order
```

该树跨越供给形成和买家交易，常有数天或数周延迟。Acceptance 与 Publication 可能被 Treatment 改变，只适合解释机制；总效果应保留零接受、零发布和零交易的 Eligible Creator。若同一买家或订单接触多个创作者—商品关系，价值分支必须使用预先声明的互斥 Credit；无法排他去重或买家侧混流明显时，应在能覆盖干扰边界的设计上报告全局价值，而不是相加关系归因。还需同步观察创作者产能、样品履约、库存与集中度。

<a name="sec-6-7"></a>

### 6.7 跨渠道贡献树

```text
Incremental Contribution per Eligible Unit
= (
    Incremental Mature Transaction Revenue
    + Incremental Window-aligned Other Revenue
    - Incremental Advertising Cost
    - Incremental Commission and Subsidy
    - Incremental Variable Cost
  ) / Number of Eligible Units
```

这是同一随机化单位和报告窗口上的增量分解，不是把各渠道的归因报表相加。各项必须使用统一币种、成熟窗口和去重订单；自然流量下降、重复触达增加或成本上升都可能抵消某个渠道表面的归因增长。

<a name="sec-6-8"></a>

### 6.8 加法分解用于定位来源

如果一个入口包含多个模块或召回通道，总体变化也可以按不重叠来源做加法分解：

```text
Total Net GMV
= Net GMV from Module A
  + Net GMV from Module B
  + Net GMV from Other Modules
```

加法分解要求订单归因互斥；若一个订单允许多触点同时记功，分项之和会超过总体。

---

<a name="sec-7"></a>

## 7. 用户体验与长期价值

<a name="sec-7-1"></a>

### 7.1 短期体验

| 场景 | 正向指标 | 负向或平衡指标 |
|---|---|---|
| 短视频 | Qualified View、Watch Time、Save、Product Click | Fast Skip、Negative Feedback、重复内容率 |
| 直播 | Qualified Entry、Watch Time、Product Click | Quick Exit、Unfollow、下线房间曝光 |
| 商城 | PDP、ATC、Purchase、Discovery | Bounce、无结果、缺货曝光、重复商品 |
| 搜索与类目 | Constraint-satisfied Result、PDP、Purchase | Zero-result、Reformulation、Search Exit、约束违规 |
| 详情页与橱窗 | Content Consumption、Attach、Purchase | 错误商品绑定、重复 Offer、Page Exit、人工覆盖失真 |
| 创作者选品与合作 | Acceptance、Publication、Repeat Collaboration | 样品未履约、创作者过载、合作机会集中 |
| 跨渠道协同 | Deduplicated Reach、Incremental Contribution | 重复触达、自然流量蚕食、成本与频次上升 |

<a name="sec-7-2"></a>

### 7.2 留存与复购

| 指标 | 推荐定义 |
|---|---|
| D7 Visit Retention | Day 0 Cohort 中在第 7 天再次访问的用户占比 |
| D1–D7 Cumulative Retention | Day 0 Cohort 中第 1 至第 7 天至少返回一次的用户占比 |
| Rolling D7 Retention within H | Day 0 Cohort 中第 7 天至固定观察终点 H 至少返回一次的用户占比 |
| D30 Buyer Retention | 首购买家条件诊断；必须注明是第 30 天再次购买、D1–D30 至少复购一次，还是以第 30 天为起点的 Rolling Retention |
| Repeat Purchase Rate | 首购买家中固定窗口内至少产生第二次成熟购买的比例；若 Treatment 改变首购，只作条件机制诊断 |
| Time to Next Purchase | 首购到下一次成熟购买的条件时间分布；未复购者按完整随访或生存口径处理 |

若 Treatment 会改变谁完成首次购买，首购买家 Cohort 是处理后集合，上述买家指标不能作为端到端因果主结果。主分析应报告每 Assigned Eligible User 的 T-day Second-mature-purchase Incidence 或 Retained Buyer Value；也可以在实验开始前已形成的固定 Buyer Cohort 上研究复购。

Exact、Cumulative 与 Rolling 留存回答的问题不同。令 `r_d` 为 Day-0 Cohort 在第 `d` 天发生 Return Event 的 Exact Retention，则前 `N` 天的期望活跃天数可写成：

```math
EAD_N=1+\sum_{d=1}^{N}r_d
```

这里的 `1` 是 Day 0；`EAD_N` 表示固定窗口内的 Expected Active Days，不是无限期用户生命周期价值。Rolling Retention 还必须声明观察终点 `H`，否则较早 Cohort 天然拥有更长的返回机会。

留存需要固定 Cohort 定义、Day 0 Event、Return Event、市场时区和资格人群。固定 Cohort Retention 的原始分母不会因为低活用户离开而机械缩小；真正会产生幸存者偏差的是只分析当前仍活跃者，或在 Treatment 后重新定义分析人群。人群构成变化仍可能改变不同 Cohort 之间的总体留存，因此应同时报告固定 Cohort 的分层结果，并把 Cohort Retention 与 Eligible Population、Active Users、活跃频次和消费深度联合解释。

<a name="sec-7-3"></a>

### 7.3 代理指标的边界

观看、点击和加购反馈快、统计功效高，但只是长期价值的代理。一个代理指标只有在以下条件下才更可信：

- 与目标价值存在稳定机制联系；
- 过去实验中对长期结果有可复现的预测关系；
- 不容易被展示方式或自动播放直接 Gaming；
- 与退款、投诉、留存等护栏共同使用；
- 通过长期 Holdout 定期重新验证。

<a name="sec-7-4"></a>

### 7.4 活跃用户与场景渗透

DAU、WAU 与 MAU 都需要先定义什么行为算作 `Active Event`。打开应用、收到一次服务端返回、看到一次可见结果、完成一次有效消费或产生一次购买意图，对应完全不同的活跃含义。一个可复现的定义至少包含：身份去重键、Active Event、资格人群、自然日或滚动窗口、市场时区，以及机器人和异常流量规则。

```text
DAU
= Users with at least one predefined Active Event in the market day

Surface Penetration
= Eligible Platform Active Users with at least one qualified event on the surface
  / Eligible Platform Active Users
```

场景渗透率适合回答“合格活跃用户中有多少使用了这个决策面”，但它把分析限定在已经活跃的人群中，通常是描述性指标。若策略本身会改变平台活跃，实验主结果仍应从随机化时定义的 Eligible Users 出发，同时报告总 Active Users、场景 Reach 和每 Eligible User 的有效消费，避免只把流量从一个入口搬到另一个入口后误判为增长。

同一用户可以在短视频商品内容、直播、商城、搜索和商品详情页同时活跃，因此各场景 Active Users 之和通常大于全局去重 Active Users。跨场景分析应同时报告 User Union、Pairwise Intersection、仅在单一场景活跃的人群与迁移矩阵；渗透率增长既可能来自该场景分子增加，也可能来自全局活跃分母下降。

<a name="sec-7-5"></a>

### 7.5 跨场景消费权衡

用户的时间和购买意图有限，一个入口的消费提升可能来自另一个入口的下降。例如，短视频商品内容的观看增加，可能减少直播进房或商城浏览；搜索点击增加，也可能只是替代原本会直接打开商品详情页的路径。入口内 CTR 或 Watch Time 用于定位机制，整体决策必须回到与随机化单位和实验前 Eligibility 一致的去重总结果。用户级随机化时以 `per Assigned Eligible User` 为主；Session 或 User-day 只有在资格预先固定，或其本身就是随机化单位时，才能作为目标量，否则只作诊断并按用户层级处理相关性。

若同时关心多个结果，可以先检查 Pareto 关系：只有依据预声明的非劣界值和联合置信区间，方案 A 在成熟交易、有效消费和关键护栏上都不差于方案 B，且至少一个维度更好，A 才构成 Pareto 改善。Guardrail 通常是硬约束，不能被其他正向指标抵消。若非护栏指标有升有降，需要预先声明业务效用或容忍边界，例如：

```math
\Delta U=\sum_{j=1}^{J}w_j\Delta m_j
```

不同量纲的 `m_j` 应先标准化，或把 `w_j` 明确定义成带单位的效用换算。权重是产品治理选择，不是从相关性自动推导出的因果“兑换率”；`Delta U` 的标准误还必须包含各指标估计之间的协方差。历史实验可以估计局部 Trade-off Frontier，并给出不确定性区间，但不能把“1 次阅读等于若干秒观看”当作跨人群、跨市场和跨时期恒定的自然规律。最终还应报告每 Eligible User 的总有效消费、成熟净价值、留存和负反馈，识别真正增量与跨场景蚕食。

---

<a name="sec-8"></a>

## 8. 推荐模型与阶段指标

<a name="sec-8-1"></a>

### 8.1 召回

| 指标 | 含义 | 常见误区 |
|---|---|---|
| Recall@K | 正样本是否出现在 Top-K 候选 | 测试正样本受历史曝光偏置影响 |
| Hit Rate@K | 用户是否至少命中一个正样本 | 不反映多个相关商品的覆盖 |
| Channel Coverage | 召回通道覆盖的用户、商品与商家 | 覆盖高不等于增量高 |
| Unique Contribution | 去除某通道后损失的高价值候选 | 需要控制候选配额与重复 |
| ANN Recall@K | 近似检索对精确近邻的保留率 | 与推荐标签 Recall@K 不是同一指标 |

<a name="sec-8-2"></a>

### 8.2 粗排

粗排的目标是用受限计算保留精排真正需要的高价值候选。

| 指标 | 含义 |
|---|---|
| Full-rank Top-K Retention | 精排 Top-K 中有多少被粗排保留 |
| Teacher NDCG / Rank Correlation | 粗排对精排 Teacher 顺序的逼近程度 |
| Business-weighted Retention | 高价值正样本被保留的比例 |
| Candidates to Ranking | 进入精排的候选数量 |
| P95 / P99 Latency | 粗排尾延迟 |

<a name="sec-8-3"></a>

### 8.3 精排与多任务预测

| 类型 | 常见指标 | 解释重点 |
|---|---|---|
| Discrimination | AUC、PR-AUC、GAUC | 是否区分正负样本；不等于概率准确 |
| Ranking | NDCG@K、MRR、Pairwise Accuracy | 是否把更相关或更高价值候选排前 |
| Probability Quality | Log Loss、Brier Score | 概率预测误差 |
| Calibration | ECE、Reliability by Bucket | 预测概率能否解释为发生频率 |
| Multi-task | CTR、ATC、CVR、Refund 各任务指标 | 检查任务间负迁移和稀疏任务退化 |
| Value Ranking | Expected GMV / Net Value NDCG | 标签需处理金额长尾和成熟延迟 |

<a name="sec-8-4"></a>

### 8.4 重排与列表质量

| 指标 | 定义示例 | 风险 |
|---|---|---|
| Intra-list Diversity | Top-K 商品两两差异的平均值 | 多样性高不等于相关性高 |
| Category / Seller Coverage | Top-K 中去重类目或商家数 | 容易被低质量填充抬高 |
| Duplicate Rate | 重复或近重复商品占比 | 需要定义 SKU、SPU 和内容级重复 |
| Novel-item Share | 新品曝光占比 | 同时检查点击、购买和退款质量 |
| Constraint Violation Rate | 违反库存、安全或频控约束的列表占比 | Hard Constraint 应接近零 |

离线指标用于筛选上线候选和定位问题，线上增量仍需由可信实验验证。

---

<a name="sec-9"></a>

## 9. 商品、商家、创作者与实时供给生态

<a name="sec-9-1"></a>

### 9.1 有效供给

| 指标 | 稳定定义示例 |
|---|---|
| Eligible SKU Count | 满足可售、库存、配送、安全和市场条件的 SKU 数 |
| In-stock Rate | 有库存 Eligible SKU / 全部目标 SKU |
| OOS Impression Rate | 缺货商品可见曝光 / 商品可见曝光 |
| Valid-price Rate | 展示价格与结算可用价格一致的商品占比 |
| Active Seller Count | 统计窗口内拥有有效可售商品的商家数 |
| Eligible Live Room Count | 当前在线且允许分发的直播间数 |
| Live Product Coverage | 至少一个可售挂载商品的 Eligible Live Rooms 占比 |
| Feature Freshness | 房间状态、商品和库存特征的 Age 分布 |

**覆盖率为什么只看 Eligible 供给。** 某时刻共有 100 个直播间，其中 40 个已下线或没有可售商品，剩余 60 个才是 Eligible；如果 30 个获得曝光，覆盖率应按 30 / 60 解读。用全部 100 个房间作分母会把候选不可用误诊为推荐覆盖不足。

<a name="sec-9-2"></a>

### 9.2 曝光与成交覆盖

| 指标 | 公式 |
|---|---|
| SKU Exposure Coverage | `Exposed Eligible SKUs / Eligible SKUs` |
| Seller Exposure Coverage | `Exposed Eligible Sellers / Eligible Sellers` |
| Seller Transaction Coverage | `Sellers with Mature Orders / Eligible Sellers` |
| New-item Exposure Share | `New-item Viewable Impressions / All Viewable Impressions in the same surface and window`；描述流量分配，不等于供给覆盖 |
| T-day New-item Quality Attainment | 随机化或入组时固定的 Eligible New-item Cohort 中，截至 T 日达到预声明质量门槛的比例；未探索对象仍保留在分母 |
| T-day First-qualified-exposure Incidence | 固定 Eligible Cohort 中，截至 T 日至少获得一次合格曝光的比例；同时报告 Survival Curve 或 Restricted Mean Waiting Time |
| T-day First-mature-order Incidence | 固定 Eligible Cohort 中，订单发生窗 T 内至少产生一笔订单，且该订单已完整观察售后成熟窗 M 的对象占比；完整观察满 T+M 仍未成交者保留在分母并记为未发生 |

`Explored New Items reaching Quality Threshold / Explored New Items` 可以保留为策略机制诊断，但 `Explored` 是策略改变后的集合，不能单独解释为端到端因果效果。类似地，只对“最终获得曝光或成交”的商品计算平均等待时间会丢掉最困难的对象；固定窗口累计发生率或受限平均等待时间才会保留这些对象。成交指标必须同时声明订单发生窗 `T`、取消与退款成熟窗 `M` 和 Data Freeze Date；只有随访不足时才在最后可观察时点右删失，Treatment 导致的下架或缺货应作为未成交结果或预声明的 Competing Event 处理。

<a name="sec-9-3"></a>

### 9.3 集中度与分布

| 指标 | 含义 |
|---|---|
| Top 1% / 10% Exposure Share | 头部商品或商家获得的流量占比 |
| Top 1% / 10% Net GMV Share | 头部商品或商家获得的成熟交易占比 |
| HHI | 各供给主体流量份额平方和，对头部集中更敏感 |
| Gini | 整体分配不均衡程度 |
| Seller P50 / P90 / P99 Exposure | 商家层曝光分布 |
| Zero-exposure Share | Eligible 但零曝光的商品或商家占比 |

“更平均”不是自动目标。供给指标应在质量、可售机会和用户需求相近的条件下解释。建议同时查看：

- Opportunity：有多少符合用户需求的可售机会；
- Exposure：系统实际给予多少曝光；
- Outcome：点击、成熟订单和留存；
- Quality：履约、取消退款、投诉与安全。

<a name="sec-9-4"></a>

### 9.4 创作者合作与内容供给

| 指标 | 诊断意义 |
|---|---|
| Eligible Creator Count | 有多少创作者满足市场、类目、质量与合作资格 |
| Creator–Product Opportunity Coverage | 入组时固定的 Eligible Relation Cohort 中有多少获得至少一次合格推荐机会 |
| Active Publisher Rate | 入组时固定的 Eligible Creator Cohort 中，窗口内达到预声明活跃门槛，例如至少 K 次合格发布的主体占比；K 应在分析前固定 |
| T-day First-content Incidence | 从 Point-in-time Eligible Creator Cohort 出发，截至 T 日至少发布一次合格内容的比例 |
| Restricted Mean Waiting Time to Content | 对完整观察满 T 的 Cohort，未发布者以 T 计入；随访不足者按 Survival 方法处理，受 Treatment 影响的退出不能默认作非信息性删失 |
| Repeat Collaboration Rate | 首次合作后再次合作的条件机制诊断；首次合作是 Treatment 可能改变的处理后事件 |
| T-day Creator Second-collaboration Incidence | 每个 Assigned Eligible Creator 截至 T 日跨商品形成第二次合格合作的比例 |
| T-day Relation Repeat-collaboration Incidence | 每个 Assigned Eligible Creator–Product Relation 截至 T 日在同一关系内形成再次合作的比例 |
| Creator Concentration | 曝光、合作或成熟交易是否过度集中于少数创作者 |
| Content-to-Product Binding Quality | 发布内容与目标商品是否准确、可审计地绑定 |

合作接受率高而内容发布率不变，可能说明推荐只优化了低成本的早期动作。应从 Eligible Creator 或 Match Unit 开始保留完整漏斗，并将内容质量、买家曝光、成熟交易和售后结果连接回同一合作关系。Creator-level 与 Relation-level 指标必须分别对齐实际随机化单位，不能混用分母。

<a name="sec-9-5"></a>

### 9.5 商家质量与可持续性

| 指标 | 诊断意义 |
|---|---|
| Seller Cancellation / Refund Rate | 交易质量和供给可靠性 |
| On-time Fulfillment Rate | 履约稳定性 |
| Seller Retention | 商家是否持续提供有效供给 |
| New-seller Cold-start Success | 新商家能否获得有效反馈并形成成熟交易 |
| Seller Revenue Volatility | 流量与收入是否过度不稳定 |
| Complaint / Policy Violation Rate | 生态与安全风险 |

---

<a name="sec-10"></a>

## 10. 实验中的指标角色

| 角色 | 回答的问题 | 典型示例 |
|---|---|---|
| Overall Evaluation / Primary | 策略是否实现核心目标 | Mature Net GMV per Eligible User、Qualified Watch Time per User |
| Secondary | 是否改善其他重要结果 | Paid Buyers、Orders、Revenue、Retention Proxy |
| Diagnostic | 为什么发生变化 | Impression、CTR、Entry Rate、ATC、AOV、Net-to-Gross |
| Guardrail | 哪些目标不能恶化 | Refund、Cancellation、Quick Exit、Seller Concentration、Latency |
| Data Quality | 结果是否可信 | SRM、Missing Log Rate、Join Rate、Duplicate Rate、Exposure Coverage |

<a name="sec-10-1"></a>

### 10.1 一个精排实验的指标组合

| 层级 | 示例 |
|---|---|
| Primary | Mature Net GMV per Eligible User |
| Secondary | Paid Buyers per User、Qualified Watch Time per User |
| Funnel Diagnostics | Viewable Impressions、Product CTR、ATC、Click-to-Pay CVR、AOV |
| Order-quality Guardrails | Cancellation、Value Refund Rate、Net-to-Gross |
| Buyer Guardrails | Fast Skip、Quick Exit、Negative Feedback、Retention Proxy |
| Supply Guardrails | Seller Coverage、New-item Share、Top Seller Exposure Share |
| System Guardrails | Request Success、P95 / P99 Latency、Timeout Rate |
| Data Quality | SRM、Treatment Leakage、Order Join Rate、Metric Maturity |

<a name="sec-10-2"></a>

### 10.2 决策不是“Primary 显著即可”

```text
Primary 有实际意义的提升
+ 置信区间排除不可接受损失
+ 核心护栏安全
+ 关键市场、人群和入口无严重退化
+ 订单结果达到所需成熟度
+ 系统容量可承受
→ 才是可放量候选
```

---

<a name="sec-11"></a>

## 11. Ratio Metrics 与聚合口径

<a name="sec-11-1"></a>

### 11.1 Ratio of Sums

```text
Global CTR = Sum(Clicks) / Sum(Impressions)
```

它估计“随机一次曝光被点击的概率”，高曝光用户拥有更高权重。

<a name="sec-11-2"></a>

### 11.2 Mean of User-level Ratios

```text
User-average CTR
= Mean over users(Clicks per User / Impressions per User)
```

它估计“随机一位有曝光用户的 CTR”，每位进入计算的用户权重相同。必须定义零曝光用户是否排除；如果 Treatment 改变用户是否获得曝光，排除零曝光用户可能造成后处理选择。

<a name="sec-11-3"></a>

### 11.3 Per-user Outcome

```text
Clicks per Eligible User = Sum(Clicks) / Eligible Users
Mature Net GMV per Eligible User = Sum(Mature Net GMV) / Eligible Users
```

这类指标通常更适合用户级随机实验的总效果，因为它保留零点击、零购买用户并与随机化单位对齐。

<a name="sec-11-4"></a>

### 11.4 一个例子

| User | Impressions | Clicks | CTR |
|---|---:|---:|---:|
| A | 1,000 | 100 | 10% |
| B | 10 | 5 | 50% |

```text
Ratio of Sums = 105 / 1,010 = 10.40%
Mean of User Ratios = (10% + 50%) / 2 = 30.00%
```

两个数字都可能正确，但对应不同 Estimand。指标契约必须在看结果前确定选择。

<a name="sec-11-5"></a>

### 11.5 Ratio Metric 的推断

分子和分母通常相关，不能把最终比率当成普通独立均值直接套用错误标准误。常见方法包括：

- Delta Method；
- Cluster Bootstrap；
- Cluster-robust Standard Error；
- 以随机化单位聚合后的线性化指标。

用户级随机实验应保留同一用户内部的所有曝光、点击和订单相关性。具体推断方法见 [A/B Testing](./ab-testing.md)。

---

<a name="sec-12"></a>

## 12. 异质性与分布分析

<a name="sec-12-1"></a>

### 12.1 预设分群

| 维度 | 推荐切片 |
|---|---|
| Buyer | 新老、活跃度、购买历史、价格偏好、兴趣宽度 |
| Surface | 内容、直播、商城、搜索与类目、详情页与橱窗、供给匹配、跨渠道及具体模块和位置 |
| Query / Page | Head/Tail Query、约束数量、筛选器、PDP/Storefront、模块位置 |
| Supply | 类目、价格带、品牌、新品、库存深度、创作者与商家规模 |
| Match / Channel | Creator–Product、Seller–Creator、自然/联盟/付费、预算与活动层级 |
| Quality | 履约等级、历史取消退款、商品和内容质量 |
| Environment | 市场、语言、设备、网络、版本、活动期 |

异质性结论应比较 Treatment Effect 本身，而不是“一个分群显著、另一个不显著”。后者并不等于两个分群的效果显著不同。正式比较需要交互项、差异检验或预先定义的 Heterogeneous Treatment Effect 方法。

<a name="sec-12-2"></a>

### 12.2 分布指标

均值无法完整描述长尾、零膨胀和集中度。建议按指标类型配套查看：

| 指标类型 | 配套分布统计 |
|---|---|
| Watch Time / Session Depth | Zero Share、P50、P90、P99、截尾前后均值 |
| GMV / Orders per User | Buyer Rate、条件均值、P99、Top 1% Share |
| Seller Exposure / GMV | Zero Share、P50、P90、Gini、HHI、Top Share |
| Latency | P50、P95、P99、Timeout Rate |
| Refund Delay | Cumulative Curve by Order Age |

<a name="sec-12-3"></a>

### 12.3 Winsorization 与日志变换

长尾处理必须预先定义并保留原始业务总量：

- Winsorization 可降低极端值对方差的影响，但改变估计目标；
- `log(1 + value)` 有助于诊断相对变化，但其均值不能直接解释为原始金额；
- 删除“大额异常用户”前需要可审计规则，不能根据 Treatment 结果临时设阈值；
- 建议同时报告原始值、稳健估计和受影响样本占比。

---

<a name="sec-13"></a>

## 13. 归因、成熟窗口与数据质量

<a name="sec-13-1"></a>

### 13.1 Attribution Window 与 Maturity Window

```text
Attribution Window
= 推荐触点之后，订单仍可与该触点建立描述性关联的最长时间

Maturity Window
= 支付之后，等待取消、退货和退款结果充分回流的时间
```

两者不能互换。一个订单可以在 7 日点击归因窗口内产生，但需要 30 日才能形成 Mature Net GMV。

<a name="sec-13-2"></a>

### 13.2 跨入口重复归因

用户可能先看短视频，再进入直播间，最后从商城完成购买。建议同时维护：

- 一个全局去重的订单总量；
- 一套明确且互斥的 First-touch 或 Last-touch 归因；
- 可保留多触点的路径表，但分项不得与全局总量直接相加；
- 在线实验的 Intent-to-Treat 主结果，不依赖主观触点权重。

Attribution 描述路径，不自动证明因果贡献。

<a name="sec-13-3"></a>

### 13.3 数据质量指标

| 层级 | 指标 |
|---|---|
| Assignment | SRM、Cross-over、Treatment Leakage |
| Request | Request Coverage、Empty Result Rate、Timeout Rate |
| Exposure | Served-to-Rendered、Rendered-to-Viewable、Position Completeness |
| Behavior | Click without Impression、Duplicate Event Rate、Event Delay |
| Commerce | Order Join Rate、Missing Payment Status、Currency Coverage |
| Maturity | Mature Order Share、Refund Backfill Completeness |
| Supply | Room State Freshness、Inventory Freshness、Price Consistency |

<a name="sec-13-4"></a>

### 13.4 去重键与时间

推荐链路常用：

- `request_id`：一次推荐请求；
- `impression_id`：一次可追踪曝光；
- `event_id`：客户端行为去重；
- `order_id` 与 `order_line_id`：订单和部分退款；
- 事件时间、接收时间与处理时间：诊断延迟和乱序；
- 入口、位置、内容、直播间、商品、SKU 和商家标识。

---

<a name="sec-14"></a>

## 14. 常见诊断模式与陷阱

<a name="sec-14-1"></a>

### 14.1 常见模式

| 观察结果 | 可能机制 | 下一步诊断 |
|---|---|---|
| CTR 上升，Paid Buyers 不变 | 吸引了更多低意图点击 | Click-to-Pay、PDP Dwell、价格带和新老用户 |
| Gross GMV 上升，Net GMV 不变 | 取消退款或补贴成本上升 | Net-to-Gross、Value Refund、Margin |
| 直播进房率上升，观看时长下降 | 卡片与房间实际内容不匹配 | Quick Exit、房间状态、主播和类目切片 |
| 视频 Watch Time 上升，商品点击下降 | 内容更吸引但商品连接变弱 | Product-entry Exposure、Product CTR、内容商品一致性 |
| 商城 CTR 下降，Paid CVR 上升 | 点击更少但意图更强 | Paid Buyers per User、Net GMV per User，不要只看 CTR |
| Overall 提升，某市场明显下降 | 效果存在异质性 | 交互检验、供给密度、版本和延迟 |
| Seller Coverage 上升，退款恶化 | 低质量供给被过度探索 | 质量条件覆盖、履约和退款分群 |

<a name="sec-14-2"></a>

### 14.2 常见陷阱

1. **分母漂移**：同名指标在不同 Dashboard 使用 Impression、Click 或 User 分母。
2. **曝光定义变化**：Served 改成 Viewable 后，CTR 基线会机械变化。
3. **重复事件**：重试导致点击、订单或金额重复。
4. **后处理条件化**：只分析 Treatment 影响后的点击用户、进房用户或购买用户。
5. **右删失**：实验末期订单尚未经历完整退款窗口。
6. **跨入口重复记功**：同一订单同时进入短视频、直播和商城分项。
7. **汇率与时区不一致**：跨市场日指标无法对齐。
8. **辛普森悖论**：用户或市场构成变化掩盖分群内趋势。
9. **多重比较**：大量指标和切片中必然出现偶然显著结果。
10. **Metric Gaming**：突出入口提升点击、自动播放提升时长、高补贴提升 Gross GMV。

---

<a name="sec-15"></a>

## 15. 指标在实验生命周期中的使用

| 阶段 | 主要指标与检查 |
|---|---|
| Offline Evaluation | Recall、NDCG、Calibration、Top-K Retention、Coverage、Latency |
| Experiment Design | Metric Contract、MDE、Attribution、Maturity、Guardrail Threshold |
| A/A Testing | SRM、日志覆盖、指标校准、假阳性率、订单 Join |
| A/B Testing | Primary、Effect Size、Confidence Interval、Funnel、Guardrail、HTE |
| Ramp-up | Effect Stability、成熟结果、关键分群、尾延迟、库存与供给容量 |
| Full Rollout | Post-launch Regression、Data Quality、系统与生态监控 |
| Long-term Holdout | 复购、留存、Mature Net Value、商家和供给生态 |

同一个指标在不同阶段角色可能不同。例如 P99 Latency 在离线阶段是工程约束，在 A/B 中是 Guardrail，在大流量 Ramp-up 中则可能成为回滚触发条件。

---

<a name="sec-16"></a>

## 16. 工业案例：用指标树避免局部最优

以下数字均为示意值。案例中的重点不是判断某个数字“好或坏”，而是明确指标角色、分析单位以及指标之间的因果顺序。

<a name="sec-16-1"></a>

### 16.1 短视频商品内容：播放指标改善，商品漏斗收缩

- **发生什么**：自动播放优化使 Viewable Video Impressions per User 增加 12%，Watch Time per User 增加 6%；与此同时，商品入口可见曝光减少 8%，支付买家率下降 2%。
- **指标问题**：观看时长是内容体验代理指标，不能替代交易目标。曝光增加还可能来自播放口径变化，而不是推荐相关性提升。
- **正确分析**：固定 Eligible User 为分析单位，对比 Served、Viewable 和 Qualified 三层曝光；继续拆解商品入口可见率、商品点击率、支付率和成熟净订单价值，并检查事件版本是否在实验期间改变。
- **应监控指标**：Viewable Rate、Qualified View Rate、Watch Time per Eligible User、商品入口可见率、Product Clicks per Eligible User、Buyer Conversion、Mature Net Value、Fast Skip 和负反馈。

<a name="sec-16-2"></a>

### 16.2 直播内容：进房率提升来自无效房间

- **发生什么**：实验组进房率相对提升 9%，但 Valid-at-exposure Rate 从 99% 降至 94%，Quick Exit Rate 提升 16%，商品点击没有增长。
- **指标问题**：如果分母包含打分后已经下线或当前商品不可售的房间，进房和供给覆盖都会被错误解释；只报告进房率还会隐藏进入后的体验损失。
- **正确分析**：将打分时有效、曝光时有效和真正可进入分开记录；以随机化用户计算总效果，以有效曝光计算诊断率，并按状态延迟、类目和库存切片。有效曝光口径只能用于机制诊断，不能替代 ITT 结果。
- **应监控指标**：Eligible Live Room Count、Valid-at-score Rate、Valid-at-exposure Rate、Qualified Entry、Quick Exit、Product-panel View Rate、Buyer Conversion、状态特征延迟和 P99 服务延迟。

<a name="sec-16-3"></a>

### 16.3 商城商品卡：CTR 下降是否应阻止上线

- **发生什么**：商品卡 CTR 相对下降 6%，PDP-to-Pay 提升 12%，平均成熟净订单价值提升 8%，退款率从 9.0% 降至 7.8%。
- **指标问题**：如果把 CTR 设为唯一 Primary，系统会偏向容易获得点击的低价或夸张商品；如果只看 Gross GMV，又可能忽略退款和补贴成本。
- **正确分析**：在实验前约定一个用户级主指标，例如 Mature Net Value per Eligible User；将 CTR、PDP-to-Pay 和客单价作为漏斗诊断，将退款、延迟和供给集中度作为护栏。结论需等待订单经历完整成熟窗口。
- **应监控指标**：Product-card CTR、PDP-to-Pay、Paid Buyers per Eligible User、Gross GMV、Mature Net GMV、Net-to-Gross Ratio、退款率、Top Seller Share 和可售商品覆盖。

<a name="sec-16-4"></a>

### 16.4 搜索排序：CTR 上升但用户更频繁改写 Query

- **发生什么**：新模型让结果 CTR 相对提升 7%，但 Query Reformulation 从 14% 升至 21%，型号约束违规曝光增加，Mature Net Value per Searcher 没有改善。
- **指标问题**：热门商品更容易得到点击，却可能不满足用户当前 Query。点击提升既可能来自相关性，也可能来自标题吸引力、位置偏置或更宽松的候选过滤。
- **正确分析**：按 Head/Tail Query、属性约束、筛选器和零结果切片；同时检查召回覆盖、相关性、约束违规、改写、退出、支付与成熟交易。用户级实验结果负责判断总增量，Query 级指标负责定位机制。
- **应监控指标**：Zero-result Rate、Constraint Violation、NDCG、Product Clicks per Query、Reformulation、Search Exit、Paid Buyers per Searcher、Mature Net Value 和 P99 Latency。

<a name="sec-16-5"></a>

### 16.5 创作者选品：加入率上升但内容供给没有增加

- **发生什么**：推荐机会的加入率相对提升 15%，但 14 天 Active Publisher Rate 不变，首次内容发布时间变慢，合作机会进一步集中在头部商品。
- **指标问题**：加入或接受是长漏斗中的早期代理，可能由更高佣金或低承诺动作驱动；只分析已加入的创作者还会对 Treatment 产生后处理条件化。
- **正确分析**：以随机化 Eligible Creator 或预先确定的 Match Unit 评估发布、买家曝光和成熟交易；用 T-day 累计发布率与 Restricted Mean Waiting Time 描述发布速度，使观察期内未发布者仍留在分析中，并检查创作者产能、商品库存、佣金和机会集中度。
- **应监控指标**：Opportunity Coverage、Acceptance、T-day Cumulative Publisher Rate、Restricted Mean Waiting Time through T、Eligible Content Count、Mature Value per Eligible Creator、Match Concentration、库存与售后质量。

<a name="sec-16-6"></a>

### 16.6 跨渠道协同：归因交易增长但总增量不变

- **发生什么**：付费渠道归因 Gross GMV 增加 20%，但全渠道去重买家数不变，自然渠道交易下降，广告与补贴成本上升。
- **指标问题**：渠道归因把最后触点附近的订单记给一个渠道，不代表该渠道创造了订单；各渠道报表相加还可能重复计算同一买家或订单。
- **正确分析**：使用用户、商家或活动级 Holdout 估计全渠道增量；统一曝光、订单、成本、归因与成熟窗口，比较去重 Mature Net Value 和扣除广告、佣金及补贴后的贡献。
- **应监控指标**：Deduplicated Reach、All-channel Buyers、All-channel Mature Net Value、Organic Displacement、Duplicate Attribution、Incremental Contribution、Incremental Return on Spend 和频次护栏。

---

<a name="sec-17"></a>

## 17. 关联文档

- [E-commerce Recommendation Context](./ecommerce-recommendation-context.md)
- [Recommendation System Pipeline](./recommendation-system-pipeline.md)
- [Ranking](./ranking.md)
- [Re-ranking](./reranking.md)
- [Online Experiment Lifecycle](./online-experiment-lifecycle.md)
- [A/A Testing](./aa-testing.md)
- [A/B Testing](./ab-testing.md)
- [Ramp-up](./ramp-up.md)
