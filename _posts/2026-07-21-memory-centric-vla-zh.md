---
title: "让机器人不再从头开始：以记忆为中心增强 VLA"
subtitle: "从动作轨迹，到行为表征，再到可复用技能"
description: "从 OptimusVLA、BehaviorVLA 到 Optimus-R：一条以记忆为中心提升 Vision-Language-Action 模型泛化、迁移与适配能力的研究路线。"
excerpt: "从 OptimusVLA、BehaviorVLA 到 Optimus-R：一条以记忆为中心提升 Vision-Language-Action 模型泛化、迁移与适配能力的研究路线。"
date: 2026-07-21
lang: zh
translation_key: memory-centric-vla
permalink: /blog/zh/memory-centric-vla/
reading_time: "12 min read"
tags:
  - VLA
  - Memory
  - Robotics
cover: /images/blog/memory-centric-vla/cover-memory-centric-vla.png
cover_width: 1672
cover_height: 941
cover_alt: "以记忆为中心的 VLA 研究路线：从动作轨迹到行为表征，再到可复用技能"
---

近年来，Vision-Language-Action（VLA）模型正在成为通用机器人领域最重要的技术路线之一。它们把视觉感知、语言理解和动作生成连接在同一个系统中，让机器人能够从“看懂任务”进一步走向“完成任务”。

但在研究 VLA 的过程中，我逐渐意识到一个经常被忽略的问题：

> 一个机器人可以看见、理解和行动，但它是否真正记住了自己过去学会的东西？

当前的大多数 VLA 模型，仍然主要把知识压缩进模型参数。当机器人面对新任务、新场景或新环境时，最常见的适配方式依然是继续微调模型。过去学过的轨迹、行为和技能虽然以某种形式存在于权重中，却往往是隐式的：难以检索、难以解释，也难以被单独复用或更新。

围绕这一问题，我的一系列工作都聚焦于同一条研究主线：

> 如何让记忆从一个辅助模块，逐步成为 VLA 泛化、迁移与持续适配的核心机制？

沿着这条主线，三篇工作形成了一条连续的演化路径：

- **OptimusVLA**：让 VLA 从“没有显式记忆”走向“主动检索历史经验”；
- **BehaviorVLA**：让记忆从“存动作轨迹”走向“存行为表征”；
- **Optimus-R**：让记忆不只帮助推理，而是成为新任务与新环境适配的主要载体。

从整体上看，这条路线可以概括为：

**Action Trajectory → Behavior Representation → Reusable Skill**

以及：

**生成先验 → 行为条件 → 适配载体**

---

## 第一阶段：OptimusVLA——让动作生成从经验出发

### 为什么机器人每次都要从噪声开始？

许多 VLA 模型使用 diffusion 或 flow matching 生成连续动作。它们通常从随机高斯噪声出发，再通过多步迭代，将噪声逐渐变成一段结构化的动作序列。

这种生成范式具有很强的表达能力，但它也隐含了一个不够自然的假设：机器人每次执行任务，都要从“零经验”开始。

现实中的学习并不是这样。一个已经学会抓取杯子、把水果放到盘子里，或者把物体放入容器的机器人，在面对相似任务时，本应能够调用过去的成功经验，而不是再次从完全随机的噪声中重新搜索一条可行动作。

这正是 OptimusVLA 的出发点：

> 动作生成不应该总是从无信息的随机噪声开始，而应该尽可能从历史经验中检索出更有意义的动作先验。

### Global Prior Memory：把历史轨迹变成动作先验

为此，OptimusVLA 引入了 **Global Prior Memory（GPM）**，用于存储机器人过去学习过的动作轨迹。

当模型接收到新的视觉观察和语言指令时，它首先在 memory 中检索语义最相近的历史任务，再从这些轨迹中采样并组合出任务相关的动作先验，用来替代 flow policy 中原本的高斯噪声。

这一改变使动作生成的起点不再位于随机空间，而是直接落在一个更接近可行动作分布的位置。

它带来两个直接收益：

1. **更高的生成效率。** 初始状态已经包含任务相关结构，因此模型不必通过大量迭代从零构造动作。
2. **更稳定的动作质量。** 来自历史成功轨迹的先验，能够把生成过程锚定在更合理、更可执行的动作区域。

为了避免模型机械复制旧轨迹，GPM 还根据检索相似度动态控制噪声强度和生成步数：任务越相似，模型越可以信任记忆；任务越陌生，模型越保留生成自由度。

### Local Consistency Memory：让机器人知道自己做到哪一步

