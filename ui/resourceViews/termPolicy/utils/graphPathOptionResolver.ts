import type { DataSchemaJsonView, GraphNodeFilterForm, GraphPathForm } from "../types";

type TripleConstraint = {
  predicate: string;
  valueExpr: string;
};

type ShapeIndex = {
  shapeIds: string[];
  constraintsByShape: Map<string, TripleConstraint[]>;
};

type MaybeTripleConstraint = {
  type?: unknown;
  predicate?: unknown;
  valueExpr?: unknown;
  expressions?: unknown[];
};

export type GraphPathOptionResolver = {
  getStartPredicateOptions: (graphPath: GraphPathForm) => string[];
  getStartValueOptions: (
    graphPath: GraphPathForm,
    predicate: string,
  ) => string[];
  getStepPredicateOptions: (graphPath: GraphPathForm, stepIndex: number) => string[];
  getStepWherePredicateOptions: (
    graphPath: GraphPathForm,
    stepIndex: number,
  ) => string[];
  getStepWhereValueOptions: (
    graphPath: GraphPathForm,
    stepIndex: number,
    predicate: string,
  ) => string[];
};

function parseValueTokens(valueExpr: string): string[] {
  return valueExpr
    .split("|")
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && !token.startsWith("datatype:"));
}

function normalizeValueExpr(valueExpr: unknown): string[] {
  if (typeof valueExpr === "string") {
    return [valueExpr];
  }
  if (!valueExpr || typeof valueExpr !== "object") {
    return [];
  }
  if ("values" in valueExpr && Array.isArray(valueExpr.values)) {
    return valueExpr.values
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }
  return [];
}

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

function extractConstraints(shape: unknown): TripleConstraint[] {
  if (!shape || typeof shape !== "object") return [];
  const asRecord = shape as Record<string, unknown>;
  const flatConstraints = Array.isArray(asRecord.tripleConstraints)
    ? asRecord.tripleConstraints
    : [];
  if (flatConstraints.length > 0) {
    return flatConstraints
      .filter(
        (tc): tc is { predicate: string; valueExpr: string } =>
          Boolean(
            tc &&
              typeof tc === "object" &&
              typeof (tc as { predicate?: unknown }).predicate === "string" &&
              typeof (tc as { valueExpr?: unknown }).valueExpr === "string",
          ),
      )
      .map((tc) => ({ predicate: tc.predicate, valueExpr: tc.valueExpr }));
  }

  const shapeExpr =
    asRecord.shapeExpr && typeof asRecord.shapeExpr === "object"
      ? (asRecord.shapeExpr as Record<string, unknown>)
      : null;
  const expression = shapeExpr?.expression;
  return collectTripleConstraintsFromExpression(expression)
    .filter((tc): tc is Required<Pick<MaybeTripleConstraint, "predicate">> & MaybeTripleConstraint =>
      typeof tc.predicate === "string",
    )
    .flatMap((tc) => {
      const values = normalizeValueExpr(tc.valueExpr);
      if (values.length > 0) {
        return values.map((valueExpr) => ({ predicate: tc.predicate as string, valueExpr }));
      }
      if (typeof tc.valueExpr === "string") {
        return [{ predicate: tc.predicate as string, valueExpr: tc.valueExpr }];
      }
      return [];
    });
}

function createShapeIndex(dataSchema: DataSchemaJsonView | null): ShapeIndex {
  if (!dataSchema?.shapes) {
    return {
      shapeIds: [],
      constraintsByShape: new Map(),
    };
  }
  const shapeIds: string[] = [];
  const constraintsByShape = new Map<string, TripleConstraint[]>();
  dataSchema.shapes.forEach((shape) => {
    const shapeId =
      shape && typeof shape === "object" && typeof (shape as { id?: unknown }).id === "string"
        ? (shape as { id: string }).id
        : undefined;
    if (!shapeId) return;
    shapeIds.push(shapeId);
    const constraints = extractConstraints(shape);
    constraintsByShape.set(
      shapeId,
      constraints,
    );
  });
  return { shapeIds, constraintsByShape };
}

function uniqueSorted(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort();
}

function getPredicateOptionsForShapes(
  shapeIds: string[],
  shapeIndex: ShapeIndex,
): string[] {
  const predicates: string[] = [];
  shapeIds.forEach((shapeId) => {
    (shapeIndex.constraintsByShape.get(shapeId) ?? []).forEach((tc) => {
      predicates.push(tc.predicate);
    });
  });
  return uniqueSorted(predicates);
}

