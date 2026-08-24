# 推荐系统在线实验流程｜Online Experiment Lifecycle

<a name="top"></a>

## 目录

- [1. 概述](#sec-1)
- [2. 完整流程](#sec-2)
- [3. 开发新模型](#sec-3)
  - [3.1 定义业务问题](#sec-3-1)
  - [3.2 定义实验假设](#sec-3-2)
  - [3.3 明确策略变化范围](#sec-3-3)
- [4. 离线评估｜Offline Evaluation](#sec-4)
  - [4.1 模型效果指标](#sec-4-1)
  - [4.2 工程性能指标](#sec-4-2)
  - [4.3 离线评估的限制](#sec-4-3)
- [5. 实验准备检查｜Experiment Readiness Check](#sec-5)
  - [5.1 实验单位](#sec-5-1)
  - [5.2 实验指标](#sec-5-2)
  - [5.3 实验配置](#sec-5-3)
  - [5.4 实验层、交互与干扰设计](#sec-5-4)
- [6. A/A Testing](#sec-6)
  - [6.1 什么时候需要 A/A Testing](#sec-6-1)
  - [6.2 验证内容](#sec-6-2)
- [7. A/B Testing](#sec-7)
  - [7.1 分析流程](#sec-7-1)
  - [7.2 初始流量](#sec-7-2)
  - [7.3 实验期间持续监控](#sec-7-3)
  - [7.4 统计与归因计划](#sec-7-4)
- [8. SRM｜Sample Ratio Mismatch](#sec-8)
  - [8.1 检查时机](#sec-8-1)
- [9. Ramp-up](#sec-9)
  - [9.1 Ramp-up 的目的](#sec-9-1)
  - [9.2 每次放量前的检查](#sec-9-2)
  - [9.3 Ramp-up 不等于重新随机](#sec-9-3)
- [10. Full Rollout](#sec-10)
  - [10.1 Full Rollout 与 Holdout](#sec-10-1)
- [11. Long-term Holdout](#sec-11)
  - [11.1 Holdout 可以回答什么](#sec-11-1)
  - [11.2 Holdout 的适用场景](#sec-11-2)
  - [11.3 Holdout 的成本](#sec-11-3)
- [12. Go / No-Go 决策门槛](#sec-12)
- [13. 常见误区](#sec-13)
  - [13.1 每个 A/B Test 前都必须运行 A/A Test](#sec-13-1)
  - [13.2 SRM 只需要在实验开始时检查一次](#sec-13-2)
  - [13.3 离线指标提升就可以直接上线](#sec-13-3)
  - [13.4 Ramp-up 只是扩大流量](#sec-13-4)
  - [13.5 100% 上线后仍然天然存在 Control](#sec-13-5)
  - [13.6 所有实验都必须保留 Holdout](#sec-13-6)
- [14. 各阶段的分析重点](#sec-14)
  - [14.1 核心判断链路](#sec-14-1)
  - [14.2 生命周期不是机械流水线](#sec-14-2)
- [15. 工业案例：实验生命周期落地](#sec-15)
  - [15.1 短视频商品内容到商城订单](#sec-15-1)
  - [15.2 直播内容流与共享直播间](#sec-15-2)
  - [15.3 商城商品卡召回或排序：支付、取消与退款成熟](#sec-15-3)
  - [15.4 召回与精排联合上线](#sec-15-4)
  - [15.5 搜索排序：查询意图、零结果与延迟成交](#sec-15-5)
- [16. 关联文档](#sec-16)

---

<a name="sec-1"></a>

## 1. 概述

推荐系统的新模型通常经过模型开发、离线评估、实验准备、在线实验、逐步放量和长期效果验证。

核心原则：

- A/A Testing 用于验证实验平台，只在平台首次上线或关键链路发生变化时执行。
- A/B Testing 用于验证新模型或新策略的真实业务价值。
- SRM 是 A/A 和 A/B 的数据质量门槛，并应在实验运行期间持续监控。
- Ramp-up、Full Rollout 和 Long-term Holdout 分别用于风险控制、正式上线和长期测量。

这套流程可以进一步理解为：

```text
定义问题
↓
证明模型离线可行
↓
确认实验数据可信
↓
估计线上因果增量
↓
验证扩大流量后的稳定性
↓
评估长期价值
```

---

<a name="sec-2"></a>

## 2. 完整流程

```mermaid
%%{init: {
  "theme": "neutral",
  "flowchart": {
    "curve": "linear",
    "nodeSpacing": 45,
    "rankSpacing": 55,
    "htmlLabels": true
  }
}}%%
flowchart TB
    DEV["开发新模型"] --> OFFLINE["离线评估"]
    OFFLINE --> READY["实验准备检查"]
    READY --> NEED_AA{"实验平台是否需要验证？"}

    NEED_AA -->|是| AA["A/A Testing"]
    NEED_AA -->|否| AB["A/B Testing"]

    AA --> AA_VALID{"SRM + Platform Validation<br/>是否通过？"}
    AA_VALID -->|否| AA_STOP["停止并排查实验链路"]
    AA_VALID -->|是| AB

    AB --> AB_VALID{"SRM / Data Quality / Guardrail<br/>是否通过？"}
    AB_VALID -->|否| AB_STOP["停止、回滚或继续迭代"]
    AB_VALID -->|是| EFFECT{"Primary Effect<br/>是否满足上线要求？"}

    EFFECT -->|否| AB_STOP
    EFFECT -->|是| RAMP["Ramp-up"]

    RAMP --> RAMP_DATA{"Data Quality 正常？"}
    RAMP_DATA -->|否| RAMP_STOP["Pause / Rollback"]
    RAMP_DATA -->|是| RAMP_SAFE{"System + Guardrail + Segment<br/>是否安全？"}
    RAMP_SAFE -->|否| RAMP_STOP
    RAMP_SAFE -->|是| NEXT{"达到 Full Rollout？"}
    NEXT -->|否| RAMP
    NEXT -->|是| FULL["Full Rollout"]

    FULL --> HOLDOUT["Long-term Holdout /<br/>Post-launch Monitoring"]

    classDef decision fill:#ffffff,stroke:#333333,stroke-width:1.5px;
    classDef stop fill:#fff4f4,stroke:#a61b1b,stroke-width:1.5px;
    classDef success fill:#f3faf3,stroke:#2f6b2f,stroke-width:1.5px;

    class NEED_AA,AA_VALID,AB_VALID,EFFECT,RAMP_DATA,RAMP_SAFE,NEXT decision;
    class AA_STOP,AB_STOP,RAMP_STOP stop;
    class FULL,HOLDOUT success;
```

平台不需要重新验证时，可以跳过 A/A Testing，直接进入 A/B Testing；需要重新验证时，只有 SRM 和平台校验均通过，才能进入正式 A/B Testing。

---

<a name="sec-3"></a>

## 3. 开发新模型

模型开发应从明确的业务问题开始，而不是只追求离线指标提升。

<a name="sec-3-1"></a>

### 3.1 定义业务问题

例如：

- 提升用户有效观看时长
- 提升商品推荐转化率
- 提升新用户次日留存
- 降低低质量内容曝光
- 提升长尾内容覆盖率
- 改善直播间与商品供给的分配效率
- 在退款和取消风险可控的前提下提升 Net GMV per User

<a name="sec-3-2"></a>

### 3.2 定义实验假设

一个可验证的实验假设应包含：

- 改变什么
- 为什么可能有效
- 影响哪些用户
- 主要提升什么指标
- 可能损害哪些 Guardrail Metrics

示例：

> 在精排模型中加入长期兴趣特征，可以提升人均有效观看时长，同时不显著损害内容多样性和系统延迟。

<a name="sec-3-3"></a>

### 3.3 明确策略变化范围

需要记录：

- 模型版本
- 特征版本
- 训练数据窗口
- 召回和排序链路变化
- 作用场景与决策单元：内容或直播分发、商城与搜索、详情页与橱窗、创作者合作或跨渠道分配；同时写清 User、Query、Room、Creator、Seller 或 Campaign 等单位
- 参数变化
- 降级策略
- 适用用户范围
- 是否改变共享库存、直播间或商家侧流量

---

<a name="sec-4"></a>

## 4. 离线评估｜Offline Evaluation

离线评估用于过滤明显无效或高风险的方案，但不能替代在线 A/B Testing。

<a name="sec-4-1"></a>

### 4.1 模型效果指标

推荐排序常见指标包括：

- AUC
- Log Loss
- NDCG@K
- Recall@K
- Precision@K
- Calibration
- Coverage
- Diversity

<a name="sec-4-2"></a>

### 4.2 工程性能指标

还需要评估：

- P50、P95、P99 Latency
- CPU 和 GPU 使用率
- 内存占用
- QPS
- Feature Freshness
- Timeout Rate
- Fallback Rate

<a name="sec-4-3"></a>

### 4.3 离线评估的限制

离线指标无法完整反映：

- 用户行为反馈
- 曝光偏差
- 策略之间的竞争关系
- 长期用户满意度
- 内容供给变化
- 创作者行为变化
- 系统级网络效应

因此，离线评估通过后仍需要在线实验。

---

<a name="sec-5"></a>

## 5. 实验准备检查｜Experiment Readiness Check

<a name="sec-5-1"></a>

### 5.1 实验单位

| 实验单位 | 常见场景 |
|---|---|
| User ID | 用户级推荐和长期体验 |
| Device ID | 匿名用户 |
| Session ID | 会话级策略 |
| Creator ID | 创作者工具或激励实验 |
| Live Room / Host ID | 直播间共享体验或主播侧策略 |
| Seller / Item ID | 商家工具、商品供给或库存策略 |
| Region | 地区级运营策略 |
| Geo × Time Window | 供需或共享资源的 Switchback Experiment |

随机化单位不能只按实现方便选择。个性化排序通常使用 User ID；若 Treatment 会改变共享直播间、商品库存或商家行为，用户级随机化可能违反无干扰假设，需要考虑 Room、Seller、Geo-Time Cluster 或 Two-sided Design。随机化层级越粗，独立样本通常越少，样本量和推断方法也必须同步调整。

<a name="sec-5-2"></a>

### 5.2 实验指标

| 类型 | 作用 |
|---|---|
| Primary Metric | 决定实验是否成功 |
| Secondary Metrics | 帮助解释用户行为变化 |
| Guardrail Metrics | 防止局部优化损害系统健康 |
| Diagnostic Metrics | 解释 Exposure、Click、商品页、Order、Refund 的变化路径 |
| Data Quality Metrics | 验证 Assignment、SRM、日志与成熟度 |

每个指标还必须明确 Numerator、Denominator、Eligible Population、Analysis Unit、Attribution Window 和 Maturity Window。短视频或直播到订单存在延迟时，应按同一成熟 Cohort 比较；不能让近期 Treatment 订单与更成熟的 Control 订单使用不同退款观察期。

<a name="sec-5-3"></a>

### 5.3 实验配置

上线前应确认：

- Control 和 Treatment 的策略版本
- Experiment Salt
- Bucket 区间
- 流量比例
- 实验层和互斥关系
- 与同期实验的共同曝光、潜在交互和 Factorial 计划
- 用户资格条件
- 实验开始和结束时间
- Attribution / Maturity Window 与 Data Freeze Date
- Sequential Monitoring 或固定样本分析规则
- Ramp-up 计划
- 回滚条件

<a name="sec-5-4"></a>

### 5.4 实验层、交互与干扰设计

实验上线前应先回答三个不同问题：

```text
参数是否冲突？
→ 决定是否同层互斥

两个策略能否共同上线且需要估计组合收益？
→ 决定是否运行 2 × 2 Factorial

Treatment 是否改变其他实验单位面对的市场状态？
→ 决定是否需要 Cluster、Switchback 或 Two-sided Design
```

对于两个可组合的二元策略 A 和 B，完整 Factorial 包含四组：

| A | B | 作用 |
|---|---|---|
| Control | Control | Baseline |
| Treatment | Control | A Only |
| Control | Treatment | B Only |
| Treatment | Treatment | Combined |

若 Combined Increment 大于 A Only 与 B Only 增量之和，就是加性尺度上的正向交互，即 `1 + 1 > 2`；小于则为负向交互，即 `1 + 1 < 2`。仅使用独立 Salt 正交分流不会自动消除交互，只是让四个组合在设计上可被观察。

跨 Surface 尤其要检查同一用户的购买旅程。短视频商品内容流的商品入口、直播内容流的房间分发和商城商品卡推荐可能共同改变用户兴趣与订单；如果需要联合上线结论，应保持用户 Assignment 可追踪，并预先估计主效应与 Interaction Effect。

---

<a name="sec-6"></a>

## 6. A/A Testing

A/A Testing 用于验证实验平台，而不是评估新模型效果。

<a name="sec-6-1"></a>

### 6.1 什么时候需要 A/A Testing

通常需要执行 A/A Testing 的情况：

- 实验平台首次上线
- Hash 或 Bucket 逻辑变化
- Experiment Unit 变化
- 实验层或互斥系统变化
- 曝光埋点变化
- 指标计算链路变化
- 新客户端 SDK 上线
- 多个实验同时出现异常

通常可以跳过 A/A Testing 的情况：

- 实验平台已经成熟
- 分流和埋点没有变化
- 只是上线新的推荐模型
- 使用的是已经验证过的指标
- 实验配置遵循标准模板

```text
Control:   Existing Model
Treatment: Existing Model
```

<a name="sec-6-2"></a>

### 6.2 验证内容

- SRM（Sample Ratio Mismatch）
- Baseline Balance（基线均衡性）
- Exposure Qualification（一致的曝光资格）
- Logging Validation（埋点完整性）
- Metric Validation（指标计算正确性）
- Statistical Calibration（统计检验校准）

在分析顺序上，可以表示为：

```mermaid
%%{init: {
  "theme": "neutral",
  "flowchart": {
    "curve": "linear",
    "nodeSpacing": 55,
    "rankSpacing": 60,
    "htmlLabels": true
  }
}}%%
flowchart TB
    START["开始 A/A Testing"] --> SRM{"① SRM Check"}

    SRM -->|FAIL| STOP["停止平台验证并排查"]
    SRM -->|PASS| VALIDATE["② Platform Validation<br/>Baseline Balance<br/>Logging Validation<br/>Metric Validation<br/>Statistical Calibration"]

    VALIDATE --> OK{"平台验证是否通过？"}
    OK -->|FAIL| FIX["修复平台后重新验证"]
    OK -->|PASS| AB["可以进入正式 A/B Testing"]

    FIX -.重新运行.-> START

    classDef decision fill:#ffffff,stroke:#333333,stroke-width:1.5px;
    classDef stop fill:#fff4f4,stroke:#a61b1b,stroke-width:1.5px;
    classDef success fill:#f3faf3,stroke:#2f6b2f,stroke-width:1.5px;

    class SRM,OK decision;
    class STOP,FIX stop;
    class AB success;
```

工程上，这些检查可能同时计算；但在分析逻辑上，SRM 是前置质量门槛。SRM Fail 时，不应继续使用后续指标差异来证明平台有效。

---

<a name="sec-7"></a>

## 7. A/B Testing

```text
Control:   Existing Model
Treatment: New Model
```

A/B Testing 用于判断新模型或新策略是否优于当前线上方案。

<a name="sec-7-1"></a>

### 7.1 分析流程

```mermaid
%%{init: {
  "theme": "neutral",
  "flowchart": {
    "curve": "linear",
    "nodeSpacing": 55,
    "rankSpacing": 60,
    "htmlLabels": true
  }
}}%%
flowchart TB
    START["开始 A/B Testing"] --> SRM{"① SRM Check / Monitoring"}

    SRM -->|FAIL| STOP["停止实验并排查"]
    SRM -->|PASS| QUALITY{"② 数据质量与<br/>系统稳定性是否通过？"}

    QUALITY -->|FAIL| ROLLBACK["停止或回滚实验"]
    QUALITY -->|PASS| METRICS["③ 分析 Primary Metrics<br/>Secondary Metrics<br/>Guardrail Metrics"]

    METRICS --> VALIDITY["④ 检查指标成熟度、Interaction、<br/>跨 Surface 与 Marketplace Spillover"]
    VALIDITY --> GOAL{"达到实验目标且<br/>外推边界可接受？"}
    GOAL -->|否| ITERATE["停止、回滚或继续迭代"]
    GOAL -->|是| RAMP["进入 Ramp-up"]

    classDef decision fill:#ffffff,stroke:#333333,stroke-width:1.5px;
    classDef stop fill:#fff4f4,stroke:#a61b1b,stroke-width:1.5px;
    classDef success fill:#f3faf3,stroke:#2f6b2f,stroke-width:1.5px;

    class SRM,QUALITY,GOAL decision;
    class STOP,ROLLBACK,ITERATE stop;
    class RAMP success;
```

<a name="sec-7-2"></a>

### 7.2 初始流量

高风险模型通常从较小流量开始：

```text
Control   = 95%
Treatment = 5%
```

低风险且平台成熟的实验也可能直接使用：

```text
Control   = 50%
Treatment = 50%
```

具体比例取决于：

- 风险等级
- 所需样本量
- 实验周期
- 系统容量
- 用户影响范围
- 回滚能力

<a name="sec-7-3"></a>

### 7.3 实验期间持续监控

- SRM
- 用户跨组
- 日志延迟
- 指标缺失率
- Crash Rate
- Error Rate
- Latency
- Complaint Rate
- 核心业务指标

实时安全监控与正式统计决策应分开。Crash、Error、严重投诉可以触发预先定义的安全回滚；业务成功不能通过每天查看普通固定样本 p-value 并在首次显著时停止来判断。

<a name="sec-7-4"></a>

### 7.4 统计与归因计划

正式 A/B Test 开始前应冻结分析计划：

- Primary / Guardrail Hypothesis 与业务阈值；
- Fixed-horizon 或预先校准的 Sequential Design；
- Multiple Testing Family 与 Correction / Gatekeeping；
- Mean、Ratio of Sums 或 Average of Ratios 的指标定义；
- Delta Method、Cluster Bootstrap、Cluster-robust SE 或 Randomization Inference；
- CUPED 协变量及缺失历史数据的处理；
- 跨 Surface Assignment、Exposure 和订单归因；
- Delayed Order、Cancellation、Refund 的成熟窗口；
- 需要估计的 Factorial Interaction；
- 库存、直播间和商家 Spillover 的外推边界。

用户级随机实验中的曝光 CTR 不是独立曝光的简单二项检验问题。同一用户的曝光和订单相关，推断需要在用户层级聚合、线性化或重采样。若随机化发生在 Room、Seller 或 Geo-Time，推断也必须使用相应 Cluster。

只分析点击、进店或下单用户通常会按 Post-treatment Behavior 选择样本。用于 Ship Decision 的订单和 Net GMV 主分析应优先保留预先定义 Eligible Population 的 Intention-to-Treat Estimand，Triggered Analysis 用于补充机制解释。

---

<a name="sec-8"></a>

## 8. SRM｜Sample Ratio Mismatch

SRM 用于判断实验实际分组比例是否符合设计比例。它只检查样本比例，不分析 CTR、CVR、Watch Time 等业务指标。主 SRM Check 应使用被随机化且满足实验前资格条件的单位；若使用可能被 Treatment 影响的曝光、点击或下单样本做 SRM，会把真实 Treatment Effect 误判成分流异常。

例如实验设计为：

```text
Control   = 50%
Treatment = 50%
```

实际观测为：

```text
Control   = 49.9%
Treatment = 50.1%
```

通常可能属于合理随机波动。

如果实际观测为：

```text
Control   = 45%
Treatment = 55%
```

则需要立即排查。

<a name="sec-8-1"></a>

### 8.1 检查时机

SRM 应在以下阶段持续执行：

- A/A Testing
- A/B Testing 初期
- 每次 Ramp-up 后
- 实验运行期间
- 实验结束分析前

SRM 不是 A/A 与 A/B 之间的独立阶段，而是两类实验都必须执行的数据质量检查。

---

<a name="sec-9"></a>

## 9. Ramp-up

Ramp-up 是逐步扩大 Treatment 流量的过程。

```text
1% → 5% → 10% → 25% → 50% → 100%
```

每个流量阶段都使用相同的判断顺序：

```mermaid
%%{init: {
  "theme": "neutral",
  "flowchart": {
    "curve": "linear",
    "nodeSpacing": 55,
    "rankSpacing": 60,
    "htmlLabels": true
  }
}}%%
flowchart TB
    START["进入当前 Ramp-up Stage"] --> SRM{"① SRM 与数据质量<br/>是否正常？"}

    SRM -->|FAIL| PAUSE1["暂停放量并排查"]
    SRM -->|PASS| SYSTEM{"② Latency、Error Rate 与<br/>系统容量是否正常？"}

    SYSTEM -->|FAIL| ROLLBACK["Pause 或 Rollback"]
    SYSTEM -->|PASS| EFFECT["③ 检查 Effect Size、Guardrail、<br/>关键 Segment 与分布变化"]

    EFFECT --> GATE{"满足当前 Stage<br/>放量门槛？"}
    GATE -->|否，可修复| PAUSE2["Pause：保持当前流量并继续观察"]
    GATE -->|否，风险明确| ROLLBACK
    GATE -->|是，未到目标流量| NEXT["进入下一流量阶段"]
    GATE -->|是，已到目标流量| FULL["进入 Full Rollout 决策"]

    NEXT -.下一阶段重复检查.-> START

    classDef decision fill:#ffffff,stroke:#333333,stroke-width:1.5px;
    classDef stop fill:#fff4f4,stroke:#a61b1b,stroke-width:1.5px;
    classDef success fill:#f3faf3,stroke:#2f6b2f,stroke-width:1.5px;

    class SRM,SYSTEM,GATE decision;
    class PAUSE1,PAUSE2,ROLLBACK stop;
    class NEXT,FULL success;
```

<a name="sec-9-1"></a>

### 9.1 Ramp-up 的目的

- 降低线上事故影响范围
- 验证系统容量
- 观察延迟和错误率
- 提前发现边缘用户问题
- 验证效果是否随流量扩大保持稳定

<a name="sec-9-2"></a>

### 9.2 每次放量前的检查

| 检查项 | 示例 |
|---|---|
| 数据质量 | 无 SRM、无日志异常 |
| 系统稳定性 | Latency 和 Error Rate 正常 |
| Primary Metric | 达到预期或至少没有明显恶化 |
| Guardrail Metrics | 未超过风险阈值 |
| 分群结果 | 关键国家、设备和用户群无严重负向 |
| 回滚能力 | 能够快速恢复旧策略 |

<a name="sec-9-3"></a>

### 9.3 Ramp-up 不等于重新随机

```text
5% Treatment:
Bucket 0–499

10% Treatment:
Bucket 0–999

25% Treatment:
Bucket 0–2499
```

稳定的 Hash Bucketing 可以保留原有 Treatment 用户，并加入新的 Bucket。

更完整的指标设计、阶段 Readout 和回滚方法见 [Ramp-up](./ramp-up.md)。

---

<a name="sec-10"></a>

## 10. Full Rollout

当实验结果、系统性能和 Guardrail Metrics 均满足要求后，新模型可以成为默认生产策略。

```mermaid
%%{init: {
  "theme": "neutral",
  "flowchart": {
    "curve": "linear",
    "nodeSpacing": 55,
    "rankSpacing": 60,
    "htmlLabels": true
  }
}}%%
flowchart TB
    START["完成目标 Ramp-up Stage"] --> EVIDENCE{"① 实验收益与置信区间<br/>是否满足上线标准？"}

    EVIDENCE -->|否| ITERATE["继续迭代或停止上线"]
    EVIDENCE -->|是| SAFETY{"② Guardrail、Segment 与<br/>系统性能是否稳定？"}

    SAFETY -->|否| PAUSE["Pause 或 Rollback"]
    SAFETY -->|是| READY{"③ 监控、Owner、回滚方案与<br/>维护成本是否可接受？"}

    READY -->|否| PREPARE["补齐上线准备"]
    READY -->|是| HOLDOUT{"是否需要长期 Holdout？"}

    HOLDOUT -->|是| ROLLOUT1["生产流量上线<br/>保留独立 Holdout"]
    HOLDOUT -->|否| ROLLOUT2["生产流量全量上线"]

    classDef decision fill:#ffffff,stroke:#333333,stroke-width:1.5px;
    classDef stop fill:#fff4f4,stroke:#a61b1b,stroke-width:1.5px;
    classDef success fill:#f3faf3,stroke:#2f6b2f,stroke-width:1.5px;

    class EVIDENCE,SAFETY,READY,HOLDOUT decision;
    class ITERATE,PAUSE,PREPARE stop;
    class ROLLOUT1,ROLLOUT2 success;
```

通常所说的“100% 上线”是指：

> 新策略成为符合条件生产流量的默认策略。

上线决策应综合考虑：

- 效果大小
- 置信区间
- 实验持续时间
- 关键用户分群
- 长期指标
- 工程成本
- 模型维护成本
- 业务风险

<a name="sec-10-1"></a>

### 10.1 Full Rollout 与 Holdout

如果所有用户都使用 Treatment，则不存在同时期的 Control 组。

因此，严格来说：

```text
100% Treatment
```

和

```text
保留同期 Holdout Control
```

不能在同一用户范围内同时成立。

工业实践中的“100% 上线”通常有两种含义：

1. 对普通生产流量全量上线，但排除一个独立的长期 Holdout 人群。
2. 完全取消 Control，后续通过其他实验或时间序列方法评估长期效果。

---

<a name="sec-11"></a>

## 11. Long-term Holdout

Holdout 是长期保留旧策略或基础策略的一小部分随机化单位，用于衡量累计效果和长期副作用。用户级 Holdout 主要识别买家侧效果；若策略会改变创作者供给、共享库存或整体市场均衡，需要能覆盖 Spillover 的 Cluster、Saturation、Two-sided 或市场级设计。

固定 Holdout 与周期性重新随机 Holdout 回答不同问题：前者保留同一 Cohort，估计持续采用一组策略的累计差异；后者只有在起始状态可比，或将既往 Treatment History 纳入目标量时，才解释为下一周期策略包的新增效果。重新随机会切断长期对照，不能同时声称保留了连续累计 Estimand。若新策略已经影响用户状态、创作者供给、库存或商家行为，再把部分流量切回旧策略通常测量撤回效应，并可能存在延续效应；反转前应声明清洗期、状态重置可行性与旧策略兼容性。详细设计边界见 [A/B Testing](./ab-testing.md#sec-12-3)。

```text
New Model          = 98%
Long-term Holdout  = 2%
```

```mermaid
%%{init: {
  "theme": "neutral",
  "flowchart": {
    "curve": "linear",
    "nodeSpacing": 55,
    "rankSpacing": 60,
    "htmlLabels": true
  }
}}%%
flowchart TB
    START["提出长期测量问题"] --> VALUE{"① 长期因果测量的价值<br/>是否高于机会成本？"}

    VALUE -->|否| NOHOLD["不设置长期 Holdout"]
    VALUE -->|是| DESIGN["② 定义人群、比例、周期、<br/>指标与污染控制"]

    DESIGN --> VALID{"③ 随机化、SRM 与<br/>跨组污染是否可控？"}
    VALID -->|否| REDESIGN["重新设计或停止 Holdout"]
    VALID -->|是| RUN["运行并持续监控"]

    RUN --> READOUT["④ 分析累计效应、滞后效应<br/>与长期 Guardrail"]
    READOUT --> DECIDE{"继续保留的价值<br/>是否仍高于成本？"}

    DECIDE -->|是| RUN
    DECIDE -->|否| CLOSE["结束 Holdout 并记录结论"]

    classDef decision fill:#ffffff,stroke:#333333,stroke-width:1.5px;
    classDef stop fill:#fff4f4,stroke:#a61b1b,stroke-width:1.5px;
    classDef success fill:#f3faf3,stroke:#2f6b2f,stroke-width:1.5px;

    class VALUE,VALID,DECIDE decision;
    class NOHOLD,REDESIGN stop;
    class RUN,READOUT,CLOSE success;
```

<a name="sec-11-1"></a>

### 11.1 Holdout 可以回答什么

- 短期提升是否能够长期保持
- 用户是否出现适应或疲劳
- 留存影响是否滞后出现
- 内容供给是否逐渐改变
- 创作者生态是否受到影响
- 多个已上线策略的累计效果是多少

<a name="sec-11-2"></a>

### 11.2 Holdout 的适用场景

- 长期推荐目标优化
- 广告负载变化
- 用户增长策略
- 创作者激励
- 多项策略叠加上线
- 难以通过短期实验观测的指标

<a name="sec-11-3"></a>

### 11.3 Holdout 的成本

- 机会成本
- 流量成本
- 实验污染
- 用户跨组风险
- 长期维护成本

Holdout 不是每个模型上线后的必选步骤。

---

<a name="sec-12"></a>

## 12. Go / No-Go 决策门槛

| 阶段 | Go 条件 | No-Go 条件 |
|---|---|---|
| 离线评估 | 模型和工程指标满足最低要求 | 离线效果下降或性能不可接受 |
| 实验准备 | 配置、埋点、归因、Interaction 与回滚方案完整 | 指标口径不清、干扰设计不适用或无法快速回滚 |
| A/A Testing | 无系统性偏差，平台链路可信 | SRM、日志或指标链路异常 |
| A/B Testing | Primary 改善、Guardrail 可接受、指标已成熟且外推边界清楚 | 核心指标下降、组合交互不利或 Marketplace Bias 无法解释 |
| Ramp-up | 效果稳定，系统容量和 Marketplace State 可接受 | 放量后异常、效果反转或 Saturation 风险明显 |
| Full Rollout | 综合收益大于成本和风险 | 结果不稳定或长期风险未知 |
| Holdout | 长期测量价值高于机会成本 | 流量成本过高或污染严重 |

---

<a name="sec-13"></a>

## 13. 常见误区

<a name="sec-13-1"></a>

### 13.1 每个 A/B Test 前都必须运行 A/A Test

错误。A/A Test 主要验证实验平台，不是每个业务实验的固定步骤。

<a name="sec-13-2"></a>

### 13.2 SRM 只需要在实验开始时检查一次

错误。SRM 应在实验运行期间和每次流量调整后持续检查。

<a name="sec-13-3"></a>

### 13.3 离线指标提升就可以直接上线

错误。离线指标无法完整反映真实用户行为和长期生态影响。

<a name="sec-13-4"></a>

### 13.4 Ramp-up 只是扩大流量

不完整。每次扩大流量都应重新验证数据质量、系统稳定性和业务指标。

<a name="sec-13-5"></a>

### 13.5 100% 上线后仍然天然存在 Control

错误。除非平台单独保留长期 Holdout，否则全量上线后没有同期 Control。

<a name="sec-13-6"></a>

### 13.6 所有实验都必须保留 Holdout

错误。Holdout 适合长期、高影响和累计效应明显的策略，但会带来机会成本。

---

<a name="sec-14"></a>

## 14. 各阶段的分析重点

| 阶段 | 核心任务 | 主要输出 |
|---|---|---|
| Model Development | 明确业务问题与可检验假设 | Hypothesis / Success Criteria |
| Offline Evaluation | 评估模型效果与可上线性 | Offline Readout |
| Readiness Check | 确认指标、实验单位和数据链路 | Experiment Design |
| A/A Testing | 验证实验平台与数据可信度 | Platform PASS / FAIL |
| A/B Testing | 估计 Treatment Effect | Experiment Readout |
| Ramp-up | 验证 Effect Stability 与风险 | Continue / Pause / Rollback |
| Full Rollout | 确认生产指标稳定 | Launch Readout |
| Holdout | 评估长期累计效果 | Long-term Impact |

<a name="sec-14-1"></a>

### 14.1 核心判断链路

可以把整个生命周期压缩成六个问题：

```text
1. 我们到底想改善什么？
2. 离线证据是否足够支持上线实验？
3. 实验数据是否可信？
4. Treatment 是否产生真实且有业务意义的增量？
5. 流量扩大后收益和风险是否稳定？
6. 长期用户和生态价值是否仍然成立？
```

这些问题分别对应：

```text
Metrics
→ Offline Evaluation
→ A/A / Data Quality
→ A/B Testing
→ Ramp-up
→ Holdout / Post-launch Monitoring
```

<a name="sec-14-2"></a>

### 14.2 生命周期不是机械流水线

例如：

```text
A/B p-value < 0.05
→ Ramp-up
→ 100%
```

是不完整的。

实际 Go / No-Go 决策还需要结合：

- Effect Size
- Confidence Interval
- Guardrail Metrics
- Segment Risk
- Data Quality
- System Health
- Business Value
- Long-term Risk

最终决策需要把实验结果、数据质量、系统风险、业务价值和长期影响组合起来解释。

---

<a name="sec-15"></a>

## 15. 工业案例：实验生命周期落地

以下案例是流程模板，不代表任何真实实验结果。所有现象、流量、指标和区间数字都明确为示例，只用于说明 Readiness、A/A、A/B、Ramp-up 和最终决策阶段分别需要回答什么。

<a name="sec-15-1"></a>

### 15.1 短视频商品内容到商城订单

| 生命周期环节 | 设计与判断 |
|---|---|
| 业务假设 | 新商品排序提高 Assigned Eligible User 的成熟订单与 Net GMV，同时不损害内容体验和交易质量 |
| 示例现象 | 示例：Eligible Assignment 为 50.1% 对 49.9%；Control 商品 Exposure Rate 为 40%，Treatment 为 55%；成熟 Net GMV per Assigned User 相对提升 1.8%，P99 Latency 增加 6 ms |
| Readiness | 使用稳定 User ID；实验前定义 Eligibility；固定跨入口身份、订单归因窗口、退款成熟窗口与 Data Freeze Date |
| A/A / Data Quality | 在 Eligible Assignment 上检查 SRM；分别校验短视频商品 Exposure、商城商品卡到达、Order 与 Refund 的日志覆盖率 |
| A/B | Primary 使用 ITT 的成熟 Net GMV per Assigned Eligible User；Exposure、Click 与商品页漏斗只用于机制诊断 |
| Ramp-up | 比较 Fixed Cohort 与新增 Population，监控设备结构、P99 Latency、跨入口 Exposure 和成熟订单是否出现 Effect Decay |
| 常见误判 | 只分析已曝光或已点击用户；把点击提升当成交易提升；实验停止当天就把尚未发生的取消和退款记作 0 |
| Decision | 示例中的 1.8% 只是 Point Estimate；只有数据质量通过、Primary 的成熟区间达到预设业务阈值，且内容、系统、取消与退款 Guardrail 安全，才进入下一阶段 |

<a name="sec-15-2"></a>

### 15.2 直播内容流与共享直播间

| 生命周期环节 | 设计与判断 |
|---|---|
| 业务假设 | 新分发策略改善直播间匹配和成熟交易价值，同时控制房间拥挤、主播集中与库存风险 |
| 示例现象 | 示例：120 个合格直播间中，用户级分析给出 2.0% Lift、95% CI 为 [1.6%, 2.4%]，按直播间 Cluster 后仍为 2.0%，但 95% CI 变为 [-0.8%, 4.8%]；高 Saturation 时 Top-10 Room Exposure Share 从 32% 升至 41% |
| Readiness | 先定义 Direct、Spillover 或整体市场效应；据此选择 Live Room / Host Cluster、Geo-Time Switchback 或 Saturation Design，而不是默认 User Randomization |
| A/A / Data Quality | 验证 Assignment Schedule、Room Eligibility、Carryover 处理与 Cluster Inference；报告独立 Room / Host / Time Block 数 |
| A/B | 按真实随机化 Cluster 推断，观察 Room Entry、Qualified Watch、Net GMV、Host Exposure Share 与 Out-of-stock Exposure |
| Ramp-up | 检查 Treatment Saturation 是否改变房间热度、主播行为、共享库存和 Control 所处市场状态 |
| 常见误判 | 用户数量很大就认为 Power 足够；按用户 Bootstrap；把已受房间状态影响的 Control 当作未污染反事实 |
| Decision | 示例中 Cluster CI 跨过 0 且房间集中度上升，不能按用户级显著结果直接上线；应延长或改进 Cluster Design，并在 Carryover、Spillover 和 Saturation 风险进入预设边界后再放量 |

<a name="sec-15-3"></a>

### 15.3 商城商品卡召回或排序：支付、取消与退款成熟

| 生命周期环节 | 设计与判断 |
|---|---|
| 业务假设 | 新召回或多目标排序提高商城 Eligible User 的成熟 Net GMV，同时不增加缺货、履约、取消和退款风险 |
| 示例现象 | 示例相对变化：Product CTR 为 +3.0%，Paid Orders per User 为 +0.8%，Gross GMV per User 为 +1.5%；完成示例 14 天退款成熟窗口后，Cancellation 为 +0.7%，Refund 为 +1.1%，Net GMV per User 变为 -0.4% |
| Readiness | 使用稳定 User ID 与实验前 Eligibility；预先指定成熟 Net GMV 为 Primary。示例窗口为 7 天支付归因和 14 天退款成熟，实际窗口必须依据历史完成曲线确定 |
| A/A / Data Quality | 校验 Assignment SRM、Candidate / Impression Coverage、支付去重、订单状态流转、迟到取消和退款回补；同一 Order Cohort 使用相同 Maturity Age |
| A/B | Primary 使用 ITT 的成熟 Net GMV per Assigned Eligible User；CTR、Add-to-Cart、Payment CVR、AOV 和 Gross GMV 作为 Diagnostic，不替换预先指定的 Primary |
| Ramp-up | 新 Stage 未达到退款成熟窗口时，将 Cancellation、Refund 与 Net GMV 标记为 Preliminary；同时监控 In-stock Candidate Rate、Latency 和 Seller Concentration |
| 常见误判 | 点击或 Gross GMV 上升就宣布成功；把尚未发生的取消和退款记作 0；比较不同成熟度的 Stage；根据早期结果把 Primary 改成 CTR |
| Decision | 示例中成熟 Net GMV 为 -0.4% 且退款恶化，应停止放量并迭代；只有同等成熟 Cohort 的 Net Metric 达到阈值且交易 Guardrail 安全，才 Continue |

<a name="sec-15-4"></a>

### 15.4 召回与精排联合上线

| 生命周期环节 | 设计与判断 |
|---|---|
| 业务假设 | 新召回与新精排可以共同生效，但组合收益可能协同或抵消 |
| 示例现象 | 示例指标指数：Baseline 为 100，Recall Only 为 102，Ranking Only 为 103，Combined 为 108；加性预期为 105，因此示例 Interaction 为 +3 |
| Readiness | 若两者工程上冲突则同层互斥；若联合上线需要证据，则配置 2 × 2 Factorial，并预先定义 Interaction Scale、MDE 与 Power |
| A/A / Data Quality | 检查四个 Joint Assignment Cell、Joint Exposure、Eligibility 和跨层 Salt 是否符合设计 |
| A/B | 报告四个 Cell Mean、条件效应、平均主效应与 Interaction Contrast，不能只看两个边际 Lift |
| Ramp-up | 固定另一因子的流量或按共同权重 Standardize；Cell Mix 改变时不能把 Overall Lift 变化直接解释为模型衰减 |
| 常见误判 | 两个独立实验都为正就机械相加；正交 Assignment 被误解为效果可加；Combined Cell 不可执行却仍做 Factorial |
| Decision | 示例中的正向 Interaction 仍不足以单独上线；必须以 Combined Cell 的成熟业务价值和 Guardrail 为依据，并明确 Interaction 对放量计划的影响 |

<a name="sec-15-5"></a>

### 15.5 搜索排序：查询意图、零结果与延迟成交

| 生命周期环节 | 设计与判断 |
|---|---|
| 业务假设 | 新的查询意图识别与排序模型降低无效或零结果搜索，并提高合格搜索用户的成熟交易价值 |
| 示例现象 | 示例：30 万合格用户的 Query CTR 相对提升 4.0%，Zero-result Rate 从 6.5% 降至 5.8%，7 天 Paid Orders per Assigned User 提升 1.1%；14 天退款成熟后 Net GMV Lift 仅为 0.2%，95% CI 为 [-0.5%, 0.9%] |
| 设计单位与 Eligibility | User ID 稳定随机化，Query Request 仅作为机制诊断单位；Eligibility 由实验前的搜索入口可用性和查询处理规则定义，不能只保留有结果或有点击的请求 |
| Readiness | 冻结 Query Normalization、语言、地区、类目与筛选参数口径；预先声明 Primary、Zero-result 定义、订单归因与退款成熟窗口 |
| A/A / Data Quality | 在 Assigned Eligible User 层检查 SRM，比较 Query、Filter、Candidate、Impression 和 Order 的日志覆盖与去重；按用户或实际随机化单位校准方差 |
| A/B | Primary 使用成熟 Net GMV 或 Paid Orders per Assigned Eligible User；Query CTR、Reformulation Rate、Zero-result Rate、Add-to-Cart 和排名位置分布用于解释机制 |
| 干扰与成熟 | 热门查询可能争用共享库存、促销名额或广告位，改变 Control 面对的市场状态；搜索后跨会话支付、取消与退款需使用相同 Attribution、Maturity 和 Data Freeze Rule |
| Ramp-up | 分别报告高频与尾部 Query、不同语言和地区的 Stage-only 与 Fixed Cohort 结果；监控 P99 Latency、索引新鲜度、缺货曝光和 Seller Concentration |
| 常见误判 | Zero-result 与 CTR 改善就宣布成功；把 Query 数当作独立样本；或在退款尚未成熟时用 Gross GMV 替代预先指定的 Net Metric |
| Decision | 示例的成熟 Primary 区间尚不支持达到业务门槛，应 Pause 并继续收集成熟样本或优化尾部 Query；只有成熟 Primary 达标且延迟、库存与集中度 Guardrail 安全才进入全量 |

---

<a name="sec-16"></a>

## 16. 关联文档

- [E-commerce Recommendation Context](./ecommerce-recommendation-context.md)
- [Recommendation System Pipeline](./recommendation-system-pipeline.md)
- [Recommendation System Metrics](./metrics.md)
- [A/A Testing](./aa-testing.md)
- [A/B Testing](./ab-testing.md)
- [Ramp-up](./ramp-up.md)
