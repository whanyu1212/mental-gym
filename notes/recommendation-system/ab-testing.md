# A/B 测试｜A/B Testing

<a name="top"></a>

## 目录

- [1. 实验定义与目标｜Definition and Goal](#sec-1)
- [2. 核心术语｜Core Terminology](#sec-2)
- [3. 实验单位｜Experiment Unit](#sec-3)
  - [3.1 常见实验单位](#sec-3-1)
  - [3.2 如何选择实验单位](#sec-3-2)
- [4. 随机分流与哈希分桶｜Randomization and Hash Bucketing](#sec-4)
  - [4.1 为什么不能直接使用随机数](#sec-4-1)
  - [4.2 哈希分桶的核心性质](#sec-4-2)
  - [4.3 Bucket 与实验组的关系](#sec-4-3)
  - [4.4 为什么需要 Salt](#sec-4-4)
  - [4.5 常见哈希函数](#sec-4-5)
- [5. 哈希分桶代码实现｜Hash Bucketing Implementation](#sec-5)
  - [5.1 使用 SHA-256 的可复现实现](#sec-5-1)
  - [5.2 根据 Bucket 分配实验组](#sec-5-2)
  - [5.3 放量时如何保持用户稳定](#sec-5-3)
- [6. 实验层与正交设计｜Experiment Layers and Orthogonality](#sec-6)
  - [6.1 同层互斥｜Mutual Exclusion](#sec-6-1)
  - [6.2 跨层正交｜Orthogonality](#sec-6-2)
  - [6.3 正交分流不等于效果可加](#sec-6-3)
  - [6.4 2 × 2 Factorial Design｜二因子实验](#sec-6-4)
  - [6.5 何时互斥，何时正交，何时做 Factorial](#sec-6-5)
- [7. 实验假设与指标设计｜Hypothesis and Metric Design](#sec-7)
  - [7.1 指标角色](#sec-7-1)
  - [7.2 推荐排序实验示例](#sec-7-2)
- [8. 实验有效性检查｜Experiment Validity Checks](#sec-8)
  - [8.1 SRM 常见原因](#sec-8-1)
  - [8.2 SRM 检查代码](#sec-8-2)
  - [8.3 实验前平衡检查｜Pre-experiment Balance Check](#sec-8-3)
  - [8.4 分层随机化｜Stratified Randomization](#sec-8-4)
- [9. 样本量与实验周期｜Sample Size and Duration](#sec-9)
  - [9.1 MDE 的两种表达](#sec-9-1)
  - [9.2 二项指标样本量代码](#sec-9-2)
  - [9.3 实验周期｜Experiment Duration](#sec-9-3)
- [10. 统计推断｜Statistical Inference](#sec-10)
  - [10.1 常见方法](#sec-10-1)
  - [10.2 两比例检验代码](#sec-10-2)
  - [10.3 显著不等于重要](#sec-10-3)
  - [10.4 置信区间｜Confidence Interval](#sec-10-4)
  - [10.5 多重检验｜Multiple Testing](#sec-10-5)
  - [10.6 中途查看与提前停止｜Peeking and Early Stopping](#sec-10-6)
  - [10.7 方差降低｜Variance Reduction](#sec-10-7)
  - [10.8 异质性处理效应｜Heterogeneous Treatment Effects](#sec-10-8)
  - [10.9 Cluster Bootstrap｜聚类自助法](#sec-10-9)
- [11. 用户污染、网络效应与替代实验设计｜Interference and Alternative Designs](#sec-11)
  - [11.1 电商推荐中的干扰来源](#sec-11-1)
  - [11.2 设计选择](#sec-11-2)
  - [11.3 Switchback Experiment](#sec-11-3)
  - [11.4 跨入口归因与延迟转化](#sec-11-4)
- [12. 放量、回滚与长期测量｜Ramp-up, Rollback, and Holdout](#sec-12)
  - [12.1 Ramp-up 与灰度发布｜Gradual Rollout](#sec-12-1)
  - [12.2 回滚｜Rollback](#sec-12-2)
  - [12.3 Holdout 与反转实验｜Holdout and Reverse Experiment](#sec-12-3)
- [13. 实验案例：推荐排序模型｜Case Study: Ranking Model](#sec-13)
  - [13.1 背景](#sec-13-1)
  - [13.2 实验假设](#sec-13-2)
  - [13.3 实验设计](#sec-13-3)
  - [13.4 实验前检查](#sec-13-4)
  - [13.5 假设结果](#sec-13-5)
  - [13.6 结果解释](#sec-13-6)
  - [13.7 放量计划](#sec-13-7)
- [14. 工业案例：三类电商推荐实验](#sec-14)
  - [14.1 短视频商品内容排序实验](#sec-14-1)
  - [14.2 直播内容流与直播间分发实验](#sec-14-2)
  - [14.3 商城商品卡召回或排序实验](#sec-14-3)
  - [14.4 召回 × 精排的 2 × 2 Factorial](#sec-14-4)
- [15. 实验分析代码示例｜Experiment Analysis Example](#sec-15)
- [16. 实验平台与上线检查｜Platform and Launch Checklist](#sec-16)
  - [16.1 实验平台架构｜Experimentation Platform Architecture](#sec-16-1)
  - [16.2 实验上线清单｜Experiment Launch Checklist](#sec-16-2)
- [17. 常见实验陷阱｜Common Experiment Pitfalls](#sec-17)
  - [17.1 使用不稳定随机数](#sec-17-1)
  - [17.2 使用 Python 内置 `hash()`](#sec-17-2)
  - [17.3 分析粒度与随机化粒度不一致](#sec-17-3)
  - [17.4 忽略 SRM](#sec-17-4)
  - [17.5 实验开始后更换主指标](#sec-17-5)
  - [17.6 样本量不足](#sec-17-6)
  - [17.7 只看 p-value](#sec-17-7)
  - [17.8 频繁查看并提前停止](#sec-17-8)
  - [17.9 忽略多重检验](#sec-17-9)
  - [17.10 忽略长期效果](#sec-17-10)
  - [17.11 忽略网络效应](#sec-17-11)
  - [17.12 直接从小流量推到全量](#sec-17-12)
  - [17.13 将未显著理解为完全相同](#sec-17-13)
- [18. 实验分析工作流](#sec-18)
  - [18.1 实验前：把问题定义成可检验假设](#sec-18-1)
  - [18.2 实验运行中：先检查 Validity，再看 Lift](#sec-18-2)
  - [18.3 实验结束：Readout 不应只有 p-value](#sec-18-3)
  - [18.4 分析边界与工程依赖](#sec-18-4)
- [19. 关联文档](#sec-19)

---

<a name="sec-1"></a>

## 1. 实验定义与目标｜Definition and Goal

A/B Testing 将实验单位随机分配到 Control 和 Treatment，只改变待验证的模型、策略或产品功能，并比较预先定义的指标差异。

```text
Control:   Current Production Strategy
Treatment: New Strategy
```

离线指标用于筛选方案，在线实验用于估计真实用户环境中的因果增量。典型情况包括：

```text
Offline NDCG ↑
Online CTR unchanged
Watch Time ↓
Negative Feedback ↑
```

因此，实验结论不能只依赖离线指标或上线前后的时间序列对比。

---

<a name="sec-2"></a>

## 2. 核心术语｜Core Terminology

| 中文术语 | English Term | 定义 |
|---|---|---|
| 对照组 | Control Group | 使用当前线上基准策略的实验组 |
| 实验组 | Treatment Group | 使用待验证新策略的实验组 |
| 实验单位 | Experiment Unit | 被随机分配的基本对象，例如用户、设备、会话或地区 |
| 随机分流 | Randomization | 将实验单位随机分配到不同组的过程 |
| 分桶 | Bucketing | 将流量映射到固定数量的 Bucket |
| 实验层 | Experiment Layer | 管理一类相互排斥实验的逻辑空间 |
| 因子实验 | Factorial Experiment | 同时随机化两个或多个因子，并覆盖其处理组合的实验设计 |
| 主效应 | Main Effect | 对另一个因子的处理状态取平均后，一个因子的平均处理效应 |
| 交互效应 | Interaction Effect | 一个因子的效果是否随另一个因子的处理状态而改变 |
| 实验参数 | Experiment Parameter | 不同实验组采用的配置、模型或策略 |
| 盐值 | Salt | 加入哈希输入的实验标识，用于产生独立随机分配 |
| 基准策略 | Baseline | 当前线上稳定策略 |
| 主要指标 | Primary Metric | 实验主要希望提升的指标 |
| 次要指标 | Secondary Metrics | 用于解释主要指标变化的指标 |
| 护栏指标 | Guardrail Metrics | 不允许因实验而显著恶化的指标 |
| 最小可检测效应 | Minimum Detectable Effect | MDE，实验希望能够检测到的最小真实变化 |
| 实验放量 | Ramp-up | 逐步提高实验组流量比例 |
| 回滚 | Rollback | 停止新策略并恢复旧策略 |
| 长期保留组 | Holdout Group | 长期不接收某类新策略的对照流量 |
| 反转实验 | Reverse Experiment | 新策略成为默认策略后，保留少量旧策略流量继续比较 |

---

<a name="sec-3"></a>

## 3. 实验单位｜Experiment Unit

实验单位决定随机化发生在哪个粒度。

<a name="sec-3-1"></a>

### 3.1 常见实验单位

| 实验单位 | English | 适用场景 | 主要风险 |
|---|---|---|---|
| 用户 | User-level | 推荐、搜索、产品功能和大多数长期行为实验 | 多设备用户可能被重复识别 |
| 设备 | Device-level | 未登录流量、移动端功能实验 | 用户换设备后可能进入不同组 |
| 会话 | Session-level | 短期 UI、会话内交互策略 | 用户可能在不同会话进入不同组 |
| 请求 | Request-level | 服务性能、低耦合模型策略 | 用户体验可能不一致，容易产生污染 |
| 内容 | Item-level | 内容策略、内容分发实验 | 用户之间可能互相影响 |
| 创作者 | Creator-level | 创作者激励、流量分配策略 | 创作者与消费者双边影响复杂 |
| 地区或时间段 | Geo / Time-level | 网络效应、市场、调度或供需实验 | 样本数量较少，方差较高 |

<a name="sec-3-2"></a>

### 3.2 如何选择实验单位

选择原则：

1. 实验单位应尽量与策略实际作用对象一致。
2. 同一实验单位在实验期间应保持固定分组。
3. 不同组之间应尽量减少相互影响。
4. Point Estimate 可以由事件数据聚合，但推断单位和标准误必须尊重随机化单位及其相关结构。

例如，推荐排序策略会持续影响用户体验，因此一般使用 User-level Randomization。

如果使用 Request-level Randomization，同一用户可能在连续刷新中看到不同策略：

```text
Request 1 → Control
Request 2 → Treatment
Request 3 → Control
```

这可能导致：

- 用户体验不一致
- 策略之间互相影响
- 长期指标无法正确归因
- 实验效应被稀释

对于跨 Surface 的用户旅程，通常应保持同一 `user_id` 在短视频商品内容流、直播内容流和商城商品卡推荐中的 Assignment 一致，或明确把各 Surface 定义为独立因子。否则用户可能在一个入口接受 Treatment、另一个入口接受 Control，导致策略污染和难以解释的联合体验。

购买指标还要区分 Assignment、Exposure 与 Conversion：

```text
User Assignment
→ Short-video / Live / Mall Exposure
→ Product Detail Page
→ Add to Cart
→ Order
→ Refund / Cancellation Maturity
```

若 Treatment 会影响是否点击商品，主分析不应只保留“已点击用户”，因为点击是 Post-treatment Variable。更稳健的主估计通常是对预先定义 Eligible Population 的 Intention-to-Treat Effect，并预先固定订单归因窗口和退款成熟窗口；Triggered Analysis 可作为补充，但必须使用实验前或不受 Treatment 影响的触发条件。

---

<a name="sec-4"></a>

## 4. 随机分流与哈希分桶｜Randomization and Hash Bucketing

工业系统通常不会在每次请求时调用普通随机数进行分组，而是使用确定性哈希函数。

基础逻辑：

```text
Bucket
= Hash(Experiment Unit ID + Salt)
  mod Number of Buckets
```

例如：

```text
Bucket
= Hash(User ID + Experiment Salt)
  mod 10,000
```

这段逻辑可以拆成五步：

```text
User ID
    ↓
拼接 Experiment Salt
    ↓
计算稳定 Hash
    ↓
对 10,000 取余
    ↓
得到 Bucket 0–9,999
```

到这里还没有决定用户属于 Control 还是 Treatment。实验平台还需要根据 Bucket 区间分配实验组。

例如：

```text
Bucket 0–499       → Treatment，5%
Bucket 500–999     → Control，5%
Bucket 1,000–9,999 → Not in Experiment，90%
```

<a name="sec-4-1"></a>

### 4.1 为什么不能直接使用随机数

错误示例：

```python
group = random.choice(["control", "treatment"])
```

如果每次请求都重新随机：

```text
同一个用户今天进入 Control
下一次请求进入 Treatment
明天又进入 Control
```

这会破坏实验稳定性。

<a name="sec-4-2"></a>

### 4.2 哈希分桶的核心性质

| 性质 | English | 说明 |
|---|---|---|
| 确定性 | Deterministic | 相同输入始终得到相同 Bucket |
| 稳定性 | Stable | 用户在实验期间不会随意切换组 |
| 均匀性 | Uniform | 流量应近似均匀分布到各个 Bucket |
| 可扩展性 | Scalable | 不需要保存所有用户的分组结果 |
| 可复现性 | Reproducible | 离线分析和线上服务可以复现相同分组 |

<a name="sec-4-3"></a>

### 4.3 Bucket 与实验组的关系

Bucket 只是用户的稳定“座位号”，实验组由 Bucket 区间决定。

| User | Bucket | Group |
|---|---:|---|
| User A | 123 | Treatment |
| User B | 845 | Control |
| User C | 3,827 | Not in Experiment |

因此：

```text
Hash 负责稳定随机化
Bucket 负责离散化流量
Traffic Range 负责分配实验组
```

<a name="sec-4-4"></a>

### 4.4 为什么需要 Salt

如果所有实验都只使用：

```text
Hash(User ID) mod 10,000
```

那么不同实验会得到完全相同的用户排序。

例如，前 10% 的用户可能同时进入多个实验的 Treatment，导致实验之间产生不必要的相关性。

加入不同 Salt：

```text
Hash(User ID + "ranking_model_v2")
Hash(User ID + "new_ui_test")
Hash(User ID + "creator_fairness_test")
```

不同实验会产生不同但稳定的随机分配。

Salt 通常可以由以下内容组成：

```text
Layer Name
Experiment ID
Experiment Version
Randomization Unit Type
```

例如：

```text
recommendation-ranking:exp-102:v1:user
```

Salt 的作用不是加密，而是让不同实验拥有独立的随机映射。

<a name="sec-4-5"></a>

### 4.5 常见哈希函数

| 哈希函数 | 特点 | 适用性 |
|---|---|---|
| MurmurHash | 速度快、分布较均匀、非加密哈希 | 常用于实验分桶和特征哈希 |
| xxHash | 速度非常快 | 适合高吞吐在线服务 |
| CityHash / FarmHash | 针对字符串和服务器环境优化 | 可用于大规模在线系统 |
| CRC32 | 实现简单、速度快 | 可用于基础分桶，但需验证均匀性 |
| MD5 / SHA | 稳定但计算成本相对更高 | 可用，但通常不是性能最优选择 |

选择哈希函数时最重要的是：

- 线上和离线实现完全一致
- 跨语言结果一致
- 对输入编码有统一规范
- 分布均匀
- 算法版本不会随运行环境改变

不要直接使用 Python 内置 `hash()` 进行跨进程或跨环境实验分桶，因为其结果可能受运行时随机种子和版本影响。

---

<a name="sec-5"></a>

## 5. 哈希分桶代码实现｜Hash Bucketing Implementation

<a name="sec-5-1"></a>

### 5.1 使用 SHA-256 的可复现实现

下面的示例只依赖 Python 标准库，适合知识库演示和原型验证。

```python
@dataclass(frozen=True)
class ExperimentConfig:
    experiment_id: str
    num_buckets: int = 10_000

    def __post_init__(self) -> None:
        if not self.experiment_id:
            raise ValueError("experiment_id must not be empty")

        if self.num_buckets <= 0:
            raise ValueError("num_buckets must be positive")

def stable_bucket(
    unit_id: str,
    config: ExperimentConfig,
) -> int:
    """
    将实验单位稳定地映射到 [0, num_buckets) 区间。

    相同的 unit_id、experiment_id 和 num_buckets
    会始终得到相同的 Bucket。
    """
    if not unit_id:
        raise ValueError("unit_id must not be empty")

    hash_input = f"{config.experiment_id}:{unit_id}".encode("utf-8")
    digest = hashlib.sha256(hash_input).digest()

    # 取前 8 个字节转换为无符号整数
    hash_value = int.from_bytes(
        digest[:8],
        byteorder="big",
        signed=False,
    )

    return hash_value % config.num_buckets
```

使用示例：

```python
config = ExperimentConfig(
    experiment_id="ranking-model-v2",
    num_buckets=10_000,
)

bucket = stable_bucket("user_1001", config)
print(bucket)
```

示例中使用 SHA-256 是因为 Python 标准库原生支持，便于演示稳定哈希思想。高吞吐生产系统通常会根据性能、跨语言一致性和已有基础设施选择具体哈希算法。

<a name="sec-5-2"></a>

### 5.2 根据 Bucket 分配实验组

```python
@dataclass(frozen=True)
class TrafficRange:
    group_name: str
    start_bucket: int
    end_bucket: int

    def __post_init__(self) -> None:
        if not self.group_name:
            raise ValueError("group_name must not be empty")

        if self.start_bucket < 0:
            raise ValueError("start_bucket must be non-negative")

        if self.end_bucket <= self.start_bucket:
            raise ValueError(
                "end_bucket must be greater than start_bucket"
            )

    def contains(self, bucket: int) -> bool:
        return self.start_bucket <= bucket < self.end_bucket

TRAFFIC_RANGES = (
    TrafficRange("treatment", 0, 500),      # 5%
    TrafficRange("control", 500, 1_000),    # 5%
)

def assign_group(bucket: int) -> str:
    if bucket < 0:
        raise ValueError("bucket must be non-negative")

    for traffic_range in TRAFFIC_RANGES:
        if traffic_range.contains(bucket):
            return traffic_range.group_name

    return "not_in_experiment"
```

完整使用：

```python
config = ExperimentConfig(
    experiment_id="ranking-model-v2",
    num_buckets=10_000,
)

user_id = "user_1001"
bucket = stable_bucket(user_id, config)
group = assign_group(bucket)

print(
    {
        "user_id": user_id,
        "bucket": bucket,
        "group": group,
    }
)
```

<a name="sec-5-3"></a>

### 5.3 放量时如何保持用户稳定

初始实验：

```text
Treatment: Bucket 0–499
Control:   Bucket 500–999
```

从 5% 扩大到 10% 时，如果改为：

```text
Treatment: Bucket 0–999
Control:   Bucket 1,000–1,999
```

原有部分 Control 用户会转入 Treatment。

更稳定的方式是提前规划固定对照区间：

```text
Permanent Control: Bucket 0–499
Treatment Phase 1: Bucket 500–999
Treatment Phase 2: Bucket 500–1,499
Treatment Phase 3: Bucket 500–2,499
```

这样原有 Treatment 用户会继续留在 Treatment，Control 也保持不变。

流量扩张前应提前设计：

- Control 是否固定
- Treatment 是否只增加不减少
- 新增流量来自哪个未参与实验的区间
- 是否允许用户因 Ramp-up 切换实验状态

---

<a name="sec-6"></a>

## 6. 实验层与正交设计｜Experiment Layers and Orthogonality

大型推荐系统会同时运行大量实验。Experiment Layer 的作用不是声明两个策略在业务上互不影响，而是管理随机流量、参数冲突和共同曝光。

电商推荐通常同时包含多个 Surface 和多个 Stage：

| Surface | 常见 Stage / Layer | 可能共享的状态 |
|---|---|---|
| 短视频商品内容流 | Recall、Ranking、Re-ranking、商品入口 UI | 用户兴趣、商品库存、商家流量 |
| 直播内容流 | Live-room Recall、Ranking、Traffic Allocation | 直播间容量、主播供给、实时互动 |
| 商城商品卡推荐 | Recall、Ranking、Re-ranking、商品卡 UI | 商品池、库存、价格与订单 |

同一个用户可能跨入口消费，同一个商品或商家也可能同时出现在多个 Surface。因此，层应根据“是否会争用同一参数、改变同一决策点或产生强交互”划分，而不能只按组织边界命名。

<a name="sec-6-1"></a>

### 6.1 同层互斥｜Mutual Exclusion

同层互斥表示同一实验单位不会同时进入该层的两个实验。最典型的情况是两种策略不能在一次请求中同时成立：

- 同一精排服务的 Model A 与 Model B；
- 同一召回通道的两套互斥参数；
- 同一商品卡位置的两种 UI；
- 同一直播间流量分配器的两套目标函数。

即使两个改动在工程上可以同时开启，只要它们修改同一阶段、预计存在强交互，而当前实验只想识别各自的独立效果，也应先放入同一层互斥。

```text
Ranking Layer
├── Experiment A
├── Experiment B
└── Experiment C
```

互斥的代价是流量不能完全复用，也无法直接估计两种可叠加策略的组合效果。如果最终上线计划就是同时启用两个策略，仅分别运行两个互斥 A/B Test 仍然缺少联合上线证据。

<a name="sec-6-2"></a>

### 6.2 跨层正交｜Orthogonality

跨层正交通常指不同层使用不同 Salt 对同一实验单位独立分桶。它让各层可以复用同一批流量，并使两个 Treatment Assignment 在设计上近似独立。

同一个用户可能同时进入：

```text
Recall Treatment
+
Ranking Control
+
UI Treatment
```

这样可以提高流量复用效率。

若实验 A 与实验 B 都按 50% 分流，正交分桶后通常会形成四个交叉单元：

| A | B | 期望流量 |
|---|---|---:|
| Control | Control | 25% |
| Treatment | Control | 25% |
| Control | Treatment | 25% |
| Treatment | Treatment | 25% |

这四个比例应由实际分流比例相乘得到，而不是固定为 25%。上线前需要检查：

- 两个实验使用相同且稳定的 Experiment Unit；
- Salt 独立，交叉单元均有足够样本；
- 分层、资格过滤和触发条件不会破坏交叉单元的可比性；
- 实验日志同时记录两个 Assignment 与实际 Exposure。

跨 Surface 时要额外谨慎。例如短视频商品内容流和商城商品卡推荐虽然属于不同入口，但用户兴趣、商品曝光和购买路径相连；直播内容流还可能改变共享直播间和商家供给。仅把它们配置到不同层，不能消除这些业务联系。

<a name="sec-6-3"></a>

### 6.3 正交分流不等于效果可加

“正交”至少有两个容易混淆的含义：

1. 平台层面的正交：两个 Assignment 由独立随机化产生；
2. 统计设计中的正交：设计矩阵的效应列不相关，主效应和交互项可以分别估计。

两者都不表示业务效果一定满足 `1 + 1 = 2`。如果策略 A 的效果取决于策略 B 是否开启，就存在 Interaction Effect。

例如增加一条召回通道后，新的精排模型可能更擅长识别新增候选，出现协同；也可能因新增低质量候选挤占计算预算，抵消精排收益。

以下口号必须放在同一个指标、同一个总体和同一个效应尺度下理解：

```text
1 + 1 > 2：正向交互，组合增量大于两个单独增量之和
1 + 1 = 2：加性尺度上没有交互
1 + 1 < 2：负向交互，组合增量小于两个单独增量之和
```

“无加性交互”不等于在 Relative Lift、Odds Ratio 或 Log Scale 上也无交互。实验设计和 Readout 必须预先声明所使用的尺度，业务指标通常优先报告 Absolute Effect，并同时提供 Relative Effect 作为解释。

<a name="sec-6-4"></a>

### 6.4 2 × 2 Factorial Design｜二因子实验

设：

- 因子 A：是否增加新召回通道；
- 因子 B：是否启用新精排模型；
- `mu_00`、`mu_10`、`mu_01`、`mu_11`：四个处理组合下的总体平均结果。

| 新召回通道 A | 新精排模型 B | Cell | 期望结果 |
|---|---|---|---|
| 0 | 0 | Baseline | `mu_00` |
| 1 | 0 | Recall Only | `mu_10` |
| 0 | 1 | Ranking Only | `mu_01` |
| 1 | 1 | Combined | `mu_11` |

在加性尺度上，A 在 B 关闭时的条件效应为：

```math
\Delta_{A \mid B=0}=\mu_{10}-\mu_{00}
```

A 在 B 开启时的条件效应为：

```math
\Delta_{A \mid B=1}=\mu_{11}-\mu_{01}
```

交互效应是 Difference-in-Differences：

```math
\Delta_{AB}
=
(\mu_{11}-\mu_{01})-(\mu_{10}-\mu_{00})
```

等价地：

```math
\Delta_{AB}=\mu_{11}-\mu_{10}-\mu_{01}+\mu_{00}
```

因此：

```text
Delta_AB > 0 → 协同，1 + 1 > 2
Delta_AB = 0 → 加性，1 + 1 = 2
Delta_AB < 0 → 抵消，1 + 1 < 2
```

平衡的 2 × 2 设计中，A 的平均主效应为：

```math
\Delta_A
=
\frac{1}{2}
[(\mu_{10}-\mu_{00})+(\mu_{11}-\mu_{01})]
```

B 的平均主效应同理。使用 0/1 编码时，可拟合：

```math
Y
=
\beta_0+\beta_A A+\beta_B B+\beta_{AB}AB+\varepsilon
```

其中 `beta_A` 是 B=0 时 A 的条件效应，`beta_B` 是 A=0 时 B 的条件效应，`beta_AB` 对应加性尺度上的交互效应；平均主效应需要通过上面的边际 Contrast 计算。若使用 -1/+1 Effect Coding，系数解释和倍数会改变，因此 Readout 应直接报告四个 Cell Mean 与预先定义的 Contrasts。标准误、Cluster 和协变量调整仍必须匹配原随机化设计。

一个直观的指标指数示例：

| Cell | 指标指数 | 相对 Baseline 的绝对增量 |
|---|---:|---:|
| Baseline | 100 | 0 |
| Recall Only | 102 | +2 |
| Ranking Only | 103 | +3 |
| Combined | 108 | +8 |

若没有交互，组合预期是 105；实际为 108，因此交互效应为 `+3`，属于 `1 + 1 > 2`。如果 Combined 为 103.5，交互效应为 `-1.5`，属于 `1 + 1 < 2`。

交互项通常比主效应更难检出。若交互是上线决策的一部分，应单独为最小交互效应做 Power Analysis，不能沿用单个 A/B Test 的 MDE。

<a name="sec-6-5"></a>

### 6.5 何时互斥，何时正交，何时做 Factorial

| 情况 | 建议设计 | 原因 |
|---|---|---|
| 两个模型不能在同一请求中同时生效 | 同层互斥 | 处理定义天然冲突 |
| 两个改动修改同一参数或同一排名位置 | 同层互斥 | 避免不可解释的共同曝光 |
| 两个改动作用链路不同，交互风险低 | 跨层正交 | 提高流量复用效率 |
| 两个改动可以联合上线，且需要估计协同或抵消 | 2 × 2 Factorial | 直接估计主效应与交互效应 |
| 跨 Surface 改动共同影响同一用户购买路径 | Factorial 或全局互斥层 | 独立分桶不能排除跨入口交互 |
| Treatment 会改变共享库存、直播间或商家供给 | Cluster / Switchback / Two-sided Design | 问题是跨实验单位干扰，而不只是实验重叠 |

决策顺序可以概括为：

```text
能否同时生效？
├── 否 → 互斥
└── 是
    ├── 联合效果是否重要或可能强交互？
    │   ├── 是 → Factorial
    │   └── 否 → 正交重叠
    └── 是否改变共享市场状态？
        └── 是 → 重新设计 Randomization Unit
```

---

<a name="sec-7"></a>

## 7. 实验假设与指标设计｜Hypothesis and Metric Design

一个合格的实验在启动前应明确实验假设。

推荐模板：

```text
如果上线新的排序模型，
那么用户的人均有效观看时长将提升，
因为新模型可以更准确地识别深度消费偏好，
同时负反馈率和 P95 Latency 不应显著恶化。
```

<a name="sec-7-1"></a>

### 7.1 指标角色

| 指标角色 | English | 作用 |
|---|---|---|
| 主要指标 | Primary Metric | 决定实验是否成功的核心指标 |
| 次要指标 | Secondary Metrics | 解释主要指标变化的路径 |
| 护栏指标 | Guardrail Metrics | 防止实验损害系统或长期价值 |
| 诊断指标 | Diagnostic Metrics | 定位实验影响发生在哪个环节 |
| 数据质量指标 | Data Quality Metrics | 检查日志、分流和样本是否正常 |

<a name="sec-7-2"></a>

### 7.2 推荐排序实验示例

| 指标类型 | 指标示例 |
|---|---|
| Primary | Average Watch Time per User |
| Secondary | CTR, QVR, Completion Rate, Sessions per User |
| Guardrail | Negative Feedback Rate, D1 Retention, Crash Rate, P95 Latency |
| Diagnostic | Recall Size, Score Distribution, Content Category Mix |
| Data Quality | Exposure Count, Missing Log Rate, Group Size Ratio |

实验不应在结果出来后临时更换 Primary Metric，否则容易产生选择性汇报。

---

<a name="sec-8"></a>

## 8. 实验有效性检查｜Experiment Validity Checks

Sample Ratio Mismatch，简称 SRM，表示实际实验组比例与设计比例存在无法由随机波动解释的差异。

例如，设计为：

```text
Control = 50%
Treatment = 50%
```

实际得到：

```text
Control = 54%
Treatment = 46%
```

当样本量很大时，这种偏差通常不是普通随机波动，而可能意味着实验系统存在问题。

<a name="sec-8-1"></a>

### 8.1 SRM 常见原因

- 哈希或分桶实现不一致
- 某个实验组请求失败率更高
- 客户端版本只覆盖部分用户
- 实验参数加载失败
- 日志在某组中缺失
- 用户进入实验后被错误过滤
- Bot 或内部流量分布不均
- 实验组产生更高 Crash，导致后续事件缺失

<a name="sec-8-2"></a>

### 8.2 SRM 检查代码

```python
def check_srm(
    observed_counts: list[int],
    expected_ratios: list[float],
) -> tuple[float, float]:
    """
    使用卡方检验检查样本比例失配。

    Returns:
        statistic: 卡方统计量
        p_value: SRM 检验 p-value
    """
    if len(observed_counts) != len(expected_ratios):
        raise ValueError("counts and ratios must have the same length")

    if not observed_counts:
        raise ValueError("observed_counts must not be empty")

    if any(count < 0 for count in observed_counts):
        raise ValueError("observed counts must be non-negative")

    if any(ratio <= 0 for ratio in expected_ratios):
        raise ValueError("expected ratios must be positive")

    ratio_sum = sum(expected_ratios)
    normalized_ratios = [
        ratio / ratio_sum
        for ratio in expected_ratios
    ]

    total_count = sum(observed_counts)
    if total_count <= 0:
        raise ValueError("total observed count must be positive")

    expected_counts = [
        total_count * ratio
        for ratio in normalized_ratios
    ]

    statistic, p_value = chisquare(
        f_obs=observed_counts,
        f_exp=expected_counts,
    )

    return float(statistic), float(p_value)
```

使用示例：

```python
statistic, p_value = check_srm(
    observed_counts=[54_000, 46_000],
    expected_ratios=[0.5, 0.5],
)

print(
    {
        "chi_square": statistic,
        "p_value": p_value,
        "has_srm": p_value < 0.001,
    }
)
```

SRM 检查应在分析实验效果之前完成，并且需要在实验运行期间持续执行。主 SRM 应基于被随机化且满足实验前资格条件的单位；按曝光、点击、进店或下单后的样本做 SRM，可能把真实 Treatment Effect 或 Post-treatment Selection 误判为分流异常。

如果存在严重 SRM，不应直接解释业务指标差异。

---

<a name="sec-8-3"></a>

### 8.3 实验前平衡检查｜Pre-experiment Balance Check

随机化后，两组的用户属性在期望上应接近，但有限样本中仍可能存在差异。

常见平衡检查维度：

- 国家和地区
- 设备类型
- 操作系统
- App Version
- 新老用户
- 历史活跃度
- 历史 CTR
- 历史使用时长
- 历史消费金额
- 内容兴趣分布

需要注意：

> 不应因为某个普通特征的 p-value 小于 0.05 就反复重新随机分组。

在大量特征下，偶然出现少量显著差异是正常的。

更合理的做法包括：

- 检查整体分布
- 使用标准化差异
- 观察历史核心指标是否平衡
- 使用 CUPED 等方法降低方差
- 对关键分层变量进行预分层随机化

---

<a name="sec-8-4"></a>

### 8.4 分层随机化｜Stratified Randomization

当某些关键特征强烈影响实验指标时，可以先分层，再在层内随机。

例如按用户活跃度分层：

```text
Low Activity Users
Medium Activity Users
High Activity Users
```

然后每一层分别进行 50/50 分流。

分层随机化有助于：

- 提高组间平衡
- 降低指标方差
- 防止小样本实验被极端用户分布影响
- 提升统计功效

常见分层变量：

- 国家或市场
- 新用户与老用户
- 高活跃与低活跃用户
- 付费用户与非付费用户
- 历史消费水平
- 设备平台

分层变量应在实验开始前确定，并避免使用会被实验影响的后验变量。

---

<a name="sec-9"></a>

## 9. 样本量与实验周期｜Sample Size and Duration

实验样本量取决于：

| 参数 | English | 说明 |
|---|---|---|
| 显著性水平 | Significance Level | 假阳性容忍度，常记为 Alpha |
| 统计功效 | Statistical Power | 检测到真实效应的概率，等于 `1 - Beta` |
| 基线水平 | Baseline Rate / Mean | 当前指标水平 |
| 最小可检测效应 | Minimum Detectable Effect | 希望检测到的最小变化 |
| 指标方差 | Variance | 指标自然波动程度 |
| 流量比例 | Allocation Ratio | Control 与 Treatment 的样本分配比例 |

<a name="sec-9-1"></a>

### 9.1 MDE 的两种表达

绝对提升：

```text
Baseline CTR = 10.0%
Treatment CTR = 10.2%

Absolute Lift = 0.2 percentage points
```

相对提升：

```text
Relative Lift
= (10.2% - 10.0%) / 10.0%
= 2%
```

汇报实验效果时应明确使用的是：

- Percentage Point Change
- Relative Percentage Change

<a name="sec-9-2"></a>

### 9.2 二项指标样本量代码

以下示例只适用于“每个独立实验单位贡献一个 Bernoulli 结果”的比例指标，例如用户级 D7 Retention 或是否下单。用户随机化下的曝光 CTR、点击后 CVR 通常是 Clustered Ratio，Power Analysis 应使用历史用户级 `(numerator, denominator)` 的 Delta / Linearization / Cluster Bootstrap 方差，不能把曝光或订单当作独立样本。

```python
def sample_size_for_two_proportions(
    baseline_rate: float,
    treatment_rate: float,
    alpha: float = 0.05,
    power: float = 0.8,
    treatment_to_control_ratio: float = 1.0,
) -> int:
    """
    估计双侧两比例检验中 Control 组所需样本量。

    treatment_to_control_ratio:
        Treatment 样本量 / Control 样本量
    """
    for name, value in {
        "baseline_rate": baseline_rate,
        "treatment_rate": treatment_rate,
    }.items():
        if not 0 < value < 1:
            raise ValueError(f"{name} must be between 0 and 1")

    if baseline_rate == treatment_rate:
        raise ValueError(
            "baseline_rate and treatment_rate must be different"
        )

    if not 0 < alpha < 1:
        raise ValueError("alpha must be between 0 and 1")

    if not 0 < power < 1:
        raise ValueError("power must be between 0 and 1")

    if treatment_to_control_ratio <= 0:
        raise ValueError("allocation ratio must be positive")

    effect_size = proportion_effectsize(
        baseline_rate,
        treatment_rate,
    )

    analysis = NormalIndPower()

    control_sample_size = analysis.solve_power(
        effect_size=effect_size,
        alpha=alpha,
        power=power,
        ratio=treatment_to_control_ratio,
        alternative="two-sided",
    )

    whole = int(control_sample_size)
    return whole if control_sample_size == whole else whole + 1
```

使用示例：

```python
control_n = sample_size_for_two_proportions(
    baseline_rate=0.10,
    treatment_rate=0.102,
    alpha=0.05,
    power=0.80,
)

print(control_n)
```

样本量估计应在实验开始前完成，而不是实验结束后根据结果反推。

---

<a name="sec-9-3"></a>

### 9.3 实验周期｜Experiment Duration

即使样本量已经足够，也不应在极短时间内结束实验。

实验通常需要覆盖完整的业务周期，例如：

- 至少覆盖一个完整星期
- 同时覆盖工作日和周末
- 避开重大故障或异常活动
- 考虑节假日、促销和发薪周期
- 考虑新奇效应和学习效应
- 等待延迟转化充分回流

典型影响：

| 时间因素 | 可能影响 |
|---|---|
| Weekday vs. Weekend | 用户使用习惯不同 |
| Holiday | 流量和消费意愿异常 |
| Promotion Period | GMV 和 CVR 被营销活动放大 |
| Novelty Effect | 用户短期因新功能产生额外兴趣 |
| Learning Effect | 用户需要时间适应新交互 |
| Delayed Conversion | 点击后数天才产生订单 |

实验周期应由样本量要求和业务周期共同决定。

---

<a name="sec-10"></a>

## 10. 统计推断｜Statistical Inference

不同类型指标适合不同统计方法。

<a name="sec-10-1"></a>

### 10.1 常见方法

| 指标类型 | 示例 | 常见方法 |
|---|---|---|
| 实验单位级二项结果 | User Retention、是否下单 | Two-proportion Z-test、回归或 Randomization Inference |
| 近似连续且分布较稳定 | Usage Time、Session Count | T-test、Welch's T-test |
| 长尾连续指标 | GMV、Revenue、Watch Time | Unit-level / Cluster Bootstrap、稳健回归；预先定义的截尾分析可作敏感性检查 |
| Ratio of Sums | CTR、CVR、AOV | Delta Method、Linearization、Cluster Bootstrap |
| 实验单位均值 | GMV per User、Orders per User | Unit-level Aggregation + T-test / Bootstrap |
| 时间或地区随机实验 | Switchback、Geo Experiment | Cluster-robust Inference、Time-series Analysis |
| 多次中途查看 | Sequential Experiment | Sequential Test、Always-valid Inference |

方法由 Estimand 和 Randomization Unit 共同决定，不能只由指标名称决定。例如曝光级 CTR 虽然表面上是二项比例，但用户级随机实验中的同一用户会产生多次曝光，事件并不独立；直接把每次曝光放进普通两比例检验会低估不确定性。

对长尾指标做 Winsorization、Capping 或 Log Transformation 会改变 Estimand。若它用于正式决策，阈值和转换应在看结果前确定，并同时报告原始业务指标，不能把“让 p-value 更小”当成选择转换的依据。

#### Ratio Metric：先定义估计对象

设每个用户贡献分子 `N_u` 和分母 `D_u`。业务 CTR 常定义为 Ratio of Sums：

```math
R
=
\frac{\sum_u N_u}{\sum_u D_u}
```

它与 Average of User Ratios 不同。定义正分母用户集合：

```math
\mathcal{U}_{+}=\{u:D_u>0\}
```

则：

```math
R_{user}
=
\frac{1}{|\mathcal{U}_{+}|}
\sum_{u\in\mathcal{U}_{+}}
\frac{N_u}{D_u}
```

前者按曝光量隐式加权用户，回答“全部合格曝光中有多少点击”；后者让每个正分母用户权重相同，回答“发生过分母事件者的平均用户 CTR”。两者都可以是合理指标，但不能混用。若 `D_u > 0` 本身会被 Treatment 改变，后者还条件化了实验后变量，不能直接解释为 Eligible Population 上的 ITT 因果效果。

Ratio of Sums 的方差不能通过“把分子和分母当成固定常数”得到。常见做法是对 `(N_u, D_u)` 使用 Delta Method / Linearization，或在随机化单位层级同时重采样分子和分母。对于用户级随机实验，即使 AOV 的分母是订单，推断仍应保留同一用户订单之间的相关性。

实验报告应同时声明：

- Numerator、Denominator 和 Eligible Population；
- Analysis / Randomization Unit；
- Zero-denominator 处理；
- Attribution Window 与 Maturity Window；
- Absolute Difference、Relative Lift 使用的基线和尺度。

<a name="sec-10-2"></a>

### 10.2 两比例检验代码

以下实现只适用于每个独立实验单位贡献一个二项结果，或观测确实可以视为相互独立的场景。例如用户级随机实验中的 D7 Retention，可以让每位用户贡献一个 `retained / not retained` 结果。它不应直接用于把同一用户的数百次曝光当作数百个独立 CTR 样本。

```python
def compare_two_rates(
    control_successes: int,
    control_total: int,
    treatment_successes: int,
    treatment_total: int,
) -> dict[str, float]:
    """
    比较 Control 与 Treatment 的两个比例。
    """
    if min(
        control_successes,
        control_total,
        treatment_successes,
        treatment_total,
    ) < 0:
        raise ValueError("counts must be non-negative")

    if control_total <= 0 or treatment_total <= 0:
        raise ValueError("group totals must be positive")

    if control_successes > control_total:
        raise ValueError("control successes cannot exceed total")

    if treatment_successes > treatment_total:
        raise ValueError("treatment successes cannot exceed total")

    count = [treatment_successes, control_successes]
    nobs = [treatment_total, control_total]

    z_stat, p_value = proportions_ztest(
        count=count,
        nobs=nobs,
        alternative="two-sided",
    )

    control_rate = control_successes / control_total
    treatment_rate = treatment_successes / treatment_total

    absolute_lift = treatment_rate - control_rate
    relative_lift = (
        absolute_lift / control_rate
        if control_rate != 0
        else float("nan")
    )

    return {
        "control_rate": control_rate,
        "treatment_rate": treatment_rate,
        "absolute_lift": absolute_lift,
        "relative_lift": relative_lift,
        "z_stat": float(z_stat),
        "p_value": float(p_value),
    }
```

使用示例：

```python
result = compare_two_rates(
    control_successes=10_000,
    control_total=100_000,
    treatment_successes=10_300,
    treatment_total=100_000,
)

print(result)
```

<a name="sec-10-3"></a>

### 10.3 显著不等于重要

一个实验可能：

```text
Relative Lift = 0.02%
p-value < 0.001
```

在超大样本下，这种极小变化也可能统计显著。

因此需要同时判断：

- Statistical Significance
- Practical Significance
- Business Value
- Engineering Cost
- Long-term Risk

---

<a name="sec-10-4"></a>

### 10.4 置信区间｜Confidence Interval

只报告 p-value 不足以表达实验结果。

建议同时报告：

```text
Treatment Lift = +1.2%
95% Confidence Interval = [+0.4%, +2.0%]
```

置信区间可以帮助判断：

- 效应方向是否稳定
- 可能的真实效应范围
- 是否达到业务要求的最小收益
- 是否仍存在明显下行风险

一种常见决策方式：

```text
Confidence Interval entirely above 0
and
Lower Bound above Business Threshold
→ Strong rollout candidate
```

如果置信区间很宽，通常说明：

- 样本量不足
- 指标方差过高
- 用户分布高度长尾
- 实验周期过短

---

<a name="sec-10-5"></a>

### 10.5 多重检验｜Multiple Testing

一个实验同时观察大量指标、Treatment 或用户分群时，偶然显著的概率会增加。若 20 个原假设都成立且检验相互独立，每个使用 5% 显著性水平，至少出现一个假阳性的概率为：

```math
1-(1-0.05)^{20}
```

约为 64%，而“期望假阳性个数”才约为 1。真实指标往往相关，因此不能机械套用独立公式，但问题不会因指标相关而自动消失。

常见处理方法：

| 方法 | 说明 |
|---|---|
| Bonferroni Correction | 控制严格，方法简单，但可能过于保守 |
| Holm Correction | 比 Bonferroni 更灵活 |
| Benjamini-Hochberg | 控制 False Discovery Rate |
| Pre-specified Primary Metric | 预先确定唯一或少量核心指标 |
| Metric Hierarchy | 先检验主指标，再检验次要指标 |

选择控制目标时需要区分：

- Confirmatory Ship Decision 通常更关心 Family-wise Error Rate，可使用 Holm 或预先定义的 Gatekeeping；
- 大规模探索性 Segment / Metric Discovery 可使用 False Discovery Rate，但发现应在后续实验中验证；
- 多个 Co-primary Metrics 是“全部必须通过”还是“任意一个通过”会形成不同假设族，必须提前写进 Decision Rule；
- Guardrail 常是 Non-inferiority 问题，应报告相对于风险阈值的单侧置信区间，而不是把 `p > 0.05` 当成“安全”。

最佳实践：

- 实验前明确 Primary Metric
- 限制核心决策指标数量
- 区分 Confirmatory 和 Exploratory Analysis
- 不根据显著结果临时选择成功指标

---

<a name="sec-10-6"></a>

### 10.6 中途查看与提前停止｜Peeking and Early Stopping

如果每天使用普通固定样本检验查看 p-value，并在首次显著时停止实验，会提高假阳性率。

错误流程：

```text
Day 1: p = 0.20
Day 2: p = 0.08
Day 3: p = 0.03 → Stop and Ship
```

如果需要连续监控，应使用：

- Sequential Probability Ratio Test
- Alpha Spending
- Group Sequential Design
- Always-valid p-values
- Bayesian Sequential Decision

这些方法不是可互换的标签。正式采用 Sequential Design 时，应在实验前定义：

- 最大样本量或最大 Information Time；
- Interim Look 的次数和时点，或允许连续查看的规则；
- Efficacy、Futility 与 Harm Boundary；
- Alpha Spending 或对应的错误率保证；
- 指标成熟窗口和最后一次有效数据日期。

Group Sequential / Alpha Spending 可以在预定 Interim Looks 下控制总体第一类错误；Always-valid p-value 或 Confidence Sequence 面向更灵活的持续查看。Bayesian Decision 需要先定义 Prior、Loss 和决策阈值，它本身不自动提供 Frequentist Type-I Error Control。

业务监控和统计决策需要区分：

- 可以实时监控 Crash、Latency、严重负反馈
- 不应使用普通 p-value 随意提前宣布实验成功

短视频到商品详情页、订单和退款的链路具有延迟。即使使用 Sequential Method，也不能在转化尚未成熟时把“暂未发生订单或退款”当作最终 0；序贯推断解决重复查看问题，不解决右删失和延迟归因。

---

<a name="sec-10-7"></a>

### 10.7 方差降低｜Variance Reduction

指标方差越低，在相同样本量下越容易检测到真实效应。

真正用于提高统计精度的方法包括：

- 使用实验前指标作为协变量，例如 CUPED；
- 预处理协变量上的分层或配对随机化，并在分析中保留分层结构；
- 在不改变业务问题的前提下，使用预先定义且噪声更低的指标。

以下操作需要与“方差降低”区分：用户级聚合首先是为了匹配随机化单位和相关结构，不保证方差一定下降；异常日志删除属于数据质量规则，只能使用实验前定义、两组对称且不由 Treatment 诱发的条件；Winsorization 或 Capping 会改变 Estimand，若用于正式决策必须预先固定阈值并同时报告原始业务指标。

#### CUPED

CUPED 使用实验前与实验指标高度相关的变量降低方差。

例如：

```text
实验指标：
Experiment-period Watch Time

协变量：
Pre-experiment Watch Time
```

直观上，如果用户实验前就属于重度用户，可以利用其历史行为解释一部分自然差异，从而更准确地估计实验效应。

设实验期指标为 `Y`，实验前协变量为 `X`。经典线性调整为：

```math
Y_{\mathrm{adj}}
=
Y-\theta(X-\mathbb{E}[X])
```

常用系数为：

```math
\theta
=
\frac{\mathrm{Cov}(Y,X)}{\mathrm{Var}(X)}
```

随机化保证 Treatment 与实验前的 `X` 独立，因此中心化后的调整不会改变目标平均处理效应；当 `X` 与 `Y` 高度相关时，它可以降低方差。实际平台可以在盲化或合并分组数据上稳定估计 `theta`，但不能按“哪个系数让 Treatment 更显著”选择参数。

使用 CUPED 时：

- 协变量必须在实验前产生
- 协变量不能被实验策略影响
- 协变量应与目标指标高度相关
- Control 与 Treatment 应使用相同处理逻辑
- 新用户没有历史数据时，应预先定义缺失值填补、Missing Indicator 或分层策略
- 多个协变量或灵活模型需要避免过拟合，可使用独立历史数据、样本拆分或 Cross-fitting
- 方差降低提高 Precision，不修复 SRM、污染、埋点错误或未观测混杂

对于 CTR、CVR、AOV 等 Ratio Metric，通常先在随机化单位上构造 Numerator 和 Denominator 的线性化贡献，再进行 CUPED 或回归调整；直接对每个用户的比率做 CUPED，估计的可能是 Average of User Ratios，而不是业务定义的 Ratio of Sums。

---

<a name="sec-10-8"></a>

### 10.8 异质性处理效应｜Heterogeneous Treatment Effects

Overall Lift 只能描述平均效果，还需要判断不同用户群是否存在明显异质性。

常见分群：

- New / Existing Users
- Light / Medium / Heavy Users
- Android / iOS
- High-end / Low-end Device
- Country / Language
- User Interest Cluster
- Creator Tier
- Content Category

例如：

```text
Overall Watch Time +1.8%

New Users          +4.0%
Existing Users     +1.2%
Low-end Device     -5.0%
```

此时 Overall 为正，但不能直接忽略 Low-end Device 的负向影响。

分析 Heterogeneous Treatment Effects 时需要注意：

- 优先使用实验前预先定义的重要 Segment
- 报告 Effect Size 和 Confidence Interval
- 避免在大量分群中只挑显著结果
- 必要时使用 Multiple Testing Correction
- 将探索性发现用于下一轮实验验证

Segment Analysis 的主要价值是发现风险和理解机制，而不是寻找更多“显著结果”。

---

<a name="sec-10-9"></a>

### 10.9 Cluster Bootstrap｜聚类自助法

#### 为什么普通 Bootstrap 可能错误

推荐与电商实验经常按用户随机化，但原始数据可能是一行一次曝光、Session 或订单：

```text
User A → 20 Sessions → 300 Impressions → 4 Orders
User B →  2 Sessions →  15 Impressions → 0 Orders
```

同一用户内部的观测共享兴趣、活跃度、设备和购买能力，因此并非相互独立。如果直接对事件行进行 Ordinary Bootstrap，相当于假设每次曝光都是一个独立实验单位。在常见的正向 Cluster 内相关下，这通常会：

- 低估 Standard Error；
- 产生过窄的 Confidence Interval；
- 增加 False Positive Risk；
- 让高活跃用户的重复行为看起来像更多独立样本。

Cluster Bootstrap 的核心原则是：

> 按独立的随机化单位进行有放回重采样，并保留同一单位内部的全部相关观测。

如果实验按 `user_id` 随机化，就重采样用户；如果按 `seller_id`、城市或时间块随机化，就应在相应层级重采样。

#### 基本算法

假设实验包含 `N` 个独立 Cluster：

1. 在 Control 与 Treatment 各自的 Cluster 集合内有放回抽样，保持每组原有 Cluster 数；
2. 某个 Cluster 被抽中几次，它的全部观测就获得几倍权重；
3. 在 Bootstrap Sample 中重新计算 Control 和 Treatment 指标；
4. 计算 Treatment Effect；
5. 重复 `B` 次，得到 Bootstrap Treatment Effect 的经验分布：

```math
\hat{\tau}_{\mathrm{boot}}^{(1)},
\ldots,
\hat{\tau}_{\mathrm{boot}}^{(B)}
```

对于均值差：

```math
\hat{\tau}=\bar{Y}_T-\bar{Y}_C
```

Bootstrap Standard Error 为：

```math
\widehat{SE}_{\mathrm{boot}}(\hat{\tau})
=\sqrt{
\frac{1}{B-1}
\sum_{b=1}^{B}
(
\hat{\tau}_{\mathrm{boot}}^{(b)}-
\frac{1}{B}\sum_{c=1}^{B}\hat{\tau}_{\mathrm{boot}}^{(c)}
)^2
}
```

#### 用户级聚合实现

如果业务指标可以先聚合到用户级，这是最清楚的实现方式：

```python
def is_finite(value):
    return value == value and value not in (
        float("inf"),
        float("-inf"),
    )


def ratio_metric(rows):
    numerators = [row["numerator"] for row in rows]
    denominators = [row["denominator"] for row in rows]

    if not all(is_finite(value) for value in numerators + denominators):
        raise ValueError("ratio inputs must all be finite")
    if any(value < 0 for value in denominators):
        raise ValueError("ratio denominators must be non-negative")

    numerator = sum(numerators)
    denominator = sum(denominators)
    if denominator <= 0:
        raise ValueError("ratio denominator must be positive in every replicate")
    return numerator / denominator


def treatment_effect(user_rows):
    treatment = [r for r in user_rows if r["group"] == "treatment"]
    control = [r for r in user_rows if r["group"] == "control"]
    return ratio_metric(treatment) - ratio_metric(control)


def sample_with_replacement(rows, rng):
    return [
        rows[rng.randrange(len(rows))]
        for _ in range(len(rows))
    ]


def empirical_quantile(values, probability):
    if not 0 <= probability <= 1:
        raise ValueError("probability must be between 0 and 1")
    if not values:
        raise ValueError("values must be non-empty")
    if not all(is_finite(value) for value in values):
        raise ValueError("quantile values must all be finite")

    ordered = sorted(values)
    position = (len(ordered) - 1) * probability
    lower_index = int(position)
    upper_index = min(lower_index + 1, len(ordered) - 1)
    weight = position - lower_index

    return (
        ordered[lower_index] * (1 - weight)
        + ordered[upper_index] * weight
    )


def cluster_bootstrap(user_rows, rng, repetitions=2_000):
    treatment = [r for r in user_rows if r["group"] == "treatment"]
    control = [r for r in user_rows if r["group"] == "control"]

    if not treatment or not control:
        raise ValueError("both experiment groups must be non-empty")
    if repetitions < 2:
        raise ValueError("repetitions must be at least 2")

    effects = []

    for _ in range(repetitions):
        sample = (
            sample_with_replacement(treatment, rng)
            + sample_with_replacement(control, rng)
        )
        effects.append(treatment_effect(sample))

    lower = empirical_quantile(effects, 0.025)
    upper = empirical_quantile(effects, 0.975)

    return {
        "effect": treatment_effect(user_rows),
        "ci_lower": lower,
        "ci_upper": upper,
    }
```

代码假设每行已经是一个用户，且包含实验组、指标分子和分母。它计算的是 Ratio of Sums：

```math
CTR=\frac{\sum_u Clicks_u}{\sum_u Impressions_u}
```

而不是 Average of User-level Ratios。令 `U_+` 表示正曝光用户集合，则后者是：

```math
\frac{1}{|\mathcal{U}_{+}|}
\sum_{u\in\mathcal{U}_{+}}
\frac{Clicks_u}{Impressions_u}
```

两者回答的问题不同，Bootstrap 不能替代 Metric Definition。若 Treatment 会改变用户是否进入 `U_+`，Average of User-level Ratios 还是实验后条件指标，不能当作 Eligible Population 的 ITT 效果。

#### 多重出现的 Cluster

Cluster Bootstrap 是有放回抽样，因此同一个用户可能被抽中多次。不能先用 `DISTINCT user_id` 去重，否则会破坏 Bootstrap Multiplicity。

大数据实现中通常不复制整批事件，而是为每个 Cluster 生成整数权重：

```text
User A sampled 0 times → weight = 0
User B sampled 2 times → weight = 2
User C sampled 1 time  → weight = 1
```

随后使用权重重新计算指标。这样比物理复制用户的全部曝光和订单更高效。

#### 置信区间方法

| 方法 | 计算方式 | 优点 | 局限 |
|---|---|---|---|
| Percentile CI | 直接取 Bootstrap Effect 的分位数 | 简单、直观 | 对偏差和偏态修正有限 |
| Normal CI | `point estimate ± critical value × bootstrap SE` | 易于报告 | 依赖近似对称性 |
| Basic CI | 围绕原始估计反射 Bootstrap Quantile | 可做简单偏差修正 | 对复杂偏态仍有限 |
| BCa CI | 修正 Bias 与 Acceleration | 在正则条件下可提高区间准确性 | 需要 Jackknife；Cluster BCa 通常要 Leave-one-cluster-out，且不代表对异常值或少量 Cluster 稳健 |

实验平台中最常见的是 Percentile CI 或基于 Bootstrap Standard Error 的 Normal CI。选择方法后应保持平台口径稳定，避免根据结果选择更有利的区间。

#### 与 Delta Method 和 Cluster-robust Standard Error 的关系

| 组合方式 | 核心思想 | 优势 | 局限 |
|---|---|---|---|
| Direct Cluster Bootstrap | 重采样 Cluster，并在每个 Replicate 重新计算完整指标 | 直接适配复杂 Ratio 和非线性统计量 | 计算成本较高，仍要求足够多的独立 Cluster |
| Delta / Linearization + Cluster-robust Covariance | 先把 Ratio 等函数一阶线性化，再对 Cluster 贡献使用 Sandwich Covariance | 高效，适合标准 Ratio Metric 和回归调整 | 依赖线性化与大样本近似 |
| Regression + Cluster-robust SE | 在回归框架中估计效应，并按随机化 Cluster 计算 Sandwich SE | 易结合协变量和分层固定效应 | 模型规格和少 Cluster 修正需要谨慎 |

Delta Method 是函数近似，Cluster-robust SE 是相关结构下的 Covariance 估计，两者可以组合，并非互斥的三选一。不同组合不一定产生完全相同的区间；Cluster 较少时都应谨慎，并考虑 small-sample correction 或 Randomization Inference。

#### Cluster 应如何选择

基本原则：

```text
Variance / Resampling Cluster 不应比 Randomization Unit 更细
```

Point Estimate 或回归数据可以保留事件级行，但标准误和重采样必须至少尊重随机化层级；若还存在跨随机化单位依赖，则需要更粗的依赖结构或重新设计实验。

| 随机化设计 | 通常的 Bootstrap Cluster |
|---|---|
| User-level Experiment | `user_id` |
| Seller-level Experiment | `seller_id` |
| Geo Experiment | city / region |
| Switchback Experiment | 保留时间结构的较长 Block / Day；使用 Block Bootstrap、HAC 或按 Assignment Schedule 的 Randomization Inference，不能把相邻 geo × time block 当作独立样本 |
| Household-level Assignment | household_id |

如果用户级实验中还存在家庭、社交网络或共享供给造成的跨用户依赖，仅按用户 Cluster Bootstrap 仍可能低估方差并产生有偏 Point Estimate。此时需要重新考虑实验设计，而不是机械扩大 Cluster。

#### 分层与实验组处理

通常应在 Control 和 Treatment 内分别重采样，保持每次 Bootstrap 的组内样本量稳定：

```text
Sample Treatment clusters with replacement
+
Sample Control clusters with replacement
→ Compute Treatment Effect
```

如果实验使用分层随机化，应尽量在 `stratum × treatment` 内重采样，从而保留原设计结构。若直接从全部用户混合抽样，Bootstrap Sample 中的组别和重要层级比例会产生额外波动。

#### 计算成本与 Poisson Bootstrap

标准 Cluster Bootstrap 需要重复扫描数据。在超大规模场景中，可以在每个实验组内为每个 Cluster 和 Bootstrap Replicate 生成：

```math
w_u^{(b)}\sim Poisson(1)
```

然后用 `w` 作为聚合权重。Poisson Bootstrap 易于并行和流式计算，是经典 Multinomial Bootstrap 的工程近似；它不改变 Cluster 的选择原则，也不修复跨 Cluster 干扰。

#### Cluster Bootstrap 不能解决什么

Cluster Bootstrap 只处理抽样推断中的 Cluster 内相关性，不能修复：

- SRM 或错误分流；
- Treatment Leakage 与 Cross-over；
- Network Effect 或 Marketplace Interference；
- 曝光选择偏差；
- 指标埋点错误；
- 延迟转化尚未成熟；
- Cluster 数量太少；
- 随机化单位和分析范围不一致。

例如，Treatment 改变了共享商品池并影响 Control 用户，这是 Interference。按用户重采样不会恢复 SUTVA，需要 Cluster Randomization、Switchback 或其他替代实验设计。

#### 使用检查清单

- Randomization Unit 是什么？
- 原始数据是否包含同一单位的重复观测？
- Bootstrap Cluster 是否与随机化设计一致？
- 指标是 Mean、Ratio of Sums 还是 Average of Ratios？
- 是否在实验组和随机化 Stratum 内分别重采样？
- 是否保留了重复抽中的 Cluster 权重？
- Bootstrap Replications 是否足够，结果是否对随机种子稳定？
- Cluster 数量是否足够支持渐近推断？
- 是否同时报告 Point Estimate、Confidence Interval 和业务阈值？
- 是否错误地把 Cluster Bootstrap 当成 Interference 的解决方案？

---

<a name="sec-11"></a>

## 11. 用户污染、网络效应与替代实验设计｜Interference and Alternative Designs

标准 A/B Testing 通常依赖无跨单位干扰：一个实验单位接受的处理不会改变另一个实验单位的潜在结果。推荐和电商系统还常隐含“同一个 Treatment 版本含义稳定”的假设。

当 Treatment 改变共享候选池、库存、直播间热度或商家行为时，Control 用户所处环境也会被改变。此时用户级 A/B Test 估计的可能是“在某个 Treatment Saturation 下的直接效果”，不一定等于 100% 上线后的全局效果。

<a name="sec-11-1"></a>

### 11.1 电商推荐中的干扰来源

| 来源 | 示例 | 可能产生的偏差 |
|---|---|---|
| 同一用户跨入口污染 | 短视频商品内容流的策略改变用户兴趣，随后影响商城商品卡点击 | Surface-specific Effect 被混合或稀释 |
| 共享直播间 | Treatment 将更多用户送入同一直播间，改变热度、互动和主播行为 | Control 用户也受到直播间状态变化 |
| 有限库存 | Treatment 加速部分商品售罄，使 Control 面对不同商品可用性 | Treatment 与 Control 的机会集合不同 |
| 商家侧反馈 | 曝光变化促使商家调价、补货、投放或更换商品 | 短期 Direct Effect 与长期 Equilibrium Effect 不同 |
| 共享计算或配额 | 新召回通道占用候选、精排或缓存预算 | 其他策略效果随 Treatment 流量占比变化 |
| 社交与内容供给 | 用户行为改变创作者或主播供给 | 跨用户 Spillover |

需要区分三个问题：

```text
Experiment Overlap
= 同一用户同时参加多个实验

Within-user Cross-surface Effect
= 一个入口的 Treatment 改变同一用户在另一个入口的行为

Cross-unit Interference
= 一个用户、商品、直播间或商家的 Treatment 改变其他实验单位的结果
```

实验层和 Factorial Design 主要处理第一个问题并刻画策略交互；保持用户跨 Surface Assignment 一致可以减少第二个问题；第三个问题通常需要改变随机化设计。

---

<a name="sec-11-2"></a>

### 11.2 设计选择

| 主要问题 | 候选设计 | 关键代价或限制 |
|---|---|---|
| 个性化排序，几乎不改变共享资源 | User-level Randomization | 仍需保持跨设备和跨 Surface 身份一致 |
| 直播间内所有观众共享房间状态 | Live-room / Host-level Cluster Randomization | Room 数量较少，房间异质性高 |
| 商家工具或供给策略 | Seller-level Randomization | 消费者会跨商家浏览，可能仍有 Spillover |
| 地区内供需或库存强耦合 | Geo Cluster 或 Geo × Time Switchback | Cluster 少、方差高、存在时间趋势 |
| 平台状态可快速切换且 Carryover 较短 | Switchback | 需要随机时段、Washout 和时序推断 |
| 同时影响消费者与商家 | Two-sided Randomization / Multiple Randomization Design | 设计与解释复杂，需明确 Direct / Spillover Estimand |
| 已知关系网络 | Graph Cluster Randomization | Cluster 边界仍可能存在跨组连接 |

随机化层级越粗，通常越能减少干扰，但可用独立 Cluster 数越少、统计功效越低。选择设计时应先明确希望估计的是 Direct Effect、Spillover Effect、某个 Saturation 下的效果，还是全量上线后的 Equilibrium Effect。

Cluster Bootstrap 只能在给定设计下估计不确定性；若用户级随机化本身因库存或供给干扰而产生偏差，事后按用户或商家重采样都不能恢复正确反事实。

---

<a name="sec-11-3"></a>

### 11.3 Switchback Experiment

Switchback 适合具有强网络效应、资源共享或供需耦合的系统。

典型场景：

- 出行派单
- 外卖配送
- 广告竞价
- Marketplace Matching
- 实时资源调度
- 直播流量分配
- 共享库存或配额会随全局 Treatment 状态快速变化的策略

在日期、地区和时段分层后，对每组匹配时间块做受约束随机化。例如规定四个时间块中恰有两个 Treatment，某次随机实现可能是：

```text
09:00–10:00 → Treatment
10:00–11:00 → Control
11:00–12:00 → Control
12:00–13:00 → Treatment
```

上面只是一个随机实现，不是固定顺序模板。不能简单采用永远交替的 Control / Treatment 顺序，因为小时、星期和活动节奏可能与处理完全重合；分层、随机 Block Sequence、Carryover 处理和推断方式都应在实验前确定。

Switchback 的关键风险：

- Carryover Effect
- 时间趋势
- 高峰与低峰差异
- 时段之间不独立
- 切换策略需要冷却时间

如果新策略会对后续时间段产生持续影响，需要设置 Burn-in / Washout，并根据实际随机化的 Geo × Time Block 进行推断。块太短会增加 Carryover Bias，块太长会减少独立切换次数并降低 Power。

Switchback 不是所有 Marketplace Effect 的通用答案。商品补货、商家学习、用户囤货或主播行为可能持续数天甚至更久；若系统无法在合理时间内回到稳定状态，需要更长周期的 Cluster / Geo Design 或明确建模 Carryover。

---

<a name="sec-11-4"></a>

### 11.4 跨入口归因与延迟转化

短视频或直播曝光可能先引导用户进入商品页，订单在数小时或数天后发生，退款又更晚成熟。实验必须提前固定：

- Exposure / Click / Order 的去重键；
- Same-session、Last-touch 或固定 Lookback Attribution Rule；
- Order Conversion Window；
- Cancellation / Refund Maturity Window；
- 跨设备和跨 Surface 的身份合并规则；
- 实验结束后的 Data Freeze Date。

用于决策的用户级 GMV 或订单指标通常按 Assignment 归因，而不是只分析点击 Treatment 商品的人。只保留点击者、进店者或下单者会按 Post-treatment Behavior 选择样本，破坏随机化。

若需要理解漏斗机制，可以同时报告：

```text
ITT: Assigned eligible users 的订单与 Net GMV
Triggered: 由实验前条件定义、确实有机会触发策略的用户
Diagnostic: Exposure → Click → Product Page → Order → Refund
```

Diagnostic Funnel 用于解释机制，不能用下游显著而上游不显著来反向更换 Primary Metric。

---

<a name="sec-12"></a>

## 12. 放量、回滚与长期测量｜Ramp-up, Rollback, and Holdout

<a name="sec-12-1"></a>

### 12.1 Ramp-up 与灰度发布｜Gradual Rollout

A/B Test 通过后，通常不会直接从小流量跳到 Full Rollout，而会进入 Ramp-up。

```text
A/B Test Passed
↓
5%
↓
10%
↓
25%
↓
50%
↓
100%
```

A/B Testing 在这里主要回答：

```text
新策略是否值得上线？
```

Ramp-up 则继续回答：

```text
随着流量扩大，
收益是否仍然存在？
风险是否仍然可控？
```

Ramp-up 阶段需要重点观察：

- Effect Size 是否稳定
- Guardrail Metrics 是否安全
- SRM 与 Logging Coverage 是否正常
- 关键用户 Segment 是否出现异质性风险
- Content / Creator / Item Distribution 是否异常漂移
- 系统性能是否开始影响业务指标

Ramp-up 的完整分析框架单独记录在：

[**Ramp-up**](./ramp-up.md)

---

<a name="sec-12-2"></a>

### 12.2 回滚｜Rollback

如果实验出现严重异常，应迅速恢复旧策略。

需要回滚的典型情况：

- Crash 或 Error Rate 显著增加
- Latency 超过服务目标
- 主要业务指标明显下降
- 负反馈、投诉或退款快速增加
- 分流或日志出现严重异常
- 模型输出分布异常
- 内容安全或合规风险

成熟实验平台通常应支持：

- One-click Rollback
- 参数级开关
- 模型版本回退
- 自动熔断
- 实验审计日志
- 回滚后指标监控

实验代码和生产代码应保持可逆，避免新逻辑上线后无法恢复旧行为。

---

<a name="sec-12-3"></a>

### 12.3 Holdout 与反转实验｜Holdout and Reverse Experiment

#### Global Holdout

Global Holdout 长期不接收某一系列实验策略。

例如：

```text
95% Users → Normal Experimentation
5% Users  → Global Holdout
```

用于衡量：

- 推荐团队整体迭代的长期增量
- 多个实验累积后的真实效果
- 长期留存和生态影响
- 季节性变化与算法变化的区别

#### Layer Holdout

只针对某一个实验层保留旧策略，例如：

```text
Ranking Layer Holdout
Ads Layer Holdout
Creator Ecosystem Holdout
```

#### Reverse Experiment

当新策略已经成为默认策略时，可以保留少量旧策略流量：

```text
95% → New Strategy
5%  → Old Strategy
```

用于继续观察长期差异。

#### Holdout 风险

- 长期保留旧策略可能损害这部分用户体验
- Holdout 用户可能逐渐不再具有代表性
- 用户跨设备或账号可能造成污染
- 其他产品变化可能使旧策略无法兼容
- 需要定期评估是否重置 Holdout

Holdout 是可选的长期测量机制，不是每个模型上线后的必经步骤。

---

<a name="sec-13"></a>

## 13. 实验案例：推荐排序模型｜Case Study: Ranking Model

<a name="sec-13-1"></a>

### 13.1 背景

当前模型主要优化 CTR，导致用户点击增加，但平均观看时长增长有限。

新模型加入：

- Watch Time Prediction
- Completion Probability
- Negative Feedback Prediction
- Content Diversity Constraint

目标是提高深度消费，而不是只提高点击。

<a name="sec-13-2"></a>

### 13.2 实验假设

```text
新排序模型将提高人均有效观看时长，
同时 CTR 不显著下降，
负反馈率和系统延迟保持稳定。
```

<a name="sec-13-3"></a>

### 13.3 实验设计

| 项目 | 设计 |
|---|---|
| Experiment Unit | User ID |
| Layer | Ranking Layer |
| Control | Existing Ranking Model |
| Treatment | Multi-objective Ranking Model |
| Initial Traffic | Control 5%, Treatment 5% |
| Primary Metric | Average Qualified Watch Time per User |
| Secondary Metrics | CTR, QVR, Completion Rate, Sessions per User |
| Guardrails | Negative Feedback Rate, D1 Retention, P95 Latency, Crash Rate |
| Duration | At least 14 days |
| Randomization | Hash(User ID + Experiment Salt) |

<a name="sec-13-4"></a>

### 13.4 实验前检查

- 实验平台和随机化链路处于正常状态
- 无 SRM
- 用户历史 Watch Time 基本平衡
- App Version 分布基本平衡
- 日志完整率正常
- Control 与 Treatment 模型服务延迟稳定

<a name="sec-13-5"></a>

### 13.5 假设结果

| 指标 | Relative Lift | 结果 |
|---|---:|---|
| Average Qualified Watch Time | +2.4% | 显著提升 |
| CTR | -0.3% | 小幅下降 |
| QVR | +1.8% | 显著提升 |
| Completion Rate | +1.1% | 提升 |
| Negative Feedback Rate | -0.6% | 改善 |
| D1 Retention | +0.2% | 无明确结论 |
| P95 Latency | +3 ms | 在护栏范围内 |

<a name="sec-13-6"></a>

### 13.6 结果解释

虽然 CTR 小幅下降，但：

- 有效观看时长提升
- 完播率提升
- 负反馈下降
- 延迟仍在允许范围内

这说明模型减少了部分低质量点击，提高了深度消费质量。

如果业务目标是长期内容消费，该实验可以继续放量。

<a name="sec-13-7"></a>

### 13.7 放量计划

```text
5%
↓
10%
↓
25%
↓
50%
↓
100%
```

每个阶段重新检查：

- SRM
- Watch Time
- Negative Feedback
- Retention
- Latency
- 内容类别分布
- 创作者曝光分布

---

<a name="sec-14"></a>

## 14. 工业案例：三类电商推荐实验

以下均为实验设计模板，不代表任何真实业务配置或实验结果。案例中的“决策”描述的是预先定义的判断规则，而不是已经发生的上线结论。

<a name="sec-14-1"></a>

### 14.1 短视频商品内容排序实验

| 实验卡片字段 | 设计 |
|---|---|
| 业务假设 | 多目标排序在保持内容消费质量的同时，提高成熟的 Net GMV per Assigned Eligible User |
| Control / Treatment | Control 使用当前排序；Treatment 加入购买意图、商品质量和长期负反馈目标的新排序 |
| 随机化单位 | User ID，并保持跨设备和相关入口的 Assignment 稳定 |
| Eligibility | 由实验前条件定义、具备进入短视频商品内容场景机会的用户；不能只保留已曝光或已点击用户 |
| Primary Metric | 成熟的 Net GMV per Assigned Eligible User；也可预先选择 Orders per Assigned Eligible User，但不能看结果后切换 |
| Secondary / Diagnostic | 商品 Exposure Rate、Product CTR、商品页到达率、Add-to-Cart Rate、Order CVR |
| Guardrail | 内容负反馈、有效观看时长、P95 / P99 Latency、取消率、退款率、Seller Exposure Concentration |
| Attribution / Maturity | 按 Assignment 归因，固定订单转化窗口、取消与退款成熟窗口、跨入口身份合并规则和 Data Freeze Date |
| 常见误判 | Treatment 改变了谁看到或点击商品；只分析 Exposed / Clicked User 会产生 Post-treatment Selection，CTR 提升也不等于净交易价值提升 |
| 决策 | Assignment SRM 与日志链路通过，Primary 的成熟区间达到业务阈值，且内容、系统和交易 Guardrail 均未越界，才进入 Ramp-up |

<a name="sec-14-2"></a>

### 14.2 直播内容流与直播间分发实验

| 实验卡片字段 | 设计 |
|---|---|
| 业务假设 | 新的直播间召回或流量分配提高合格观众的成熟交易价值，同时不损害房间体验、主播生态和库存可用性 |
| Control / Treatment | Control 使用当前房间分发；Treatment 调整直播间候选、排序目标或流量配额 |
| 随机化单位 | 若观众只接受个性化排序且共享状态影响很弱，可用 User ID；若 Treatment 改变房间热度、主播行为或全局配额，应优先考虑 Live Room / Host Cluster、Geo-Time Switchback 或 Saturation Design |
| Eligibility | 实验前定义的可分发直播间、Host、地区与时间块，以及相应合格观众；不能按进入 Treatment 房间后再筛选 |
| Primary Metric | Net GMV per Eligible Viewer 或每个随机化 Cluster 的成熟交易价值；Point Estimate 与方差口径必须和设计一致 |
| Secondary / Diagnostic | Room Entry Rate、Qualified Watch Time、Order Rate、Room Occupancy、Host / Room Exposure Share |
| Guardrail | Complaint Rate、Refund Rate、P99 Latency、Room Concentration、主播侧流量不平等、Out-of-stock Exposure |
| Attribution / Maturity | 按实际 Assignment Block 归因；Switchback 预先固定 Burn-in / Washout、Carryover 处理、订单与退款成熟窗口 |
| 常见误判 | 用户级 Control 可能进入已被 Treatment 观众改变的直播间；按用户计算普通 Standard Error 或 User Bootstrap 既低估相关性，也不能修复 Control Contamination |
| 决策 | 根据 Direct / Spillover / Equilibrium Estimand 报告 Cluster 或 Randomization-based CI；Carryover、库存和主播反馈可接受后才扩大流量 |

<a name="sec-14-3"></a>

### 14.3 商城商品卡召回或排序实验

| 实验卡片字段 | 设计 |
|---|---|
| 业务假设 | 新召回或多目标排序在不增加缺货、履约和退款风险的前提下，提高商城访问用户的成熟 Net GMV |
| Control / Treatment | Control 使用当前商品候选与排序；Treatment 使用新的召回模型、精排模型或明确的一体化策略 |
| 随机化单位 | User ID；若直接改变商家供给、库存分配或定价工具，则重新评估 Seller / Item / Geo Cluster |
| Eligibility | 实验前定义的商城合格访问用户或请求；主分析不能只保留产生商品卡 Impression、Click 或 Order 的用户 |
| Primary Metric | 成熟的 Net GMV per Assigned Eligible User，或预先指定的 Paid Orders per Assigned Eligible User |
| Secondary / Diagnostic | Candidate Coverage、Zero-result Rate、Product CTR、Add-to-Cart、Payment CVR、AOV、Price / Category Mix |
| Guardrail | Recall / Ranking Latency、Out-of-stock Exposure、Cancellation、Refund、Complaint、Seller Exposure Concentration |
| Attribution / Maturity | 固定商品卡曝光与订单去重键、跨设备身份、支付归因窗口、取消 / 退款 Maturity Window 和 Data Freeze Date |
| 常见误判 | 点击上涨可能来自低价或强吸引但低购买质量的商品；新近订单尚未退款时，Gross GMV 与 Refund Rate 会给出过度乐观信号 |
| 决策 | 使用同等成熟的 Order Cohort 评估 Net Metric；若成熟收益未达到阈值，或库存、履约、退款与商家集中度恶化，则停止或迭代 |

<a name="sec-14-4"></a>

### 14.4 召回 × 精排的 2 × 2 Factorial

| 实验卡片字段 | 设计 |
|---|---|
| 业务假设 | 新召回通道与新精排能够联合上线，且组合收益可能协同或抵消，因此需要直接估计 Interaction |
| Treatment Factors | 因子 A 为当前 / 新召回，因子 B 为当前 / 新精排，形成 Baseline、Recall Only、Ranking Only、Combined 四个 Cell |
| 随机化单位 | 同一个稳定 User ID 上独立随机化 A 与 B，并记录 Joint Assignment、Joint Exposure 和四个 Cell 的 Eligibility |
| Eligibility | 在 Assignment 前定义、同时具备两项策略生效机会的用户；不能按某条新召回是否返回候选再筛选 |
| Primary Metric | 成熟的 Net GMV per Assigned Eligible User；Interaction 使用预先声明的 Absolute Effect Scale |
| Secondary / Diagnostic | Candidate Coverage、Recall Source Mix、Ranking Score Calibration、CTR、Order CVR、四个 Cell 的漏斗 |
| Guardrail | Candidate Quality、P99 Latency、缓存与精排预算、内容或商品多样性、缺货、取消和退款 |
| Attribution / Maturity | 四个 Cell 使用相同订单归因、成熟窗口和 Data Freeze Date；交互检验单独规划 MDE 与 Power |
| 常见误判 | `A Only > 0` 且 `B Only > 0` 不能推出 Combined 等于两者之和；正交 Assignment 也不代表业务效果可加 |
| 决策 | 同时报告四个 Cell Mean、条件效应、平均主效应和 Interaction Contrast；联合上线以 Combined 的成熟收益与 Guardrail 为准，而不是机械相加两个独立 Lift |

---

<a name="sec-15"></a>

## 15. 实验分析代码示例｜Experiment Analysis Example

下面是一个简化的用户级实验分析示例。

```python
REQUIRED_COLUMNS = {
    "user_id",
    "experiment_group",
    "watch_time",
    "impressions",
    "clicks",
}

def validate_experiment_data(data: pd.DataFrame) -> None:
    missing_columns = REQUIRED_COLUMNS - set(data.columns)

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {sorted(missing_columns)}"
        )

    invalid_groups = set(
        data["experiment_group"].dropna().unique()
    ) - {
        "control",
        "treatment",
    }

    if invalid_groups:
        raise ValueError(
            f"Unexpected experiment groups: {sorted(invalid_groups)}"
        )

def aggregate_to_user_level(data: pd.DataFrame) -> pd.DataFrame:
    """
    将事件级数据聚合到用户级，
    确保分析粒度与用户级随机化一致。
    """
    validate_experiment_data(data)

    user_level = (
        data.groupby(
            ["user_id", "experiment_group"],
            as_index=False,
        )
        .agg(
            watch_time=("watch_time", "sum"),
            impressions=("impressions", "sum"),
            clicks=("clicks", "sum"),
        )
    )

    user_level["ctr"] = (
        user_level["clicks"]
        / user_level["impressions"].replace(0, pd.NA)
    )

    return user_level

def compare_watch_time(
    user_level: pd.DataFrame,
) -> dict[str, float]:
    control = user_level.loc[
        user_level["experiment_group"] == "control",
        "watch_time",
    ].dropna()

    treatment = user_level.loc[
        user_level["experiment_group"] == "treatment",
        "watch_time",
    ].dropna()

    if control.empty or treatment.empty:
        raise ValueError("Both groups must contain observations")

    statistic, p_value = ttest_ind(
        treatment,
        control,
        equal_var=False,
    )

    control_mean = float(control.mean())
    treatment_mean = float(treatment.mean())

    absolute_lift = treatment_mean - control_mean
    relative_lift = (
        absolute_lift / control_mean
        if control_mean != 0
        else float("nan")
    )

    return {
        "control_mean": control_mean,
        "treatment_mean": treatment_mean,
        "absolute_lift": absolute_lift,
        "relative_lift": relative_lift,
        "test_statistic": float(statistic),
        "p_value": float(p_value),
    }
```

该代码只用于说明基本流程。

真实工业分析还需要考虑：

- 指标长尾分布
- Bootstrap 或稳健标准误
- CUPED
- 多重检验
- 延迟转化
- 用户污染
- 实验层和交互效应
- 数据缺失与异常值
- Confidence Interval
- 分群异质性

---

<a name="sec-16"></a>

## 16. 实验平台与上线检查｜Platform and Launch Checklist

<a name="sec-16-1"></a>

### 16.1 实验平台架构｜Experimentation Platform Architecture

典型在线实验链路：

```text
User Request
    ↓
Identify Experiment Unit
    ↓
Hash(Unit ID + Salt)
    ↓
Bucket Assignment
    ↓
Experiment Layer
    ↓
Control / Treatment Configuration
    ↓
Recommendation Serving
    ↓
Exposure and Action Logging
    ↓
Data Validation
    ↓
Metric Aggregation
    ↓
SRM and Quality Checks
    ↓
Statistical Analysis
    ↓
Dashboard and Decision
    ↓
Ramp-up or Rollback
```

成熟实验平台通常包括：

- 实验配置中心
- 分层和流量管理
- 参数下发
- 稳定哈希服务
- 实验冲突检测
- 实时护栏监控
- 自动 SRM 检查
- 指标计算平台
- 统计检验服务
- 实验报告和审计
- Ramp-up 和 Rollback 控制

---

<a name="sec-16-2"></a>

### 16.2 实验上线清单｜Experiment Launch Checklist

#### 实验前

- [ ] 明确实验假设
- [ ] 确定 Experiment Unit
- [ ] 明确 Control 和 Treatment
- [ ] 预先指定 Primary Metric
- [ ] 确定 Secondary 和 Guardrail Metrics
- [ ] 计算样本量和 MDE
- [ ] 确定实验周期
- [ ] 检查实验层冲突
- [ ] 评估并记录与同期实验的共同曝光和潜在交互
- [ ] 若联合上线是候选方案，确认是否需要 Factorial Design 和 Interaction MDE
- [ ] 评估库存、直播间、商家与跨 Surface Spillover
- [ ] 确定 Salt 和 Bucket 范围
- [ ] 验证线上与离线分桶一致
- [ ] 确认实验平台和随机化链路处于正常状态
- [ ] 检查埋点和数据链路
- [ ] 固定 Attribution Window、Maturity Window 和 Data Freeze Date
- [ ] 确定回滚方案

#### 实验运行中

- [ ] 检查 SRM
- [ ] 检查组间样本和用户属性
- [ ] 监控 Crash、Error 和 Latency
- [ ] 检查日志缺失和重复
- [ ] 记录流量调整时间
- [ ] 避免使用普通 p-value 频繁提前停止
- [ ] 关注重大活动和系统故障

#### 实验结束后

- [ ] 按预设方法计算实验效果
- [ ] 同时报告 Lift、Confidence Interval 和 p-value
- [ ] 检查 Primary Metric
- [ ] 检查 Guardrail Metrics
- [ ] 分析关键用户分群
- [ ] 检查内容、创作者或商品分布变化
- [ ] 对预先指定的实验对估计 Interaction Effect
- [ ] 判断 Treatment Saturation 或 Marketplace Spillover 是否限制外推
- [ ] 评估业务收益与工程成本
- [ ] 制定 Ramp-up 或 Rollback 计划
- [ ] 保存实验结论和配置
- [ ] 记录与预期不一致的原因

---

<a name="sec-17"></a>

## 17. 常见实验陷阱｜Common Experiment Pitfalls

<a name="sec-17-1"></a>

### 17.1 使用不稳定随机数

同一用户在实验期间切换组，导致实验污染。

<a name="sec-17-2"></a>

### 17.2 使用 Python 内置 `hash()`

不同进程、版本或环境下结果可能不一致，不适合作为跨系统稳定分桶方案。

<a name="sec-17-3"></a>

### 17.3 分析粒度与随机化粒度不一致

用户级随机化却按事件级进行普通独立样本检验，会低估标准误。

<a name="sec-17-4"></a>

### 17.4 忽略 SRM

在分流或数据链路异常时直接解释实验结果。

<a name="sec-17-5"></a>

### 17.5 实验开始后更换主指标

根据结果选择最显著的指标，增加假阳性风险。

<a name="sec-17-6"></a>

### 17.6 样本量不足

实验没有显著结果，不代表策略没有效果，可能只是统计功效不足。

<a name="sec-17-7"></a>

### 17.7 只看 p-value

统计显著不代表业务收益足够大。

<a name="sec-17-8"></a>

### 17.8 频繁查看并提前停止

使用普通固定样本检验反复查看结果，会提高假阳性率。

<a name="sec-17-9"></a>

### 17.9 忽略多重检验

大量指标和分群中容易出现偶然显著。

<a name="sec-17-10"></a>

### 17.10 忽略长期效果

CTR 提升不代表留存、生态或商业价值长期改善。

<a name="sec-17-11"></a>

### 17.11 忽略网络效应

用户、直播间、商品库存、商家和供给侧之间可能相互影响。用户级 A/B Test 在这种情况下不仅可能低估方差，还可能因 Control 被 Treatment 改变而产生有偏 Point Estimate。

<a name="sec-17-12"></a>

### 17.12 直接从小流量推到全量

小流量下未暴露的问题可能在大流量下放大。

<a name="sec-17-13"></a>

### 17.13 将未显著理解为完全相同

`p-value > 0.05` 只表示证据不足，不表示两组完全等价。

如果目标是证明差异足够小，应考虑 Equivalence Test 或 Non-inferiority Test。

---

<a name="sec-18"></a>

## 18. 实验分析工作流

<a name="sec-18-1"></a>

### 18.1 实验前：把问题定义成可检验假设

实验开始前应明确：

```text
Business Problem
↓
Model Change
↓
Expected User Behavior Change
↓
Primary Metric
↓
Guardrail Metrics
↓
Decision Rule
```

例如：

> 新的多目标排序模型通过减少低质量点击，提高 Qualified Watch Time per User，同时 Negative Feedback 和 P95 Latency 不超过预定义风险阈值。

这比“新模型应该更好”更适合在线验证。

<a name="sec-18-2"></a>

### 18.2 实验运行中：先检查 Validity，再看 Lift

推荐的分析顺序：

```text
SRM
↓
Logging / Data Quality
↓
System Health
↓
Primary Metric
↓
Guardrail
↓
Secondary / Diagnostic
↓
Segment Analysis
```

如果 SRM 或 Logging Fail，业务指标不应被直接解释为 Treatment Effect。

<a name="sec-18-3"></a>

### 18.3 实验结束：Readout 不应只有 p-value

一个完整的 Recommendation Experiment Readout 至少包括：

| 项目 | 内容 |
|---|---|
| Hypothesis | 预先定义的实验假设 |
| Population | 实验覆盖用户与资格条件 |
| Primary Metric | Lift、CI、p-value |
| Guardrail | 是否触发风险阈值 |
| Diagnostic | 解释 Primary 变化路径 |
| Segment | 关键用户群异质性 |
| Data Quality | SRM、Logging、Missingness |
| Practical Value | 收益是否达到业务要求 |
| Recommendation | Rollback / Iterate / Ramp-up |

示例结论：

```text
Primary:
Qualified Watch Time +2.1%
95% CI [+1.2%, +3.0%]

Guardrail:
Negative Feedback stable
P95 Latency +4 ms, within threshold

Segment:
No material downside in key markets

Decision:
Proceed to Ramp-up
```

<a name="sec-18-4"></a>

### 18.4 分析边界与工程依赖

实验分析需要理解基础设施如何影响分流、日志、指标和上线决策，但不需要展开到平台实现细节。

分析侧重点包括：

- Experimental Design
- Metric Design
- Statistical Inference
- Data Quality Validation
- Segment Analysis
- Business Interpretation
- Decision Support

工程团队通常负责：

- Online Bucketing Service
- Experiment Configuration Platform
- Serving Infrastructure
- Deployment
- Feature Flags
- Rollback Mechanism

需要能够判断这些系统是否影响实验结论，并与对应 Owner 联合排查。

---

<a name="sec-19"></a>

## 19. 关联文档

- [E-commerce Recommendation Context](./ecommerce-recommendation-context.md)
- [Recommendation System Pipeline](./recommendation-system-pipeline.md)
- [Online Experiment Lifecycle](./online-experiment-lifecycle.md)
- [Recommendation System Metrics](./metrics.md)
- [A/A Testing](./aa-testing.md)
- [Ramp-up](./ramp-up.md)
