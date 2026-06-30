(function () {
  "use strict";

  var LOCATION_CACHE_KEY = "portfolio-admin-location";
  var locationInitialized = false;
  var networkInitialized = false;

  function findElement(selector) {
    return document.querySelector(selector);
  }

  function setText(selector, value) {
    var element = findElement(selector);
    if (element) {
      element.textContent = value;
    }
  }

  function setHidden(selector, hidden) {
    var element = findElement(selector);
    if (element) {
      element.hidden = hidden;
    }
  }

  function checkedAtText(date) {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date || new Date());
  }

  function connectionApi() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }

  function formatExactType(connection) {
    if (!connection || !connection.type || connection.type === "unknown") {
      return "Not exposed by this browser";
    }

    return connection.type + " browser-reported";
  }

  function formatEffectiveType(connection) {
    if (!connection || !connection.effectiveType) {
      return "Not available";
    }

    return connection.effectiveType + " browser estimate";
  }

  function formatDownlink(connection) {
    if (!connection || typeof connection.downlink !== "number" || connection.downlink <= 0) {
      return "Not available";
    }

    return connection.downlink + " Mbps estimate";
  }

  function formatRtt(connection) {
    if (!connection || typeof connection.rtt !== "number" || connection.rtt <= 0) {
      return "Not available";
    }

    return connection.rtt + " ms estimate";
  }

  function formatSaveData(connection) {
    if (!connection || typeof connection.saveData !== "boolean") {
      return "Not available";
    }

    return connection.saveData ? "Enabled" : "Disabled";
  }

  function renderNetworkInfo() {
    var connection = connectionApi();
    var hasNetworkInfo = Boolean(connection);

    setText("[data-network-status]", navigator.onLine ? "Online" : "Offline");
    setText("[data-network-exact-type]", hasNetworkInfo ? formatExactType(connection) : "Not exposed by this browser");
    setText("[data-network-effective-type]", hasNetworkInfo ? formatEffectiveType(connection) : "Not available");
    setText("[data-network-download]", hasNetworkInfo ? formatDownlink(connection) : "Not available");
    setText("[data-network-rtt]", hasNetworkInfo ? formatRtt(connection) : "Not available");
    setText("[data-network-save-data]", hasNetworkInfo ? formatSaveData(connection) : "Not available");
    setText("[data-network-upload]", "Not available without a test endpoint");
    setText("[data-network-checked]", checkedAtText());
  }

  function initNetworkInfo() {
    var button = findElement("[data-network-refresh]");
    var connection = connectionApi();

    if (networkInitialized) {
      renderNetworkInfo();
      return;
    }

    networkInitialized = true;
    renderNetworkInfo();

    if (button) {
      button.addEventListener("click", function () {
        button.disabled = true;
        button.textContent = "Checking...";
        renderNetworkInfo();

        window.setTimeout(function () {
          button.disabled = false;
          button.textContent = "Refresh network";
        }, 180);
      });
    }

    if (connection && typeof connection.addEventListener === "function") {
      connection.addEventListener("change", renderNetworkInfo);
    }
  }

  function locationLanguage() {
    var language = navigator.language || navigator.userLanguage || "en";
    return language.toLowerCase().indexOf("tr") === 0 ? "tr" : "en";
  }

  function safeJsonParse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("Ignored invalid cached admin location data.", error);
      return null;
    }
  }

  function readCachedLocation() {
    var cached;

    try {
      cached = safeJsonParse(window.localStorage.getItem(LOCATION_CACHE_KEY));
    } catch (error) {
      console.warn("Admin location cache could not be read.", error);
      return null;
    }

    if (!cached || typeof cached !== "object") {
      return null;
    }

    if (!cached.city && !cached.region && !cached.country) {
      return null;
    }

    return cached;
  }

  function cacheLocation(locationDetails) {
    try {
      window.localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationDetails));
    } catch (error) {
      console.warn("Admin location cache could not be saved.", error);
    }
  }

  function clearCachedLocation() {
    try {
      window.localStorage.removeItem(LOCATION_CACHE_KEY);
    } catch (error) {
      console.warn("Admin location cache could not be cleared.", error);
    }
  }

  function renderLocationInfo(locationDetails, statusText) {
    setText("[data-location-status]", statusText || locationDetails.status || "Location enabled");
    setText("[data-location-city]", locationDetails.city || "Not available");
    setText("[data-location-region]", locationDetails.region || "Not available");
    setText("[data-location-country]", locationDetails.country || "Not available");
    setText("[data-location-checked]", locationDetails.checkedAtLabel || checkedAtText(locationDetails.checkedAt ? new Date(locationDetails.checkedAt) : new Date()));
    setHidden("[data-location-clear]", false);
  }

  function renderLocationEmpty(statusText) {
    setText("[data-location-status]", statusText || "Location not enabled");
    setText("[data-location-city]", "Not available");
    setText("[data-location-region]", "Not available");
    setText("[data-location-country]", "Not available");
    setText("[data-location-checked]", "Not checked");
    setHidden("[data-location-clear]", true);
  }

  function locationErrorText(error) {
    if (!error) {
      return "Location unavailable";
    }

    if (error.code === error.PERMISSION_DENIED) {
      return "Location permission denied";
    }

    if (error.code === error.TIMEOUT) {
      return "Location request timed out";
    }

    return "Location unavailable";
  }

  function parseLocationPayload(payload) {
    var address = payload && payload.address ? payload.address : {};
    var city = address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      "";
    var region = address.state ||
      address.province ||
      address.region ||
      address.county ||
      "";
    var country = address.country || "";

    if (!city && payload && payload.display_name) {
      city = String(payload.display_name).split(",")[0].trim();
    }

    return {
      city: city,
      region: region,
      country: country,
      checkedAt: new Date().toISOString(),
      checkedAtLabel: checkedAtText()
    };
  }

  function reverseGeocodeLocation(latitude, longitude) {
    var params = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
      zoom: "10",
      addressdetails: "1",
      "accept-language": locationLanguage()
    });

    return window.fetch("https://nominatim.openstreetmap.org/reverse?" + params.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    }).then(function (geocodeResponse) {
      if (!geocodeResponse.ok) {
        throw new Error("City lookup failed");
      }

      return geocodeResponse.json();
    }).then(parseLocationPayload);
  }

  function requestLocation() {
    var button = findElement("[data-location-request]");

    if (!navigator.geolocation) {
      renderLocationEmpty("Geolocation is not supported by this browser");
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Checking...";
    }

    setText("[data-location-status]", "Waiting for browser permission");

    navigator.geolocation.getCurrentPosition(function (position) {
      setText("[data-location-status]", "Looking up city...");

      reverseGeocodeLocation(position.coords.latitude, position.coords.longitude)
        .then(function (locationDetails) {
          cacheLocation(locationDetails);
          renderLocationInfo(locationDetails, "Location enabled");
          if (button) {
            button.textContent = "Refresh location";
          }
        })
        .catch(function (error) {
          console.error("Admin city lookup failed.", error);
          renderLocationEmpty("City lookup failed");
          if (button) {
            button.textContent = "Use my location";
          }
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
          }
        });
    }, function (error) {
      renderLocationEmpty(locationErrorText(error));
      if (button) {
        button.disabled = false;
        button.textContent = "Use my location";
      }
    }, {
      enableHighAccuracy: false,
      maximumAge: 300000,
      timeout: 10000
    });
  }

  function initLocationInfo() {
    var requestButton = findElement("[data-location-request]");
    var clearButton = findElement("[data-location-clear]");
    var cached = readCachedLocation();

    if (locationInitialized) {
      return;
    }

    locationInitialized = true;

    if (cached) {
      renderLocationInfo(cached, "Last saved location");
      if (requestButton) {
        requestButton.textContent = "Refresh location";
      }
    } else {
      renderLocationEmpty("Location not enabled");
    }

    if (requestButton) {
      if (!navigator.geolocation) {
        requestButton.disabled = true;
        renderLocationEmpty("Geolocation is not supported by this browser");
      } else {
        requestButton.addEventListener("click", requestLocation);
      }
    }

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        clearCachedLocation();
        renderLocationEmpty("Location cleared");
        if (requestButton) {
          requestButton.textContent = "Use my location";
        }
      });
    }
  }

  window.addEventListener("admin:authenticated", function () {
    initNetworkInfo();
    initLocationInfo();
  });

  window.addEventListener("online", renderNetworkInfo);
  window.addEventListener("offline", renderNetworkInfo);
})();
