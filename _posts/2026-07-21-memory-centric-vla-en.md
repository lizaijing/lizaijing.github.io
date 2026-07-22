---
title: "From Action Trajectories to Reusable Skills"
subtitle: "A memory-centric path toward generalizable VLA models"
description: "The research story behind OptimusVLA, BehaviorVLA, and Optimus-R: evolving memory from action priors to behavior representations and reusable skills."
excerpt: "The research story behind OptimusVLA, BehaviorVLA, and Optimus-R: evolving memory from action priors to behavior representations and reusable skills."
date: 2026-07-21
lang: en
translation_key: memory-centric-vla
stats_key: memory-centric-vla
permalink: /blog/en/memory-centric-vla/
reading_time: "10 min read"
tags:
  - VLA
  - Memory
  - Robotics
cover: /images/blog/memory-centric-vla/cover-memory-centric-vla.png
cover_width: 1672
cover_height: 941
cover_alt: "A memory-centric VLA research path from action trajectories to behavior representations and reusable skills"
---

Vision-Language-Action (VLA) models are becoming one of the most promising directions for general-purpose robotics. By connecting visual perception, language understanding, and action generation in a unified system, they allow robots to move from understanding a task to executing it.

Yet while working on VLA models, I kept returning to a simple question:

> A robot may see, understand, and act — but does it truly remember what it has learned before?

Most current VLA systems still compress their knowledge into model parameters. When a robot encounters a new task, scene, or domain, adaptation is usually performed by fine-tuning the model again. Past trajectories, behaviors, and skills may be implicitly embedded in the weights, but they are rarely available in a form that can be explicitly retrieved, interpreted, reused, or updated.

This question led to a broader research direction:

> How can memory evolve from an auxiliary component into a central mechanism for generalization, transfer, and continual adaptation in VLA models?

My recent work explores this direction through three successive stages:

- **OptimusVLA**: from no explicit memory to active retrieval of past experience;
- **BehaviorVLA**: from storing action trajectories to learning behavior representations;
- **Optimus-R**: from using memory during inference to making memory the primary substrate of adaptation.

Together, these works trace a continuous evolution:

**Action Trajectory → Behavior Representation → Reusable Skill**

and:

**Generative Prior → Behavioral Condition → Adaptation Substrate**

---

## Stage 1: OptimusVLA — starting action generation from experience

### Why should a robot always start from noise?

Many VLA models rely on diffusion or flow matching to generate continuous actions. These policies usually begin with random Gaussian noise and iteratively transform it into a structured action sequence.

This generative paradigm is expressive, but it also makes an unnatural assumption: every task starts from zero experience.

Real learning does not work that way. Once a robot has learned to pick up a cup, place fruit onto a plate, or move an object into a container, it should be able to reuse the structure of those successful behaviors when facing a related task. It should not have to search again from an entirely random starting point.

This is the central motivation behind OptimusVLA:

> Action generation should not always begin from uninformative noise. Whenever possible, it should begin from structured priors retrieved from past experience.

### Global Prior Memory: turning historical trajectories into action priors

OptimusVLA introduces a **Global Prior Memory (GPM)** that stores previously learned action trajectories.

Given a new observation and language instruction, the model first retrieves semantically similar tasks from memory. It then samples and combines action segments from those trajectories to construct a task-relevant prior, replacing the Gaussian noise that would otherwise initialize the flow policy.

This changes the starting point of generation in a fundamental way. Instead of beginning from a random location in action space, the model begins in a region that is already closer to feasible behavior.

The benefits are immediate:

1. **More efficient generation.** Because the initialization already contains task-relevant structure, fewer refinement steps are required.
2. **More stable action generation.** Priors derived from successful trajectories anchor the policy to more reasonable and executable regions of the action space.

To avoid simply copying old demonstrations, GPM adjusts its guidance according to retrieval similarity. Familiar tasks can rely more heavily on memory, while novel tasks retain greater generative freedom.

### Local Consistency Memory: helping the robot know where it is

A global trajectory prior is useful, but it does not fully solve the execution problem. The robot must also understand **which phase of the task it is currently in**.

