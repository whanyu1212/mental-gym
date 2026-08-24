# 推荐系统优化与诊断｜System Optimization

<a name="top"></a>

## 目录

- [1. 优化不是模型清单](#sec-1)
- [2. 召回组合与配额](#sec-2)
  - [2.1 配额优化](#sec-2-1)
- [3. 模型迭代路线](#sec-3)
  - [3.1 单项收益不能直接相加](#sec-3-1)
- [4. 不同决策面的系统瓶颈](#sec-4)
- [5. 特殊人群与场景](#sec-5)
- [6. 诊断优先于大改](#sec-6)
  - [6.1 Stage Funnel SQL](#sec-6-1)
  - [6.2 GMV 分解](#sec-6-2)
- [7. 优先级评分](#sec-7)
- [8. 实验与发布](#sec-8)
- [9. 模型监控](#sec-9)
  - [9.1 Drift 应按链路拆分](#sec-9-1)
  - [9.2 全量训练、增量训练与在线学习的边界](#sec-9-2)
  - [9.3 相互独立的更新平面](#sec-9-3)
  - [9.4 数据窗口、Replay 与长期 incumbent](#sec-9-4)
  - [9.5 双塔、物化向量与 ANN 版本一致性](#sec-9-5)
  - [9.6 监控、回滚与跨场景更新策略](#sec-9-6)
- [10. 工业案例：先找到瓶颈，再选择改动](#sec-10)
  - [10.1 短视频商品内容：更复杂的模型没有修复入口损失](#sec-10-1)
  - [10.2 直播内容：放量后效果衰减来自容量与特征新鲜度](#sec-10-2)
  - [10.3 商城商品卡：活动期数据漂移并不等于模型失效](#sec-10-3)
  - [10.4 跨渠道协同：归因增长但总增量停滞](#sec-10-4)

---

<a name="sec-1"></a>

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

例如短视频商品内容的 Watch Time 上升，但商品点击和成熟净交易下降，不能立即得出“精排模型需要更复杂”的结论。先检查商品入口是否真实可见、内容与绑定商品是否一致、召回是否混入更多纯内容候选、重排是否改变商品内容密度，再看精排各任务的校准。若问题来自商品组件曝光减少，升级 DIN 或 DCN 既昂贵也不会修复根因。

直播电商中，进房率突然下降也可能不是用户兴趣模型退化，而是候选池中下播房间增多、online-state 特征延迟或当前商品缺货。商城商品卡的 CTR 下降则可能伴随支付率和成熟净价值上升，表示系统减少了低意图点击。优化前先做链路分解，是为了区分“指标变化”和“真正需要修改的模块”。

<a name="sec-2"></a>

## 2. 召回组合与配额

召回总量受粗排容量限制。新增通道若挤占更有效通道，可能提升自身命中却损害整体结果。评估至少包括：

- quota 与实际 return rate；
- unique contribution 和 channel overlap；
- 下游 pass / exposure / conversion；
- 各市场、类目和用户群的边际收益；
- 每单位 latency 或候选成本的业务价值。

通道价值应看“替代谁之后的边际增量”，而非孤立的历史归因 GMV。

<a name="sec-2-1"></a>

### 2.1 配额优化

设渠道 `c` 分配 `k_c` 个候选，总预算为 `K`：

```math
\max_{\mathbf{k}} V(k_1,\ldots,k_C),
\qquad \text{s.t. }\sum_c k_c\le K
```

联合价值函数 `V` 显式允许一个渠道的边际收益依赖其他渠道的配额。单渠道价值通常具有边际收益递减，并受到渠道重叠影响，因此不能独立拟合每个渠道的价值后直接相加。可通过离线 replay、leave-one-channel-out、历史 quota 实验或小流量在线实验估计条件边际收益。

<a name="sec-3"></a>

## 3. 模型迭代路线

| 方向 | 典型假设 | 关键风险 |
|---|---|---|
| 新召回/表示 | 找到旧系统漏掉的高价值商品 | 重叠、热门偏差、索引新鲜度 |
| 粗排升级 | 更好保留精排高价值候选 | 延迟、teacher bias、slice 淘汰 |
| 精排多任务 | 更贴近交易与长期价值 | negative transfer、校准漂移 |
| 行为序列 | 捕捉 session 意图与兴趣演化 | 特征延迟、长序列成本 |
| 重排/探索 | 改善列表体验与供给学习 | 短期效用损失、规则冲突 |
| 在线学习 | 更快适应趋势和供给变化 | 反馈环、稳定性、回滚困难 |

<a name="sec-3-1"></a>

### 3.1 单项收益不能直接相加

策略 A 单独提升、策略 B 单独提升，不代表组合收益等于两者之和。令：

```math
\mu_{ab}=E[Y\mid A=a,B=b]
```

二阶交互效应为：

```math
I_{AB}=\mu_{11}-\mu_{10}-\mu_{01}+\mu_{00}
```

- `I_AB > 0`：协同，组合出现 `1+1>2`；
- `I_AB < 0`：互相抵消、抢占同一机会或触发约束，出现 `1+1<2`；
- `I_AB = 0`：在所选尺度上近似可加。

推荐系统中非加性很常见：两条召回通道争夺固定 quota；粗排扩容只有在精排有能力利用新增候选时才有价值；精排 score 改变后，旧重排阈值和多样性参数可能不再适用；不同的新供给扶持策略可能争夺同一批曝光。

若需要估计组合效果，应使用同一时期的 `Control / A / B / A+B` factorial design，或至少单独运行 `A+B` 实验。只有在用户分流、特征、流量和共享资源都真正独立时，才可把实验放在正交层并近似解释主效应；“技术模块不同”不自动等于统计上正交。详细实验设计见 [A/B Testing](./ab-testing.md)。

<a name="sec-4"></a>

## 4. 不同决策面的系统瓶颈

| Surface | 首要可用性检查 | 高价值优化方向 | 常见误判 |
|---|---|---|---|
| 短视频商品内容流 | 视频可播、商品绑定有效、内容/商品状态一致 | 多模态召回、session 实时序列、时长去偏、多目标内容—交易融合、双层去重 | 播放时长提升被误判为商品兴趣提升；视频多样却商品重复 |
| 直播内容流 | room online、当前商品与库存、状态 TTL | 高频候选刷新、用户—主播—商品交互、实时热度去偏、下播前复核 | 复用主播历史掩盖本场变化；陈旧房间造成召回/排序虚高 |
| 商城商品卡 | offer 可售、价格、库存、配送与履约 | 购买意图序列、替代/互补召回、CVR/净价值校准、SPU/SKU/offer 去重 | CTR 被低价/促销吸引；订单未成熟便计算净成交 |
| 商品搜索与类目浏览 | 查询约束、类目映射、可售结果和索引新鲜度 | 查询理解、属性召回、Valid Recall、分层补齐和会话意图 | 语义相关掩盖属性不符；过滤后列表不足却被误判为排序问题 |
| 创作者选品与商品橱窗 | 关系资格、商品可售、人工展示设置和内容状态 | 双边表示、关系探索、候选覆盖、人工与算法顺序协调 | 用单边热门替代匹配质量；只看接受而忽略内容发布和成熟交易 |
| 商品详情页内容模块 | 内容与当前商品精确绑定、模块可见和页面性能 | 内容质量、多卖点覆盖、列表去重、增量决策价值 | 互动率提升被误判为购买增量；重复内容增加延迟并抢占购买路径 |
| 自然、联盟与付费流量协同 | 渠道资格、预算、创意授权、库存和去重曝光 | 全渠道增量估计、预算分配、创意复用、频次和成本约束 | 渠道归因重复认领成交；付费流量挤占自然或联盟增量 |

跨场景共享 representation 能降低冷启动与维护成本，但要区分用户兴趣迁移、同一商品在不同载体上的展示差异，以及各决策面自身的标签和位置机制漂移。建议共享内容/商品 encoder，保留场景 embedding、task-specific head 和分场景 calibration；只有在离线与在线均证明可迁移时再扩大共享。

<a name="sec-5"></a>

## 5. 特殊人群与场景

新用户、低活用户、购买高意图用户以及不同市场的最优策略可能不同。分群策略应满足：

- 分群在处理前可定义；
- 有足够样本和稳定归属；
- 机制与特征可解释；
- 避免为了 subgroup lift 牺牲整体复杂度；
- 在线实验能识别交互效应。

模型适配可以从低维护成本到高维护成本逐级升级：先使用共享模型加 segment/surface embedding；再考虑 segment-conditioned gate、task head 或分群校准；只有当数据量、机制和长期收益都足够稳定时，才维护独立模型。另一种常见方案是在共享主模型输出上学习分群 residual correction，使小模型拟合主模型在该群体上的系统误差。它比复制完整模型便宜，但必须防止小样本过拟合，并持续监控 residual 是否随主模型版本失效。

专属候选池与专属模型也不是同一件事。新用户可以使用更严格的高质量候选池，同时复用同一个召回编码器在不同索引中检索；只有证明共享表示在目标群体上存在稳定偏差后，才需要单独训练塔或 expert。分群越来越细会带来样本稀疏、实验流量分裂和无人维护的长期成本。

<a name="sec-6"></a>

## 6. 诊断优先于大改

推荐系统常见“便宜但高价值”的优化包括：

- 修复曝光/订单/退款归因；
- 恢复缺失或陈旧特征；
- 调整召回重叠与无效 quota；
- 修复库存、eligibility 和索引延迟；
- 改善概率校准和 score 融合；
- 定位重排规则冲突与异常 fallback。

这些改动可能比更复杂模型产生更确定的收益。

<a name="sec-6-1"></a>

### 6.1 Stage Funnel SQL

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
    WHERE event_date = :event_date
    GROUP BY request_id, item_id
)
SELECT
    SUM(recalled) AS recalled_items,
    SUM(passed_prerank) * 1.0 / NULLIF(SUM(recalled), 0)
        AS recall_to_prerank,
    SUM(entered_rank) * 1.0 / NULLIF(SUM(passed_prerank), 0)
        AS prerank_to_rank,
    SUM(exposed) * 1.0 / NULLIF(SUM(entered_rank), 0)
        AS rank_to_exposure
FROM stage;
```

这里使用 ratio of sums，而不是先对每个 request-item 的二元比率取平均。生产表通常需要先在 request-item 粒度去重，并按召回渠道、类目、新老商品、市场、Surface 和实验组切片。不同阶段日志覆盖不一致时，比率变化可能只是 logging change。

<a name="sec-6-2"></a>

### 6.2 GMV 分解

可从恒等式开始：

```math
GMV=Impression\times CTR\times CVR_{click}\times AOV
```

若各因子为正、使用同一 Cohort 且上式严格成立，则两组之间的对数变化也是恒等式：

```math
\Delta\log GMV=
\Delta\log Impression+\Delta\log CTR+
\Delta\log CVR_{click}+\Delta\log AOV
```

这是一种诊断分解，不是因果归因；各组成项会共同受到 treatment 影响。

<a name="sec-7"></a>

## 7. 优先级评分

可以用简化框架比较项目：

```text
Expected impact × Confidence × Reach
------------------------------------
Engineering + experiment + operational cost
```

Confidence 应来自数据质量、机制证据、离线回放和相似实验，而不是模型新颖度。

<a name="sec-8"></a>

## 8. 实验与发布

每个优化都应绑定：

- 明确的 mechanism 与 primary metric；
- stage diagnostic 和 end-to-end business metrics；
- 用户、交易、生态与系统 guardrails；
- 预期 effect、MDE、实验周期和成熟窗口；
- ramp-up gate、owner 与 rollback 条件。

相关：[系统链路](./recommendation-system-pipeline.md)、[在线实验流程](./online-experiment-lifecycle.md)。

<a name="sec-9"></a>

## 9. 模型监控

上线后需要分层监控：

| 层级 | 示例 |
|---|---|
| Data | 缺失率、延迟、取值范围、训练—服务偏差 |
| Model | score/embedding norm、calibration、drift |
| System | P50/P95/P99 latency、timeout、fallback |
| Business | CTR、CVR、Net GMV、退款和供给分布 |

Population Stability Index 可用于粗略监控分布变化：

```math
PSI=\sum_b(p_b-q_b)\log\frac{p_b}{q_b}
```

`p_b` 与 `q_b` 必须来自同一组预先固定的 bins。若某个 bin 的占比为 0，应使用一致的 epsilon smoothing 并重新归一化，否则会出现 `log(0)` 或除零。PSI 对分桶和 epsilon 敏感，也不能说明 drift 是否有害；它适合作为告警入口，而不是自动回滚的唯一依据。

<a name="sec-9-1"></a>

### 9.1 Drift 应按链路拆分

| Drift | 例子 | 诊断 |
|---|---|---|
| Data drift | 类目、价格带、视频时长、直播房间构成变化 | feature distribution、missing、freshness |
| Label drift | 点击、支付、退款基准率变化 | matured label rate、calibration by time/surface |
| Policy drift | 召回配额、重排规则或探索策略改变训练分布 | source/pass/exposure propensity、版本切片 |
| Serving drift | 线上特征、模型或 embedding 与离线版本不一致 | training-serving skew、version join、fallback |
| Availability drift | 直播下播、库存和价格高速变化 | valid-at-score vs valid-at-exposure、TTL |

<a name="sec-9-2"></a>

### 9.2 全量训练、增量训练与在线学习的边界

更新方式应由训练数据范围、参数更新范围和触发频率共同定义，不能由“训练了几个 epoch”或“是否从旧 checkpoint 启动”单独判断。

| 术语 | 数据与触发 | 参数范围 | 需要澄清的边界 |
|---|---|---|---|
| Full / Batch Retraining | 使用完整保留窗口或 rolling window，周期性运行 | 通常更新全部参数，也可以冻结特定模块 | 可以从随机初始化，也可以 warm-start；全量不等于必须使用永久历史 |
| Incremental Training | 主要消费上次 checkpoint 后的新数据，通常混入 Replay | 可以更新全部参数，也可以只更新部分参数 | 小时级或日级 micro-batch 也属于增量，不要求逐事件更新 |
| Online Learning | 标签到达后，以事件或很小的 micro-batch 连续更新 | 由设计决定，并非只能更新 ID embedding | 是增量学习的一种高频形式，不等于在线推理或实时特征更新 |
| Warm-start | 从已有 checkpoint 初始化新一轮训练 | 与网络兼容性有关 | 它是初始化策略；全量和增量训练都可以 warm-start |
| Continuous Training | 自动触发、验证和发布训练任务 | 可以采用全量或增量方案 | 描述的是流水线持续运行，不限定优化算法 |

如果“昨日数据”指昨日新增的一天日志，并在昨日 checkpoint 上训练一个 epoch，这更准确地属于 daily warm-start incremental training。只有当“昨日数据”指截至昨日重新生成的完整或滚动训练窗口时，才可称为 full-window training。Epoch 数只表示数据被遍历几次，不定义训练方式。

在线用户序列、直播房间状态、库存或价格发生变化后立即参与推理，属于 state/feature update；只要没有通过学习规则修改可训练参数或模型状态，就不是 Online Learning。神经模型通常使用梯度更新，但在线学习也可以采用其他参数更新规则。反过来，Online Learning 也未必真正“实时”：支付、退款等标签有成熟延迟，通常只能在标签到达后更新对应任务。

“增量训练只更新 ID embedding”同样过于狭窄。冻结主干、只更新活跃 ID rows 是一种低成本方案；也可以更新浅层 head、校准层、某一侧 tower 或全部网络。选择取决于稳定性、训练成本、标签延迟和 Serving 兼容性。

<a name="sec-9-3"></a>

### 9.3 相互独立的更新平面

生产系统中的“更新”要按对象和发布依赖拆成相互独立的平面：

| 更新平面 | 典型对象 | 是否修改模型参数 | 常见节奏 | 主要失败模式 |
|---|---|---:|---|---|
| Feature / State | 用户近期行为、room online state、当前商品、库存、价格、实时统计 | 否 | 秒级到小时级 | TTL 过期、乱序事件、离线回填覆盖历史状态 |
| Trainable Parameters | 网络权重、ID embedding rows、task head、optimizer state | 是 | 事件级到周期性 Batch | 顺序偏差、灾难性遗忘、梯度异常、反馈环 |
| Materialized Representation | 由 tower 导出的 item vector、缓存 user vector、图 embedding | 否，属于模型推理或导出结果 | 新对象触发、增量回填或全库重算 | 编码器与向量版本错配、部分回填、向量尺度漂移 |
| Serving Index / Config | ANN Base/Delta Index、I2I 邻居、tombstone、eligibility cache、配额 | 否 | 实时写入到周期性重建 | 删除不及时、重复向量、索引召回下降、配置与模型不兼容 |

这些平面可以使用不同节奏。用户刚点击一个商品后，更新 session state 并重新计算 query vector，不代表用户 ID embedding 已经完成梯度更新；新商品用冻结的内容塔生成向量并写入 ANN，也不代表模型完成了增量学习。

更新计划应显式维护依赖关系：

```text
point-in-time data
→ training checkpoint
→ materialized embeddings
→ serving index / cache
→ traffic release
```

上游版本变化不一定要求所有下游全量重建，但必须证明兼容。Item-side feature schema/preprocessing、item tower 权重、向量归一化或 embedding dimension 改变时，通常不能继续复用旧向量与旧索引；只改变未被 item encoder 使用的字段则不必重编码。

<a name="sec-9-4"></a>

### 9.4 数据窗口、Replay 与长期 incumbent

设 `D_W` 为在时点正确构造、标签已经成熟的训练窗口，Batch 训练目标可写为：

```math
\mathcal L_{batch}(\theta)=
\frac{1}{|\mathcal D_W|}
\sum_{z\in\mathcal D_W}\ell(z;\theta)
```

只用最新 micro-batch 会让梯度集中在当前供给和旧策略刚刚曝光的对象。增量训练通常混入 Replay，并可加入稳定性约束：

```math
\mathcal L_t(\theta)=
(1-\rho)\,\mathbb E_{z\sim\mathcal D_t^{new}}[\ell(z;\theta)]
+\rho\,\mathbb E_{z\sim\mathcal R_t}[\ell(z;\theta)]
+\lambda\,\Omega(\theta,\theta_{t-1})
```

其中 `R_t` 是历史 Replay 样本，`0<=rho<=1` 控制新旧数据权衡，`lambda>=0` 控制稳定性约束；`Omega` 可以是参数距离、旧模型输出蒸馏或其他稳定性约束。`rho=0` 不等于更实时，只表示没有 Replay 保护；过大的 `rho` 又可能降低对新趋势的适应速度。

一次在线或 micro-batch 参数更新可以抽象为：

```math
\theta_t=\theta_{t-1}
-\eta_t\nabla_{\theta}\mathcal L(\mathcal B_t;\theta_{t-1})
```

但公式成立不代表日志无偏。`B_t` 仍来自旧策略选择，需要检查曝光支持度、负采样、标签成熟、重复事件和策略反馈环。支付或退款任务不能因为新日志尚未出现结果就提前标成负例；可以延迟更新、使用任务专属窗口，或把未成熟样本视为 censored。

Replay 不应只保存总体热门样本。可按类目、市场、新旧供给、用户活跃度和历史时间段分层，并记录旧策略版本；否则 Replay 可能继续放大原有头部偏差。训练时还要明确 Adam/Adagrad 等 optimizer state 是继承、部分重置还是全部重置，因为这会改变高频与长尾 ID rows 的有效学习率。

持续 warm-start 的 incumbent 可能已经吸收数月数据，新结构从随机初始化只训练几天，直接比较会把模型年龄误当成结构优劣。更公平的两阶段评估是：

1. Architecture Test：使用相同 point-in-time 数据窗口、标签、负采样、训练步数和计算预算；结构兼容时复用相同 checkpoint/embedding，不兼容时复用共同 backbone 或采用匹配初始化；
2. Catch-up Test：确认新结构有潜力后，再通过参数复用、Teacher Distillation 或历史 Replay 追赶长期 incumbent。

<a name="sec-9-5"></a>

### 9.5 双塔、物化向量与 ANN 版本一致性

双塔上线不是只发布“用户塔和一份物品向量”。完整发布链路通常包括：

```text
compatible user/item tower checkpoint
→ encode eligible item corpus
→ build or update ANN Base/Delta Index
→ validate vector coverage and ANN recall
→ bind feature schema and eligibility version
→ atomic traffic switch
```

需要按改动类型决定重算范围：

- item tower 的共享权重、归一化方式或 embedding dimension 改变：旧 item vectors 通常全部失效，需要全库重编码并重建或重新装载索引；
- item tower 冻结，仅有新 item 上架或已有 item 内容变化：可以只生成受影响向量并写入 Delta Index；
- 只更新某些 item ID embedding rows：至少重新导出这些 rows 对应的物化向量；若同时改动共享层，则不能只刷新活跃 rows；
- user tower 改变、item tower 与向量冻结：只有在训练时明确约束 user 输出继续对齐固定 item space，并通过离线精确检索验证后，才能复用旧 item vectors；
- 仅更新用户 session state：通常只需重新计算请求侧向量，不修改 item index。

新 item 若没有可训练 ID 历史，可以用冻结的内容/属性塔生成初始向量并写入 Delta Index。这是 cold-start inference + index mutation，不是 Online Learning。后续行为信号可以进入下一轮训练，或通过已经训练过的融合模块更新表示；不能未经训练就把协同向量与内容向量任意加权相加。

ANN 还需要处理 tombstone、重复 ID、Base/Delta 合并和周期性 compaction。下架、缺货或直播下播首先属于 eligibility/state 更新；即使向量尚未物理删除，曝光前也必须过滤。动态写入过多后，应以 Exact Top-K 对照监控 ANN Recall，并在图结构或量化误差恶化时重建 Base Index。

发布单元应绑定 `network_version`、`item_encoder_version`、`embedding_snapshot`、`feature_schema`、`index_version`、`reranker_service_build`、`algorithm_implementation_version` 和必要的下游校准/重排配置。重排配置至少包括 Similarity Encoder / Kernel Version、Similarity Normalization/Mapping、Utility Normalization、MMR Lambda 或 DPP Alpha、Residual Floor、Jitter/Clamp Tolerance、Window Size、Tie-break、Fallback、Constraint 与 Relaxation Version。切换时应原子切换指向一套已验证兼容组合的 Release Manifest Pointer；这不要求所有底层 Artifact 同时生成，但禁止请求看到混合版本。回滚也要恢复整套兼容组合，不能只回滚网络权重而继续使用新索引或旧阈值。

<a name="sec-9-6"></a>

### 9.6 监控、回滚与跨场景更新策略

持续更新至少需要以下监控：

| 层级 | 关键检查 |
|---|---|
| Data / Label | 新旧数据比例、Replay 覆盖、成熟标签率、去重、采样和 propensity 漂移 |
| Training | Loss by source、梯度范数、NaN/Inf、optimizer state、活跃 ID row 数、训练吞吐 |
| Model | Score/embedding norm、校准、旧模型一致性、新旧供给 slice、灾难性遗忘 |
| Materialization | 待回填向量数、向量年龄、编码失败、维度/归一化一致性 |
| Index | Base/Delta 规模、tombstone、重复 ID、ANN Recall、index age、版本 join 失败 |
| Serving / Business | P99 latency、fallback、valid-at-exposure、核心漏斗、供给集中度和长期质量 |
| Re-ranking | similarity/kernel build 与 greedy selection 分段延迟、utility loss、constraint relaxation、rank deficiency、显著负 residual、PSD failure、no-solution、jitter/clamp/early-stop/fallback rate |

训练或物化任务出现异常时应先停止后续发布，而不是让错误继续进入索引。Canary 必须验证整个 release bundle；若触发回滚，应冻结新的增量写入、恢复上一套兼容 manifest，并确认缓存和 Delta Index 没有残留新版本向量。

以下更新节奏仅为示例，不是通用默认值：

| 场景 | 示例更新策略 | 为什么拆开更新 | 重点护栏 |
|---|---|---|---|
| 短视频商品内容 | 用户近期状态每 `1` 分钟内更新；新视频内容向量每 `5` 分钟增量写入；双塔网络每日 rolling-window 训练；Base Index 每日重建 | 新内容需要快速可召回，但支付标签和网络参数无需按每次播放更新 | 新视频 vector age、绑定有效率、Delta 占比、内容/交易 Recall、创作者集中度 |
| 直播内容流 | room online state 和库存 TTL 设为 `30` 秒；当前商品与 session vector 每 `1` 分钟更新；网络每日 rolling-window Batch 训练，在线房间使用短生命周期 Delta Index | 房间有效性变化远快于兴趣模型，先保证候选可服务 | 下播误召、Feature Age、当前商品一致率、Delta 删除延迟、Quick Exit |
| 商城商品卡 | 价格库存每 `5` 分钟内同步；新 SKU 内容向量每 `15` 分钟写入；活跃 ID embedding rows 每小时 micro-batch 训练并重新物化；主网络每日或每周 full-window retraining/calibration | 交易标签成熟较慢，而价格库存需要更快更新 | 缺货曝光、价格一致率、成熟 CVR 校准、同款重复、长尾覆盖与退款 |
| 商品搜索与类目浏览 | query 与筛选条件按请求生效；商品属性、价格库存和 Delta Index 分别按变化速度更新；查询模型与校准按成熟反馈周期训练 | 查询意图即时变化，商品可售状态与模型参数不应绑定同一发布节奏 | Zero-result、Valid Recall、Result Fill、Reformulation、索引年龄和查询 P99 延迟 |
| 创作者选品与商品橱窗 | 合作资格、商品状态和人工展示设置快速同步；关系表示增量物化；匹配模型按接受、发布和成熟交易标签周期训练 | 双边关系状态与创作反馈快慢不同，接受不等于已经形成有效供给 | Relationship Coverage、Time-to-Content、Publish Rate、商品可售率、集中度和成熟净价值 |
| 自然、联盟与付费流量协同 | 曝光、预算消耗和频次近实时汇总；创意资格与授权独立更新；交易成熟后再校准价值和渠道成本 | 流量分配需要快速控制，渠道增量和退款质量只能在更长窗口确认 | 去重 Reach、Frequency、Spend、Commission、Incremental Return、渠道蚕食和库存消耗 |

短视频场景若新视频覆盖不足，应先区分“内容向量生成慢”“Delta Index 未写入”和“粗排淘汰”，而不是直接提高 Online Learning 频率。直播场景若下播误召上升，应优先修复 state TTL 与 tombstone，不应把它解释为 user-room embedding 退化。商城活动期若实时低价样本激增，增量训练需保留常态 Replay 并监控价格带校准，避免把短期促销分布固化为长期偏好。搜索结果不足应先检查查询约束、可售过滤和索引新鲜度；跨渠道总价值停滞则要检查去重曝光、预算挤占和归因口径，而不是分别提高每个渠道的模型更新频率。

---

<a name="sec-10"></a>

## 10. 工业案例：先找到瓶颈，再选择改动

以下数字均为示意值。优化方案应对应已经定位的瓶颈，并同时说明预期收益、系统成本、护栏和回滚条件。

<a name="sec-10-1"></a>

### 10.1 短视频商品内容：更复杂的模型没有修复入口损失

- **发生什么**：精排模型增加序列网络后离线 AUC 提升 0.4%，线上 Watch Time 提升 3%，但商品入口可见率下降 7%，成熟净价值下降 2%。
- **诊断问题**：团队若只看到离线和观看收益，容易继续扩大模型；实际瓶颈可能是重排降低了商品内容密度，或商品组件在长视频中出现得更晚。
- **正确做法**：先比较 Eligibility、各召回通道、粗排保留、精排分数、最终位置和商品入口渲染的阶段漏斗；确认损失由展示位置造成后，优先修复重排约束或界面曝光逻辑，再评估是否保留复杂模型。
- **应监控指标**：Stage Retention、商品内容占比、商品入口可见率、Watch Time、Product Clicks per User、Mature Net Value、P99 延迟、模型超时和 Fallback Rate。

<a name="sec-10-2"></a>

### 10.2 直播内容：放量后效果衰减来自容量与特征新鲜度

- **发生什么**：策略在 5% 流量时进房率提升 6%，放量到 50% 后只提升 1%，P99 延迟增加 40 毫秒，状态特征超过 TTL 的比例从 1% 升至 8%。
- **诊断问题**：小流量收益可能依赖热点候选和充足缓存；放量后请求竞争、缓存未命中和房间状态延迟共同改变了实际策略，并非统计波动或模型效果自然消失。
- **正确做法**：按流量档位记录模型版本、缓存命中、候选新鲜度和有效曝光；压测特征服务与重排，在容量不足时限制高成本特征、启用可追踪的降级路径，并根据预设阈值暂停放量。
- **应监控指标**：Effect by Ramp Stage、Feature/Kernel Build 与 Greedy Selection 的分段 P50/P95/P99、Timeout、Cache Hit Rate、Feature Age、Valid-at-exposure Rate、Fallback Share、Quick Exit 和成熟净价值。

<a name="sec-10-3"></a>

### 10.3 商城商品卡：活动期数据漂移并不等于模型失效

- **发生什么**：促销期间低价格带商品占比从 25% 升至 48%，总体 CTR 上升 15%，但校准误差、缺货曝光和头部商家集中度同时恶化。
- **诊断问题**：总体点击增长可能由供给构成和促销强度驱动；若立即用活动数据增量训练，模型可能把短期低价偏好固化，并扩大热门供给反馈环。
- **正确做法**：把 Data、Label、Policy、Serving 和 Availability Drift 分开；按价格带、类目、库存和商家切片校准，训练时标记活动环境并保留常态样本；上线后用长期基线和活动专用阈值共同监控。
- **应监控指标**：Feature PSI、Calibration Error、价格带 Mix、Eligible Coverage、缺货曝光率、Top Seller Share、CTR、Buyer Conversion、成熟退款率和训练—服务版本一致率。

<a name="sec-10-4"></a>

### 10.4 跨渠道协同：归因增长但总增量停滞

- **发生什么**：自然推荐、联盟分销和付费投放各自的归因交易额都上升，但全量成熟净交易只增长 1%，广告成本与佣金合计增长 18%，同一批用户的重复触达和头部商品库存消耗明显增加。
- **系统机制**：各渠道使用自己的末次触点或点击窗口认领订单，同一商品、创意和用户会在渠道间迁移。付费放量可能把本来会由自然或联盟完成的交易改写为付费归因，局部模型看见增长，系统却没有获得等量增量。
- **实现与决策**：建立统一的 eligibility、曝光、创意、订单和成本账本，在用户—商品—时间窗内去重路径；把优化目标改为扣除广告成本、佣金、补贴和成熟退款后的增量贡献。预算与流量决策采用商家、活动或其他能控制共享资源干扰的实验单元，并为库存、频次和渠道蚕食设置护栏。
- **应监控指标**：Total Mature Net Value per Eligible User、Total Mature Net Value per Pre-treatment Eligible Product、Incremental Contribution、Spend、Commission、Incremental Return on Spend、Deduplicated Reach、Frequency、Channel Mix、Cannibalization、库存消耗与退款。主指标分母必须与随机化单位对齐，用户与商品口径不能合并成一个 Estimand。
- **失败边界**：渠道归因只能描述路径，不能证明因果增量；只分析实际曝光或成交用户会破坏随机化。共享预算、竞价环境和库存造成明显干扰时，独立用户实验也可能失真，应使用聚类、时段切换或长期 holdout，并以全渠道总结果决定是否继续放量。
