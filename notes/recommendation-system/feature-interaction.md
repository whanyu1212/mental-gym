# 特征交叉模型｜Feature Interaction Models

## 1. 为什么需要交叉

电商行为通常由条件组合决定：`用户价格偏好 × 商品价格`、`市场 × 类目`、`近期兴趣 × 候选商品`。线性模型只能为单特征加权，难以表达这些条件效应。

## 2. 模型速查

| 模型 | 核心机制 | 适用理解 |
|---|---|---|
| FM | embedding 内积表达二阶交叉 | 稀疏类别特征中的低阶关系 |
| DeepFM | FM + DNN，共享 embedding | 同时学习低阶与高阶关系 |
| DCN | Cross Network + Deep Network | 显式构造有界阶数的交叉 |
| FiBiNET | SENet + Bilinear interaction | 先重标 field，再学习 field pair 交互 |
| PPNet/LHUC | 个性化调节隐藏单元贡献 | 大模型中的参数化个性化 |

模型并非越复杂越好；候选规模、延迟、训练稳定性和线上增量共同决定阶段位置。

### 2.1 统一记号

设一个样本包含 `m` 个 feature fields，每个 field 的 embedding 为

$$
e_i\in\mathbb{R}^k,\qquad i=1,\ldots,m
$$

将所有 field 拼接为：

$$
x_0=[e_1;e_2;\ldots;e_m]\in\mathbb{R}^{mk}
$$

不同模型的核心区别，是如何从 `e_i` 或 `x₀` 中构造交互：

- FM：所有 field pair 使用 embedding inner product；
- DeepFM：FM 二阶交互与 DNN 隐式高阶交互并行；
- DCN：通过 Cross Layer 显式生成有界阶数交互；
- xDeepFM：在 vector-wise 层面显式生成高阶交互；
- FiBiNET：先学习 field importance，再做参数化二阶交互。

## 3. FM 与 DeepFM

FM 以低维 embedding 的内积代替每个特征对的独立参数，使稀疏交叉可以共享统计强度。DeepFM 加入 DNN 学习高阶非线性，同时保留 FM 的二阶归纳偏置。

评估时需要关注：新交叉是否改善稀疏 slice、是否过拟合热门 ID、是否在重要市场校准，以及推理成本是否挤压候选规模。

### 3.1 FM 公式

对输入 `x ∈ Rᵈ`，二阶 FM 为：

$$
\hat{y}=w_0+\sum_{i=1}^{d}w_ix_i+
\sum_{i=1}^{d}\sum_{j=i+1}^{d}\langle v_i,v_j\rangle x_ix_j
$$

直接计算所有特征对需要 `O(d²k)`；利用恒等式可降为 `O(dk)`：

$$
\frac{1}{2}\sum_{f=1}^{k}
[(\sum_i v_{i,f}x_i)^2-
\sum_i v_{i,f}^2x_i^2]
$$

```python
def fm_second_order(x, embeddings):
    # x: [batch, fields], embeddings: [batch, fields, dim]
    vx = embeddings * x.unsqueeze(-1)
    square_of_sum = vx.sum(dim=1).pow(2)
    sum_of_square = vx.pow(2).sum(dim=1)
    return 0.5 * (square_of_sum - sum_of_square).sum(dim=1)
```

DeepFM 将这一路 FM 输出与同一组 embedding 的 DNN 输出相加，减少手工交叉并共享底层表示。

## 4. DCN

Cross Network 显式构造输入的高阶交互，Deep Network 捕捉更一般的非线性。适合检验“明确交叉结构是否比纯 MLP 更有效”。需比较参数量和延迟相近的基线，避免把容量增益误解为结构增益。

经典 cross layer：

$$
x_{l+1}=x_0(x_l^T w_l)+b_l+x_l
$$

堆叠 `L` 层可形成最高 `L+1` 阶的显式交叉。DCN-V2 使用矩阵或低秩 mixture-of-experts 形式提升表达能力，但也增加计算和过拟合风险。

### 4.1 为什么 Cross Layer 是显式交叉

第一层包含 `x₀` 的二阶项，第二层继续将 `x₀` 与上一层相乘，因此逐层增加交叉阶数。残差项 `+x_l` 保留低阶信息并改善梯度传播。

经典 DCN 的每层参数量约为 `O(d)`，其中 `d=mk`；表达能力较受限制。DCN-V2 使用：

$$
x_{l+1}=x_0\odot(W_lx_l+b_l)+x_l
$$

完整矩阵参数量为 `O(d²)`。低秩分解 `W=UVᵀ` 可将参数量降为 `O(dr)`。

## 5. xDeepFM

xDeepFM 的 Compressed Interaction Network（CIN）在 vector-wise 层面构造显式高阶交互。令 `X⁰∈R^{m×k}` 为原始 field embeddings，第 `l` 层第 `h` 个 feature map 可写为：

$$
X_{h,:}^{l}=\sum_{i=1}^{H_{l-1}}\sum_{j=1}^{m}
W_{ij}^{l,h}(X_{i,:}^{l-1}\odot X_{j,:}^{0})
$$