Different phases can look nearly identical in a single frame. A drawer that has just been closed, for example, may look very similar to a drawer that has not yet been opened. A policy conditioned only on the current observation may therefore confuse the beginning and the end of a task.

OptimusVLA addresses this with a **Local Consistency Memory (LCM)**. By modeling a short history of recently executed actions, LCM estimates the current task progress and provides a local temporal constraint for the next action chunk.

The two memories therefore play complementary roles:

- **GPM** asks: “How have similar tasks been completed before?”
- **LCM** asks: “Where am I now in the current execution?”

One captures long-term experience; the other captures short-term execution state. Together, they allow the VLA model to act with memory-aware structure rather than relying on frame-wise prediction alone.

<figure class="blog-figure">
  <a
    class="blog-figure__viewport"
    href="/images/blog/memory-centric-vla/optimusvla-framework.png"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="OptimusVLA framework"
  >
    <span class="blog-figure__canvas">
      <img
        class="blog-figure__image"
        src="/images/blog/memory-centric-vla/optimusvla-framework.png"
        alt="OptimusVLA framework"
        width="3261"
        height="1429"
        loading="lazy"
        decoding="async"
      >
    </span>
  </a>
  <figcaption>
    Figure 1. OptimusVLA. Global Prior Memory retrieves task-level action priors, while Local Consistency Memory models recent execution history to improve efficiency and temporal coherence.
  </figcaption>
</figure>

### From no memory to explicit memory usage

OptimusVLA marks the first step in this research direction: **bringing memory directly into the action-generation loop of a VLA model.**

In the standard paradigm, demonstrations are mainly training data and disappear into the model weights after training. In OptimusVLA, past experience becomes an explicit resource that can be retrieved, composed, and reused at inference time.

This design also revealed a deeper limitation. The memory still stores **raw action trajectories**. It remembers what the robot did, but it does not yet capture why those actions form a transferable behavior.

That led naturally to the next question:

> If trajectories are only the surface form of experience, should a VLA model learn to remember behavior itself?

---

## Stage 2: BehaviorVLA — from remembering actions to understanding behavior

### Raw trajectories are not the ideal unit of memory

The same behavior can appear very different at the trajectory level.

A task such as “pick up an object and place it into a container” may involve different objects, backgrounds, lighting conditions, camera viewpoints, and robot initial states. The low-level motion changes, but the underlying behavioral structure remains similar: approach, grasp, transport, and release.

This reveals an important distinction:

> Trajectories are specific; behaviors are transferable.

If memory stores only raw actions, it can easily overfit to trajectory details and fail to capture the structure shared across environments. BehaviorVLA therefore shifts the question from trajectory retrieval to behavior representation learning.

### VBE: extracting behavior from visuomotor trajectories

BehaviorVLA introduces the **Visuomotor Behavior Encoder (VBE)**.

VBE does not encode vision or action in isolation. Instead, it jointly models three interacting streams:

- a **vision stream**, describing what the robot sees;
- an **action stream**, describing what the robot does;
- a **behavior stream**, capturing the task structure implied by their interaction.

Across time, VBE causally models long-horizon dependencies. At each step, cross-modal interaction aggregates visual and action information into behavior tokens.

The objective is not merely to compress trajectories. VBE acts as a selective information bottleneck: it suppresses high-frequency environmental variation such as clutter, texture, and lighting, while preserving the persistent logic of the task.

### Two behavioral coordinates: global prototype and local phase

To make the learned behavior representation useful for control, BehaviorVLA organizes it into two complementary coordinates:

- **Global Prototype**: a relatively scene-invariant representation of the overall task structure;
- **Local Phase State**: a time-varying representation of the current execution progress.

These two variables answer different questions:

- What is the global structure of the task?
- Which part of that structure is currently being executed?

Memory is no longer a static collection of trajectories. It becomes a behavioral coordinate system that supports retrieval, progress estimation, and action generation.

### PBD: instantiating abstract behavior into concrete actions

The next challenge is to transform the abstract behavior back into precise actions for the current scene. BehaviorVLA addresses this with the **Phase-conditioned Behavior Decoder (PBD)**.

