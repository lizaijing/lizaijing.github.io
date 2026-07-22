(function () {
  "use strict";

  var STORAGE_KEY = "research_blog_visitor_id";
  var root = document.querySelector("[data-blog-stats]");

  if (!root) {
    return;
  }

  var enabled = root.getAttribute("data-enabled") === "true";
  var supabaseUrl = (root.getAttribute("data-supabase-url") || "")
    .replace(/\/+$/, "");
  var publishableKey =
    root.getAttribute("data-supabase-key") || "";
  var postSlug = root.getAttribute("data-post-slug") || "";
  var language = root.getAttribute("data-language") || "en";

  var viewCount = root.querySelector("[data-view-count]");
  var likeCount = root.querySelector("[data-like-count]");
  var shareCount = root.querySelector("[data-share-count]");
  var likeButton = root.querySelector("[data-like-button]");
  var shareButton = root.querySelector("[data-share-button]");
  var toast = document.querySelector("[data-blog-toast]");
  var toastTimer = null;

  var messages =
    language === "zh"
      ? {
          copied: "博客链接已复制",
          liked: "感谢你的点赞",
          unliked: "已取消点赞",
          copyFailed: "复制失败，请手动复制浏览器地址",
          serviceUnavailable: "互动统计暂时不可用"
        }
      : {
          copied: "Blog link copied",
          liked: "Thanks for liking this post",
          unliked: "Like removed",
          copyFailed: "Copy failed. Please copy the browser URL manually.",
          serviceUnavailable: "Engagement statistics are temporarily unavailable"
        };

  function createUuid() {
    if (
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      return window.crypto.randomUUID();
    }

    var bytes = new Uint8Array(16);

    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var index = 0; index < bytes.length; index += 1) {
        bytes[index] = Math.floor(Math.random() * 256);
      }
    }

    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;

    var hex = Array.prototype.map
      .call(bytes, function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");

    return (
      hex.slice(0, 8) +
      "-" +
      hex.slice(8, 12) +
      "-" +
      hex.slice(12, 16) +
      "-" +
      hex.slice(16, 20) +
      "-" +
      hex.slice(20)
    );
  }

  function getVisitorId() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);

      if (
        stored &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          stored
        )
      ) {
        return stored;
      }

      var generated = createUuid();
      window.localStorage.setItem(STORAGE_KEY, generated);
      return generated;
    } catch (error) {
      return createUuid();
    }
  }

  var visitorId = getVisitorId();

  function formatCount(value) {
    var number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
      return "0";
    }

    if (number >= 1000000) {
      return (number / 1000000).toFixed(number >= 10000000 ? 0 : 1) + "M";
    }

    if (number >= 1000) {
      return (number / 1000).toFixed(number >= 10000 ? 0 : 1) + "K";
    }

    return String(Math.floor(number));
  }

  function showToast(message) {
    if (!toast) {
      return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;

    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");

      window.setTimeout(function () {
        toast.hidden = true;
      }, 180);
    }, 2200);
  }

  function updateStats(stats) {
    if (!stats || typeof stats !== "object") {
      return;
    }

    if (viewCount) {
      viewCount.textContent = formatCount(stats.views);
    }

    if (likeCount) {
      likeCount.textContent = formatCount(stats.likes);
    }

    if (shareCount) {
      shareCount.textContent = formatCount(stats.shares);
    }

    if (likeButton) {
      var liked = Boolean(stats.liked);
      likeButton.classList.toggle("is-active", liked);
      likeButton.setAttribute("aria-pressed", liked ? "true" : "false");
    }

    root.classList.remove("is-loading");
  }

  async function rpc(functionName) {
    var response = await window.fetch(
      supabaseUrl + "/rest/v1/rpc/" + functionName,
      {
        method: "POST",
        headers: {
          apikey: publishableKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          p_slug: postSlug,
          p_visitor_id: visitorId
        }),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      var body = "";

      try {
        body = await response.text();
      } catch (error) {
        body = "";
      }

      throw new Error(
        "Blog stats request failed: " +
          response.status +
          (body ? " " + body : "")
      );
    }

    return response.json();
  }

  async function copyToClipboard(text) {
    if (
      navigator.clipboard &&
      window.isSecureContext &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return;
    }

    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    var copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error("document.execCommand('copy') failed");
    }
  }

  async function initialize() {
    if (
      !enabled ||
      !supabaseUrl ||
      !publishableKey ||
      !postSlug ||
      supabaseUrl.indexOf("YOUR_PROJECT_REF") !== -1 ||
      publishableKey.indexOf("YOUR_SUPABASE") !== -1
    ) {
      root.hidden = true;
      return;
    }

    root.classList.add("is-loading");

    try {
      var stats = await rpc("register_blog_post_view");
      updateStats(stats);

      window.setInterval(function () {
        if (document.visibilityState !== "visible") {
          return;
        }

        rpc("get_blog_post_stats")
          .then(updateStats)
          .catch(function (error) {
            console.error(error);
          });
      }, 15000);
    } catch (error) {
      console.error(error);
      root.classList.remove("is-loading");
      root.classList.add("has-error");
    }
  }

  if (likeButton) {
    likeButton.addEventListener("click", async function () {
      if (likeButton.disabled) {
        return;
      }

      likeButton.disabled = true;

      try {
        var stats = await rpc("toggle_blog_post_like");
        updateStats(stats);
        showToast(stats.liked ? messages.liked : messages.unliked);
      } catch (error) {
        console.error(error);
        showToast(messages.serviceUnavailable);
      } finally {
        likeButton.disabled = false;
      }
    });
  }

  if (shareButton) {
    shareButton.addEventListener("click", async function () {
      if (shareButton.disabled) {
        return;
      }

      shareButton.disabled = true;

      var canonicalLink =
        document.querySelector('link[rel="canonical"]') &&
        document.querySelector('link[rel="canonical"]').href
          ? document.querySelector('link[rel="canonical"]').href
          : window.location.href.split("#")[0];

      try {
        await copyToClipboard(canonicalLink);
        showToast(messages.copied);

        try {
          var stats = await rpc("register_blog_post_share");
          updateStats(stats);
        } catch (statsError) {
          console.error(statsError);
        }
      } catch (error) {
        console.error(error);
        showToast(messages.copyFailed);
      } finally {
        shareButton.disabled = false;
      }
    });
  }

  initialize();
})();
