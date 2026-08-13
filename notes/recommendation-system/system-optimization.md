# 推荐系统优化与诊断｜System Optimization

## 1. 优化不是模型清单

系统优化应从业务瓶颈和可验证机制开始：

```text
Metric movement
→ funnel decomposition
→ stage bottleneck
→ mechanism hypothesis
→ scoped change
→ offline evidence
→ online experiment
```

不要因为某个新模型流行就直接替换链路。先判断损失发生在候选覆盖、候选筛选、价值预估、列表组织、曝光记录还是交易质量。

## 2. 召回组合与配额

召回总量受粗排容量限制。新增通道若挤占更有效通道，可能提升自身命中却损害整体结果。评估至少包括：

- quota 与实际 return rate；
- unique contribution 和 channel overlap；
- 下游 pass / exposure / conversion；
- 各市场、类目和用户群的边际收益；
- 每单位 latency 或候选成本的业务价值。

通道价值应看“替代谁之后的边际增量”，而非孤立的历史归因 GMV。

### 2.1 配额优化

设渠道 `c` 分配 `k_c` 个候选，总预算为 `K`：

$$
\max_{k_1,\dots,k_C}\sum_c V_c(k_c),
\qquad \text{s.t. }\sum_c k_c\le K
$$

`V_c(k)` 通常具有边际收益递减，并受到渠道重叠影响。因此不能独立拟合每个渠道的价值后直接相加。可通过离线 replay、leave-one-channel-out、历史 quota 实验或小流量在线实验估计边际曲线。

## 3. 模型迭代路线

| 方向 | 典型假设 | 关键风险 |
|---|---|---|
| 新召回/表示 | 找到旧系统漏掉的高价值商品 | 重叠、热门偏差、索引新鲜度 |
| 粗排升级 | 更好保留精排高价值候选 | 延迟、teacher bias、slice 淘汰 |
| 精排多任务 | 更贴近交易与长期价值 | negative transfer、校准漂移 |
| 行为序列 | 捕捉 session 意图与兴趣演化 | 特征延迟、长序列成本 |
| 重排/探索 | 改善列表体验与供给学习 | 短期效用损失、规则冲突 |
| 在线学习 | 更快适应趋势和供给变化 | 反馈环、稳定性、回滚困难 |

## 4. 特殊人群与场景

新用户、低活用户、购买高意图用户以及不同市场的最优策略可能不同。分群策略应满足：

- 分群在处理前可定义；
- 有足够样本和稳定归属；
- 机制与特征可解释；
- 避免为了 subgroup lift 牺牲整体复杂度；
- 在线实验能识别交互效应。

## 5. 诊断优先于大改

推荐系统常见“便宜但高价值”的优化包括：

- 修复曝光/订单/退款归因；
- 恢复缺失或陈旧特征；
- 调整召回重叠与无效 quota；
- 修复库存、eligibility 和索引延迟；
- 改善概率校准和 score 融合；
- 定位重排规则冲突与异常 fallback。

这些改动可能比更复杂模型产生更确定的收益。

### 5.1 Stage Funnel SQL

```sql
WITH stage AS (
    SELECT
        request_id,
        item_id,
        MAX(CASE WHEN stage = 'recall' THEN 1 ELSE 0 END) AS recalled,
        MAX(CASE WHEN stage = 'prerank' THEN 1 ELSE 0 END) AS passed_prerank,
        MAX(CASE WHEN stage = 'rank' THEN 1 ELSE 0 END) AS entered_rank,
        MAX(CASE WHEN stage = 'exposure' THEN 1 ELSE 0 END) AS exposed
    FROM recommendation_stage_log
    WHERE event_date = '${date}'
    GROUP BY request_id, item_id
)
SELECT
    SUM(recalled) AS recalled_items,
    AVG(passed_prerank * 1.0 / NULLIF(recalled, 0)) AS recall_to_prerank,
    AVG(entered_rank * 1.0 / NULLIF(passed_prerank, 0)) AS prerank_to_rank,
    AVG(exposed * 1.0 / NULLIF(entered_rank, 0)) AS rank_to_exposure
FROM stage;
```

生产表通常需要先在 request-item 粒度去重，并按召回渠道、类目、新老商品、市场和实验组切片。不同阶段日志覆盖不一致时，比率变化可能只是 logging change。

### 5.2 GMV 分解

可从恒等式开始：

$$
GMV=Impression\times CTR\times CVR_{click}\times AOV
$$

实验的 GMV 变化可以进一步用对数近似分解：

$$
\Delta\log GMV\approx
\Delta\log Impression+\Delta\log CTR+
\Delta\log CVR+\Delta\log AOV
$$

这是一种诊断分解，不是因果归因；各组成项会共同受到 treatment 影响。

## 6. 优先级评分

可以用简化框架比较项目：

```text
Expected impact × Confidence × Reach
------------------------------------
Engineering + experiment + operational cost
```

Confidence 应来自数据质量、机制证据、离线回放和相似实验，而不是模型新颖度。

## 7. 实验与发布

每个优化都应绑定：

- 明确的 mechanism 与 primary metric；
- stage diagnostic 和 end-to-end business metrics；
- 用户、交易、生态与系统 guardrails；
- 预期 effect、MDE、实验周期和成熟窗口；
- ramp-up gate、owner 与 rollback 条件。

相关：[系统链路](./recommendation-system-pipeline.md)、[在线实验流程](./online-experiment-lifecycle.md)。

## 8. 模型监控

上线后至少需要四层监控：

| 层级 | 示例 |
|---|---|
| Data | 缺失率、延迟、取值范围、训练—服务偏差 |
| Model | score/embedding norm、calibration、drift |
| System | P50/P95/P99 latency、timeout、fallback |
| Business | CTR、CVR、Net GMV、退款和供给分布 |

Population Stability Index 可用于粗略监控分布变化：

$$
PSI=\sum_b(p_b-q_b)\log\frac{p_b}{q_b}
$$

PSI 对分桶敏感，也不能说明 drift 是否有害；它适合作为告警入口，而不是自动回滚的唯一依据。
