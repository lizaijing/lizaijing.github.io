---
title: "Blog"
permalink: /blog/
layout: default
author_profile: false
excerpt: "Research notes on embodied agents, memory systems, and vision-language-action models."
---

<div class="blog-index">

  <header class="blog-index__header">
    <p class="blog-index__eyebrow">
      RESEARCH · IDEAS · NOTES
    </p>

    <h1>Blog</h1>

    <p class="blog-index__intro">
      Notes on embodied agents, memory systems, and
      vision-language-action models.
    </p>

    <nav class="blog-language-nav" aria-label="Blog languages">
      <a href="#chinese">中文</a>
      <span aria-hidden="true">·</span>
      <a href="#english">English</a>
    </nav>
  </header>

  <section class="blog-section" id="chinese">
    <div class="blog-section__heading">
      <h2>中文文章</h2>
      <span>Chinese</span>
    </div>

    {% assign chinese_posts = site.posts | where: "lang", "zh" %}

    {% if chinese_posts == empty %}
      <p class="blog-empty">
        中文文章即将发布。
      </p>
    {% else %}
      <div class="blog-grid">
        {% for post in chinese_posts %}
          {% include blog-card.html post=post %}
        {% endfor %}
      </div>
    {% endif %}
  </section>

  <section class="blog-section" id="english">
    <div class="blog-section__heading">
      <h2>English</h2>
      <span>英文文章</span>
    </div>

    {% assign english_posts = site.posts | where: "lang", "en" %}

    {% if english_posts == empty %}
      <p class="blog-empty">
        English posts are coming soon.
      </p>
    {% else %}
      <div class="blog-grid">
        {% for post in english_posts %}
          {% include blog-card.html post=post %}
        {% endfor %}
      </div>
    {% endif %}
  </section>

</div>
