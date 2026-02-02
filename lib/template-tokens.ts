type AnyRecord = Record<string, unknown>;

const getValueAtPath = (data: AnyRecord, path: string) => {
  const segments = path.split(".").filter(Boolean);
  let current: unknown = data;
  for (const segment of segments) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as AnyRecord)[segment];
  }
  return current;
};

export const resolveTemplateTokens = (
  value: string,
  data?: AnyRecord
): string => {
  if (!data || !value.includes("[[")) return value;

  return value.replace(/\[\[([^\]]+)\]\]/g, (match, rawPath) => {
    const path = String(rawPath || "").trim();
    if (!path) return match;
    const resolved = getValueAtPath(data, path);
    if (resolved === undefined || resolved === null) return match;
    return String(resolved);
  });
};

export const resolveTokensInValue = (
  value: unknown,
  data?: AnyRecord
): unknown => {
  if (!data) return value;

  if (typeof value === "string") {
    return resolveTemplateTokens(value, data);
  }

  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const resolved = resolveTokensInValue(item, data);
      if (resolved !== item) changed = true;
      return resolved;
    });
    return changed ? next : value;
  }

  if (value && typeof value === "object") {
    let changed = false;
    const result: AnyRecord = {};
    for (const [key, val] of Object.entries(value)) {
      const resolved = resolveTokensInValue(val, data);
      if (resolved !== val) changed = true;
      result[key] = resolved;
    }
    return changed ? result : value;
  }

  return value;
};
