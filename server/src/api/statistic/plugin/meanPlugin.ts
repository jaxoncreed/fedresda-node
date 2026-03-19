import type { StatisticPlugin } from "../StatisticPlugin";
import {
  MeanStatisticAccessRule,
  MeanStatisticAccessRuleShapeType,
  mean_statisticAccessRuleSchemaSchema,
} from "@fedresda/types";
import type { GraphPath } from "@fedresda/types";
import { graphPathSchema } from "@fedresda/types/graphPath";
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
  statisticAccessRuleShapeType: MeanStatisticAccessRuleShapeType,
  querySchema: meanQuerySchema,
  evaluateStatisticAccessRule(query, statisticAccessRule): true | Error {
    // TODO
    console.log("Query");
    console.log(JSON.stringify(query, null, 2));
    console.log("meanStatisicAccessRule");
    console.log(JSON.stringify(statisticAccessRule, null, 2));
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
