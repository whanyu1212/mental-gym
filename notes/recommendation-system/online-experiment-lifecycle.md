---
title: Online Experiment Lifecycle
description: An end-to-end workflow for planning, launching, monitoring, and concluding online experiments.
category: Recommendation Systems
status: stable
---

# 推荐系统在线实验流程｜Online Experiment Lifecycle

<a name="top"></a>

## 目录

- [1. 概述](#sec-1)
- [2. 完整流程](#sec-2)
- [3. 开发新模型](#sec-3)
  - [3.1 定义业务问题](#sec-3)
  - [3.2 定义实验假设](#sec-3)
  - [3.3 明确策略变化范围](#sec-3)
- [4. 离线评估｜Offline Evaluation](#sec-4)
  - [4.1 模型效果指标](#sec-4)
  - [4.2 工程性能指标](#sec-4)
  - [4.3 离线评估的限制](#sec-4)
- [5. 实验准备检查｜Experiment Readiness Check](#sec-5)
  - [5.1 实验单位](#sec-5)
  - [5.2 实验指标](#sec-5)
  - [5.3 实验配置](#sec-5)
- [6. A/A Testing](#sec-6)
  - [6.1 什么时候需要 A/A Testing](#sec-6)
  - [6.2 验证内容](#sec-6)
- [7. A/B Testing](#sec-7)
  - [7.1 分析流程](#sec-7)
  - [7.2 初始流量](#sec-7)
  - [7.3 实验期间持续监控](#sec-7)
- [8. SRM｜Sample Ratio Mismatch](#sec-8)
  - [8.1 检查时机](#sec-8)
- [9. Ramp-up](#sec-9)
  - [9.1 Ramp-up 的目的](#sec-9)
  - [9.2 每次放量前的检查](#sec-9)
  - [9.3 Ramp-up 不等于重新随机](#sec-9)
- [10. Full Rollout](#sec-10)
  - [10.1 Full Rollout 与 Holdout](#sec-10)
- [11. Long-term Holdout](#sec-11)
  - [11.1 Holdout 可以回答什么](#sec-11)
  - [11.2 Holdout 的适用场景](#sec-11)
  - [11.3 Holdout 的成本](#sec-11)
- [12. Go / No-Go 决策门槛](#sec-12)
- [13. 常见误区](#sec-13)
  - [13.1 每个 A/B Test 前都必须运行 A/A Test](#sec-13)
  - [13.2 SRM 只需要在实验开始时检查一次](#sec-13)
  - [13.3 离线指标提升就可以直接上线](#sec-13)
  - [13.4 Ramp-up 只是扩大流量](#sec-13)
  - [13.5 100% 上线后仍然天然存在 Control](#sec-13)
  - [13.6 所有实验都必须保留 Holdout](#sec-13)

---


<a name="sec-1"></a>

## 1. 概述

推荐系统的新模型通常经过模型开发、离线评估、实验准备、在线实验、逐步放量和长期效果验证。

核心原则：

- A/A Testing 用于验证实验平台，只在平台首次上线或关键链路发生变化时执行。
- A/B Testing 用于验证新模型或新策略的真实业务价值。
- SRM 是 A/A 和 A/B 的数据质量门槛，并应在实验运行期间持续监控。
- Ramp-up、Full Rollout 和 Long-term Holdout 分别承担风险控制、正式上线和长期测量的职责。

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

    NEED_AA -->|是| AA_START["A/A Testing"]
    NEED_AA -->|否| AB_START["A/B Testing"]

    subgraph AA_PHASE["A/A 平台验证"]
        direction TB
        AA_START --> AA_SRM{"① SRM Check"}
        AA_SRM -->|FAIL| AA_STOP["停止平台验证并排查"]
        AA_SRM -->|PASS| PLATFORM["② Platform Validation<br/>Baseline Balance<br/>Logging Validation<br/>Metric Validation<br/>Statistical Calibration"]
        PLATFORM --> PLATFORM_OK{"平台验证是否通过？"}
        PLATFORM_OK -->|FAIL| AA_STOP
    end

    PLATFORM_OK -->|PASS| AB_START

    subgraph AB_PHASE["A/B 在线实验"]
        direction TB
        AB_START --> AB_SRM{"① 持续 SRM Monitoring"}
        AB_SRM -->|FAIL| AB_STOP["停止实验并排查"]
        AB_SRM -->|PASS| QUALITY{"② 数据质量与<br/>系统稳定性是否通过？"}
        QUALITY -->|FAIL| AB_STOP
        QUALITY -->|PASS| METRICS["③ 分析 Primary Metrics<br/>与 Guardrail Metrics"]
        METRICS --> GO{"达到放量条件？"}
        GO -->|否| ITERATE["停止、回滚或迭代"]
        GO -->|是| RAMP["Ramp-up"]
        RAMP --> RAMP_SRM{"每次放量重新检查 SRM"}
        RAMP_SRM -->|FAIL| ROLLBACK["回滚流量"]
        RAMP_SRM -->|PASS| FULL["Full Rollout"]
        FULL --> HOLDOUT["Long-term Holdout（可选）"]
    end

    classDef decision fill:#ffffff,stroke:#333333,stroke-width:1.5px;
    classDef stop fill:#fff4f4,stroke:#a61b1b,stroke-width:1.5px;
    classDef phase fill:#f7f7f7,stroke:#555555,stroke-width:1px;
    classDef success fill:#f3faf3,stroke:#2f6b2f,stroke-width:1.5px;

    class NEED_AA,AA_SRM,PLATFORM_OK,AB_SRM,QUALITY,GO,RAMP_SRM decision;
    class AA_STOP,AB_STOP,ITERATE,ROLLBACK stop;
    class FULL,HOLDOUT success;
```

平台不需要重新验证时，可以跳过 A/A Testing，直接进入 A/B Testing；需要重新验证时，只有 SRM 和平台校验均通过，才能进入正式 A/B Testing。

---

<a name="sec-3"></a>

## 3. 开发新模型

模型开发应从明确的业务问题开始，而不是只追求离线指标提升。

<a name="sec-3"></a>

### 3.1 定义业务问题

例如：

- 提升用户有效观看时长
- 提升商品推荐转化率
- 提升新用户次日留存
- 降低低质量内容曝光
- 提升长尾内容覆盖率

<a name="sec-3"></a>

### 3.2 定义实验假设

一个可验证的实验假设应包含：

- 改变什么
- 为什么可能有效
- 影响哪些用户
- 主要提升什么指标
- 可能损害哪些 Guardrail Metrics

示例：

> 在精排模型中加入长期兴趣特征，可以提升人均有效观看时长，同时不显著损害内容多样性和系统延迟。

<a name="sec-3"></a>

### 3.3 明确策略变化范围

需要记录：

- 模型版本
- 特征版本
- 训练数据窗口
- 召回和排序链路变化
- 参数变化
- 降级策略
- 适用用户范围

---

<a name="sec-4"></a>

## 4. 离线评估｜Offline Evaluation

离线评估用于过滤明显无效或高风险的方案，但不能替代在线 A/B Testing。

<a name="sec-4"></a>

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

<a name="sec-4"></a>

### 4.2 工程性能指标

还需要评估：

- P50、P95、P99 Latency
- CPU 和 GPU 使用率
- 内存占用
- QPS
- Feature Freshness
- Timeout Rate
- Fallback Rate

<a name="sec-4"></a>

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

<a name="sec-5"></a>

### 5.1 实验单位

| 实验单位 | 常见场景 |
|---|---|
| User ID | 用户级推荐和长期体验 |
| Device ID | 匿名用户 |
| Session ID | 会话级策略 |
| Creator ID | 创作者工具或激励实验 |
| Region | 地区级运营策略 |
| Time Window | Switchback Experiment |

<a name="sec-5"></a>

### 5.2 实验指标

| 类型 | 作用 |
|---|---|
| Primary Metric | 决定实验是否成功 |
| Secondary Metrics | 帮助解释用户行为变化 |
| Guardrail Metrics | 防止局部优化损害系统健康 |

<a name="sec-5"></a>

### 5.3 实验配置

上线前应确认：

- Control 和 Treatment 的策略版本
- Experiment Salt
- Bucket 区间
- 流量比例
- 实验层和互斥关系
- 用户资格条件
- 实验开始和结束时间
- Ramp-up 计划
- 回滚条件

---

<a name="sec-6"></a>

## 6. A/A Testing

A/A Testing 用于验证实验平台，而不是评估新模型效果。

<a name="sec-6"></a>

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

<a name="sec-6"></a>

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

<a name="sec-7"></a>

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

    METRICS --> GOAL{"达到实验目标？"}
    GOAL -->|否| ITERATE["停止、回滚或继续迭代"]
    GOAL -->|是| RAMP["进入 Ramp-up"]

    classDef decision fill:#ffffff,stroke:#333333,stroke-width:1.5px;
    classDef stop fill:#fff4f4,stroke:#a61b1b,stroke-width:1.5px;
    classDef success fill:#f3faf3,stroke:#2f6b2f,stroke-width:1.5px;

    class SRM,QUALITY,GOAL decision;
    class STOP,ROLLBACK,ITERATE stop;
    class RAMP success;
```

<a name="sec-7"></a>

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

<a name="sec-7"></a>

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

---

<a name="sec-8"></a>

## 8. SRM｜Sample Ratio Mismatch

SRM 用于判断实验实际分组比例是否符合设计比例。它只检查样本比例，不分析 CTR、CVR、Watch Time 等业务指标。

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

<a name="sec-8"></a>

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

<a name="sec-9"></a>

### 9.1 Ramp-up 的目的

- 降低线上事故影响范围
- 验证系统容量
- 观察延迟和错误率
- 提前发现边缘用户问题
- 验证效果是否随流量扩大保持稳定

<a name="sec-9"></a>

### 9.2 每次放量前的检查

| 检查项 | 示例 |
|---|---|
| 数据质量 | 无 SRM、无日志异常 |
| 系统稳定性 | Latency 和 Error Rate 正常 |
| Primary Metric | 达到预期或至少没有明显恶化 |
| Guardrail Metrics | 未超过风险阈值 |
| 分群结果 | 关键国家、设备和用户群无严重负向 |
| 回滚能力 | 能够快速恢复旧策略 |

<a name="sec-9"></a>

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

---

<a name="sec-10"></a>

## 10. Full Rollout

当实验结果、系统性能和 Guardrail Metrics 均满足要求后，新模型可以成为默认生产策略。

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

<a name="sec-10"></a>

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

Holdout 是长期保留旧策略或基础策略的一小部分用户，用于衡量累计效果和长期副作用。

```text
New Model          = 98%
Long-term Holdout  = 2%
```

<a name="sec-11"></a>

### 11.1 Holdout 可以回答什么

- 短期提升是否能够长期保持
- 用户是否出现适应或疲劳
- 留存影响是否滞后出现
- 内容供给是否逐渐改变
- 创作者生态是否受到影响
- 多个已上线策略的累计效果是多少

<a name="sec-11"></a>

### 11.2 Holdout 的适用场景

- 长期推荐目标优化
- 广告负载变化
- 用户增长策略
- 创作者激励
- 多项策略叠加上线
- 难以通过短期实验观测的指标

<a name="sec-11"></a>

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
| 实验准备 | 配置、埋点和回滚方案完整 | 指标口径不清或无法快速回滚 |
| A/A Testing | 无系统性偏差，平台链路可信 | SRM、日志或指标链路异常 |
| A/B Testing | Primary Metric 改善，Guardrail 可接受 | 核心指标下降或风险过高 |
| Ramp-up | 效果稳定，系统容量正常 | 放量后出现异常或效果反转 |
| Full Rollout | 综合收益大于成本和风险 | 结果不稳定或长期风险未知 |
| Holdout | 长期测量价值高于机会成本 | 流量成本过高或污染严重 |

---

<a name="sec-13"></a>

## 13. 常见误区

<a name="sec-13"></a>

### 13.1 每个 A/B Test 前都必须运行 A/A Test

错误。A/A Test 主要验证实验平台，不是每个业务实验的固定步骤。

<a name="sec-13"></a>

### 13.2 SRM 只需要在实验开始时检查一次

错误。SRM 应在实验运行期间和每次流量调整后持续检查。

<a name="sec-13"></a>

### 13.3 离线指标提升就可以直接上线

错误。离线指标无法完整反映真实用户行为和长期生态影响。

<a name="sec-13"></a>

### 13.4 Ramp-up 只是扩大流量

不完整。每次扩大流量都应重新验证数据质量、系统稳定性和业务指标。

<a name="sec-13"></a>

### 13.5 100% 上线后仍然天然存在 Control

错误。除非平台单独保留长期 Holdout，否则全量上线后没有同期 Control。

<a name="sec-13"></a>

### 13.6 所有实验都必须保留 Holdout

错误。Holdout 适合长期、高影响和累计效应明显的策略，但会带来机会成本。