仅有全局轨迹记忆还不够。机器人还必须判断：**当前动作应该处于任务的哪个阶段？**

很多任务阶段在单帧图像中非常相似。例如，一个刚刚关上的抽屉，与一个尚未打开的抽屉，可能具有几乎相同的视觉外观。如果模型只依赖当前观察，就很难判断自己是在准备开始，还是已经接近完成。

OptimusVLA 因此进一步引入 **Local Consistency Memory（LCM）**。它通过建模最近执行过的动作序列，推断当前任务进度，并为后续动作生成提供局部一致性约束。

由此，两个 memory 形成了清晰的分工：

- **GPM** 回答：“过去相似任务通常是怎样完成的？”
- **LCM** 回答：“当前任务已经执行到了哪里？”

一个负责长期经验，一个负责短期执行状态。二者共同让 VLA 不再只是根据当前一帧图像去猜测下一步，而是开始真正利用任务历史。

<figure class="blog-figure">
  <a
    class="blog-figure__viewport"
    href="/images/blog/memory-centric-vla/optimusvla-framework.png"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="OptimusVLA 框架图"
  >
    <span class="blog-figure__canvas">
      <img
        class="blog-figure__image"
        src="/images/blog/memory-centric-vla/optimusvla-framework.png"
        alt="OptimusVLA 框架图"
        width="3261"
        height="1429"
        loading="lazy"
        decoding="async"
      >
    </span>
  </a>
  <figcaption>
    图 1. OptimusVLA 框架。Global Prior Memory 检索任务级动作先验，Local Consistency Memory 建模局部执行历史，二者共同提升动作生成的效率与时序一致性。
  </figcaption>
</figure>

### 从“没有记忆”到“显式利用记忆”

OptimusVLA 完成了这条研究路线的第一步：**让 memory 真正进入 VLA 的动作生成过程。**

在传统范式中，历史演示主要是训练数据，训练结束后便被吸收到模型参数中。而在 OptimusVLA 中，过去的经验成为了一个可以在推理时主动检索、组合和调用的资源。

但这一设计也暴露出新的局限：memory 中存储的核心仍然是 **原始 action trajectory**。它记住了机器人过去“做了什么”，却还没有抽象出“这些动作背后为什么成立，以及它们对应怎样的行为逻辑”。

于是，下一步的问题自然出现：

> 如果轨迹只是经验的表面形式，VLA 是否应该进一步记住更稳定、更可迁移的行为本身？

---

## 第二阶段：BehaviorVLA——从记住动作，到理解行为

### 原始轨迹不是最理想的记忆单位

同一种行为可以发生在完全不同的场景中。

“抓取一个物体并放入容器”可能对应不同颜色的物体、不同尺寸的容器、不同背景、光照和相机视角。低层动作轨迹会随着环境发生变化，但任务背后的行为结构通常保持一致：接近目标、完成抓取、移动到目标区域、释放物体。

这揭示了一个重要区别：

> 轨迹是具体的，行为是可迁移的。

如果 memory 只存储原始动作，它很容易过度依赖轨迹细节，难以提炼出跨场景共享的任务结构。BehaviorVLA 因此将研究问题从“如何检索动作轨迹”推进到“如何学习行为表征”。

### VBE：从视觉—动作轨迹中提炼行为

BehaviorVLA 提出了 **Visuomotor Behavior Encoder（VBE）**。它不只编码视觉，也不只编码动作，而是同时建模三条相互关联的信息流：

- **视觉流**：机器人看到了什么；
- **动作流**：机器人做了什么；
- **行为流**：视觉与动作共同反映出的任务结构是什么。

在时间维度上，VBE 对完整轨迹中的长期依赖进行因果建模；在每个时间步，它通过跨模态交互将视觉与动作信息聚合进行为 token。

它的目标不是简单压缩轨迹，而是形成一个选择性的信息瓶颈：过滤背景、纹理、光照等高频环境变化，保留真正与任务逻辑有关的结构。

### 两层行为坐标：全局原型与局部阶段

为了让行为表征能够真正服务于推理和控制，BehaviorVLA 将其组织为两个互补层次：

- **Global Prototype**：描述任务整体结构，是相对稳定、更加场景无关的行为原型；
- **Local Phase State**：描述当前执行进度，是随交互过程持续更新的阶段状态。

它们分别回答两个问题：

- 这个任务整体上应该怎样完成？
- 当前执行已经进行到了哪一步？

这使 memory 不再只是静态的轨迹数据库，而开始成为一个可检索、可定位、可实例化的行为坐标空间。

### PBD：把抽象行为重新实例化为具体动作

