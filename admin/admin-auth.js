(function () {
  "use strict";

  var defaultConfig = {
    supabaseUrl: "https://ufcvdlidsdrcdnjswocj.supabase.co",
    publishableKey: "sb_publishable_2qSMGPoQ9199wxowxnywDQ_ez2jsaj8",
    allowedAdminEmails: ["balabanenes111@icloud.com"],
    messagesTable: "contact_messages"
  };
  var config = Object.assign({}, defaultConfig, window.PORTFOLIO_ADMIN_CONFIG || {});
  var client = null;

  function getClient() {
    if (client) {
      return client;
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Supabase client library did not load.");
    }

    client = window.supabase.createClient(config.supabaseUrl, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return client;
  }

  function normalizedAllowedEmails() {
    return (config.allowedAdminEmails || [])
      .map(function (email) {
        return String(email || "").trim().toLowerCase();
      })
      .filter(Boolean);
  }

  function isAllowedAdminEmail(email) {
    var allowed = normalizedAllowedEmails();
    if (!allowed.length) {
      return true;
    }

    return allowed.indexOf(String(email || "").trim().toLowerCase()) !== -1;
  }

  function loginUrl() {
    return "login.html?redirect=" + encodeURIComponent(window.location.href);
  }

  function dashboardUrl() {
    var params = new URLSearchParams(window.location.search);
    var redirect = params.get("redirect");

    if (!redirect) {
      return "index.html";
    }

    try {
      var target = new URL(redirect, window.location.origin);
      if (target.origin === window.location.origin && target.pathname.indexOf("/admin/") !== -1) {
        return target.href;
      }
    } catch (error) {
      return "index.html";
    }

    return "index.html";
  }

  function setStatus(target, message, state) {
    if (!target) {
      return;
    }

    target.textContent = message || "";
    target.dataset.state = state || "";
  }

  function revealProtectedContent(session) {
    document.body.classList.add("is-authenticated");
    document.body.classList.remove("auth-loading");

    document.querySelectorAll("[data-admin-user-email]").forEach(function (element) {
      element.textContent = session.user && session.user.email ? session.user.email : "Signed in";
    });

    window.dispatchEvent(new CustomEvent("admin:authenticated", {
      detail: {
        client: getClient(),
        config: config,
        session: session
      }
    }));
  }

  function redirectToLogin() {
    if (document.body.classList.contains("admin-login-page")) {
      return;
    }

    window.location.replace(loginUrl());
  }

  function handleDeniedSession(session) {
    getClient().auth.signOut().finally(function () {
      window.location.replace("login.html?error=not_allowed");
    });
    return null;
  }

  function requireAuth() {
    return getClient().auth.getSession()
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        var session = result.data.session;
        if (!session) {
          redirectToLogin();
          return null;
        }

        if (!isAllowedAdminEmail(session.user && session.user.email)) {
          return handleDeniedSession(session);
        }

        revealProtectedContent(session);
        return {
          client: getClient(),
          config: config,
          session: session
        };
      })
      .catch(function () {
        redirectToLogin();
        return null;
      });
  }

  function initLogout() {
    document.querySelectorAll("[data-admin-logout]").forEach(function (button) {
      button.addEventListener("click", function () {
        button.disabled = true;
        getClient().auth.signOut().finally(function () {
          window.location.replace("login.html");
        });
      });
    });
  }

  function initLoginForm() {
    var form = document.querySelector("[data-admin-login-form]");
    if (!form) {
      return;
    }

    var status = document.querySelector("[data-admin-login-status]");
    var submit = document.querySelector("[data-admin-login-submit]");
    var params = new URLSearchParams(window.location.search);

    if (params.get("error") === "not_allowed") {
      setStatus(status, "This account is signed in, but it is not configured as an allowed admin.", "error");
    }

    getClient().auth.getSession().then(function (result) {
      var session = result.data && result.data.session;
      if (session && isAllowedAdminEmail(session.user && session.user.email)) {
        window.location.replace(dashboardUrl());
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = form.elements.email.value.trim();
      var password = form.elements.password.value;

      if (!email || !password) {
        setStatus(status, "Email and password are required.", "error");
        return;
      }

      submit.disabled = true;
      submit.textContent = "Signing in...";
      setStatus(status, "Signing in...", "loading");

      getClient().auth.signInWithPassword({
        email: email,
        password: password
      }).then(function (result) {
        if (result.error) {
          throw result.error;
        }

        if (!isAllowedAdminEmail(result.data.user && result.data.user.email)) {
          return handleDeniedSession(result.data.session);
        }

        setStatus(status, "Login successful. Opening dashboard...", "success");
        window.location.replace(dashboardUrl());
        return null;
      }).catch(function (error) {
        setStatus(status, error.message || "Login failed.", "error");
      }).finally(function () {
        submit.disabled = false;
        submit.textContent = "Login";
      });
    });
  }

  window.AdminAuth = {
    config: config,
    getClient: getClient,
    isAllowedAdminEmail: isAllowedAdminEmail,
    requireAuth: requireAuth
  };

  document.addEventListener("DOMContentLoaded", function () {
    initLoginForm();
    initLogout();

    if (document.body.classList.contains("admin-protected")) {
      requireAuth();
    }
  });
})();
