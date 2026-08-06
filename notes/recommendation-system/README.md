# 推荐系统笔记｜Recommendation System Notes

本目录用于整理工业推荐系统相关知识，重点覆盖在线实验流程、指标体系、实验平台验证和 A/B Testing。

## 文档目录

| 文档 | 文件 | 内容 |
|---|---|---|
| [Online Experiment Lifecycle](./online-experiment-lifecycle.md) | `online-experiment-lifecycle.md` | 从模型开发、离线评估和实验准备，到 A/A Testing、A/B Testing、Ramp-up、Full Rollout 和 Long-term Holdout 的完整流程。 |
| [Recommendation System Metrics](./metrics.md) | `metrics.md` | 用户消费、互动、留存、商业转化、广告、推荐质量和内容生态指标。 |
| [A/A Testing](./aa-testing.md) | `aa-testing.md` | 验证随机分流、埋点、指标链路和统计检验是否可靠。 |
| [A/B Testing](./ab-testing.md) | `ab-testing.md` | 介绍实验单位、随机分流、哈希分桶、SRM、样本量、统计推断、放量、回滚和长期实验机制。 |

## 推荐阅读顺序

1. [Online Experiment Lifecycle](./online-experiment-lifecycle.md)
2. [Recommendation System Metrics](./metrics.md)
3. [A/A Testing](./aa-testing.md)
4. [A/B Testing](./ab-testing.md)

## 内容范围

### Online Experiment Lifecycle

- 模型开发与离线评估
- 实验准备检查
- A/A Testing 与 A/B Testing 的决策流程
- SRM 和 Guardrail Metrics 持续监控
- Ramp-up、Rollback 与 Full Rollout
- Long-term Holdout 与长期效果验证

### Recommendation System Metrics

- Primary、Secondary 和 Guardrail Metrics
- 用户消费、互动和留存指标
- 商业转化、广告和收入指标
- 推荐质量与内容生态指标
- 指标定义、聚合方式和常见陷阱

### A/A Testing

- 实验平台验证
- 随机分流与样本比例检查
- Sample Ratio Mismatch（SRM）
- 埋点和指标链路验证
- Baseline Balance 与 Statistical Calibration
- 异常排查与检查清单

### A/B Testing

- Experiment Unit 与 Randomization
- Hash Bucketing、Salt 和 Experiment Layer
- 实验假设与指标设计
- Sample Size、MDE 和 Statistical Power
- Statistical Testing、Confidence Interval 和 Multiple Testing
- Peeking、Variance Reduction 和 Network Effects
- Ramp-up、Rollback、Holdout 和 Reverse Experiment
