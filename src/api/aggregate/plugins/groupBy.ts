/**
 * GroupBy plugin: groups results by a field (dimension).
 */

import type { AggregatePlugin } from "./types";
import type { NormalizedTermPolicy, AggregateRequest } from "../types";
import { PolicyViolationError } from "../termPolicy";

const GROUP_VAR_PREFIX = "group_";

export const groupByPlugin: AggregatePlugin = {
  term: "GROUP_BY",
  datasetLevel: false,
  requiredDatatypes: [],

  validate(policy, request, usage) {
    if (usage.kind !== "groupBy" || !usage.field) return;
    const field = usage.field;
    const fieldShape = policy.fields.get(field);
    if (!fieldShape) {
      throw new PolicyViolationError(`Field "${field}" is not defined in the term policy.`);
    }
    if (!(fieldShape.allowedTerms ?? []).includes("GROUP_BY")) {
      throw new PolicyViolationError(
        `Field "${field}" does not allow GROUP_BY in the term policy.`,
      );
    }
  },

  buildSparql(_policy, request, ctx) {
    const groupByFields = request.groupBy ?? [];
    const groupByVars: string[] = [];
    for (const field of groupByFields) {
      const safeName = field.replace(/[^a-zA-Z0-9_]/g, "_");
      groupByVars.push(`?${safeName}`);
      ctx.groupByFields.push(field);
    }
    return {
      selectExpressions: [],
      groupByVars,
    };
  },

  mapResultRow(row, bindings, request) {
    const groupByFields = request.groupBy ?? [];
    for (const field of groupByFields) {
      const safeName = field.replace(/[^a-zA-Z0-9_]/g, "_");
      const v = bindings[safeName];
      if (v !== undefined) row[field] = v;
    }
  },
};
