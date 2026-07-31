# A/A Testing

## 1. 概述

A/A Testing 是一种用于验证实验平台可靠性的在线实验方法。

实验中的 Control 和 Treatment 使用完全相同的模型、策略或页面：

```text
Control:   Existing Strategy A
Treatment: Existing Strategy A
```

由于两组没有真实策略差异，核心指标应只出现合理的随机波动，而不应存在持续性的系统偏差。

A/A Testing 主要回答：

> 当两组接受完全相同的处理时，实验平台能否得到稳定、合理且可解释的结果？

---

## 2. A/A Testing 与 A/B Testing

| 对比项 | A/A Testing | A/B Testing |
|---|---|---|
| Control | 策略 A | 策略 A |
| Treatment | 策略 A | 策略 B |
| 是否存在真实策略变化 | 否 | 是 |
| 主要目的 | 验证实验平台 | 验证模型或产品策略 |
| 发现显著差异时 | 优先排查平台、埋点和统计问题 | 可能存在真实策略效果 |
| 是否每次实验都需要 | 否 | 在线决策通常需要 |

A/A Testing 不是每个 A/B Test 的固定前置步骤。成熟实验平台通常只在平台上线、核心逻辑变更或数据链路升级时执行 A/A Testing。

---

## 3. A/A Testing 验证什么

### 3.1 随机分流

需要验证实验单位是否被稳定、均匀地分配到不同实验组。

```text
Experiment Unit ID
        ↓
Hash(Unit ID + Experiment Salt)
        ↓
Bucket
        ↓
Control / Treatment
```

重点检查：

- 同一个实验单位是否稳定留在同一组
- 不同组之间是否存在明显人群偏差
- Bucket 分布是否异常集中
- 实际分组比例是否符合实验配置

### 3.2 Sample Ratio Mismatch

假设实验配置为：

```text
Expected:
Control   = 50%
Treatment = 50%
```

如果实际结果长期接近：

```text
Observed:
Control   = 46%
Treatment = 54%
```

则可能发生 Sample Ratio Mismatch，简称 SRM。

SRM 通常意味着以下环节存在问题：

- 分流逻辑
- 曝光资格
- 用户过滤
- 日志采集
- 数据处理

### 3.3 埋点一致性

即使两组使用相同策略，如果某一组的曝光、点击或转化日志存在漏报，也可能产生虚假的指标差异。

例如：

```text
CTR = Clicks / Impressions
```

如果 Treatment 少记录了部分曝光，CTR 会被人为抬高。

### 3.4 指标计算

A/A Testing 可以帮助验证：

- 指标口径是否一致
- 聚合粒度是否正确
- 去重逻辑是否正确
- 实验组标签是否正确
- ETL 与 Dashboard 是否一致
- Ratio of Sums 与 Average of Ratios 是否被混用

### 3.5 统计检验

在没有真实差异时，统计检验仍可能因为随机波动偶尔得到显著结果。

当显著性水平为 5% 时，大量独立 A/A 实验中，理论上可能约有 5% 出现假阳性。

因此，不能仅凭一次 A/A Test 的 p-value 大于 0.05，就认定实验平台完全可靠。更稳健的验证方式包括：

- 重复运行多个 A/A Test
- 观察 p-value 的整体分布
- 检查置信区间是否围绕 0 波动
- 检查不同指标的假阳性率
- 检查结果是否存在持续性的单边偏移

---

## 4. 什么时候需要 A/A Testing

### 4.1 实验平台首次上线

需要验证完整链路：

```text
Randomization
    ↓
Bucketing
    ↓
Exposure
    ↓
Logging
    ↓
Metric Pipeline
    ↓
Statistical Analysis
    ↓
Dashboard
```

### 4.2 修改随机化或分桶逻辑

例如：

- 更换 Hash 算法
- 修改 Experiment Salt 规则
- Bucket 数量从 1,000 调整为 10,000
- 实验单位从 Device ID 改为 User ID
- 修改实验层或互斥逻辑

### 4.3 修改埋点或数据链路

例如：

