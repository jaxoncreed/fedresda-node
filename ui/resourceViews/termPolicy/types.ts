import type { Schema } from "shexj";

export type DataSchemaJsonTripleConstraint = {
  predicate: string;
  valueExpr: string;
};

export type DataSchemaJsonShape = {
  id: string;
  tripleConstraints?: DataSchemaJsonTripleConstraint[];
};

export type DataSchemaJsonView = {
  name: string;
  shapeCount: number;
  shapes?: DataSchemaJsonShape[];
};

export type MeanAllowedPath = {
  id: string;
  graphPath: GraphPathForm;
  minValues: number;
  filterValue: string;
};

export type MeanStatisticPolicy = {
  id: string;
  statisticName: "mean";
  allowedPaths: MeanAllowedPath[];
};

export type KaplanMeierStatisticPolicy = {
  id: string;
  statisticName: "kaplan-meier";
  cohortPath: string[];
  eventPath: string[];
  timePath: string[];
};

export type StatisticPolicy = MeanStatisticPolicy | KaplanMeierStatisticPolicy;

export type TermPolicyLoadResult = {
  dataSchemaName: string | null;
  statisticPolicies: StatisticPolicy[];
};

export type TermPolicySchemas = Record<string, Schema>;

export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export type GraphNodeFilterForm = {
  id: string;
  predicate: string;
  value: string;
};

export type GraphTraversalStepForm = {
  id: string;
  predicate: string;
  inverse: boolean;
  where: GraphNodeFilterForm[];
};

export type GraphPathForm = {
  where: GraphNodeFilterForm[];
  steps: GraphTraversalStepForm[];
};

export function createEmptyNodeFilter(): GraphNodeFilterForm {
  return {
    id: makeId("where"),
    predicate: "",
    value: "",
  };
}

export function createEmptyStep(): GraphTraversalStepForm {
  return {
    id: makeId("step"),
    predicate: "",
    inverse: false,
    where: [],
  };
}

export function createEmptyGraphPath(): GraphPathForm {
  return {
    where: [],
    steps: [createEmptyStep()],
  };
}

