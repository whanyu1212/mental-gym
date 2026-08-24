# 重排与列表优化｜Re-ranking and Slate Optimization

<a name="top"></a>

## 目录

- [1. 从 point-wise score 到列表价值](#sec-1)
  - [1.1 相似度必须对应要控制的重复](#sec-1-1)
- [2. MMR](#sec-2)
- [3. 规则与约束](#sec-3)
  - [3.1 Hard、Soft 与 Relaxation](#sec-3-1)
  - [3.2 不同决策面的列表约束](#sec-3-2)
- [4. DPP](#sec-4)
  - [4.1 MMR 与 DPP 的区别](#sec-4-1)
  - [4.2 Fixed-K 目标、Cholesky 与 MGS](#sec-4-2)
  - [4.3 数值稳定与工程边界](#sec-4-3)
- [5. Learned Listwise Re-ranking](#sec-5)
- [6. Exploration vs Exploitation](#sec-6)
- [7. 指标体系](#sec-7)
- [8. 约束优化视角](#sec-8)
  - [8.1 位置约束与覆盖收益](#sec-8-1)
- [9. 工业案例：相关性高不等于列表好](#sec-9)
  - [9.1 短视频商品内容：视频看起来不同，绑定商品却相同](#sec-9-1)
  - [9.2 直播内容：多样性不能覆盖实时硬约束](#sec-9-2)
  - [9.3 商城搭配模块：替代品与互补品如何共同出现](#sec-9-3)
  - [9.4 商品详情页内容：互动最高不等于决策信息最完整](#sec-9-4)
  - [9.5 同一候选池：Rule、MMR 与 Greedy Log-det 如何比较](#sec-9-5)
- [10. 关联文档](#sec-10)

---

<a name="sec-1"></a>

## 1. 从 point-wise score 到列表价值

精排为单个候选估值，重排优化用户最终看到的 slate：

```text
relevance / commerce utility
+ diversity / freshness / exploration
- duplication / risk / constraint violation
```

在电商场景中，列表可能同时包含商品与带货内容，因此相似度可来自商品、类目、品牌、商家、内容语义、价格带和视觉表示。用于召回的 embedding 主要学习相关性，未必适合作为唯一的多样性表示；重排相似度应对应想要控制的重复维度。

<a name="sec-1-1"></a>

### 1.1 相似度必须对应要控制的重复

“两个候选相似”不是单一事实。两条视频可能画面不同但绑定同一商品；两个商品可能 SPU 相同但价格和履约不同；两个直播间可能主播不同却都在销售同一热门 SKU。可以把离散实体重复与连续语义相似组合成多层相似度：

```math
\mathrm{sim}(i,j)=
\sum_{m=1}^{M}w_m\mathbb{I}[z_i^{(m)}=z_j^{(m)}]
+w_e e_i^{\top}e_j
```

`z_i^(m)` 可以是 Product、SPU、Seller、Creator、Category 或 Price Band，`e_i` 可以是文本、视觉、音频或多模态内容向量。权重应按场景校准：搜索主结果更重视查询约束与 SPU，短视频商品内容同时需要内容与商品层去重，直播还要加入 Room Session 和当前商品。召回向量学到的是偏好共现，既可能把替代品拉近，也可能因长尾反馈不足而失真，因此它可以成为一项信号，但不应无条件充当唯一的多样性空间。

MMR 可以直接使用经尺度校准的相似度；DPP 则额外要求 Kernel 为 Positive Semidefinite。若单位向量余弦可能为负，并希望把相似度稳定映射到 `[0,1]`，可使用增广表示：

```math
\phi_i=\frac{1}{\sqrt{2}}[1;e_i],\qquad
S_{ij}=\phi_i^{\top}\phi_j=\frac{1+e_i^{\top}e_j}{2}
```

该变换仍然产生 Gram Kernel。多个 Component 各自为 PSD 且权重非负时，加权和仍为 PSD。若还希望组合后的 `S` 逐元素落在 `[0,1]` 且对角线为 1，每个 Component 本身都必须满足这两个条件，再用非负且权重和为 1 的凸组合；单纯对角归一化不能消除 Raw Cosine 的负值，后者需要先做上面的增广映射，或明确允许负相似度。PSD 只保证 Kernel 合法，不会自动保证尺度合适，也不会把质量与多样性解耦。简单拼接未经校准的 ID 指示、标签分数和余弦值，可能让某一维完全支配重排。

列表优化不一定只发生在最终一步：

- 粗排后：目标是保留精排可利用的全局候选覆盖，可用“高相关 Top-A + 多样化 Top-B”组成精排输入；
- 精排后：目标是用户实际看到的局部体验，更强调相邻位置、首屏和密度约束；
- 客户端分页后：需要跨页去重与已曝光状态，避免每页内部多样但页面之间重复。

粗排多样化不能牺牲精排高价值候选保留率；最终重排则必须测量相对原始精排的 utility loss。

<a name="sec-2"></a>

## 2. MMR

MMR 迭代选择“高分且与已选集合不太相似”的候选：

```text
MMR(i) = λ × utility(i) - (1-λ) × max similarity(i, selected)
```

Sliding-window MMR 只与最近 `W` 个位置比较，降低成本并重点控制局部重复。标准 MMR 对全部已选结果取最大相似度；随着集合变大，这个最大值通常会上升，后部位置可能受到越来越强的多样性惩罚。窗口化使惩罚更贴近相邻曝光，但会放弃远距离去重。`λ` 不是纯模型参数，它编码相关性与多样性的业务 trade-off，应通过离线回放和在线实验选择。

一个简化的商城商品卡例子：候选 A 是得分 `0.95` 的跑鞋，候选 B 是得分 `0.93` 的同款另一商家报价，候选 C 是得分 `0.89` 的运动背包。A 被选中后，如果 `sim(B,A)=0.95`、`sim(C,A)=0.20`，且相关性权重为 `0.8`，则 B 的 MMR 值约为 `0.554`，C 约为 `0.672`；第二个位置会选择 C。这里不是说 C 的单品价值高于 B，而是说“A+C”的列表信息量和购物覆盖可能高于“A+B”。若页面目标是严格比价，同款多 offer 反而可能有价值，此时相似度定义或业务约束就应改变。

直播列表也有相同问题：精排前几名可能都是同一类目、相似主播或同一热门商品。重排可以在不明显牺牲进房价值的前提下加入不同价格带或不同商品集合的房间，但“已下播”“风险状态异常”“当前商品缺货”属于 Hard Constraint，不能用多样性收益抵消。

```python
def mmr(scores, vectors, k, relevance_weight=0.8):
    if not 0.0 <= relevance_weight <= 1.0:
        raise ValueError("relevance_weight must be in [0, 1]")
    if len(scores) != len(vectors):
        raise ValueError("scores and vectors must have the same length")
    if not np.all(np.isfinite(scores)) or not np.all(np.isfinite(vectors)):
        raise ValueError("scores and vectors must be finite")
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    if np.any(norms <= 1e-12):
        raise ValueError("cosine similarity is undefined for zero vectors")
    vectors = vectors / norms
    selected = []
    remaining = list(range(len(scores)))

    while remaining and len(selected) < k:
        best_item, best_value = None, -np.inf
        for i in remaining:
            redundancy = 0.0
            if selected:
                redundancy = max(vectors[i] @ vectors[j] for j in selected)
            value = relevance_weight * scores[i] - (
                1.0 - relevance_weight
            ) * redundancy
            if not np.isfinite(value):
                continue
            if value > best_value or (
                value == best_value and (best_item is None or i < best_item)
            ):
                best_item, best_value = i, value
        if best_item is None:
            raise ValueError("no finite feasible MMR candidate")
        selected.append(best_item)
        remaining.remove(best_item)
    return selected
```

在使用前应归一化 Utility 与 Similarity，否则 `lambda` 无法稳定表达业务 Trade-off。原始 Cosine 允许负值，负相似度会在 MMR 中成为额外 Diversity Bonus；若业务只希望惩罚重复，应预先声明输入契约，并统一截断或映射到 `[0,1]`。线上还可只与最近窗口比较以控制复杂度。

朴素实现每一轮重新扫描全部已选集合，约为 `O(NK²d)`；若为每个剩余候选维护“与已选集合的最大相似度”，每轮只需和最新选中 item 比较，可降为约 `O(NKd)`。预计算完整相似矩阵需要 `O(N²d)` 计算和 `O(N²)` 内存，候选较多时未必划算。

<a name="sec-3"></a>

## 3. 规则与约束

常见约束包括：

- 同一商品、商家、品牌或类目不要连续过度出现；
- 控制价格带、内容形态和推广内容密度；
- 预留新商品或探索候选机会；
- 满足库存、安全、市场与合规条件；
- 避免规则冲突导致列表不足或强制低质量填充。

规则变更应版本化并记录每个候选的触发原因，否则很难区分模型效果与规则效果。

<a name="sec-3-1"></a>

### 3.1 Hard、Soft 与 Relaxation

- Hard constraint：安全、合规、不可售、直播已下播等绝不能违反；
- Soft constraint：类目密度、商家连续出现、价格带覆盖等可通过 penalty 权衡；
- Relaxation order：当候选不足时，预先定义按什么顺序放松 soft constraints，不能临时随机补齐；
- Feasibility logging：记录每个位置的可行候选数、被哪条规则过滤和是否触发 fallback。

规则的解释可以落到一次具体请求：如果首屏要求“同商家最多两张商品卡”，但过滤后只剩该商家的可售商品，系统应按预先定义的 Relaxation Order 放松商家密度，而不是随机塞入缺货商品。日志需要说明是“候选池不足触发放松”，否则看到商家集中度上升时，分析者可能误判为精排模型偏向该商家。

<a name="sec-3-2"></a>

### 3.2 不同决策面的列表约束

| Surface | 主要去重/多样性维度 | 必须重检的状态 | 常见列表风险 |
|---|---|---|---|
| 短视频商品内容流 | 视频语义、创作者、视觉模板、类目、绑定商品/商家 | 视频状态、商品绑定与库存 | 连续相似内容、同商品多视频占屏、交易内容密度过高 |
| 直播内容流 | 主播、room、当前商品、类目、价格带 | room online state、当前商品、库存、风险 | 同主播/同品类集中、下播房间、实时热门挤压长尾房间 |
| 商城商品卡 | SPU/SKU、品牌、商家、类目、价格带、替代/互补 | offer、价格、库存、配送 | 同款多 offer 重复、只展示替代品而缺少互补品、低价供给集中 |
| 商品搜索结果 | 查询意图、SPU/SKU、品牌、属性、价格带、替代关系 | 查询约束、offer、库存、配送 | 多样性破坏精确查询、同款报价占屏、过滤后列表不足 |
| 创作者商品橱窗 | 商品、商家、类目、价格带、人工置顶状态 | 商品可售性、合作关系、人工展示设置 | 热销商品固化头部、算法顺序覆盖创作者意图、不可售商品残留 |
| 商品详情页创作者内容 | 内容语义、创作者、卖点、形式和新鲜度 | 内容状态、与当前商品的精确绑定 | 高互动内容重复同一卖点、内容抢占购买路径、无关商品内容混入 |

短视频中“内容多样”与“商品多样”是两个目标：视频画面不同但都绑定同一商品，内容相似度可能很低而交易重复度仍很高。直播也不能只按主播 ID 去重，同一主播的不同 room session 与当前商品集合需要单独判断。搜索中的多样性必须服从显式查询约束；创作者橱窗还要区分人工顺序与算法顺序；详情页内容则应覆盖不同决策问题，而不是重复奖励同一种高互动表达。

<a name="sec-4"></a>

## 4. DPP

DPP 用集合的行列式同时表达候选质量与向量多样性，能够做全局集合选择；其优势是目标更接近 slate，代价是计算和近似实现更复杂。实际选择需比较 MMR、规则系统与 DPP 在相同延迟预算下的收益。

令 `q_i ≥ 0` 表示候选质量，`S` 是对称半正定的相似度核，DPP kernel 可写成：

```math
L_{ij}=q_iS_{ij}q_j,\qquad P(Y)\propto\det(L_Y)
```

此时 `L = diag(q) S diag(q)` 也是半正定矩阵，所有主子式行列式非负，才能定义合法概率。任意 pairwise 相似度表不一定满足该条件，通常需要由归一化 embedding Gram Matrix 或显式 PSD kernel 构造。若 `L_Y` 是候选向量的 Gram Matrix，`det(L_Y)` 对应这些向量张成的超平行体体积平方，而不是体积本身；若两个候选几乎线性相关，子矩阵接近奇异，集合概率会降低。实际 Top-K 常使用 greedy MAP approximation。

<a name="sec-4-1"></a>

### 4.1 MMR 与 DPP 的区别

MMR 使用当前候选与已选集合中“最相似商品”的惩罚，属于局部贪心准则；DPP 用 Gram 子矩阵行列式衡量整个集合张成空间的体积平方，属于全局集合多样性。

| 方法 | 多样性定义 | 典型复杂度 | 优势 | 局限 |
|---|---|---:|---|---|
| Rule-based | 类目/商家计数和间隔 | 近似 `O(NK)` | 可解释、可严格满足业务约束 | 规则冲突，无法自然衡量语义相似 |
| MMR | 与已选集合最大相似度 | 朴素约 `O(NK²d)`；增量约 `O(NKd)` | 简单、在线易实现、trade-off 直观 | 贪心且局部，依赖相似度尺度 |
| Sliding-window MMR | 与最近 `W` 个结果相似度 | 直接计算向量相似度时约 `O(NKWd)` | 控制局部重复并降低成本 | 无法控制远距离重复 |
| DPP | 集合 kernel determinant | Greedy + 增量 Cholesky 约 `O(NK²)`，另计 kernel | 全局表达质量与多样性 | MAP 本身困难，kernel 和数值稳定复杂 |
| Constrained Optimization | 显式目标与约束 | 依求解器而定 | 能表达硬约束和业务预算 | 延迟、无解与维护成本 |

复杂度取决于候选数、目标列表长度、向量维度和缓存实现，表中仅表示主要增长趋势。

<a name="sec-4-2"></a>

### 4.2 Fixed-K 目标、Cholesky 与 MGS

推荐列表通常固定选择 `K` 个候选，因此常优化 fixed-cardinality 的 k-DPP MAP 近似。若 `u_i` 是已校准的单候选 Utility，并令：

```math
q_i=\exp(\alpha u_i/2)
```

则对大小为 `K` 的集合 `Y`：

```math
\log\det(L_Y)
=\alpha\sum_{i\in Y}u_i+\log\det(S_Y)
```

第一项聚合质量，第二项奖励集合线性独立性。`alpha` 控制质量与多样性的相对尺度；它依赖 Ranker Score 的校准，精排版本变化后不能沿用旧值。这里优化的是 greedy MAP 近似，不是对 DPP 做随机采样，也不是精确求解全局最优 k-DPP。

贪心加入候选 `i` 时，边际 Log-determinant 可以通过增量 Cholesky 计算。若 `c_i` 表示候选相对于当前已选集合的 Cholesky 投影系数，则完整质量 Kernel `L` 上的残差为：

```math
d_{L,i}^2=L_{ii}-\lVert c_i\rVert_2^2
```

选择最大边际增益后，只需更新剩余候选的投影与残差，不必为每个候选从头计算 Determinant。若相似度 Kernel 写成 Gram 形式 `S_ij=v_i^T v_j`，Modified Gram–Schmidt 可以直接维护候选对已选子空间的残差：

```math
r_i^{(t)}=v_i-Q_tQ_t^{\top}v_i
```

```math
\rho_i^2=\lVert r_i^{(t)}\rVert_2^2,
\qquad
d_{L,i}^2=\exp(\alpha u_i)\rho_i^2
```

对严格为正的残差，原始 Greedy Log-determinant 边际分数是：

```math
\Delta_i=\log d_{L,i}^2
=\alpha u_i+\log\rho_i^2
```

残差范数越大，候选为当前集合增加的新方向越多。在相同 Gram Feature、Utility、Feasible Set 与 Tie-break 下，MGS 是同一 Greedy Log-determinant 步骤的计算后端，并避免显式构造完整 `N × N` Kernel；它不是独立的 Slate Objective、任意 Kernel 的通用替代，也不是全局 k-DPP 精确求解器。维护所有候选的 `d` 维残差时，主要计算量约为 `O(NKd)`。

<a name="sec-4-3"></a>

### 4.3 数值稳定与工程边界

- 普通实现若对每个候选反复做 Cholesky 求解，可能达到约 `O(NK³)`；复用增量投影后才接近 `O(NK²)`，完整 Kernel 构造还可能需要 `O(N²d)` 计算与 `O(N²)` 内存；
- 工程上不必物化 `q_i`，可以直接在 Log Domain 使用 `alpha * u_i`。Fixed-K 下对所有 Utility 减去同一常数不改变集合次序；缩放 Utility 会改变有效 `alpha`，必须同步吸收到 `alpha` 或重新调优；
- Residual Clamp 只能把数值容差内的微小负值修正为 0；显著负值说明 PSD、版本或实现错误，必须触发告警与 Fallback，不能继续选择；
- 若有效 Rank 小于 `K`，Residual 会真实退化。低于预声明阈值时应停止 Log-det 选择，再按确定性的 Utility 与 Constraint 补足列表；`epsilon` 不能恢复缺失的多样性方向；
- 若实现使用 `alpha * u_i + log(max(rho_i^2, epsilon))`，它优化的是稳定化 Surrogate。只有 Cholesky 与 MGS 使用完全相同的 Feature Map、Floor、Jitter 和 Tie-break 时才可比较；触发 Floor 后不再声称与原始 Log-determinant 严格等价；
- Jitter 会改变 Kernel 与目标，必须与 Similarity Version 一起版本化、回放调参并监控触发率；MGS 还需监控正交性，必要时重新正交化；
- Sliding-window Log-det 只在最近 `W` 个位置计算 Determinant-based Redundancy，不是让相似候选硬互斥。删除旧 Basis 需要稳定 Downdate 或窗口内重算，并会放弃远距离去重；
- DPP 选择的是集合，最终显示顺序仍需由 Greedy 选择顺序、原 Ranker Order 或 Position-aware Decoder 明确；同一集合的不同顺序可能产生不同首屏价值；
- Eligibility、安全、库存和直播在线状态应先作为 Hard Constraint 过滤。用 Jitter 把不合法或不满足业务资格的候选“数值修好”是错误做法。

线上至少拆分监控 Similarity/Kernel Build、Greedy Selection 和 Constraint Decode 的 P50/P95/P99，并记录 Jitter、容差内 Clamp、显著负 Residual、PSD Failure、Early Stop、Rank Deficiency、No-solution、Fallback 与最终 Utility Loss。

<a name="sec-5"></a>

## 5. Learned Listwise Re-ranking

规则、MMR 和 DPP 使用预先定义的列表效用；learned re-ranker 则让每个候选的分数依赖候选列表上下文：

```math
s'_i=f(x_i,\{x_j:j\in C\},position_i,context)
```

可使用 self-attention、set encoder 或轻量 Transformer 建模候选之间的竞争、互补和位置关系。相比 pointwise ranker，它能学习“两个高分候选同时出现未必最好”；相比手工 MMR，它不要求把所有关系压成一个固定相似度。

主要代价：

- 标准 self-attention 随候选数约为 `O(N²d)`，通常只能放在后置精排或小候选重排；
- 训练列表来自旧策略，存在 selection/position bias；
- 预测整页点击不等于直接优化长期 slate utility；
- hard constraints 仍应由确定性层保证，不能只依赖模型“学会不违规”。

实践中常采用“learned list score + constraint decoder”：模型负责软价值，解码器负责库存、安全、密度和配额。

<a name="sec-6"></a>

## 6. Exploration vs Exploitation

只利用高分候选会强化曝光与热门偏差，使新商品和新商家缺少学习机会。探索应明确：

- 探索单位、流量预算和 eligibility；
- 随机性是否稳定、能否归因；
- 用户体验和交易质量护栏；
- 获得的反馈如何回流训练与冷启动系统。

<a name="sec-7"></a>

## 7. 指标体系

| 目标 | 指标示例 |
|---|---|
| Utility | CTR、CVR、Net GMV、expected value |
| Diversity | intra-list distance、unique category/seller |
| Layered diversity | Unique Content、Creator、Product、SPU、Seller@K |
| Local repetition | Position-weighted ILD、Rolling-window Duplicate/Density |
| Concentration | top seller/item share、HHI、Gini |
| Freshness | new-item exposure/share/success |
| Experience | hide/report、quick skip、session depth |
| System | latency、constraint failure、fallback rate |
| Feasibility | feasible-candidate count、relaxation depth、rule-conflict / no-solution rate |
| Numerical stability | jitter、residual clamp、rank-deficiency、early-stop rate |

多样性指标提升本身不是成功，必须验证是否改善用户发现、交易或长期生态，并且没有牺牲关键护栏。

<a name="sec-8"></a>

## 8. 约束优化视角

重排的候选集合选择部分可写成带约束的 slate optimization：

```math
\max_{x}\sum_i u_i x_i
```

例如：

```math
\sum_i x_i=K,\qquad
\sum_{i:seller(i)=s}x_i\le b_s,\qquad
x_i\in\{0,1\}
```

还可加入类目覆盖、库存、安全和探索预算等约束。硬约束必须满足，软约束可作为 penalty 加入目标。规则较多时要明确优先级，否则可能出现无解、反复交换或低质量 fallback。

<a name="sec-8-1"></a>

### 8.1 位置约束与覆盖收益

只用 `x_i` 只能表达“候选是否进入无序集合”，不能表达前缀、连续位置和滑动窗口规则。令 `x_ip` 表示候选 `i` 是否放在位置 `p`，基本 Assignment Constraint 是：

```math
\sum_i x_{ip}=1\quad \forall p,
\qquad
\sum_p x_{ip}\le 1\quad \forall i,
\qquad
x_{ip}\in\{0,1\},\quad p=1,\ldots,K
```

若集合 `G` 表示同一商家、类目或推广类型，前 `h` 个位置至多允许 `b_Gh` 个，可写成：

```math
\sum_{p=1}^{h}\sum_{i\in G}x_{ip}\le b_{G,h}
```

长度为 `W` 的滑动窗口密度需要对每个窗口起点 `t` 施加：

```math
\sum_{p=t}^{t+W-1}\sum_{i\in G}x_{ip}
\le b_{G,W},
\qquad
t=1,\ldots,K-W+1
```

Hard Eligibility 应先过滤；当 Soft Constraint 互相冲突时，Decoder 按固定 Relaxation Order 放松，并记录触发规则、可行候选数和最终放松深度。

若目标是覆盖尚未满足的商品属性、卖点或用户意图，可使用边际收益递减的 Coverage Utility：

```math
f(Y)=\sum_{a\in A}w_a
[1-\prod_{i\in Y}(1-p_{ia})]
```

`p_ia` 表示候选 `i` 满足 Aspect `a` 的概率。当 `w_a >= 0`、`0 <= p_ia <= 1` 且 `f(empty)=0` 时，`f` 本身是归一化、单调的子模函数：一个 Aspect 已被高概率候选覆盖后，继续加入同类候选的边际收益变小。在 `|Y| <= K` 的简单 Cardinality Constraint 下，标准边际贪心具有经典的 `1 - 1/e` 近似保证；子模性不依赖 Cardinality，但该保证依赖约束形式。加入非单调 Utility、复杂位置约束或 Relaxation 后不能机械沿用。搜索中 Aspect 必须服从显式 Query Constraint；详情页内容可以把演示、规格、使用场景和注意事项作为 Aspect。

离线回放至少报告 constraint violation、utility loss、分布变化和运行时间；最终 trade-off 仍需在线实验验证。

---

<a name="sec-9"></a>

## 9. 工业案例：相关性高不等于列表好

以下数字为示意值。每个案例都先区分硬约束与软目标，再评价列表变化是否真正改善用户价值。

<a name="sec-9-1"></a>

### 9.1 短视频商品内容：视频看起来不同，绑定商品却相同

- **发生什么**：精排首屏 10 条内容来自 8 位创作者，内容向量的 Intra-list Distance 较高，但其中 6 条都绑定同一款美容仪；商品点击开始下降，重复负反馈上升。
- **列表问题**：只在视频语义空间做多样性，无法识别交易对象重复。内容多样性和商品多样性不是同一个目标。
- **正确做法**：同时建立视频、创作者、商品、商家和类目层级的相似度；将同商品连续曝光限制设为软约束，并在候选不足时按预先定义的顺序放松，而不是引入不可售内容。
- **应监控指标**：Unique Video/Creator/Product@K、同商品连续率、Intra-list Distance、Product Clicks per User、重复负反馈、Utility Loss 和 Relaxation Rate。

<a name="sec-9-2"></a>

### 9.2 直播内容：多样性不能覆盖实时硬约束

- **发生什么**：为提高类目覆盖，重排选择了精排分数较低的长尾直播间；整体 Unique Category@10 提升 20%，但 3% 的新增曝光来自刚刚下播或当前商品缺货的房间。
- **列表问题**：在线状态、风险和可售性属于硬约束，不能通过更高的多样性收益进行补偿。先做软目标优化再检查硬约束，会产生看似多样但无法消费的列表。
- **正确做法**：先删除不满足硬约束的 room session，再在有效候选中平衡进房价值、主播/商品集中度与探索预算；最终曝光前再次校验状态，并记录因候选不足触发的 fallback。
- **应监控指标**：Valid-at-exposure Rate、Unique Category/Host/Product@K、Quick Exit、缺货曝光率、Exploration Share、Constraint Violation、Fallback Rate 和重排 P99 延迟。

<a name="sec-9-3"></a>

### 9.3 商城搭配模块：替代品与互补品如何共同出现

- **发生什么**：用户进入跑鞋详情页后的“搭配购买”模块全部展示相似跑鞋，单卡相关性很高，但鞋袜、鞋垫和运动包几乎没有出现。加入少量互补商品后，示例单卡 CTR 下降 2%，每次访问加购件数提升 9%。
- **列表问题**：如果只最大化逐商品点击，系统倾向重复展示相互替代的高分商品；但在明确商品搜索主结果中强插互补品会破坏查询意图，互补覆盖更适合详情页、购物篮或独立搭配模块。
- **正确做法**：按模块目标设置配额：搜索主结果先满足 Query Relevance 与属性约束，搭配模块再增加互补品；用 SPU 去重、价格带覆盖与互补关系共同定义列表价值，并通过在线实验验证权衡。
- **应监控指标**：Unique SPU@K、Substitute/Complement Share、价格带覆盖、CTR、ATC Items per Visit、支付转化、成熟净价值、Seller Concentration 和 Utility Loss。

<a name="sec-9-4"></a>

### 9.4 商品详情页内容：互动最高不等于决策信息最完整

- **发生什么**：详情页内容模块按预测互动率取前 10 条后，8 条来自相似创作者并重复展示同一卖点。内容播放和互动上升，但 ATC per PDP、支付率与成熟净价值没有改善，页面延迟反而增加。
- **列表机制**：point-wise 互动分数偏好已经验证过的表达方式，却不知道多条内容会共同回答用户的决策问题。创作者不同不代表卖点、使用情境或风险说明不同；互动也不等于对购买决策有增量。
- **实现与决策**：先把内容可用、当前商品精确绑定和安全状态设为硬约束，再按创作者、卖点、内容形式和新鲜度做多维去重。可使用 MMR 或带约束解码器，在支付价值损失预算内覆盖演示、规格、使用场景和注意事项，并记录原始分数、重排原因与模块可见性。
- **应监控指标**：Eligible Content Coverage、Unique Creator/Claim@K、Content View and Dwell、ATC per PDP、Pay per PDP、成熟净价值、退款、Utility Loss、Constraint Relaxation 和 P99 延迟。
- **失败边界**：若上游策略也改变进入详情页的人群，PDP 访问者口径不能作为端到端因果结论；“观看过内容”的用户也是处理后子群。多样性提高但支付、长期质量或页面性能越过护栏时，不应仅凭互动增长上线。

<a name="sec-9-5"></a>

### 9.5 同一候选池：Rule、MMR 与 Greedy Log-det 如何比较

- **发生什么**：示例离线回放中，Rule、MMR 与 Greedy Log-det 都从相同 300 个合格候选选择 20 个结果。Rule 延迟最低但语义近重复仍多；MMR 明显改善最近 5 个位置的重复；Greedy Log-det 改善全局集合覆盖，但显式 Kernel + Cholesky 的 Kernel Build 使 P99 超出预算。
- **比较原则**：固定候选池、原始 Utility、硬约束、目标 `K`、相似度表示和延迟环境，比较 Rule、MMR 与 Greedy Log-det；再在 Log-det 内比较增量 Cholesky 与 MGS 两种计算后端。分别报告 Layered Unique@K、Prefix/Window Diversity、Utility Loss、Constraint/Relaxation、Kernel/Selection P99 与数值稳定事件。候选池或相似度不同，不能把差异归因于算法名称。
- **实现选择**：规则适合确定性资格和简单密度；MMR 适合低成本局部去重；Greedy Log-det 适合集合级多样性。相同 Gram Feature、Utility、Feasible Set、Tie-break 且数值 Floor/Jitter 未触发时，Cholesky 与 MGS 理论上选择相同 Greedy 集合；有限精度下仍要用回放实测一致性。Gram Feature 可用 MGS 避免显式完整 Kernel。若首屏最重要，可给位置加权或使用小窗口，不应为了全局多样性牺牲前几位 Relevance Floor。
- **上线决策**：离线 Pareto Frontier 只筛选候选方案。线上仍以每 Eligible User 的有效消费、成熟净价值、重复负反馈和长期供给集中度判断；多样性指标本身提高不能独立证明业务增量。

---

<a name="sec-10"></a>

## 10. 关联文档

[冷启动](./cold-start.md)、[指标](./metrics.md)。
