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

type FunctionConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  ipHashSalt: string;
};

type SpamAssessment = {
  score: number;
  reasons: string[];
};

const TABLE_NAME = "contact_messages";
const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 20;
const MAX_REQUEST_BODY_BYTES = 16_384;
const MAX_NAME_LENGTH = 120;
const MAX_COMPANY_LENGTH = 160;
const MAX_EMAIL_LENGTH = 254;
const MAX_COUNTRY_CODE_LENGTH = 8;
const MAX_USER_AGENT_LENGTH = 512;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_MESSAGES = 3;

function resolveCors(request: Request) {
  const origin = request.headers.get("Origin");
  const allowedOrigins = readListEnv("ALLOWED_ORIGINS");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return {
    configured: allowedOrigins.length > 0,
    allowed: !origin || allowedOrigins.includes(origin),
    headers,
  };
}

function loadFunctionConfig(): FunctionConfig | null {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const ipHashSalt = Deno.env.get("IP_HASH_SALT");
  const serviceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || readSecretKeysJson()[0];

  if (!supabaseUrl || !serviceRoleKey || !ipHashSalt) {
    return null;
  }

  return { supabaseUrl, serviceRoleKey, ipHashSalt };
}

function parseMessagePayload(rawBody: string): MessagePayload | null {
  try {
    const payload = JSON.parse(rawBody);
    return payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload as MessagePayload
      : null;
  } catch (_error) {
    return null;
  }
}

function createInsertPayload(
  payload: MessagePayload,
  spamAssessment: SpamAssessment,
  ipHash: string | null,
  userAgent: string | null,
): InsertPayload {
  return {
    name: payload.name!.trim(),
    company: normalizeNullable(payload.company),
    contact_email: payload.contact_email!.trim().toLowerCase(),
    phone_country_code: normalizeNullable(payload.phone_country_code),
    phone_number: normalizeNullable(payload.phone_number),
    message: payload.message!.trim(),
    status: spamAssessment.score >= 60 ? "spam" : "unread",
    spam_score: Math.min(spamAssessment.score, 100),
    spam_reason: spamAssessment.reasons.length ? spamAssessment.reasons.join(", ") : null,
    ip_hash: ipHash,
    user_agent: userAgent ? userAgent.slice(0, MAX_USER_AGENT_LENGTH) : null,
  };
}

async function applyRecentMessageRisk(
  spamAssessment: SpamAssessment,
  config: FunctionConfig,
  ipHash: string | null,
): Promise<boolean> {
  if (!ipHash) {
    return false;
  }

  const recentMessageCount = await countRecentMessages(config.supabaseUrl, config.serviceRoleKey, ipHash);
  if (recentMessageCount >= RATE_LIMIT_MAX_MESSAGES) {
    return true;
  }

  if (recentMessageCount > 0) {
    spamAssessment.score += recentMessageCount * 15;
    spamAssessment.reasons.push("recent-message-from-same-ip");
  }

  return false;
}

async function insertContactMessage(config: FunctionConfig, record: InsertPayload): Promise<boolean> {
  const insertResponse = await fetch(`${config.supabaseUrl}/rest/v1/${TABLE_NAME}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(record),
  });

  if (!insertResponse.ok) {
    console.error("contact_messages insert failed with status", insertResponse.status);
    return false;
  }

  return true;
}

async function handleMessageSubmission(request: Request, headers: Record<string, string>): Promise<Response> {
  const publishableKey = request.headers.get("apikey") || "";
  if (!isAllowedPublishableKey(publishableKey)) {
    return json({ error: "Invalid publishable key." }, 401, headers);
  }

  const config = loadFunctionConfig();
  if (!config) {
    return json({ error: "Message service is temporarily unavailable." }, 503, headers);
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return json({ error: "Content-Type must be application/json." }, 415, headers);
  }

  const declaredLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BODY_BYTES) {
    return json({ error: "Request body is too large." }, 413, headers);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BODY_BYTES) {
    return json({ error: "Request body is too large." }, 413, headers);
  }

  const payload = parseMessagePayload(rawBody);
  if (!payload) {
    return json({ error: "Invalid JSON payload." }, 400, headers);
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return json({ error: validationError }, 400, headers);
  }

  const ipAddress = getRequestIp(request);
  const ipHash = ipAddress ? await hashValue(ipAddress, config.ipHashSalt) : null;
  const userAgent = request.headers.get("User-Agent");
  const spamAssessment = scoreSpam(payload);

  if (await applyRecentMessageRisk(spamAssessment, config, ipHash)) {
    return json({ error: "Too many messages were sent recently. Please try again later." }, 429, headers);
  }

  const record = createInsertPayload(payload, spamAssessment, ipHash, userAgent);
  if (!await insertContactMessage(config, record)) {
    return json({ error: "Message could not be saved." }, 500, headers);
  }

  return json({ ok: true, status: record.status }, 200, headers);
}

Deno.serve(async (request) => {
  const cors = resolveCors(request);

  if (!cors.configured) {
    return json({ error: "Message service is temporarily unavailable." }, 503, cors.headers);
  }

  if (!cors.allowed) {
    return json({ error: "Origin is not allowed." }, 403, cors.headers);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors.headers });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, cors.headers);
  }

  try {
    return await handleMessageSubmission(request, cors.headers);
  } catch (error) {
    console.error("Unhandled submit-message failure.", error instanceof Error ? error.name : "unknown-error");
    return json({ error: "Message service is temporarily unavailable." }, 500, cors.headers);
  }
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

  if (name.length > MAX_NAME_LENGTH) {
    return "Name is too long.";
  }

  if ((payload.company?.trim().length || 0) > MAX_COMPANY_LENGTH) {
    return "Company name is too long.";
  }

  if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return "A valid contact email is required.";
  }

  if (contactEmail.length > MAX_EMAIL_LENGTH) {
    return "Contact email is too long.";
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

  if ((payload.phone_country_code?.trim().length || 0) > MAX_COUNTRY_CODE_LENGTH) {
    return "Phone country code is invalid.";
  }

  const submittedAt = Date.parse(payload.submitted_at_client || "");
  const formStartedAt = Date.parse(payload.form_started_at || "");
  if (!Number.isFinite(submittedAt) || !Number.isFinite(formStartedAt) || submittedAt < formStartedAt) {
    return "Submission timing is invalid.";
  }

  const elapsed = submittedAt - formStartedAt;
  if (elapsed < 3000) {
    return "Submission was completed too quickly.";
  }

  if (elapsed > 24 * 60 * 60 * 1000) {
    return "Submission session expired. Please reopen the form.";
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

function scoreSpam(payload: MessagePayload): SpamAssessment {
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

  const rateLimitResponse = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "count=exact",
    },
  });

  if (!rateLimitResponse.ok) {
    console.error("rate-limit lookup failed with status", rateLimitResponse.status);
    throw new Error("rate-limit-check-unavailable");
  }

  const range = rateLimitResponse.headers.get("content-range");
  const total = range?.split("/")[1];
  if (!total || total === "*" || !Number.isFinite(Number(total))) {
    console.error("rate-limit lookup returned an invalid count");
    throw new Error("rate-limit-count-invalid");
  }

  return Number(total);
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
  } catch (error) {
    console.error("SUPABASE_PUBLISHABLE_KEYS contains invalid JSON.", error);
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
  } catch (error) {
    console.error("SUPABASE_SECRET_KEYS contains invalid JSON.", error);
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
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
