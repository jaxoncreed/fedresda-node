/**
 * Term policy: normalization and validation of aggregate requests against policy.
 */

import type { TermPolicy, NormalizedTermPolicy, AggregateRequest, Filter, Predicate } from "./types";
import { getAggregatePlugin } from "./plugins";

/** Normalize a term policy document into an internal shape. */
export function normalizeTermPolicy(policy: TermPolicy): NormalizedTermPolicy {
  const version =
    policy.dct_hasVersion ?? (policy as Record<string, unknown>).policyVersion ?? "1.0";
  const subject = String(
    policy.dct_subject ?? policy.subject ?? "",
  );
  const entrypoint = String(
    policy.hydra_entrypoint ?? policy.entrypoint ?? "",
  );
  const datasetAllowedTerms = (
    policy.ex_datasetAllowedTerms ?? policy.datasetAllowedTerms ?? []
  ).filter((t): t is "COUNT" => t === "COUNT" || typeof t === "string");
  const minCellSize = Math.max(
    1,
    policy.ex_minCellSize ?? policy.minCellSize ?? 5,
  );
  const rawFields = policy.ex_fields ?? policy.fields ?? [];
  const fields = new Map<string, (typeof rawFields)[0]>();
  for (const f of rawFields) {
    const name = f.fieldName;
    if (name) fields.set(name, f);
  }
  const predicateBase =
    (policy as Record<string, unknown>).predicateBase as string | undefined;
  const out: NormalizedTermPolicy = {
    version: typeof version === "string" ? version : "1.0",
    subject: typeof subject === "string" ? subject : "",
    entrypoint: typeof entrypoint === "string" ? entrypoint : "",
    datasetAllowedTerms,
    minCellSize,
    fields,
    predicateBase,
  };
  return out;
}

/** Collect all field names used in a WHERE filter (recursive for nested all/any). */
function collectWhereFields(filter: Filter): Set<string> {
  const out = new Set<string>();
  function walk(node: Filter | Predicate): void {
    if ("all" in node && node.all) {
      for (const item of node.all) walk(item as Predicate);
      return;
    }
    if ("any" in node && node.any) {
      for (const item of node.any) walk(item as Predicate);
      return;
    }
    if ("field" in node && typeof node.field === "string") {
      out.add(node.field);
    }
  }
  walk(filter);
  return out;
}

/** Validate one predicate's field has WHERE allowed. */
function validateWherePredicate(
  policy: NormalizedTermPolicy,
  field: string,
): void {
  const fieldShape = policy.fields.get(field);
  if (!fieldShape) {
    throw new PolicyViolationError(`Field "${field}" is not defined in the term policy.`);
  }
  const allowed = fieldShape.allowedTerms ?? [];
  if (!allowed.includes("WHERE")) {
    throw new PolicyViolationError(
      `Field "${field}" does not allow WHERE in the term policy.`,
    );
  }
}

export class PolicyViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PolicyViolationError";
  }
}

/**
 * Validate the full aggregate request against the term policy.
 * Uses registered plugins for measure/groupBy terms; validates WHERE fields here.
 */
export function validateRequestAgainstPolicy(
  policy: NormalizedTermPolicy,
  request: AggregateRequest,
): void {
  // Measures
  for (const m of request.measures ?? []) {
    const plugin = getAggregatePlugin(m.term);
    if (!plugin) {
      throw new PolicyViolationError(`Unknown term in measures: ${m.term}`);
    }
    plugin.validate(policy, request, {
      kind: "measure",
      field: m.field,
    });
  }

  // GroupBy
  for (const field of request.groupBy ?? []) {
    const plugin = getAggregatePlugin("GROUP_BY");
    if (!plugin) {
      throw new PolicyViolationError("GROUP_BY term is not registered.");
    }
    plugin.validate(policy, request, { kind: "groupBy", field });
  }

  // Where
  if (request.where) {
    const whereFields = collectWhereFields(request.where);
    for (const field of whereFields) {
      validateWherePredicate(policy, field);
    }
  }
}
