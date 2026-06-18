(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });

    start();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    if (!input || !results || typeof siteSearchIndex === "undefined") {
      return;
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<div class="search-result-item"><strong>暂未找到相关内容</strong><small>可以尝试更换关键词</small></div>';
        results.classList.add("is-open");
        return;
      }
      results.innerHTML = items.map(function (item) {
        return '<a class="search-result-item" href="' + escapeHTML(item.href) + '">' +
          '<strong>' + escapeHTML(item.title) + '</strong>' +
          '<small>' + escapeHTML(item.region) + ' · ' + escapeHTML(item.year) + ' · ' + escapeHTML(item.genre) + '</small>' +
          '</a>';
      }).join("");
      results.classList.add("is-open");
    }

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }
      var found = siteSearchIndex.filter(function (item) {
        var text = [item.title, item.region, item.year, item.genre, item.type, item.tags, item.oneLine].join(" ").toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 24);
      render(found);
    });

    document.addEventListener("click", function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        results.classList.remove("is-open");
      }
    });
  }

  function setupFilters() {
    var bar = document.querySelector("[data-filter-bar]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!bar || !cards.length) {
      return;
    }
    var buttons = Array.prototype.slice.call(bar.querySelectorAll("button"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        var key = button.getAttribute("data-filter-key");
        var value = button.getAttribute("data-filter-value");
        cards.forEach(function (card) {
          var visible = key === "all" || card.getAttribute("data-" + key) === value;
          card.style.display = visible ? "" : "none";
        });
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupCarousel();
    setupSearch();
    setupFilters();
  });
})();

function initPlayer(streamUrl) {
  var video = document.querySelector("[data-player]");
  var button = document.querySelector("[data-play-button]");
  if (!video || !streamUrl) {
    return;
  }
  var loaded = false;
  var hlsInstance = null;

  function load() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function begin() {
    load();
    if (button) {
      button.classList.add("is-hidden");
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", begin);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (button && video.currentTime === 0) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
