/**
 * Mean (AVERAGE) plugin: average over a numeric field.
 */

import type { AggregatePlugin } from "./types";
import type { NormalizedTermPolicy, AggregateRequest } from "../types";
import { PolicyViolationError } from "../termPolicy";

const AVG_VAR_PREFIX = "avg_";

export const meanPlugin: AggregatePlugin = {
  term: "AVERAGE",
  datasetLevel: false,
  requiredDatatypes: ["integer", "number"],

  validate(policy, request, usage) {
    if (usage.kind !== "measure" || !usage.field) return;
    const field = usage.field;
    const fieldShape = policy.fields.get(field);
    if (!fieldShape) {
      throw new PolicyViolationError(`Field "${field}" is not defined in the term policy.`);
    }
    if (!(fieldShape.allowedTerms ?? []).includes("AVERAGE")) {
      throw new PolicyViolationError(
        `Field "${field}" does not allow AVERAGE in the term policy.`,
      );
    }
    const dt = fieldShape.datatype ?? "";
    if (this.requiredDatatypes && !this.requiredDatatypes.includes(dt)) {
      throw new PolicyViolationError(
        `Field "${field}" has datatype "${dt}"; AVERAGE requires integer or number.`,
      );
    }
  },

  buildSparql(_policy, request, ctx) {
    const measures = request.measures ?? [];
    const avgMeasures = measures.filter((m) => m.term === "AVERAGE" && m.field);
    const selectExpressions: string[] = [];
    for (const m of avgMeasures) {
      const field = m.field!;
      const varName = AVG_VAR_PREFIX + field.replace(/[^a-zA-Z0-9_]/g, "_");
      selectExpressions.push(`(AVG(?${field}) AS ?${varName})`);
      ctx.selectVars.push(varName);
    }
    return {
      selectExpressions,
      groupByVars: [],
    };
  },

  mapResultRow(row, bindings, request) {
    const measures = request.measures ?? [];
    for (const m of measures) {
      if (m.term !== "AVERAGE" || !m.field) continue;
      const varName = AVG_VAR_PREFIX + m.field.replace(/[^a-zA-Z0-9_]/g, "_");
      const v = bindings[varName];
      if (v !== undefined) {
        const num = typeof v === "number" ? v : Number(v);
        row[`AVERAGE(${m.field})`] = Number.isFinite(num) ? num : null;
      }
    }
  },
};