有了行为表征，下一步是把它重新转化为当前场景中的精确动作。BehaviorVLA 为此提出 **Phase-conditioned Behavior Decoder（PBD）**。

PBD 的核心思想是：

> 先用全局行为确定任务结构，再根据当前阶段将其实例化为具体动作。

它采用 Predictor-Corrector 范式：

- **Predictor** 根据 global prototype 展开一个粗粒度的行为骨架；
- local phase state 在该骨架中定位当前执行阶段；
- 模型由此得到与任务进度对齐的结构化动作先验；
- **Corrector** 再通过 flow policy 对该先验进行局部修正，使其适应当前物体位置、环境扰动和接触状态。

这一设计在全局稳定性与局部灵活性之间建立了平衡：

- 行为表征保证模型不会偏离任务整体逻辑；
- 生成策略保留对当前环境进行精细反应的能力。

因此，BehaviorVLA 形成了一个完整闭环：

**从具体轨迹中抽象行为，再把抽象行为实例化为当前情境下的动作。**

<figure class="blog-figure">
  <a
    class="blog-figure__viewport"
    href="/images/blog/memory-centric-vla/behaviorvla-framework.png"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="BehaviorVLA 框架图"
  >
    <span class="blog-figure__canvas">
      <img
        class="blog-figure__image"
        src="/images/blog/memory-centric-vla/behaviorvla-framework.png"
        alt="BehaviorVLA 框架图"
        width="1168"
        height="612"
        loading="lazy"
        decoding="async"
      >
    </span>
  </a>
  <figcaption>
    图 2. BehaviorVLA 框架。Visuomotor Behavior Encoder 学习全局行为原型与局部阶段状态，Phase-conditioned Behavior Decoder 将抽象行为转化为与实时进度对齐的动作。
  </figcaption>
</figure>

### 从“记住动作”到“理解行为”

如果说 OptimusVLA 让 VLA 第一次拥有了显式记忆，那么 BehaviorVLA 改变了 memory 中真正被存储的内容。

在 OptimusVLA 中，memory 主要保存“过去执行过的动作轨迹”；在 BehaviorVLA 中，memory 开始保存“由视觉与动作共同定义的行为表征”。

记忆由此从 **action-centric** 走向 **behavior-centric**。

但更加结构化的行为表征也带来了新的挑战：它仍然可能是 **domain-dependent** 的。当机器人从仿真进入真实世界，或切换到新的视觉环境和动力学条件时，原有行为空间可能发生偏移。为了完成适配，通常仍需要重新训练部分行为模块，甚至解冻 VLA backbone。

这引出了第三阶段最关键的问题：

> 当环境变化导致已有 skill 不再适配时，我们是否可以直接更新 memory，而不是反复重写整个模型？

---

## 第三阶段：Optimus-R——让记忆成为适配的主体

### 从参数中心走向记忆中心

当前大多数 VLA 的适配方式仍然是 **parameter-centric** 的。

每遇到一个新任务或新环境，模型就通过梯度下降修改参数。这样做虽然有效，却也带来几个结构性问题：

- 每次适配都需要重新训练，计算和时间成本较高；
- 新技能被隐式写入权重，难以单独检索和复用；
- 新旧知识共享同一组参数，容易相互干扰；
- 在持续学习中，模型容易遗忘过去已经掌握的技能。

从长期运行的机器人系统来看，这更像是在不断重写模型，而不是持续积累经验。

Optimus-R 因此提出一种不同的适配范式：

> 面对新任务和新环境时，与其反复更新 backbone，不如优先更新 memory 中显式存储的 skill。

### Inline Memory：让技能从 VLA 内部产生

许多 retrieval-based 方法把 memory 设计成模型外部的附加模块：先在外部检索上下文，再把结果送回策略。

这种 detached memory 与原生动作条件通路之间往往只有较弱的耦合。它可能能够匹配任务语义，却不一定包含足够精确的控制信息。

Optimus-R 因此提出 **Inline Memory Interface**。它将一组可学习的 memory tokens 直接插入 VLA 的 prefix stream，使这些 token 与视觉、语言和状态信息共同经过 backbone 更新。

这样一来，memory 不再是挂在策略外部的数据库，而成为策略内部表示过程的一部分。由此提取出的 skill 也更自然地对齐于动作生成。

### Query-Skill Memory Bank：显式组织可复用技能

Optimus-R 的第二个核心设计是 **Query-Skill Memory Bank**。

它将技能 memory 拆分成两个角色：

