(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-target')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 6500);
  }

  function setupFiltering() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
      var section = panel.closest('.page-section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card, .list-card'));
      var search = panel.querySelector('.local-search');
      var genre = panel.querySelector('.genre-filter');
      var region = panel.querySelector('.region-filter');
      var year = panel.querySelector('.year-filter');
      var empty = section.querySelector('.empty-state');
      var params = new URLSearchParams(window.location.search);
      if (search && params.get('q')) {
        search.value = params.get('q');
      }
      function apply() {
        var q = normalize(search && search.value);
        var g = normalize(genre && genre.value);
        var r = normalize(region && region.value);
        var y = normalize(year && year.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardGenre = normalize(card.getAttribute('data-genre'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = (!q || text.indexOf(q) !== -1) && (!g || cardGenre.indexOf(g) !== -1) && (!r || cardRegion.indexOf(r) !== -1) && (!y || cardYear.indexOf(y) !== -1);
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('visible', visible === 0);
        }
      }
      [search, genre, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-box'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-button');
      var label = player.querySelector('.player-state');
      var stream = player.getAttribute('data-stream');
      var loaded = false;
      var hls = null;
      function setLabel(text) {
        if (label) {
          label.textContent = text;
        }
      }
      function load() {
        if (loaded || !video || !stream) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setLabel('视频暂时无法播放，请稍后再试');
              player.classList.remove('is-playing');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          setLabel('视频暂时无法播放，请稍后再试');
        }
      }
      function play() {
        load();
        if (!video) {
          return;
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            video.addEventListener('canplay', function () {
              video.play().catch(function () {});
            }, { once: true });
          });
        }
      }
      function toggle() {
        if (!video) {
          return;
        }
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', toggle);
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          player.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
          player.classList.remove('is-playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFiltering();
    setupPlayers();
  });
})();
