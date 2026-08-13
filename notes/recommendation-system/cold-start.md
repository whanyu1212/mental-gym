# 冷启动与探索｜Cold Start and Exploration

## 1. 冷启动对象

| 对象 | 缺失信号 | 可用先验 |
|---|---|---|
| 新商品 | 点击、加购、成交与 ID embedding | 标题、图像、类目、价格、品牌、商家 |
| 新商家 | 履约、转化和复购历史 | 资质、商品结构、市场与内容质量 |
| 新用户 | 长短期行为和价格偏好 | 市场、入口、上下文与 session 行为 |
| 新市场/类目 | 本地交互规模 | 跨市场表示、内容语义和层级 taxonomy |

冷启动的本质是信息不足下的决策：既要获得反馈，又要控制用户和交易风险。

## 2. 新商品召回

不能依赖商品 ID 行为 embedding 时，可使用：

- 内容向量：标题、图片、视频、属性和类目；
- cluster recall：内容向量聚类后建立时间倒排索引；
- metadata matching：用户兴趣与类目/品牌/价格带匹配；
- seller prior：谨慎使用商家质量先验，避免头部固化；
- cross-market / multilingual representation：在口径一致时迁移语义信号。

### 2.1 Content-based Embedding

新商品没有可靠 ID embedding 时，可以融合文本、图像、类目、价格和商家特征：

$$
e_{item}=\text{MLP}([e_{text};e_{image};e_{category};e_{price};e_{seller}])
$$

训练目标可以是预测成熟商品的协同过滤 embedding，或直接用用户—商品行为进行对比学习。前者属于 representation distillation，能够让新商品进入已有向量空间。

评估时应按商品年龄分桶，例如 `<1 day`、`1–7 days`、`7–30 days`，否则成熟商品会掩盖冷启动效果。

## 3. Look-alike

从已有高质量商品或潜在兴趣人群构造 seed，再召回相似商品/用户。Seed 定义决定结果：以点击 seed 会偏向吸引力，以净成交或低退款 seed 更接近交易质量。必须避免把结果变量或未来信息泄漏进特征。

## 4. 探索流量

新供给没有曝光就无法获得行为，完全按历史预估排序会形成自我强化。探索机制可以分阶段：

```text
Eligibility & quality check
→ small exploration budget
→ collect unbiased-enough feedback
→ quality estimation
→ graduate / continue / stop
```

探索不等于无约束随机。应设置库存、安全、内容质量、商家风险、负反馈和系统容量护栏。

### 4.1 Multi-armed Bandit

若每个候选视为一个 arm，Upper Confidence Bound 在均值收益上加入不确定性奖励：

$$
UCB_i(t)=\hat\mu_i+c\sqrt{\frac{\log t}{n_i}}
$$

曝光少的商品 `n_i` 较小，因此获得更高探索 bonus。Thompson Sampling 则从每个 arm 的后验分布抽样后选择最大者。

```python
def thompson_sample(alpha, beta, rng=None):
    rng = rng or np.random.default_rng()
    sampled_rate = rng.beta(alpha, beta)
    return int(np.argmax(sampled_rate))

# 二项反馈下：发生目标行为 alpha += 1，否则 beta += 1
```

真实推荐中候选数巨大且上下文不同，通常需要 contextual bandit、分层先验或以模型不确定性生成 exploration bonus，而不是为每个商品独立维护简单 Beta 分布。

### 4.2 探索数据的价值

探索不仅追求即时收益，还用于降低曝光选择偏差、发现潜在优质供给和改善下一轮训练数据。分析时应区分：

- Immediate reward：当前点击、购买或净成交；
- Information gain：对商品质量不确定性的降低；
- Future value：新供给进入常规流量后的长期收益。

## 5. 实验设计难点

新商品供给会在实验期间持续进入，且实验组对商品产生的互动可能反过来影响全站排序。这可能违反用户级 SUTVA。

可根据问题考虑：

- 用户级 A/B：衡量整体买家体验，解释直接；
- 商品/商家级随机化：衡量供给扶持，但要处理用户暴露交叉；
- 双边/cluster randomization：降低干扰，成本和复杂度更高；
- switchback：适合共享资源和时段性处理；
- 长期 holdout：观察供给成长与反馈闭环。

## 6. 指标

买家侧：CTR、CVR、Net GMV、负反馈、留存。

供给侧：eligible-to-first-impression time、新商品覆盖、达到质量门槛比例、商家发布/上新、流量集中度。

学习效率：每单位探索曝光获得的有效反馈、从探索到常规流量的 graduation rate、误扶持成本。

必须同时报告数量、质量和时间窗口；“新商品曝光增加”不是独立成功标准。

## 7. Empirical Bayes 平滑

低曝光商品的原始 CTR/CVR 方差很大。Beta-Binomial 平滑可将小样本估计收缩到总体先验：

$$
\hat p_i=\frac{click_i+\alpha}{impression_i+\alpha+\beta}
$$

先验参数可按类目或市场历史数据估计。平滑能降低偶然一次点击造成的过度放大，但不能替代探索；若商品从未曝光，仍缺少个体证据。

相关：[召回](./retrieval.md)、[重排](./reranking.md)、[A/B Testing](./ab-testing.md)。