- 客户端埋点迁移到服务端
- 曝光定义发生变化
- 点击去重逻辑发生变化
- ETL Pipeline 重构
- 实时指标链路上线

### 4.4 新增关键指标

新指标正式用于实验决策前，可以通过 A/A Testing 验证其稳定性和统计特征。

### 4.5 多个实验同时出现异常

如果多个 A/B Test 同时出现难以解释的偏移，可以通过 A/A Test 判断问题是否来自实验基础设施。

---

## 5. A/A Testing 的实验设计

### 5.1 两组必须使用相同策略

例如推荐排序实验：

```text
Control:
Existing Ranking Model

Treatment:
Existing Ranking Model
```

不仅模型版本要相同，以下配置也应保持一致：

- 特征版本
- 召回策略
- 排序参数
- 缓存策略
- 客户端版本要求
- 降级逻辑
- 曝光资格

### 5.2 使用与正式实验相同的实验单位

| 实验单位 | 常见场景 |
|---|---|
| User ID | 登录用户长期体验 |
| Device ID | 匿名用户或设备级体验 |
| Session ID | 会话级策略 |
| Creator ID | 创作者侧实验 |
| Region | 地区或市场级实验 |
| Time Window | Switchback Experiment |

### 5.3 使用真实实验平台

A/A Test 应经过正式的分流、埋点、指标和统计链路，而不是单独编写临时代码。

### 5.4 覆盖主要业务周期

运行时间应尽量覆盖：

- 工作日与周末
- 日间与夜间
- 新用户与老用户
- 高峰与低峰流量

A/A Test 不一定需要像业务 A/B Test 一样追求最小可检测效果，但必须有足够样本发现系统性问题。

---

## 6. A/A Testing 的分析框架

### 6.1 检查 SRM

```text
Observed Treatment Ratio
= Treatment Users / Total Experiment Users
```

如果实际比例明显偏离预期，应先暂停业务指标分析并排查数据链路。

### 6.2 检查实验前均衡性

常见基线变量包括：

- 历史活跃度
- 历史 CTR
- 历史观看时长
- 历史付费金额
- 国家和地区
- 设备类型
- 用户生命周期
- 新老用户比例

有限样本下，两组不会在所有变量上完全相同，但不应出现大规模、持续性偏差。

### 6.3 检查核心指标差异

重点关注：

- Absolute Difference
- Relative Difference
- Confidence Interval
- p-value
- Standard Error
- Variance

A/A Test 的理想结果不是所有指标完全相等，而是：

- 差异围绕 0 随机波动
- 没有长期单边偏移
- 大部分置信区间覆盖 0
- 假阳性比例与显著性水平大致一致

### 6.4 检查指标方差

如果某组方差明显更高，可能存在：

- 日志重复
- 用户跨组
- 极端值处理不一致
- 分组后过滤条件不一致
- 指标聚合粒度错误

### 6.5 检查时间趋势

不要只看实验结束时的最终结果。应按小时或按天观察：

```text
Control Metric
Treatment Metric
Treatment - Control
```

如果差异在某次版本发布、数据任务切换或流量高峰后突然出现，通常说明存在系统问题。

---

## 7. 推荐系统示例

### 7.1 实验配置

| 项目 | 配置 |
|---|---|
| Experiment Unit | User ID |
| Control Traffic | 50% |
| Treatment Traffic | 50% |
| Control Strategy | Ranking Model V1 |
| Treatment Strategy | Ranking Model V1 |
| Primary Metric | Watch Time per User |
| Secondary Metrics | CTR、Completion Rate、Retention |
| Guardrail Metrics | Crash Rate、Latency、Complaint Rate |

### 7.2 预期结果

```text
Treatment Effect ≈ 0
```

允许存在随机波动，但不应出现稳定、持续且无法解释的差异。

### 7.3 异常示例

```text
CTR:
Control   = 10.0%
Treatment = 11.2%

Relative Difference = +12.0%
```

由于两组策略相同，应优先排查：