- **Query Prototype**：决定“在什么情况下应该调用这个 skill”；
- **Skill Value**：决定“调用之后应该怎样行动”。

这种解耦基于一个关键判断：检索和执行并不是同一个问题。

适合进行相似性匹配的表示，不一定包含足够精确的动作信息；而适合重建控制行为的表示，也不一定最适合判断何时调用。将二者分开，使 memory 更容易被检索、复用、扩展和更新。

### Bridge-and-Adapt：更新记忆，而不是重写模型

Optimus-R 最核心的变化，是把适配本身重新定义为一个 **memory update** 问题。

面对新任务或新环境时，模型首先判断：

- 当前任务能否复用已有 skill？
- 如果可以，是否只需对已有 prototype 做局部 residual update？
- 如果不能，是否应该向 memory bank 中追加新的 skill entry？

面对 sim-to-real 等跨域变化，Optimus-R 进一步使用 **Bridge-and-Adapt** 机制，通过轻量对齐模块，将目标域中的 query 和 skill 表示映射回已有 memory space，使源域技能仍然能够在新环境中被正确检索和调用。

这形成了一种更加模块化的分工：

- **Backbone** 提供稳定、通用的感知与控制能力；
- **Memory** 负责存储、更新、扩展和复用具体技能。

<figure class="blog-figure">
  <a
    class="blog-figure__viewport"
    href="/images/blog/memory-centric-vla/optimus-r-framework.png"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Optimus-R 框架图"
  >
    <span class="blog-figure__canvas">
      <img
        class="blog-figure__image"
        src="/images/blog/memory-centric-vla/optimus-r-framework.png"
        alt="Optimus-R 框架图"
        width="3590"
        height="1680"
        loading="lazy"
        decoding="async"
      >
    </span>
  </a>
  <figcaption>
    图 3. Optimus-R 框架。Inline Memory Interface 从 VLA 原生策略通路中提取 query 与 skill，Query-Skill Memory Bank 显式组织技能，Bridge-and-Adapt 通过轻量 memory tuning 支持跨域与持续适配。
  </figcaption>
</figure>

### 从“帮助推理”到“承担适配”

到了 Optimus-R，memory 的角色发生了进一步升级。

在 OptimusVLA 中，它主要帮助动作生成；在 BehaviorVLA 中，它承载行为结构；在 Optimus-R 中，它成为吸收新任务、适配新环境和保留旧技能的主要载体。

因此，三篇工作共同构成了一条连续路线：

- **OptimusVLA**：让 VLA 开始显式利用历史经验；
- **BehaviorVLA**：让 VLA 记住更抽象、更可迁移的行为；
- **Optimus-R**：让 VLA 通过更新 memory 而非反复微调 backbone 来适配未来。

---

## 从轨迹，到行为，再到技能

回过头来看，这三篇工作始终围绕同一个问题展开：

> 如何让机器人真正利用过去，而不是在每一个新任务面前重新开始？

沿着这条路线，memory 中存储的对象不断演化：

- 在 **OptimusVLA** 中，是历史动作轨迹；
- 在 **BehaviorVLA** 中，是视觉—动作相关的行为表征；
- 在 **Optimus-R** 中，是可复用、可更新、可扩展的技能。

与此同时，memory 在系统中的作用也不断升级：

- 从 **生成先验**，
- 到 **行为条件**，
- 再到 **适配载体**。

我希望通过这组工作表达的核心观点是：

> 未来的 VLA 不应该只把所有知识都压缩进模型参数；它还应该能够显式记住过去、理解行为、复用技能，并通过更新记忆持续成长。

---

## 结语：让模型拥有能力，让记忆承载经验

更大的模型、更强的预训练和更多的微调，当然会继续推动 VLA 向前发展。但我并不认为，单纯扩大参数规模是通向通用机器人的唯一道路。

一个能够长期工作的机器人，不仅需要强大的基础模型，也需要一个可以被检索、被更新、被组合、被扩展的记忆系统。

模型参数更适合承载跨任务共享的通用能力，而 memory 更适合承载具体经验和不断演化的技能。前者提供稳定的感知与控制基础，后者让机器人能够在真实世界中持续学习。

从 OptimusVLA 到 BehaviorVLA，再到 Optimus-R，我所尝试推动的，正是这样一种 **memory-centric VLA** 范式：

**机器人不再把所有知识都隐藏在难以解释的参数中，而是能够显式地记住过去、理解行为、复用技能，并通过更新记忆适应未来。**

这也是我接下来希望继续探索的方向：构建真正拥有长期记忆、能够持续成长，并且不必在每一个新环境中从头学习的通用机器人。
