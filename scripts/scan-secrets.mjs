import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const textExtensions = new Set([
  ".css", ".diff", ".example", ".html", ".js", ".json", ".md", ".mjs",
  ".toml", ".ts", ".txt", ".yaml", ".yml"
]);
const findings = [];

const secretPatterns = [
  { name: "private key block", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "Supabase secret key", pattern: /sb_secret_[A-Za-z0-9_-]{16,}/g },
  { name: "GitHub access token", pattern: /gh[pousr]_[A-Za-z0-9]{20,}/g },
  { name: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/g }
];

function repositoryFiles() {
  const output = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd: repositoryRoot, encoding: "utf8" }
  );
  return output.split("\0").filter(Boolean);
}

function isTextCandidate(relativePath) {
  const extension = extname(relativePath).toLowerCase();
  const filename = basename(relativePath);
  return textExtensions.has(extension) || filename === ".gitignore" || filename.startsWith(".env");
}

function lineNumber(text, offset) {
  return text.slice(0, offset).split("\n").length;
}

function isPlaceholder(value) {
  return !value
    || value.includes("<")
    || value.includes("YOUR_")
    || value.includes("REPLACE_")
    || value.includes("${")
    || value.includes("...");
}

function scanAssignments(relativePath, text) {
  const pattern = /\b(SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY|DATABASE_URL|DB_PASSWORD|PRIVATE_TOKEN|API_TOKEN)\s*=\s*([^\s#]+)/gi;
  for (const match of text.matchAll(pattern)) {
    const value = match[2].replace(/^['"]|['"]$/g, "");
    if (!isPlaceholder(value)) {
      findings.push(`${relativePath}:${lineNumber(text, match.index)} contains a value for ${match[1]}.`);
    }
  }
}

function scanServiceRoleJwt(relativePath, text) {
  const jwtPattern = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
  for (const match of text.matchAll(jwtPattern)) {
    try {
      const payload = JSON.parse(Buffer.from(match[0].split(".")[1], "base64url").toString("utf8"));
      if (payload.role === "service_role") {
        findings.push(`${relativePath}:${lineNumber(text, match.index)} contains a service-role JWT.`);
      }
    } catch {
      // Invalid JWT-like text is not a credential finding.
    }
  }
}

for (const relativePath of repositoryFiles()) {
  if (!isTextCandidate(relativePath)) continue;

  const buffer = readFileSync(resolve(repositoryRoot, relativePath));
  if (buffer.length > 2_000_000 || buffer.includes(0)) continue;
  const text = buffer.toString("utf8");

  secretPatterns.forEach(({ name, pattern }) => {
    for (const match of text.matchAll(pattern)) {
      findings.push(`${relativePath}:${lineNumber(text, match.index)} contains a possible ${name}.`);
    }
  });
  scanAssignments(relativePath, text);
  scanServiceRoleJwt(relativePath, text);
}

if (findings.length) {
  console.error("Potential secrets found:\n" + findings.map((finding) => `- ${finding}`).join("\n"));
  process.exit(1);
}

console.log("Secret scan passed. No common privileged credential patterns were found.");
