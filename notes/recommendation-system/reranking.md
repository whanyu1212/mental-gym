# 重排与列表优化｜Re-ranking and Slate Optimization

## 1. 从 point-wise score 到列表价值

精排为单个候选估值，重排优化用户最终看到的 slate：

```text
relevance / commerce utility
+ diversity / freshness / exploration
- duplication / risk / constraint violation
```

在 Shop 场景中，列表可能同时包含商品与带货内容，因此相似度可来自商品、类目、品牌、商家、内容语义、价格带和视觉表示。

## 2. MMR

MMR 迭代选择“高分且与已选集合不太相似”的候选：

```text
MMR(i) = λ × utility(i) - (1-λ) × max similarity(i, selected)
```

Sliding-window MMR 只与最近 K 个位置比较，降低成本并重点控制局部重复。`λ` 不是纯模型参数，它编码相关性与多样性的业务 trade-off，应通过离线回放和在线实验选择。

```python
def mmr(scores, vectors, k, relevance_weight=0.8):
    vectors = vectors / np.maximum(
        np.linalg.norm(vectors, axis=1, keepdims=True), 1e-12
    )
    selected = []
    remaining = set(range(len(scores)))

    while remaining and len(selected) < k:
        best_item, best_value = None, -np.inf
        for i in remaining:
            redundancy = 0.0
            if selected:
                redundancy = max(vectors[i] @ vectors[j] for j in selected)
            value = relevance_weight * scores[i] - (
                1.0 - relevance_weight
            ) * redundancy
            if value > best_value:
                best_item, best_value = i, value
        selected.append(best_item)
        remaining.remove(best_item)
    return selected
```

在使用前应归一化 utility 与 similarity，否则 `λ` 无法稳定表达业务 trade-off。线上还可只与最近窗口比较以控制复杂度。

## 3. 规则与约束

常见约束包括：

- 同一商品、商家、品牌或类目不要连续过度出现；
- 控制价格带、内容形态和推广内容密度；
- 预留新商品或探索候选机会；
- 满足库存、安全、市场与合规条件；
- 避免规则冲突导致列表不足或强制低质量填充。

规则变更应版本化并记录每个候选的触发原因，否则很难区分模型效果与规则效果。

## 4. DPP

DPP 用集合的行列式同时表达候选质量与向量多样性，能够做全局集合选择；其优势是目标更接近 slate，代价是计算和近似实现更复杂。实际选择需比较 MMR、规则系统与 DPP 在相同延迟预算下的收益。

令 `q_i ≥ 0` 表示候选质量，`S_ij` 表示相似度，DPP kernel 可写成：

$$
L_{ij}=q_iS_{ij}q_j,\qquad P(Y)\propto\det(L_Y)
$$

行列式同时奖励高质量和线性独立的向量。若两个候选几乎相同，子矩阵接近奇异，集合概率会降低。实际 Top-K 常使用 greedy MAP approximation。

### 4.1 MMR 与 DPP 的区别

MMR 使用当前候选与已选集合中“最相似商品”的惩罚，属于局部贪心准则；DPP 用子矩阵行列式衡量整个集合张成空间的体积，属于全局集合多样性。

| 方法 | 多样性定义 | 典型复杂度 | 优势 | 局限 |
|---|---|---:|---|---|
| Rule-based | 类目/商家计数和间隔 | 近似 `O(NK)` | 可解释、可严格满足业务约束 | 规则冲突，无法自然衡量语义相似 |
| MMR | 与已选集合最大相似度 | 朴素约 `O(NK²)` | 简单、在线易实现、trade-off 直观 | 贪心且局部，依赖相似度尺度 |
| Sliding-window MMR | 与最近 `W` 个结果相似度 | 约 `O(NKW)` | 控制局部重复并降低成本 | 无法控制远距离重复 |
| DPP | 集合 kernel determinant | 精确选择昂贵，常用 greedy | 全局表达质量与多样性 | kernel 构造和数值稳定复杂 |
| Constrained Optimization | 显式目标与约束 | 依求解器而定 | 能表达硬约束和业务预算 | 延迟、无解与维护成本 |

复杂度取决于候选数、目标列表长度、向量维度和缓存实现，表中仅表示主要增长趋势。

## 5. Exploration vs Exploitation

只利用高分候选会强化曝光与热门偏差，使新商品和新商家缺少学习机会。探索应明确：

- 探索单位、流量预算和 eligibility；
- 随机性是否稳定、能否归因；
- 用户体验和交易质量护栏；
- 获得的反馈如何回流训练与冷启动系统。

## 6. 指标体系

| 目标 | 指标示例 |
|---|---|
| Utility | CTR、CVR、Net GMV、expected value |
| Diversity | intra-list distance、unique category/seller |
| Concentration | top seller/item share、HHI、Gini |
| Freshness | new-item exposure/share/success |
| Experience | hide/report、quick skip、session depth |
| System | latency、constraint failure、fallback rate |

多样性指标提升本身不是成功，必须验证是否改善用户发现、交易或长期生态，并且没有牺牲关键护栏。

## 7. 约束优化视角

重排也可写成带约束的 slate optimization：

$$
\max_{x}\sum_i u_i x_i
$$

subject to：列表长度、同商家上限、类目覆盖、库存、安全和探索预算等约束。硬约束必须满足，软约束可作为 penalty 加入目标。规则较多时要明确优先级，否则可能出现无解、反复交换或低质量 fallback。

离线回放至少报告 constraint violation、utility loss、分布变化和运行时间；最终 trade-off 仍需在线实验验证。

相关：[冷启动](./cold-start.md)、[指标](./metrics.md)。
