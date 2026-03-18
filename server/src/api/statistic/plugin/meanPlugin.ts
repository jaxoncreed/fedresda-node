import type { StatisticPlugin } from "../StatisticPlugin";
import {
  MeanStatisticAccessRule,
  mean_statisticAccessRuleSchemaSchema,
} from "@fedresda/types";
import { graphPathSchema } from "./util/graphPath";
import type { GraphPath } from "./util/graphPath";
import { executeNumericAggregateQuery } from "./util/aggregateSparqlQuery";
import type { JSONSchema4 } from "json-schema";

export type MeanQuery = {
  resourceUri: string;
  graphPath: GraphPath;
};

export type MeanOutput = {
  result: number;
};

const meanQuerySchema: JSONSchema4 = {
  type: "object",
  additionalProperties: false,
  required: ["resourceUri", "graphPath"],
  properties: {
    resourceUri: {
      type: "string",
      format: "uri",
      minLength: 1,
    },
    graphPath: graphPathSchema,
  },
};

export const meanPlugin: StatisticPlugin<
  MeanQuery,
  MeanOutput,
  MeanStatisticAccessRule
> = {
  name: "mean",
  route: "mean",
  statisticAccessRuleSchema: mean_statisticAccessRuleSchemaSchema,
  querySchema: meanQuerySchema,
  evaluateStatisticAccessRule(_query, _statisticAccessRule): true | Error {
    // TODO
    console.log(JSON.stringify(_query));
    console.log(JSON.stringify(_statisticAccessRule));
    return true;
  },
  async performQuery(query, globals): Promise<MeanOutput> {
    const meanValue = await executeNumericAggregateQuery({
      resourceUri: query.resourceUri,
      graphPath: query.graphPath,
      aggregate: {
        resultVar: "mean",
        expression: (valueVar) => `AVG(${valueVar})`,
      },
      globals,
    });
    if (meanValue === undefined) {
      throw new Error("No numeric values found for the provided graphPath.");
    }

    return {
      result: meanValue,
    };
  },
};
