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
  - [6.3 正交不代表没有交互作用](#sec-6-3)
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
  - [11.1 常见解决方案](#sec-11-1)
  - [11.2 Switchback Experiment](#sec-11-2)
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
- [14. 实验案例：电商排序与 GMV｜Case Study: Commerce Ranking](#sec-14)
  - [14.1 背景](#sec-14-1)
  - [14.2 指标设计](#sec-14-2)
  - [14.3 假设结果](#sec-14-3)
  - [14.4 结果解释](#sec-14-4)
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
4. 分析粒度需要与随机化粒度一致。

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

大型推荐系统会同时运行大量实验，需要通过实验层管理流量。

典型实验层包括：

```text
Recall Layer
Ranking Layer
Re-ranking Layer
UI Layer
Ads Layer
Commerce Layer
```

<a name="sec-6-1"></a>

### 6.1 同层互斥｜Mutual Exclusion

同一层的实验通常互斥。

例如 Ranking Layer 同时存在：

- Ranking Model A
- Ranking Model B
- Ranking Feature C

同一个用户通常只应进入其中一个实验，避免多个排序变化叠加后无法归因。

```text
Ranking Layer
├── Experiment A
├── Experiment B
└── Experiment C
```

<a name="sec-6-2"></a>

### 6.2 跨层正交｜Orthogonality

不同层可以使用不同 Salt 重新分桶。

同一个用户可能同时进入：

```text
Recall Treatment
+
Ranking Control
+
UI Treatment
```

这样可以提高流量复用效率。

<a name="sec-6-3"></a>

### 6.3 正交不代表没有交互作用

即使两个实验位于不同层，也可能存在 Interaction Effect。

例如：

```text
New Recall Model
+
New Ranking Model
```

组合效果可能不等于两个单独效果之和。

如果怀疑实验存在强交互，可以设计 2 × 2 Factorial Experiment：

| Recall | Ranking | Group |
|---|---|---|
| Old | Old | Control |
| New | Old | Recall Only |
| Old | New | Ranking Only |
| New | New | Combined |

通过四组实验可以估计：

- Recall 的主效应
- Ranking 的主效应
- Recall × Ranking 的交互效应

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

SRM 检查应在分析实验效果之前完成，并且需要在实验运行期间持续执行。

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

以下示例适用于 CTR、CVR、Retention 等比例指标。

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

    return int(control_sample_size) + 1
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
| 二项比例 | CTR、CVR、Retention | Two-proportion Z-test、Chi-square Test |
| 近似连续且分布较稳定 | Usage Time、Session Count | T-test、Welch's T-test |
| 长尾连续指标 | GMV、Revenue、Watch Time | Bootstrap、Delta Method、Winsorized Analysis |
| 用户级比率 | User CTR、Orders per User | User-level Aggregation + T-test / Bootstrap |
| 时间或地区随机实验 | Switchback、Geo Experiment | Cluster-robust Inference、Time-series Analysis |
| 多次中途查看 | Sequential Experiment | Sequential Test、Always-valid Inference |

<a name="sec-10-2"></a>

### 10.2 两比例检验代码

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

一个实验同时观察大量指标或用户分群时，偶然显著的概率会增加。

例如，同时检验 20 个完全无效指标，每个使用 5% 显著性水平，可能自然出现约 1 个假阳性结果。

常见处理方法：

| 方法 | 说明 |
|---|---|
| Bonferroni Correction | 控制严格，方法简单，但可能过于保守 |
| Holm Correction | 比 Bonferroni 更灵活 |
| Benjamini-Hochberg | 控制 False Discovery Rate |
| Pre-specified Primary Metric | 预先确定唯一或少量核心指标 |
| Metric Hierarchy | 先检验主指标，再检验次要指标 |

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

业务监控和统计决策需要区分：

- 可以实时监控 Crash、Latency、严重负反馈
- 不应使用普通 p-value 随意提前宣布实验成功

---

<a name="sec-10-7"></a>

### 10.7 方差降低｜Variance Reduction

指标方差越低，在相同样本量下越容易检测到真实效应。

常见方法：

- 使用实验前指标作为协变量
- 用户级聚合
- 分层随机化
- 去除明显异常日志
- 对极端值进行合理 Winsorization
- 使用 CUPED
- 使用更稳定的指标定义

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

使用 CUPED 时：

- 协变量必须在实验前产生
- 协变量不能被实验策略影响
- 协变量应与目标指标高度相关
- Control 与 Treatment 应使用相同处理逻辑

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

同一用户内部的观测共享兴趣、活跃度、设备和购买能力，因此并非相互独立。如果直接对事件行进行 Ordinary Bootstrap，相当于假设每次曝光都是一个独立实验单位，通常会：

- 低估 Standard Error；
- 产生过窄的 Confidence Interval；
- 增加 False Positive Risk；
- 让高活跃用户的重复行为看起来像更多独立样本。

Cluster Bootstrap 的核心原则是：

> 按独立的随机化单位进行有放回重采样，并保留同一单位内部的全部相关观测。

如果实验按 `user_id` 随机化，就重采样用户；如果按 `seller_id`、城市或时间块随机化，就应在相应层级重采样。

#### 基本算法

假设实验包含 `N` 个独立 Cluster：

1. 从全部 Cluster 中有放回抽取 `N` 次；
2. 某个 Cluster 被抽中几次，它的全部观测就获得几倍权重；
3. 在 Bootstrap Sample 中重新计算 Control 和 Treatment 指标；
4. 计算 Treatment Effect；
5. 重复 `B` 次，得到 Bootstrap Treatment Effect 的经验分布：

$$
\hat{\tau}_{\mathrm{boot}}^{(1)},
\ldots,
\hat{\tau}_{\mathrm{boot}}^{(B)}
$$

对于均值差：

$$
\hat{\tau}=\bar{Y}_T-\bar{Y}_C
$$

Bootstrap Standard Error 为：

$$
\widehat{SE}_{\mathrm{boot}}(\hat{\tau})
=\sqrt{
\frac{1}{B-1}
\sum_{b=1}^{B}
(
\hat{\tau}_{\mathrm{boot}}^{(b)}-
\frac{1}{B}\sum_{c=1}^{B}\hat{\tau}_{\mathrm{boot}}^{(c)}
)^2
}
$$

#### 用户级聚合实现

如果业务指标可以先聚合到用户级，这是最清楚的实现方式：

```python
def ratio_metric(rows):
    numerator = sum(row["numerator"] for row in rows)
    denominator = sum(row["denominator"] for row in rows)
    return numerator / denominator if denominator else float("nan")


def treatment_effect(user_rows):
    treatment = [r for r in user_rows if r["group"] == "treatment"]
    control = [r for r in user_rows if r["group"] == "control"]
    return ratio_metric(treatment) - ratio_metric(control)


def sample_with_replacement(rows, rng):
    return [
        rows[rng.randrange(len(rows))]
        for _ in range(len(rows))
    ]


def cluster_bootstrap(user_rows, rng, repetitions=2_000):
    treatment = [r for r in user_rows if r["group"] == "treatment"]
    control = [r for r in user_rows if r["group"] == "control"]

    if not treatment or not control:
        raise ValueError("both experiment groups must be non-empty")

    effects = []

    for _ in range(repetitions):
        sample = (
            sample_with_replacement(treatment, rng)
            + sample_with_replacement(control, rng)
        )
        effects.append(treatment_effect(sample))

    effects.sort()
    lower = effects[int(0.025 * repetitions)]
    upper = effects[int(0.975 * repetitions)]

    return {
        "effect": treatment_effect(user_rows),
        "ci_lower": lower,
        "ci_upper": upper,
    }
```

代码假设每行已经是一个用户，且包含实验组、指标分子和分母。它计算的是 Ratio of Sums：

$$
CTR=\frac{\sum_u Clicks_u}{\sum_u Impressions_u}
$$

而不是 Average of User-level Ratios：

$$
\frac{1}{N}\sum_u\frac{Clicks_u}{Impressions_u}
$$

两者回答的问题不同，Bootstrap 不能替代 Metric Definition。

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
| BCa CI | 修正 Bias 与 Acceleration | 通常更稳健 | 计算复杂、成本更高 |

实验平台中最常见的是 Percentile CI 或基于 Bootstrap Standard Error 的 Normal CI。选择方法后应保持平台口径稳定，避免根据结果选择更有利的区间。

#### 与 Cluster-robust Standard Error 的区别

| 方法 | 核心思想 | 优势 | 局限 |
|---|---|---|---|
| Cluster Bootstrap | 重采样 Cluster，重新计算完整指标 | 适合复杂、非线性和长尾指标 | 计算成本较高 |
| Cluster-robust SE | 使用 Sandwich Estimator 修正 Cluster 内相关性 | 速度快，适合回归框架 | 依赖大样本渐近近似 |
| Delta Method | 对 Ratio 等函数做一阶 Taylor Expansion | 高效、适合标准 Ratio Metric | 强非线性或重尾时近似可能较差 |

它们不一定产生完全相同的区间。Cluster 数量足够大、指标较规则时结果通常接近；Cluster 较少时，三种方法都需要谨慎，并考虑 small-sample correction 或 Randomization Inference。

#### Cluster 应如何选择

基本原则：

```text
Inference Unit 不应比 Randomization Unit 更细
```

| 随机化设计 | 通常的 Bootstrap Cluster |
|---|---|
| User-level Experiment | `user_id` |
| Seller-level Experiment | `seller_id` |
| Geo Experiment | city / region |
| Switchback Experiment | randomization time block，必要时结合 geographic unit |
| Household-level Assignment | household_id |

如果用户级实验中还存在家庭、社交网络或共享供给造成的跨用户依赖，仅按用户 Cluster Bootstrap 仍可能低估方差。此时需要重新考虑实验设计，而不是机械扩大 Cluster。

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

标准 Cluster Bootstrap 需要重复扫描数据。在超大规模场景中，可以为每个 Cluster 和 Bootstrap Replicate 生成：

$$
w_u^{(b)}\sim Poisson(1)
$$

然后用 `w` 作为聚合权重。Poisson Bootstrap 易于并行和流式计算，是经典有放回 Bootstrap 的工程近似。

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

标准 A/B Testing 通常依赖一个重要假设：一个实验单位接受的处理不会改变另一个实验单位的结果。

但在以下场景中可能不成立：

- 社交推荐
- 创作者与消费者双边平台
- 拼车或配送平台
- 广告竞价
- 游戏匹配
- 直播互动
- 市场供需系统

例如，一部分用户获得新的创作者推荐策略后，可能改变创作者供给，进而影响 Control 用户。

<a name="sec-11-1"></a>

### 11.1 常见解决方案

- Cluster Randomization
- Geo Experiment
- Creator-level Randomization
- Marketplace-level Randomization
- Switchback Experiment
- Two-sided Experiment Design

选择实验设计时，需要考虑策略是否会产生跨用户干扰。

---

<a name="sec-11-2"></a>

### 11.2 Switchback Experiment

Switchback 适合具有强网络效应、资源共享或供需耦合的系统。

典型场景：

- 出行派单
- 外卖配送
- 广告竞价
- Marketplace Matching
- 实时资源调度
- 直播流量分配

基础设计：

```text
09:00–10:00 → Control
10:00–11:00 → Treatment
11:00–12:00 → Control
12:00–13:00 → Treatment
```

为了避免固定时段偏差，通常需要随机安排时间块，并对日期、地区或时间进行分层。

Switchback 的关键风险：

- Carryover Effect
- 时间趋势
- 高峰与低峰差异
- 时段之间不独立
- 切换策略需要冷却时间

如果新策略会对后续时间段产生持续影响，需要设置 Washout Period。

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

## 14. 实验案例：电商排序与 GMV｜Case Study: Commerce Ranking

<a name="sec-14-1"></a>

### 14.1 背景

新商品排序模型提高了商品 CTR，但无法确认是否提高最终商业价值。

<a name="sec-14-2"></a>

### 14.2 指标设计

| 指标类型 | 指标 |
|---|---|
| Primary | Net GMV per User |
| Secondary | Product CTR, Add-to-Cart Rate, Order CVR, AOV, Orders per User |
| Guardrails | Refund Rate, Cancellation Rate, Complaint Rate, Latency |
| Diagnostic | Category Mix, Price Distribution, Seller Exposure Share |

<a name="sec-14-3"></a>

### 14.3 假设结果

```text
Product CTR            +3.0%
Add-to-Cart Rate       +1.2%
Order CVR              -1.5%
AOV                    -2.0%
Gross GMV per User     +0.4%
Net GMV per User       -0.8%
Refund Rate            +1.1%
```

<a name="sec-14-4"></a>

### 14.4 结果解释

虽然 CTR 和加购率提升，但：

- Order CVR 下降
- AOV 下降
- 退款率增加
- Net GMV 下降

可能原因：

- 模型更偏向低价、高点击商品
- 推荐商品吸引点击，但购买意愿较弱
- 商品质量或履约能力较差
- 过度优化短期点击标签

结论：

```text
Do not roll out.
```

下一步可以：

- 将 Net GMV、Order CVR 和 Refund Risk 加入多目标训练
- 对商品质量和履约能力设置约束
- 检查价格区间和类目分布
- 分析新客和老客是否受到不同影响

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
- [ ] 确定 Salt 和 Bucket 范围
- [ ] 验证线上与离线分桶一致
- [ ] 确认实验平台和随机化链路处于正常状态
- [ ] 检查埋点和数据链路
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

用户、创作者、广告主和供给侧之间可能相互影响。

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
