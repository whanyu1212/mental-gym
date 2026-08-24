# 电商推荐业务背景｜E-commerce Recommendation Context

<a name="top"></a>

电商推荐连接买家、商品、内容、直播间、创作者、商家、营销与履约系统。一次模型变更不仅会改变点击，还会改变用户注意力、交易效率、内容供给、订单质量、库存消耗和流量分配。因此，分析对象应从单点模型分数扩展到完整的用户旅程与多边生态。

## 目录

- [1. 推荐系统解决什么问题](#sec-1)
- [2. 业务对象与反馈回路](#sec-2)
- [3. 主要推荐场景与决策面（非穷举）](#sec-3)
- [4. 统一事件主干](#sec-4)
- [5. 短视频商品内容流](#sec-5)
  - [5.1 漏斗](#sec-5-1)
  - [5.2 关键诊断](#sec-5-2)
- [6. 直播内容流](#sec-6)
  - [6.1 漏斗](#sec-6-1)
  - [6.2 实时供给状态](#sec-6-2)
  - [6.3 供给与体验指标](#sec-6-3)
- [7. 商城商品卡推荐](#sec-7)
  - [7.1 漏斗](#sec-7-1)
  - [7.2 关键诊断](#sec-7-2)
- [8. Gross GMV、Net GMV 与订单成熟](#sec-8)
- [9. 跨入口归因](#sec-9)
- [10. 指标树与价值平衡](#sec-10)
- [11. 分群与分布分析](#sec-11)
- [12. 标准分析输出](#sec-12)
- [13. 扩展电商推荐场景：从消费分发到供给匹配](#sec-13)
  - [13.1 搜索与类目浏览](#sec-13-1)
  - [13.2 商品详情页、店铺页与个人橱窗](#sec-13-2)
  - [13.3 创作者—商品与商家—创作者匹配](#sec-13-3)
  - [13.4 自然流量、联盟流量与付费流量协同](#sec-13-4)
  - [13.5 统一分析框架](#sec-13-5)
- [14. 工业案例：先定义问题，再解释指标](#sec-14)
  - [14.1 短视频商品内容：观看增长但交易下降](#sec-14-1)
  - [14.2 直播内容：进房增加但有效消费没有增加](#sec-14-2)
  - [14.3 商城商品卡：点击下降但购物效率提高](#sec-14-3)
  - [14.4 搜索：点击增加但需求满足变差](#sec-14-4)
  - [14.5 创作者选品：接受机会却没有形成内容](#sec-14-5)
  - [14.6 跨渠道协同：归因增长不等于总增量](#sec-14-6)
- [15. 关联文档](#sec-15)

---

<a name="sec-1"></a>

## 1. 推荐系统解决什么问题

推荐策略需要把业务问题转化为可验证的决策链路：

```text
业务现象
→ 机制假设
→ 影响入口与人群
→ 候选、排序和展示变化
→ 用户行为与交易漏斗变化
→ 订单质量与长期影响
→ 上线、迭代或回滚
```

一个可执行的问题定义至少说明：

- **对象**：买家、商品、内容、直播间、商家或市场；
- **场景**：内容或直播分发、商城与搜索、详情页与橱窗、供给匹配或跨渠道分配；
- **机制**：召回覆盖、排序精度、兴趣建模、探索、多样性还是系统性能；
- **目标**：提升发现效率、有效消费、高质量交易或长期价值；
- **风险**：用户体验、取消退款、延迟、库存、供给集中或安全合规；
- **证据**：离线评估、在线实验、护栏、分群与成熟后的交易结果。

<a name="sec-2"></a>

## 2. 业务对象与反馈回路

| 对象 | 推荐系统观察什么 | 常见决策风险 |
|---|---|---|
| Buyer | 当前意图、价格偏好、消费深度、购买与复购 | 点击诱导、重复内容、低质量成交、过度曝光 |
| Product / SKU | 可售状态、库存、价格、类目、履约与历史表现 | 缺货商品曝光、价格失效、热门偏置、新品无机会 |
| Content | 商品表达质量、观看行为、内容与商品一致性 | 高互动但低购买意图、内容同质化 |
| Live Room | 是否在线、内容质量、主播状态、挂载商品与实时库存 | 房间下线、商品切换、库存耗尽、延迟特征失效 |
| Creator | 人群匹配、内容专长、历史合作、选品意愿与履约能力 | 只追逐佣金或历史成交、创作者集中、低质量内容供给 |
| Seller | 有效供给、成交质量、履约、售后与持续经营 | 流量过度集中、劣质商家放大、新商家冷启动失败 |
| Campaign / Traffic | 自然、联盟与付费流量的预算、成本、素材和增量 | 渠道蚕食、重复归因、补贴与佣金掩盖真实利润 |
| Market | 语言、类目供给、物流、价格带、活动与季节性 | 跨市场口径误用、供需密度差异被平均值掩盖 |
| Platform | 请求成功率、延迟、稳定性、安全与长期生态 | 模型收益以系统或生态退化为代价 |

这些对象构成反馈回路：

```text
推荐曝光
→ 用户行为与订单
→ 商品、内容和商家获得新数据
→ 后续模型训练与流量分配改变
→ 新一轮曝光
```

因此，历史日志不是自然生成的无偏样本。它已经受到旧策略、位置、入口、库存和展示机制影响。

<a name="sec-3"></a>

## 3. 主要推荐场景与决策面（非穷举）

表中既包括内容、直播与商城等常见买家入口，也覆盖显式需求、详情页决策、主体橱窗、内容供给匹配和跨渠道流量分配。它们最终都可能连接支付与售后，但决策主体、推荐单元、有效反馈和时延要求不同。

| 场景 | 决策主体或状态 | 推荐单元 | 强信号 | 主要约束 |
|---|---|---|---|---|
| 短视频商品内容流 | 发现式浏览，意图可能较弱 | 内容及其挂载商品 | 有效观看、商品点击、加购、支付 | 注意力竞争、内容与商品一致性、序列疲劳 |
| 直播内容流 | 实时发现与互动，意图动态变化 | 在线直播间及当前商品 | 进房、有效观看、商品点击、支付 | 房间在线状态、实时库存、主播和商品切换 |
| 商城商品卡 | 浏览或购买意图通常更明确 | 商品卡或商品集合 | 商品点击、加购、支付、复购 | 可售性、价格与库存准确性、类目和筛选上下文 |
| 搜索与类目浏览 | 用户表达 Query、类目、筛选或品牌约束 | Query–Product 或 Category–Product | 结果点击、Query 改写、PDP、支付 | 相关性优先、零结果、拼写与属性约束、个性化不能覆盖 Query |
| 商品详情页内容推荐 | 用户正在评估一个明确商品 | 与当前商品准确绑定的创作者内容 | 内容有效消费、加购、支付、退款 | 内容—商品精确绑定、新鲜度、不能把内容点击当成全部成交贡献 |
| 商品详情页关联商品 | 用户正在比较、替代或搭配当前商品 | Substitute、Complement、SKU/SPU/Offer | PDP、比较、Attach、购物篮与支付 | 替代和互补关系不能混合、同款去重、库存与履约 |
| 店铺页或个人橱窗 | 用户已表达对商家或创作者的上下文兴趣 | 主体可陈列的商品集合 | 商品访问、支付买家率、成熟净交易 | 候选集由主体控制、人工置顶/隐藏、商品新鲜度与集中度 |
| 创作者选品市场 | 创作者寻找适合制作内容的商品 | Creator–Product、样品或 Campaign Opportunity | 加入橱窗、申请样品、内容发布、成熟销售 | 创作者产能、内容适配、佣金、库存和长反馈链路 |
| 商家—创作者匹配 | 商家寻找适合商品和目标人群的创作者 | Seller–Creator 或 Creator–Product Pair | 接受合作、内容发布、成熟销售、重复合作 | 双边选择、预算与样品、合作容量、跨单元干扰 |
| 自然、联盟与付费流量协同 | 流量系统在渠道、素材和预算间分配机会 | User–Product–Creative–Channel | 总增量净交易、佣金后贡献、长期价值 | 重复归因、自然流量蚕食、预算/竞价、库存共享 |

不能直接用同一 CTR 比较这些场景。短视频点击可能是内容消费，直播点击可能是进房，商城点击通常是商品详情访问，创作者选品的关键动作可能是加入橱窗或发布内容，而跨渠道协同关心的是扣除广告、佣金和补贴后的总增量。只有明确决策主体、事件和分母后才具有可比性。

**一个跨入口用户例子。** 用户先在短视频里看见一款咖啡机，晚上进入直播间了解使用方法，第二天从商城商品卡完成购买。多个入口都参与了路径，但不能各记一笔完整 GMV；描述路径时需要互斥触点归因，评估策略增量时则应回到随机化用户的 ITT 结果。

**一个供给到消费的例子。** 商家先把咖啡机加入合作计划，创作者在选品市场发现并接受商品，随后制作短视频；用户看到内容后从商品详情页比较其他型号并完成购买。这里包含商家—创作者匹配、创作者选品、内容生产、买家分发和交易五个决策阶段，不能只用最后一笔订单反推每个上游模型都有效。

<a name="sec-4"></a>

## 4. 统一事件主干

建议先建立跨入口统一的事件主干，再保留入口特有事件：

```text
Eligible request
→ Served result
→ Rendered result
→ Viewable impression
→ Surface-specific engagement
→ Product detail view
→ Add to cart
→ Checkout
→ Order created
→ Payment
→ Fulfillment / Delivery
→ Cancellation / Return / Refund
→ Mature net transaction
→ Repeat purchase / Retention
```

几个事件不能混用：

- **Served**：服务端返回，不代表用户看到；
- **Rendered**：客户端成功渲染，不一定进入可视区域；
- **Viewable Impression**：达到可见面积和停留门槛；
- **Product Detail View**：进入商品详情，不等同于内容点击或进房；
- **Order Created**：创建订单，不代表支付；
- **Paid Order**：完成支付，但仍可能取消或退款；
- **Mature Net Transaction**：经过固定成熟窗口后保留的净交易结果。

<a name="sec-5"></a>

## 5. 短视频商品内容流

<a name="sec-5-1"></a>

### 5.1 漏斗

```text
视频卡可见曝光
→ 播放开始
→ 有效观看
→ 深度观看 / 完播 / 互动
→ 商品入口曝光
→ 商品点击
→ 商品详情页
→ 加购
→ 下单与支付
→ 成熟净交易
```

<a name="sec-5-2"></a>

### 5.2 关键诊断

| 环节 | 常见指标 | 解释重点 |
|---|---|---|
| 曝光 → 消费 | 播放率、有效观看率、跳过率 | 内容是否值得开始消费 |
| 消费深度 | 观看时长、完成率、分位数 | 原始时长需结合视频长度解释 |
| 内容 → 商品 | 商品入口曝光率、商品 CTR | 内容兴趣是否转化为商品意图 |
| 商品 → 交易 | PDP-to-ATC、Click-to-Pay CVR | 商品质量、价格和落地页是否匹配 |
| 交易质量 | 取消率、退款率、Net-to-Gross | 成交是否真实且可持续 |

高观看时长不一定带来高质量交易；商品点击上升也可能来自更突出的入口，而不是更准确的商品匹配。因此需要同时查看内容消费、商品漏斗和订单质量。

**如何解读组合变化。** 假设新排序让平均观看时长上升 8%，商品 CTR 却下降 6%。这不一定是失败：模型可能找到了更适合观看、但购买意图较弱的内容。下一步应查看 Product Clicks per Eligible User、Paid Buyers per Eligible User 和 Mature Net GMV，而不是仅凭两个条件率做结论。

<a name="sec-6"></a>

## 6. 直播内容流

<a name="sec-6-1"></a>

### 6.1 漏斗

```text
直播间卡片可见曝光
→ 进房
→ 有效观看
→ 商品组件曝光
→ 商品点击
→ 加购
→ 下单与支付
→ 履约与成熟净交易
```

<a name="sec-6-2"></a>

### 6.2 实时供给状态

直播推荐的候选空间持续变化。常见可用性条件包括：

- 直播间仍在线且允许分发；
- 主播状态、内容质量和安全状态有效；
- 当前挂载商品可售；
- SKU 有库存，价格与优惠仍有效；
- 市场、物流和配送范围匹配；
- 实时特征时间戳未过期。

<a name="sec-6-3"></a>

### 6.3 供给与体验指标

| 类型 | 常见指标 |
|---|---|
| 在线供给 | Eligible Live Rooms、Live Sellers、Live Products、可售 SKU 数 |
| 覆盖 | 获得曝光的直播间或商家占比、Room-Product Coverage |
| 新鲜度 | 房间状态、当前商品、价格和库存特征的延迟 |
| 观看 | 进房率、有效进房率、观看时长、快速退出率 |
| 交易 | 商品 CTR、ATC Rate、Paid CVR、Gross / Net GMV per Viewer |
| 风险 | 下线房间曝光率、缺货曝光率、取消退款、P95 / P99 Latency |

进房率高但快速退出率同时上升，通常不是稳定收益；Gross GMV 上升但缺货、取消或退款恶化，也不应直接视为成功。

**为什么直播需要实时特征。** 某直播间在 20:00 仍有 500 件库存，20:10 已售罄；如果库存特征延迟 15 分钟，离线模型分数再准确，也会继续把用户送入无法购买的房间。此时应先检查 Feature Freshness、缺货曝光率和房间状态，而不是立即归因于排序模型退化。

<a name="sec-7"></a>

## 7. 商城商品卡推荐

<a name="sec-7-1"></a>

### 7.1 漏斗

```text
商品卡可见曝光
→ 商品点击
→ 商品详情页
→ 加购
→ 结算
→ 下单与支付
→ 履约与成熟净交易
→ 复购
```

<a name="sec-7-2"></a>

### 7.2 关键诊断

商城场景更接近显式购物任务，应重点观察：

- 商品卡 CTR 与 Product Detail View Rate；
- ATC per PDP、Checkout per ATC、Pay per Checkout；
- Buyer Conversion、Orders per Buyer、AOV 与 Items per Order；
- Gross GMV、Mature Net GMV 与 Contribution Margin；
- 可售率、缺货曝光率、价格失效率和配送可达率；
- 类目、价格带、品牌、商家和新品覆盖；
- 搜索、筛选、活动页和推荐模块之间的上下文差异；搜索的独立问题定义见 [13.1 搜索与类目浏览](#sec-13-1)。

**商城中常见的误判。** 商品卡 CTR 从 12% 降到 11%，但 Buyer Conversion、Mature Net GMV per Eligible User 和退款护栏都改善，可能说明模型减少了低意图点击并把流量集中到更可购买的商品。CTR 是漏斗诊断，不应自动覆盖更接近最终价值的用户级结果。

<a name="sec-8"></a>

## 8. Gross GMV、Net GMV 与订单成熟

交易金额应按订单状态分别命名，避免一个 `GMV` 同时表示多种结果：

```text
Created GMV    = 已创建订单金额
Paid Gross GMV = 已支付订单金额
Fulfilled GMV  = 已履约订单金额
Mature Net GMV = 固定成熟窗口后，扣除取消、全额和部分退款的保留金额
```

如果 Gross GMV 从“已支付订单”开始计算，支付前取消的订单本来就不在分子中，不能再次扣除。部分退款应按退款金额而不是退款订单数扣减。

交易指标需要同时定义两个时间概念：

- **Attribution Window**：一次推荐触点在多长时间内可以获得订单归因；
- **Maturity Window**：订单经过多长时间后，取消、退货和退款基本回流完整。

比较实验组时，应使用相同曝光 Cohort、相同归因规则和相同成熟年龄。尚未成熟的订单可作为早期方向信号，但不能与成熟 Net GMV 直接比较。

<a name="sec-9"></a>

## 9. 跨入口归因

一个用户可能先看短视频、进入直播间，之后从商城购买。同一订单如果被多个入口分别认领，会造成重复计算。

推荐分析至少区分三种口径：

| 口径 | 用途 | 局限 |
|---|---|---|
| Last-touch / First-touch Attribution | 描述订单路径与入口贡献 | 依赖人为规则，不等于因果效果 |
| Multi-touch Attribution | 描述多个触点的辅助作用 | 权重选择敏感，容易重复解释 |
| Randomized Intent-to-Treat | 评估策略是否造成增量 | 需要可信实验，不要求订单能唯一归因到某次点击 |

工程上建议保留 `request_id`、`impression_id`、`content_id`、`room_id`、`product_id`、`seller_id`、`order_id`、入口和时间戳，建立可审计的触点链路。

在线实验中，不应只分析“点击过商品”或“产生归因订单”的用户。这些变量可能已被 Treatment 改变，条件化会破坏随机化。主分析应以随机化时确定的 Eligible Population 做 ITT；只有 Trigger 在 Treatment 生效前确定，或能够证明不受 Treatment 影响时，才能使用 Triggered Population。归因路径用于诊断机制。

<a name="sec-10"></a>

## 10. 指标树与价值平衡

不同入口可以共享交易尾部，但拥有不同的前置乘子。以下仅表示采用互斥触点归因后的描述性指标树；各指标树必须使用同一订单 Cohort、订单年龄、币种和去重规则，不能替代全局去重的实验 ITT 指标：

```text
Short-video-attributed Mature Net GMV per Eligible User
= Video Impressions per User
  × Product Clicks per Video Impression
  × Paid Orders per Product Click
  × Mature Net GMV per Paid Order
```

```text
Live-attributed Mature Net GMV per Eligible User
= Live-card Impressions per User
  × Valid Room Entries per Impression
  × Product Clicks per Valid Room Entry
  × Paid Orders per Product Click
  × Mature Net GMV per Paid Order
```

```text
Mall-attributed Mature Net GMV per Eligible User
= Product-card Impressions per User
  × Product Clicks per Impression
  × Paid Orders per Product Click
  × Mature Net GMV per Paid Order
```

只有当各分子、分母和去重规则完全对齐时，这些分解才是恒等式。指标树的作用是定位变化来自流量、兴趣、转化、客单价还是售后，而不是假设每个因子相互独立。

推荐策略通常需要同时平衡：

1. **买家价值**：相关性、发现感、信任、购物效率、复购与留存；
2. **交易价值**：高质量支付、Mature Net GMV、Revenue 与 Margin；
3. **供给价值**：有效商品和商家覆盖、新品探索、库存效率与流量集中度；
4. **系统价值**：延迟、稳定性、数据质量、安全与可扩展性。

<a name="sec-11"></a>

## 11. 分群与分布分析

整体均值可能掩盖重要风险。常见预设切片包括：

- 买家：新老、活跃度、购买历史、价格偏好、兴趣宽度；
- 场景：内容、直播、商城、搜索与类目、详情页与橱窗、供给匹配、跨渠道及具体推荐位置；
- 决策主体：买家、Query、页面访问、创作者、商家、合作关系或活动；
- 供给：类目、价格带、新老商品、库存深度、创作者与商家规模、内容和履约质量；
- 环境：市场、语言、设备、网络、版本、日期和活动期；
- 交易：金额分位数、订单状态、归因延迟和成熟年龄。

除均值外，还应查看零值占比、P50 / P90 / P99、Top Share、Gini、覆盖率和长尾变化。分群应由机制或风险假设驱动并尽量预先确定，避免在大量切片中寻找偶然显著结果。

<a name="sec-12"></a>

## 12. 标准分析输出

一份可执行的推荐分析通常包括：

- Problem Statement、入口、目标人群和机制图；
- Metric Contract、归因窗口、成熟窗口和数据可用时间；
- 离线指标与候选、粗排、精排、重排的阶段诊断；
- 实验有效性、Effect Size、Confidence Interval 与 MDE；
- Overall、Funnel、Segment、Distribution 和 Cross-surface 分析；
- 用户体验、订单质量、供给生态、系统和安全护栏；
- Rollout、Iterate、No-Go 或 Rollback 建议及后续验证。

---

<a name="sec-13"></a>

## 13. 扩展电商推荐场景：从消费分发到供给匹配

短视频、直播和商城商品卡是常见的买家分发入口，但并不覆盖完整电商生态。平台还需要帮助用户表达明确需求、帮助创作者发现可推广商品、帮助商家找到合适创作者，并协调自然、联盟和付费流量。以下数字均为帮助理解方法的示例。

| 扩展场景 | 主要决策单元 | 核心目标 | 最容易被忽略的问题 |
|---|---|---|---|
| 搜索与类目浏览 | Query–Product、User–Query–Product | 满足明确需求并降低搜索成本 | 个性化不能覆盖 Query 意图；筛选条件是硬约束 |
| 商品详情页内容与关联商品 | Product–Content、Product–Product | 提升理解、比较、搭配与购买效率 | 替代品、互补品和内容证据是不同任务 |
| 店铺页或个人橱窗 | Visitor–Storefront–Product | 在有限陈列位中组织一个主体的商品集合 | 上游到访已受推荐影响，页面内指标不是全局因果效果 |
| 创作者—商品匹配 | Creator–Product | 促成高质量、可持续的内容供给 | “被创作者选择”与“最终卖得好”之间有长且稀疏的漏斗 |
| 商家—创作者匹配 | Seller–Creator–Campaign | 形成适合商品、人群和内容风格的合作 | 佣金、样品、库存和合作容量会改变双方选择 |
| 跨渠道流量协同 | User–Product–Creative–Channel | 优化总增量价值与总成本 | 归因 GMV 可能只是自然流量被付费渠道重新标记 |

<a name="sec-13-1"></a>

### 13.1 搜索与类目浏览

搜索是 Query-driven Retrieval，不应被当成“另一块个性化商品卡”。Query、筛选条件和类目上下文首先定义当前任务，长期兴趣只用于消歧、排序和补充发现。

**案例（示例）。** 用户搜索“手机无线麦克风”，热门度模型返回大量专业相机麦克风，CTR 尚可，但 Query Reformulation Rate 从 18% 上升到 27%，兼容型号商品的支付率下降。问题不在于用户不喜欢数码商品，而在于模型让长期数码兴趣压过了“手机兼容”这一即时约束。

- **候选与排序**：关键词、语义向量、类目、品牌和属性召回并行；型号兼容、地域可售、价格与库存先做硬过滤，再使用个性化和交易质量排序。
- **诊断**：按 Head/Tail Query、是否改写、筛选器、拼写纠错、零结果和属性约束切片；区分未召回、错误过滤、排序靠后和商品不可售。
- **指标**：Zero-result Rate、Query Reformulation、Search Exit、Relevant Product Recall、NDCG、PDP Rate、支付买家率、成熟净价值、缺货曝光和 P95/P99 Latency。
- **边界**：搜索结果曝光由旧排序策略选择，点击日志不是全空间相关性标签；活动词、品牌词和型号词也不能使用同一套相关性阈值。

类目浏览和个性化模块没有显式 Query，但仍有强页面上下文。类目、筛选器、活动资格和配送地区共同定义候选集，用户长期兴趣只在该集合内排序。应额外观察 Category-session Conversion、筛选后 Zero-result、商品/商家覆盖、新品覆盖、集中度和补贴后利润；如果策略会影响用户是否进入某个类目，类目访问者仍只能作为机制切片，不能替代用户级主分析。

<a name="sec-13-2"></a>

### 13.2 商品详情页、店铺页与个人橱窗

商品详情页可以推荐解释该商品的内容、同类替代品和搭配互补品；店铺页或个人橱窗则需要在一个主体拥有的商品集合中排序。它们与商城首页的全库发现任务不同，因为用户已经表达了商品、商家或创作者上下文。

**案例（示例）。** 用户进入相机详情页后，页面加入高互动创作者视频，使内容播放率提升 22%，但视频主要介绍另一型号，当前商品加购率下降 5%。与此同时，“你可能还喜欢”区域把同一 SPU 的多个 Offer 重复展示，挤压了存储卡和三脚架等互补商品。

- **候选身份**：内容推荐要验证内容是否确实绑定当前商品；商品推荐必须区分 SKU、SPU 和 Seller Offer，并显式标记 Substitute 或 Complement 关系。
- **排序目标**：内容理解、当前商品转化、替代比较和搭配购买分别建模；不能用统一 CTR 把用户从当前商品带走也视为成功。
- **页面级约束**：去重、库存、履约、价格一致性、手工置顶和主体自主编辑都可能改变最终列表，需要记录 Recommendation 与 Manual Action。
- **指标**：Content-assisted PDP Conversion、ATC、Substitute/Complement Coverage、SPU Duplicate Rate、成熟净订单价值、退款、Page Exit 和页面延迟；Attach Rate 只作订单条件机制诊断，并按订单去重，不能替代 Eligible User / Page 的端到端结果。
- **因果边界**：只有先进入该详情页或橱窗的用户才有机会被影响；页面内 CVR 是条件指标，评价全局增量时仍需使用预先定义人群的 ITT 结果。

<a name="sec-13-3"></a>

### 13.3 创作者—商品与商家—创作者匹配

这是一类供给侧推荐：模型不是直接决定买家看什么，而是先影响哪些商品被创作者发现、选择并制作成内容。完整结果链路比买家侧点击更长：

```text
商品被创作者看到
→ 加入选品集合 / 申请样品 / 接受合作
→ 产出合格内容
→ 内容获得有效分发
→ 商品访问、支付与成熟净交易
```

**案例（示例）。** 一个高佣金厨房商品被大量推荐给美妆创作者，Creator Add Rate 提升 16%，但 14 天内 Content Publish Rate 下降 9%，发布内容的商品点击率也下降。模型优化了“容易被加入”，却没有优化创作者是否擅长解释该商品、是否真的愿意制作内容，以及商品库存能否支持后续分发。

- **匹配信号**：创作者内容类目、人群构成、历史内容质量、商品适配、样品需求、佣金、库存、履约和商家合作容量。
- **多阶段目标**：Discovery、Add/Accept、Sample、Publish、Qualified Content、Mature Sales 分开预测；可用 Multi-task 或 Hurdle Model 处理大量零结果和阶段选择。
- **双边约束**：创作者有选品容量，商家有样品、预算和库存约束；只按预估 GMV 排序容易把所有机会集中给少数头部组合。
- **指标**：Creator/Product Coverage、Match Acceptance、T-day Cumulative Publish Rate、截至 T 日的 Restricted Mean Waiting Time（未发布者贡献 `T`）、Qualified-content Rate、库存消耗、佣金后贡献和 Top Share/Gini。成熟价值使用 Treatment 前固定的 Eligible Match Unit 与互斥订单 Credit；无法排他认领时改用 Randomized Eligible Creator / Seller 分母。
- **实验边界**：同一商品会被多个创作者竞争，同一创作者也会在多个商品间分配内容产能，同一买家还可能接触不同实验组创作者的内容，存在双边干扰与订单多重认领；随机化边界需要覆盖实际共享资源和买家混流，必要时采用 Saturation、Two-sided 或受控市场实验。

<a name="sec-13-4"></a>

### 13.4 自然流量、联盟流量与付费流量协同

同一商品和内容可能同时进入自然推荐、创作者联盟和付费投放。渠道各自报告的归因成交不能直接相加，因为付费或联盟策略可能抢走本来会自然发生的曝光与订单。

**案例（示例）。** 一个原本自然表现很强的商品开启自动投放后，广告归因 GMV 增长 40%，但全平台成熟净交易只增长 6%，自然归因 GMV 同时下降 24%。如果只看广告 ROAS，会把渠道重新标记误认为同等规模的增量。

- **统一价值口径**：从总增量 Mature Net Value 中扣除广告成本、佣金、优惠和其他可变成本；同时观察自然流量被替代的程度。
- **统一决策对象**：绑定 User、Product、Creative、Seller、Channel 和 Campaign Version，避免同一订单被多个触点重复记账。
- **策略交互**：自然排序、创作者佣金和付费预算可能相互增强或抵消；联合上线时可使用 Factorial、长期 Holdout 或适合市场干扰的 Cluster/Switchback 设计。
- **指标**：Incremental Mature Net Value、Contribution after Variable Cost、Organic Displacement、Paid/Organic/Affiliate Mix、Creative Coverage、Seller Concentration、Budget Utilization 和长期复购。
- **边界**：Last-touch Attribution 只能描述归因，不能证明增量；实验还要处理竞价、共享预算、库存耗尽和商家反馈造成的干扰。

<a name="sec-13-5"></a>

### 13.5 统一分析框架

扩展场景可以使用同一套问题模板，但不能共享一个未经定义的 CTR：

| 问题 | 必须回答的内容 |
|---|---|
| 谁在做决策 | 买家、创作者、商家、代理或流量系统 |
| 推荐什么 | 商品、内容、创作者、合作机会、渠道或预算 |
| Eligibility 是什么 | 可售商品、可合作双方、可用库存、有效素材和合规渠道 |
| 最近反馈是什么 | 点击、加入橱窗、接受合作、内容发布、支付还是成熟净交易 |
| 谁与谁竞争 | 商品抢曝光、创作者抢商品、渠道抢订单、Campaign 抢预算 |
| 主要延迟是什么 | 内容生产、支付、履约、退款、佣金结算或长期复购 |
| 需要什么实验单位 | User、Creator、Seller、Campaign、Market 或 Time Block |

统一事件模型也要从单一买家交易链扩展为可连接的买家、供给与协同链路：

```text
买家链：Eligible request → Impression → PDP → Pay → Mature net transaction

供给链：Eligible creator-product pair → Discovery → Add / Accept
       → Publish → Buyer exposure → Mature net transaction

协同链：Eligible product / campaign → Channel allocation
       → Deduplicated exposure → Mature net transaction
       → Advertising / commission / subsidy cost → Contribution
```

为了连接这些链路，日志除 User、Item 和 Order 外，还需要 point-in-time 的 `query_id`、`category_id`、`creator_id`、`creator_product_edge_id`、`seller_id`、`campaign_id`、`creative_id`、`traffic_source`、`ordering_mode`、Eligibility Snapshot，以及广告、佣金和补贴成本。字段必须记录决策发生时的版本，不能用内容发布后、订单完成后或活动结束后的最终状态回填。

推荐问题从买家侧扩展到供给侧后，核心变化是：模型不仅预测需求，还会改变未来可被推荐的内容和商品供给。因此，分析必须把内容生产、合作接受、库存和渠道成本纳入反馈回路。

---

<a name="sec-14"></a>

## 14. 工业案例：先定义问题，再解释指标

以下数字只用于演示分析方法，不代表任何实际业务数据。这些案例的共同点是：观察到一个指标变化后，先确认推荐对象、可用供给、事件分母和交易成熟度，再讨论模型是否有效。

<a name="sec-14-1"></a>

### 14.1 短视频商品内容：观看增长但交易下降

- **发生什么**：新策略使人均观看时长提升 8%，但商品入口可见曝光下降 6%，Product Clicks per Eligible User 下降 4%，成熟净交易价值下降 3%。
- **业务与分析问题**：排序对象是视频，观看反馈描述内容兴趣，不等于对绑定商品的购买兴趣。策略可能提高了叙事性内容的占比，却让商品入口出现得更晚，或者增加了内容与绑定商品不一致的视频。
- **正确做法**：把链路拆成视频可见曝光、有效观看、商品入口可见曝光、商品点击、详情访问、支付和成熟净交易；同时按视频—商品绑定有效性、类目和新老用户切片。只有确认下降发生在排序相关环节后，才进一步检查内容任务与交易任务的融合权重。
- **应监控指标**：Qualified View、Watch Time、商品入口可见率、Product Clicks per Eligible User、支付买家率、Mature Net Value per Eligible User、Fast Skip、负反馈和绑定失效率。

<a name="sec-14-2"></a>

### 14.2 直播内容：进房增加但有效消费没有增加

- **发生什么**：直播卡片进房率提升 10%，Quick Exit Rate 同时提升 14%，商品组件可见率下降 7%，成熟支付买家率没有变化。
- **业务与分析问题**：卡片封面或历史热度可能提高了进房吸引力，但用户进入后发现当前讲解商品已经切换、库存不足或房间内容与卡片预期不一致。只看进房率会把“吸引点击”误当成“匹配成功”。
- **正确做法**：以当前 room session 为分析对象，连接打分时和曝光时的在线状态、当前商品、库存快照与特征更新时间；再分解进房后的有效观看、商品组件曝光、商品点击和支付。
- **应监控指标**：Qualified Entry、Quick Exit、直播有效观看时长、Product-panel View Rate、商品点击率、Valid-at-exposure Rate、Feature Freshness、缺货曝光率和成熟净交易价值。

<a name="sec-14-3"></a>

### 14.3 商城商品卡：点击下降但购物效率提高

- **发生什么**：商品卡 CTR 从 12.0% 降到 11.3%，但点击后的支付转化率提升 13%，平均成熟净订单价值提升 6%，退款率下降 1.2 个百分点。
- **业务与分析问题**：策略可能减少了低价诱导、标题吸引但履约较差的商品。CTR 下降描述漏斗前段变化，不能单独证明用户体验或商业价值变差。
- **正确做法**：检查商品卡可见曝光是否稳定，并把点击、详情访问、加购、支付、取消和退款放在同一指标树中；使用随机化用户口径评价总增量，再用类目、价格带、库存和商家质量解释机制。
- **应监控指标**：Product-card CTR、PDP Rate、ATC Rate、Buyer Conversion、Mature Net Value per Eligible User、取消率、退款率、可售商品覆盖和 P95/P99 延迟。

<a name="sec-14-4"></a>

### 14.4 搜索：点击增加但需求满足变差

- **发生什么**：新排序使结果 CTR 相对提升 8%，但 Query Reformulation 从 16% 上升到 23%，带有型号筛选的请求出现更多约束违规曝光，成熟支付买家率没有改善。
- **业务与分析问题**：热门商品或吸引人的标题可以提升点击，却不一定满足当前 Query。若把点击作为唯一标签，旧策略的位置偏置和曝光偏置还会继续强化头部商品。
- **正确做法**：先验证 Query、筛选、类目和地域可售约束，再按 Head/Tail Query、属性约束与是否改写拆解召回、排序和交易漏斗；用用户级 ITT 判断总增量，用 Query 级指标定位机制。
- **应监控指标**：Zero-result、Constraint Violation、Relevant Recall、NDCG、Product Clicks per Query、Reformulation、Search Exit、Paid Buyers per Eligible Searcher 和成熟净价值。

<a name="sec-14-5"></a>

### 14.5 创作者选品：接受机会却没有形成内容

- **发生什么**：推荐机会接受率提升 18%，但 14 天内发布合格内容的创作者占比没有增长，首次发布时间延后，合作机会更加集中于少量高佣金商品。
- **业务与分析问题**：接受合作是低成本的早期动作，内容生产还受到样品、创作者产能、商品适配和库存影响。只分析已经接受的人会对 Treatment 产生后处理条件化。
- **正确做法**：从随机化 Eligible Creator 或预先确定的 Match Unit 开始保留完整漏斗，连接机会、样品、发布、买家曝光、支付和成熟售后；用 T-day 累计发布率与 Restricted Mean Waiting Time 保留观察期内未发布者，并同时检查供给容量与集中度。
- **应监控指标**：Opportunity Coverage、Acceptance、Sample Fulfillment、T-day Cumulative Publisher Rate、Restricted Mean Waiting Time through T、Buyer Reach、Mature Value per Eligible Creator、Concentration 和退款质量。

<a name="sec-14-6"></a>

### 14.6 跨渠道协同：归因增长不等于总增量

- **发生什么**：付费渠道报表中的归因交易提升 21%，但全渠道去重买家数不变，自然流量交易下降，广告与补贴成本增加。
- **业务与分析问题**：最后触点归因可能只是把原本会自然发生的订单重新标记；同一用户或订单在不同渠道报表中还可能重复出现。
- **正确做法**：在用户、商家或活动级保留 Holdout，统一曝光、订单、币种、成本与成熟窗口；比较全渠道去重成熟交易和扣除广告、佣金、补贴后的增量贡献。
- **应监控指标**：Deduplicated Reach、All-channel Buyers、Mature Net Value、Organic Displacement、Duplicate Attribution、Incremental Contribution、Incremental Return on Spend 和频次护栏。

---

<a name="sec-15"></a>

## 15. 关联文档

[系统链路](./recommendation-system-pipeline.md)、[指标体系](./metrics.md)、[在线实验流程](./online-experiment-lifecycle.md)。
