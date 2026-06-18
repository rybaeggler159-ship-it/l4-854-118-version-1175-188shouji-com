(function () {
  function closestScope(element) {
    return element.closest("[data-search-scope]") || document;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function matchesFilter(card, filter) {
    var type = normalize(card.getAttribute("data-type"));
    var region = normalize(card.getAttribute("data-region"));
    var year = Number(card.getAttribute("data-year") || 0);
    if (filter === "movie") {
      return type.indexOf("电影") !== -1 || type.indexOf("movie") !== -1;
    }
    if (filter === "series") {
      return type.indexOf("剧") !== -1 || type.indexOf("动漫") !== -1 || type.indexOf("综艺") !== -1;
    }
    if (filter === "recent") {
      return year >= 2024;
    }
    if (filter === "europe") {
      return /(欧美|美国|英国|法国|加拿大|意大利|西班牙|德国|爱尔兰|俄罗斯|波兰)/.test(region);
    }
    if (filter === "asia") {
      return /(中国|日本|韩国|泰国|亚洲|香港|台湾|印度)/.test(region);
    }
    return true;
  }

  function applySearch(scope) {
    var input = scope.querySelector("[data-movie-search]");
    var query = input ? normalize(input.value) : "";
    var filter = scope.getAttribute("data-active-filter") || "all";
    var cards = scope.querySelectorAll("[data-movie-card]");
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search") || card.textContent);
      var show = (!query || haystack.indexOf(query) !== -1) && matchesFilter(card, filter);
      card.classList.toggle("is-hidden", !show);
    });
  }

  function initSearch() {
    document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-movie-search]");
      var buttons = scope.querySelectorAll("[data-filter]");
      if (input) {
        input.addEventListener("input", function () {
          applySearch(scope);
        });
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          scope.setAttribute("data-active-filter", button.getAttribute("data-filter") || "all");
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applySearch(scope);
        });
      });
    });
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var next = slider.querySelector("[data-hero-next]");
      var prev = slider.querySelector("[data-hero-prev]");
      var index = 0;
      if (!slides.length) {
        return;
      }
      function show(target) {
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
        });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 6200);
    });
  }

  window.setupMoviePlayer = function (videoId, coverId, stream) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var attached = false;
    if (!video || !cover || !stream) {
      return;
    }

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    function start() {
      cover.classList.add("is-hidden");
      if (attached) {
        playVideo();
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        attached = true;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        attached = true;
        return;
      }
      video.src = stream;
      attached = true;
      playVideo();
    }

    cover.addEventListener("click", start);
    cover.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        start();
      }
    });
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
