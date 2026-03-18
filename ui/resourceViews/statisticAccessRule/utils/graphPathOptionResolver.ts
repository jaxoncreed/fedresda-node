import { jsonld2graphobject } from "jsonld2graphobject";
import type { ContextDefinition, JsonLdDocument, NodeObject } from "jsonld";
import type { DataSchemaJsonView, GraphNodeFilterForm, GraphPathForm } from "../types";

type TripleConstraint = {
  predicate: string;
  valueExpr: string;
};

type ShapeIndex = {
  shapeIds: string[];
  constraintsByShape: Map<string, TripleConstraint[]>;
  outgoingByShape: Map<string, Map<string, string[]>>;
  incomingByPredicate: Map<string, Map<string, string[]>>;
};

type MaybeTripleConstraint = {
  type?: unknown;
  predicate?: unknown;
  valueExpr?: unknown;
  expressions?: unknown[];
};

type GraphPathOptionGetters = {
  getStartPredicateOptions: StartPredicateOptionGetter;
  getStartValueOptions: StartValueOptionGetter;
  getStepPredicateOptions: StepPredicateOptionGetter;
  getStepWherePredicateOptions: StepWherePredicateOptionGetter;
  getStepWhereValueOptions: StepWhereValueOptionGetter;
  getStepTargetShapeNames: StepTargetShapeNameGetter;
};

