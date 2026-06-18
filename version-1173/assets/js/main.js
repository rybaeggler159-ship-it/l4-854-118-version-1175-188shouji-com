(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupCardFilters() {
        var input = document.querySelector('[data-card-search]');
        var sorter = document.querySelector('[data-card-sort]');
        var list = document.querySelector('[data-card-list]');
        var counter = document.querySelector('[data-visible-count]');

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        var originalOrder = cards.slice();

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (counter) {
                counter.textContent = String(visible);
            }
        }

        function sortCards() {
            var mode = sorter ? sorter.value : 'default';
            var sorted = cards.slice();

            if (mode === 'year-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            } else if (mode === 'year-asc') {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                });
            } else if (mode === 'title') {
                sorted.sort(function (a, b) {
                    return String(a.getAttribute('data-search')).localeCompare(String(b.getAttribute('data-search')), 'zh-CN');
                });
            } else {
                sorted = originalOrder.slice();
            }

            sorted.forEach(function (card) {
                list.appendChild(card);
            });
            cards = sorted;
            apply();
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (sorter) {
            sorter.addEventListener('change', sortCards);
        }
        apply();
    }

    function setupPlayer() {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }

        var video = player.querySelector('[data-video-element]');
        var button = player.querySelector('[data-play-button]');
        var status = player.querySelector('[data-player-status]');
        var source = player.getAttribute('data-video-src');
        var hlsInstance = null;

        function updateStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function startPlayback() {
            if (!video || !source) {
                updateStatus('当前播放源不可用。');
                return;
            }

            if (button) {
                button.classList.add('hidden');
            }

            updateStatus('正在加载高清播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().then(function () {
                        updateStatus('播放源已加载。');
                    }).catch(function () {
                        updateStatus('播放源已就绪，请在播放器中点击播放。');
                    });
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        updateStatus('播放加载遇到问题，请刷新页面或稍后重试。');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    video.play().then(function () {
                        updateStatus('播放源已加载。');
                    }).catch(function () {
                        updateStatus('播放源已就绪，请在播放器中点击播放。');
                    });
                }, { once: true });
            } else {
                video.src = source;
                video.play().then(function () {
                    updateStatus('播放源已加载。');
                }).catch(function () {
                    updateStatus('当前浏览器可能不支持 HLS，建议使用支持 HLS 的浏览器打开。');
                });
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }
    }

    function setupGlobalSearch() {
        var app = document.querySelector('[data-search-app]');
        if (!app || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var input = app.querySelector('[data-global-search]');
        var sorter = app.querySelector('[data-global-sort]');
        var results = app.querySelector('[data-global-results]');
        var count = app.querySelector('[data-global-count]');
        var allMovies = window.MOVIE_SEARCH_INDEX.slice();

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function render(items) {
            if (count) {
                count.textContent = String(items.length);
            }

            if (!results) {
                return;
            }

            if (!items.length) {
                results.innerHTML = '<div class="search-empty">没有找到匹配影片，请换一个关键词。</div>';
                return;
            }

            results.innerHTML = items.slice(0, 120).map(function (movie) {
                var tags = movie.tags.slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');

                return '' +
                    '<article class="movie-card">' +
                    '    <a class="movie-cover" href="' + escapeHtml(movie.file) + '" aria-label="查看' + escapeHtml(movie.title) + '">' +
                    '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '        <span class="cover-gradient"></span>' +
                    '        <span class="play-chip">播放</span>' +
                    '    </a>' +
                    '    <div class="movie-info">' +
                    '        <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                    '        <h3><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '        <p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '        <div class="tag-row">' + tags + '</div>' +
                    '    </div>' +
                    '</article>';
            }).join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            var mode = sorter ? sorter.value : 'relevance';
            var filtered = allMovies.filter(function (movie) {
                if (!keyword) {
                    return true;
                }
                return normalize(movie.searchText).indexOf(keyword) !== -1;
            });

            if (mode === 'year-desc') {
                filtered.sort(function (a, b) {
                    return Number(b.year) - Number(a.year);
                });
            } else if (mode === 'year-asc') {
                filtered.sort(function (a, b) {
                    return Number(a.year) - Number(b.year);
                });
            }

            render(filtered);
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (sorter) {
            sorter.addEventListener('change', apply);
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupCardFilters();
        setupPlayer();
        setupGlobalSearch();
    });
}());
