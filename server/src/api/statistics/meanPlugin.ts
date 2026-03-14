import type { StatisticPlugin } from "../StatisticsPlugin";
import { MeanTermPolicy, mean_termPolicySchemaSchema } from "@fedresda/types";
import { graphPathSchema } from "./util/graphPath";
import type { GraphPath } from "./util/graphPath";
import {
  buildGraphPathWhereClause,
  toTemplateStringsArray,
} from "./util/graphPathToSparqlBuilder";
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

function toIriToken(value: string): string {
  if (value.startsWith("<") && value.endsWith(">")) return value;
  return `<${value}>`;
}

type SparqlBuilderModule = typeof import("@tpluscode/sparql-builder");
let sparqlBuilderModulePromise: Promise<SparqlBuilderModule> | undefined;

async function getSparqlBuilderModule(): Promise<SparqlBuilderModule> {
  if (!sparqlBuilderModulePromise) {
    sparqlBuilderModulePromise = import("@tpluscode/sparql-builder");
  }
  return sparqlBuilderModulePromise;
}

export const meanPlugin: StatisticPlugin<
  MeanQuery,
  MeanOutput,
  MeanTermPolicy
> = {
  name: "mean",
  route: "mean",
  termPolicySchema: mean_termPolicySchemaSchema,
  querySchema: meanQuerySchema,
  evaluateTermPolicy(query, termPolicy): true | Error {
    // TODO
    return true;
  },
  async performQuery(query, globals): Promise<MeanOutput> {
    const { SELECT } = await getSparqlBuilderModule();
    const { terminalVar, requiresXsdPrefix, patterns } =
      buildGraphPathWhereClause(query.graphPath);
    let sparqlSelect = SELECT(
      toTemplateStringsArray(`(AVG(${terminalVar}) AS ?mean)`),
    );
    if (requiresXsdPrefix) {
      sparqlSelect = sparqlSelect.prologue`PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n`;
    }
    const scopedPatterns = [
      `GRAPH ${toIriToken(query.resourceUri)} {`,
      ...patterns.map((pattern) => `  ${pattern}`),
      "}",
    ];
    for (const pattern of scopedPatterns) {
      sparqlSelect = sparqlSelect.WHERE(toTemplateStringsArray(pattern));
    }
    sparqlSelect = sparqlSelect.WHERE(
      toTemplateStringsArray(`FILTER(isNumeric(${terminalVar}))`),
    );
    const sparql = sparqlSelect.build();

    const bindingsStream = await globals.sparqlFetcher.fetchBindings(
      globals.sparqlEndpoint,
      sparql,
    );

    let meanValue: number | undefined;
    for await (const binding of bindingsStream as AsyncIterable<{
      [key: string]: unknown;
    }>) {
      const bindingTerm =
        binding.mean ??
        binding["?mean"] ??
        (binding as { value?: unknown }).value;

      if (
        bindingTerm &&
        typeof bindingTerm === "object" &&
        "value" in bindingTerm &&
        typeof (bindingTerm as { value: unknown }).value === "string"
      ) {
        const parsed = Number.parseFloat(
          (bindingTerm as { value: string }).value,
        );
        if (Number.isFinite(parsed)) {
          meanValue = parsed;
        }
      } else if (typeof bindingTerm === "string") {
        const parsed = Number.parseFloat(bindingTerm);
        if (Number.isFinite(parsed)) {
          meanValue = parsed;
        }
      } else if (
        typeof bindingTerm === "number" &&
        Number.isFinite(bindingTerm)
      ) {
        meanValue = bindingTerm;
      }
      break;
    }

    if (meanValue === undefined) {
      throw new Error("No numeric values found for the provided graphPath.");
    }

    return {
      result: meanValue,
    };
  },
};
