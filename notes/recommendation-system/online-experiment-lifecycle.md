# 推荐系统在线实验流程｜Online Experiment Lifecycle

## 1. 概述

推荐系统的新模型通常需要经历开发、离线评估、在线实验、逐步放量和长期效果验证。

一个常见但容易产生误解的流程是：

```text
开发新模型
    ↓
离线评估
    ↓
A/A Test
    ↓
SRM 检查
    ↓
A/B Test
    ↓
Ramp-up
    ↓
100%
    ↓
Holdout
```

这个流程需要修正两点：

1. A/A Testing 不是每个 A/B Test 的必经步骤。
2. SRM 不是只检查一次，而应从实验开始后持续检查。

更准确的工业流程如下。

---

## 2. 推荐流程

```text
开发新模型
    ↓
离线评估
    ↓
实验准备检查
    ↓
实验平台是否已经验证？
    │
    ├── 否，或平台发生重大变更
    │       ↓
    │   A/A Testing
    │       ↓
    │   SRM、基线均衡性、埋点和指标校验
    │
    └── 是
            ↓
         跳过 A/A
            ↓
A/B Testing
    ↓
持续检查 SRM、数据质量和 Guardrail Metrics
    ↓
Ramp-up
    ↓
Full Rollout
    ↓
Long-term Holdout（可选）
```

A/A Testing 属于实验平台验证流程；A/B Testing 属于模型和产品策略验证流程。

---

## 3. 阶段一：开发新模型

模型开发应从明确的业务问题开始，而不是只追求离线指标提升。

### 3.1 定义业务问题

例如：

- 提升用户有效观看时长
- 提升商品推荐转化率
- 提升新用户次日留存
- 降低低质量内容曝光
- 提升长尾内容覆盖率

### 3.2 定义实验假设

一个可验证的实验假设应包含：

- 改变什么
- 为什么可能有效
- 影响哪些用户
- 主要提升什么指标
- 可能损害哪些 Guardrail Metrics

示例：

> 在精排模型中加入长期兴趣特征，可以提升人均有效观看时长，同时不显著损害内容多样性和系统延迟。

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

## 4. 阶段二：离线评估｜Offline Evaluation

离线评估用于过滤明显无效或高风险的方案，但不能替代在线 A/B Testing。

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

### 4.2 工程性能指标

还需要评估：

- P50、P95、P99 Latency
- CPU 和 GPU 使用率
- 内存占用
- QPS
- Feature Freshness
- Timeout Rate
- Fallback Rate

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

## 5. 阶段三：实验准备检查｜Experiment Readiness Check

### 5.1 实验单位

| 实验单位 | 常见场景 |
|---|---|
| User ID | 用户级推荐和长期体验 |
| Device ID | 匿名用户 |
| Session ID | 会话级策略 |
| Creator ID | 创作者工具或激励实验 |
| Region | 地区级运营策略 |
| Time Window | Switchback Experiment |

### 5.2 实验指标

| 类型 | 作用 |
|---|---|
| Primary Metric | 决定实验是否成功 |
| Secondary Metrics | 帮助解释用户行为变化 |
| Guardrail Metrics | 防止局部优化损害系统健康 |

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

## 6. 阶段四：是否需要 A/A Testing

### 6.1 需要 A/A Testing 的情况

- 实验平台首次上线
- Hash 或 Bucket 逻辑变化
- Experiment Unit 变化
- 实验层和互斥系统变化
- 曝光埋点变化
- 指标计算链路变化
- 新客户端 SDK 上线
- 多个实验同时出现异常

### 6.2 通常不需要 A/A Testing 的情况

- 实验平台已经成熟
- 分流和埋点没有变化
- 只是上线新的推荐模型
- 使用的是已经验证过的指标
- 实验配置遵循标准模板

日常模型迭代通常直接进入 A/B Testing，不需要为每个模型单独执行 A/A Test。

---

## 7. 阶段五：A/A Testing

```text
Control:   Existing Model
Treatment: Existing Model
```

主要验证：

- 分流是否稳定
- Bucket 是否均匀
- 是否存在 SRM
- 基线变量是否均衡
- 曝光资格是否一致
- 埋点是否完整
- 指标口径是否正确
- 统计检验是否校准

A/A Test 通过后，说明实验平台具备运行正式在线实验的基本条件，但并不意味着未来所有实验都不会出现数据问题。

---

## 8. 阶段六：A/B Testing

```text
Control:   Existing Model
Treatment: New Model
```

### 8.1 初始流量

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

### 8.2 实验期间持续监控

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

## 9. SRM 不是一次性阶段

Sample Ratio Mismatch 用于判断实际分组比例是否符合预期。

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

