# 电商推荐业务背景｜E-commerce Recommendation Context

本文介绍电商推荐系统中的业务对象、交易漏斗和分析框架。

## 1. 核心问题

推荐系统需要把策略变化转化为可检验、可诊断、可上线的业务决策：

```text
用户或供给问题
→ 机制假设
→ 指标与数据定义
→ 离线证据
→ 在线因果实验
→ 漏斗与异质性诊断
→ Ramp-up / Rollback / Iteration
```

典型工作不止是“算显著性”，还包括：

- 定义成功标准、护栏和最小有意义提升；
- 评估候选、模型分数与线上业务结果之间的传导；
- 识别埋点、归因、选择偏差和实验污染；
- 解释买家、商品、内容、商家与市场之间的异质性；
- 将 readout 转成可执行的发布或迭代建议。

## 2. 业务对象

| 对象 | 关键问题 |
|---|---|
| Buyer | 当前意图是什么？体验和长期价值是否改善？ |
| Product | 是否可售、有库存、有竞争力并适合当前市场？ |
| Content | 是否有效表达商品价值并驱动高质量交易？ |
| Seller | 流量、成交和成长机会是否健康？履约质量如何？ |
| Market | 语言、物流、价格、供给密度和用户习惯有何差异？ |
| Platform | 延迟、稳定性、安全、合规和长期生态是否可控？ |

## 3. Commerce Funnel

```text
Eligible impression
→ Visible impression
→ Click
→ Product detail page
→ Add to cart
→ Order created
→ Paid order
→ Fulfilled order
→ Refund / Return
→ Repeat purchase / Retention
```

每一步都必须明确事件定义与归因窗口。尤其要区分 Gross GMV 与扣除取消、退款后的 Net GMV，以及订单创建与支付完成。

## 4. 三类价值的平衡

推荐策略需要同时考虑：

1. 买家价值：相关性、发现感、信任、购买效率与留存；
2. 商业价值：高质量订单、GMV、收入及长期购买价值；
3. 生态价值：新商品发现、商家覆盖、流量集中度与供给成长。

单一 CTR 优化可能制造点击诱导；单一 GMV 优化可能过度偏向高价或头部商品。因此实验通常需要多目标指标体系和列表级约束。

## 5. 常见分析切片

- 用户：新老、活跃度、购买阶段、价格偏好；
- 供给：新老商品、类目、价格带、库存、商家规模；
- 场景：推荐入口、session 深度、位置、内容形态；
- 环境：市场、语言、设备、网络、应用版本；
- 交易：订单金额、取消/退款、履约与归因成熟度。

切片应由机制假设驱动并尽量预注册，避免在结果出来后无限寻找显著 subgroup。

## 6. 标准分析产出

一份可复用的分析产出通常包括：

- Problem statement 与机制图；
- Metric contract 与 sample-size / MDE 评估；
- 数据质量和实验有效性检查；
- Overall + funnel + segment + distribution 分析；
- Effect size、置信区间与风险说明；
- Go / Iterate / No-Go 建议及下一步验证。

相关入口：[系统链路](./recommendation-system-pipeline.md)、[指标](./metrics.md)、[在线实验流程](./online-experiment-lifecycle.md)。
