(function () {
  "use strict";

  var state = {
    activeFilter: "unread",
    client: null,
    config: null,
    messages: [],
    selectedId: null
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) {
      return "Unknown";
    }

    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function messageStatus(message) {
    return message.status || "unread";
  }

  function phoneText(message) {
    return [message.phone_country_code, message.phone_number].filter(Boolean).join(" ") || "Not provided";
  }

  function setStatus(message, type) {
    var status = document.querySelector("[data-messages-status]");
    if (!status) {
      return;
    }

    status.textContent = message || "";
    status.dataset.state = type || "";
  }

  function selectedMessage() {
    return state.messages.find(function (message) {
      return message.id === state.selectedId;
    }) || state.messages[0] || null;
  }

  function filteredMessages() {
    return state.messages.filter(function (message) {
      var status = messageStatus(message);

      if (status === "deleted") {
        return false;
      }

      if (state.activeFilter === "all") {
        return true;
      }

      return status === state.activeFilter;
    });
  }

  function renderList() {
    var list = document.querySelector("[data-messages-list]");
    if (!list) {
      return;
    }

    var visible = filteredMessages();

    if (!visible.length) {
      list.innerHTML = '<div class="admin-empty-card">No messages match this filter.</div>';
      renderDetail(null);
      return;
    }

    list.innerHTML = visible.map(function (message) {
      var isSelected = message.id === state.selectedId;
      var preview = (message.message || "").slice(0, 140);

      return [
        '<button class="admin-message-row" type="button" data-message-id="' + escapeHtml(message.id) + '" aria-pressed="' + String(isSelected) + '">',
        '  <span class="admin-message-row-top">',
        "    <strong>" + escapeHtml(message.name || "Unknown sender") + "</strong>",
        '    <span class="admin-pill">' + escapeHtml(messageStatus(message)) + "</span>",
        "  </span>",
        '  <span class="admin-message-row-meta">' + escapeHtml(message.company || message.contact_email || "No company") + "</span>",
        '  <span class="admin-message-row-preview">' + escapeHtml(preview) + "</span>",
        '  <span class="admin-message-row-date">' + escapeHtml(formatDate(message.created_at)) + "</span>",
        "</button>"
      ].join("");
    }).join("");

    list.querySelectorAll("[data-message-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.selectedId = button.getAttribute("data-message-id");
        renderList();
        renderDetail(selectedMessage());
      });
    });

    if (!state.selectedId || !visible.some(function (message) { return message.id === state.selectedId; })) {
      state.selectedId = visible[0].id;
    }

    renderDetail(selectedMessage());
  }

  function renderDetail(message) {
    var detail = document.querySelector("[data-message-detail]");
    if (!detail) {
      return;
    }

    if (!message) {
      detail.innerHTML = "<p>Select a message to view details.</p>";
      return;
    }

    detail.innerHTML = [
      '<div class="admin-message-detail-header">',
      "  <div>",
      "    <h2>" + escapeHtml(message.name || "Unknown sender") + "</h2>",
      '    <p class="admin-muted">' + escapeHtml(message.contact_email || "No email provided") + "</p>",
      "  </div>",
      '  <span class="admin-pill">' + escapeHtml(messageStatus(message)) + "</span>",
      "</div>",
      "<dl>",
      "<div><dt>Company</dt><dd>" + escapeHtml(message.company || "Not provided") + "</dd></div>",
      "<div><dt>Contact Mail</dt><dd>" + escapeHtml(message.contact_email || "Not provided") + "</dd></div>",
      "<div><dt>Phone Number</dt><dd>" + escapeHtml(phoneText(message)) + "</dd></div>",
      "<div><dt>Created</dt><dd>" + escapeHtml(formatDate(message.created_at)) + "</dd></div>",
      "<div><dt>Read At</dt><dd>" + escapeHtml(formatDate(message.read_at)) + "</dd></div>",
      "<div><dt>Spam Score</dt><dd>" + escapeHtml(message.spam_score == null ? "Not scored" : message.spam_score) + "</dd></div>",
      "<div><dt>Spam Reason</dt><dd>" + escapeHtml(message.spam_reason || "None") + "</dd></div>",
      "<div><dt>User Agent</dt><dd>" + escapeHtml(message.user_agent || "Not stored") + "</dd></div>",
      "<div><dt>Message</dt><dd>" + escapeHtml(message.message || "") + "</dd></div>",
      "</dl>",
      '<div class="admin-message-actions">',
      '  <button class="admin-button admin-button-secondary" type="button" data-message-action="read">Mark as read</button>',
      '  <button class="admin-button admin-button-secondary" type="button" data-message-action="archived">Archive</button>',
      '  <button class="admin-button admin-button-secondary" type="button" data-message-action="spam">Mark as spam</button>',
      '  <button class="admin-button admin-button-danger" type="button" data-message-action="deleted">Delete</button>',
      "</div>"
    ].join("");

    detail.querySelectorAll("[data-message-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        var nextStatus = button.getAttribute("data-message-action");
        updateMessageStatus(message.id, nextStatus);
      });
    });
  }

  function buildQuery() {
    var table = state.config.messagesTable || "contact_messages";
    var query = state.client
      .from(table)
      .select("id,name,company,contact_email,phone_country_code,phone_number,message,status,spam_score,spam_reason,user_agent,created_at,read_at")
      .neq("status", "deleted")
      .order("created_at", { ascending: false });

    if (state.activeFilter !== "all") {
      query = query.eq("status", state.activeFilter);
    }

    return query;
  }

  function loadMessages() {
    setStatus("Loading messages...", "loading");

    buildQuery().then(function (result) {
      if (result.error) {
        throw result.error;
      }

      state.messages = result.data || [];
      state.selectedId = state.messages[0] ? state.messages[0].id : null;
      setStatus(state.messages.length ? "" : "No messages found for this filter.", state.messages.length ? "" : "empty");
      renderList();
    }).catch(function (error) {
      state.messages = [];
      setStatus((error && error.message ? error.message : "Could not load messages.") + " Check Supabase RLS/admin setup.", "error");
      renderList();
    });
  }

  function updateMessageStatus(id, nextStatus) {
    var updates = {
      status: nextStatus
    };

    if (nextStatus === "read") {
      updates.read_at = new Date().toISOString();
    }

    if (nextStatus === "deleted" && !window.confirm("Soft delete this message by setting status to deleted?")) {
      return;
    }

    setStatus("Updating message...", "loading");

    state.client
      .from(state.config.messagesTable || "contact_messages")
      .update(updates)
      .eq("id", id)
      .select("id,name,company,contact_email,phone_country_code,phone_number,message,status,spam_score,spam_reason,user_agent,created_at,read_at")
      .single()
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        if (!result.data) {
          throw new Error("No row was updated. Check SELECT and UPDATE RLS policies.");
        }

        state.messages = state.messages.map(function (message) {
          return message.id === id ? result.data : message;
        }).filter(function (message) {
          return message.status !== "deleted";
        });

        if (nextStatus === "deleted") {
          state.selectedId = state.messages[0] ? state.messages[0].id : null;
        } else {
          state.selectedId = id;
        }

        setStatus("Message updated.", "success");
        renderList();
      })
      .catch(function (error) {
        setStatus((error && error.message ? error.message : "Could not update message.") + " Check Supabase RLS/admin setup.", "error");
      });
  }

  function initFilters() {
    document.querySelectorAll("[data-message-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.activeFilter = button.getAttribute("data-message-filter");
        document.querySelectorAll("[data-message-filter]").forEach(function (item) {
          item.setAttribute("aria-pressed", String(item === button));
        });
        loadMessages();
      });
    });

    var refresh = document.querySelector("[data-refresh-messages]");
    if (refresh) {
      refresh.addEventListener("click", loadMessages);
    }
  }

  window.addEventListener("admin:authenticated", function (event) {
    state.client = event.detail.client;
    state.config = event.detail.config;
    initFilters();
    loadMessages();
  });
})();
