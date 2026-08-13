# 粗排与精排｜Pre-ranking and Ranking

## 1. Stage-wise Funnel

```text
Thousands of recalled candidates
→ lightweight pre-ranking
→ hundreds of candidates
→ full ranking
→ tens of candidates
→ re-ranking
```

粗排优化“计算预算内的优质候选保留”，精排优化“当前用户、上下文和候选的多目标价值”。模型复杂度必须与候选规模和延迟预算匹配。

## 2. 特征空间

- Buyer：ID/segment、长期偏好、近期行为、价格敏感度；
- Product：ID、类目、品牌、价格、折扣、库存、新鲜度；
- Seller：质量、履约、历史转化和风险信号；
- Content：作者、内容形态、语义和质量；
- Context：市场、入口、session、位置、时间与设备；
- Cross/sequence：buyer × product、query/context × product、LastN 行为。

任何线上特征都要检查训练—服务一致性、可用时间点和缺失 fallback，避免 label leakage。

## 3. 多任务预测

电商排序常同时估计：

```text
pCTR, pPDP, pATC, pOrder, pPay, expected AOV, pRefund
```

MMoE 使用共享 experts 和任务特定 gates，在共享信息的同时减少任务冲突。需要监控 negative transfer：一个目标提升可能损害另一个目标。

### 3.1 MMoE 结构

设第 `k` 个 expert 输出为 `E_k(x)`，任务 `t` 的 gate 为 `g_t(x)`：

$$
h_t(x)=\sum_{k=1}^{K}g_{t,k}(x)E_k(x),\qquad
g_t(x)=\text{softmax}(W_t x)
$$

每个任务再用独立 tower 输出预测。Gate 允许点击和购买任务以不同权重组合共享专家。

```python
class MMoE(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_experts, num_tasks):
        super().__init__()
        self.experts = nn.ModuleList([
            nn.Sequential(nn.Linear(input_dim, hidden_dim), nn.ReLU())
            for _ in range(num_experts)
        ])
        self.gates = nn.ModuleList([
            nn.Linear(input_dim, num_experts) for _ in range(num_tasks)
        ])
        self.towers = nn.ModuleList([
            nn.Linear(hidden_dim, 1) for _ in range(num_tasks)
        ])

    def forward(self, x):
        experts = torch.stack([expert(x) for expert in self.experts], dim=1)
        outputs = []
        for gate, tower in zip(self.gates, self.towers):
            weights = torch.softmax(gate(x), dim=1).unsqueeze(-1)
            task_hidden = (experts * weights).sum(dim=1)
            outputs.append(torch.sigmoid(tower(task_hidden)))
        return outputs
```

训练时常使用加权多任务损失 `L = Σ λ_t L_t`。稀疏购买任务的权重、样本率和梯度大小需要共同检查，不能只凭业务重要性机械放大 `λ_t`。

### 3.2 Shared-Bottom

最基础的多任务结构是共享底层表示、每个任务使用独立 tower：

$$
h=f_{shared}(x),\qquad
\hat y_t=f_t(h)
$$

$$
\mathcal L=\sum_{t=1}^{T}\lambda_t\mathcal L_t
$$

优点是参数和计算效率高；缺点是所有任务被迫共享同一个表示，当 CTR 与 CVR 的最优特征方向不同，会产生 negative transfer。

### 3.3 MMoE 为什么能缓解任务冲突

MMoE 的每个任务都有独立 gate，但共享 experts。若任务相关，gate 可以复用相同 experts；若任务冲突，gate 可以选择不同 experts。因此它比 Shared-Bottom 更灵活。

局限包括：

- Experts 仍完全共享，任务专属模式只能通过 gate 间接形成；
- Gate 可能塌缩到少数 experts，导致 expert utilization 不均衡；
- Expert 数、hidden dimension 和任务损失权重共同影响结果；
- MMoE 缓解而非消除 negative transfer。

可监控每个任务的平均 gate entropy 与 expert load：

$$
H(g_t)=-\sum_k g_{t,k}\log g_{t,k}
$$

Entropy 过低可能表示 gate 过早塌缩；但高度集中也可能是合理的任务专门化，需要结合效果判断。

### 3.4 PLE

Progressive Layered Extraction 同时设置 shared experts 与 task-specific experts。第 `l` 层任务 `t` 的表示为：

$$
h_t^{(l)}=g_t^{(l)}\left(
E_{t,1}^{(l)},\ldots,E_{t,K_t}^{(l)},
E_{s,1}^{(l)},\ldots,E_{s,K_s}^{(l)}
\right)
$$

任务 gate 可以选择专属 experts 和共享 experts；多层 CGC（Customized Gate Control）逐步分离共享信息与任务特定信息。

相比 MMoE：

- 优势：显式保留 task-specific capacity，通常更能控制 negative transfer；
- 局限：结构、参数和调参复杂度更高，任务很多时成本明显；
- 适用：任务相关性不均衡、任务冲突强且精排预算充足。

### 3.5 多任务模型对比

| 模型 | 共享方式 | Task-specific capacity | 优点 | 缺点 |
|---|---|---:|---|---|
| Separate Models | 不共享 | 强 | 无 negative transfer，易独立迭代 | 重复计算，无法利用任务相关性 |
| Shared-Bottom | 共享单一底层 | 仅 tower | 简单、便宜、稳定 | 容易 negative transfer |
| MMoE | 共享多个 experts，task gate 选择 | 间接 | 参数效率与任务分离的折中 | Experts 仍共享，可能 gate collapse |
| PLE | Shared + task-specific experts | 强 | 更精细地分离共享/专属知识 | 参数、服务和调参成本高 |

