/**
 * COUNT plugin: dataset-level term; count of records in scope.
 */

import type { AggregatePlugin } from "./types";
import type { NormalizedTermPolicy, AggregateRequest } from "../types";
import { PolicyViolationError } from "../termPolicy";

export const countPlugin: AggregatePlugin = {
  term: "COUNT",
  datasetLevel: true,
  requiredDatatypes: [],

  validate(policy, request, usage) {
    if (usage.kind !== "measure") return;
    if (!policy.datasetAllowedTerms.includes("COUNT")) {
      throw new PolicyViolationError(
        "COUNT is not in datasetAllowedTerms for this term policy.",
      );
    }
  },

  buildSparql(_policy, _request, ctx) {
    const minCellSize = ctx.options.minCellSize ?? 5;
    return {
      selectExpressions: ["(COUNT(?s) AS ?count)"],
      groupByVars: [],
      having: `COUNT(?s) >= ${minCellSize}`,
    };
  },

  mapResultRow(row, bindings) {
    const c = bindings["count"];
    if (c !== undefined) row["COUNT"] = typeof c === "number" ? c : Number(c);
  },
};
