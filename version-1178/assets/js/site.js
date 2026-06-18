(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var controls = Array.prototype.slice.call(document.querySelectorAll("[data-filter-control]"));
  var grid = document.querySelector("[data-filter-grid]");
  var empty = document.querySelector("[data-empty-state]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getValue(name) {
    var input = document.querySelector('[data-filter-control="' + name + '"]');
    return input ? normalize(input.value) : "";
  }

  function matchCard(card, query, category, year) {
    var title = normalize(card.dataset.title);
    var region = normalize(card.dataset.region);
    var genre = normalize(card.dataset.genre);
    var tags = normalize(card.dataset.tags);
    var text = title + " " + region + " " + genre + " " + tags + " " + normalize(card.dataset.year);
    var queryMatch = !query || text.indexOf(query) !== -1;
    var categoryMatch = !category || normalize(card.dataset.category) === category;
    var yearMatch = !year || normalize(card.dataset.year) === year;
    return queryMatch && categoryMatch && yearMatch;
  }

  function applyFilters() {
    if (!grid) {
      return;
    }

    var query = getValue("query");
    var category = getValue("category");
    var year = getValue("year");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var visible = 0;

    cards.forEach(function (card) {
      var matched = matchCard(card, query, category, year);
      card.classList.toggle("is-hidden", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  controls.forEach(function (control) {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });

  applyFilters();
})();
