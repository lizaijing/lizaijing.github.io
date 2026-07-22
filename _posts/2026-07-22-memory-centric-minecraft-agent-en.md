---
title: "Making Minecraft Agents Remember, Act, and Think"
subtitle: "From long-term memory and behavioral working memory to routed parametric memory"
description: "The research path from Optimus-1 to Optimus-2 and Optimus-3: using memory to improve long-horizon planning, history-aware control, and System 1/2 synergy in Minecraft agents."
excerpt: "The research path from Optimus-1 to Optimus-2 and Optimus-3: using memory to improve long-horizon planning, history-aware control, and System 1/2 synergy in Minecraft agents."
date: 2026-07-22
lang: en
translation_key: memory-centric-minecraft-agent
stats_key: memory-centric-minecraft-agent
permalink: /blog/en/memory-centric-minecraft-agent/
reading_time: "13 min read"
tags:
  - Minecraft Agent
  - Memory
  - MLLM
cover: /images/blog/memory-centric-minecraft-agent/cover-memory-centric-minecraft-agent.png
cover_alt: "A memory-centric Minecraft agent research path from long-term memory to behavioral and parametric memory"
---

Minecraft is one of the most representative open worlds for studying general-purpose agents.

A seemingly simple instruction such as “craft a diamond sword” expands into a long causal chain. The agent must understand crafting dependencies, inspect its environment and inventory, plan material acquisition, execute continuous keyboard and mouse controls, determine whether each sub-goal has been completed, and recover when it falls into a cave, lacks a resource, or follows an invalid route.

The central challenge is therefore not merely to predict the next action. A capable Minecraft agent must continuously answer three questions:

> What have I learned in the past?  
> What have I just done, and where am I in the current behavior?  
> Which capability should I invoke now, and how much reasoning should I spend?

Our Optimus series approaches these questions through memory at three different levels:

- **Optimus-1** builds long-term memory for accumulating and retrieving world knowledge and historical experience.
- **Optimus-2** builds behavioral working memory so that the low-level policy can understand observation-action history and execution progress.
- **Optimus-3** organizes shared and task-specific capabilities into routed expert parameters, allowing one end-to-end model to combine fast System 1 action with deep System 2 reasoning.

Placed on a single trajectory, the three works correspond to three timescales of memory:

**Long-Term Memory → Working Memory → Parametric Memory**

They also represent three stages of agent development:

**Remember knowledge and experience → Remember the ongoing behavior → Select the right internal capability**

The phrase *parametric memory* is my interpretation of this research trajectory rather than terminology used directly in the Optimus-3 paper. Optimus-3 describes a Dual-Router Aligned Mixture-of-Experts architecture: shared and task-specific experts store different capabilities in parameter space, while routers determine how those capabilities are activated.

---

## Stage 1: Optimus-1 — starting from accumulated knowledge and experience

