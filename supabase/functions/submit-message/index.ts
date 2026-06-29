type MessagePayload = {
  name?: string;
  company?: string | null;
  contact_email?: string;
  phone_country_code?: string | null;
  phone_number?: string | null;
  message?: string;
  website?: string;
  submitted_at_client?: string;
  form_started_at?: string;
};

type InsertPayload = {
  name: string;
  company: string | null;
  contact_email: string;
  phone_country_code: string | null;
  phone_number: string | null;
  message: string;
  status: "unread" | "spam";
  spam_score: number;
  spam_reason: string | null;
  ip_hash: string | null;
  user_agent: string | null;
};

const TABLE_NAME = "contact_messages";
const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 20;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_MESSAGES = 3;

const corsHeaders = (request: Request) => {
  const origin = request.headers.get("Origin") || "*";
  const allowedOrigins = readListEnv("ALLOWED_ORIGINS");
  const allowOrigin = allowedOrigins.length === 0 || allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

Deno.serve(async (request) => {
  const headers = corsHeaders(request);

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, headers);
  }

  const publishableKey = request.headers.get("apikey") || "";
  if (!isAllowedPublishableKey(publishableKey)) {
    return json({ error: "Invalid publishable key." }, 401, headers);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || readSecretKeysJson()[0];

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Supabase function secrets are not configured." }, 500, headers);
  }

  let payload: MessagePayload;
  try {
    payload = await request.json();
  } catch (_error) {
    return json({ error: "Invalid JSON payload." }, 400, headers);
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return json({ error: validationError }, 400, headers);
  }

  const ipAddress = getRequestIp(request);
  const ipHash = ipAddress ? await hashValue(ipAddress, Deno.env.get("IP_HASH_SALT") || supabaseUrl) : null;
  const userAgent = request.headers.get("User-Agent");
  const spam = scoreSpam(payload);

  if (ipHash) {
    const recentMessages = await countRecentMessages(supabaseUrl, serviceRoleKey, ipHash);
    if (recentMessages >= RATE_LIMIT_MAX_MESSAGES) {
      return json({ error: "Too many messages were sent recently. Please try again later." }, 429, headers);
    }

    if (recentMessages > 0) {
      spam.score += recentMessages * 15;
      spam.reasons.push("recent-message-from-same-ip");
    }
  }

  const record: InsertPayload = {
    name: payload.name!.trim(),
    company: normalizeNullable(payload.company),
    contact_email: payload.contact_email!.trim().toLowerCase(),
    phone_country_code: normalizeNullable(payload.phone_country_code),
    phone_number: normalizeNullable(payload.phone_number),
    message: payload.message!.trim(),
    status: spam.score >= 60 ? "spam" : "unread",
    spam_score: Math.min(spam.score, 100),
    spam_reason: spam.reasons.length ? spam.reasons.join(", ") : null,
    ip_hash: ipHash,
    user_agent: userAgent,
  };

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/${TABLE_NAME}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(record),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    console.error("contact_messages insert failed", errorText);
    return json({ error: "Message could not be saved." }, 500, headers);
  }

  return json({ ok: true, status: record.status }, 200, headers);
});

function validatePayload(payload: MessagePayload): string | null {
  const name = payload.name?.trim() || "";
  const contactEmail = payload.contact_email?.trim() || "";
  const message = payload.message?.trim() || "";

  if (payload.website?.trim()) {
    return "Submission blocked by spam protection.";
  }

  if (!name) {
    return "Name is required.";
  }

  if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return "A valid contact email is required.";
  }

  if (!message) {
    return "Message is required.";
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return "Message must be 2000 characters or fewer.";
  }

  if (message.length < MIN_MESSAGE_LENGTH) {
    return "Message is too short.";
  }

  if (payload.phone_number && !/^[0-9\s().-]{5,24}$/.test(payload.phone_number.trim())) {
    return "Phone number format is invalid.";
  }

  const submittedAt = Date.parse(payload.submitted_at_client || "");
  const formStartedAt = Date.parse(payload.form_started_at || "");
  if (Number.isFinite(submittedAt) && Number.isFinite(formStartedAt) && submittedAt - formStartedAt < 3000) {
    return "Submission was completed too quickly.";
  }

  const gibberishReason = validateMessageMeaning(message);
  if (gibberishReason) {
    return gibberishReason;
  }

  return null;
}

