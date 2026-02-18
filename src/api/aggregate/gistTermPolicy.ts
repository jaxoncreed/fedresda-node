/**
 * Parse Gist-based term policy (AccessControl / Permission + Specification)
 * into NormalizedTermPolicy for use by the aggregate API.
 * Aligns with ui/.ldo/term_policy.* and ui/.shapes/term_policy.shex.
 */

import type { NormalizedTermPolicy, FieldShape } from "./types";
import type { FieldTerm, DatasetTerm } from "./types";

const GIST = "https://w3id.org/semanticarts/ns/ontology/gist/";
const EX = "http://example.org/analytics/";

/** Map category IRIs to API term names. Extend for new taxonomy terms (e.g. KaplanMeier). */
const CATEGORY_TO_TERM: Record<string, DatasetTerm | FieldTerm> = {
  [`${EX}Count`]: "COUNT",
  [`${GIST}Count`]: "COUNT",
  [`${EX}Mean`]: "AVERAGE",
  [`${GIST}Mean`]: "AVERAGE",
  [`${EX}GroupBy`]: "GROUP_BY",
  [`${GIST}GroupBy`]: "GROUP_BY",
  [`${EX}SUM`]: "SUM",
  [`${EX}Where`]: "WHERE",
  [`${EX}WHERE`]: "WHERE",
};

function resolveIri(obj: unknown): string | null {
  if (typeof obj === "string") return obj;
  if (obj && typeof obj === "object" && "@id" in obj) {
    const id = (obj as Record<string, unknown>)["@id"];
    return typeof id === "string" ? id : null;
  }
  return null;
}

function isPermission(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const type = (node as Record<string, unknown>).type ?? (node as Record<string, unknown>)["@type"];
  const check = (t: unknown): boolean => {
    const iri = resolveIri(t);
    return iri === `${GIST}Permission` || iri === "Permission";
  };
  if (Array.isArray(type)) return type.some(check);
  return check(type);
}

function getSpecCategories(spec: unknown): string[] {
  if (!spec || typeof spec !== "object") return [];
  const cat = (spec as Record<string, unknown>).isCategorizedBy ?? (spec as Record<string, unknown>)["isCategorizedBy"];
  const iri = resolveIri(cat);
  return iri ? [iri] : [];
}

function collectPermissionNodes(json: unknown): Array<{ isAbout: string; allows: unknown[] }> {
  const out: Array<{ isAbout: string; allows: unknown[] }> = [];
  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    if (isPermission(node)) {
      const isAbout = resolveIri((node as Record<string, unknown>).isAbout ?? (node as Record<string, unknown>)["isAbout"]);
      const allowsRaw = (node as Record<string, unknown>).allows ?? (node as Record<string, unknown>)["allows"];
      const allows = Array.isArray(allowsRaw) ? allowsRaw : allowsRaw != null ? [allowsRaw] : [];
      if (isAbout) out.push({ isAbout, allows });
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const graph = (node as Record<string, unknown>)["@graph"];
    if (Array.isArray(graph)) {
      graph.forEach(walk);
      return;
    }
    for (const v of Object.values(node as Record<string, unknown>)) walk(v);
  }
  let parsed: unknown;
  if (typeof json === "string") {
    try {
      parsed = JSON.parse(json);
    } catch {
      return out;
    }
  } else {
    parsed = json;
  }
  walk(parsed);
  return out;
}

/** Derive a short field name from a field IRI (e.g. document#bl1_dem_gen → bl1_dem_gen). */
function fieldIriToName(fieldIri: string, documentUrl: string): string {
  const doc = documentUrl.replace(/\/$/, "");
  if (fieldIri.startsWith(doc + "#")) return fieldIri.slice(doc.length + 1);
  const hash = fieldIri.indexOf("#");
  if (hash !== -1) return fieldIri.slice(hash + 1);
  const slash = fieldIri.lastIndexOf("/");
  return slash !== -1 ? fieldIri.slice(slash + 1) : fieldIri;
}

/**
 * Parse Gist term policy JSON-LD (string or object) into NormalizedTermPolicy.
 * documentUrl is the URL of the governed document (dataset); used as subject and to distinguish dataset vs field permissions.
 */
export function parseGistTermPolicy(
  jsonLd: string | object,
  documentUrl: string,
  options: {
    minCellSize?: number;
    predicateBase?: string;
    version?: string;
    entrypoint?: string;
  } = {},
): NormalizedTermPolicy {
  const permissions = collectPermissionNodes(jsonLd);
  const datasetAllowedTerms: DatasetTerm[] = [];
  const fieldTerms = new Map<string, FieldTerm[]>();
  const docUrlNorm = documentUrl.replace(/\/$/, "");

  for (const { isAbout, allows } of permissions) {
    const terms: (DatasetTerm | FieldTerm)[] = [];
    for (const spec of allows) {
      for (const catIri of getSpecCategories(spec)) {
        const term = CATEGORY_TO_TERM[catIri];
        if (term) terms.push(term);
      }
    }
    if (isAbout === docUrlNorm || isAbout === documentUrl) {
      for (const t of terms) {
        if (t === "COUNT" && !datasetAllowedTerms.includes("COUNT")) datasetAllowedTerms.push("COUNT");
      }
    } else {
      const fieldName = fieldIriToName(isAbout, documentUrl);
      const existing = fieldTerms.get(fieldName) ?? [];
      const combined = [...new Set([...existing, ...terms.filter((t): t is FieldTerm => t !== "COUNT")])];
      fieldTerms.set(fieldName, combined);
    }
  }

  const fields = new Map<string, FieldShape>();
  for (const [fieldName, allowedTerms] of fieldTerms) {
    fields.set(fieldName, {
      fieldName,
      datatype: "string",
      allowedTerms,
    });
  }

  return {
    version: options.version ?? "1.0",
    subject: documentUrl,
    entrypoint: options.entrypoint ?? "",
    datasetAllowedTerms,
    minCellSize: Math.max(1, options.minCellSize ?? 5),
    fields,
    predicateBase: options.predicateBase,
  };
}
