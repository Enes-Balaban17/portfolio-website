(function () {
  "use strict";

  var storageKey = "portfolio-theme";
  var root = document.documentElement;
  var toggles = document.querySelectorAll("[data-theme-toggle]");

  function readSavedTheme() {
    try {
      var savedTheme = window.localStorage.getItem(storageKey);
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  function initialTheme() {
    var savedTheme = readSavedTheme();
    if (savedTheme) {
      return savedTheme;
    }

    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme, saveTheme) {
    var nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    root.setAttribute("data-theme", theme);

    toggles.forEach(function (toggle) {
      toggle.setAttribute("aria-label", nextLabel);
      toggle.setAttribute("title", nextLabel);
    });

    if (saveTheme) {
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch (error) {
        return;
      }
    }
  }

  applyTheme(initialTheme(), false);

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  });

  var searchInput = document.querySelector("[data-note-search]");
  if (searchInput) {
    var items = document.querySelectorAll("[data-note-item]");
    var years = document.querySelectorAll("[data-note-year]");
    var emptyResult = document.querySelector("[data-no-results]");

    searchInput.addEventListener("input", function () {
      var query = searchInput.value.trim().toLowerCase();
      var visibleItems = 0;

      items.forEach(function (item) {
        var matches = !query || item.textContent.toLowerCase().indexOf(query) !== -1;
        item.hidden = !matches;
        if (matches) {
          visibleItems += 1;
        }
      });

      years.forEach(function (year) {
        year.hidden = !year.querySelector("[data-note-item]:not([hidden])");
      });

      if (emptyResult) {
        emptyResult.hidden = visibleItems !== 0;
      }
    });
  }
})();