Its central idea is:

> First recover the structure of the behavior, then instantiate it according to the current execution phase.

PBD follows a Predictor-Corrector paradigm:

- The **Predictor** unfolds the global prototype into a coarse behavioral skeleton.
- The local phase state identifies the current location along that skeleton.
- The model then produces a phase-aligned structural action prior.
- The **Corrector** refines this prior through a flow policy, adapting it to the current object configuration, environmental disturbance, and contact dynamics.

This design balances global coherence and local flexibility:

- the behavior representation preserves the overall task logic;
- the generative policy retains the ability to react precisely to the current environment.

BehaviorVLA therefore closes the loop between abstraction and control:

**it abstracts behavior from concrete trajectories and instantiates that behavior back into situation-aware actions.**

<figure class="blog-figure">
  <a
    class="blog-figure__viewport"
    href="/images/blog/memory-centric-vla/behaviorvla-framework.png"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="BehaviorVLA framework"
  >
    <span class="blog-figure__canvas">
      <img
        class="blog-figure__image"
        src="/images/blog/memory-centric-vla/behaviorvla-framework.png"
        alt="BehaviorVLA framework"
        width="1168"
        height="612"
        loading="lazy"
        decoding="async"
      >
    </span>
  </a>
  <figcaption>
    Figure 2. BehaviorVLA. The Visuomotor Behavior Encoder learns a global behavior prototype and a local phase state, while the Phase-conditioned Behavior Decoder converts them into progress-aligned actions.
  </figcaption>
</figure>

### From remembering actions to understanding behavior

If OptimusVLA gave the VLA model explicit memory, BehaviorVLA changed what that memory stores.

In OptimusVLA, memory mainly contains historical **action trajectories**. In BehaviorVLA, memory begins to store **behavior representations** grounded in both vision and action.

This is a shift from **action-centric memory** to **behavior-centric memory**.

However, structured behavior representations introduce a new challenge: they may still be **domain-dependent**. When a robot moves from simulation to the real world, or enters a new visual and dynamical environment, the learned behavior space may shift. Adapting to the new domain may still require retraining parts of the behavior module or unfreezing the VLA backbone.

This leads to the third question:

> If the main problem is that the stored skill no longer aligns with the new environment, can adaptation be achieved by updating memory rather than repeatedly rewriting the whole model?

---

## Stage 3: Optimus-R — making memory the substrate of adaptation

### From parameter-centric to memory-centric adaptation

Most current VLA adaptation strategies remain **parameter-centric**.

When the model encounters a new task or domain, the standard solution is to update its weights through gradient descent. This can be effective, but it also creates several structural problems:

- every adaptation requires additional optimization and computation;
- newly acquired skills become entangled in the model parameters;
- old and new skills may interfere with one another;
- continual learning often leads to forgetting.

For a robot expected to operate over long periods, this resembles repeatedly rewriting the same model rather than accumulating reusable experience.

Optimus-R takes a different position:

> When facing a new task or environment, the system should first update the skills stored in memory, rather than immediately fine-tuning the entire backbone.

### Inline Memory: deriving skills inside the VLA policy pathway

Many retrieval-augmented systems attach memory as an external branch: retrieve some context outside the model, then feed it back into the policy.

Such detached memory may match task semantics, but it is only weakly coupled with the native action-conditioning pathway and may fail to preserve fine-grained control information.

Optimus-R introduces an **Inline Memory Interface**. A small set of learnable memory tokens is inserted directly into the VLA prefix stream, allowing them to interact with visual, language, state, and control-relevant information inside the backbone.

Memory is no longer an external database attached to the policy. It becomes part of the policy’s own representation process, producing skill embeddings that are naturally aligned with action generation.

### Query-Skill Memory Bank: explicitly organizing reusable skills

The second core component is the **Query-Skill Memory Bank**.

It separates each memory entry into two roles:

- a **Query Prototype**, which determines *when* the skill should be retrieved;
- a **Skill Value**, which determines *how* the robot should act once the skill is selected.

