import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const missingReferences = new Set();
const runtimeExtensions = new Set([".avif", ".css", ".gif", ".html", ".jpeg", ".jpg", ".js", ".json", ".pdf", ".png", ".svg", ".webp"]);

function reportMissing(sourceFile, reference) {
  missingReferences.add(`${relative(repositoryRoot, sourceFile)} -> ${reference}`);
}

function isExternal(reference) {
  return /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(reference);
}

function cleanReference(reference) {
  return reference.split("#")[0].split("?")[0].trim();
}

function verifyReference(sourceFile, reference) {
  const cleaned = cleanReference(reference);
  if (!cleaned || isExternal(cleaned)) return;

  const absolutePath = cleaned.startsWith("/")
    ? resolve(repositoryRoot, cleaned.slice(1))
    : resolve(dirname(sourceFile), cleaned);
  const remainsInsideRepository = absolutePath === repositoryRoot
    || absolutePath.startsWith(repositoryRoot + "\\")
    || absolutePath.startsWith(repositoryRoot + "/");
  if (!remainsInsideRepository || !existsSync(absolutePath)) reportMissing(sourceFile, reference);
}

function scanHtml(sourceFile) {
  const text = readFileSync(sourceFile, "utf8");
  const attributePattern = /\b(?:src|href|data-content-source)\s*=\s*["']([^"']+)["']/gi;
  for (const match of text.matchAll(attributePattern)) verifyReference(sourceFile, match[1]);
}

function scanCss(sourceFile) {
  const text = readFileSync(sourceFile, "utf8");
  const urlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  for (const match of text.matchAll(urlPattern)) verifyReference(sourceFile, match[1]);
}

function inspectJsonValue(sourceFile, value) {
  if (Array.isArray(value)) {
    value.forEach((entry) => inspectJsonValue(sourceFile, entry));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((entry) => inspectJsonValue(sourceFile, entry));
    return;
  }
  if (typeof value !== "string" || !value.startsWith("assets/")) return;
  if (runtimeExtensions.has(extname(cleanReference(value)).toLowerCase())) {
    const absolutePath = resolve(repositoryRoot, cleanReference(value));
    if (!existsSync(absolutePath)) reportMissing(sourceFile, value);
  }
}

function contentFiles() {
  return [
    "content/notes/notes.json",
    "content/projects/projects.json",
    "content/certificates/certificates.json",
    "content/illustrations/illustrations.json",
    "content/minigames/minigames.json"
  ].map((path) => resolve(repositoryRoot, path));
}

for (const sourceFile of [
  "index.html", "about.html", "notes.html", "note.html", "projects.html",
  "illustrations.html", "minigames.html", "resume.html"
].map((path) => resolve(repositoryRoot, path))) {
  scanHtml(sourceFile);
}

for (const filename of ["login.html", "index.html", "new-content.html", "messages.html", "cms.html"]) {
  scanHtml(resolve(repositoryRoot, "admin", filename));
}

scanCss(resolve(repositoryRoot, "css/style.css"));
contentFiles().forEach((sourceFile) => {
  inspectJsonValue(sourceFile, JSON.parse(readFileSync(sourceFile, "utf8")));
});

if (missingReferences.size) {
  console.error("Missing local references:\n" + [...missingReferences].sort().map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Media and local reference check passed.");