function getValueOptionsForShapes(
  shapeIds: string[],
  predicate: string,
  shapeIndex: ShapeIndex,
): string[] {
  const values: string[] = [];
  shapeIds.forEach((shapeId) => {
    (shapeIndex.constraintsByShape.get(shapeId) ?? [])
      .filter((tc) => tc.predicate === predicate)
      .forEach((tc) => {
        parseValueTokens(tc.valueExpr).forEach((token) => values.push(token));
      });
  });
  return uniqueSorted(values.filter((token) => !shapeIndex.constraintsByShape.has(token)));
}

function applyWhereFilters(
  candidateShapeIds: string[],
  where: GraphNodeFilterForm[],
  shapeIndex: ShapeIndex,
): string[] {
  let current = candidateShapeIds;
  where.forEach((filter) => {
    if (!filter.predicate) return;
    current = current.filter((shapeId) => {
      const matches = (shapeIndex.constraintsByShape.get(shapeId) ?? []).filter(
        (tc) => tc.predicate === filter.predicate,
      );
      if (matches.length === 0) return false;
      if (!filter.value) return true;
      return matches.some((tc) => parseValueTokens(tc.valueExpr).includes(filter.value));
    });
  });
  return current;
}

function traverseByPredicate(
  candidateShapeIds: string[],
  predicate: string,
  inverse: boolean,
  shapeIndex: ShapeIndex,
): string[] {
  if (!predicate) return candidateShapeIds;
  if (inverse) {
    const previousShapeIds: string[] = [];
    shapeIndex.shapeIds.forEach((sourceShapeId) => {
      (shapeIndex.constraintsByShape.get(sourceShapeId) ?? [])
        .filter((tc) => tc.predicate === predicate)
        .forEach((tc) => {
          const targets = parseValueTokens(tc.valueExpr).filter((token) =>
            shapeIndex.constraintsByShape.has(token),
          );
          if (targets.some((target) => candidateShapeIds.includes(target))) {
            previousShapeIds.push(sourceShapeId);
          }
        });
    });
    return uniqueSorted(previousShapeIds);
  }
  const nextShapeIds: string[] = [];
  candidateShapeIds.forEach((shapeId) => {
    (shapeIndex.constraintsByShape.get(shapeId) ?? [])
      .filter((tc) => tc.predicate === predicate)
      .forEach((tc) => {
        parseValueTokens(tc.valueExpr).forEach((token) => {
          if (shapeIndex.constraintsByShape.has(token)) {
            nextShapeIds.push(token);
          }
        });
      });
  });
  return uniqueSorted(nextShapeIds);
}

function getStepEntryShapes(
  graphPath: GraphPathForm,
  stepIndex: number,
  shapeIndex: ShapeIndex,
): string[] {
  let candidates = applyWhereFilters(shapeIndex.shapeIds, graphPath.where, shapeIndex);
  for (let i = 0; i < stepIndex; i += 1) {
    const step = graphPath.steps[i];
    const traversed = traverseByPredicate(
      candidates,
      step.predicate,
      step.inverse,
      shapeIndex,
    );
    candidates = applyWhereFilters(traversed, step.where, shapeIndex);
  }
  return candidates;
}

export function createGraphPathOptionResolver(
  dataSchema: DataSchemaJsonView | null,
): GraphPathOptionResolver {
  const shapeIndex = createShapeIndex(dataSchema);

  return {
    getStartPredicateOptions(_graphPath) {
      return getPredicateOptionsForShapes(shapeIndex.shapeIds, shapeIndex);
    },
    getStartValueOptions(graphPath, predicate) {
      void graphPath;
      return getValueOptionsForShapes(shapeIndex.shapeIds, predicate, shapeIndex);
    },
    getStepPredicateOptions(graphPath, stepIndex) {
      const entry = getStepEntryShapes(graphPath, stepIndex, shapeIndex);
      return getPredicateOptionsForShapes(entry, shapeIndex);
    },
    getStepWherePredicateOptions(graphPath, stepIndex) {
      const entry = getStepEntryShapes(graphPath, stepIndex, shapeIndex);
      const step = graphPath.steps[stepIndex];
      const traversed = traverseByPredicate(
        entry,
        step?.predicate ?? "",
        Boolean(step?.inverse),
        shapeIndex,
      );
      return getPredicateOptionsForShapes(traversed, shapeIndex);
    },
    getStepWhereValueOptions(graphPath, stepIndex, predicate) {
      const entry = getStepEntryShapes(graphPath, stepIndex, shapeIndex);
      const step = graphPath.steps[stepIndex];
      const traversed = traverseByPredicate(
        entry,
        step?.predicate ?? "",
        Boolean(step?.inverse),
        shapeIndex,
      );
      return getValueOptionsForShapes(traversed, predicate, shapeIndex);
    },
  };
}

