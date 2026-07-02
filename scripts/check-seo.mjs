import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://enesbalaban.dev";
const gtmContainerId = "GTM-NV8G86KK";
const ga4MeasurementId = "G-H30CXY75SF";
const googleVerificationToken = "NhDQuZafU-BxAUIGExI_Qlv00l7CyfhJtklUOzJVZIc";
const googleVerificationFilename = "google9caad667b8f95174.html";
const publicPages = [
  "index.html",
  "about.html",
  "projects.html",
  "notes.html",
  "note.html",
  "resume.html",
  "illustrations.html",
  "minigames.html"
];
const adminPages = ["cms.html", "index.html", "login.html", "messages.html", "new-content.html"];
const errors = [];
const titles = new Map();
const canonicalUrls = new Map();

function read(relativePath) {
  return readFileSync(resolve(repositoryRoot, relativePath), "utf8");
}

function capture(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function report(page, message) {
  errors.push(`${page}: ${message}`);
}

function occurrenceCount(source, value) {
  return source.split(value).length - 1;
}

function validateSocialImage(page, imageUrl) {
  if (!imageUrl.startsWith(`${siteOrigin}/`)) {
    report(page, "og:image must use the production domain.");
    return;
  }

  const localPath = decodeURIComponent(new URL(imageUrl).pathname).replace(/^\//, "");
  if (!existsSync(resolve(repositoryRoot, localPath))) {
    report(page, `og:image does not exist: ${localPath}`);
  }
}

for (const page of publicPages) {
  const html = read(page);
  const title = capture(html, /<title>([^<]+)<\/title>/i);
  const description = capture(html, /<meta\s+name="description"\s+content="([^"]+)"/i);
  const canonical = capture(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const ogTitle = capture(html, /<meta\s+property="og:title"\s+content="([^"]+)"/i);
  const ogDescription = capture(html, /<meta\s+property="og:description"\s+content="([^"]+)"/i);
  const ogUrl = capture(html, /<meta\s+property="og:url"\s+content="([^"]+)"/i);
  const ogImage = capture(html, /<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const twitterCard = capture(html, /<meta\s+name="twitter:card"\s+content="([^"]+)"/i);
  const gtmScriptUrl = "googletagmanager.com/gtm.js";
  const gtmNoScriptUrl = `googletagmanager.com/ns.html?id=${gtmContainerId}`;
  const ga4ScriptUrl = `googletagmanager.com/gtag/js?id=${ga4MeasurementId}`;
  const ga4Config = `gtag('config', '${ga4MeasurementId}')`;

  if (/<meta\s+name="keywords"/i.test(html)) report(page, "meta keywords must not be used.");
  if (!title) report(page, "missing title.");
  if (!description) report(page, "missing meta description.");
  if (!canonical.startsWith(siteOrigin)) report(page, "missing production canonical URL.");
  if (!ogTitle) report(page, "missing og:title.");
  if (!ogDescription) report(page, "missing og:description.");
  if (!ogUrl.startsWith(siteOrigin)) report(page, "missing production og:url.");
  if (!ogImage) report(page, "missing og:image.");
  if (twitterCard !== "summary_large_image") report(page, "twitter:card must be summary_large_image.");
  if (ogImage) validateSocialImage(page, ogImage);
  if (occurrenceCount(html, gtmScriptUrl) !== 1) report(page, "must include one GTM head script.");
  if (occurrenceCount(html, gtmNoScriptUrl) !== 1) report(page, "must include one GTM noscript iframe.");
  if (!new RegExp(`<body[^>]*>\\s*<!-- Google Tag Manager \\(noscript\\) -->`, "i").test(html)) {
    report(page, "GTM noscript block must immediately follow the opening body tag.");
  }
  if (occurrenceCount(html, ga4ScriptUrl) !== 1) report(page, "must include one GA4 loader script.");
  if (occurrenceCount(html, ga4Config) !== 1) report(page, "must include one GA4 config call.");

  if (title) {
    if (titles.has(title)) report(page, `title duplicates ${titles.get(title)}.`);
    titles.set(title, page);
  }
  if (canonical) {
    if (canonicalUrls.has(canonical)) report(page, `canonical duplicates ${canonicalUrls.get(canonical)}.`);
    canonicalUrls.set(canonical, page);
  }
}

const homeHtml = read("index.html");
const googleVerificationMeta = `<meta name="google-site-verification" content="${googleVerificationToken}">`;
if (occurrenceCount(homeHtml, googleVerificationMeta) !== 1) {
  errors.push("index.html must include one Google site verification meta tag.");
}
if (!existsSync(resolve(repositoryRoot, googleVerificationFilename))) {
  errors.push(`${googleVerificationFilename} is missing from the repository root.`);
}
const structuredDataSource = capture(homeHtml, /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
try {
  const structuredData = JSON.parse(structuredDataSource);
  const graphTypes = new Set((structuredData["@graph"] || []).map((entry) => entry["@type"]));
  ["Person", "WebSite", "WebPage"].forEach((type) => {
    if (!graphTypes.has(type)) errors.push(`index.html structured data is missing ${type}.`);
  });
} catch (error) {
  errors.push(`index.html contains invalid JSON-LD: ${error.message}`);
}

for (const filename of adminPages) {
  const page = `admin/${filename}`;
  const html = read(page);
  const robots = capture(html, /<meta\s+name="robots"\s+content="([^"]+)"/i).toLowerCase();
  if (!robots.includes("noindex") || !robots.includes("nofollow")) {
    report(page, "must include noindex, nofollow.");
  }
  if (/GTM-NV8G86KK|G-H30CXY75SF|googletagmanager\.com\/(?:gtm|gtag|ns)/i.test(html)) {
    report(page, "must not include public GTM or GA4 tracking.");
  }
}

const robotsPath = resolve(repositoryRoot, "robots.txt");
const sitemapPath = resolve(repositoryRoot, "sitemap.xml");
if (!existsSync(robotsPath)) errors.push("robots.txt is missing.");
if (!existsSync(sitemapPath)) errors.push("sitemap.xml is missing.");

if (existsSync(robotsPath)) {
  const robots = read("robots.txt");
  if (!robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)) {
    errors.push("robots.txt does not reference the production sitemap.");
  }
}

if (existsSync(sitemapPath)) {
  const sitemap = read("sitemap.xml");
  const requiredUrls = [
    `${siteOrigin}/`,
    `${siteOrigin}/about.html`,
    `${siteOrigin}/projects.html`,
    `${siteOrigin}/notes.html`,
    `${siteOrigin}/resume.html`,
    `${siteOrigin}/illustrations.html`,
    `${siteOrigin}/minigames.html`
  ];
  requiredUrls.forEach((url) => {
    if (!sitemap.includes(`<loc>${url}</loc>`)) errors.push(`sitemap.xml is missing ${url}.`);
  });
  if (/\/admin\//i.test(sitemap) || /note\.html\?/i.test(sitemap)) {
    errors.push("sitemap.xml contains an admin or query-parameter URL.");
  }
}

const netlifyConfig = read("netlify.toml");
if (!/for\s*=\s*"\/admin\/\*"[\s\S]*X-Robots-Tag\s*=\s*"noindex, nofollow"/i.test(netlifyConfig)) {
  errors.push("netlify.toml is missing the admin X-Robots-Tag header.");
}

if (errors.length) {
  console.error("SEO validation failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`SEO validation passed for ${publicPages.length} public pages and ${adminPages.length} admin pages.`);