This decomposition reflects a simple but important insight: retrieval and execution are not the same problem.

A representation that is ideal for similarity matching may not contain enough action detail, while a representation that accurately reconstructs behavior may not be ideal for deciding when that behavior should be invoked. Separating the two makes memory easier to retrieve, reuse, expand, and update.

### Bridge-and-Adapt: updating memory instead of rewriting the model

The defining change in Optimus-R is that adaptation itself becomes a **memory update** problem.

When the robot encounters a new task or environment, the system first asks:

- Can an existing skill already be reused?
- If so, is a local residual update to the corresponding prototype sufficient?
- If not, should a new skill entry be appended to the memory bank?

For cross-domain settings such as sim-to-real transfer, Optimus-R introduces **Bridge-and-Adapt**. Lightweight alignment modules map target-domain queries and skills back into the existing memory space, allowing skills learned in the source domain to remain retrievable and useful.

This leads to a more modular division of labor:

- the **backbone** provides stable, general perception and control capabilities;
- **memory** stores, updates, expands, and reuses concrete skills.

<figure class="blog-figure">
  <a
    class="blog-figure__viewport"
    href="/images/blog/memory-centric-vla/optimus-r-framework.png"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Optimus-R framework"
  >
    <span class="blog-figure__canvas">
      <img
        class="blog-figure__image"
        src="/images/blog/memory-centric-vla/optimus-r-framework.png"
        alt="Optimus-R framework"
        width="3590"
        height="1680"
        loading="lazy"
        decoding="async"
      >
    </span>
  </a>
  <figcaption>
    Figure 3. Optimus-R. The Inline Memory Interface derives query and skill representations within the native VLA pathway, the Query-Skill Memory Bank externalizes reusable skills, and Bridge-and-Adapt enables lightweight cross-domain and continual adaptation.
  </figcaption>
</figure>

### From assisting inference to carrying adaptation

In Optimus-R, memory takes on a fundamentally larger role.

In OptimusVLA, memory mainly assists action generation. In BehaviorVLA, memory carries structured behavior. In Optimus-R, memory becomes the primary place where new tasks are absorbed, new domains are aligned, and old skills are preserved.

The three works therefore form a continuous progression:

- **OptimusVLA**: explicitly retrieve past experience;
- **BehaviorVLA**: represent transferable behavior;
- **Optimus-R**: adapt by updating memory rather than repeatedly fine-tuning the backbone.

---

## From trajectories to behaviors to skills

Looking back, all three works are driven by the same question:

> How can a robot truly benefit from its past instead of starting over for every new task?

Across the three stages, the content of memory evolves:

- in **OptimusVLA**, memory stores historical action trajectories;
- in **BehaviorVLA**, memory stores visuomotor behavior representations;
- in **Optimus-R**, memory stores reusable, updatable, and expandable skills.

At the same time, the role of memory also evolves:

- from a **generative prior**,
- to a **behavioral condition**,
- to an **adaptation substrate**.

The broader message behind this line of work is:

> Future VLA systems should not compress all knowledge into model weights alone. They should also be able to explicitly remember the past, understand behavior, reuse skills, and continue adapting by updating memory.

---

## Closing thoughts: let models provide capability, and let memory carry experience

Larger models, stronger pretraining, and more fine-tuning will certainly continue to advance VLA research. But scaling parameters alone is unlikely to be the only path toward general-purpose robotics.

A robot that operates in the real world over long periods needs not only a strong foundation model, but also a memory system that can be retrieved, updated, composed, and expanded.

Model parameters are well suited for general, shared capabilities. Memory is better suited for concrete experience and evolving skills. The former provides a stable foundation for perception and control; the latter enables continual learning in changing environments.

From OptimusVLA to BehaviorVLA to Optimus-R, the direction I aim to explore is a **memory-centric VLA** paradigm:

**a robot should not hide all of its knowledge inside opaque parameters. It should explicitly remember the past, understand behavior, reuse skills, and adapt to the future by updating memory.**

This is also the direction I hope to continue pursuing: building general robotic systems with long-term memory, continual growth, and the ability to enter new environments without always starting from scratch.
