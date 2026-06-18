(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      const open = navLinks.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (slides.length > 1) {
      restart();
    }
  }

  const input = document.querySelector("[data-filter-input]");
  const sort = document.querySelector("[data-sort-select]");
  const grid = document.querySelector("[data-movie-grid]");

  function filterCards() {
    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const term = input ? input.value.trim().toLowerCase() : "";

    cards.forEach(function (card) {
      const text = (card.getAttribute("data-keywords") || "").toLowerCase();
      const title = (card.getAttribute("data-title") || "").toLowerCase();
      const match = !term || text.includes(term) || title.includes(term);
      card.classList.toggle("is-hidden", !match);
    });
  }

  function sortCards() {
    if (!grid || !sort) {
      return;
    }

    const mode = sort.value;
    const cards = Array.from(grid.querySelectorAll(".movie-card"));

    cards.sort(function (a, b) {
      const ay = Number(a.getAttribute("data-year") || 0);
      const by = Number(b.getAttribute("data-year") || 0);
      const at = a.getAttribute("data-title") || "";
      const bt = b.getAttribute("data-title") || "";

      if (mode === "year-desc") {
        return by - ay;
      }
      if (mode === "year-asc") {
        return ay - by;
      }
      if (mode === "title") {
        return at.localeCompare(bt, "zh-Hans-CN");
      }
      return 0;
    });

    cards.forEach(function (card) {
      grid.appendChild(card);
    });
    filterCards();
  }

  if (input) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      input.value = q;
    }
    input.addEventListener("input", filterCards);
    filterCards();
  }

  if (sort) {
    sort.addEventListener("change", sortCards);
  }
}());
