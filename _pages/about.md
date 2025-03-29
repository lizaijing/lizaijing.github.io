---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

Hi, I'm Zaijing Li (李在京 in Chinese). I'm currently working toward the Ph.D. degree with the School of Computer Science and Technology, [Harbin Institute of Technology (Shenzhen)](https://www.hitsz.edu.cn/), advised by Prof. [Liqiang Nie](https://liqiangnie.github.io/), and I collaborate closely with Prof. [Rui Shao](https://rshaojimmy.github.io/) and Prof. [Dongmei Jiang](https://scholar.google.com/citations?hl=en&user=Awsue7sAAAAJ). Prior to my Ph.D., I received a Bachelor’s degree in Electronic Information Science and Technology from [Central South University](https://www.csu.edu.cn/) in 2020, and a Master’s degree in Computer Science and Technology from [Central South University](https://www.csu.edu.cn/) in 2023, advised by Prof. [Ming Zhao](http://ainetlab.net/index.html) and Prof. [Fengxiao Tang](https://scholar.google.com/citations?user=_QJD5MgAAAAJ&hl=en&authuser=1). My research interests predominantly lie in the fields of affective computing, multimodal large language model, reinforcement learning, and open world agents.

# 🔥 News
- *2025.02*: &nbsp;🎉🎉 Our work on open-world agents, [**Optimus-2**](https://arxiv.org/pdf/2502.19902), has been accepted by CVPR 2025 :smile:
- *2024.09*: &nbsp;🎉🎉 Our work on open-world agents, [**Optimus-1**](https://arxiv.org/pdf/2408.03615), has been accepted by NeurIPS 2024 :smile:
- *2024.06*: &nbsp;🎉🎉 We win the first place of EgoSchema track in CVPR 2024 Ego4D Challenge :smile:
- *2024.02*: &nbsp;🎉🎉 Our recent work on emotional generation of LLM is now on [arXiv](https://arxiv.org/pdf/2401.06836).
- *2023.08*: &nbsp;🎉🎉 Our [paper](https://dl.acm.org/doi/abs/10.1145/3581783.3612336) about multi-task modeling for emotion recognition is accepted to ACM MM 2023 :smile:

# 📖 Education
- *2023.09 - present*, Computer Science and Technology Ph.D. student at HITSZ, China
- *2020.09 - 2023.06*, Master’s degrees in Computer Science and Technology, Central South University, China
- *2016.09 - 2020.06*, Bachelor's degree in Electronic Information Science and Technology, Central South University, China


# 📝 Publications 

Below is a list of selected publications. Please refer to my [Google Scholar](https://scholar.google.com/citations?user=TDBF2UoAAAAJ) page for the full list of publications.

(* denotes corresponding author)

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPR 2025</div><img src='thumbnails/optimus2.png' alt="sym" width="500px"></div></div>
<div class='paper-box-text' markdown="1">

**Optimus-2: Multimodal Minecraft Agent with Goal-Observation-Action Conditioned Policy**

**<u>Zaijing Li</u>**, Yuquan Xie, Rui Shao\*, Gongwei Chen, Dongmei Jiang, Liqiang Nie\*

[**CVPR 2025**](https://cvpr.thecvf.com/Conferences/2025) / [Paper](https://arxiv.org/pdf/2502.19902) / [Code](https://github.com/lizaijing/Optimus-2) / [Project page](https://cybertronagent.github.io/Optimus-2.github.io/)

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">NeurIPS 2024</div><img src='thumbnails/optimus1.png' alt="sym" width="500px"></div></div>
<div class='paper-box-text' markdown="1">

**Optimus-1: Hybrid Multimodal Memory Empowered Agents Excel in Long-Horizon Tasks**

**<u>Zaijing Li</u>**, Yuquan Xie, Rui Shao\*, Gongwei Chen, Dongmei Jiang, Liqiang Nie\*

[**NeurIPS 2024**](https://neurips.cc/Conferences/2024) / [Paper](https://arxiv.org/pdf/2408.03615) / [Code](https://github.com/JiuTian-VL/Optimus-1) / [Project page](https://cybertronagent.github.io/Optimus-1.github.io/)

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPRW 2024</div><img src='thumbnails/hcqa.png' alt="sym" width="500px"></div></div>
<div class='paper-box-text' markdown="1">

**HCQA @ Ego4D EgoSchema Challenge 2024**

Haoyu Zhang, Yuquan Xie, Yisen Feng, **<u>Zaijing Li</u>**, Meng Liu, Liqiang Nie

[**Winner Solution for Ego4D-EgoSchema Challenge**](https://eval.ai/web/challenges/challenge-page/2238/overview) / [Paper](https://arxiv.org/pdf/2406.15771) / [Code](https://github.com/Hyu-Zhang/HCQA)

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPRW 2024</div><img src='thumbnails/objectnlq.png' alt="sym" width="500px"></div></div>
<div class='paper-box-text' markdown="1">

**ObjectNLQ@ Ego4D Episodic Memory Challenge 2024**

Yisen Feng, Haoyu Zhang, Yuquan Xie, **<u>Zaijing Li</u>**, Meng Liu, Liqiang Nie

[**Runner-up Solution for Ego4D-NLQ Challenge**](https://eval.ai/web/challenges/challenge-page/1629/overview) / [Paper](https://arxiv.org/pdf/2406.15778) / [Code](https://github.com/Yisen-Feng/ObjectNLQ)

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">arXiv 2024</div><img src='thumbnails/ecot.png' alt="sym" width="500px"></div></div>
<div class='paper-box-text' markdown="1">

**Enhancing Emotional Generation Capability of Large Language Models via Emotional Chain-of-Thought**

**<u>Zaijing Li</u>**, Rui Shao\*, Gongwei Chen, Yuquan Xie, Dongmei Jiang, Liqiang Nie\*

arXiv 2024 / [Paper](https://arxiv.org/pdf/2401.06836) 

</div>
</div>


<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ACM MM 2023</div><img src='thumbnails/unisa.png' alt="sym" width="500px"></div></div>
<div class='paper-box-text' markdown="1">

**Unisa: Unified Generative Framework for Sentiment Analysis**

**<u>Zaijing Li</u>**, Ting-En Lin, Yuchuan Wu, Meng Liu, Fengxiao Tang\*, Ming Zhao\*, Yongbin Li\*

[**ACM MM 2023**](https://www.acmmm2023.org/) / [Paper](https://dl.acm.org/doi/abs/10.1145/3581783.3612336) / [Code](https://github.com/lizaijing/UniSA) 

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ACL 2022 Findings</div><img src='thumbnails/emocaps.png' alt="sym" width="500px"></div></div>
<div class='paper-box-text' markdown="1">

**EmoCaps: Emotion Capsule based Model for Conversational Emotion Recognition**

**<u>Zaijing Li</u>**, Fengxiao Tang\*, Ming Zhao\*, Yusen Zhu

[**ACL 2022 Findings**](https://www.acmmm2023.org/) / [Paper](https://arxiv.org/pdf/2203.13504) / [Code](https://aclanthology.org/2022.findings-acl.126/) 

</div>
</div>


# 🎯 Awards
- **CVPR 2024** - EGO4D Challenge Ego Schema Track, **1st Place Award**
- **CVPR 2024** - EGO4D Challenge Natural Language Queries Track, **2nd Place Award**
- **CVPR 2024** - EGO4D Challenge Goal Steps Track, **3rd Place Award**
- **Outstanding Master's Thesis Award** of Hunan Computer Federation, 2024
- **National Graduate Scholarship**, 2022
- National College Student Optoelectronic Design Competition, **Third Prize**, 2018
- Huawei Cup National College Student Intelligent Design Competition, **First Prize**, 2018


# 💗 Academic Services
- **Conference Reviewer**: CVPR, ICCV, NeurIPS, ICML, ICLR, ACM MM, ACL, EMNLP, COLING.
- **Journal Reviewer**: IEEE TKDE.

  
# 💻 Internships
- *2022.08 - 2023.03*, Research Intern, DAMO Academy, Alibaba Group, Beijing, China.
- *2023.05 - 2023.11*, Research Intern, DAMO Academy, Alibaba Group, Hangzhou, China.
