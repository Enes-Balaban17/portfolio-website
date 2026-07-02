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
  var contactBackendConfig = Object.assign({}, defaultMessageConfig, window.PORTFOLIO_SUPABASE_CONFIG || {});
  var toggles = document.querySelectorAll("[data-theme-toggle]");

  function readSavedTheme() {
    try {
      var savedTheme = window.localStorage.getItem(themeStorageKey);
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    } catch (error) {
      console.warn("Theme preference could not be read from local storage.", error);
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

  function updatePageFaviconForTheme(theme) {
    var favicon = document.querySelector("[data-theme-favicon]");
    if (!favicon) {
      return;
    }

    var nextHref = theme === "dark"
      ? favicon.getAttribute("data-dark-href")
      : favicon.getAttribute("data-light-href");

    if (nextHref && favicon.getAttribute("href") !== nextHref) {
      favicon.setAttribute("href", nextHref);
    }
  }

  function applyTheme(theme, saveTheme) {
    var nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    root.setAttribute("data-theme", theme);
    updatePageFaviconForTheme(theme);

    toggles.forEach(function (toggle) {
      toggle.setAttribute("aria-label", nextLabel);
      toggle.setAttribute("title", nextLabel);
    });

    if (saveTheme) {
      try {
        window.localStorage.setItem(themeStorageKey, theme);
      } catch (error) {
        console.warn("Theme preference could not be saved to local storage.", error);
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
      var noteElements = document.querySelectorAll("[data-note-item]");
      var visibleNoteCount = 0;

      noteElements.forEach(function (noteElement) {
        var matches = !query || noteElement.textContent.toLowerCase().indexOf(query) !== -1;
        noteElement.hidden = !matches;
        if (matches) {
          visibleNoteCount += 1;
        }
      });

      if (emptyResult) {
        emptyResult.hidden = visibleNoteCount !== 0;
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

  function extractCmsEntries(cmsContentPayload) {
    var cmsEntries = Array.isArray(cmsContentPayload) ? cmsContentPayload : cmsContentPayload && cmsContentPayload.items;
    if (!Array.isArray(cmsEntries)) {
      throw new Error("Content JSON must be an array or contain an items array.");
    }

    if (cmsEntries.some(function (cmsEntry) { return !cmsEntry || typeof cmsEntry !== "object" || Array.isArray(cmsEntry); })) {
      throw new Error("Every content item must be an object.");
    }

    return cmsEntries;
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
    var url = String(value || "").trim();
    if (!url || !/\.(?:avif|bmp|gif|jpe?g|png|svg|tiff?|webp)(?:[?#].*)?$/i.test(url)) {
      return "";
    }

    if (safeExternalHttpUrl(url)) {
      return url;
    }

    return /^(?:\/?assets\/|\.\/assets\/)[^\s]+$/i.test(url) ? url : "";
  }

  function resolveCertificateTarget(certificateEntry) {
    var actionType = String(certificateEntry.certificate_action_type || "none").toLowerCase();
    if (actionType === "link") {
      return safeExternalHttpUrl(certificateEntry.certificate_url);
    }

    if (actionType === "pdf") {
      return safeCertificatePdfUrl(certificateEntry.certificate_pdf);
    }

    return "";
  }

  function renderCertificateAction(certificateEntry) {
    var target = resolveCertificateTarget(certificateEntry);
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

  function groupEntriesByYear(contentEntries, readYear) {
    var entriesByYear = {};

    contentEntries.forEach(function (contentEntry) {
      var year = readYear(contentEntry);
      if (!entriesByYear[year]) {
        entriesByYear[year] = [];
      }

      entriesByYear[year].push(contentEntry);
    });

    return Object.keys(entriesByYear).sort(function (a, b) {
      if (a === "Undated") {
        return 1;
      }

      if (b === "Undated") {
        return -1;
      }

      return Number(b) - Number(a);
    }).map(function (year) {
      return { year: year, entries: entriesByYear[year] };
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
    var safeLink = safeExternalHttpUrl(url);
    if (!safeLink) {
      return "";
    }

    return [
      '<a class="archive-action archive-action--source source-link" href="' + escapeHtml(safeLink) + '"' + externalLinkAttributes(safeLink) + ">",
      '  <span class="source-icon source-icon-github" aria-hidden="true">',
      '    <img class="github-icon github-icon-dark" src="assets/icons/github-dark-theme.svg" alt="">',
      '    <img class="github-icon github-icon-light" src="assets/icons/github-light-theme.svg" alt="">',
      "  </span>",
      "  <span>" + escapeHtml(label || "Source") + "</span>",
      "</a>"
    ].join("");
  }

  function renderTextLink(url, label) {
    var safeLink = safeExternalHttpUrl(url);
    if (!safeLink) {
      return "";
    }

    return '<a class="archive-action archive-action--primary" href="' + escapeHtml(safeLink) + '"' + externalLinkAttributes(safeLink) + ">" + escapeHtml(label) + "</a>";
  }

  function renderActionLinks(links) {
    return links.filter(Boolean).join("");
  }

  function selectFeaturedEntries(contentEntries, contentType) {
    return contentEntries.filter(function (contentEntry) {
      return contentEntry.featured === true;
    }).sort(function (leftEntry, rightEntry) {
      var orderDifference = (Number(leftEntry.featured_order) || 0) - (Number(rightEntry.featured_order) || 0);
      if (orderDifference) {
        return orderDifference;
      }

      var leftFallback = contentType === "notes"
        ? Date.parse(leftEntry.date || "") || 0
        : Number(leftEntry.year) || 0;
      var rightFallback = contentType === "notes"
        ? Date.parse(rightEntry.date || "") || 0
        : Number(rightEntry.year) || 0;
      if (leftFallback !== rightFallback) {
        return rightFallback - leftFallback;
      }

      return String(leftEntry.title || "").localeCompare(String(rightEntry.title || ""));
    }).slice(0, 3);
  }

  function renderFeaturedEmpty(container, contentType) {
    container.innerHTML = '<p class="home-preview-empty" role="status">No featured ' + escapeHtml(contentType) + " yet.</p>";
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

  function renderNotes(container, noteEntries) {
    var renderedNoteRows = noteEntries.map(function (noteEntry) {
      var tags = renderLabels(noteEntry.tags, "tag");
      var slug = noteEntry.slug || noteEntry.id || slugify(noteEntry.title);
      var detailUrl = "note.html?slug=" + encodeURIComponent(slug);

      return [
        '<article class="archive-item" data-note-item>',
        '  <time class="archive-date" datetime="' + escapeHtml(noteEntry.date || "") + '">' + escapeHtml(readableDate(noteEntry.date, true)) + "</time>",
        '  <div class="archive-body">',
        '    <h3><a class="archive-title-link" href="' + escapeHtml(detailUrl) + '">' + escapeHtml(noteEntry.title) + "</a>" + (tags ? " " + tags : "") + "</h3>",
        "    <p>" + escapeHtml(noteEntry.summary || noteEntry.body || "") + "</p>",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");

    container.innerHTML = '<div class="archive-items notes-list">' + renderedNoteRows + "</div>";
  }

  function renderFeaturedNotes(container, noteEntries) {
    var featuredNotes = selectFeaturedEntries(noteEntries, "notes");
    if (!featuredNotes.length) {
      renderFeaturedEmpty(container, "notes");
      return;
    }

    container.innerHTML = featuredNotes.map(function (noteEntry) {
      var tags = renderLabels(noteEntry.tags, "tag");
      var slug = noteEntry.slug || noteEntry.id || slugify(noteEntry.title);
      var detailUrl = "note.html?slug=" + encodeURIComponent(slug);

      return [
        '<article class="archive-item">',
        '  <time class="archive-date" datetime="' + escapeHtml(noteEntry.date || "") + '">' + escapeHtml(readableDate(noteEntry.date, false)) + "</time>",
        '  <div class="archive-body">',
        '    <h3><a href="' + escapeHtml(detailUrl) + '">' + escapeHtml(noteEntry.title) + "</a>" + (tags ? " " + tags : "") + "</h3>",
        "    <p>" + escapeHtml(noteEntry.summary || noteEntry.body || "") + "</p>",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderProjects(container, portfolioProjects) {
    var projectYearGroups = groupEntriesByYear(portfolioProjects, function (projectEntry) {
      return projectEntry.year ? String(projectEntry.year) : "Undated";
    });

    container.innerHTML = projectYearGroups.map(function (projectYearGroup) {
      var headingId = "projects-" + projectYearGroup.year.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      var renderedProjects = projectYearGroup.entries.map(function (projectEntry) {
        var technologies = listText(projectEntry.technologies);
        var demoLink = renderTextLink(projectEntry.demo_url, "Demo");
        var sourceLink = renderSourceLink(projectEntry.source_url, "Source");
        var links = renderActionLinks([demoLink, sourceLink]);

        return [
          '<article class="archive-item archive-item--grouped">',
          '  <div class="archive-body">',
          "    <h3>" + escapeHtml(projectEntry.title) + (projectEntry.status ? ' <span class="status">' + escapeHtml(projectEntry.status) + "</span>" : "") + "</h3>",
          "    <p>" + escapeHtml(projectEntry.description || projectEntry.body || "") + "</p>",
          technologies ? '    <p class="meta">' + escapeHtml(technologies) + "</p>" : "",
          links ? '    <div class="archive-links">' + links + "</div>" : "",
          "  </div>",
          "</article>"
        ].join("");
      }).join("");

      return [
        '<section class="archive-year" aria-labelledby="' + escapeHtml(headingId) + '">',
        '  <h2 id="' + escapeHtml(headingId) + '">' + escapeHtml(projectYearGroup.year) + "</h2>",
        '  <div class="archive-items">' + renderedProjects + "</div>",
        "</section>"
      ].join("");
    }).join("");
  }

  function renderFeaturedProjects(container, projectEntries) {
    var featuredProjects = selectFeaturedEntries(projectEntries, "projects");
    if (!featuredProjects.length) {
      renderFeaturedEmpty(container, "projects");
      return;
    }

    container.innerHTML = featuredProjects.map(function (projectEntry) {
      var technologies = listText(projectEntry.technologies);
      var links = renderActionLinks([
        renderTextLink(projectEntry.demo_url, "Demo"),
        renderSourceLink(projectEntry.source_url, "Source")
      ]);

      return [
        '<article class="archive-item">',
        '  <time class="archive-date" datetime="' + escapeHtml(projectEntry.year || "") + '">' + escapeHtml(projectEntry.year || "") + "</time>",
        '  <div class="archive-body">',
        '    <h3><a href="projects.html">' + escapeHtml(projectEntry.title) + "</a>" + (projectEntry.status ? ' <span class="status">' + escapeHtml(projectEntry.status) + "</span>" : "") + "</h3>",
        "    <p>" + escapeHtml(projectEntry.description || projectEntry.body || "") + "</p>",
        technologies ? '    <p class="meta">' + escapeHtml(technologies) + "</p>" : "",
        links ? '    <div class="archive-links">' + links + "</div>" : "",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderMinigames(container, minigameEntries) {
    var renderedMinigames = minigameEntries.map(function (minigameEntry) {
      var technologies = listText(minigameEntry.technologies);
      var links = renderActionLinks([
        renderTextLink(minigameEntry.play_url, "Play"),
        renderSourceLink(minigameEntry.source_url, "Source")
      ]);

      return [
        '<article class="simple-card content-card">',
        "  <h2>" + escapeHtml(minigameEntry.title) + (minigameEntry.status ? ' <span class="status">' + escapeHtml(minigameEntry.status) + "</span>" : "") + "</h2>",
        minigameEntry.year ? '  <p class="meta">' + escapeHtml(minigameEntry.year) + "</p>" : "",
        "  <p>" + escapeHtml(minigameEntry.description || minigameEntry.body || "") + "</p>",
        technologies ? '  <p class="meta">' + escapeHtml(technologies) + "</p>" : "",
        links ? '  <div class="archive-links">' + links + "</div>" : "",
        "</article>"
      ].join("");
    }).join("");

    container.innerHTML = '<div class="archive-items">' + renderedMinigames + "</div>";
  }

  function setIllustrationOrientation(image) {
    var media = image.closest(".illustration-media");
    if (!media || !image.naturalWidth || !image.naturalHeight) {
      return;
    }

    var ratio = image.naturalWidth / image.naturalHeight;
    media.dataset.orientation = ratio < 0.9 ? "portrait" : ratio > 1.1 ? "landscape" : "square";
  }

  function showUnavailableIllustration(image) {
    var media = image.closest(".illustration-media");
    if (!media) {
      return;
    }

    media.className = "illustration-media illustration-media--empty";
    media.setAttribute("role", "img");
    media.setAttribute("aria-label", "Image unavailable");
    media.innerHTML = "<span>Image unavailable</span>";
  }

  function bindIllustrationImage(image) {
    image.addEventListener("load", function () { setIllustrationOrientation(image); });
    image.addEventListener("error", function () { showUnavailableIllustration(image); });

    if (image.complete) {
      if (image.naturalWidth) {
        setIllustrationOrientation(image);
      } else {
        showUnavailableIllustration(image);
      }
    }
  }

  function renderIllustrations(container, illustrationEntries) {
    var renderedIllustrations = illustrationEntries.map(function (illustrationEntry) {
      var image = safeImageUrl(illustrationEntry.image);
      var tags = renderLabels(illustrationEntry.tags, "tag");

      return [
        '<article class="simple-card illustration-card">',
        image
          ? '  <figure class="illustration-media"><img data-illustration-image src="' + escapeHtml(image) + '" alt="' + escapeHtml(illustrationEntry.title || "Portfolio illustration") + '" loading="lazy"></figure>'
          : '  <div class="illustration-media illustration-media--empty" role="img" aria-label="No image available"><span>No image</span></div>',
        '  <div class="illustration-content">',
        "    <h2>" + escapeHtml(illustrationEntry.title) + "</h2>",
        illustrationEntry.date ? '    <time class="meta" datetime="' + escapeHtml(illustrationEntry.date) + '">' + escapeHtml(readableDate(illustrationEntry.date, true)) + "</time>" : "",
        illustrationEntry.description ? "    <p>" + escapeHtml(illustrationEntry.description) + "</p>" : "",
        tags ? '    <div class="illustration-tags" aria-label="Tags">' + tags + "</div>" : "",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");

    container.innerHTML = '<div class="illustration-grid">' + renderedIllustrations + "</div>";
    container.querySelectorAll("[data-illustration-image]").forEach(bindIllustrationImage);
  }

  function handleCertificateLogoError(image) {
    var fallbackLogo = image.getAttribute("data-fallback-src");
    if (fallbackLogo && image.getAttribute("data-fallback-used") !== "true") {
      image.setAttribute("data-fallback-used", "true");
      image.src = fallbackLogo;
      return;
    }

    var certificateCard = image.closest(".certificate-card");
    var logoFrame = image.closest(".certificate-logo-frame");
    if (certificateCard) {
      certificateCard.classList.add("certificate-card--without-logo");
    }
    if (logoFrame) {
      logoFrame.remove();
    }
  }

  function bindCertificateLogo(image) {
    image.addEventListener("error", function () { handleCertificateLogoError(image); });
    if (image.complete && !image.naturalWidth) {
      handleCertificateLogoError(image);
    }
  }

  function renderCertificates(container, certificateEntries) {
    container.innerHTML = certificateEntries.map(function (certificateEntry) {
      var uploadedLogo = safeImageUrl(certificateEntry.logo_upload);
      var builtInLogo = safeImageUrl(certificateEntry.logo);
      var logo = uploadedLogo || builtInLogo;
      var fallbackLogo = uploadedLogo && builtInLogo && uploadedLogo !== builtInLogo ? builtInLogo : "";
      var certificateLink = renderCertificateAction(certificateEntry);
      var heading = [certificateEntry.organization, certificateEntry.title].filter(Boolean).join(" - ");
      var showDescription = certificateEntry.description && certificateEntry.description !== certificateEntry.type;

      return [
        '<li class="simple-card certificate-item certificate-card' + (logo ? "" : " certificate-card--without-logo") + '">',
        '  <div class="certificate-content">',
        "    <h3>" + escapeHtml(heading || certificateEntry.title || "Certificate") + "</h3>",
        certificateEntry.type ? "    <p>" + escapeHtml(certificateEntry.type) + "</p>" : "",
        showDescription ? "    <p>" + escapeHtml(certificateEntry.description) + "</p>" : "",
        certificateEntry.date_range ? '    <p class="meta">' + escapeHtml(certificateEntry.date_range) + "</p>" : "",
        certificateLink ? '    <p class="certificate-link">' + certificateLink + "</p>" : "",
        "  </div>",
        logo ? '  <div class="certificate-logo-frame" aria-hidden="true"><img data-certificate-logo src="' + escapeHtml(logo) + '"' + (fallbackLogo ? ' data-fallback-src="' + escapeHtml(fallbackLogo) + '"' : "") + ' alt="" loading="lazy"></div>' : "",
        "</li>"
      ].join("");
    }).join("");

    container.querySelectorAll("[data-certificate-logo]").forEach(bindCertificateLogo);
  }

  function renderJsonContent(container, type, contentEntries) {
    if (!contentEntries.length) {
      if (type === "featured-notes") {
        renderFeaturedEmpty(container, "notes");
      } else if (type === "featured-projects") {
        renderFeaturedEmpty(container, "projects");
      } else {
        renderEmpty(container, type);
      }
      return;
    }

    if (type === "featured-notes") {
      renderFeaturedNotes(container, contentEntries);
    } else if (type === "featured-projects") {
      renderFeaturedProjects(container, contentEntries);
    } else if (type === "notes") {
      renderNotes(container, contentEntries);
    } else if (type === "projects") {
      renderProjects(container, contentEntries);
    } else if (type === "illustrations") {
      renderIllustrations(container, contentEntries);
    } else if (type === "minigames") {
      renderMinigames(container, contentEntries);
    } else if (type === "certificates") {
      renderCertificates(container, contentEntries);
    } else {
      renderEmpty(container, type);
    }
  }

  function fetchCmsEntries(source) {
    return window.fetch(source, { cache: "no-store" })
      .then(function (contentResponse) {
        if (!contentResponse.ok) {
          throw new Error("Content request failed with status " + contentResponse.status + ".");
        }

        return contentResponse.json();
      })
      .then(extractCmsEntries);
  }

  function refreshNoteSearch(contentType) {
    if (contentType !== "notes") {
      return;
    }

    var searchInput = document.querySelector("[data-note-search]");
    if (searchInput && searchInput.value) {
      searchInput.dispatchEvent(new Event("input"));
    }
  }

  function loadCmsContainer(container) {
    var source = container.getAttribute("data-content-source");
    var contentType = container.getAttribute("data-content-type");
    var preserveFallback = container.hasAttribute("data-content-fallback");

    container.setAttribute("aria-busy", "true");

    return fetchCmsEntries(source)
      .then(function (contentEntries) {
        clearContentNotice(container);
        renderJsonContent(container, contentType, contentEntries);
        refreshNoteSearch(contentType);
      })
      .catch(function (error) {
        console.error("Content loading failed for " + source + ".", error);
        if (preserveFallback) {
          container.setAttribute("data-content-state", "fallback");
          showFallbackNotice(container, contentType);
          return;
        }

        renderError(container, contentType);
      })
      .finally(function () {
        container.removeAttribute("aria-busy");
      });
  }

  function initJsonContent() {
    var containers = document.querySelectorAll("[data-content-source][data-content-type]");
    if (!containers.length) {
      return;
    }

    if (!window.fetch) {
      containers.forEach(function (container) {
        renderError(container, container.getAttribute("data-content-type"));
      });
      return;
    }

    containers.forEach(loadCmsContainer);
  }

  function findNoteBySlug(noteEntries, requestedSlug) {
    return noteEntries.find(function (noteEntry) {
      return (noteEntry.slug || noteEntry.id || slugify(noteEntry.title)) === requestedSlug;
    });
  }

  function renderMissingNote(container) {
    container.innerHTML = [
      '<section class="simple-card empty-state content-state content-state--error">',
      "  <h1>Note not found</h1>",
      '  <p><a href="notes.html">Return to Notes</a></p>',
      "</section>"
    ].join("");
  }

  function setMetaContent(selector, value) {
    var metaElement = document.querySelector(selector);
    if (metaElement) {
      metaElement.setAttribute("content", value);
    }
  }

  function updateNoteMetadata(noteEntry, requestedSlug) {
    var pageTitle = noteEntry.title + " | Enes Balaban";
    var descriptionSource = noteEntry.summary || noteEntry.body || "Read a software development note by Enes Balaban.";
    var description = String(descriptionSource).replace(/\s+/g, " ").trim().slice(0, 160);
    var canonicalUrl = "https://enesbalaban.dev/note.html?slug=" + encodeURIComponent(requestedSlug);
    var canonicalLink = document.querySelector('link[rel="canonical"]');

    document.title = pageTitle;
    if (canonicalLink) {
      canonicalLink.setAttribute("href", canonicalUrl);
    }

    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', pageTitle);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[name="twitter:title"]', pageTitle);
    setMetaContent('meta[name="twitter:description"]', description);

    var structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: noteEntry.title,
      description: description,
      datePublished: noteEntry.date || undefined,
      mainEntityOfPage: canonicalUrl,
      author: {
        "@type": "Person",
        name: "Enes Balaban",
        url: "https://enesbalaban.dev/"
      }
    });
    document.head.appendChild(structuredData);
  }

  function renderNoteDetail(container, noteEntry, requestedSlug) {
    var tags = renderLabels(noteEntry.tags, "tag");
    updateNoteMetadata(noteEntry, requestedSlug);
    container.innerHTML = [
      '<article class="note-detail">',
      '  <a class="note-back-link" href="notes.html">Back to Notes</a>',
      '  <header class="note-detail-header">',
      '    <time class="meta" datetime="' + escapeHtml(noteEntry.date || "") + '">' + escapeHtml(readableDate(noteEntry.date, true)) + "</time>",
      "    <h1>" + escapeHtml(noteEntry.title) + "</h1>",
      tags ? '    <div class="note-detail-tags" aria-label="Tags">' + tags + "</div>" : "",
      noteEntry.summary ? '    <p class="note-detail-summary">' + escapeHtml(noteEntry.summary) + "</p>" : "",
      "  </header>",
      '  <div class="note-detail-body">' + renderTextBlocks(noteEntry.body || noteEntry.summary) + "</div>",
      "</article>"
    ].join("");
  }

  function initNoteDetail() {
    var container = document.querySelector("[data-note-detail-source]");
    if (!container) {
      return;
    }

    if (!window.fetch) {
      renderError(container, "note");
      return;
    }

    var source = container.getAttribute("data-note-detail-source");
    var requestedSlug = new URLSearchParams(window.location.search).get("slug");
    container.setAttribute("aria-busy", "true");

    fetchCmsEntries(source)
      .then(function (noteEntries) {
        var matchingNote = requestedSlug ? findNoteBySlug(noteEntries, requestedSlug) : null;

        if (!matchingNote) {
          renderMissingNote(container);
          return;
        }

        renderNoteDetail(container, matchingNote, requestedSlug);
      })
      .catch(function (error) {
        console.error("Note loading failed for " + source + ":", error);
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
      '        <input id="message-name" name="name" type="text" autocomplete="name" maxlength="120" required>',
      '        <p class="form-error" id="message-name-error" data-error-for="name"></p>',
      "      </div>",
      '      <div class="form-field">',
      '        <label for="message-company">Company</label>',
      '        <input id="message-company" name="company" type="text" autocomplete="organization" maxlength="160">',
      '        <p class="form-help">Optional for individual visitors.</p>',
      '        <p class="form-error" data-error-for="company"></p>',
      "      </div>",
      '      <div class="form-field">',
      '        <label for="message-email">Contact Mail <span aria-hidden="true">*</span></label>',
      '        <input id="message-email" name="contact_mail" type="email" autocomplete="email" maxlength="254" required>',
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
      '          <input id="message-phone" name="phone_number" type="tel" autocomplete="tel-national" inputmode="tel" maxlength="24">',
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
    var url = contactBackendConfig.url || contactBackendConfig.supabaseUrl;
    var endpoint = contactBackendConfig.submitEndpoint || contactBackendConfig.endpoint;
    var publishableKey = contactBackendConfig.publishableKey || contactBackendConfig.anonKey || contactBackendConfig.publicAnonKey;
    return Boolean((endpoint || url) && publishableKey && /^https?:\/\//.test(endpoint || url));
  }

  function readCooldownUntil() {
    try {
      return Number(window.localStorage.getItem(cooldownStorageKey)) || 0;
    } catch (error) {
      console.warn("Message cooldown could not be read from local storage.", error);
      return 0;
    }
  }

  function setCooldown(minutes) {
    try {
      window.localStorage.setItem(cooldownStorageKey, String(Date.now() + minutes * 60 * 1000));
    } catch (error) {
      console.warn("Message cooldown could not be saved to local storage.", error);
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

  function parseBackendError(responseText) {
    if (!responseText) {
      return "Message backend rejected the submission.";
    }

    try {
      var errorResponse = JSON.parse(responseText);
      return errorResponse.error || errorResponse.message || "Message backend rejected the submission.";
    } catch (error) {
      return "Message service is temporarily unavailable. Please try again later.";
    }
  }

  function submitContactMessage(payload, signal) {
    if (!isSupabaseConfigured()) {
      return Promise.reject(new Error("Message backend is not configured yet. Please try again later."));
    }

    var url = (contactBackendConfig.url || contactBackendConfig.supabaseUrl).replace(/\/$/, "");
    var endpoint = contactBackendConfig.submitEndpoint || contactBackendConfig.endpoint || url + "/functions/v1/submit-message";
    var publishableKey = contactBackendConfig.publishableKey || contactBackendConfig.anonKey || contactBackendConfig.publicAnonKey;

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
        return response.text().then(function (responseText) {
          throw new Error(parseBackendError(responseText));
        });
      }

      return response.json().catch(function () {
        return {};
      });
    });
  }

  function createContactModalContext(modal, openButtons) {
    return {
      modal: modal,
      dialog: modal.querySelector(".message-modal"),
      form: modal.querySelector("[data-message-form]"),
      openButtons: openButtons,
      closeButtons: modal.querySelectorAll("[data-message-modal-close]"),
      messageField: modal.querySelector("#message-body"),
      status: modal.querySelector("[data-message-status]"),
      submitButton: modal.querySelector("[data-message-submit]"),
      counter: modal.querySelector("[data-message-counter]"),
      previousFocus: null,
      formOpenedAt: 0,
      activeController: null,
      closeTimer: null
    };
  }

  function updateMessageCounter(context) {
    context.counter.textContent = String(context.messageField.value.length) + " / 2000";
  }

  function setMessageStatus(context, message, state) {
    context.status.textContent = message || "";
    context.status.dataset.state = state || "";
  }

  function clearContactErrors(context) {
    context.form.querySelectorAll(".form-error").forEach(function (errorElement) {
      errorElement.textContent = "";
    });
  }

  function setContactError(context, fieldName, message) {
    var errorElement = context.form.querySelector('[data-error-for="' + fieldName + '"]');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function setContactSubmitting(context, isSubmitting) {
    context.submitButton.disabled = isSubmitting;
    context.submitButton.textContent = isSubmitting ? "Sending..." : "Send";
  }

  function readContactValues(form) {
    return {
      name: form.elements.name.value.trim(),
      company: form.elements.company.value.trim(),
      contactMail: form.elements.contact_mail.value.trim(),
      countryCode: form.elements.country_code.value,
      phoneNumber: form.elements.phone_number.value.trim(),
      message: form.elements.message.value.trim(),
      website: form.elements.website.value.trim()
    };
  }

  function validateContactValues(context, values) {
    var isValid = true;
    var cooldownMessage = remainingCooldownText();
    var meaningfulMessageError = isMeaningfulMessage(values.message);

    clearContactErrors(context);

    if (cooldownMessage) {
      setMessageStatus(context, cooldownMessage, "error");
      isValid = false;
    }
    if (values.website) {
      setMessageStatus(context, "This submission was blocked by spam protection.", "error");
      isValid = false;
    }
    if (Date.now() - context.formOpenedAt < 3000) {
      setMessageStatus(context, "Please take a moment to review the form before sending.", "error");
      isValid = false;
    }
    if (!values.name) {
      setContactError(context, "name", "Name is required.");
      isValid = false;
    } else if (values.name.length > 120) {
      setContactError(context, "name", "Name must be 120 characters or fewer.");
      isValid = false;
    }
    if (values.company.length > 160) {
      setContactError(context, "company", "Company must be 160 characters or fewer.");
      isValid = false;
    }
    if (!values.contactMail) {
      setContactError(context, "contact_mail", "Contact mail is required.");
      isValid = false;
    } else if (!validateEmail(values.contactMail)) {
      setContactError(context, "contact_mail", "Please enter a valid email address.");
      isValid = false;
    } else if (values.contactMail.length > 254) {
      setContactError(context, "contact_mail", "Contact mail must be 254 characters or fewer.");
      isValid = false;
    }
    if (values.phoneNumber && !/^[0-9\s().-]{5,24}$/.test(values.phoneNumber)) {
      setContactError(context, "phone_number", "Please enter a readable phone number or leave it empty.");
      isValid = false;
    }
    if (!values.message) {
      setContactError(context, "message", "Message is required.");
      isValid = false;
    } else if (values.message.length > 2000) {
      setContactError(context, "message", "Message must be 2000 characters or fewer.");
      isValid = false;
    } else if (meaningfulMessageError) {
      setContactError(context, "message", meaningfulMessageError);
      isValid = false;
    }

    return isValid;
  }

  function buildContactPayload(values, formOpenedAt) {
    return {
      name: values.name,
      company: values.company || null,
      contact_email: values.contactMail,
      phone_country_code: values.countryCode,
      phone_number: values.phoneNumber || null,
      message: values.message,
      website: values.website,
      source: "portfolio_contact_modal",
      page_path: window.location.pathname,
      submitted_at_client: new Date().toISOString(),
      form_started_at: new Date(formOpenedAt).toISOString()
    };
  }

  function openContactModal(context, event) {
    event.preventDefault();
    context.previousFocus = event.detail > 0 ? null : document.activeElement;
    if (event.detail > 0 && event.currentTarget && typeof event.currentTarget.blur === "function") {
      event.currentTarget.blur();
    }

    context.formOpenedAt = Date.now();
    context.modal.hidden = false;
    document.body.classList.add("message-modal-open");
    setMessageStatus(context, "", "");
    clearContactErrors(context);
    updateMessageCounter(context);

    window.setTimeout(function () {
      var firstField = context.modal.querySelector("#message-name");
      if (firstField) {
        firstField.focus();
      }
    }, 0);
  }

  function closeContactModal(context) {
    if (context.closeTimer) {
      window.clearTimeout(context.closeTimer);
      context.closeTimer = null;
    }
    if (context.activeController) {
      context.activeController.abort();
      context.activeController = null;
    }

    context.modal.hidden = true;
    document.body.classList.remove("message-modal-open");
    setContactSubmitting(context, false);

    if (context.previousFocus && typeof context.previousFocus.focus === "function") {
      context.previousFocus.focus();
    }
  }

  function getFocusableModalElements(modal) {
    return Array.prototype.slice.call(
      modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (element) {
      return element.offsetParent !== null;
    });
  }

  function trapContactModalFocus(context, event) {
    if (context.modal.hidden || event.key !== "Tab") {
      return;
    }

    var focusableElements = getFocusableModalElements(context.modal);
    if (!focusableElements.length) {
      return;
    }

    var firstElement = focusableElements[0];
    var lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleContactSubmit(context, event) {
    event.preventDefault();
    var contactValues = readContactValues(context.form);
    setMessageStatus(context, "", "");

    if (!validateContactValues(context, contactValues)) {
      return;
    }

    context.activeController = "AbortController" in window ? new AbortController() : null;
    setContactSubmitting(context, true);
    setMessageStatus(context, "Sending message...", "loading");

    submitContactMessage(
      buildContactPayload(contactValues, context.formOpenedAt),
      context.activeController ? context.activeController.signal : undefined
    ).then(function () {
      context.activeController = null;
      setCooldown(10);
      context.form.reset();
      updateMessageCounter(context);
      setMessageStatus(context, "Message sent. Thank you for reaching out.", "success");
      context.closeTimer = window.setTimeout(function () {
        context.closeTimer = null;
        closeContactModal(context);
        setMessageStatus(context, "", "");
      }, 850);
    }).catch(function (error) {
      var message = error.name === "AbortError"
        ? "Message sending was cancelled."
        : error.message || "The message could not be sent yet.";
      setMessageStatus(context, message, "error");
    }).finally(function () {
      context.activeController = null;
      setContactSubmitting(context, false);
    });
  }

  function bindContactModal(context) {
    context.openButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        openContactModal(context, event);
      });
    });
    context.closeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        closeContactModal(context);
      });
    });
    context.modal.addEventListener("click", function (event) {
      if (event.target === context.modal) {
        closeContactModal(context);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (context.modal.hidden) {
        return;
      }
      if (event.key === "Escape") {
        closeContactModal(context);
      } else {
        trapContactModalFocus(context, event);
      }
    });
    context.messageField.addEventListener("input", function () {
      updateMessageCounter(context);
    });
    context.form.addEventListener("submit", function (event) {
      handleContactSubmit(context, event);
    });
    context.dialog.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }

  function initContactModal() {
    var openButtons = document.querySelectorAll("[data-message-modal-open]");
    if (!openButtons.length) {
      return;
    }

    bindContactModal(createContactModalContext(createContactModal(), openButtons));
  }

  initThemeToggle();
  initJsonContent();
  initNoteDetail();
  initNoteSearch();
  initContactModal();
})();
