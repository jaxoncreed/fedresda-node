import type { DataSchemaJsonView } from "../types";

type MaybeShape = {
  tripleConstraints?: Array<{ predicate?: unknown; valueExpr?: unknown }>;
  shapeExpr?: {
    expression?: unknown;
  };
};

type MaybeTripleConstraint = {
  type?: unknown;
  predicate?: unknown;
  valueExpr?: unknown;
  expressions?: unknown[];
};

function collectTripleConstraintsFromExpression(
  expression: unknown,
): MaybeTripleConstraint[] {
  if (!expression || typeof expression !== "object") return [];
  const tc = expression as MaybeTripleConstraint;
  if (tc.type === "TripleConstraint") {
    return [tc];
  }
  if (Array.isArray(tc.expressions)) {
    return tc.expressions.flatMap((child) =>
      collectTripleConstraintsFromExpression(child),
    );
  }
  return [];
}

function getTripleConstraints(shape: MaybeShape): MaybeTripleConstraint[] {
  if (Array.isArray(shape?.tripleConstraints)) {
    return shape.tripleConstraints;
  }
  return collectTripleConstraintsFromExpression(shape?.shapeExpr?.expression);
}

export function extractPredicateOptions(dataSchema: DataSchemaJsonView | null): string[] {
  if (!dataSchema || !Array.isArray(dataSchema.shapes)) return [];
  const uniq = new Set<string>();
  dataSchema.shapes.forEach((shape) => {
    getTripleConstraints(shape as MaybeShape).forEach((tc) => {
      if (typeof tc.predicate === "string" && tc.predicate.length > 0) {
        uniq.add(tc.predicate);
      }
    });
  });
  return Array.from(uniq).sort();
}

export function extractValueOptions(dataSchema: DataSchemaJsonView | null): string[] {
  if (!dataSchema || !Array.isArray(dataSchema.shapes)) return [];
  const uniq = new Set<string>();
  dataSchema.shapes.forEach((shape) => {
    getTripleConstraints(shape as MaybeShape).forEach((tc) => {
      if (typeof tc.valueExpr !== "string" || tc.valueExpr.startsWith("datatype:")) {
        return;
      }
      tc.valueExpr
        .split("|")
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
        .forEach((x) => uniq.add(x));
    });
  });
  return Array.from(uniq).sort();
}

