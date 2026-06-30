(function () {
  "use strict";

  var messageViewState = {
    activeFilter: "unread",
    client: null,
    config: null,
    messages: [],
    selectedId: null
  };
  var allowedMessageStatuses = ["read", "archived", "spam", "deleted"];

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
    return messageViewState.messages.find(function (message) {
      return message.id === messageViewState.selectedId;
    }) || messageViewState.messages[0] || null;
  }

  function filteredMessages() {
    return messageViewState.messages.filter(function (message) {
      var status = messageStatus(message);

      if (status === "deleted") {
        return false;
      }

      if (messageViewState.activeFilter === "all") {
        return true;
      }

      return status === messageViewState.activeFilter;
    });
  }

  function messageRowMarkup(message) {
    var isSelected = message.id === messageViewState.selectedId;
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
  }

  function bindMessageSelection(messageListElement) {
    messageListElement.querySelectorAll("[data-message-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        messageViewState.selectedId = button.getAttribute("data-message-id");
        renderList();
      });
    });
  }

  function renderList() {
    var messageListElement = document.querySelector("[data-messages-list]");
    if (!messageListElement) {
      return;
    }

    var visibleMessages = filteredMessages();

    if (!visibleMessages.length) {
      messageListElement.innerHTML = '<div class="admin-empty-card">No messages match this filter.</div>';
      renderDetail(null);
      return;
    }

    messageListElement.innerHTML = visibleMessages.map(messageRowMarkup).join("");
    bindMessageSelection(messageListElement);

    if (!messageViewState.selectedId || !visibleMessages.some(function (message) { return message.id === messageViewState.selectedId; })) {
      messageViewState.selectedId = visibleMessages[0].id;
    }

    renderDetail(selectedMessage());
  }

  function messageDetailMarkup(message) {
    return [
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
  }

  function renderDetail(message) {
    var messageDetailElement = document.querySelector("[data-message-detail]");
    if (!messageDetailElement) {
      return;
    }

    if (!message) {
      messageDetailElement.innerHTML = "<p>Select a message to view details.</p>";
      return;
    }

    messageDetailElement.innerHTML = messageDetailMarkup(message);

    messageDetailElement.querySelectorAll("[data-message-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        var nextStatus = button.getAttribute("data-message-action");
        updateMessageStatus(message.id, nextStatus);
      });
    });
  }

  function buildQuery() {
    var table = messageViewState.config.messagesTable || "contact_messages";
    var query = messageViewState.client
      .from(table)
      .select("id,name,company,contact_email,phone_country_code,phone_number,message,status,spam_score,spam_reason,user_agent,created_at,read_at")
      .neq("status", "deleted")
      .order("created_at", { ascending: false });

    if (messageViewState.activeFilter !== "all") {
      query = query.eq("status", messageViewState.activeFilter);
    }

    return query;
  }

  function loadMessages() {
    setStatus("Loading messages...", "loading");

    buildQuery().then(function (queryResponse) {
      if (queryResponse.error) {
        throw queryResponse.error;
      }

      messageViewState.messages = queryResponse.data || [];
      messageViewState.selectedId = messageViewState.messages[0] ? messageViewState.messages[0].id : null;
      setStatus(messageViewState.messages.length ? "" : "No messages found for this filter.", messageViewState.messages.length ? "" : "empty");
      renderList();
    }).catch(function (error) {
      console.error("Admin message query failed.", error);
      messageViewState.messages = [];
      setStatus((error && error.message ? error.message : "Could not load messages.") + " Check Supabase RLS/admin setup.", "error");
      renderList();
    });
  }

  function updateMessageStatus(id, nextStatus) {
    if (allowedMessageStatuses.indexOf(nextStatus) === -1) {
      setStatus("Unsupported message status.", "error");
      return;
    }

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

    messageViewState.client
      .from(messageViewState.config.messagesTable || "contact_messages")
      .update(updates)
      .eq("id", id)
      .select("id,name,company,contact_email,phone_country_code,phone_number,message,status,spam_score,spam_reason,user_agent,created_at,read_at")
      .single()
      .then(function (updateResponse) {
        if (updateResponse.error) {
          throw updateResponse.error;
        }

        if (!updateResponse.data) {
          throw new Error("No row was updated. Check SELECT and UPDATE RLS policies.");
        }

        messageViewState.messages = messageViewState.messages.map(function (message) {
          return message.id === id ? updateResponse.data : message;
        }).filter(function (message) {
          return message.status !== "deleted";
        });

        if (nextStatus === "deleted") {
          messageViewState.selectedId = messageViewState.messages[0] ? messageViewState.messages[0].id : null;
        } else {
          messageViewState.selectedId = id;
        }

        setStatus("Message updated.", "success");
        renderList();
      })
      .catch(function (error) {
        console.error("Admin message status update failed.", error);
        setStatus((error && error.message ? error.message : "Could not update message.") + " Check Supabase RLS/admin setup.", "error");
      });
  }

  function initFilters() {
    document.querySelectorAll("[data-message-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        messageViewState.activeFilter = button.getAttribute("data-message-filter");
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
    messageViewState.client = event.detail.client;
    messageViewState.config = event.detail.config;
    initFilters();
    loadMessages();
  });
})();
