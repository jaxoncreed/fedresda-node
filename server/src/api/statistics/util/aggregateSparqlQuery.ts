import type { GraphPath } from "./graphPath";
import {
  buildGraphPathWhereClause,
  toIriToken,
  toTemplateStringsArray,
} from "./graphPathToSparqlBuilder";
import { parseNumericBindingValue } from "./sparqlBindingParsers";
import type { IntegrationPodGlobals } from "../../../globals";

type SparqlBuilderModule = typeof import("@tpluscode/sparql-builder");
let sparqlBuilderModulePromise: Promise<SparqlBuilderModule> | undefined;

async function getSparqlBuilderModule(): Promise<SparqlBuilderModule> {
  if (!sparqlBuilderModulePromise) {
    sparqlBuilderModulePromise = import("@tpluscode/sparql-builder");
  }
  return sparqlBuilderModulePromise;
}

export interface NumericAggregateSpec {
  resultVar: string;
  expression: (valueVar: string) => string;
  requireNumericInput?: boolean;
}

export interface ExecuteNumericAggregateQueryParams {
  resourceUri: string;
  graphPath: GraphPath;
  aggregate: NumericAggregateSpec;
  globals: IntegrationPodGlobals;
}

export async function executeNumericAggregateQuery(
  params: ExecuteNumericAggregateQueryParams,
): Promise<number | undefined> {
  const { SELECT } = await getSparqlBuilderModule();
  const { terminalVar, requiresXsdPrefix, patterns } =
    buildGraphPathWhereClause(params.graphPath);
  const aggregateTerm = `(${params.aggregate.expression(terminalVar)} AS ?${params.aggregate.resultVar})`;
  let sparqlSelect = SELECT(toTemplateStringsArray(aggregateTerm));

  if (requiresXsdPrefix) {
    sparqlSelect = sparqlSelect.prologue`PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n`;
  }

  const scopedPatterns = [
    `GRAPH ${toIriToken(params.resourceUri)} {`,
    ...patterns.map((pattern) => `  ${pattern}`),
    "}",
  ];

  for (const pattern of scopedPatterns) {
    sparqlSelect = sparqlSelect.WHERE(toTemplateStringsArray(pattern));
  }

  if (params.aggregate.requireNumericInput !== false) {
    sparqlSelect = sparqlSelect.WHERE(
      toTemplateStringsArray(`FILTER(isNumeric(${terminalVar}))`),
    );
  }

  const query = sparqlSelect.build();
  const bindingsStream = await params.globals.sparqlFetcher.fetchBindings(
    params.globals.sparqlEndpoint,
    query,
  );

  for await (const binding of bindingsStream as AsyncIterable<
    Record<string, unknown>
  >) {
    return parseNumericBindingValue(binding, params.aggregate.resultVar);
  }
  return undefined;
}
