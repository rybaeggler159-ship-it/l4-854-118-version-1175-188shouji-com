(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var list = document.querySelector("[data-search-list]");

    if (list) {
      var items = Array.prototype.slice.call(list.querySelectorAll(".searchable-item"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (filterInput && initialQuery) {
        filterInput.value = initialQuery;
      }

      function applyFilters() {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var year = yearFilter ? yearFilter.value : "";
        var category = categoryFilter ? categoryFilter.value : "";

        items.forEach(function (item) {
          var haystack = (item.getAttribute("data-search") || "").toLowerCase();
          var itemYear = item.getAttribute("data-year") || "";
          var visible = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            visible = false;
          }

          if (year && itemYear !== year) {
            visible = false;
          }

          if (category && haystack.indexOf(category.toLowerCase()) === -1) {
            visible = false;
          }

          item.classList.toggle("is-hidden-by-filter", !visible);
        });
      }

      if (filterInput) {
        filterInput.addEventListener("input", applyFilters);
      }

      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
      }

      if (categoryFilter) {
        categoryFilter.addEventListener("change", applyFilters);
      }

      applyFilters();
    }
  });
})();

function setupMoviePlayer(source) {
  var video = document.getElementById("moviePlayer");
  var button = document.getElementById("playerStart");
  var hlsInstance = null;
  var initialized = false;

  if (!video || !button || !source) {
    return;
  }

  function attachSource() {
    if (initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    attachSource();
    video.controls = true;
    button.classList.add("is-hidden");

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", startPlayback);

  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
