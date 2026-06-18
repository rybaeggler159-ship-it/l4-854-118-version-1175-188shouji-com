(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var mask = document.getElementById("movieMask");
    var button = document.getElementById("movieStart");
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function prepare() {
      if (video.dataset.ready === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.dataset.ready = "1";
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        video.dataset.ready = "1";
        return;
      }

      video.src = streamUrl;
      video.dataset.ready = "1";
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }

      prepare();

      if (mask) {
        mask.classList.add("is-hidden");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (mask) {
            mask.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (mask) {
      mask.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
