---
title: "Blog"
permalink: /blog/
layout: blog-index
author_profile: false
excerpt: "Research notes on embodied agents, memory systems, and vision-language-action models."
---

{% assign chinese_posts = site.posts | where: "lang", "zh" %}
{% assign english_posts = site.posts | where: "lang", "en" %}

<div class="blog-index">

  <header class="blog-hero">
    <div class="blog-hero__decoration" aria-hidden="true"></div>

    <div class="blog-hero__content">
      <p class="blog-hero__eyebrow">
        <span class="blog-hero__eyebrow-dot"></span>
        RESEARCH · IDEAS · NOTES
      </p>

      <h1>Blog</h1>

      <p class="blog-hero__intro">
        Notes on embodied agents, memory systems, and
        vision-language-action models.
      </p>

      <nav class="blog-language-nav" aria-label="Blog languages">
        <a href="#chinese">
          <span>中文</span>
          <small>{{ chinese_posts | size }}</small>
        </a>

        <a href="#english">
          <span>English</span>
          <small>{{ english_posts | size }}</small>
        </a>
      </nav>
    </div>
  </header>


  <section class="blog-section" id="chinese">
    <header class="blog-section__heading">
      <div>
        <p class="blog-section__label">CHINESE POSTS</p>
        <h2>中文文章</h2>
      </div>

      <span class="blog-section__count">
        {{ chinese_posts | size }}
        {% if chinese_posts.size == 1 %}
          post
        {% else %}
          posts
        {% endif %}
      </span>
    </header>

    {% if chinese_posts == empty %}
      <div class="blog-empty">
        <span class="blog-empty__icon">✦</span>

        <div>
          <strong>中文文章即将发布</strong>
          <p>新的研究笔记正在整理中。</p>
        </div>
      </div>
    {% else %}
      <div class="blog-grid">
        {% for post in chinese_posts %}
          {% include blog-card.html post=post %}
        {% endfor %}
      </div>
    {% endif %}
  </section>


  <section class="blog-section" id="english">
    <header class="blog-section__heading">
      <div>
        <p class="blog-section__label">ENGLISH POSTS</p>
        <h2>English</h2>
      </div>

      <span class="blog-section__count">
        {{ english_posts | size }}
        {% if english_posts.size == 1 %}
          post
        {% else %}
          posts
        {% endif %}
      </span>
    </header>

    {% if english_posts == empty %}
      <div class="blog-empty">
        <span class="blog-empty__icon">✦</span>

        <div>
          <strong>English posts are coming soon</strong>
          <p>More research stories will be published here.</p>
        </div>
      </div>
    {% else %}
      <div class="blog-grid">
        {% for post in english_posts %}
          {% include blog-card.html post=post %}
        {% endfor %}
      </div>
    {% endif %}
  </section>

</div>
