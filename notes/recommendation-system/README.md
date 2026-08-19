# 电商推荐系统笔记｜E-commerce Recommendation System Notes

这是一套电商推荐系统双语知识库，覆盖推荐链路、商业指标、在线实验和上线决策。

```text
Buyer intent + Product/content supply + Context
→ Retrieval → Ranking → Re-ranking → Exposure
→ Click → PDP → ATC → Order → Payment / Refund
→ Metrics → Experiment → Ramp-up → Iteration
```

仓库包含两条互补主线：

```text
推荐系统建模
候选生成 → 召回学习 → 粗排/精排 → 列表重排
→ 冷启动与探索 → 系统诊断与持续优化

在线评估与发布
指标定义 → 实验准备 → A/A → A/B
→ Ramp-up → Full Rollout → Long-term Measurement
```

## 文档地图

### 推荐系统

| 文档 | 核心内容 |
|---|---|
| [电商推荐背景](./ecommerce-recommendation-context.md) | 业务对象、交易漏斗、分析框架和交付物 |
| [系统总览](./recommendation-system-pipeline.md) | 端到端架构、阶段接口、数据闭环和异常排查 |
| [召回](./retrieval.md) | CF、双塔、样本构造、ANN 与多路召回评估 |
| [粗排与精排](./ranking.md) | 多任务预测、多目标价值、校准与阶段瓶颈 |
| [特征交叉](./feature-interaction.md) | FM、DeepFM、DCN、FiBiNET |
| [用户行为序列](./user-behavior-sequence.md) | LastN、DIN、DIEN、短期意图与长期兴趣 |
| [重排](./reranking.md) | MMR、DPP、列表约束、多样性和探索 |
| [冷启动](./cold-start.md) | 新商品、新商家、新用户及探索流量设计 |
| [系统优化](./system-optimization.md) | 召回配额、模型迭代、诊断与优先级 |

### 指标与在线实验

| 文档 | 核心内容 |
|---|---|
| [Metrics](./metrics.md) | 用户、交易、推荐质量与生态指标，Metric Tree 和口径治理 |
| [Online Experiment Lifecycle](./online-experiment-lifecycle.md) | 从假设、离线评估到发布和长期测量 |
| [A/A Testing](./aa-testing.md) | 随机化、SRM、日志、指标链路和统计校准 |
| [A/B Testing](./ab-testing.md) | 实验设计、MDE、Cluster Bootstrap、异质性分析和 Readout |
| [Ramp-up](./ramp-up.md) | 放量阶段的效应稳定性、护栏、分群与回滚 |

## 推荐阅读顺序

1. [电商推荐背景](./ecommerce-recommendation-context.md)
2. [推荐系统链路](./recommendation-system-pipeline.md)
3. [召回](./retrieval.md)、[粗排与精排](./ranking.md)、[特征交叉](./feature-interaction.md)、[用户行为序列](./user-behavior-sequence.md)、[重排](./reranking.md)、[冷启动](./cold-start.md)、[系统优化](./system-optimization.md)
4. [Metrics](./metrics.md)
5. [Online Experiment Lifecycle](./online-experiment-lifecycle.md)
6. [A/A](./aa-testing.md) → [A/B](./ab-testing.md) → [Ramp-up](./ramp-up.md)

## 知识地图

### E-commerce Recommendation Context

先理解推荐系统服务的对象与目标：用户、商品、内容和商家如何通过曝光、点击、加购、下单、支付和退款形成完整交易漏斗，以及用户价值、商业价值与生态价值之间为什么需要平衡。

### Recommendation System Pipeline

建立端到端架构：

```text
Eligible Pool
→ Retrieval
→ Pre-ranking
→ Ranking
→ Re-ranking
→ Exposure
→ User Action
→ Logging and Model Iteration
```

重点理解每个阶段的输入、输出、计算预算、优化目标和诊断指标，以及为什么前一阶段遗漏的候选无法被后一阶段恢复。

