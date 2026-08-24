# 特征交叉模型｜Feature Interaction Models

<a name="top"></a>

## 目录

- [1. 为什么需要交叉](#sec-1)
- [2. 模型速查](#sec-2)
  - [2.1 不同决策面的交叉语义](#sec-2-1)
  - [2.2 统一记号](#sec-2-2)
- [3. FM 与 DeepFM](#sec-3)
  - [3.1 FM 公式](#sec-3-1)
- [4. DCN](#sec-4)
  - [4.1 为什么 Cross Layer 是显式交叉](#sec-4-1)
- [5. xDeepFM](#sec-5)
- [6. FiBiNET](#sec-6)
  - [6.1 SENet 的数学形式](#sec-6-1)
  - [6.2 Bilinear Interaction](#sec-6-2)
  - [6.3 优势与局限](#sec-6-3)
- [7. 模型横向对比](#sec-7)
  - [7.1 如何公平比较](#sec-7-1)
- [8. PPNet / LHUC：条件化个性化](#sec-8)
- [9. 评估清单](#sec-9)
- [10. Embedding 与稀疏特征实践](#sec-10)
- [11. 工业案例](#sec-11)
  - [11.1 短视频商品内容：内容特征与绑定商品交叉](#sec-11-1)
  - [11.2 直播内容流：用户、主播、当前商品与实时状态交叉](#sec-11-2)
  - [11.3 商城商品卡：价格、商品粒度与商家履约交叉](#sec-11-3)
  - [11.4 创作者选品：内容主题、受众与商品条件交叉](#sec-11-4)

---

<a name="sec-1"></a>

## 1. 为什么需要交叉

电商行为通常由条件组合决定：`用户价格偏好 × 商品价格`、`市场 × 类目`、`近期兴趣 × 候选商品`。线性模型只能为单特征加权，难以表达这些条件效应。

<a name="sec-2"></a>

## 2. 模型速查

| 模型 | 核心机制 | 适用理解 |
|---|---|---|
| FM | embedding 内积表达二阶交叉 | 稀疏类别特征中的低阶关系 |
| DeepFM | FM + DNN，共享 embedding | 同时学习低阶与高阶关系 |
| DCN | Cross Network + Deep Network | 显式构造有界阶数的交叉 |
| xDeepFM | CIN + Linear + DNN | vector-wise 显式高阶交叉 |
| FiBiNET | SENet + Bilinear interaction | 先重标 field，再学习 field pair 交互 |
| PPNet/LHUC | 个性化调节隐藏单元贡献 | 大模型中的参数化个性化 |

模型并非越复杂越好；候选规模、延迟、训练稳定性和线上增量共同决定阶段位置。

可以把“交叉”理解成一句带条件的话。单特征只能分别学习“用户偏好低价”和“商品价格低”，交叉特征才能学习“对价格敏感的用户遇到低价商品时，点击或购买概率额外提高”。同样的商品低价信号对高端品牌用户未必是正向，因此只给价格一个全局权重往往不够。

<a name="sec-2-1"></a>

### 2.1 不同决策面的交叉语义

| 决策面 | 代表性交叉 | 不能忽略的边界 |
|---|---|---|
| 短视频商品内容流 | 用户短期兴趣 × 视频语义、内容质量 × 商品绑定、视频时长 × 播放行为 | 视频相关不等于商品相关；内容与交易信号需分开建模 |
| 直播内容流 | 用户商品序列 × 当前讲解商品、主播偏好 × room session、实时热度 × 开播时长 | room 状态和当前商品是动态特征，不能只用主播静态 embedding |
| 商城商品卡 | 用户价格带 × 当前价格、类目意图 × SKU、用户 × 商家履约 | SPU/SKU/offer 粒度要一致，避免将同款多报价误作独立兴趣 |
| 搜索与类目浏览 | 查询属性 × 商品属性、查询语义 × 商品内容、用户任务 × 价格带 | 明确品牌、规格与筛选条件是硬约束，不应被个性化交叉覆盖 |
| 商品详情页与关联推荐 | 当前商品 × 候选关系、购买阶段 × 替代/互补、页面上下文 × 内容类型 | 购买前替代与购买后互补含义不同；当前页选择会带来条件选择偏差 |
| 创作者选品 | 内容主题 × 商品类目、受众价格带 × 商品价格、创作者容量 × 合作形式 | 接受、发布与买家转化是不同阶段；合作资格、样品、库存和履约先做约束 |

纯召回双塔只能做塔内交叉；user-item cross 需要逐候选计算，更适合粗排的轻量交叉分支或精排的联合模型。

直播电商里这个边界尤其明显。假设某位用户经常观看护肤内容，而一个熟悉的主播本场已经从护肤品切换到家电：`用户 × 主播` 仍可能很强，但 `用户近期商品兴趣 × 当前讲解商品` 已经变弱。只依赖主播 embedding 会高估进房和交易价值；加入 room session、当前商品与时间上下文的交叉后，模型才能表达“同一主播在不同场次、不同商品阶段对该用户价值不同”。商城商品卡则常见 `用户价格带 × 当前折扣` 与 `用户配送敏感度 × 预计送达时间`，这些关系通常比单独的折扣或物流特征更有解释力。

<a name="sec-2-2"></a>

### 2.2 统一记号

设一个样本包含 `m` 个 feature fields，每个 field 的 embedding 为

```math
e_i\in\mathbb{R}^k,\qquad i=1,\ldots,m
```

将所有 field 拼接为：

```math
x_0=[e_1;e_2;\ldots;e_m]\in\mathbb{R}^{mk}
```

不同模型的核心区别，是如何从 `e_i` 或 `x₀` 中构造交互：

- FM：所有 field pair 使用 embedding inner product；
- DeepFM：FM 二阶交互与 DNN 隐式高阶交互并行；
- DCN：通过 Cross Layer 显式生成有界阶数交互；
- xDeepFM：在 vector-wise 层面显式生成高阶交互；
- FiBiNET：先学习 field importance，再做参数化二阶交互。

<a name="sec-3"></a>

## 3. FM 与 DeepFM

FM 以低维 embedding 的内积代替每个特征对的独立参数，使稀疏交叉可以共享统计强度。DeepFM 加入 DNN 学习高阶非线性，同时保留 FM 的二阶归纳偏置。

评估时需要关注：新交叉是否改善稀疏 slice、是否过拟合热门 ID、是否在重要市场校准，以及推理成本是否挤压候选规模。

<a name="sec-3-1"></a>

### 3.1 FM 公式

对输入 `x ∈ Rᵈ`，二阶 FM 为：

```math
\hat{y}=w_0+\sum_{i=1}^{d}w_ix_i+
\sum_{i=1}^{d}\sum_{j=i+1}^{d}\langle v_i,v_j\rangle x_ix_j
```

直接计算所有特征对的最坏复杂度为 `O(d²k)`；若样本只有 `n` 个非零特征，稀疏实现为 `O(n²k)`。利用恒等式后可分别降为 `O(dk)` 或 `O(nk)`：

```math
\frac{1}{2}\sum_{f=1}^{k}
[(\sum_i v_{i,f}x_i)^2-
\sum_i v_{i,f}^2x_i^2]
```

```python
def fm_second_order(x, embeddings):
    # x: [batch, fields], embeddings: [batch, fields, dim]
    vx = embeddings * x.unsqueeze(-1)
    square_of_sum = vx.sum(dim=1).pow(2)
    sum_of_square = vx.pow(2).sum(dim=1)
    return 0.5 * (square_of_sum - sum_of_square).sum(dim=1)
```

DeepFM 将这一路 FM 输出与同一组 embedding 的 DNN 输出相加，减少手工交叉并共享底层表示。

<a name="sec-4"></a>

## 4. DCN

Cross Network 显式构造输入的高阶交互，Deep Network 捕捉更一般的非线性。适合检验“明确交叉结构是否比纯 MLP 更有效”。需比较参数量和延迟相近的基线，避免把容量增益误解为结构增益。

经典 cross layer：

```math
x_{l+1}=x_0(x_l^T w_l)+b_l+x_l
```

堆叠 `L` 层可形成最高 `L+1` 阶的显式交叉。DCN-V2 使用矩阵或低秩 mixture-of-experts 形式提升表达能力，但也增加计算和过拟合风险。

<a name="sec-4-1"></a>

### 4.1 为什么 Cross Layer 是显式交叉

第一层包含 `x₀` 的二阶项，第二层继续将 `x₀` 与上一层相乘，因此逐层增加交叉阶数。残差项 `+x_l` 保留低阶信息并改善梯度传播。

经典 DCN 的每层参数量约为 `O(d)`，其中 `d=mk`；表达能力较受限制。DCN-V2 使用：

```math
x_{l+1}=x_0\odot(W_lx_l+b_l)+x_l
```

完整矩阵参数量为 `O(d²)`。低秩分解 `W=UVᵀ` 可将参数量降为 `O(dr)`。

<a name="sec-5"></a>

## 5. xDeepFM

xDeepFM 的 Compressed Interaction Network（CIN）在 vector-wise 层面构造显式高阶交互。令 `X⁰∈R^{m×k}` 为原始 field embeddings，第 `l` 层第 `h` 个 feature map 可写为：

```math
X_{h,:}^{l}=\sum_{i=1}^{H_{l-1}}\sum_{j=1}^{m}
W_{ij}^{l,h}(X_{i,:}^{l-1}\odot X_{j,:}^{0})
```

其中 `⊙` 是 Hadamard product。CIN 保留 embedding 维度上的结构，并逐层产生更高阶 field interaction。

优势：

- 显式高阶交互，比纯 DNN 更容易表达组合结构；
- vector-wise interaction 比 bit-wise MLP 更贴近 field embedding；
- 与 linear、DNN 分支组合后兼顾低阶与隐式高阶信息。

局限：

- CIN 的张量交互带来较高内存和计算成本；
- layer width 与 split-half 等结构超参数较多；
- 高阶交互不一定带来线上收益，尤其在样本稀疏或强 ID 特征场景。

<a name="sec-6"></a>

## 6. FiBiNET

SENet 学习 field importance，Bilinear 层为特征对引入更灵活的变换。它适合大量 categorical fields 的 CTR/CVR 场景，但 field 权重不应直接解释为因果重要性。

<a name="sec-6-1"></a>

### 6.1 SENet 的数学形式

先对每个 field embedding 做 squeeze：

```math
z_i=\frac{1}{k}\sum_{t=1}^{k}e_{i,t},
\qquad z\in\mathbb{R}^{m}
```

再通过两层网络得到 field-wise 权重：

```math
a=\sigma(W_2\,\delta(W_1z)),
\qquad \tilde e_i=a_i e_i
```

`δ` 通常为 ReLU，`σ` 可为 sigmoid。这里的权重由当前样本动态生成，而不是每个 field 一个固定全局权重。

<a name="sec-6-2"></a>

### 6.2 Bilinear Interaction

FiBiNET 常见的 vector-valued bilinear interaction 为：

```math
p_{ij}=(W_{ij}e_i)\odot e_j
```

根据参数共享方式可分为：

- Field-All：所有 field pair 共享一个 `W`，参数少但表达能力弱；
- Field-Each：每个输入 field 使用一个 `W_i`；
- Field-Interaction：每个 pair 使用独立 `W_{ij}`，表达最强但参数最多。

如果最终直接计算 `e_i^TWe_j`，输出会压缩为标量；FiBiNET 中的 Hadamard 形式保留 `k` 维交互信息，之后再交给 DNN。

<a name="sec-6-3"></a>

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

<a name="sec-7"></a>

## 7. 模型横向对比

| 模型 | 显式交互 | 隐式交互 | 主要优势 | 主要局限 | 更适合的场景 |
|---|---|---|---|---|---|
| FM | 二阶 | 无 | 参数少，稀疏数据稳定 | 表达能力有限 | 强基线、粗排、小模型 |
| DeepFM | 二阶 FM | DNN 高阶 | 无需手工交叉，工程成熟 | DNN 交叉不可控、解释弱 | 通用 CTR/CVR 排序 |
| DCN | 有界高阶、bit-wise | Deep branch | 参数效率较高，交叉阶数明确 | 经典 DCN 表达受限 | 特征组合结构明显 |
| DCN-V2 | 有界高阶、matrix cross | Deep branch | 比 DCN 更强，可低秩化 | 参数和延迟更高 | 大规模精排 |
| xDeepFM | 高阶、vector-wise | DNN branch | CIN 显式表达 field interaction | 实现和计算复杂 | 高阶组合重要且预算允许 |
| FiBiNET | 参数化二阶 | 后续 DNN | Field selection + 灵活 pair interaction | `O(m²)` pair 成本，高阶依赖 DNN | 类别 fields 多、二阶关系强 |
| PPNet/LHUC | 条件化隐藏单元 | Backbone 本身决定 | 以较小调节网络实现个性化 | 不是显式 field pair 模型，调节信号可能过拟合 | 共享大模型上的用户/场景适配 |

主要计算增长趋势如下，其中 `m` 为 field 数、`k` 为 embedding 维度、`d=mk` 为拼接后的稠密维度，`n` 为原始稀疏输入中的非零特征数：

| 模块 | 主要计算或参数趋势 |
|---|---|
| FM 二阶项 | 稀疏实现利用求和恒等式后约 `O(nk)`，不需要显式枚举特征对 |
| DeepFM | FM 成本 + DNN 各层矩阵乘成本 |
| Classic DCN | 每个 cross layer 约 `O(d)` 参数与计算 |
| DCN-V2 full matrix | 每层约 `O(d²)`；rank-`r` 分解后约 `O(dr)` |
| CIN | 约随 `k × m × H_{l-1} × H_l` 增长，层宽对成本很敏感 |
| FiBiNET Field-Interaction | 最坏约 `O(m²k²)` 参数/变换成本，需通过共享或降维控制 |
| PPNet/LHUC | 主干成本 + 各层条件门控网络，取决于被调节层宽 |

实际延迟还受 embedding lookup、特征拼接、batch size、cache 和硬件算子融合影响，理论 FLOPs 不能替代线上 P99 测量。

<a name="sec-7-1"></a>

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

<a name="sec-8"></a>

## 8. PPNet / LHUC：条件化个性化

PPNet/LHUC 与 FM、DCN 的边界不同：前者不是枚举 field pair，而是让用户或场景特征调节 backbone 的隐藏单元贡献。设第 `l` 层主网络激活为：

```math
h_l=\phi(W_l\tilde h_{l-1}+b_l)
```

个性化网络根据条件特征 `c` 产生门控：

```math
a_l(c)=2\sigma(g_l(c)),\qquad \tilde h_l=a_l(c)\odot h_l
```

门控范围在 `(0,2)`，`1` 附近表示保持，接近 `0` 表示抑制，大于 `1` 表示增强。条件 `c` 可来自用户、surface、市场或其他稳定上下文；若加入候选特征，门控就必须逐候选计算。

优势：

- 共享主干的同时表达不同用户或场景的激活差异；
- 调节网络通常比为每个人群维护独立大模型更省参数；
- 可与 DeepFM、DCN 或多任务 backbone 组合，而不是二选一。

局限：

- 门控值表示模型依赖，不是因果解释；
- 高频 ID 可能让个性化网络记忆训练样本；
- 多层逐元素调节增加训练不稳定性与线上特征依赖；
- 如果条件只包含 user features，它改善个性化但不自动增加 user-item 显式交叉。

<a name="sec-9"></a>

## 9. 评估清单

- 固定训练数据、负采样、参数量和延迟预算做公平比较；
- 同时看 ranking、calibration、关键 slice 与线上业务指标；
- 检查 unseen/rare ID、缺失值和 embedding 更新；
- 验证在线 feature freshness 与离线回放一致；
- 检查 score scale 对下游融合和重排的影响。

<a name="sec-10"></a>

## 10. Embedding 与稀疏特征实践

- 高频 ID 可使用独立 embedding，长尾 ID 可哈希或回退到类目表示；
- embedding dimension 不必对所有 field 相同，基数和信息量更重要；
- OOV、缺失值和新 ID 必须有稳定 fallback；
- 正则化、频率截断和 embedding norm 监控可降低热门 ID 过拟合；
- Feature importance、attention 或 SENet 权重表示模型依赖，不等于业务因果贡献。

<a name="sec-11"></a>

## 11. 工业案例

以下数值均为帮助理解方法的示例。这里重点回答一个问题：基础特征都存在时，模型是否仍因为缺少特定的条件关系而产生系统性残差。模型比较必须固定训练数据、embedding 预算、优化器和服务延迟档位，并通过消融确认收益来自交叉结构本身。

<a name="sec-11-1"></a>

### 11.1 短视频商品内容：内容特征与绑定商品交叉

- **现象（示例）**：基础 DeepFM 的整体商品点击校准尚可，但在“近期只浏览低价格带 × 候选为高价商品 × 视频是教程型内容”切片中，平均预测点击率为 8.0%，实际只有 3.1%。与此同时，教程视频的有效观看仍然较高，说明模型把内容兴趣误当成了商品兴趣。
- **定位证据**：按用户价格带、候选价格、视频语义和内容—商品类目一致性构造残差立方体。若单维切片误差不大，而 `价格偏好 × 当前价格`、`视频语义 × 绑定商品` 的联合切片持续失准，并且加入这组交叉后误差收敛，才支持“缺少交互”这一判断。
- **候选方案或模型对比**：以 LR 和 FM 为可解释基线；在相同 embedding 与参数预算下比较 Small DeepFM、DCN-V2，并做 `移除价格交叉`、`移除内容—商品交叉` 的 ablation。DCN-V2 用有限层数显式学习目标交叉，DeepFM 则作为隐式高阶交互对照。
- **为何有效**：用户对高价商品的接受度取决于其价格偏好，内容吸引力能否转成商品点击又取决于视频与绑定商品是否一致。交叉层表达的是“在这些条件同时成立时才提高分数”，而不是简单叠加三个主效应。
- **离线指标**：商品点击与支付任务的 Log Loss、PR-AUC、ECE；联合切片的 Calibration Error；长尾视频和新商品 OOV；交叉 ablation 的增量；参数量、FLOPs 与离线推理时间。
- **在线指标**：Qualified View、商品入口可见率、Product Clicks per Eligible User、成熟净价值、内容负反馈、无效绑定过滤率和 P99 latency。
- **失败边界**：交叉模型不能修复过期的商品绑定或库存特征；高基数 ID 可能让网络记住热门样本而非学习可泛化关系；使用支付后更新的商品质量、最终库存或后验内容标签会造成时间泄漏。

<a name="sec-11-2"></a>

### 11.2 直播内容流：用户、主播、当前商品与实时状态交叉

- **现象（示例）**：某场直播在第 18 分钟从护肤商品切换到厨房电器。依赖主播 ID 和累计热度的基线模型仍给原护肤兴趣人群高分；切换后 5 分钟内进房率仅下降 2%，但当前商品点击率下降 35%，Quick Exit 上升 11%。
- **定位证据**：按 `time_since_product_switch`、用户近期商品类目、当前商品类目和 room session 分析校准。主播单维校准正常，而“用户类目兴趣与当前商品不匹配”的联合切片明显高估；将当前商品 field 置换后性能几乎不变，也说明基线没有真正利用动态候选信息。
- **候选方案或模型对比**：FM/DeepFM 作为稳定基线；FiBiNET 比较不同 field pair 的双线性交互；DCN 显式建模 `用户商品兴趣 × 当前商品 × 场次阶段`。若使用 PPNet 或 LHUC 调节共享网络，仍需保留候选级用户—商品交叉，不能只用全局场景门控。
- **为何有效**：主播偏好提供跨场次先验，当前商品和场次阶段决定当下价值。把永久主播、当前 session 和当前商品拆成不同 field 后，模型可以在商品切换时调整条件效应，而不必等待主播长期 embedding 更新。
- **离线指标**：进房、有效观看、商品点击和支付的 PR-AUC、Log Loss 与 ECE；商品切换后 1/5/10 分钟切片；field permutation 与 ablation；动态 field 缺失切片和计算成本。
- **在线指标**：Qualified Entry、Quick Exit、当前商品点击、成熟净价值、Feature Age、商品切换后校准、无效 room rate 和 P99 latency。
- **失败边界**：如果当前商品或切换时间没有及时写入特征，交叉结构只会放大陈旧信息；累计热度受旧策略曝光影响，不能当作无偏质量标签；门控或 SENet 权重表示模型内部贡献，不是因果解释。

<a name="sec-11-3"></a>

### 11.3 商城商品卡：价格、商品粒度与商家履约交叉

- **现象（示例）**：促销期一批折扣 20% 以上的商品卡 CTR 提升 18%，但在“配送承诺超过 7 天 × 新商家”切片中，支付转化下降 9%，成熟退款率增加 2.0 个百分点。仅加入折扣、配送和商家质量主效应的模型仍持续高估该切片。
- **定位证据**：固定类目和曝光位置后，比较折扣幅度、配送时长、商家成熟度与用户价格敏感度的联合校准；再检查相同 SPU 下不同 offer 的残差。若问题集中在特定 offer 条件组合，而不是整个商家或类目，说明需要候选级交叉而不是全局降权。
- **候选方案或模型对比**：FM 验证稀疏二阶关系；Small DeepFM 提供同预算隐式交互基线；DCN-V2 建模 `价格敏感度 × 折扣 × 配送时长`；FiBiNET 区分用户—商品、用户—商家与商品—商家 field pair。所有方案使用相同 SKU/SPU/offer 定义和训练窗口。
- **为何有效**：折扣本身不必然低质，配送慢或新商家本身也不必然失败；风险来自这些条件与用户需求、商品类目共同出现。候选级交叉可以保留正常促销商品，同时降低特定高风险组合的过度预测。
- **离线指标**：点击、支付和退款任务的 Log Loss、PR-AUC、ECE；价格带×配送×商家切片校准；同 SPU 不同 offer 的排序一致性；OOV、ablation 和参数/延迟成本。
- **在线指标**：Product-card CTR、PDP-to-Pay、成熟净价值、取消率、退款率、长尾商家覆盖、同款重复率和 P99 latency。
- **失败边界**：SPU、SKU 与 offer 混用会制造伪交叉；使用曝光后的价格、最终库存或成熟退款状态作为请求时特征会泄漏；促销本身可能由运营策略选择，预测交叉不能直接解释为促销的因果效应。

<a name="sec-11-4"></a>

### 11.4 创作者选品：内容主题、受众与商品条件交叉

- **现象（示例）**：选品模型按商品历史支付率和创作者粉丝规模排序后，查看率提升 12%，但接受后真正发布的比例下降 8%。问题集中在“高客单商品 × 受众价格带偏低”和“需要深度讲解的商品 × 创作者以短演示内容为主”两个联合切片，单独看商品质量或创作者活跃度都没有明显异常。
- **定位证据**：在具备合作资格且被真实展示的 creator–product pair 上，按内容主题、受众价格带、常用内容形式、商品价格、样品条件和库存分析查看→接受→发布→成熟交易残差。若单维校准正常而联合切片持续失准，再通过 field permutation 验证模型是否真正使用跨实体条件。
- **候选方案或模型对比**：FM 作为稀疏二阶基线；DeepFM 同时学习稳定低阶与隐式高阶关系；DCN-V2 显式建模 `内容形式 × 商品讲解复杂度 × 合作条件`；FiBiNET 比较创作者、受众、商品与商家 field pair；PPNet/LHUC 可按创作者状态调节共享网络，但不能替代候选级创作者—商品交叉。
- **为何有效**：高质量商品并非对所有创作者都容易表达，强创作者也并非对所有价格带都能产生交易。交叉层表示“这个商品在这个创作者的内容方式和受众条件下是否合适”，避免把双方独立强度简单相加。
- **离线指标**：展示条件下查看、接受、发布与成熟交易任务的 Log Loss、PR-AUC 和 ECE；主题×价格带×内容形式联合校准；field permutation、ablation、OOV 与参数/延迟成本。
- **在线指标**：Eligible Pair Coverage、选品查看率、接受率、发布率、发布后商品点击与成熟净价值、创作者/商品覆盖、无效合作过滤率和候选新鲜度。
- **失败边界**：未展示 pair 不能直接作为创作者拒绝的负例；接受与发布受样品、库存、佣金和创作者容量影响，预测分数不能解释为合作的因果效果。后续发布表现、最终库存和成熟交易不能回填到匹配时特征；单个创作者可承接的商品有限，还需在匹配后处理容量与跨候选竞争。


返回：[粗排与精排](./ranking.md)。
