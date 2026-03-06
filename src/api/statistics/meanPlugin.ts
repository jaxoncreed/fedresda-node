import type { StatisticPlugin } from "../StatisticsPlugin";
import type { JSONSchema4 } from "json-schema";
import { graphPathSchema, GraphPath } from "./util/graphPath";
import { getPluginTermPolicy } from "./termPolicyAdapter";

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
  evaluateTermPolicy(_query, termPolicyInput): true | Error {
    const adapted = getPluginTermPolicy("mean", termPolicyInput);
    if (!adapted) {
      return new Error("No mean term policy found in term policy document.");
    }
    const allowedPaths = adapted.allowedPaths;
    if (!Array.isArray(allowedPaths) || allowedPaths.length === 0) {
      return new Error("mean term policy requires at least one allowedPath.");
    }
    return true;
  },
  async performQuery(_query): Promise<MeanOutput> {
    // TODO: implement mean calculation
    return {};
  },
};