### Retrieval

回答“如何从海量商品中快速找到高潜候选？”重点包括：

- ItemCF、UserCF 和协同过滤相似度；
- Two-Tower、对比学习、负样本与 Hard Negative；
- ANN、IVF、PQ、HNSW 与 recall–latency trade-off；
- 多路召回的配额、重叠和边际贡献。

### Pre-ranking and Ranking

回答“如何在计算预算内保留候选，并预测用户—商品价值？”重点包括：

- 粗排的高价值候选保留率与精排的多目标预测；
- CTR、CVR、CTCVR、AOV 与 Expected GMV；
- Shared-Bottom、MMoE、PLE 和 ESMM；
- Pointwise、Pairwise、Listwise Learning-to-Rank；
- Calibration、Position Bias 和 Entire-space Modeling。

### Feature Interaction

回答“如何建模用户、商品与上下文特征之间的组合关系？”重点包括 FM、DeepFM、DCN/DCN-V2、xDeepFM 和 FiBiNET，以及显式/隐式、二阶/高阶、bit-wise/vector-wise interaction 的区别。

### User Behavior Sequence

回答“如何从用户历史行为中识别长期兴趣和当前意图？”重点包括 LastN、Time-decay Pooling、DIN、DIEN、AUGRU、SASRec 和 BERT4Rec，以及候选感知、兴趣演化、长序列复杂度和时间穿越问题。

### Re-ranking and Slate Optimization

回答“单个候选完成打分后，如何组成更好的最终列表？”重点包括：

- MMR、Sliding-window MMR 和 DPP；
- 相关性、多样性、新颖性和商业价值的权衡；
- 类目、商家、价格带与探索流量约束；
- Rule-based 与 Constrained Optimization 的适用边界。

### Cold Start and Exploration

回答“新商品、新商家和新用户缺少历史数据时怎么办？”重点包括内容表示、Look-alike、Representation Distillation、Empirical Bayes、UCB、Thompson Sampling 和探索流量实验。

### System Optimization

回答“下一步最值得优化系统的哪个环节？”重点包括召回配额、Stage Funnel、GMV 分解、训练—服务一致性、模型漂移、系统性能以及项目收益、信心和成本的优先级判断。

### Online Experiment Lifecycle

先建立全局流程：模型从开发到上线经历哪些阶段，A/A 何时需要，A/B 在哪里验证因果增量，SRM 在哪些阶段持续检查，Ramp-up 如何连接实验与全量，以及 Holdout 如何观察长期价值。

### Recommendation System Metrics

建立分析共同语言：

- Primary、Secondary、Diagnostic、Guardrail 与 Data Quality Metrics；
- CTR、PDP、ATC、CVR、AOV、Gross/Net GMV 和 Retention；
- 推荐质量、买家体验、商品与商家生态；
- Metric aggregation、Metric Tree、Contract 与 Segment Analysis。

### A/A Testing

回答“实验平台和数据链路值得信任吗？”重点包括 SRM、cross-over、logging coverage、baseline balance、metric validation 和 statistical calibration。

### A/B Testing

回答“新模型是否真的带来因果增量？”重点包括 experiment unit、hash bucketing、MDE/power、confidence interval、multiple testing、CUPED、Cluster Bootstrap、异质性分析和 readout。

### Ramp-up

回答“实验通过后能否安全扩大上线？”重点包括 effect stability、guardrail、data quality、system health、segment risk、distribution shift 和 rollback。

## 核心决策框架

```text
业务问题和机制假设清楚吗？
→ 指标口径与归因窗口清楚吗？
→ 候选、排序和曝光链路可诊断吗？
→ 实验设计和数据有效吗？
→ 增量有统计与业务意义吗？
→ 用户、交易、系统和生态护栏安全吗？
→ 放量后效果在关键市场与人群中稳定吗？
→ Rollout / Iterate / Rollback
```