其中 `⊙` 是 Hadamard product。CIN 保留 embedding 维度上的结构，并逐层产生更高阶 field interaction。

优势：

- 显式高阶交互，比纯 DNN 更容易表达组合结构；
- vector-wise interaction 比 bit-wise MLP 更贴近 field embedding；
- 与 linear、DNN 分支组合后兼顾低阶与隐式高阶信息。

局限：

- CIN 的张量交互带来较高内存和计算成本；
- layer width 与 split-half 等结构超参数较多；
- 高阶交互不一定带来线上收益，尤其在样本稀疏或强 ID 特征场景。

## 6. FiBiNET

SENet 学习 field importance，Bilinear 层为特征对引入更灵活的变换。它适合大量 categorical fields 的 CTR/CVR 场景，但 field 权重不应直接解释为因果重要性。

### 6.1 SENet 的数学形式

先对每个 field embedding 做 squeeze：

$$
z_i=\frac{1}{k}\sum_{t=1}^{k}e_{i,t},
\qquad z\in\mathbb{R}^{m}
$$

再通过两层网络得到 field-wise 权重：

$$
a=\sigma(W_2\,\delta(W_1z)),
\qquad \tilde e_i=a_i e_i
$$

`δ` 通常为 ReLU，`σ` 可为 sigmoid。这里的权重由当前样本动态生成，而不是每个 field 一个固定全局权重。

### 6.2 Bilinear Interaction

FiBiNET 常见的 vector-valued bilinear interaction 为：

$$
p_{ij}=(W_{ij}e_i)\odot e_j
$$

根据参数共享方式可分为：

- Field-All：所有 field pair 共享一个 `W`，参数少但表达能力弱；
- Field-Each：每个输入 field 使用一个 `W_i`；
- Field-Interaction：每个 pair 使用独立 `W_{ij}`，表达最强但参数最多。

如果最终直接计算 `e_i^TWe_j`，输出会压缩为标量；FiBiNET 中的 Hadamard 形式保留 `k` 维交互信息，之后再交给 DNN。

### 6.3 优势与局限

优势：

- 动态选择对当前样本更重要的 fields；
- Bilinear transformation 比 FM 的统一 inner product 更灵活；
- 对大量类别 field 的二阶组合建模能力强。

局限：

- Field-Interaction 参数量约为 `O(m²k²)`，field 多时成本明显；
- 主要强化二阶交互，高阶结构仍依赖后续 DNN；
- SENet 权重可能不稳定，也不能作为因果 feature importance；
- 在强 ID memorization 场景中，复杂交叉的边际增益可能有限。

## 7. 模型横向对比

| 模型 | 显式交互 | 隐式交互 | 主要优势 | 主要局限 | 更适合的场景 |
|---|---|---|---|---|---|
| FM | 二阶 | 无 | 参数少，稀疏数据稳定 | 表达能力有限 | 强基线、粗排、小模型 |
| DeepFM | 二阶 FM | DNN 高阶 | 无需手工交叉，工程成熟 | DNN 交叉不可控、解释弱 | 通用 CTR/CVR 排序 |
| DCN | 有界高阶、bit-wise | Deep branch | 参数效率较高，交叉阶数明确 | 经典 DCN 表达受限 | 特征组合结构明显 |
| DCN-V2 | 有界高阶、matrix cross | Deep branch | 比 DCN 更强，可低秩化 | 参数和延迟更高 | 大规模精排 |
| xDeepFM | 高阶、vector-wise | DNN branch | CIN 显式表达 field interaction | 实现和计算复杂 | 高阶组合重要且预算允许 |
| FiBiNET | 参数化二阶 | 后续 DNN | Field selection + 灵活 pair interaction | `O(m²)` pair 成本，高阶依赖 DNN | 类别 fields 多、二阶关系强 |

### 7.1 如何公平比较

模型对比至少控制：训练样本、负采样、embedding table、优化器、参数量级、训练步数和线上延迟预算。否则“新结构更好”可能只是来自更多参数或更长训练。

推荐采用递进 ablation：

```text
LR → FM → DeepFM
          ├→ DCN / DCN-V2
          ├→ xDeepFM
          └→ FiBiNET
```

同时报告总体 AUC/LogLoss、关键 slice、calibration、参数量、FLOPs、P99 latency 和线上增量。

## 8. 评估清单

- 固定训练数据、负采样、参数量和延迟预算做公平比较；
- 同时看 ranking、calibration、关键 slice 与线上业务指标；
- 检查 unseen/rare ID、缺失值和 embedding 更新；
- 验证在线 feature freshness 与离线回放一致；
- 检查 score scale 对下游融合和重排的影响。

## 9. Embedding 与稀疏特征实践

- 高频 ID 可使用独立 embedding，长尾 ID 可哈希或回退到类目表示；
- embedding dimension 不必对所有 field 相同，基数和信息量更重要；
- OOV、缺失值和新 ID 必须有稳定 fallback；
- 正则化、频率截断和 embedding norm 监控可降低热门 ID 过拟合；
- Feature importance、attention 或 SENet 权重表示模型依赖，不等于业务因果贡献。


返回：[粗排与精排](./ranking.md)。
