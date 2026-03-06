import type { StatisticPlugin } from "../StatisticsPlugin";
import type { JSONSchema4 } from "json-schema";
import { graphPathSchema, GraphPath } from "./util/graphPath";

/** Placeholder query type for mean statistic. */
export type MeanQuery = Record<string, never>;

/** Placeholder output type for mean statistic. */
export type MeanOutput = Record<string, never>;

/** Placeholder term policy type for mean statistic. */
export interface MeanTermPolicy {
  allowedPaths: {
    path: GraphPath;
    minValues: number;
  }[];
}

const meanTermPolicySchema: JSONSchema4 = {
  type: "object",
  additionalProperties: false,
  required: ["allowedPaths"],
  properties: {
    allowedPaths: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "minValues"],
        properties: {
          path: graphPathSchema,
          minValues: {
            type: "integer",
            minimum: 1,
          },
        },
      },
    },
  },
};

export const meanPlugin: StatisticPlugin<
  MeanQuery,
  MeanOutput,
  MeanTermPolicy
> = {
  name: "mean",
  route: "mean",
  termPolicySchema: meanTermPolicySchema,
  querySchema: {
    type: "object",
    properties: {
      // TODO: define term policy schema
    },
  },
  evaluateTermPolicy(_query, _termPolicy): true | Error {
    // TODO: implement term policy evaluation
    return true;
  },
  async performQuery(_query): Promise<MeanOutput> {
    // TODO: implement mean calculation
    return {};
  },
};
