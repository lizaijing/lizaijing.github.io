---
title: "Blog"
permalink: /blog/
layout: blog-index
author_profile: false
excerpt: "Research notes on embodied agents, memory systems, and vision-language-action models."
---

{% assign chinese_posts = site.posts | where: "lang", "zh" %}
{% assign english_posts = site.posts | where: "lang", "en" %}

<div class="blog-index" data-blog-tabs>

  <header class="blog-hero">

    <div class="blog-hero__mark" aria-hidden="true">
      <span></span>
    </div>

    <h1 class="blog-hero__title">
      RESEARCH · IDEAS · NOTES
    </h1>

    <p class="blog-hero__intro">
      Notes on embodied agents, memory systems, and
      vision-language-action models.
    </p>

    <div
      class="blog-tabs"
      role="tablist"
      aria-label="Blog language"
    >
      <button
        id="blog-tab-zh"
        class="blog-tab is-active"
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
        class="blog-tab"
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

  </header>


  <div class="blog-panels">

    <section
      id="blog-panel-zh"
      class="blog-panel is-active"
      role="tabpanel"
      aria-labelledby="blog-tab-zh"
      data-blog-panel="zh"
    >
      <div class="blog-grid">
        {% for post in chinese_posts %}
          {% include blog-card.html post=post %}
        {% endfor %}
      </div>
    </section>


    <section
      id="blog-panel-en"
      class="blog-panel"
      role="tabpanel"
      aria-labelledby="blog-tab-en"
      data-blog-panel="en"
      hidden
    >
      <div class="blog-grid">
        {% for post in english_posts %}
          {% include blog-card.html post=post %}
        {% endfor %}
      </div>
    </section>

  </div>

</div>


<script>
  document.addEventListener("DOMContentLoaded", function () {
    const root = document.querySelector("[data-blog-tabs]");

    if (!root) {
      return;
    }

    const tabs = Array.from(
      root.querySelectorAll("[data-blog-language]")
    );

    const panels = Array.from(
      root.querySelectorAll("[data-blog-panel]")
    );

    function activateLanguage(language, moveFocus) {
      tabs.forEach(function (tab) {
        const isActive =
          tab.dataset.blogLanguage === language;

        tab.classList.toggle("is-active", isActive);
        tab.setAttribute(
          "aria-selected",
          isActive ? "true" : "false"
        );

        tab.tabIndex = isActive ? 0 : -1;

        if (isActive && moveFocus) {
          tab.focus();
        }
      });

      panels.forEach(function (panel) {
        const isActive =
          panel.dataset.blogPanel === language;

        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateLanguage(
          tab.dataset.blogLanguage,
          false
        );
      });

      tab.addEventListener("keydown", function (event) {
        let targetIndex = null;

        if (
          event.key === "ArrowRight" ||
          event.key === "ArrowDown"
        ) {
          targetIndex = (index + 1) % tabs.length;
        }

        if (
          event.key === "ArrowLeft" ||
          event.key === "ArrowUp"
        ) {
          targetIndex =
            (index - 1 + tabs.length) % tabs.length;
        }

        if (event.key === "Home") {
          targetIndex = 0;
        }

        if (event.key === "End") {
          targetIndex = tabs.length - 1;
        }

        if (targetIndex !== null) {
          event.preventDefault();

          activateLanguage(
            tabs[targetIndex].dataset.blogLanguage,
            true
          );
        }
      });
    });
  });
</script>
