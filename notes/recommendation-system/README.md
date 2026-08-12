# 推荐系统笔记｜Recommendation System Notes

本目录用于整理工业推荐系统相关知识，重点覆盖指标体系、实验平台验证、A/B Testing、Ramp-up 和完整的在线实验决策流程。

目标不是只解释算法或实验术语，而是建立一套可以用于实际工作的分析框架：

```text
Business Problem
↓
Metric Design
↓
Offline Evaluation
↓
Experiment Validation
↓
A/B Testing
↓
Ramp-up
↓
Full Rollout
↓
Long-term Measurement
```

## 文档目录

| 文档 | 文件 | 核心内容 |
|---|---|---|
| [Online Experiment Lifecycle](./online-experiment-lifecycle.md) | `online-experiment-lifecycle.md` | 整体 Overview：从模型开发、离线评估、A/A、A/B、Ramp-up 到 Full Rollout 和 Holdout。 |
| [Recommendation System Metrics](./metrics.md) | `metrics.md` | 消费、互动、留存、商业、广告、推荐质量和生态指标，以及 Metric Tree、实验指标角色和分群分析。 |
| [A/A Testing](./aa-testing.md) | `aa-testing.md` | 验证 Randomization、SRM、Logging、Metric Pipeline 和 Statistical Calibration 是否可信。 |
| [A/B Testing](./ab-testing.md) | `ab-testing.md` | 实验设计、Hash Bucketing、MDE、统计推断、异质性分析、实验 Readout 和上线决策。 |
| [Ramp-up](./ramp-up.md) | `ramp-up.md` | 灰度放量中的 Effect Stability、Guardrail、Segment、Data Quality，以及 Continue / Pause / Rollback 决策。 |

## 推荐阅读顺序

1. [Online Experiment Lifecycle](./online-experiment-lifecycle.md)
2. [Recommendation System Metrics](./metrics.md)
3. [A/A Testing](./aa-testing.md)
4. [A/B Testing](./ab-testing.md)
5. [Ramp-up](./ramp-up.md)

## 知识地图

### Online Experiment Lifecycle

先建立全局流程：

- 一个模型从开发到上线经历哪些阶段
- A/A Testing 什么时候需要
- A/B Testing 在哪里做因果验证
- SRM 在哪些阶段持续检查
- Ramp-up 如何连接实验与 Full Rollout
- Holdout 如何观察长期价值

### Recommendation System Metrics

建立实验和业务分析的语言：

- Primary、Secondary、Diagnostic、Guardrail 和 Data Quality Metrics
- Watch Time、CTR、QVR、Retention
- GMV、Revenue、Advertising Metrics
- Recommendation Quality
- Content / Creator Ecosystem
- Metric Aggregation、Metric Tree 和 Segment Analysis

### A/A Testing

回答：

```text
实验平台和数据链路值得信任吗？
```

重点包括：

- SRM
- Cross-over
- Logging Coverage
- Baseline Balance
- Metric Validation
- Statistical Calibration

### A/B Testing

回答：

```text
新模型是否真的带来因果增量？
```

重点包括：

- Experiment Unit
- Randomization
- Hash Bucketing / Salt
- Sample Size / MDE / Power
- Statistical Inference
- Confidence Interval
- Multiple Testing
- CUPED
- Heterogeneous Treatment Effects
- Experiment Readout

### Ramp-up

回答：

```text
模型通过实验后，能否安全扩大上线？
```

重点包括：

- Effect Stability
- Guardrail Monitoring
- Data Quality
- System Health
- Segment Risk
- Distribution Shift
- Continue / Pause / Rollback
- Full Rollout Readout

## 核心决策框架

整套文档可以最终归纳为：

```text
指标定义清楚吗？
    ↓
数据可信吗？
    ↓
实验设计有效吗？
    ↓
Treatment Effect 真实且有业务价值吗？
    ↓
关键 Guardrail 安全吗？
    ↓
关键 Segment 是否受损？
    ↓
扩大流量后效果是否稳定？
    ↓
Rollout / Iterate / Rollback
```
