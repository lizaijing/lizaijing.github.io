---
title: "让 Minecraft Agent 真正记住、行动与思考"
subtitle: "从长期记忆、短期行为记忆，到可路由的参数记忆"
description: "从 Optimus-1、Optimus-2 到 Optimus-3：一条以记忆为核心，逐步提升 Minecraft Agent 长序列规划、历史感知控制与 System 1/2 协同能力的研究路线。"
excerpt: "从 Optimus-1、Optimus-2 到 Optimus-3：一条以记忆为核心，逐步提升 Minecraft Agent 长序列规划、历史感知控制与 System 1/2 协同能力的研究路线。"
date: 2026-07-22
lang: zh
translation_key: memory-centric-minecraft-agent
stats_key: memory-centric-minecraft-agent
permalink: /blog/zh/memory-centric-minecraft-agent/
reading_time: "15 min read"
tags:
  - Minecraft Agent
  - Memory
  - MLLM
cover: /images/blog/memory-centric-minecraft-agent/cover-memory-centric-minecraft-agent.png
cover_alt: "从长期记忆、短期行为记忆到参数记忆的 Minecraft Agent 研究路线"
---

Minecraft 是研究通用智能体最有代表性的开放世界之一。

一个看似简单的任务，例如“制作一把钻石剑”，实际上要求智能体完成一条很长的因果链：理解合成关系、观察当前环境与背包、规划材料依赖、连续执行鼠标和键盘动作、判断子任务是否完成，并在掉入洞穴、资源不足或路线受阻时及时反思和重规划。

因此，在 Minecraft 中构建 Agent，真正困难的并不只是“生成下一步动作”，而是让 Agent 在持续交互中回答三个问题：

> 我过去学到了什么？  
> 我刚刚做过什么，现在执行到哪里？  
> 面对当前任务，我应该调用哪一种能力，并投入多少推理计算？

围绕这些问题，我们以**记忆机制**为主线，逐步推进了三项工作：

- **Optimus-1**：建立长期记忆，让 Agent 积累并检索世界知识与历史经验；
- **Optimus-2**：建立短期行为记忆，让低层策略理解历史观察—动作序列和当前执行进度；
- **Optimus-3**：把共享知识和任务能力组织进可路由的专家参数，使同一个端到端模型能够兼顾 System 1 的快速行动与 System 2 的深度推理。

如果把三篇工作放在同一条发展线上，它们对应的是三种不同时间尺度的记忆：

**Long-Term Memory → Working Memory → Parametric Memory**

也对应 Agent 能力的三次推进：

**记住知识与经验 → 记住正在发生的行为 → 在模型内部选择应该调用的能力**

需要说明的是，“参数记忆”是我在回顾这条研究路线时使用的统一表述。Optimus-3 论文将其描述为 Dual-Router Aligned Mixture-of-Experts：共享知识专家和任务专家通过参数空间保存不同类型的能力，而路由器负责选择这些能力应当如何被激活。

---

## 第一阶段：Optimus-1——让 Agent 从过去的知识与经验出发

