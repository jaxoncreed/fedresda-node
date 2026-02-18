/**
 * Build and execute SPARQL aggregate queries. Uses plugins for SELECT/GROUP BY;
 * builds WHERE graph pattern and filter from request.
 */

import type {
  NormalizedTermPolicy,
  AggregateRequest,
  AggregateResult,
  AggregateOptions,
  Filter,
  Predicate,
  ResultRow,
} from "./types";
import { getAllPlugins } from "./plugins";

const DEFAULT_PREDICATE_BASE = "https://setmeld.com/vocab/aggregate/field#";

/** Escape local name for use in SPARQL (variable names use alphanumeric + underscore). */
function safeVarName(fieldName: string): string {
  return fieldName.replace(/[^a-zA-Z0-9_]/g, "_");
}

/** All field names used in this request (measures with field, groupBy, where). */
function collectUsedFields(request: AggregateRequest): Set<string> {
  const out = new Set<string>();
  for (const m of request.measures ?? []) {
    if (m.field) out.add(m.field);
  }
  for (const f of request.groupBy ?? []) {
    out.add(f);
  }
  if (request.where) {
    collectWhereFields(request.where, out);
  }
  return out;
}

function collectWhereFields(node: Filter | Predicate, out: Set<string>): void {
  if ("all" in node && node.all) {
    for (const item of node.all) collectWhereFields(item as Predicate, out);
    return;
  }
  if ("any" in node && node.any) {
    for (const item of node.any) collectWhereFields(item as Predicate, out);
    return;
  }
  if ("field" in node && typeof node.field === "string") {
    out.add(node.field);
  }
}

/** Build SPARQL FILTER expression from a predicate. */
function predicateToSparqlFilter(
  p: Predicate,
  varName: string,
  predicateBase: string,
): string {
  const v = `?${varName}`;
  switch (p.op) {
    case "eq":
      return `${v} = ${sparqlValue(p.value)}`;
    case "ne":
      return `${v} != ${sparqlValue(p.value)}`;
    case "gt":
      return `${v} > ${sparqlValue(p.value)}`;
    case "gte":
      return `${v} >= ${sparqlValue(p.value)}`;
    case "lt":
      return `${v} < ${sparqlValue(p.value)}`;
    case "lte":
      return `${v} <= ${sparqlValue(p.value)}`;
    case "isNull":
      return `!BOUND(${v})`;
    case "isNotNull":
      return `BOUND(${v})`;
    case "between":
      if (Array.isArray(p.values) && p.values.length >= 2) {
        return `${v} >= ${sparqlValue(p.values[0])} && ${v} <= ${sparqlValue(p.values[1])}`;
      }
      return "1=0";
    case "in":
      if (Array.isArray(p.values) && p.values.length > 0) {
        const inList = p.values.map((x) => sparqlValue(x)).join(", ");
        return `(${v} IN (${inList}))`;
      }
      return "1=0";
    default:
      return "1=1";
  }
}

function sparqlValue(val: unknown): string {
  if (val === null || val === undefined) return "UNDEF";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "string") {
    const escaped = val.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    return `'${escaped}'`;
  }
  return "UNDEF";
}

/** Build filter expressions for WHERE (recursive for all/any). */
function filterToSparql(
  node: Filter | Predicate,
  fieldToVar: Map<string, string>,
  predicateBase: string,
): string {
  if ("all" in node && node.all) {
    const parts = node.all.map((p) =>
      filterToSparql(p as Predicate, fieldToVar, predicateBase),
    );
    return parts.length > 0 ? `(${parts.join(" && ")})` : "1=1";
  }
  if ("any" in node && node.any) {
    const parts = node.any.map((p) =>
      filterToSparql(p as Predicate, fieldToVar, predicateBase),
    );
    return parts.length > 0 ? `(${parts.join(" || ")})` : "1=0";
  }
  if ("field" in node && node.op) {
    const varName = fieldToVar.get(node.field);
    if (!varName) return "1=1";
    return predicateToSparqlFilter(node, varName, predicateBase);
  }
  return "1=1";
}