SRM 应在以下阶段持续执行：

- A/A Testing
- A/B Testing 初期
- 每次 Ramp-up 后
- 实验运行期间
- 实验结束分析前

因此，不建议把 SRM 画成 A/A 与 A/B 之间只执行一次的独立步骤。

---

## 10. 阶段七：Ramp-up

Ramp-up 是逐步扩大 Treatment 流量的过程。

```text
1% → 5% → 10% → 25% → 50% → 100%
```

### 10.1 Ramp-up 的目的

- 降低线上事故影响范围
- 验证系统容量
- 观察延迟和错误率
- 提前发现边缘用户问题
- 验证效果是否随流量扩大保持稳定

### 10.2 每次放量前的检查

| 检查项 | 示例 |
|---|---|
| 数据质量 | 无 SRM、无日志异常 |
| 系统稳定性 | Latency 和 Error Rate 正常 |
| Primary Metric | 达到预期或至少没有明显恶化 |
| Guardrail Metrics | 未超过风险阈值 |
| 分群结果 | 关键国家、设备和用户群无严重负向 |
| 回滚能力 | 能够快速恢复旧策略 |

### 10.3 Ramp-up 不等于重新随机

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

## 11. 阶段八：Full Rollout

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

### 11.1 100% 与 Holdout 的关系

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

## 12. 阶段九：Long-term Holdout

Holdout 是长期保留旧策略或基础策略的一小部分用户，用于衡量累计效果和长期副作用。

```text
New Model          = 98%
Long-term Holdout  = 2%
```

### 12.1 Holdout 可以回答什么

- 短期提升是否能够长期保持
- 用户是否出现适应或疲劳
- 留存影响是否滞后出现
- 内容供给是否逐渐改变
- 创作者生态是否受到影响
- 多个已上线策略的累计效果是多少

### 12.2 Holdout 的适用场景

- 长期推荐目标优化
- 广告负载变化
- 用户增长策略
- 创作者激励
- 多项策略叠加上线
- 难以通过短期实验观测的指标

### 12.3 Holdout 的成本

- 机会成本
- 流量成本
- 实验污染
- 用户跨组风险
- 长期维护成本

Holdout 不是每个模型上线后的必选步骤。

---

## 13. Go / No-Go 决策门槛

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

## 14. 完整流程

```text
定义业务问题与实验假设
        ↓
开发新模型
        ↓
离线模型评估
        ↓
离线工程性能评估
        ↓
实验配置与指标定义
        ↓
平台是否需要重新验证？
        │
        ├── 是
        │    ↓
        │  A/A Testing
        │    ↓
        │  SRM、基线、埋点、指标校验
        │
        └── 否
             ↓
          A/B Testing
             ↓
持续检查 SRM、数据质量和 Guardrail Metrics
             ↓
结果达到放量条件？
        │
        ├── 否 → 停止、回滚或继续迭代
        │
        └── 是
             ↓
          Ramp-up
             ↓
每次放量后重新检查
             ↓
          Full Rollout
             ↓
Long-term Holdout（可选）
             ↓
长期监控与下一轮模型迭代
```

---

## 15. 常见误区

### 15.1 每个 A/B Test 前都必须运行 A/A Test

错误。A/A Test 主要验证实验平台，不是每个业务实验的固定步骤。

### 15.2 SRM 只需要在实验开始时检查一次

错误。SRM 应在实验运行期间和每次流量调整后持续检查。

### 15.3 离线指标提升就可以直接上线

错误。离线指标无法完整反映真实用户行为和长期生态影响。

### 15.4 Ramp-up 只是扩大流量

不完整。每次扩大流量都应重新验证数据质量、系统稳定性和业务指标。

### 15.5 100% 上线后仍然天然存在 Control

错误。除非平台单独保留长期 Holdout，否则全量上线后没有同期 Control。

### 15.6 所有实验都必须保留 Holdout

错误。Holdout 适合长期、高影响和累计效应明显的策略，但会带来机会成本。

---

## 16. 总结

推荐系统在线实验不是简单的“A/A → A/B → 100%”线性流程，而是一套包含平台验证、数据质量监控、风险控制和长期效果评估的完整机制。

核心原则包括：

- 离线评估负责筛选方案，在线实验负责验证真实业务价值
- A/A Testing 用于验证实验平台，不是每个 A/B Test 的必经步骤
- SRM、日志质量和 Guardrail Metrics 应持续监控
- Ramp-up 应逐步进行，并在每次放量后重新评估风险
- Full Rollout 不代表长期验证结束
- Holdout 是可选的长期测量机制，不适用于所有实验
