(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var isOpen = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });

      show(0);
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    var quickForm = document.querySelector("[data-quick-search]");

    if (quickForm) {
      quickForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = quickForm.querySelector("input");
        var query = input ? input.value.trim() : "";
        var target = "search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    }

    var filterRoot = document.querySelector("[data-filter-root]");

    if (filterRoot) {
      var keyword = filterRoot.querySelector("[data-filter-keyword]");
      var region = filterRoot.querySelector("[data-filter-region]");
      var type = filterRoot.querySelector("[data-filter-type]");
      var year = filterRoot.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-movie-card]"));
      var empty = filterRoot.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (keyword && initialQuery) {
        keyword.value = initialQuery;
      }

      function includesText(source, value) {
        return String(source || "").toLowerCase().indexOf(value) !== -1;
      }

      function applyFilters() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var r = region ? region.value : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var ok = true;

          if (q && !includesText(haystack, q)) {
            ok = false;
          }
          if (r && card.getAttribute("data-region") !== r) {
            ok = false;
          }
          if (t && card.getAttribute("data-type") !== t) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var buttons = shell.querySelectorAll("[data-play]");
      var source = video ? video.getAttribute("data-src") : "";
      var started = false;
      var hlsInstance = null;

      function startPlayback() {
        if (!video || !source) {
          return;
        }

        shell.classList.add("is-playing");
        video.controls = true;

        if (started) {
          video.play().catch(function () {});
          return;
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {});
          }, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }

      Array.prototype.slice.call(buttons).forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          startPlayback();
        });
      });

      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            startPlayback();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
