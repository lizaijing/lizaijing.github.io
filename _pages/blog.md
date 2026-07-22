---
title: "Research · Ideas · Notes"
permalink: /blog/
layout: blog-index
author_profile: false
excerpt: "Research notes on embodied agents, memory systems, and vision-language-action models."
---

{% assign chinese_posts = site.posts | where: "lang", "zh" %}
{% assign english_posts = site.posts | where: "lang", "en" %}

<div class="research-blog" data-blog-tabs>
  <header class="research-blog__hero">
    <div class="research-blog__ornament" aria-hidden="true">
      <span></span>
    </div>

    <p class="research-blog__eyebrow">PERSONAL RESEARCH BLOG</p>

    <h1 class="research-blog__title">
      RESEARCH <span>·</span> IDEAS <span>·</span> NOTES
    </h1>

    <p class="research-blog__intro">
      Notes on embodied agents, memory systems, and
      vision-language-action models.
    </p>

    <div class="research-blog__controls">
      <div
        class="research-blog__tabs"
        role="tablist"
        aria-label="Blog language"
      >
        <button
          id="blog-tab-zh"
          class="research-blog__tab is-active"
          type="button"
          role="tab"
          aria-selected="true"
          aria-controls="blog-panel-zh"
          data-blog-language="zh"
        >
          中文
        </button>

        <button
          id="blog-tab-en"
          class="research-blog__tab"
          type="button"
          role="tab"
          aria-selected="false"
          aria-controls="blog-panel-en"
          data-blog-language="en"
          tabindex="-1"
        >
          English
        </button>
      </div>

      <a
        class="research-blog__homepage"
        href="{{ '/' | relative_url }}"
        target="_self"
        aria-label="Go to homepage"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M3 10.8 12 3l9 7.8"></path>
          <path d="M5.5 9.8V21h13V9.8"></path>
          <path d="M9.5 21v-6.5h5V21"></path>
        </svg>

        <span>Homepage</span>
      </a>
    </div>
  </header>

  <div class="research-blog__panels">
    <section
      id="blog-panel-zh"
      class="research-blog__panel is-active"
      role="tabpanel"
      aria-labelledby="blog-tab-zh"
      data-blog-panel="zh"
    >
      <div class="research-blog__grid">
        {% for post in chinese_posts %}
          {% include blog-card.html post=post %}
        {% endfor %}
      </div>
    </section>

    <section
      id="blog-panel-en"
      class="research-blog__panel"
      role="tabpanel"
      aria-labelledby="blog-tab-en"
      data-blog-panel="en"
      hidden
    >
      <div class="research-blog__grid">
        {% for post in english_posts %}
          {% include blog-card.html post=post %}
        {% endfor %}
      </div>
    </section>
  </div>
</div>
