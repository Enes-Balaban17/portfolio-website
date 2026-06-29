(function () {
  "use strict";

  var root = document.documentElement;
  var themeStorageKey = "portfolio-theme";
  var cooldownStorageKey = "portfolio-message-cooldown-until";
  var defaultMessageConfig = {
    url: "https://ufcvdlidsdrcdnjswocj.supabase.co",
    publishableKey: "sb_publishable_2qSMGPoQ9199wxowxnywDQ_ez2jsaj8",
    submitEndpoint: "https://ufcvdlidsdrcdnjswocj.supabase.co/functions/v1/submit-message"
  };
  var messageConfig = Object.assign({}, defaultMessageConfig, window.PORTFOLIO_SUPABASE_CONFIG || {});
  var toggles = document.querySelectorAll("[data-theme-toggle]");

  function readSavedTheme() {
    try {
      var savedTheme = window.localStorage.getItem(themeStorageKey);
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
        window.localStorage.setItem(themeStorageKey, theme);
      } catch (error) {
        return;
      }
    }
  }

  function initThemeToggle() {
    applyTheme(initialTheme(), false);

    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(nextTheme, true);
      });
    });
  }

  function initNoteSearch() {
    var searchInput = document.querySelector("[data-note-search]");
    if (!searchInput) {
      return;
    }

    var emptyResult = document.querySelector("[data-no-results]");

    searchInput.addEventListener("input", function () {
      var query = searchInput.value.trim().toLowerCase();
      var items = document.querySelectorAll("[data-note-item]");
      var years = document.querySelectorAll("[data-note-year]");
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

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function normalizeItems(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.items)) {
      return data.items;
    }

    return [];
  }

  function readableDate(value, includeYear) {
    if (!value) {
      return "";
    }

    var date = new Date(String(value).length === 10 ? value + "T00:00:00" : value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: includeYear ? "numeric" : undefined
    }).format(date);
  }

  function yearFromDate(value) {
    if (!value) {
      return "Undated";
    }

    var match = String(value).match(/^\d{4}/);
    if (match) {
      return match[0];
    }

    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Undated" : String(date.getFullYear());
  }

  function listText(value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean).join(" / ");
    }

    return value || "";
  }

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function safeUrl(value) {
    var url = String(value || "").trim();
    if (!url) {
      return "";
    }

    return /^(https?:\/\/|mailto:|assets\/|\/assets\/|\.\/|#)/i.test(url) ? url : "";
  }

  function externalLinkAttributes(url) {
    return /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener"' : "";
  }

  function safeExternalHttpUrl(value) {
    var url = String(value || "").trim();
    return /^https?:\/\/[^\s]+$/i.test(url) ? url : "";
  }

  function safeCertificatePdfUrl(value) {
    var url = String(value || "").trim();
    if (!url || !/\.pdf(?:[?#].*)?$/i.test(url)) {
      return "";
    }

    if (/^https?:\/\/[^\s]+$/i.test(url)) {
      return url;
    }

    return /^(?:\/?assets\/|\.\/assets\/)[^\s]+$/i.test(url) ? url : "";
  }

  function safeImageUrl(value) {
    var url = safeUrl(value);
    if (!url || !/\.(?:avif|bmp|gif|jpe?g|png|svg|tiff?|webp)(?:[?#].*)?$/i.test(url)) {
      return "";
    }

    return url;
  }

  function resolveCertificateTarget(item) {
    var actionType = String(item.certificate_action_type || "none").toLowerCase();
    if (actionType === "link") {
      return safeExternalHttpUrl(item.certificate_url);
    }

    if (actionType === "pdf") {
      return safeCertificatePdfUrl(item.certificate_pdf);
    }

    return "";
  }

  function renderCertificateAction(item) {
    var target = resolveCertificateTarget(item);
    if (!target) {
      return "";
    }

    return '<a href="' + escapeHtml(target) + '" target="_blank" rel="noopener">View Certificate</a>';
  }

  function renderLabels(labels, className) {
    if (!Array.isArray(labels) || !labels.length) {
      return "";
    }

    return labels.map(function (label) {
      return '<span class="' + className + '">' + escapeHtml(label) + "</span>";
    }).join("");
  }

  function groupByYear(items, getYear) {
    var groups = {};

    items.forEach(function (item) {
      var year = getYear(item);
      if (!groups[year]) {
        groups[year] = [];
      }

      groups[year].push(item);
    });

    return Object.keys(groups).sort(function (a, b) {
      if (a === "Undated") {
        return 1;
      }

      if (b === "Undated") {
        return -1;
      }

      return Number(b) - Number(a);
    }).map(function (year) {
      return { year: year, items: groups[year] };
    });
  }

  function renderEmpty(container, type) {
    var messages = {
      notes: "No notes have been published here yet.",
      projects: "No projects have been published here yet.",
      illustrations: "No illustrations have been published here yet.",
      minigames: "No minigames have been published here yet.",
      certificates: "No certificates have been published here yet."
    };

    container.innerHTML = [
      '<section class="simple-card empty-state" aria-label="' + escapeHtml(type) + ' status">',
      "  <h2>In Progress</h2>",
      "  <p>" + escapeHtml(messages[type] || "No content has been published here yet.") + "</p>",
      "</section>"
    ].join("");
  }

  function renderError(container, type) {
    container.innerHTML = [
      '<section class="simple-card empty-state content-state content-state--error" role="status">',
      "  <h2>Content unavailable</h2>",
      "  <p>The " + escapeHtml(type) + " could not be loaded. Please refresh the page and try again.</p>",
      "</section>"
    ].join("");
  }

  function clearContentNotice(container) {
    var notice = container.nextElementSibling;
    if (notice && notice.hasAttribute("data-content-notice")) {
      notice.remove();
    }
  }

  function showFallbackNotice(container, type) {
    clearContentNotice(container);
    var notice = document.createElement("p");
    notice.className = "content-load-note";
    notice.setAttribute("data-content-notice", "");
    notice.setAttribute("role", "status");
    notice.textContent = "Live " + type + " data could not be loaded. Showing the saved page content.";
    container.insertAdjacentElement("afterend", notice);
  }

  function renderSourceLink(url, label) {
    var safeLink = safeUrl(url);
    if (!safeLink) {
      return "";
    }

    return [
      '<a class="source-link" href="' + escapeHtml(safeLink) + '"' + externalLinkAttributes(safeLink) + ">",
      '  <span class="source-icon source-icon-github" aria-hidden="true">',
      '    <img class="github-icon github-icon-dark" src="assets/icons/github-dark-theme.svg" alt="">',
      '    <img class="github-icon github-icon-light" src="assets/icons/github-light-theme.svg" alt="">',
      "  </span>",
      "  <span>" + escapeHtml(label || "Source") + "</span>",
      "</a>"
    ].join("");
  }

  function renderTextLink(url, label) {
    var safeLink = safeUrl(url);
    if (!safeLink) {
      return "";
    }

    return '<a href="' + escapeHtml(safeLink) + '"' + externalLinkAttributes(safeLink) + ">" + escapeHtml(label) + "</a>";
  }

  function renderActionLinks(links) {
    return links.filter(Boolean).join('<span class="archive-link-separator" aria-hidden="true">/</span>');
  }

  function renderTextBlocks(value) {
    var text = String(value || "").trim();
    if (!text) {
      return "";
    }

    return text.split(/\r?\n\s*\r?\n/).map(function (block) {
      return "<p>" + escapeHtml(block).replace(/\r?\n/g, "<br>") + "</p>";
    }).join("");
  }

  function renderNotes(container, items) {
    var groups = groupByYear(items, function (item) {
      return yearFromDate(item.date);
    });

    container.innerHTML = groups.map(function (group) {
      var id = "notes-" + group.year.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      var rows = group.items.map(function (item) {
        var tags = renderLabels(item.tags, "tag");
        var slug = item.slug || item.id || slugify(item.title);
        var detailUrl = "note.html?slug=" + encodeURIComponent(slug);

        return [
          '<article class="archive-item" data-note-item>',
          '  <time class="archive-date" datetime="' + escapeHtml(item.date || "") + '">' + escapeHtml(readableDate(item.date, true)) + "</time>",
          '  <div class="archive-body">',
          '    <h3><a class="archive-title-link" href="' + escapeHtml(detailUrl) + '">' + escapeHtml(item.title) + "</a>" + (tags ? " " + tags : "") + "</h3>",
          "    <p>" + escapeHtml(item.summary || item.body || "") + "</p>",
          "  </div>",
          "</article>"
        ].join("");
      }).join("");

      return [
        '<section class="archive-year" data-note-year aria-labelledby="' + escapeHtml(id) + '">',
        '  <h2 id="' + escapeHtml(id) + '">' + escapeHtml(group.year) + "</h2>",
        '  <div class="archive-items">' + rows + "</div>",
        "</section>"
      ].join("");
    }).join("");
  }

  function renderProjects(container, items) {
    var groups = groupByYear(items, function (item) {
      return item.year ? String(item.year) : "Undated";
    });

    container.innerHTML = groups.map(function (group) {
      var id = "projects-" + group.year.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      var rows = group.items.map(function (item) {
        var tech = listText(item.technologies);
        var demoLink = renderTextLink(item.demo_url, "Demo");
        var sourceLink = renderSourceLink(item.source_url, "Source");
        var links = renderActionLinks([demoLink, sourceLink]);

        return [
          '<article class="archive-item archive-item--grouped">',
          '  <div class="archive-body">',
          "    <h3>" + escapeHtml(item.title) + (item.status ? ' <span class="status">' + escapeHtml(item.status) + "</span>" : "") + "</h3>",
          "    <p>" + escapeHtml(item.description || item.body || "") + "</p>",
          tech ? '    <p class="meta">' + escapeHtml(tech) + "</p>" : "",
          links ? '    <div class="archive-links">' + links + "</div>" : "",
          "  </div>",
          "</article>"
        ].join("");
      }).join("");

      return [
        '<section class="archive-year" aria-labelledby="' + escapeHtml(id) + '">',
        '  <h2 id="' + escapeHtml(id) + '">' + escapeHtml(group.year) + "</h2>",
        '  <div class="archive-items">' + rows + "</div>",
        "</section>"
      ].join("");
    }).join("");
  }

  function renderMinigames(container, items) {
    var rows = items.map(function (item) {
      var tech = listText(item.technologies);
      var links = renderActionLinks([
        renderTextLink(item.play_url, "Play"),
        renderSourceLink(item.source_url, "Source")
      ]);

      return [
        '<article class="simple-card content-card">',
        "  <h2>" + escapeHtml(item.title) + (item.status ? ' <span class="status">' + escapeHtml(item.status) + "</span>" : "") + "</h2>",
        item.year ? '  <p class="meta">' + escapeHtml(item.year) + "</p>" : "",
        "  <p>" + escapeHtml(item.description || item.body || "") + "</p>",
        tech ? '  <p class="meta">' + escapeHtml(tech) + "</p>" : "",
        links ? '  <div class="archive-links">' + links + "</div>" : "",
        "</article>"
      ].join("");
    }).join("");

    container.innerHTML = '<div class="archive-items">' + rows + "</div>";
  }

  function renderIllustrations(container, items) {
    var cards = items.map(function (item) {
      var image = safeUrl(item.image);
      var tags = renderLabels(item.tags, "tag");

      return [
        '<article class="simple-card illustration-card">',
        image
          ? '  <figure class="illustration-media"><img src="' + escapeHtml(image) + '" alt="' + escapeHtml(item.title || "Portfolio illustration") + '" loading="lazy"></figure>'
          : '  <div class="illustration-media illustration-media--empty" role="img" aria-label="No image available"><span>No image</span></div>',
        '  <div class="illustration-content">',
        "    <h2>" + escapeHtml(item.title) + "</h2>",
        item.date ? '    <time class="meta" datetime="' + escapeHtml(item.date) + '">' + escapeHtml(readableDate(item.date, true)) + "</time>" : "",
        item.description ? "    <p>" + escapeHtml(item.description) + "</p>" : "",
        tags ? '    <div class="illustration-tags" aria-label="Tags">' + tags + "</div>" : "",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");

    container.innerHTML = '<div class="illustration-grid">' + cards + "</div>";
  }

  function renderCertificates(container, items) {
    container.innerHTML = items.map(function (item) {
      var uploadedLogo = safeImageUrl(item.logo_upload);
      var builtInLogo = safeImageUrl(item.logo);
      var logo = uploadedLogo || builtInLogo;
      var fallbackLogo = uploadedLogo && builtInLogo && uploadedLogo !== builtInLogo ? builtInLogo : "";
      var certificateLink = renderCertificateAction(item);
      var heading = [item.organization, item.title].filter(Boolean).join(" - ");
      var showDescription = item.description && item.description !== item.type;

      return [
        '<li class="simple-card certificate-item certificate-card' + (logo ? "" : " certificate-card--without-logo") + '">',
        '  <div class="certificate-content">',
        "    <h3>" + escapeHtml(heading || item.title || "Certificate") + "</h3>",
        item.type ? "    <p>" + escapeHtml(item.type) + "</p>" : "",
        showDescription ? "    <p>" + escapeHtml(item.description) + "</p>" : "",
        item.date_range ? '    <p class="meta">' + escapeHtml(item.date_range) + "</p>" : "",
        certificateLink ? '    <p class="certificate-link">' + certificateLink + "</p>" : "",
        "  </div>",
        logo ? '  <div class="certificate-logo-frame" aria-hidden="true"><img data-certificate-logo src="' + escapeHtml(logo) + '"' + (fallbackLogo ? ' data-fallback-src="' + escapeHtml(fallbackLogo) + '"' : "") + ' alt="" loading="lazy"></div>' : "",
        "</li>"
      ].join("");
    }).join("");

    container.querySelectorAll("[data-certificate-logo]").forEach(function (image) {
      image.addEventListener("error", function handleLogoError() {
        var fallback = image.getAttribute("data-fallback-src");
        if (fallback && image.getAttribute("data-fallback-used") !== "true") {
          image.setAttribute("data-fallback-used", "true");
          image.src = fallback;
          return;
        }

        var card = image.closest(".certificate-card");
        var frame = image.closest(".certificate-logo-frame");
        if (card) {
          card.classList.add("certificate-card--without-logo");
        }
        if (frame) {
          frame.remove();
        }
      });
    });
  }

  function renderJsonContent(container, type, items) {
    if (!items.length) {
      renderEmpty(container, type);
      return;
    }

    if (type === "notes") {
      renderNotes(container, items);
    } else if (type === "projects") {
      renderProjects(container, items);
    } else if (type === "illustrations") {
      renderIllustrations(container, items);
    } else if (type === "minigames") {
      renderMinigames(container, items);
    } else if (type === "certificates") {
      renderCertificates(container, items);
    } else {
      renderEmpty(container, type);
    }
  }

  function initJsonContent() {
    var containers = document.querySelectorAll("[data-content-source][data-content-type]");
    if (!containers.length || !window.fetch) {
      return;
    }

    containers.forEach(function (container) {
      var source = container.getAttribute("data-content-source");
      var type = container.getAttribute("data-content-type");
      var preserveFallback = container.hasAttribute("data-content-fallback");

      container.setAttribute("aria-busy", "true");

      window.fetch(source, { cache: "no-store" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Content file not found.");
          }

          return response.json();
        })
        .then(function (data) {
          var items = normalizeItems(data);
          if (!items.length && preserveFallback) {
            container.removeAttribute("aria-busy");
            showFallbackNotice(container, type);
            return;
          }

          clearContentNotice(container);
          renderJsonContent(container, type, items);
          container.removeAttribute("aria-busy");
          if (type === "notes") {
            var searchInput = document.querySelector("[data-note-search]");
            if (searchInput && searchInput.value) {
              searchInput.dispatchEvent(new Event("input"));
            }
          }
        })
        .catch(function () {
          container.removeAttribute("aria-busy");
          if (preserveFallback) {
            container.setAttribute("data-content-state", "fallback");
            showFallbackNotice(container, type);
            return;
          }

          renderError(container, type);
        });
    });
  }

  function initNoteDetail() {
    var container = document.querySelector("[data-note-detail-source]");
    if (!container || !window.fetch) {
      return;
    }

    var source = container.getAttribute("data-note-detail-source");
    var requestedSlug = new URLSearchParams(window.location.search).get("slug");
    container.setAttribute("aria-busy", "true");

    window.fetch(source, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Notes file not found.");
        }

        return response.json();
      })
      .then(function (data) {
        var item = normalizeItems(data).find(function (note) {
          return (note.slug || note.id || slugify(note.title)) === requestedSlug;
        });

        if (!requestedSlug || !item) {
          container.innerHTML = [
            '<section class="simple-card empty-state content-state content-state--error">',
            "  <h1>Note not found</h1>",
            '  <p><a href="notes.html">Return to Notes</a></p>',
            "</section>"
          ].join("");
          return;
        }

        var tags = renderLabels(item.tags, "tag");
        document.title = item.title + " | Enes Balaban";
        container.innerHTML = [
          '<article class="note-detail">',
          '  <a class="note-back-link" href="notes.html">Back to Notes</a>',
          '  <header class="note-detail-header">',
          '    <time class="meta" datetime="' + escapeHtml(item.date || "") + '">' + escapeHtml(readableDate(item.date, true)) + "</time>",
          "    <h1>" + escapeHtml(item.title) + "</h1>",
          tags ? '    <div class="note-detail-tags" aria-label="Tags">' + tags + "</div>" : "",
          item.summary ? '    <p class="note-detail-summary">' + escapeHtml(item.summary) + "</p>" : "",
          "  </header>",
          '  <div class="note-detail-body">' + renderTextBlocks(item.body || item.summary) + "</div>",
          "</article>"
        ].join("");
      })
      .catch(function () {
        renderError(container, "note");
      })
      .finally(function () {
        container.removeAttribute("aria-busy");
      });
  }

  function createContactModal() {
    var existingModal = document.getElementById("contact-message-modal");
    if (existingModal) {
      return existingModal;
    }

    var modal = document.createElement("div");
    modal.className = "message-modal-backdrop";
    modal.id = "contact-message-modal";
    modal.hidden = true;
    modal.innerHTML = [
      '<section class="message-modal" role="dialog" aria-modal="true" aria-labelledby="message-modal-title" aria-describedby="message-modal-description">',
      '  <div class="message-modal-header">',
      '    <div>',
      '      <p class="message-modal-eyebrow">Contact</p>',
      '      <h2 id="message-modal-title">Send a message</h2>',
      '      <p id="message-modal-description">Leave your details and I will read it from the messages dashboard after the backend is connected.</p>',
      "    </div>",
      '    <button class="message-modal-close" type="button" aria-label="Close message form" data-message-modal-close>&times;</button>',
      "  </div>",
      '  <form class="message-form" data-message-form novalidate>',
      '    <div class="message-form-grid">',
      '      <div class="form-field">',
      '        <label for="message-name">Name <span aria-hidden="true">*</span></label>',
      '        <input id="message-name" name="name" type="text" autocomplete="name" required>',
      '        <p class="form-error" id="message-name-error" data-error-for="name"></p>',
      "      </div>",
      '      <div class="form-field">',
      '        <label for="message-company">Company</label>',
      '        <input id="message-company" name="company" type="text" autocomplete="organization">',
      '        <p class="form-help">Optional for individual visitors.</p>',
      "      </div>",
      '      <div class="form-field">',
      '        <label for="message-email">Contact Mail <span aria-hidden="true">*</span></label>',
      '        <input id="message-email" name="contact_mail" type="email" autocomplete="email" required>',
      '        <p class="form-error" id="message-email-error" data-error-for="contact_mail"></p>',
      "      </div>",
      '      <div class="form-field">',
      '        <label for="message-phone">Phone Number <span class="optional-label">optional</span></label>',
      '        <div class="phone-row">',
      '          <select id="message-country-code" name="country_code" aria-label="Country code">',
      '            <option value="+90">+90 TR</option>',
      '            <option value="+1">+1 US/CA</option>',
      '            <option value="+44">+44 UK</option>',
      '            <option value="+49">+49 DE</option>',
      '            <option value="+33">+33 FR</option>',
      '            <option value="+31">+31 NL</option>',
      '            <option value="+39">+39 IT</option>',
      '            <option value="+34">+34 ES</option>',
      '            <option value="+971">+971 AE</option>',
      '            <option value="+966">+966 SA</option>',
      "          </select>",
      '          <input id="message-phone" name="phone_number" type="tel" autocomplete="tel-national" inputmode="tel">',
      "        </div>",
      '        <p class="form-error" id="message-phone-error" data-error-for="phone_number"></p>',
      "      </div>",
      "    </div>",
      '    <div class="form-field">',
      '      <div class="message-label-row">',
      '        <label for="message-body">Your Message <span aria-hidden="true">*</span></label>',
      '        <span class="character-counter" data-message-counter>0 / 2000</span>',
      "      </div>",
      '      <textarea id="message-body" name="message" rows="8" maxlength="2000" required></textarea>',
      '      <p class="form-error" id="message-body-error" data-error-for="message"></p>',
      "    </div>",
      '    <div class="honeypot-field" aria-hidden="true">',
      '      <label for="message-website">Website</label>',
      '      <input id="message-website" name="website" type="text" tabindex="-1" autocomplete="off">',
      "    </div>",
      '    <p class="message-status" role="status" aria-live="polite" data-message-status></p>',
      '    <div class="message-form-actions">',
      '      <button class="button button-primary" type="submit" data-message-submit>Send</button>',
      '      <button class="button button-secondary" type="button" data-message-modal-close>Close</button>',
      "    </div>",
      "  </form>",
      "</section>"
    ].join("");

    document.body.appendChild(modal);
    return modal;
  }

  function isSupabaseConfigured() {
    var url = messageConfig.url || messageConfig.supabaseUrl;
    var endpoint = messageConfig.submitEndpoint || messageConfig.endpoint;
    var publishableKey = messageConfig.publishableKey || messageConfig.anonKey || messageConfig.publicAnonKey;
    return Boolean((endpoint || url) && publishableKey && /^https?:\/\//.test(endpoint || url));
  }

  function readCooldownUntil() {
    try {
      return Number(window.localStorage.getItem(cooldownStorageKey)) || 0;
    } catch (error) {
      return 0;
    }
  }

  function setCooldown(minutes) {
    try {
      window.localStorage.setItem(cooldownStorageKey, String(Date.now() + minutes * 60 * 1000));
    } catch (error) {
      return;
    }
  }

  function remainingCooldownText() {
    var remaining = readCooldownUntil() - Date.now();
    if (remaining <= 0) {
      return "";
    }

    var minutes = Math.ceil(remaining / 60000);
    return "Please wait about " + minutes + " minute" + (minutes === 1 ? "" : "s") + " before sending another message.";
  }

  function isMeaningfulMessage(message) {
    var trimmed = message.trim();
    var letters = trimmed.match(/[a-zA-ZğüşöçıİĞÜŞÖÇ]/g) || [];
    var vowels = trimmed.match(/[aeiouıöüAEIOUİÖÜ]/g) || [];
    var words = trimmed.match(/[a-zA-ZğüşöçıİĞÜŞÖÇ]{2,}/g) || [];
    var symbols = trimmed.match(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ\s.,!?'"():;/-]/g) || [];
    var uniqueCharacters = new Set(trimmed.toLowerCase().replace(/\s/g, "").split("")).size;

    if (trimmed.length < 20) {
      return "Please write a message of at least 20 meaningful characters.";
    }

    if (/(.)\1{7,}/.test(trimmed)) {
      return "Please avoid repeated-character filler text.";
    }

    if (words.length < 4) {
      return "Please use a few readable words so I can understand the message.";
    }

    if (letters.length < 12 || vowels.length / Math.max(letters.length, 1) < 0.16) {
      return "Please write a readable message instead of random text.";
    }

    if (symbols.length / Math.max(trimmed.length, 1) > 0.35 || uniqueCharacters < 6) {
      return "Please avoid random symbols or low-information text.";
    }

    return "";
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function submitToSupabase(payload, signal) {
    if (!isSupabaseConfigured()) {
      return Promise.reject(new Error("Message backend is not configured yet. Please try again later."));
    }

    var url = (messageConfig.url || messageConfig.supabaseUrl).replace(/\/$/, "");
    var endpoint = messageConfig.submitEndpoint || messageConfig.endpoint || url + "/functions/v1/submit-message";
    var publishableKey = messageConfig.publishableKey || messageConfig.anonKey || messageConfig.publicAnonKey;

    return window.fetch(endpoint, {
      method: "POST",
      signal: signal,
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) {
        return response.text().then(function (text) {
          var message = text;

          try {
            var parsed = JSON.parse(text);
            message = parsed.error || parsed.message || text;
          } catch (error) {
            message = text;
          }

          throw new Error(message || "Message backend rejected the submission.");
        });
      }

      return response.json().catch(function () {
        return {};
      });
    });
  }

  function initContactModal() {
    var openButtons = document.querySelectorAll("[data-message-modal-open]");
    if (!openButtons.length) {
      return;
    }

    var modal = createContactModal();
    var dialog = modal.querySelector(".message-modal");
    var form = modal.querySelector("[data-message-form]");
    var closeButtons = modal.querySelectorAll("[data-message-modal-close]");
    var messageField = modal.querySelector("#message-body");
    var status = modal.querySelector("[data-message-status]");
    var submitButton = modal.querySelector("[data-message-submit]");
    var counter = modal.querySelector("[data-message-counter]");
    var previousFocus = null;
    var formOpenedAt = 0;
    var activeController = null;

    function updateCounter() {
      counter.textContent = String(messageField.value.length) + " / 2000";
    }

    function setStatus(message, type) {
      status.textContent = message || "";
      status.dataset.state = type || "";
    }

    function clearErrors() {
      form.querySelectorAll(".form-error").forEach(function (error) {
        error.textContent = "";
      });
    }

    function setError(fieldName, message) {
      var target = form.querySelector('[data-error-for="' + fieldName + '"]');
      if (target) {
        target.textContent = message;
      }
    }

    function setSubmitting(isSubmitting) {
      submitButton.disabled = isSubmitting;
      submitButton.textContent = isSubmitting ? "Sending..." : "Send";
    }

    function openModal(event) {
      if (event) {
        event.preventDefault();
      }

      previousFocus = event && event.detail > 0 ? null : document.activeElement;
      if (event && event.detail > 0 && event.currentTarget && typeof event.currentTarget.blur === "function") {
        event.currentTarget.blur();
      }

      formOpenedAt = Date.now();
      modal.hidden = false;
      document.body.classList.add("message-modal-open");
      setStatus("", "");
      clearErrors();
      updateCounter();

      window.setTimeout(function () {
        var firstField = modal.querySelector("#message-name");
        if (firstField) {
          firstField.focus();
        }
      }, 0);
    }

    function closeModal() {
      if (activeController) {
        activeController.abort();
        activeController = null;
      }

      modal.hidden = true;
      document.body.classList.remove("message-modal-open");
      setSubmitting(false);

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    }

    function focusableElements() {
      return Array.prototype.slice.call(
        modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter(function (element) {
        return element.offsetParent !== null;
      });
    }

    function trapFocus(event) {
      if (modal.hidden || event.key !== "Tab") {
        return;
      }

      var focusable = focusableElements();
      if (!focusable.length) {
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function validateForm(values) {
      var valid = true;
      var cooldownMessage = remainingCooldownText();
      var meaningfulMessageError = isMeaningfulMessage(values.message);

      clearErrors();

      if (cooldownMessage) {
        setStatus(cooldownMessage, "error");
        valid = false;
      }

      if (values.website) {
        setStatus("This submission was blocked by spam protection.", "error");
        valid = false;
      }

      if (Date.now() - formOpenedAt < 3000) {
        setStatus("Please take a moment to review the form before sending.", "error");
        valid = false;
      }

      if (!values.name) {
        setError("name", "Name is required.");
        valid = false;
      }

      if (!values.contact_mail) {
        setError("contact_mail", "Contact mail is required.");
        valid = false;
      } else if (!validateEmail(values.contact_mail)) {
        setError("contact_mail", "Please enter a valid email address.");
        valid = false;
      }

      if (values.phone_number && !/^[0-9\s().-]{5,24}$/.test(values.phone_number)) {
        setError("phone_number", "Please enter a readable phone number or leave it empty.");
        valid = false;
      }

      if (!values.message) {
        setError("message", "Message is required.");
        valid = false;
      } else if (values.message.length > 2000) {
        setError("message", "Message must be 2000 characters or fewer.");
        valid = false;
      } else if (meaningfulMessageError) {
        setError("message", meaningfulMessageError);
        valid = false;
      }

      return valid;
    }

    function handleSubmit(event) {
      event.preventDefault();

      var values = {
        name: form.elements.name.value.trim(),
        company: form.elements.company.value.trim(),
        contact_mail: form.elements.contact_mail.value.trim(),
        country_code: form.elements.country_code.value,
        phone_number: form.elements.phone_number.value.trim(),
        message: form.elements.message.value.trim(),
        website: form.elements.website.value.trim()
      };

      setStatus("", "");

      if (!validateForm(values)) {
        return;
      }

      var payload = {
        name: values.name,
        company: values.company || null,
        contact_email: values.contact_mail,
        phone_country_code: values.country_code,
        phone_number: values.phone_number || null,
        message: values.message,
        website: values.website,
        source: "portfolio_contact_modal",
        page_path: window.location.pathname,
        submitted_at_client: new Date().toISOString(),
        form_started_at: new Date(formOpenedAt).toISOString()
      };

      activeController = "AbortController" in window ? new AbortController() : null;
      setSubmitting(true);
      setStatus("Sending message...", "loading");

      submitToSupabase(payload, activeController ? activeController.signal : undefined)
        .then(function () {
          activeController = null;
          setCooldown(10);
          form.reset();
          updateCounter();
          setStatus("Message sent. Thank you for reaching out.", "success");
          window.setTimeout(function () {
            closeModal();
            setStatus("", "");
          }, 850);
        })
        .catch(function (error) {
          if (error.name === "AbortError") {
            setStatus("Message sending was cancelled.", "error");
            return;
          }

          setStatus(error.message || "The message could not be sent yet.", "error");
        })
        .finally(function () {
          activeController = null;
          setSubmitting(false);
        });
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openModal);
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", closeModal);
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (modal.hidden) {
        return;
      }

      if (event.key === "Escape") {
        closeModal();
      } else {
        trapFocus(event);
      }
    });

    messageField.addEventListener("input", updateCounter);
    form.addEventListener("submit", handleSubmit);

    dialog.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }

  initThemeToggle();
  initJsonContent();
  initNoteDetail();
  initNoteSearch();
  initContactModal();
})();