> **论文 · NeurIPS 2024**  
> [Optimus-1: Hybrid Multimodal Memory Empowered Agents Excel in Long-Horizon Tasks](https://proceedings.neurips.cc/paper_files/paper/2024/hash/5949a8750a110ce1f0631b1776c500a2-Abstract-Conference.html)

### 为什么长序列任务需要显式记忆？

早期 Minecraft Agent 已经能够借助 LLM 或 MLLM 进行任务规划，也可以调用 STEVE-1 一类策略生成鼠标和键盘动作。但它们在复杂长序列任务中仍然频繁失败。

一个重要原因是：**Agent 没有形成可以持续积累和主动调用的长期记忆。**

Minecraft 中的世界知识并不是互相独立的事实，而是一个具有严格依赖关系的网络。制作钻石剑不仅需要知道“两颗钻石和一根木棍”，还需要知道必须先制作工作台、木镐、石镐和铁镐，才能到达可以开采钻石的工具等级。

与此同时，环境交互也充满偶然性。Agent 可能在砍树时掉入洞穴，在寻找矿石时进入水中，或者在材料尚未准备好时错误地进入下一步。面对这些情况，仅依靠通用模型的参数知识，很难稳定地产生可执行计划；仅保存成功轨迹，也无法告诉 Agent 怎样识别和避开过去的失败。

Optimus-1 的核心观点是：

> 长序列任务需要两类长期记忆：描述世界规律的知识记忆，以及记录任务执行过程的经验记忆。

### HDKG：把世界知识凝练为层次化有向图

Optimus-1 首先提出 **Hierarchical Directed Knowledge Graph（HDKG）**。

在 HDKG 中：

- 节点表示 Minecraft 中的物体、工具和材料；
- 有向边表示物体之间的制作或获取依赖；
- 针对目标物体检索相应子图；
- 再通过拓扑排序得到完成任务所需的材料关系与执行顺序。

例如，当任务是制作钻石剑时，HDKG 不只是返回最终配方，而是展开从木材、工作台、基础工具，到铁镐和钻石的完整依赖路径。

这使知识不再隐式地藏在模型参数里，而是成为一个可查询、可更新、可解释的外部结构。

Knowledge-Guided Planner 可以一次性读取目标相关子图，再结合当前游戏画面生成完整的子目标序列。与每执行一步就重新询问下一步相比，这种规划方式更加完整，也更符合长序列任务的层级结构。

### AMEP：把成功与失败都凝练为多模态经验

仅有配方知识还不够。相同的计划在不同环境中可能产生完全不同的执行结果。

Optimus-1 因此提出 **Abstracted Multimodal Experience Pool（AMEP）**，用于保存和检索历史任务中的多模态经验。

AMEP 记录的不只是文本计划，还包括：

- 环境与 Agent 状态；
- 当前任务和子目标；
- 关键视频帧；
- 执行前后的视觉变化；
- 成功、继续执行或需要重规划的结果。

为了避免直接保存完整视频带来的存储和检索负担，Optimus-1 对视觉轨迹进行动态摘要：先以固定频率筛选视频帧，再通过滑动图像缓冲区去除重复画面，并利用 MineCLIP 衡量视觉内容与文本子目标之间的相关性。

最终存入 AMEP 的不是冗长录像，而是能够代表任务进展和关键状态变化的经验片段。

更重要的是，AMEP 同时存储**成功案例和失败案例**。

成功案例告诉 Agent：“类似任务在什么状态下已经完成。”  
失败案例则告诉 Agent：“哪些视觉状态意味着当前策略已经失效，需要及时改变计划。”

这使经验不再只是可模仿的范例，也成为可用于诊断错误的参照。

### Knowledge-Guided Planning 与 Experience-Driven Reflection

基于 HDKG 和 AMEP，Optimus-1 构建了三个相互配合的模块：

- **Knowledge-Guided Planner**：结合当前画面和 HDKG，生成长序列子目标；
- **Action Controller**：使用 STEVE-1 将子目标转化为鼠标与键盘控制；
- **Experience-Driven Reflector**：周期性检索 AMEP，判断当前子任务状态。

Reflector 将状态划分为三类：

- **COMPLETE**：当前子目标已完成，可以进入下一步；
- **CONTINUE**：执行尚未结束，但当前状态仍然合理；
- **REPLAN**：任务已经陷入失败或危险状态，需要重新规划。

因此，Optimus-1 形成了一个由记忆驱动的闭环：

**知识指导计划，经验指导反思，反思再触发重规划。**

<figure class="blog-figure">
  <img
    src="/images/blog/memory-centric-minecraft-agent/optimus-1-framework.png"
    alt="Optimus-1 框架图"
    loading="lazy"
    decoding="async"
  >
  <figcaption>
    图 1. Optimus-1。HDKG 为长序列规划提供结构化世界知识，AMEP 为反思和重规划提供成功与失败的多模态经验。
  </figcaption>
</figure>

### 非参数学习：通过扩展记忆实现自我演化

Optimus-1 还提出了 “free exploration–teacher guidance” 的非参数学习方式。

在自由探索阶段，多个 Agent 在随机环境中执行任务，并共享同一个 HDKG 和 AMEP。环境反馈不断补充新的配方知识、成功经验和失败经验。

在教师指导阶段，Agent 再学习少量更复杂的长序列任务，将新的高阶知识和完整执行过程加入记忆。

整个过程不需要更新 MLLM 参数。Agent 的能力随着外部记忆扩展而逐步增强。

这让 Optimus-1 展示出一种很有吸引力的学习方式：

> 模型本身可以保持稳定，而 Agent 通过持续积累知识和经验不断成长。

在 67 个长序列任务组成的基准上，Optimus-1 在多个任务组中明显优于已有 Agent；消融实验也表明，规划、反思、知识和经验四个部分共同构成了长序列能力。

### Optimus-1 留下的问题

Optimus-1 解决了“过去的知识和经验如何被利用”，但低层执行仍然依赖 STEVE-1。

对于 Action Controller 来说，当前子目标和当前视觉观察仍然是最直接的条件。虽然策略可能具有一定的时间建模能力，它并没有显式地把“历史动作如何改变观察”“任务从开始到现在经历了什么”压缩成可供决策使用的行为状态。

这意味着 Agent 可以知道长远目标，也可以从长期经验中反思，但在每一个动作时刻，它仍可能缺少一种清晰的短期记忆：

> 我刚才做了什么？这些动作造成了什么变化？当前行为执行到哪个阶段？

这正是 Optimus-2 试图解决的问题。

---

## 第二阶段：Optimus-2——让低层策略拥有短期行为记忆

> **论文 · CVPR 2025**  
> [Optimus-2: Multimodal Minecraft Agent with Goal-Observation-Action Conditioned Policy](https://openaccess.thecvf.com/content/CVPR2025/html/Li_Optimus-2_Multimodal_Minecraft_Agent_with_Goal-Observation-Action_Conditioned_Policy_CVPR_2025_paper.html)

### 从“记住任务”走向“记住执行过程”

Optimus-1 中，MLLM 负责高层规划，STEVE-1 负责低层动作。这个层级架构使长序列任务成为可能，但性能瓶颈也逐渐从 Planner 转移到了 Policy。

现有 goal-conditioned policy 通常把目标表示与当前视觉特征结合，再预测下一步动作。但它们没有充分显式建模两个关键关系：

1. **动作与观察之间的因果关系。** 当前画面是过去动作与环境交互的结果；
2. **开放式子目标与完整观察—动作历史之间的关系。** 子目标描述的是一段行为，而不是某一帧图像。

如果只根据当前观察预测动作，Agent 很难知道自己已经尝试过什么，也很难区分视觉相似但执行阶段不同的状态。

Optimus-2 因此把研究重点推进到低层控制：

> 一个可靠的动作策略，不仅要理解目标和当前画面，还要把从任务开始到当前时刻的观察—动作历史组织成行为记忆。

### GOAP：Goal、Observation 与 Action 的联合条件策略

Optimus-2 保留了“高层规划器 + 低层控制器”的总体结构。

MLLM-based Planner 首先根据任务和当前画面生成一组子目标，随后由新的 **Goal-Observation-Action Conditioned Policy（GOAP）** 依次执行。

GOAP 由两个核心部分组成：

- **Action-Guided Behavior Encoder**：建模历史观察—动作序列；
- **MLLM Backbone**：将开放式语言子目标与行为 token 对齐，并自回归预测动作。

相较于只把目标 embedding 加到视觉特征上，GOAP 把目标、观察和动作视为一个互相依赖的整体。

### Causal Perceiver：让动作解释观察

Action-Guided Behavior Encoder 首先使用 **Causal Perceiver** 建模同一时刻的观察—动作关系。

它以视觉特征作为 Query，以动作 embedding 作为 Key 和 Value，通过 cross-attention 将动作信息写入视觉表示。

这一步的重要意义是：模型不再把画面视为孤立输入，而是尝试理解：

> 当前观察中的变化，是由怎样的历史动作造成的？

例如，镜头朝向改变、物体被破坏、方块进入背包，都是动作与环境交互后的结果。只有把动作和观察联系起来，策略才能形成更接近“行为”的表示。

### History Aggregator：把完整历史压缩成固定长度行为 token

随后，Optimus-2 使用 **History Aggregator** 建模时间维度上的长期依赖。

在每个时间步：

- 当前行为 token 与历史行为 token 通过 history-attention 交互；
- 当前观察—动作信息被写入更新后的行为 token；
- Historical Memory Bank 根据相邻特征相似度对历史 token 进行聚合和压缩；
- 最终历史长度保持固定，避免随任务持续执行而无限增长。

这样，固定数量的 behavior tokens 就可以表示从任务开始到当前时刻的观察—动作历史。

这是一种典型的短期或工作记忆：

- 它随每一步交互更新；
- 它服务于当前行为决策；
- 它保留早期关键信息；
- 它把长轨迹压缩为可实时使用的固定长度状态。

### MLLM Policy：把语言目标与行为历史对齐

获得 behavior tokens 后，GOAP 将三类信息共同送入 MLLM：

- 当前子目标的文本 token；
- 当前观察的图像 token；
- 历史观察—动作序列形成的 behavior token。

MLLM 对这些信息进行联合建模，并通过 VPT action head 输出鼠标和键盘动作。

因此，Optimus-2 不再只回答“在这张图里应该做什么”，而是回答：

> 为了完成当前语言目标，结合我从开始到现在的行为历史，下一步应该做什么？

<figure class="blog-figure">
  <img
    src="/images/blog/memory-centric-minecraft-agent/optimus-2-framework.png"
    alt="Optimus-2 框架图"
    loading="lazy"
    decoding="async"
  >
  <figcaption>
    图 2. Optimus-2。Action-Guided Behavior Encoder 将动作因果信息和历史观察序列压缩为固定长度行为 token，MLLM 再将其与开放式子目标对齐以生成低层动作。
  </figcaption>
</figure>

### MGOA：为目标—观察—动作联合学习构建数据

为了训练 GOAP，Optimus-2 进一步构建了 **Minecraft Goal-Observation-Action（MGOA）** 数据集。

MGOA 包含：

- 25,000 段视频；
- 8 类原子任务；
- 约 3,000 万组对齐的 goal-observation-action 数据。

数据通过自动化流程构建，不依赖逐帧人工标注。

实验表明，Optimus-2 在原子任务、长序列任务和开放式子目标任务上都取得了更好的表现。论文报告，相较此前方法，其平均提升分别约为 27%、10% 和 18%。

### 从长期经验检索到实时行为记忆

Optimus-2 延续了 Optimus-1 的记忆主线，但记忆进入系统的位置发生了变化。

在 Optimus-1 中，memory 主要服务于高层规划与反思：

- HDKG 回答“任务依赖是什么”；
- AMEP 回答“过去遇到类似情况时发生了什么”。

在 Optimus-2 中，memory 开始直接进入动作策略：

- Causal Perceiver 建模动作如何产生当前观察；
- Historical Memory Bank 保存并压缩执行历史；
- behavior tokens 告诉策略当前行为已经发展到什么状态。

因此，记忆从**任务级长期记忆**进一步延伸为**动作级短期记忆**。

但 Optimus-2 仍然采用高层 Planner 和低层 Policy 分离的结构。要让 Agent 同时具备 Captioning、Embodied QA、Planning、Grounding、Reflection 和 Action，通常还需要连接多个模块。

更进一步的问题由此出现：

> 能否用一个统一的端到端模型，同时完成高频低延迟行动和低频深度推理，并让不同任务之间既共享知识又互不干扰？

---

## 第三阶段：Optimus-3——让记忆进入专家参数与计算路径

> **论文 · arXiv 预印本**  
> [Optimus-3: Dual-Router Aligned Mixture-of-Experts Agent with Dual-Granularity Reasoning-Aware Policy Optimization](https://arxiv.org/abs/2506.10357)

### System 1 与 System 2 的结构性冲突

一个真正通用的 Minecraft Agent 需要两种看似矛盾的能力。

**System 1** 对应高频、快速、反射式的视觉运动控制。动作必须低延迟地产生，否则 Agent 无法顺畅移动、调整视角或操作物体。

**System 2** 对应低频、深度、审慎的认知过程，包括：

- 长序列规划；
- 视觉定位；
- Embodied QA；
- 任务状态反思；
- 基于当前环境进行主动感知与验证。

现有分层 Agent 可以为这些能力逐个增加模块，但系统会越来越复杂，模块之间的接口也容易产生误差。

端到端 MLLM 虽然能够统一输入输出，却面临另一个问题：所有任务经过相同参数和相同层数。

如果统一采用深层推理，动作生成会太慢；如果统一采用浅层计算，规划和反思又不够充分。与此同时，Action、Grounding 和 Planning 等任务具有不同输出形式，共享同一组稠密参数还会产生梯度干扰。

Optimus-3 的目标因此不再只是增加一种记忆，而是重新组织模型内部的能力：

> 让不同任务拥有可区分的参数空间，同时让不同认知模式拥有可变化的推理深度。

### 从 System 1 轨迹生成 System 2 推理数据

在模型架构之前，Optimus-3 首先解决训练数据问题。

Minecraft 中存在大量动作轨迹，但 Planning、Grounding、Reflection 等 System 2 推理轨迹非常稀缺。直接使用通用 MLLM 自动标注，又容易因为缺少 Minecraft 配方、物理规则和环境状态而产生幻觉。

Optimus-3 因此提出 **Knowledge-Enhanced Automated Data Generation Pipeline**。

这条数据流水线将多个知识来源作为约束：

- 使用领域知识图保证合成路径的拓扑正确性；
- 使用专家策略执行子目标并生成动作轨迹；
- 使用环境反馈验证任务是否成功；
- 使用 Agent 状态、背包和周围物体作为视觉描述的事实依据；
- 使用 Grounding DINO 等专家模型提供精确定位标注；
- 使用环境反馈辅助生成反思状态。

通过这些约束，原始 System 1 交互轨迹被转换为包含 Planning、Captioning、Embodied QA、Grounding、Reflection 和 Action 的多任务数据集 **OptimusM4**。

这一步延续了 Optimus 系列对知识图和交互经验的使用，只是它们不再只在推理时作为外部 memory 被检索，也开始成为训练参数能力的数据来源。

### 横向路由：共享知识专家与任务专家

Optimus-3 的第一条路由位于模型的“横向”参数维度。

在每一层中，标准 FFN 被替换为：

- 一个 **Shared Knowledge Expert**；
- 多个 **Task-Specific Experts**；
- 一个根据任务类型进行选择的 **Task Router**。

每个输入都会激活共享知识专家和对应任务专家。

共享专家负责保存跨任务可迁移的视觉与语义知识；任务专家则分别学习 Action、Planning、Grounding、Reflection 等任务特有的表示和输出规律。

与 token-level 的动态软路由不同，Optimus-3 根据任务语义将输入确定性地送入相应参数空间。这种正交解耦能够减少不同任务之间的梯度冲突，同时保留共享知识带来的正迁移。

从记忆视角看，可以把这理解为一种**参数记忆**：

- 通用经验被压缩进共享专家；
- 任务专属能力被压缩进不同任务专家；
- Task Router 决定当前任务应该检索哪一组参数能力。

这不是论文直接使用的术语，但它解释了 Optimus 系列从外部可检索记忆向模型内部专门化能力的演进。

### 纵向路由：为 System 1 建立 Fast Path，为 System 2 保留 Deep Path

仅仅选择任务专家还不能解决推理延迟问题，因为 System 1 与 System 2 对网络深度的需求不同。

Optimus-3 因此引入第二条“纵向”路由：**Layer Router**。

Layer Router 根据任务表示预测每一层的重要性，再通过阈值决定哪些层应该被执行，哪些中间层可以通过残差连接直接跳过。

由此形成两条计算路径：

- **Fast Path**：面向 Action 等 System 1 任务，只激活必要的感知和控制层，减少延迟；
- **Deep Path**：面向 Planning、Reflection、Grounding 和 Embodied QA 等 System 2 任务，保留充分的网络深度进行审慎推理。

横向路由决定“调用哪一种能力”，纵向路由决定“为了当前任务应该思考多深”。

二者结合后，同一个端到端模型既不需要让所有任务共享完全相同的参数，也不需要让所有任务承担完全相同的计算成本。

<figure class="blog-figure">
  <img
    src="/images/blog/memory-centric-minecraft-agent/optimus-3-framework.png"
    alt="Optimus-3 框架图"
    loading="lazy"
    decoding="async"
  >
  <figcaption>
    图 3. Optimus-3。Task Router 在横向上选择共享知识专家与任务专家，Layer Router 在纵向上为 System 1 构建快速路径、为 System 2 保留深度推理路径。
  </figcaption>
</figure>

### DGRPO：不仅监督答案，也监督思考过程

统一架构仍然需要真正激活 System 2 推理能力。

普通监督微调可以让模型模仿推理样本，但面对 Minecraft 中不断变化的视觉场景，仍然容易产生视觉幻觉或逻辑错误。标准强化学习如果只看最终答案，也无法区分“过程错误但碰巧答对”和“推理过程真正正确”。

Optimus-3 因此提出 **Dual-Granularity Reasoning-Aware Policy Optimization（DGRPO）**。

训练分为两个阶段：

1. **Visual-Reasoning Cold Start**：使用显式视觉推理模板，让模型先描述和核对画面证据，再给出答案；
2. **DGRPO 强化学习**：在 GRPO 基础上，同时对推理过程和最终结果提供密集反馈。

针对不同任务，DGRPO 设计了两类关键奖励：

- **Dependency-Aware Synthesis Reward**：利用 Minecraft 合成知识图监督规划链是否符合材料依赖；
- **Hallucination-Aware Consistency Reward**：根据场景中真实存在的物体，惩罚推理过程和答案中的视觉幻觉。

这使 System 2 不只是生成看起来合理的解释，而是必须让中间推理与领域知识和视觉证据保持一致。

### 从多模块 Agent 到统一通用 Agent

Optimus-3 在统一架构中整合了多种能力：

- Captioning；
- Embodied QA；
- Planning；
- Action；
- Grounding；
- Reflection。

最新版本的实验显示，它在 System 1、System 2 和开放式任务上都优于已有方法，并在开放式任务上取得 60% 的平均成功率。

但需要注意，参数专家并不等同于完整的终身记忆系统。它们擅长保存训练阶段获得的共享能力与任务能力，却不像 Optimus-1 的 HDKG 和 AMEP 那样可以在推理过程中持续追加新知识和新经验。

因此，Optimus-3 不是对显式长期记忆的替代，而是补上了此前路线中缺少的一层：

> 除了在模型外存储知识、在控制过程中保存历史，Agent 还需要在参数内部组织不同能力，并按任务需要高效调用。

---

## 三种记忆，三个时间尺度

回顾这三篇工作，核心问题始终没有改变：

> 如何让 Agent 利用过去、理解现在，并为未来的决策调用合适的能力？

但 memory 的载体和作用在不断演化。

### Optimus-1：任务级长期记忆

Optimus-1 的记忆存在于模型外部：

- HDKG 保存稳定的语义知识；
- AMEP 保存可检索的情景经验；
- Planner 和 Reflector 在任务级时间尺度上调用记忆。

它主要回答：

> 我知道哪些世界规则？过去类似任务成功或失败时发生了什么？

### Optimus-2：动作级短期行为记忆

Optimus-2 的记忆进入低层策略：

- Causal Perceiver 连接动作与观察；
- Historical Memory Bank 压缩从任务开始到当前的历史；
- behavior tokens 为每一步动作提供执行上下文。

它主要回答：

> 我刚才做过什么？这些动作带来了什么结果？当前执行处于什么状态？

### Optimus-3：模型级参数记忆与计算路由

Optimus-3 把能力组织进模型参数：

- Shared Knowledge Expert 保存跨任务共性；
- Task-Specific Experts 保存任务专属能力；
- Task Router 选择需要调用的参数；
- Layer Router 决定需要经过多少层计算。

它主要回答：

> 当前任务需要哪一种能力？这是需要快速反应，还是需要深入思考？

因此，三篇工作可以概括为：

**External Memory → Behavioral Memory → Routed Parametric Memory**

也可以概括为：

**Plan and Reflect from Experience → Act with History → Think and Act with Adaptive Compute**

---

## 结语：记忆不是一个模块，而是 Agent 的组织原则

在开放世界中，真正的智能并不只来自更大的模型。

一个能够长期完成复杂任务的 Agent，需要在多个时间尺度上组织信息：

- 用长期记忆保存稳定知识和可复用经验；
- 用短期记忆维持行为连续性和任务进度；
- 用参数记忆沉淀共享能力与任务能力；
- 用路由机制在不同场景中检索合适的记忆和计算路径。

从 Optimus-1 到 Optimus-2，再到 Optimus-3，我们所探索的并不是三种互相替代的 Agent 架构，而是三层逐渐补全的认知结构。

Optimus-1 让 Agent **拥有过去**。  
Optimus-2 让 Agent **理解现在**。  
Optimus-3 让 Agent **知道应该如何调用自己的能力**。

下一步更值得探索的问题，是如何把这三层真正统一起来：让端到端通用 Agent 在保持 System 1/2 高效协同的同时，也能够在开放世界中持续写入新知识、积累新经验、扩展新专家，并形成真正可长期成长的记忆系统。

这也是 Memory-Centric Agent 最终希望抵达的方向：

**不是让 Agent 每次都重新解决世界，而是让它能够把过去转化为未来的能力。**
