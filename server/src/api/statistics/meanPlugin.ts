import type { StatisticPlugin } from "../StatisticsPlugin";
import { getPluginTermPolicy } from "./termPolicyAdapter";
import {
  MeanTermPolicy,
  GraphPath,
  mean_termPolicySchemaSchema,
} from "@fedresda/types";
import { graphPathSchema } from "./util/graphPath";
import type { JSONSchema4 } from "json-schema";

export type MeanQuery = {
  graphPath: GraphPath;
};

export type MeanOutput = {
  result: number;
};

const meanQuerySchema: JSONSchema4 = {
  type: "object",
  additionalProperties: false,
  required: ["graphPath"],
  properties: {
    graphPath: graphPathSchema,
  },
};

export const meanPlugin: StatisticPlugin<
  MeanQuery,
  MeanOutput,
  MeanTermPolicy
> = {
  name: "mean",
  route: "mean",
  termPolicySchema: mean_termPolicySchemaSchema,
  querySchema: meanQuerySchema,
  evaluateTermPolicy(_query, termPolicyInput): true | Error {
    const adapted = getPluginTermPolicy("mean", termPolicyInput);
    if (!adapted) {
      return new Error("No mean term policy found in term policy document.");
    }
    const allowedPath =
      (adapted as { allowedPath?: unknown }).allowedPath ??
      (adapted as { allowedPaths?: unknown }).allowedPaths;
    if (!Array.isArray(allowedPath) || allowedPath.length === 0) {
      return new Error(
        "mean term policy requires at least one allowedPath entry.",
      );
    }
    return true;
  },
  async performQuery(_query, _globals): Promise<MeanOutput> {
    // TODO: implement mean calculation
    return {
      result: 1,
    };
  },
};
