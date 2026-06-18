(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var header = document.querySelector('.site-header');
        var button = document.querySelector('.mobile-menu-toggle');
        if (!header || !button) {
            return;
        }

        button.addEventListener('click', function () {
            var open = header.classList.toggle('nav-open');
            button.setAttribute('aria-expanded', String(open));
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var list = document.querySelector('[data-movie-list]');
        if (!panel || !list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var reset = panel.querySelector('[data-filter-reset]');
        var count = panel.querySelector('[data-filter-count]');

        function apply() {
            var key = normalize(keyword && keyword.value);
            var selectedYear = normalize(year && year.value);
            var selectedType = normalize(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matched = true;

                if (key && haystack.indexOf(key) === -1) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        [keyword, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (keyword) {
                    keyword.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                apply();
            });
        }

        apply();
    }

    function playWithNative(video, source, onFailure) {
        video.src = source;
        video.addEventListener('error', onFailure, { once: true });
        video.play().catch(function () {
            video.controls = true;
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var status = player.querySelector('[data-player-status]');
            if (!video || !button) {
                return;
            }

            var sources = String(video.getAttribute('data-sources') || '').split('|').filter(Boolean);
            var sourceIndex = 0;
            var hls = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function destroyHls() {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            }

            function tryNextSource() {
                sourceIndex += 1;
                if (sourceIndex < sources.length) {
                    loadSource();
                } else {
                    player.classList.remove('is-playing');
                    setStatus('当前浏览器未能加载播放源，请检查网络后重试。');
                }
            }

            function loadSource() {
                var source = sources[sourceIndex];
                if (!source) {
                    setStatus('未找到可用播放源。');
                    return;
                }

                player.classList.add('is-playing');
                video.controls = true;
                setStatus('正在加载播放源，请稍候…');
                destroyHls();

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源已加载，可以正常观看。');
                        video.play().catch(function () {
                            setStatus('播放源已加载，点击播放器开始观看。');
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            tryNextSource();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    playWithNative(video, source, tryNextSource);
                    setStatus('播放源已加载，可以正常观看。');
                } else {
                    setStatus('正在加载播放组件，如未开始请刷新页面重试。');
                }
            }

            button.addEventListener('click', loadSource);
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