1. 是否存在 SRM
2. Treatment 是否漏记曝光
3. 用户是否跨组
4. 两组曝光资格是否一致
5. 是否存在客户端版本差异
6. 指标 SQL 是否使用不同过滤条件
7. 是否只是随机假阳性

---

## 8. A/A Test 显著时如何排查

```text
A/A Test 出现显著差异
        ↓
检查 SRM
        ↓
检查分流与实验单位
        ↓
检查曝光资格
        ↓
检查埋点完整性
        ↓
检查 ETL 与指标口径
        ↓
检查客户端和服务端版本
        ↓
检查多重检验与随机假阳性
```

### 8.1 检查用户跨组

确认同一个 Experiment Unit ID 是否同时出现在 Control 和 Treatment。

### 8.2 检查曝光资格

即使分桶正确，如果两组进入实验的资格条件不同，也会产生选择偏差。

### 8.3 检查日志完整性

比较两组：

- 曝光日志数量
- 点击日志数量
- 用户覆盖率
- 日志延迟
- 空值比例
- 重复记录比例

### 8.4 检查统计假阳性

单个指标偶尔显著不一定代表平台异常。

如果同时检查 100 个独立指标，即使所有指标都没有真实差异，也可能出现若干显著结果。

---

## 9. A/A Testing 与 SRM

| 项目 | A/A Testing | SRM Check |
|---|---|---|
| 主要目的 | 验证实验平台整体可靠性 | 检查实际样本比例是否符合预期 |
| 是否需要相同策略 | 是 | 不要求 |
| 检查范围 | 分流、日志、指标、统计分析 | 样本数量和比例 |
| 是否应用于 A/B Test | 间接 | 每个在线实验都应执行 |
| 是否持续执行 | 通常用于平台验证 | 实验期间持续检查 |

SRM Check 是 A/A Testing 的重要组成部分，但它也必须应用于正常的 A/B Test。

---

## 10. 常见误区

### 10.1 每个 A/B Test 前都必须运行 A/A Test

错误。成熟实验平台通常已经通过 A/A、Canary 和持续监控完成验证。

### 10.2 A/A Test 的所有指标都必须完全相同

错误。随机抽样必然产生波动，重点是差异是否符合随机波动。

### 10.3 A/A Test 不显著就证明平台没有问题

错误。一次不显著不能证明系统完全正确，还需要结合 SRM、日志完整性、均衡性和时间趋势判断。

### 10.4 A/A Test 显著一定说明平台有 Bug

不一定。也可能是随机假阳性、多重检验或极端值造成，需要系统排查。

### 10.5 SRM 正常就代表实验完全可信

错误。SRM 只验证样本数量比例，无法发现埋点差异、指标口径错误或用户跨组。

---

## 11. 检查清单

### 实验配置

- [ ] Control 和 Treatment 使用完全相同的策略
- [ ] 实验单位与正式 A/B Test 一致
- [ ] Hash、Salt 和 Bucket 配置正确
- [ ] 流量比例正确
- [ ] 实验组互斥逻辑正确

### 数据质量

- [ ] 无 SRM
- [ ] 用户不会跨组
- [ ] 两组曝光资格一致
- [ ] 两组日志覆盖率一致
- [ ] 指标计算口径一致
- [ ] Dashboard 与离线查询结果一致

### 统计分析

- [ ] 基线变量基本均衡
- [ ] 指标差异围绕 0 波动
- [ ] 置信区间合理
- [ ] 没有持续性单边偏移
- [ ] 已考虑多重检验
- [ ] 已检查按时间拆分的结果

---

## 12. 总结

A/A Testing 的核心不是比较两个相同策略，而是验证实验系统能否正确完成随机分流、日志采集、指标计算和统计分析。

它通常用于：

- 实验平台首次上线
- 分流逻辑发生重大变化
- 实验单位或 Bucket 规则变化
- 埋点和数据链路升级
- 新指标正式投入使用
- 多个实验同时出现异常

A/A Testing 不是每个 A/B Test 的固定前置步骤。成熟平台通常通过周期性 A/A、SRM 检查、Canary 实验和数据质量监控持续保证实验系统的可靠性。
