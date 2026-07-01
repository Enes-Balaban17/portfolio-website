(function () {
  "use strict";

  var localHosts = ["127.0.0.1", "localhost", "::1"];
  var isLocal = localHosts.indexOf(window.location.hostname) !== -1;
  var identityReady = false;
  var decapLoading = false;

  function statusElement() {
    return document.querySelector("[data-cms-status]");
  }

  function setStatus(message, state) {
    var status = statusElement();

    if (!status) {
      return;
    }

    status.textContent = message;
    status.dataset.state = state || "loading";
  }

  function readableIdentityError(error) {
    var message = error && typeof error.message === "string" ? error.message.trim() : "";

    if (message.length < 4) {
      return "Netlify Identity login failed. Verify the invited account and try again.";
    }

    return "Netlify Identity login failed: " + message;
  }

  function setEditorAuthenticated(authenticated) {
    document.body.classList.toggle("cms-editor-authenticated", Boolean(authenticated));
  }

  function openIdentityLogin() {
    if (!window.netlifyIdentity) {
      setStatus("Netlify Identity widget did not load.", "error");
      return;
    }

    window.netlifyIdentity.open("login");
  }

  function initializeIdentity() {
    var button = document.getElementById("open-netlify-identity-login");

    if (button) {
      button.addEventListener("click", openIdentityLogin);
      button.hidden = isLocal;
    }

    if (!window.netlifyIdentity) {
      setStatus("Netlify Identity widget did not load.", "error");
      return;
    }

    try {
      identityReady = window.NetlifyIdentityFlow
        ? window.NetlifyIdentityFlow.initialize()
        : false;

      if (!identityReady) {
        setStatus("Netlify Identity widget did not load.", "error");
        return;
      }

      setEditorAuthenticated(window.netlifyIdentity.currentUser());

      window.netlifyIdentity.on("init", function (user) {
        setEditorAuthenticated(user);
      });

      window.netlifyIdentity.on("login", function () {
        setEditorAuthenticated(true);
        window.netlifyIdentity.close();
        setStatus("Netlify Identity login succeeded. Reloading Decap CMS...", "success");
        window.location.reload();
      });

      window.netlifyIdentity.on("logout", function () {
        setEditorAuthenticated(false);
      });

      window.netlifyIdentity.on("error", function (error) {
        setStatus(readableIdentityError(error), "error");
      });

      if (isLocal) {
        setStatus("Local CMS mode uses npx decap-server and does not require Netlify Identity.", "loading");
      } else {
        setStatus("Netlify Identity is ready. Use the invited Identity account to sign in.", "success");
      }
    } catch (error) {
      identityReady = false;
      setStatus(readableIdentityError(error), "error");
    }
  }

  function loadDecapCms() {
    if (decapLoading) {
      return;
    }

    decapLoading = true;

    if (!isLocal && !identityReady) {
      setStatus("Netlify Identity widget did not load.", "error");
    } else if (isLocal) {
      setStatus("Connecting to the local Decap proxy. Keep npx decap-server running.", "loading");
    } else {
      setStatus("Loading Decap CMS...", "loading");
    }

    var script = document.createElement("script");
    script.src = "https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js";
    script.async = true;
    script.addEventListener("load", function () {
      if (isLocal) {
        setEditorAuthenticated(true);
        setStatus("Decap CMS loaded through the local proxy.", "success");
      } else if (identityReady) {
        setStatus("Decap CMS loaded. Sign in with the invited Netlify Identity account.", "success");
      }
    }, { once: true });
    script.addEventListener("error", function () {
      setStatus("Decap CMS script did not load. Check the network connection and try again.", "error");
    }, { once: true });
    document.body.appendChild(script);
  }

  document.addEventListener("DOMContentLoaded", initializeIdentity, { once: true });
  window.addEventListener("admin:authenticated", loadDecapCms, { once: true });
}());