模型选择不应只看某个任务 AUC。需要检查 Pareto trade-off：一个方案若提升 CTR 却显著损害购买或订单质量，可能只是沿任务冲突方向移动。

## 4. 多目标融合

简化价值分解：

```text
Expected GMV ≈ pClick × pPurchase|Click × expected order value
```

线上 score 还可能加入用户价值、订单质量、新鲜度和风险约束。融合方法包括加权和、乘法、约束优化或学习排序。无论形式如何，都要回答：

- 权重对应什么业务 trade-off？
- 各任务是否校准、量纲是否稳定？
- score 改动是否改变价格带、类目和商家分布？
- 离线目标是否与在线 primary metric 对齐？

### 4.1 Entire-space Modeling

如果 CVR 只在点击样本上训练，会产生 sample-selection bias；同时购买样本远少于曝光样本。Entire-space 方法可分解：

$$
P(\text{purchase}\mid\text{impression})
=P(\text{click}\mid\text{impression})
\times P(\text{purchase}\mid\text{click})
$$

这样可在全曝光空间学习 `pCTR` 和 `pCTCVR`，再约束概率关系。分析时必须明确 CVR 的条件分母：曝光、点击、PDP 访问还是订单。

ESMM 的典型联合目标为：

$$
\mathcal L=\mathcal L_{CTR}(y,\hat p_{CTR})+
\mathcal L_{CTCVR}(y\cdot z,\hat p_{CTR}\hat p_{CVR})
$$

其中 `y` 表示点击，`z` 表示点击后的转化。模型不直接在全曝光空间监督 CVR，而是通过 `pCTCVR=pCTR×pCVR` 间接学习。

优势：

- 使用全曝光样本训练，缓解 clicked-sample selection bias；
- CTR 与 CVR embedding 共享，缓解转化标签稀疏。

局限：

- `pCVR=pCTCVR/pCTR` 可能产生数值放大与概率偏差；
- CTR 与 CVR 的共享可能引入任务冲突；
- 曝光但未点击的样本并没有可观测的真实 post-click conversion label；
- 它解决的是漏斗建模问题，不是通用的多任务专家结构，和 MMoE/PLE 并非互斥。

实践中可以用 ESMM 定义漏斗概率关系，再用 MMoE 或 PLE 作为底层表示结构。

### 4.2 Position Bias

训练日志来自旧排序策略，靠前商品更容易获得点击。常见处理包括 position feature、inverse propensity weighting、随机探索数据和 counterfactual learning。

$$
\mathcal{L}_{IPW}=\sum_i \frac{o_i}{P(o_i=1\mid position_i)}\ell(y_i,\hat y_i)
$$

IPW 在 propensity 很小时方差会很大，实践中通常需要 clipping 或 self-normalization。

## 5. Calibration

AUC 衡量相对排序能力，不保证概率准确。对价值乘积和跨场景阈值而言，calibration 尤其重要。

建议按市场、位置、类目和用户阶段检查：

- predicted vs observed rate；
- reliability curve / calibration error；
- score distribution 与 saturation；
- 新老模型的分布漂移。

```python
def expected_calibration_error(y_true, y_prob, bins=10):
    edges = np.linspace(0.0, 1.0, bins + 1)
    bucket = np.clip(np.digitize(y_prob, edges) - 1, 0, bins - 1)
    ece = 0.0
    for b in range(bins):
        mask = bucket == b
        if mask.any():
            ece += mask.mean() * abs(y_true[mask].mean() - y_prob[mask].mean())
    return ece
```

ECE 依赖分桶方式，最好同时展示 reliability diagram，并按关键 slice 检查，而不是只给一个全局数字。

## 6. 粗排诊断

粗排模型更便宜，但错误淘汰不可逆。重点指标包括：

- candidate pass rate；
- full-rank Top-K retention；
- 高 GMV/高购买概率候选保留率；
- 各召回通道、类目、价格带和新商品的 pass mix；
- inference latency、timeout 与 fallback。

蒸馏精排分数时，要检查 teacher bias 是否固化旧策略偏差。

## 7. 离线与在线评估

离线：AUC、PR-AUC、log loss、NDCG、calibration、slice metrics、latency。

在线：CTR、ATC、CVR、AOV、Gross/Net GMV、取消/退款、留存、seller/item coverage 和系统护栏。

离线提升只说明值得进入实验。最终上线依据见 [A/B Testing](./ab-testing.md) 和 [Ramp-up](./ramp-up.md)。

## 8. 常见误区

- 只看全量 AUC，忽略正例稀疏任务和关键 slice；
- 将 CTR 当作交易价值的充分代理；
- 分析精排却忽略召回/粗排候选集变化；
- 使用订单后才可见的特征造成泄漏；
- 新模型 score scale 改变，旧重排阈值仍直接复用；
- 模型平均收益为正，却损害关键市场或新用户。

## 9. Learning-to-Rank 目标

排序损失可以分为：

| 类型 | 学习对象 | 代表方法 | 特点 |
|---|---|---|---|
| Pointwise | 单个候选的标签/概率 | BCE、MSE | 简单，可自然支持多任务 |
| Pairwise | 正负候选的相对顺序 | BPR、hinge loss | 直接优化相对偏好 |
| Listwise | 整个候选列表 | ListNet、LambdaLoss | 更贴近 NDCG，但训练更复杂 |

BPR 的基本形式为：

$$
\mathcal{L}_{BPR}=-\log\sigma(s(u,i^+)-s(u,i^-))
$$

损失函数的选择应与线上展示方式、标签可靠性和最终业务目标一致。


模型细节：[特征交叉](./feature-interaction.md)、[用户行为序列](./user-behavior-sequence.md)、[重排](./reranking.md)。