export function buildSparqlQuery(
  policy: NormalizedTermPolicy,
  request: AggregateRequest,
  options: AggregateOptions,
): string {
  const base = policy.predicateBase ?? DEFAULT_PREDICATE_BASE;
  const graphIri = policy.subject;
  const usedFields = collectUsedFields(request);
  const fieldVars = new Map<string, string>();
  for (const f of usedFields) {
    fieldVars.set(f, safeVarName(f));
  }

  const selectParts: string[] = [];
  const groupByParts: string[] = [];
  let havingClause = "";

  const ctx = {
    selectVars: [] as string[],
    groupByFields: [] as string[],
    filterPredicates: new Set<string>(),
    options,
  };

  for (const plugin of getAllPlugins()) {
    const frag = plugin.buildSparql(policy, request, ctx);
    selectParts.push(...frag.selectExpressions);
    groupByParts.push(...frag.groupByVars);
    if (frag.having) havingClause = frag.having;
  }

  for (const f of ctx.groupByFields) {
    const v = safeVarName(f);
    if (!selectParts.some((s) => s.includes(`?${v}`))) {
      selectParts.push(`?${v}`);
    }
  }

  const selectClause =
    selectParts.length > 0 ? "SELECT " + selectParts.join(" ") : "SELECT *";
  const groupByClause =
    groupByParts.length > 0 ? " GROUP BY " + groupByParts.join(" ") : "";
  const havingClauseSparql =
    havingClause ? ` HAVING (${havingClause})` : "";

  const graphPatternLines: string[] = [];
  if (graphIri) {
    graphPatternLines.push(`GRAPH <${graphIri}> {`);
  }
  for (const [field, varName] of fieldVars) {
    const pred = `<${base}${field}>`;
    graphPatternLines.push(`  ?s ${pred} ?${varName} .`);
  }
  if (graphIri) {
    graphPatternLines.push("}");
  }

  const whereFilter =
    request.where && Object.keys(request.where).length > 0
      ? " FILTER (" +
        filterToSparql(request.where, fieldVars, base) +
        ")"
      : "";

  const whereBody = graphPatternLines.join("\n") + whereFilter;

  const fullQuery = `${selectClause}
WHERE {
${whereBody}
}
${groupByClause}${havingClauseSparql}`;

  return fullQuery;
}

/** Execute SPARQL SELECT query via HTTP and return bindings. */
export async function executeSparqlSelect(
  endpoint: string,
  query: string,
): Promise<Record<string, unknown>[]> {
  const url = new URL(endpoint);
  url.searchParams.set("query", query);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/sparql-results+json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SPARQL request failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as {
    results?: { bindings?: Record<string, { value: string; type?: string }>[] };
  };
  const bindings = json.results?.bindings ?? [];
  return bindings.map((b) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(b)) {
      if (v.type === "literal" && v.value) {
        const num = Number(v.value);
        out[k] = Number.isFinite(num) ? num : v.value;
      } else {
        out[k] = v?.value ?? v;
      }
    }
    return out;
  });
}

/** Build query, execute, apply minCellSize suppression, and map to result rows. */
export async function runAggregateQuery(
  policy: NormalizedTermPolicy,
  request: AggregateRequest,
  options: AggregateOptions,
  endpoint: string,
): Promise<AggregateResult> {
  const query = buildSparqlQuery(policy, request, options);
  const rawRows = await executeSparqlSelect(endpoint, query);
  const minCellSize = options.minCellSize ?? policy.minCellSize;
  let suppressed = 0;
  const rows: ResultRow[] = [];
  const hadRows = rawRows.length > 0;
  for (const bindings of rawRows) {
    const countVal = bindings["count"];
    const count = typeof countVal === "number" ? countVal : Number(countVal ?? 0);
    if (options.suppressSmallCells !== false && count < minCellSize) {
      suppressed++;
      continue;
    }
    const row: ResultRow = {};
    for (const plugin of getAllPlugins()) {
      if (plugin.mapResultRow) {
        plugin.mapResultRow(row, bindings, request);
      }
    }
    rows.push(row);
  }
  const rounding = options.rounding ?? 0;
  if (rounding > 0) {
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        const v = row[key];
        if (typeof v === "number" && Number.isFinite(v) && key.startsWith("AVERAGE(")) {
          row[key] = Number(v.toFixed(rounding));
        }
      }
    }
  }
  if (hadRows && rows.length === 0 && suppressed > 0) {
    const err = new Error("Disclosure control: all result buckets below minCellSize");
    (err as Error & { code?: string }).code = "disclosure_control";
    throw err;
  }

  return {
    "@type": "schema:Dataset",
    policyVersion: policy.version,
    disclosure: {
      minCellSize,
      suppressed,
      rounded: rounding > 0,
    },
    groupBy: request.groupBy,
    rows,
  };
}
