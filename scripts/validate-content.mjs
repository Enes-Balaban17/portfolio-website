import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const validationErrors = [];

const contentDefinitions = [
  { name: "notes", path: "content/notes/notes.json", required: ["title", "slug", "date", "summary"] },
  { name: "projects", path: "content/projects/projects.json", required: ["title", "year", "description", "status"] },
  { name: "certificates", path: "content/certificates/certificates.json", required: ["title", "organization", "type", "date_range", "description"] },
  { name: "illustrations", path: "content/illustrations/illustrations.json", required: ["title", "date", "description"] },
  { name: "minigames", path: "content/minigames/minigames.json", required: ["title", "year", "description", "status"] }
];

function addError(file, index, message) {
  validationErrors.push(`${file} item ${index + 1}: ${message}`);
}

function readCollection(definition) {
  const absolutePath = resolve(repositoryRoot, definition.path);

  try {
    const parsed = JSON.parse(readFileSync(absolutePath, "utf8"));
    if (!parsed || !Array.isArray(parsed.items)) {
      validationErrors.push(`${definition.path}: root value must contain an items array.`);
      return [];
    }
    return parsed.items;
  } catch (error) {
    validationErrors.push(`${definition.path}: ${error.message}`);
    return [];
  }
}

function isFilled(value) {
  return typeof value === "number" || (typeof value === "string" && value.trim().length > 0);
}

function validateRequiredFields(definition, item, index) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    addError(definition.path, index, "entry must be an object.");
    return;
  }

  definition.required.forEach((field) => {
    if (!isFilled(item[field])) {
      addError(definition.path, index, `${field} is required.`);
    }
  });
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
}

function isSafeHttpUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeLocalPath(value) {
  return typeof value === "string"
    && !value.startsWith("/")
    && !value.startsWith("\\")
    && !/(?:^|[/\\])\.\.(?:[/\\]|$)/.test(value)
    && !/^[a-z][a-z0-9+.-]*:/i.test(value);
}

function validateNotes(definition, items) {
  const slugs = new Set();
  items.forEach((item, index) => {
    if (item.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
      addError(definition.path, index, "slug must use lowercase words separated by hyphens.");
    }
    if (slugs.has(item.slug)) {
      addError(definition.path, index, `duplicate slug: ${item.slug}`);
    }
    slugs.add(item.slug);
    if (item.date && !isValidDate(item.date)) {
      addError(definition.path, index, "date must use YYYY-MM-DD.");
    }
  });
}

function validateLinkedContent(definition, items) {
  const urlFields = definition.name === "projects"
    ? ["demo_url", "source_url"]
    : ["play_url", "source_url"];

  items.forEach((item, index) => {
    if (!Number.isInteger(item.year)) {
      addError(definition.path, index, "year must be an integer.");
    }
    urlFields.forEach((field) => {
      if (item[field] && !isSafeHttpUrl(item[field])) {
        addError(definition.path, index, `${field} must be an http or https URL.`);
      }
    });
  });
}

function validateCertificates(definition, items) {
  const actionTypes = new Set(["none", "link", "pdf"]);

  items.forEach((item, index) => {
    const actionType = item.certificate_action_type || "none";
    if (!actionTypes.has(actionType)) {
      addError(definition.path, index, `unsupported certificate_action_type: ${actionType}`);
    }
    if (actionType === "link" && (!item.certificate_url || !isSafeHttpUrl(item.certificate_url))) {
      addError(definition.path, index, "link actions require a valid http or https certificate_url.");
    }
    if (actionType === "pdf") {
      const pdfPath = item.certificate_pdf || "";
      const validPdf = pdfPath.toLowerCase().endsWith(".pdf")
        && (isSafeHttpUrl(pdfPath) || isSafeLocalPath(pdfPath));
      if (!validPdf) {
        addError(definition.path, index, "pdf actions require a safe .pdf certificate_pdf value.");
      }
    }
    ["logo", "logo_upload"].forEach((field) => {
      if (item[field] && !isSafeLocalPath(item[field]) && !isSafeHttpUrl(item[field])) {
        addError(definition.path, index, `${field} must be a safe local path or http(s) URL.`);
      }
    });
  });
}

function validateIllustrations(definition, items) {
  items.forEach((item, index) => {
    if (item.date && !isValidDate(item.date)) {
      addError(definition.path, index, "date must use YYYY-MM-DD.");
    }
    if (item.image && !isSafeLocalPath(item.image) && !isSafeHttpUrl(item.image)) {
      addError(definition.path, index, "image must be a safe local path or http(s) URL.");
    }
  });
}

for (const definition of contentDefinitions) {
  const items = readCollection(definition);
  items.forEach((item, index) => validateRequiredFields(definition, item, index));

  if (definition.name === "notes") validateNotes(definition, items);
  if (definition.name === "projects" || definition.name === "minigames") validateLinkedContent(definition, items);
  if (definition.name === "certificates") validateCertificates(definition, items);
  if (definition.name === "illustrations") validateIllustrations(definition, items);
}

if (validationErrors.length) {
  console.error("Content validation failed:\n" + validationErrors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Content validation passed for ${contentDefinitions.length} collections.`);
