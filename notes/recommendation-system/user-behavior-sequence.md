# 用户行为序列｜User Behavior Sequence Modeling

## 1. 为什么序列重要

用户画像表达长期倾向，近期序列表达当前 session 意图。电商推荐常需要同时区分：

```text
长期兴趣：稳定的类目、品牌和价格偏好
短期意图：最近点击、搜索、加购所反映的购物任务
```

## 2. LastN Baseline

将最近 N 个交互商品 embedding 做 mean/sum pooling 是稳定基线。实现前需定义：行为类型、时间窗口、去重、截断、padding、时间衰减和未曝光/未点击行为是否进入序列。

平均池化的问题是所有历史行为权重相同，并丢失顺序与候选相关性。

一个更强但仍易解释的基线是时间衰减池化：

$$
h_u=\frac{\sum_{i=1}^{N}\exp(-\lambda\Delta t_i)e_i}
{\sum_{i=1}^{N}\exp(-\lambda\Delta t_i)}
$$

它可以回答复杂 attention 的提升究竟来自候选相关性，还是仅来自“最近行为更重要”。

## 3. DIN

DIN 用候选感知 attention 聚合历史：同一用户面对运动鞋与美妆商品时，应激活不同的历史兴趣。

```text
candidate item + each historical item
→ relevance weight
→ weighted user interest
→ prediction
```

attention weight 可用于诊断，但不等同于因果解释。

对候选向量 `q` 和历史行为 `e_i`，DIN 常将 `[e_i, q, e_i-q, e_i⊙q]` 输入 activation unit：

$$
\alpha_i=f(e_i,q),\qquad
h(q)=\sum_i\alpha_i e_i
$$

```python
def din_pool(history, candidate, attention_mlp, mask):
    # history: [B, T, D], candidate: [B, D]
    query = candidate.unsqueeze(1).expand_as(history)
    features = torch.cat(
        [history, query, history - query, history * query], dim=-1
    )
    logits = attention_mlp(features).squeeze(-1)
    logits = logits.masked_fill(~mask, -1e9)
    weights = torch.softmax(logits, dim=1)
    return (history * weights.unsqueeze(-1)).sum(dim=1)
```

若原始 DIN 实现采用非归一化权重，聚合向量还会携带兴趣强度；使用 softmax 时则更接近兴趣分布。两者语义不同，应通过 ablation 验证。

## 4. DIEN

DIEN 在兴趣激活之外进一步建模兴趣随时间演化，适合顺序、时间间隔与兴趣漂移明显的场景。复杂度提升后，要验证增量是否来自真正的序列结构，而非更多参数或更长历史。

DIEN 通常包含：

1. GRU 提取逐步兴趣状态；
2. auxiliary loss 用相邻真实行为和负样本监督中间状态；
3. candidate-aware attention 选择相关兴趣；
4. AUGRU 用 attention 调节更新门，表达兴趣演化。

辅助损失能让中间状态更贴近行为转移，而不是只依赖最终点击标签反向传播。

### 4.1 Auxiliary Loss

令 GRU 在时刻 `t` 的兴趣状态为 `h_t`，下一次真实行为 embedding 为 `e_{t+1}`，负样本为 `\tilde e_{t+1}`。辅助损失可以写成：

$$
\mathcal L_{aux}=-\sum_t\left[
\log\sigma(h_t^Te_{t+1})+
\log(1-\sigma(h_t^T\tilde e_{t+1}))
\right]
$$

总损失为：

$$
\mathcal L=\mathcal L_{target}+\alpha\mathcal L_{aux}
$$

该损失鼓励状态 `h_t` 预测下一步行为，使兴趣序列更有语义。负样本质量和 `α` 过大都可能让辅助任务压过主任务。

### 4.2 AUGRU

普通 GRU 的更新门为 `u_t`。AUGRU 使用候选相关 attention `a_t` 调节更新强度：

$$
\tilde u_t=a_tu_t
$$

$$
h_t=(1-\tilde u_t)\odot h_{t-1}+
\tilde u_t\odot\tilde h_t
$$

候选不相关的历史行为获得较小 `a_t`，从而减少其对兴趣演化状态的影响。

## 5. Transformer 序列模型

Self-attention 可以同时建模序列中任意两个行为的依赖：

$$
\text{Attention}(Q,K,V)=
\text{softmax}\left(\frac{QK^T}{\sqrt d}+M\right)V
$$

`M` 可用于 padding mask 或 causal mask。相较 RNN，它更容易并行，并能捕捉长距离依赖；但标准 attention 的时间和内存复杂度为 `O(T²)`。

常见方法：

- SASRec：causal self-attention，预测下一交互商品；
- BERT4Rec：双向 masked-item prediction，利用左右上下文；
- BST：将 Transformer 行为表示用于 CTR 预估；
- Long-sequence models：通过兴趣检索、稀疏 attention 或分层建模降低成本。

SASRec 更贴近自回归 next-item prediction；BERT4Rec 的双向上下文适合离线 representation learning，但线上使用必须避免未来信息泄漏。

## 6. 序列模型横向对比

| 模型 | 候选感知 | 顺序建模 | 长距离依赖 | 计算特点 | 主要局限 |
|---|---:|---:|---:|---|---|
| Mean Pooling | 否 | 否 | 弱 | `O(T)`，最便宜 | 丢失顺序和候选相关性 |
| Time-decay Pooling | 否 | 部分 | 弱 | `O(T)` | 时间衰减形式需手工设定 |
| DIN | 是 | 否 | 通过加权聚合 | `O(T)` | 不显式表达兴趣演化 |
| DIEN | 是 | 是，GRU/AUGRU | 中等 | 顺序计算，训练较慢 | 结构复杂，长序列仍困难 |
| SASRec/BERT4Rec | 可加入候选 | 是 | 强 | 标准 `O(T²)` | 延迟、显存和线上一致性挑战 |

选择顺序模型时，首先用长度和新鲜度 slice 证明序列确实存在增量；如果大多数用户历史很短，复杂 Transformer 未必优于 DIN。

## 7. 电商序列设计

- 多行为：click、PDP、ATC、purchase 的意图强度不同；
- 多实体：商品、类目、品牌、商家和内容作者；
- 时间：session 内分钟级意图与跨月长期兴趣；
- 负反馈：跳过、快速返回、取消、退款；
- 交易状态：加购不等于购买，订单不等于履约；
- 隐私与可用性：只使用在打分时已知且合规的特征。

## 8. 评估与诊断

除总体 AUC/NDCG 外，重点比较：

- 新用户、短历史和长历史用户；
- 不同序列长度、行为类型与时间间隔；
- session intent 强弱和兴趣切换场景；
- sequence feature missing/fallback rate；
- latency、截断率及线上特征新鲜度。

典型 ablation：无序列 → mean pooling → time decay → DIN → DIEN。每一步同时报告效果与成本。

## 9. 数据泄漏与线上一致性

- 序列只能包含 prediction timestamp 之前发生的事件；
- 支付、取消和退款有延迟，必须使用当时可见的状态；
- 离线 join 应使用 point-in-time correct feature，而非最新快照；
- 线上截断方向要与训练一致，通常保留最近 N 个行为；
- 缓存延迟会改变“最近行为”的含义，应报告 feature freshness。


相关：[粗排与精排](./ranking.md)、[冷启动](./cold-start.md)。
