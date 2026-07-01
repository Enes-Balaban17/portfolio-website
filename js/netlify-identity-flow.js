(function () {
  "use strict";

  var identityTokenNames = [
    "invite_token",
    "recovery_token",
    "confirmation_token",
    "email_change_token",
    "access_token"
  ];
  var initialized = false;

  function hasIdentityToken(hash) {
    if (typeof hash !== "string" || hash.length < 2) {
      return false;
    }

    return identityTokenNames.some(function (name) {
      return hash.indexOf("#" + name + "=") === 0 || hash.indexOf("&" + name + "=") !== -1;
    });
  }

  function openTokenFlow() {
    if (!initialized || !hasIdentityToken(window.location.hash)) {
      return;
    }

    window.netlifyIdentity.open();
  }

  function initialize() {
    if (!window.netlifyIdentity) {
      return false;
    }

    try {
      if (!initialized) {
        window.netlifyIdentity.init();
        initialized = true;
      }

      openTokenFlow();
      return true;
    } catch (error) {
      return false;
    }
  }

  window.NetlifyIdentityFlow = Object.freeze({
    initialize: initialize
  });

  document.addEventListener("DOMContentLoaded", initialize, { once: true });
  window.addEventListener("hashchange", openTokenFlow);
}());