export type StartPredicateOptionGetter = (graphPath: GraphPathForm) => string[];
export type StartValueOptionGetter = (
  graphPath: GraphPathForm,
  predicate: string,
) => string[];
export type StepPredicateOptionGetter = (
  graphPath: GraphPathForm,
  stepIndex: number,
) => string[];
export type StepWherePredicateOptionGetter = (
  graphPath: GraphPathForm,
  stepIndex: number,
) => string[];
export type StepWhereValueOptionGetter = (
  graphPath: GraphPathForm,
  stepIndex: number,
  predicate: string,
) => string[];
export type StepTargetShapeNameGetter = (
  graphPath: GraphPathForm,
  stepIndex: number,
) => string[];

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
  if ("datatype" in valueExpr && typeof valueExpr.datatype === "string") {
    return [`datatype:${valueExpr.datatype}`];
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
    .filter(
      (tc): tc is Required<Pick<MaybeTripleConstraint, "predicate">> & MaybeTripleConstraint =>
        typeof tc.predicate === "string",
    )
    .map((tc) => {
      const values = normalizeValueExpr(tc.valueExpr);
      if (values.length > 0) {
        return {
          predicate: tc.predicate as string,
          valueExpr: values.join(" | "),
        };
      }
      if (typeof tc.valueExpr === "string") {
        return { predicate: tc.predicate as string, valueExpr: tc.valueExpr };
      }
      return { predicate: tc.predicate as string, valueExpr: "Unknown" };
    });
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
    const sources: string[] = [];
    const predicateIncoming = shapeIndex.incomingByPredicate.get(predicate);
    if (!predicateIncoming) return [];
    candidateShapeIds.forEach((targetShapeId) => {
      (predicateIncoming.get(targetShapeId) ?? []).forEach((sourceShapeId) => {
        sources.push(sourceShapeId);
      });
    });
    return uniqueSorted(sources);
  }

  const nextShapeIds: string[] = [];
  candidateShapeIds.forEach((shapeId) => {
    (
      shapeIndex.outgoingByShape.get(shapeId)?.get(predicate) ?? []
    ).forEach((targetShapeId) => {
      nextShapeIds.push(targetShapeId);
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

function toShapeName(shapeId: string): string {
  const hashIndex = shapeId.lastIndexOf("#");
  if (hashIndex >= 0 && hashIndex < shapeId.length - 1) {
    return shapeId.slice(hashIndex + 1);
  }
  const slashIndex = shapeId.lastIndexOf("/");
  if (slashIndex >= 0 && slashIndex < shapeId.length - 1) {
    return shapeId.slice(slashIndex + 1);
  }
  return shapeId;
}

function getNodeId(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object") {
    const candidate = (value as { "@id"?: unknown })["@id"];
    return typeof candidate === "string" ? candidate : null;
  }
  return null;
}

async function createShapeIndex(dataSchema: DataSchemaJsonView | null): Promise<ShapeIndex> {
  if (!dataSchema?.shapes) {
    return {
      shapeIds: [],
      constraintsByShape: new Map(),
      outgoingByShape: new Map(),
      incomingByPredicate: new Map(),
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
    constraintsByShape.set(shapeId, extractConstraints(shape));
  });

  const shapeIdSet = new Set(shapeIds);
  const uniquePredicates = uniqueSorted(
    Array.from(constraintsByShape.values()).flatMap((constraints) =>
      constraints.map((constraint) => constraint.predicate),
    ),
  );
  const predicateToTerm = new Map<string, string>(
    uniquePredicates.map((predicate, index) => [predicate, `p${index}`]),
  );
  const context: ContextDefinition = {};
  uniquePredicates.forEach((predicate, index) => {
    context[`p${index}`] = {
      "@id": predicate,
      "@type": "@id",
      "@container": "@set",
    };
  });

  const graph = shapeIds.map((shapeId) => {
    const node: NodeObject = { "@id": shapeId };
    const byPredicate = new Map<string, string[]>();
    (constraintsByShape.get(shapeId) ?? []).forEach((constraint) => {
      const tokens = parseValueTokens(constraint.valueExpr).filter((token) =>
        shapeIdSet.has(token),
      );
      if (tokens.length === 0) return;
      const previous = byPredicate.get(constraint.predicate) ?? [];
      byPredicate.set(constraint.predicate, [...previous, ...tokens]);
    });
    byPredicate.forEach((targets, predicate) => {
      const term = predicateToTerm.get(predicate);
      if (!term) return;
      node[term] = uniqueSorted(targets);
    });
    return node;
  });

  const jsonldGraph: JsonLdDocument = { "@context": context, "@graph": graph };
  const outgoingByShape = new Map<string, Map<string, string[]>>();
  await Promise.all(
    shapeIds.map(async (shapeId) => {
      const root = await jsonld2graphobject<NodeObject>(jsonldGraph, shapeId, {
        excludeContext: true,
      });
      const shapeOutgoing = new Map<string, string[]>();
      predicateToTerm.forEach((term, predicate) => {
        const rawValue = root[term];
        const values = (Array.isArray(rawValue) ? rawValue : [rawValue]).filter((value) =>
          value !== undefined,
        );
        const targetIds = uniqueSorted(
          values
            .map((value) => getNodeId(value))
            .filter((value): value is string => typeof value === "string")
            .filter((targetId) => shapeIdSet.has(targetId)),
        );
        if (targetIds.length > 0) {
          shapeOutgoing.set(predicate, targetIds);
        }
      });
      outgoingByShape.set(shapeId, shapeOutgoing);
    }),
  );

  const incomingByPredicate = new Map<string, Map<string, string[]>>();
  outgoingByShape.forEach((byPredicate, sourceShapeId) => {
    byPredicate.forEach((targetShapeIds, predicate) => {
      if (!incomingByPredicate.has(predicate)) {
        incomingByPredicate.set(predicate, new Map());
      }
      const incomingByTarget = incomingByPredicate.get(predicate)!;
      targetShapeIds.forEach((targetShapeId) => {
        const previous = incomingByTarget.get(targetShapeId) ?? [];
        incomingByTarget.set(targetShapeId, uniqueSorted([...previous, sourceShapeId]));
      });
    });
  });

  return {
    shapeIds,
    constraintsByShape,
    outgoingByShape,
    incomingByPredicate,
  };
}

export function createEmptyGraphPathOptionGetters(): GraphPathOptionGetters {
  const empty = () => [];
  return {
    getStartPredicateOptions: empty,
    getStartValueOptions: empty,
    getStepPredicateOptions: empty,
    getStepWherePredicateOptions: empty,
    getStepWhereValueOptions: empty,
    getStepTargetShapeNames: empty,
  };
}

export async function createGraphPathOptionGetters(
  dataSchema: DataSchemaJsonView | null,
): Promise<GraphPathOptionGetters> {
  const shapeIndex = await createShapeIndex(dataSchema);

  const getStartPredicateOptions: StartPredicateOptionGetter = (_graphPath) =>
    getPredicateOptionsForShapes(shapeIndex.shapeIds, shapeIndex);
  const getStartValueOptions: StartValueOptionGetter = (_graphPath, predicate) =>
    getValueOptionsForShapes(shapeIndex.shapeIds, predicate, shapeIndex);
  const getStepPredicateOptions: StepPredicateOptionGetter = (graphPath, stepIndex) => {
    const entry = getStepEntryShapes(graphPath, stepIndex, shapeIndex);
    return getPredicateOptionsForShapes(entry, shapeIndex);
  };
  const getStepWherePredicateOptions: StepWherePredicateOptionGetter = (
    graphPath,
    stepIndex,
  ) => {
    const entry = getStepEntryShapes(graphPath, stepIndex, shapeIndex);
    const step = graphPath.steps[stepIndex];
    const traversed = traverseByPredicate(
      entry,
      step?.predicate ?? "",
      Boolean(step?.inverse),
      shapeIndex,
    );
    return getPredicateOptionsForShapes(traversed, shapeIndex);
  };
  const getStepWhereValueOptions: StepWhereValueOptionGetter = (
    graphPath,
    stepIndex,
    predicate,
  ) => {
    const entry = getStepEntryShapes(graphPath, stepIndex, shapeIndex);
    const step = graphPath.steps[stepIndex];
    const traversed = traverseByPredicate(
      entry,
      step?.predicate ?? "",
      Boolean(step?.inverse),
      shapeIndex,
    );
    return getValueOptionsForShapes(traversed, predicate, shapeIndex);
  };
  const getStepTargetShapeNames: StepTargetShapeNameGetter = (graphPath, stepIndex) => {
    const entry = getStepEntryShapes(graphPath, stepIndex, shapeIndex);
    return uniqueSorted(entry.map(toShapeName));
  };

  return {
    getStartPredicateOptions,
    getStartValueOptions,
    getStepPredicateOptions,
    getStepWherePredicateOptions,
    getStepWhereValueOptions,
    getStepTargetShapeNames,
  };
}
