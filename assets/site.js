(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var filterPanels = document.querySelectorAll('[data-filter-panel]');
  filterPanels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-search]');
    var sort = panel.querySelector('[data-filter-sort]');
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden-by-filter', query && haystack.indexOf(query) === -1);
      });
    }

    function applySort() {
      var value = sort ? sort.value : 'default';
      var ordered = cards.slice();
      if (value === 'year-desc') {
        ordered.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }
      if (value === 'year-asc') {
        ordered.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      }
      ordered.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (sort) {
      sort.addEventListener('change', applySort);
    }
  });

  var globalSearch = document.querySelector('[data-global-search]');
  if (globalSearch && window.SEARCH_MOVIES) {
    var searchInput = globalSearch.querySelector('input');
    var results = document.querySelector('[data-search-results]');

    function renderSearch(items, message) {
      if (!results) {
        return;
      }
      if (!items.length) {
        results.innerHTML = '<p class="empty-state">' + message + '</p>';
        return;
      }
      results.innerHTML = items.slice(0, 80).map(function (movie) {
        return '<a class="search-result-card" href="' + movie.url + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<div><h3>' + escapeHtml(movie.title) + '</h3>' +
          '<p>' + escapeHtml(movie.year + '年 · ' + movie.category + ' · ' + movie.region) + '</p></div>' +
          '</a>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    globalSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim().toLowerCase();
      if (!query) {
        renderSearch([], '请输入关键词查找剧集。');
        return;
      }
      var found = window.SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.category, movie.region, movie.type, movie.year, movie.tags].join(' ').toLowerCase().indexOf(query) !== -1;
      });
      renderSearch(found, '没有找到匹配内容。');
    });
  }
})();

function initMoviePlayer(source) {
  var video = document.getElementById('movie-video');
  var cover = document.getElementById('player-cover');
  if (!video || !cover || !source) {
    return;
  }

  var attached = false;
  var hlsInstance = null;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    attachSource();
    cover.classList.add('is-hidden');
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        cover.classList.remove('is-hidden');
      });
    }
  }

  cover.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