function validateMessageMeaning(message: string): string | null {
  const letters = message.match(/[a-zA-ZğüşöçıİĞÜŞÖÇ]/g) || [];
  const vowels = message.match(/[aeiouıöüAEIOUİÖÜ]/g) || [];
  const words = message.match(/[a-zA-ZğüşöçıİĞÜŞÖÇ]{2,}/g) || [];
  const symbols = message.match(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ\s.,!?'"():;/-]/g) || [];
  const uniqueCharacters = new Set(message.toLowerCase().replace(/\s/g, "").split("")).size;

  if (/(.)\1{7,}/.test(message)) {
    return "Please avoid repeated-character filler text.";
  }

  if (words.length < 4) {
    return "Please use a few readable words.";
  }

  if (letters.length < 12 || vowels.length / Math.max(letters.length, 1) < 0.16) {
    return "Please write a readable message.";
  }

  if (symbols.length / Math.max(message.length, 1) > 0.35 || uniqueCharacters < 6) {
    return "Please avoid random symbols or low-information text.";
  }

  return null;
}

function scoreSpam(payload: MessagePayload) {
  const reasons: string[] = [];
  let score = 0;
  const message = payload.message?.trim() || "";

  if (payload.website?.trim()) {
    score += 100;
    reasons.push("honeypot");
  }

  if (/(.)\1{7,}/.test(message)) {
    score += 50;
    reasons.push("repeated-characters");
  }

  if ((message.match(/https?:\/\//g) || []).length > 2) {
    score += 35;
    reasons.push("many-links");
  }

  if (message.length < 40) {
    score += 15;
    reasons.push("short-message");
  }

  const submittedAt = Date.parse(payload.submitted_at_client || "");
  const formStartedAt = Date.parse(payload.form_started_at || "");
  if (Number.isFinite(submittedAt) && Number.isFinite(formStartedAt) && submittedAt - formStartedAt < 5000) {
    score += 30;
    reasons.push("fast-submit");
  }

  return { score, reasons };
}

async function countRecentMessages(supabaseUrl: string, serviceRoleKey: string, ipHash: string) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
  const url = new URL(`${supabaseUrl}/rest/v1/${TABLE_NAME}`);
  url.searchParams.set("select", "id");
  url.searchParams.set("ip_hash", `eq.${ipHash}`);
  url.searchParams.set("created_at", `gte.${since}`);

  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "count=exact",
    },
  });

  if (!response.ok) {
    console.error("rate-limit lookup failed", await response.text());
    return 0;
  }

  const range = response.headers.get("content-range");
  const total = range?.split("/")[1];
  return total ? Number(total) || 0 : 0;
}

function isAllowedPublishableKey(key: string) {
  const allowed = readListEnv("ALLOWED_PUBLISHABLE_KEYS")
    .concat(readPublishableKeysJson())
    .filter(Boolean);

  return allowed.length > 0 && allowed.includes(key);
}

function readListEnv(name: string) {
  return (Deno.env.get(name) || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readPublishableKeysJson() {
  const raw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((value) => typeof value === "string");
    }

    if (parsed && typeof parsed === "object") {
      return Object.values(parsed).filter((value): value is string => typeof value === "string");
    }
  } catch (_error) {
    return [];
  }

  return [];
}

function readSecretKeysJson() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((value) => typeof value === "string");
    }

    if (parsed && typeof parsed === "object") {
      return Object.values(parsed).filter((value): value is string => typeof value === "string");
    }
  } catch (_error) {
    return [];
  }

  return [];
}

function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || forwarded || null;
}

async function hashValue(value: string, salt: string) {
  const encoded = new TextEncoder().encode(`${salt}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeNullable(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function json(body: Record<string, unknown>, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
}