> **Paper · NeurIPS 2024**  
> [Optimus-1: Hybrid Multimodal Memory Empowered Agents Excel in Long-Horizon Tasks](https://proceedings.neurips.cc/paper_files/paper/2024/hash/5949a8750a110ce1f0631b1776c500a2-Abstract-Conference.html)

### Why do long-horizon tasks require explicit memory?

Early Minecraft agents could already use an LLM or MLLM for task planning and a policy such as STEVE-1 for keyboard and mouse control. Yet their performance deteriorated rapidly as tasks became longer and more compositional.

A major reason was the absence of a persistent memory that the agent could accumulate and actively consult.

Minecraft knowledge is not a collection of independent facts. It is a dependency network. Crafting a diamond sword requires more than remembering its final recipe. The agent must understand why it needs a crafting table, progressively stronger pickaxes, iron processing, and access to diamonds.

Interaction is also highly stochastic. An agent may fall into a cave while collecting wood, enter water while searching for resources, or attempt a later step before its prerequisites are ready. General knowledge stored implicitly in a model is not sufficient for producing consistently executable plans, and successful trajectories alone cannot teach the agent how to recognize and avoid past failures.

Optimus-1 is built around a simple claim:

> Long-horizon behavior requires two kinds of persistent memory: knowledge about how the world works, and experience about what happened during previous executions.

### HDKG: condensing world knowledge into a hierarchical directed graph

Optimus-1 introduces the **Hierarchical Directed Knowledge Graph (HDKG)**.

In the HDKG:

- nodes represent objects, tools, and materials;
- directed edges encode crafting or acquisition dependencies;
- the agent retrieves a target-specific subgraph;
- topological sorting converts the subgraph into an ordered dependency structure.

For a diamond sword, the graph does not return only “two diamonds and one stick.” It unfolds the chain from raw wood and a crafting table to basic tools, an iron pickaxe, and diamond acquisition.

Knowledge is therefore no longer hidden only inside model parameters. It becomes an external structure that can be queried, updated, and inspected.

The Knowledge-Guided Planner retrieves the relevant subgraph and combines it with the current visual observation to generate a complete sub-goal sequence. This is more coherent than repeatedly asking for a single next step, because the plan is constructed with the full dependency hierarchy in view.

### AMEP: abstracting both successful and failed multimodal experience

Knowledge alone cannot account for the variability of execution. The same plan may unfold differently in different biomes, inventories, and physical situations.

Optimus-1 therefore introduces the **Abstracted Multimodal Experience Pool (AMEP)**.

AMEP stores more than textual plans. Its experience records include:

- the environment and agent state;
- the task and current sub-goal;
- selected video frames;
- visual changes before and after execution;
- whether the agent should complete, continue, or replan.

Rather than storing entire videos, Optimus-1 dynamically abstracts the visual stream. Frames are first sampled at a fixed frequency, then filtered through a sliding image buffer to remove redundancy. MineCLIP is used to align the retained visual content with its textual sub-goal.

The resulting memory stores compact episodes that preserve both a global overview and the local details needed for reflection.

Crucially, AMEP retains **failure cases as well as successful cases**.

A success demonstrates what task completion looks like.  
A failure demonstrates which visual states indicate that the current strategy is no longer viable.

Experience becomes not only something to imitate, but also something to diagnose against.

### Knowledge-guided planning and experience-driven reflection

On top of HDKG and AMEP, Optimus-1 contains three cooperating modules:

- a **Knowledge-Guided Planner**, which combines the current scene with HDKG to produce a long-horizon plan;
- an **Action Controller**, implemented with STEVE-1, which converts each sub-goal into keyboard and mouse actions;
- an **Experience-Driven Reflector**, which periodically retrieves AMEP episodes and evaluates the current state.

The reflector produces one of three outcomes:

- **COMPLETE**: the current sub-goal has been achieved;
- **CONTINUE**: execution is incomplete but still progressing normally;
- **REPLAN**: the agent is stuck, endangered, or following an invalid strategy.

Optimus-1 therefore forms a memory-driven loop:

**knowledge guides planning, experience guides reflection, and reflection triggers replanning.**

<figure class="blog-figure">
  <img
    src="/images/blog/memory-centric-minecraft-agent/optimus-1-framework.png"
    alt="Optimus-1 framework"
    loading="lazy"
    decoding="async"
  >
  <figcaption>
    Figure 1. Optimus-1. HDKG supplies structured world knowledge for long-horizon planning, while AMEP retrieves successful and failed multimodal experience for reflection and replanning.
  </figcaption>
</figure>

### Non-parametric learning through memory expansion

Optimus-1 also proposes a “free exploration–teacher guidance” learning process.

During free exploration, multiple agents interact with randomized tasks and environments while sharing the same HDKG and AMEP. Environmental feedback continuously adds crafting knowledge, successful episodes, and failed episodes.

During teacher guidance, the agent is exposed to a small number of more difficult long-horizon tasks, adding higher-level knowledge and complete execution experience to memory.

The MLLM itself does not need to be updated. Capability improves as the external memory expands.

This suggests an appealing form of agent growth:

> The foundation model can remain stable while the agent becomes stronger by accumulating knowledge and experience.

On a benchmark of 67 long-horizon tasks, Optimus-1 substantially outperformed previous agents across multiple task groups. Ablations further showed that planning, reflection, knowledge, and experience all contribute to its long-horizon performance.

### What Optimus-1 still leaves unresolved

Optimus-1 answers how an agent can reuse past knowledge and experience, but low-level execution still relies on STEVE-1.

At the level of the Action Controller, the current sub-goal and current visual observation remain the most immediate conditions. Although the controller may contain temporal modeling, it does not explicitly summarize how previous actions produced the current observation or how the behavior has unfolded from the beginning of the sub-goal.

The agent can know its long-term objective and reflect using retrieved experience, while still lacking a clear short-term memory at every action step:

> What did I just do? What changed because of those actions? Which phase of the current behavior am I in?

This is the problem addressed by Optimus-2.

---

## Stage 2: Optimus-2 — giving the policy behavioral working memory

> **Paper · CVPR 2025**  
> [Optimus-2: Multimodal Minecraft Agent with Goal-Observation-Action Conditioned Policy](https://openaccess.thecvf.com/content/CVPR2025/html/Li_Optimus-2_Multimodal_Minecraft_Agent_with_Goal-Observation-Action_Conditioned_Policy_CVPR_2025_paper.html)

### From remembering the task to remembering execution

Optimus-1 uses an MLLM for high-level planning and STEVE-1 for low-level action. This hierarchy makes long-horizon execution possible, but it also shifts the bottleneck from the planner to the policy.

Existing goal-conditioned policies typically combine a goal representation with current visual features and then predict an action. They do not explicitly capture two important relationships:

1. **The causal relationship between action and observation.** The current observation is a consequence of previous actions interacting with the environment.
2. **The relationship between an open-ended sub-goal and the full observation-action history.** A sub-goal describes a behavior over time, not a single image.

A policy that reacts primarily to the current observation may not know what it has already attempted, and it may confuse visually similar states that correspond to different stages of execution.

Optimus-2 therefore moves the memory question into the low-level controller:

> A reliable policy must understand not only the goal and the current scene, but also the observation-action history from the beginning of execution.

### GOAP: jointly conditioning on goal, observation, and action

Optimus-2 preserves the overall “planner plus controller” structure.

An MLLM-based planner first decomposes a task into sub-goals. Those sub-goals are then executed by a new **Goal-Observation-Action Conditioned Policy (GOAP)**.

GOAP contains two central components:

- an **Action-Guided Behavior Encoder**, which models the historical observation-action sequence;
- an **MLLM backbone**, which aligns open-ended language goals with behavior tokens and predicts actions autoregressively.

Instead of treating goal, observation, and action as loosely connected inputs, GOAP models them as a single causal and temporal system.

### Causal Perceiver: using actions to explain observations

The Action-Guided Behavior Encoder begins with a **Causal Perceiver** that models the observation-action relationship at each timestep.

Visual features are used as queries, while the action embedding is used as keys and values. Cross-attention writes action information into the visual representation.

The policy therefore no longer treats an image as an isolated input. It attempts to understand:

> Which previous action produced the state I am currently observing?

A changed camera direction, a broken block, or an item entering the inventory are consequences of interaction. Connecting action and observation is essential for forming a meaningful representation of behavior.

### History Aggregator: compressing the full trajectory into fixed-length behavior tokens

Optimus-2 then introduces a **History Aggregator** for temporal modeling.

At every timestep:

- current behavior tokens interact with historical behavior tokens through history attention;
- the current observation-action information is written into the updated behavior representation;
- a Historical Memory Bank aggregates similar adjacent features;
- the history remains fixed in length rather than growing indefinitely.

A fixed number of behavior tokens can therefore summarize the observation-action trajectory from the start of the task to the present moment.

This is a form of working memory:

- it is updated after every interaction;
- it directly supports current decision-making;
- it preserves important early information;
- it compresses a long trajectory into a real-time state representation.

### MLLM policy: aligning language goals with behavioral history

GOAP provides the MLLM with three kinds of token:

- text tokens for the current sub-goal;
- image tokens for the current observation;
- behavior tokens representing the historical observation-action sequence.

The MLLM jointly models them, and a VPT action head maps its output into keyboard and mouse controls.

Optimus-2 is therefore no longer answering only:

> What should I do in this image?

It answers a richer question:

> Given the language goal and everything I have done from the start until now, what should I do next?

<figure class="blog-figure">
  <img
    src="/images/blog/memory-centric-minecraft-agent/optimus-2-framework.png"
    alt="Optimus-2 framework"
    loading="lazy"
    decoding="async"
  >
  <figcaption>
    Figure 2. Optimus-2. The Action-Guided Behavior Encoder combines action-conditioned perception with a compressed historical memory, and the MLLM aligns these behavior tokens with open-ended sub-goals to generate low-level actions.
  </figcaption>
</figure>

### MGOA: data for joint goal-observation-action learning

Optimus-2 also introduces the **Minecraft Goal-Observation-Action (MGOA)** dataset for training GOAP.

MGOA contains:

- 25,000 videos;
- eight atomic task categories;
- approximately 30 million aligned goal-observation-action pairs.

The dataset is constructed automatically rather than through frame-by-frame manual annotation.

Experiments show that Optimus-2 improves performance on atomic tasks, long-horizon tasks, and open-ended sub-goals. The paper reports average gains of roughly 27%, 10%, and 18% over previous state of the art in these three settings.

### From retrieved long-term experience to online behavioral memory

Optimus-2 continues the memory-centered trajectory of Optimus-1, but memory moves to a different location in the system.

In Optimus-1, memory mainly supports high-level planning and reflection:

- HDKG answers what dependencies the task requires;
- AMEP answers what happened in similar situations.

In Optimus-2, memory enters the action policy:

- Causal Perceiver models how actions produce observations;
- Historical Memory Bank compresses execution history;
- behavior tokens tell the policy how the ongoing behavior has developed.

Memory therefore expands from **task-level long-term memory** to **action-level working memory**.

Yet Optimus-2 still separates the high-level planner from the low-level policy. Equipping the agent with Captioning, Embodied QA, Planning, Grounding, Reflection, and Action usually requires connecting additional modules.

This leads to the next question:

> Can one end-to-end model support both low-latency action and deep reasoning, while sharing useful knowledge without allowing heterogeneous tasks to interfere with one another?

---

## Stage 3: Optimus-3 — moving memory into experts and computation paths

> **Paper · arXiv preprint**  
> [Optimus-3: Dual-Router Aligned Mixture-of-Experts Agent with Dual-Granularity Reasoning-Aware Policy Optimization](https://arxiv.org/abs/2506.10357)

### The structural conflict between System 1 and System 2

A general Minecraft agent needs two apparently conflicting modes of cognition.

**System 1** is the high-frequency, reflexive visuomotor loop. Actions must be produced with low latency for smooth movement, camera control, and physical interaction.

**System 2** is slower and deliberative. It includes:

- long-horizon planning;
- visual grounding;
- embodied question answering;
- reflection on task state;
- active verification of visual evidence.

Hierarchical agents can add separate modules for each ability, but the system becomes increasingly fragmented and interfaces accumulate error.

An end-to-end MLLM offers a unified representation, but usually processes every task with the same parameters and the same depth. Full-depth reasoning is too expensive for real-time action; shallow computation is insufficient for planning and reflection. Training Action, Grounding, and Planning in the same dense parameter space also creates task interference because their input-output structures differ substantially.

Optimus-3 therefore focuses on reorganizing internal capability:

> Different tasks should occupy distinguishable parameter spaces, while different cognitive modes should receive different amounts of computation.

### Generating System 2 reasoning from System 1 trajectories

Before designing the architecture, Optimus-3 addresses the lack of training data.

Minecraft provides abundant action trajectories, but much less data for System 2 processes such as planning, grounding, and reflection. Naively asking a general-purpose MLLM to annotate gameplay often produces infeasible crafting plans and perceptual hallucinations because the model lacks precise Minecraft knowledge.

Optimus-3 proposes a **Knowledge-Enhanced Automated Data Generation Pipeline**.

The pipeline injects several sources of grounded knowledge:

- domain knowledge graphs constrain crafting plans;
- expert policies execute sub-goals and generate action trajectories;
- environmental feedback verifies successful execution;
- inventory, agent state, and nearby objects ground visual descriptions;
- expert models such as Grounding DINO provide localization annotations;
- environment feedback supports reflection labels.

The resulting **OptimusM4** dataset combines Planning, Captioning, Embodied QA, Grounding, Reflection, and Action.

This stage continues the use of knowledge graphs and interaction experience from Optimus-1, but changes their role. They are no longer used only as external memory at inference time; they also supervise the formation of internal parametric capabilities.

### Horizontal routing: shared knowledge and task-specific experts

The first router in Optimus-3 operates horizontally across parameter space.

At each layer, the standard feed-forward network is replaced by:

- a **Shared Knowledge Expert**;
- multiple **Task-Specific Experts**;
- a semantic **Task Router**.

Every input activates the shared expert together with the expert corresponding to its task.

The shared expert captures transferable visual and semantic knowledge. Task experts learn the distinct representations and outputs required by Action, Planning, Grounding, Reflection, and the other tasks.

Unlike token-level soft routing, Optimus-3 uses task semantics to route inputs deterministically into distinct parameter spaces. The orthogonal separation reduces gradient interference while the shared expert preserves positive transfer.

From a memory perspective, this can be interpreted as **parametric memory**:

- shared experience is compressed into the shared expert;
- task-specific capability is compressed into specialized experts;
- the Task Router retrieves the appropriate parameterized capability.

Again, this is a unifying interpretation of the Optimus trajectory, not terminology directly introduced in the paper.

### Vertical routing: a Fast Path for System 1 and a Deep Path for System 2

Choosing the right expert does not solve the latency problem by itself. System 1 and System 2 also require different reasoning depths.

Optimus-3 therefore introduces a second, vertical router: the **Layer Router**.

The router predicts the importance of each layer from the task representation and uses a threshold to determine which layers should execute. Layers with low importance can be bypassed through residual connections.

This creates two computational paths:

- a **Fast Path** for System 1 tasks such as Action, activating only essential perception and control layers;
- a **Deep Path** for System 2 tasks such as Planning, Reflection, Grounding, and Embodied QA, preserving the depth needed for deliberative reasoning.

Horizontal routing determines *which capability to invoke*.  
Vertical routing determines *how deeply the model should think*.

Together, they allow one end-to-end model to avoid both uniform parameter sharing and uniform computation.

<figure class="blog-figure">
  <img
    src="/images/blog/memory-centric-minecraft-agent/optimus-3-framework.png"
    alt="Optimus-3 framework"
    loading="lazy"
    decoding="async"
  >
  <figcaption>
    Figure 3. Optimus-3. The Task Router selects a shared knowledge expert and a task expert horizontally, while the Layer Router creates a Fast Path for System 1 and preserves a Deep Path for System 2.
  </figcaption>
</figure>

### DGRPO: supervising the process as well as the outcome

A unified architecture must still activate rigorous System 2 reasoning.

Supervised fine-tuning can teach the model to imitate reasoning traces, but it remains vulnerable to visual hallucination and logical errors in diverse Minecraft scenes. Standard reinforcement learning based only on final outcomes also cannot distinguish a sound reasoning chain from a flawed chain that happens to produce the correct answer.

Optimus-3 introduces **Dual-Granularity Reasoning-Aware Policy Optimization (DGRPO)**.

Training proceeds in two phases:

1. a **Visual-Reasoning Cold Start**, which teaches the model to explicitly inspect and describe visual evidence before answering;
2. **DGRPO reinforcement learning**, which supplies dense feedback to both the reasoning process and the final answer.

Two reward families are central:

- the **Dependency-Aware Synthesis Reward**, which uses the Minecraft dependency graph to supervise whether planning follows valid material prerequisites;
- the **Hallucination-Aware Consistency Reward**, which penalizes entities that do not exist in the observed scene.

System 2 is therefore trained not merely to produce plausible explanations, but to keep intermediate reasoning consistent with domain knowledge and visual evidence.

### From a collection of modules to a unified generalist agent

Optimus-3 integrates multiple abilities within one architecture:

- Captioning;
- Embodied QA;
- Planning;
- Action;
- Grounding;
- Reflection.

The latest paper reports improvements over previous state of the art on both System 1 and System 2 tasks, along with an average 60% success rate on open-ended tasks.

Parametric experts, however, are not a complete lifelong memory system. They preserve shared and task-specific capabilities learned during training, but they are not as directly appendable during interaction as the HDKG and AMEP in Optimus-1.

Optimus-3 should therefore not be viewed as replacing explicit long-term memory. It adds a missing third layer:

> Beyond storing knowledge outside the model and maintaining history during control, an agent must organize its internal capabilities and retrieve them with the right computational budget.

---

## Three memories across three timescales

All three works are driven by the same question:

> How can an agent use the past, understand the present, and invoke the right capability for the future?

The carrier and role of memory evolve at each stage.

### Optimus-1: task-level long-term memory

Optimus-1 stores memory outside the model:

- HDKG preserves stable semantic knowledge;
- AMEP preserves retrievable episodic experience;
- the planner and reflector consult memory at the task level.

It answers:

> What world rules do I know, and what happened in similar successful or failed episodes?

### Optimus-2: action-level behavioral working memory

Optimus-2 moves memory into the policy loop:

- Causal Perceiver connects actions to observations;
- Historical Memory Bank compresses the trajectory from the start to the present;
- behavior tokens provide context for every next action.

It answers:

> What have I just done, what changed, and where am I in the current behavior?

### Optimus-3: model-level parametric memory and routing

Optimus-3 organizes capability inside model parameters:

- the Shared Knowledge Expert stores cross-task regularities;
- Task-Specific Experts store specialized capabilities;
- the Task Router selects the relevant parameter space;
- the Layer Router allocates the required depth.

It answers:

> Which capability does the current task require, and should the agent react quickly or reason deeply?

The trajectory can therefore be summarized as:

**External Memory → Behavioral Memory → Routed Parametric Memory**

or:

**Plan and Reflect from Experience → Act with History → Think and Act with Adaptive Compute**

---

## Closing thoughts: memory as an organizing principle for agents

Intelligence in an open world cannot come from model scale alone.

An agent that operates over long horizons must organize information at multiple timescales:

- long-term memory for stable knowledge and reusable experience;
- working memory for behavioral continuity and task progress;
- parametric memory for shared and specialized capabilities;
- routing mechanisms for retrieving the right capability and computation path.

Optimus-1, Optimus-2, and Optimus-3 are therefore not three mutually exclusive architectures. They gradually complete three layers of cognition.

Optimus-1 gives the agent **a past**.  
Optimus-2 gives the agent **an understanding of the present**.  
Optimus-3 gives the agent **a mechanism for deciding how to use its own capabilities**.

A natural next step is to unify all three: an end-to-end generalist agent that retains efficient System 1/2 routing while continuously writing new knowledge, accumulating new experience, and expanding its experts during open-world interaction.

That is the broader goal of a memory-centric agent:

**not to solve the world from scratch every time, but to transform the past into capability for the future.**
