const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const htmlTags = /<[^>]*>/g;

export function sanitizePlainText(value: string, maxLength = 1000) {
  return value.replace(controlCharacters, "").replace(htmlTags, "").trim().slice(0, maxLength);
}

export function sanitizeStringArray(values: string[], maxItems: number, maxLength = 80) {
  return values.slice(0, maxItems).map((value) => sanitizePlainText(value, maxLength)).filter(Boolean);
}

