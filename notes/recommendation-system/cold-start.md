# 冷启动与探索｜Cold Start and Exploration

<a name="top"></a>

## 目录

- [1. 冷启动对象](#sec-1)
  - [1.1 不同决策面的冷启动](#sec-1-1)
  - [1.2 从先验到常规流量的状态机](#sec-1-2)
- [2. 新商品召回](#sec-2)
  - [2.1 Content-based Embedding](#sec-2-1)
- [3. Look-alike](#sec-3)
- [4. 探索流量](#sec-4)
  - [4.1 Boost、保量与 Bandit 的区别](#sec-4-1)
  - [4.2 Multi-armed Bandit](#sec-4-2)
  - [4.3 探索数据的价值](#sec-4-3)
- [5. 实验设计难点](#sec-5)
- [6. 新用户与新商家](#sec-6)
  - [6.1 新用户](#sec-6-1)
  - [6.2 新商家](#sec-6-2)
- [7. 指标](#sec-7)
- [8. Empirical Bayes 平滑](#sec-8)
- [9. 工业案例：有限反馈下如何安全学习](#sec-9)
  - [9.1 新短视频商品内容：一次偶然点击不应触发全量放大](#sec-9-1)
  - [9.2 新直播场次：成熟主播也存在 session 冷启动](#sec-9-2)
  - [9.3 新商城商品卡：库存耗尽前能否学到可靠结论](#sec-9-3)
  - [9.4 新创作者—商品关系：单边历史不能证明双方匹配](#sec-9-4)
- [10. 关联文档](#sec-10)

---

<a name="sec-1"></a>

## 1. 冷启动对象

| 对象 | 缺失信号 | 可用先验 |
|---|---|---|
| 新商品 | 点击、加购、成交与 ID embedding | 标题、图像、类目、价格、品牌、商家 |
| 新商家 | 履约、转化和复购历史 | 资质、商品结构、市场与内容质量 |
| 新创作者 | 商品推广、受众转化和合作履约历史 | 内容主题、受众结构、内容质量与活跃度 |
| 新创作者—商品关系 | 双方共同出现、内容发布和交易反馈 | 创作者与商品各自历史、语义与类目匹配、商家质量 |
| 新用户 | 长短期行为和价格偏好 | 市场、入口、上下文与 session 行为 |
| 新市场/类目 | 本地交互规模 | 跨市场表示、内容语义和层级 taxonomy |

冷启动的本质是信息不足下的决策：既要获得反馈，又要控制用户和交易风险。

<a name="sec-1-1"></a>

### 1.1 不同决策面的冷启动

| Surface | 冷启动实体 | 可迁移先验 | 最快失效的信号 | 核心风险 |
|---|---|---|---|---|
| 短视频商品内容流 | 新视频、首次带货内容、新创作者 | 文本/画面/音频、创作者历史、绑定商品表示 | 热点与商品绑定/库存 | 内容吸引但商品不匹配；新内容缺少曝光形成反馈饥饿 |
| 直播内容流 | 新主播、一次新 room session、刚切换的当前商品 | 主播历史、预告信息、当前商品集合、同类直播 | online state、实时热度、当前商品与库存 | 几乎每场直播都带有 session cold start；旧场次统计不能直接代表当前房间 |
| 商城商品卡 | 新 SPU/SKU/offer、新商家 | 标题、图像、属性、类目、价格、商家/品牌先验 | 价格、库存、配送承诺 | 纯 ID 模型无信号；商家先验可能固化头部；低价/缺货造成虚假点击 |
| 商品搜索 | 新查询、新属性组合、新类目词 | 词项、语义近邻、类目体系和相似查询 | 查询趋势、库存、地域可达和改写行为 | 头部查询先验掩盖精确意图；错误改写收集到自证式点击反馈 |
| 创作者选品与合作 | 新创作者、新商品、新商家或新的双边关系 | 双方各自历史、内容与商品语义、类目和受众表示 | 合作状态、库存、佣金条件和创作时效 | 单边强先验替代关系证据；新关系没有展示就没有接受与发布反馈 |

直播的冷启动不仅是“新主播”。即使主播成熟，新一场 room session 的商品组合、节奏和供给状态也是新的；需要把可复用的主播先验与本场实时证据分开。

例如，一位历史表现很好的主播新开一场直播，但本场第一次销售家居用品。主播历史可以提供内容质量和履约先验，却不能直接证明原有美妆受众会喜欢本场商品。较合理的启动方式是先通过主播先验和当前商品语义找到小规模匹配用户，在进房、有效观看、商品点击和快速退出信号到达后更新本场 posterior；如果观看不错但商品点击持续偏低，应缩小流量或调整目标人群，而不是因为主播历史强就继续全局加量。

<a name="sec-1-2"></a>

### 1.2 从先验到常规流量的状态机

```text
Created / Started
→ eligibility and quality gate
→ content or entity prior
→ controlled exploration
→ posterior update
→ graduate to regular traffic / continue exploration / stop
```

每个状态应有可观测进入条件、退出条件、最大停留时间和 fallback。只设置“新 item boost”而没有毕业与停止规则，会把冷启动变成长久在线扶持。

商城新商品卡也可以套用这套状态机。新 SKU 先通过标题、图片、类目、价格和商家履约先验进入小流量探索；获得足够的可见曝光后，根据点击、加购、支付和退款早期信号决定毕业。若只按“上线天数”毕业，低曝光商品可能在没有学到任何可靠信息时被当作成熟商品；若只按点击率毕业，又可能奖励标题吸引但支付质量差的商品。

<a name="sec-2"></a>

## 2. 新商品召回

不能依赖商品 ID 行为 embedding 时，可使用：

- 内容向量：标题、图片、视频、属性和类目；
- cluster recall：内容向量聚类后建立时间倒排索引；
- metadata matching：用户兴趣与类目/品牌/价格带匹配；
- seller prior：谨慎使用商家质量先验，避免头部固化；
- cross-market / multilingual representation：在口径一致时迁移语义信号。

ID embedding 的常见 fallback 包括：

- Shared default embedding：所有未学习 ID 使用统一向量，稳定但无法区分新供给；
- Neighbor initialization：用内容最相似的成熟 item embedding 加权平均，个性化更强但会继承近邻偏差；
- Content-to-collaborative mapping：训练编码器从内容/属性直接预测协同空间表示，适合大规模持续上新。

还可按 item age 建独立候选池，例如分钟级、小时级、天级与成熟池，共享底层编码器但使用不同配额和先验。年龄池的价值是控制竞争与学习，不是保证所有新 item 获得相同曝光。

<a name="sec-2-1"></a>

### 2.1 Content-based Embedding

新商品没有可靠 ID embedding 时，可以融合文本、图像、类目、价格和商家特征：

```math
e_{item}=\text{MLP}([e_{text};e_{image};e_{category};e_{price};e_{seller}])
```

训练目标可以是预测成熟商品的协同过滤 embedding，或直接用用户—商品行为进行对比学习。前者属于 representation distillation，能够让新商品进入已有向量空间。

评估时应按商品年龄分桶，例如 `<1 day`、`1–7 days`、`7–30 days`，否则成熟商品会掩盖冷启动效果。

<a name="sec-3"></a>

## 3. Look-alike

从已有高质量商品或潜在兴趣人群构造 seed，再召回相似商品/用户。Seed 定义决定结果：以点击 seed 会偏向吸引力，以净成交或低退款 seed 更接近交易质量。必须避免把结果变量或未来信息泄漏进特征。

新 item 获得首批可靠交互后，可把 seed 用户向量聚合为在线行为表示：

```math
e_i^{behavior}=\frac{\sum_{u\in S_i}w_u e_u}{\sum_{u\in S_i}w_u}
```

再与内容先验做置信度加权融合。`S_i` 很小时，行为向量方差大且容易被偶然用户带偏；权重可结合行为强度、反作弊和曝光 propensity。Look-alike 是冷启动后的快速适应，不解决零交互时的第一批流量来源。

<a name="sec-4"></a>

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

<a name="sec-4-1"></a>

### 4.1 Boost、保量与 Bandit 的区别

| 方法 | 决策方式 | 优点 | 主要风险 |
|---|---|---|---|
| Fixed boost | 在粗排/精排分数上乘系数或加 bonus | 实现简单、启动快 | 曝光对系数高度敏感，不能精确控制预算 |
| Exposure pacing | 根据年龄与已获曝光动态调节 bonus | 能追踪目标进度 | 环境变化后控制器失准；低质 item 也可能被强推 |
| Differential quota | 由内容质量、商家先验和不确定性决定不同预算 | 比一刀切更节省流量 | 先验偏差会决定谁有学习机会 |
| Contextual bandit | 根据用户/上下文平衡收益与不确定性 | 把探索给更可能匹配的人群 | 需要 propensity、稳定奖励与安全策略 |

若目标曝光记为 `E_target`、目标时间记为 `T_target`，pacing controller 可基于进度差调节：

```math
gap(t)=\frac{t}{T_{\mathrm{target}}}
-\frac{E(t)}{E_{\mathrm{target}}}
```

`gap>0` 表示曝光进度落后，可提高 bonus；但必须设置最大 boost、用户适配门槛和质量停止线。保量成功率不是越高越好：把不合适供给强行推给用户会损害当期体验，也会收集到被策略扭曲的负反馈。

<a name="sec-4-2"></a>

### 4.2 Multi-armed Bandit

若每个候选视为一个 arm，Upper Confidence Bound 在均值收益上加入不确定性奖励：

```math
UCB_i(t)=\hat{\mu}_i+c\sqrt{\frac{\log t}{n_i}}
```

该式要求 `n_i >= 1`。零曝光 arm 必须先进行受控初始化、使用先验，或赋予单独定义的探索优先级；不能直接代入除零。曝光少的商品 `n_i` 较小，因此获得更高探索 bonus。Thompson Sampling 则从每个 arm 的后验分布抽样后选择最大者。

独立 item-arm 在海量、快速变化候选上不可扩展，也不能泛化到零曝光 item。线性 contextual UCB 用特征共享统计强度：

```math
s_t(x)=\widehat{\theta}_t^\top x+
\beta\sqrt{x^\top A_t^{-1}x}
```

其中一个常见定义是：

```math
A_t=\lambda I+\sum_{s=1}^{t-1}x_sx_s^\top
```

```math
\widehat{\theta}_t=A_t^{-1}\sum_{s=1}^{t-1}x_s r_s
```

`lambda > 0` 保证初始矩阵可逆。第一项是预期收益，第二项是上下文方向的不确定性。实际系统还需先用召回和质量门槛缩小 arm 集合。

IPS / SNIPS 等基于 Propensity 的反事实离线评估要求 Logging Policy 显式随机化、所需 Action 具有非零选择概率，并且 Propensity 可计算。确定性 UCB 的 argmax 对未选候选概率为 0，仅记录一个名义 propensity 不能恢复 overlap。Model-based OPE 可以在更强的结果模型与外推假设下使用非随机日志，但对日志支持集之外的结论不可仅靠数据验证。日志至少应保存完整候选集、特征快照、分数与不确定性、被选 Action、Policy Version、随机种子和真实选择概率；不满足这些条件时，应重新采集探索流量或使用更弱的评估结论。

```python
def thompson_sample(alpha, beta, rng):
    if len(alpha) != len(beta) or not alpha:
        raise ValueError("alpha and beta must have the same non-zero length")
    if any(a <= 0 for a in alpha) or any(b <= 0 for b in beta):
        raise ValueError("beta posterior parameters must be positive")

    sampled_rate = [
        rng.betavariate(a, b)
        for a, b in zip(alpha, beta)
    ]
    return max(range(len(sampled_rate)), key=sampled_rate.__getitem__)
```

若本轮选择的 arm 索引为 `a`，二项反馈为正时只更新 `alpha[a] += 1`，否则只更新 `beta[a] += 1`；未被选择的 arm 不获得本轮反馈。

真实推荐中候选数巨大且上下文不同，通常需要 contextual bandit、分层先验或以模型不确定性生成 exploration bonus，而不是为每个商品独立维护简单 Beta 分布。

<a name="sec-4-3"></a>

### 4.3 探索数据的价值

探索不仅追求即时收益，还用于降低曝光选择偏差、发现潜在优质供给和改善下一轮训练数据。分析时应区分：

- Immediate reward：当前点击、购买或净成交；
- Information gain：对商品质量不确定性的降低；
- Future value：新供给进入常规流量后的长期收益。

<a name="sec-5"></a>

## 5. 实验设计难点

新商品供给会在实验期间持续进入，且实验组对商品产生的互动可能反过来影响全站排序。这可能违反用户级 SUTVA。

可根据问题考虑：

- 用户级 A/B：衡量整体买家体验，解释直接；
- 商品/商家级随机化：衡量供给扶持，但要处理用户暴露交叉；
- 双边/cluster randomization：降低干扰，成本和复杂度更高；
- switchback：适合共享资源和时段性处理；
- 长期 holdout：观察供给成长与反馈闭环。

<a name="sec-6"></a>

## 6. 新用户与新商家

<a name="sec-6-1"></a>

### 6.1 新用户

新用户没有长期序列，但并非没有上下文。可按信息出现顺序逐步更新：

```text
market / entry / device
→ optional onboarding preference
→ first impressions and skips
→ first product or room interactions
→ session intent
→ persistent profile
```

初始候选可来自人群高质量池、当地趋势、入口意图和内容/商品类目；session 内应快速使用跳过、播放、进房、PDP 和加购更新短期表示。策略上不要把探索成本集中给本就高流失风险的新用户，可提高确定性与质量门槛，并保留有限发现空间。

<a name="sec-6-2"></a>

### 6.2 新商家

新商家缺少履约与交易后验。模型可使用资质、商品完整度、价格竞争力、内容质量和类目先验，但需把“预测质量”与“已有规模”分开，避免头部商家历史成为不可逾越的优势。探索预算应绑定库存、风险、客服/履约早期反馈和退款成熟窗口；一旦出现风险信号，应能快速降级或停止。

<a name="sec-7"></a>

## 7. 指标

买家侧：CTR、CVR、Net GMV、负反馈、留存。

供给侧：eligible-to-first-impression time、新商品覆盖、达到质量门槛比例、商家发布/上新、流量集中度。

学习效率：每单位探索曝光获得的有效反馈、从探索到常规流量的 graduation rate、误扶持成本。

必须同时报告数量、质量和时间窗口；“新商品曝光增加”不是独立成功标准。

按决策面还应补充：

- 短视频：首次有效播放/商品点击时间、内容—商品双重成功率、创作者后续发布；
- 直播：开播到首次进房/有效观看/成交时间、下播前学习效率、room 可用曝光率；
- 商品卡：上架到首次 PDP/加购/净成交时间、库存售罄前的有效学习量、新商家履约质量；
- 商品搜索：新查询到首个有效结果/详情访问/支付时间、Valid Result Coverage、改写率与无结果率；
- 创作者选品与合作：首次合格匹配/接受/内容发布时间、关系覆盖、合作履约和成熟净价值；
- 新用户：首个 session 成功率、次日/长期留存、fallback 占比与兴趣收敛速度。

<a name="sec-8"></a>

## 8. Empirical Bayes 平滑

低曝光商品的原始 CTR/CVR 方差很大。Beta-Binomial 平滑可将小样本估计收缩到总体先验：

```math
\hat{p}_i=\frac{click_i+\alpha}{impression_i+\alpha+\beta}
```

先验参数可按类目或市场历史数据估计。平滑能降低偶然一次点击造成的过度放大，但不能替代探索；若商品从未曝光，仍缺少个体证据。

---

<a name="sec-9"></a>

## 9. 工业案例：有限反馈下如何安全学习

以下流量比例和指标均为示意值。冷启动不是无条件增加曝光，而是在资格门槛、学习效率和用户体验之间配置可回收的探索预算。

<a name="sec-9-1"></a>

### 9.1 新短视频商品内容：一次偶然点击不应触发全量放大

- **发生什么**：一条新商品视频仅获得 20 次可见曝光和 1 次商品点击，原始商品点击率达到 5%，高于入口平均值；直接按原始 CTR 加权后，曝光迅速扩大，但 Fast Skip 和负反馈明显增加。
- **学习问题**：小样本比例方差很高，而且视频兴趣、商品兴趣和绑定一致性尚未分别验证。一次点击可能来自偶然行为或标题吸引。
- **正确做法**：先通过内容、商品和创作者先验进入小流量探索；对点击率做分层平滑，同时要求满足最低有效曝光，并联合有效观看、商品点击和早期交易质量决定是否毕业。
- **应监控指标**：Eligible-to-first-impression Time、有效曝光量、Smoothed CTR、Qualified View、Fast Skip、Product Click、绑定有效率、Graduation Rate 和探索负反馈成本。

<a name="sec-9-2"></a>

### 9.2 新直播场次：成熟主播也存在 session 冷启动

- **发生什么**：一位历史表现稳定的主播开启新场次并从美妆切换到家居商品。若完全沿用历史观众，新场次前 10 分钟进房率尚可，但商品点击率下降 30%，Quick Exit 上升。
- **学习问题**：可复用的是主播层面的内容与履约先验，不是本场商品兴趣。把跨场次历史直接当作当前 room session 的后验，会错误放大旧受众。
- **正确做法**：用主播先验、当前商品语义和开播信息选择小规模匹配人群；随着有效观看、商品组件曝光、点击和退出信号到达，更新本场 posterior。探索预算还必须受剩余直播时长、库存和实时风险约束。
- **应监控指标**：开播到首次有效进房时间、前 5/10/30 分钟 Qualified Entry、Quick Exit、商品组件可见率、Product Click、Posterior Uncertainty、剩余可售库存和单位探索曝光的信息收益。

<a name="sec-9-3"></a>

### 9.3 新商城商品卡：库存耗尽前能否学到可靠结论

- **发生什么**：一个新 SKU 只有 80 件库存，系统用 10% 探索流量收集反馈；高点击很快消耗库存，但支付与退款标签尚未成熟，策略无法判断商品是否值得长期推荐。
- **学习问题**：只优化点击会把有限库存用于低质量学习；只等待成熟交易又可能在商品售罄后才得到结论。新商家的履约先验也可能比商品兴趣更不确定。
- **正确做法**：以库存和可销售时长约束探索预算，混合随机曝光与意图匹配流量；用 PDP、加购和支付作早期信号，同时保留退款成熟后的质量复核。商品毕业与商家风险放行应是两个独立状态。
- **应监控指标**：Time-to-first-PDP/ATC/Pay、每单位库存获得的有效反馈、Stockout-before-learning Rate、支付率、成熟退款率、商家履约质量、Graduation Rate 和误扶持成本。

<a name="sec-9-4"></a>

### 9.4 新创作者—商品关系：单边历史不能证明双方匹配

- **发生什么**：新创作者进入选品系统后，模型主要依赖商品历史成交和商家规模，把大部分候选集中到少量头部商品。关系曝光后的查看率尚可，但接受后内容发布率低，发布时间长，成熟交易没有同步增长。
- **学习机制**：创作者质量和商品质量都是单边先验，不能替代“这个创作者是否适合表达这个商品”的关系后验。若训练数据只包含历史已接受或已发布的关系，模型还会把旧匹配策略造成的选择偏差当成真实偏好。
- **实现与决策**：为创作者、商品、商家和关系分别维护表示与不确定性；先做资格、库存与风险过滤，再在受众—类目匹配门槛内分配小规模关系探索。反馈状态按关系曝光、接受、内容发布、买家有效曝光、支付和成熟交易逐步更新，毕业规则同时要求创作履约与交易质量。
- **应监控指标**：T-day Cumulative First-match Rate、截至 T 日的 Restricted Mean Waiting Time to First Match、Match Acceptance、T-day Cumulative Publish Rate、截至 T 日的 Restricted Mean Waiting Time to Publication、Creator/Product/Seller Coverage、成熟净价值 per Point-in-time Eligible Relation、重复合作、集中度和误匹配成本。关系价值需要互斥订单 Credit；无法排他认领时按 Randomized Eligible Creator / Seller 报告。
- **失败边界**：不能只分析已匹配、已接受或已发布内容的关系，因为这些是策略改变后的中介变量；未在观察期内匹配或发布者必须作为右删失，或以 `T` 进入对应受限等待时间，不能被丢弃。同一创作者的产能、同一商品的库存、商家预算和买家跨组内容消费还会造成单元间干扰。若探索只提高邀请或接受而没有提升合格内容与成熟交易，应停止放大。

---

<a name="sec-10"></a>

## 10. 关联文档

[召回](./retrieval.md)、[重排](./reranking.md)、[A/B Testing](./ab-testing.md)。
