# 电商推荐系统笔记｜E-commerce Recommendation System Notes

<a name="top"></a>

这是一套面向工业实践的电商推荐知识库，覆盖内容与直播分发、商城与搜索、商品详情页与橱窗、供给匹配、跨渠道协同，以及相应的模型设计、指标体系、在线实验与发布决策。

不需要从头读到尾：先判断问题发生在候选、排序、列表、交易口径还是实验可信度，再进入对应专题。系统文档解释“哪里可能出问题”，模型文档解释“可以怎样建模”，指标与实验文档解释“如何证明改动真的有效”。

```text
Buyer / Creator / Seller Intent + Content / Live / Product Supply + Context
→ Retrieval → Pre-ranking → Ranking → Re-ranking
→ Viewable Exposure → Engagement → Product Action
→ Payment → Fulfillment → Cancellation / Refund
→ Measurement → Experiment → Ramp-up → Iteration
```

## 目录

- [主要推荐场景](#sec-1)
- [文档地图](#sec-2)
  - [推荐系统](#sec-2-1)
  - [指标与在线实验](#sec-2-2)
- [推荐阅读顺序](#sec-3)
  - [推荐建模与系统](#sec-3-1)
  - [指标、实验与发布](#sec-3-2)
- [核心决策链路](#sec-4)
- [工业案例入口](#sec-5)

---

<a name="sec-1"></a>

## 主要推荐场景

| 场景 | 推荐单元 | 主要前置行为 | 关键结果或约束 |
|---|---|---|---|
| 短视频商品内容 | 内容及其挂载商品 | 播放、有效观看、商品入口曝光与点击 | 内容—商品一致性、支付与成熟净交易 |
| 直播内容 | 在线直播间及当前商品 | 进房、有效观看、商品组件曝光与点击 | 房间状态、实时库存、支付与成熟净交易 |
| 商城与类目浏览 | 商品卡或商品集合 | 商品曝光、点击、PDP 与加购 | 可售性、购物效率、支付与复购 |
| 搜索 | Query–Product | Query、筛选、结果曝光、改写与点击 | 相关性、约束满足、零结果与支付 |
| 商品详情页与主体橱窗 | Product–Content、Product–Product 或主体商品集合 | 页面到访、模块曝光、内容消费或关联商品点击 | 精确绑定、替代/互补、人工陈列与成熟交易 |
| 创作者选品与合作匹配 | Creator–Product 或 Seller–Creator | 机会曝光、接受、样品、发布内容 | 供给形成速度、覆盖、集中度与长链路交易 |
| 跨渠道协同 | User–Product–Creative–Channel | 渠道分配、去重曝光、支付与成本 | 总增量、自然流量蚕食和扣成本贡献 |

这些场景共享商品、商家、订单和售后结果，但决策主体、有效反馈、实时性约束和指标分母不同。完整边界见[业务背景](./ecommerce-recommendation-context.md)，指标口径见[指标体系](./metrics.md)。

<a name="sec-2"></a>

## 文档地图

<a name="sec-2-1"></a>

### 推荐系统

| 文档 | 核心内容 |
|---|---|
| [业务背景](./ecommerce-recommendation-context.md) | 买家分发、搜索与详情页、供给匹配、跨渠道协同、订单状态与归因 |
| [系统总览](./recommendation-system-pipeline.md) | 端到端架构、阶段接口、数据闭环和异常排查 |
| [召回](./retrieval.md) | CF、Two-Tower、样本构造、ANN、实时索引与多路召回 |
| [粗排与精排](./ranking.md) | 计算预算、Cross Two-Tower、多任务预测、多目标价值与校准 |
| [特征交叉](./feature-interaction.md) | FM、DeepFM、DCN、xDeepFM 与 FiBiNET |
| [用户行为序列](./user-behavior-sequence.md) | LastN、DIN、DIEN、AUGRU 与 Transformer 序列模型 |
| [重排](./reranking.md) | MMR、DPP、Cholesky / MGS、位置约束、多样性和探索 |
| [冷启动](./cold-start.md) | 阶段化召回、Pacing、Bandit、实验干扰与探索流量设计 |
| [系统优化](./system-optimization.md) | 召回配额、Stage Funnel、模型迭代、系统诊断与优先级 |

<a name="sec-2-2"></a>

### 指标与在线实验

| 文档 | 核心内容 |
|---|---|
| [Metrics](./metrics.md) | 北极星与消费指标、活跃留存、多场景漏斗、Gross / Net GMV、Ratio Metrics、订单成熟与 Metric Tree |
| [Online Experiment Lifecycle](./online-experiment-lifecycle.md) | 从假设、离线证据到实验、发布和长期测量 |
| [A/A Testing](./aa-testing.md) | 随机化、SRM、日志链路和统计校准 |
| [A/B Testing](./ab-testing.md) | 实验设计、MDE、置信区间、Cluster Bootstrap、互斥与正交实验 |
| [Ramp-up](./ramp-up.md) | 放量阶段的效果稳定性、护栏、容量、分群和回滚 |

**遇到问题先看哪里**

| 现象或问题 | 优先阅读 | 为什么 |
|---|---|---|
| 好商品根本没有进入候选 | [召回](./retrieval.md)、[系统总览](./recommendation-system-pipeline.md) | 先区分 Eligible Pool、召回遗漏和 ANN 检索损失 |
| 搜索 CTR 提升但用户频繁改写 Query | [召回](./retrieval.md)、[指标体系](./metrics.md) | 检查 Query 约束、零结果、相关性、改写和最终支付，而不是只看点击 |
| 粗排吞掉了精排认为重要的商品 | [粗排与精排](./ranking.md) | 检查 Top-K Retention、Teacher 一致性和计算预算 |
| CTR 上升但支付或 Net GMV 没有改善 | [Metrics](./metrics.md)、[粗排与精排](./ranking.md) | 沿入口漏斗检查意图质量、校准、客单价和取消退款 |
| 列表里总是相似商品或头部商家 | [重排](./reranking.md)、[系统优化](./system-optimization.md) | 区分单商品分数与列表级多样性、覆盖和约束 |
| 新商品、新商家或新用户没有足够反馈 | [冷启动](./cold-start.md) | 使用内容表示、先验平滑和受控探索获得初始信号 |
| 创作者接受了商品但没有形成内容 | [业务背景](./ecommerce-recommendation-context.md)、[冷启动](./cold-start.md) | 沿机会、样品、发布、买家曝光和成熟交易定位供给链瓶颈 |
| 付费归因交易增长但全渠道买家没变 | [指标体系](./metrics.md)、[A/B Testing](./ab-testing.md) | 区分触点归因与因果增量，并检查自然流量蚕食和扣成本贡献 |
| 实验结果异常或分流不可信 | [A/A Testing](./aa-testing.md)、[A/B Testing](./ab-testing.md) | 先检查 SRM、日志、随机化和推断，再解释业务 Lift |
| 小流量有效，放量后效果或延迟恶化 | [Ramp-up](./ramp-up.md) | 检查流量构成、供给容量、尾延迟和效果稳定性 |

<a name="sec-3"></a>

## 推荐阅读顺序

<a name="sec-3-1"></a>

### 推荐建模与系统

1. [业务背景](./ecommerce-recommendation-context.md)
2. [系统总览](./recommendation-system-pipeline.md)
3. [召回](./retrieval.md)
4. [粗排与精排](./ranking.md)
5. 按需深入[特征交叉](./feature-interaction.md)与[用户行为序列](./user-behavior-sequence.md)
6. [重排](./reranking.md)
7. [冷启动](./cold-start.md)
8. [系统优化](./system-optimization.md)

<a name="sec-3-2"></a>

### 指标、实验与发布

1. [指标体系](./metrics.md)
2. [在线实验流程](./online-experiment-lifecycle.md)
3. [A/A Testing](./aa-testing.md)
4. [A/B Testing](./ab-testing.md)
5. [Ramp-up](./ramp-up.md)

阅读顺序不是模型上线顺序。例如短视频 Watch Time 上升但商品交易下降时，可以先从 [Metrics](./metrics.md) 定位漏斗，再回到[用户行为序列](./user-behavior-sequence.md)或[粗排与精排](./ranking.md)检查建模；不必先读完所有算法专题。

<a name="sec-4"></a>

## 核心决策链路

```text
业务问题和机制假设
→ 明确场景、决策单元与影响路径
→ 定义 Metric Contract、归因与成熟窗口
→ 验证候选、排序、重排和系统链路
→ 运行可信在线实验
→ 检查总体效果、漏斗、异质性、分布与护栏
→ Ramp-up 验证容量和效果稳定性
→ Rollout / Iterate / Rollback
```

---

<a name="sec-5"></a>

## 工业案例入口

各专题都提供可以从目录直接进入的工业案例。短视频商品内容、直播内容和商城商品卡是高频示例；搜索、详情页与橱窗、供给匹配和跨渠道协同用于补充不同意图、分母、反馈时延与干扰结构。示例数字仅用于演示推理方法。下表链接直接跳到各文件的案例章节，而不是只打开文件首页。

| 想理解的问题 | 案例入口 |
|---|---|
| 搜索、商品页/橱窗、创作者匹配与跨渠道协同 | [扩展推荐场景](./ecommerce-recommendation-context.md#sec-13) |
| 常见买家入口的业务对象、漏斗与误判 | [业务背景案例](./ecommerce-recommendation-context.md#sec-14) |
| 一次请求如何经过召回、粗排、精排和重排 | [系统总览案例](./recommendation-system-pipeline.md#sec-8) |
| 正负样本、难负样本、ItemCF、Swing 与多路召回 | [召回案例](./retrieval.md#sec-5-10) |
| 粗排与精排的模型选择、多任务预测与目标融合 | [粗排与精排案例](./ranking.md#sec-11) |
| 条件关系、稀疏特征交叉与模型选择 | [特征交叉案例](./feature-interaction.md#sec-11) |
| 短期行为、候选感知兴趣与兴趣漂移 | [用户行为序列案例](./user-behavior-sequence.md#sec-11) |
| 多样性、实时约束、替代品与互补品 | [重排案例](./reranking.md#sec-9) |
| 新内容、新直播场次、新商品与探索预算 | [冷启动案例](./cold-start.md#sec-9) |
| 全量训练、增量训练、在线学习与向量/索引一致性 | [模型更新专题](./system-optimization.md#sec-9-2) |
| 阶段瓶颈、放量容量与数据漂移 | [系统优化案例](./system-optimization.md#sec-10) |
| 指标树、成熟交易、漏斗与护栏 | [指标体系案例](./metrics.md#sec-16) |
| 随机化、SRM、互斥策略与增量解释 | [A/B Testing 案例](./ab-testing.md#sec-14) |
| 分流与日志是否足够可信 | [A/A Testing 案例](./aa-testing.md#sec-6) |
| 从假设到发布决策的完整流程 | [在线实验流程案例](./online-experiment-lifecycle.md#sec-15) |
| 小流量有效但放量后衰减的诊断 | [Ramp-up 案例](./ramp-up.md#sec-11) |
