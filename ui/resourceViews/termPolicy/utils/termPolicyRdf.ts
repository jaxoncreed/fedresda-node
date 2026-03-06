import { parseRdf } from "@ldo/ldo";
import { namedNode } from "@ldo/rdf-utils";
import type {
  GraphNodeFilterForm,
  GraphPathForm,
  StatisticPolicy,
  TermPolicyLoadResult,
} from "../types";
import { createEmptyGraphPath, createEmptyNodeFilter, makeId } from "../types";

const TP = "https://fedresda.setmeld.org/term-policy#";
const STATP = "https://fedresda.setmeld.org/statistics#";
const DATA_SCHEMA_PREDICATE = `${TP}dataSchema`;
const HAS_STATISTIC_POLICY_PREDICATE = `${TP}hasStatisticPolicy`;
const STATISTIC_NAME_PREDICATE = `${TP}statisticName`;
const ALLOWED_PATH_PREDICATE = `${STATP}allowedPath`;
const GRAPH_PATH_PREDICATE = `${STATP}graphPath`;
const MIN_VALUES_PREDICATE = `${STATP}minValues`;
const FILTER_VALUE_PREDICATE = `${STATP}filterValue`;
const STEP_PREDICATE = `${STATP}step`;
const WHERE_PREDICATE = `${STATP}where`;
const PREDICATE_PREDICATE = `${STATP}predicate`;
const VALUE_PREDICATE = `${STATP}value`;
const INVERSE_PREDICATE = `${STATP}inverse`;
const COHORT_PATH_PREDICATE = `${STATP}cohortPath`;
const EVENT_PATH_PREDICATE = `${STATP}eventPath`;
const TIME_PATH_PREDICATE = `${STATP}timePath`;
const HAS_STEP_PREDICATE = `${STATP}step`;
const START_STEP_PREDICATE = `${STATP}step`;

type RdfTerm = { termType?: string; value?: string };
type Quad = { subject?: RdfTerm; object?: RdfTerm };

function asArray(matchResult: unknown): Quad[] {
  const maybeToArray = matchResult as { toArray?: () => unknown[] };
  if (typeof maybeToArray.toArray === "function") {
    return maybeToArray.toArray() as Quad[];
  }
  return [];
}

function allPredicateMatches(
  dataset: { match: (s: unknown, p: unknown, o: unknown) => unknown },
  predicate: string,
): Quad[] {
  return asArray(dataset.match(null, namedNode(predicate), null));
}

function firstLiteral(
  dataset: { match: (s: unknown, p: unknown, o: unknown) => unknown },
  subjectValue: string,
  predicate: string,
): string | null {
  const matches = allPredicateMatches(dataset, predicate).filter(
    (q) => q.subject?.value === subjectValue,
  );
  const value = matches[0]?.object?.value;
  return typeof value === "string" ? value : null;
}

function allLiterals(
  dataset: { match: (s: unknown, p: unknown, o: unknown) => unknown },
  subjectValue: string,
  predicate: string,
): string[] {
  const matches = allPredicateMatches(dataset, predicate).filter(
    (q) => q.subject?.value === subjectValue,
  );
  return matches
    .map((m) => m.object?.value)
    .filter((v): v is string => typeof v === "string");
}

function allObjectNodeValues(
  dataset: { match: (s: unknown, p: unknown, o: unknown) => unknown },
  subjectValue: string,
  predicate: string,
): string[] {
  const matches = allPredicateMatches(dataset, predicate).filter(
    (q) => q.subject?.value === subjectValue,
  );
  return matches
    .map((m) => m.object?.value)
    .filter((v): v is string => typeof v === "string");
}

function escapeTurtleLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toObjectTerm(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return `<${value}>`;
  }
  return `"${escapeTurtleLiteral(value)}"`;
}

function parseWhereFilter(
  dataset: { match: (s: unknown, p: unknown, o: unknown) => unknown },
  filterNodeId: string | undefined,
): GraphNodeFilterForm {
  if (!filterNodeId) return createEmptyNodeFilter();
  return {
    id: makeId("where"),
    predicate:
      firstLiteral(dataset, filterNodeId, PREDICATE_PREDICATE) ?? "",
    value: firstLiteral(dataset, filterNodeId, VALUE_PREDICATE) ?? "",
  };
}

function parseStepChain(
  dataset: { match: (s: unknown, p: unknown, o: unknown) => unknown },
  stepNode: string | undefined,
): GraphPathForm["steps"] {
  if (!stepNode) return [];
  const step = {
    id: makeId("step"),
    predicate: firstLiteral(dataset, stepNode, PREDICATE_PREDICATE) ?? "",
    inverse: (firstLiteral(dataset, stepNode, INVERSE_PREDICATE) ?? "") === "true",
    where: allObjectNodeValues(dataset, stepNode, WHERE_PREDICATE).map((whereNode) =>
      parseWhereFilter(dataset, whereNode),
    ),
  };
  const nextStepNode = allObjectNodeValues(dataset, stepNode, STEP_PREDICATE)[0];
  return [step, ...parseStepChain(dataset, nextStepNode)];
}

function parseGraphPath(
  dataset: { match: (s: unknown, p: unknown, o: unknown) => unknown },
  graphPathNode: string | undefined,
): GraphPathForm {
  if (!graphPathNode) return createEmptyGraphPath();
  const startStepNode = allObjectNodeValues(dataset, graphPathNode, START_STEP_PREDICATE)[0];
  const steps = parseStepChain(dataset, startStepNode);
  return {
    where: allObjectNodeValues(dataset, graphPathNode, WHERE_PREDICATE).map((whereNode) =>
      parseWhereFilter(dataset, whereNode),
    ),
    steps:
      steps.length > 0
        ? steps
        : [
            {
              id: makeId("step"),
              predicate: "",
              inverse: false,
              where: [],
            },
          ],
  };
}

function whereFilterInline(filter: GraphNodeFilterForm): string {
  const predicateTerm = /^https?:\/\//i.test(filter.predicate)
    ? `<${filter.predicate}>`
    : `"${escapeTurtleLiteral(filter.predicate)}"`;
  return `[ statp:predicate ${predicateTerm} ; statp:value ${toObjectTerm(filter.value)} ]`;
}

function stepInline(step: GraphPathForm["steps"][number]): string {
  const predicateTerm = /^https?:\/\//i.test(step.predicate)
    ? `<${step.predicate}>`
    : `"${escapeTurtleLiteral(step.predicate)}"`;
  const parts: string[] = [`statp:predicate ${predicateTerm}`];
  if (step.inverse) {
    parts.push("statp:inverse true");
  }
  step.where.forEach((filter) => {
    parts.push(`statp:where ${whereFilterInline(filter)}`);
  });
  return `[ ${parts.join(" ; ")} ]`;
}

function graphPathInline(graphPath: GraphPathForm): string {
  const parts: string[] = [];
  graphPath.where.forEach((filter) => {
    parts.push(`statp:where ${whereFilterInline(filter)}`);
  });
  const [firstStep, ...nextSteps] = graphPath.steps;
  if (firstStep) {
    let chained = stepInline(firstStep);
    nextSteps.forEach((step) => {
      chained = chained.replace(/\]$/, ` ; statp:step ${stepInline(step)} ]`);
    });
    parts.push(`statp:step ${chained}`);
  }
  return `[ ${parts.join(" ; ")} ]`;
}

export function getTermPolicyTtlUri(targetUri: string): string {
  if (targetUri.endsWith(".term-policy.ttl")) return targetUri;
  if (targetUri.endsWith(".term-policy.jsonld")) {
    return targetUri.replace(/\.term-policy\.jsonld$/i, ".term-policy.ttl");
  }
  if (targetUri.endsWith(".term-policy.json")) {
    return targetUri.replace(/\.term-policy\.json$/i, ".term-policy.ttl");
  }
  return targetUri;
}

export function getCandidateTermPolicyUris(targetUri: string): string[] {
  const ttl = getTermPolicyTtlUri(targetUri);
  const jsonld = ttl.replace(/\.term-policy\.ttl$/i, ".term-policy.jsonld");
  const json = ttl.replace(/\.term-policy\.ttl$/i, ".term-policy.json");
  return [ttl, jsonld, json];
}

export async function loadTermPolicy(
  authFetch: typeof fetch,
  targetUri: string,
): Promise<TermPolicyLoadResult> {
  const candidates = getCandidateTermPolicyUris(targetUri);
  for (const uri of candidates) {
    const res = await authFetch(uri);
    if (!res.ok) continue;
    const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
    const body = await res.text();

    if (uri.endsWith(".ttl") || contentType.includes("text/turtle")) {
      const dataset = await parseRdf(body, { baseIRI: uri, format: "Turtle" });
      const dataSchemaMatches = allPredicateMatches(dataset, DATA_SCHEMA_PREDICATE);
      const policySubject = dataSchemaMatches[0]?.subject?.value;
      const dataSchemaName = dataSchemaMatches[0]?.object?.value;
      if (!policySubject || typeof dataSchemaName !== "string") {
        return { dataSchemaName: null, statisticPolicies: [] };
      }
      const policyNodes = allObjectNodeValues(
        dataset,
        policySubject,
        HAS_STATISTIC_POLICY_PREDICATE,
      );

      const statisticPolicies: StatisticPolicy[] = [];
      policyNodes.forEach((policyNode) => {
        const statisticName = firstLiteral(
          dataset,
          policyNode,
          STATISTIC_NAME_PREDICATE,
        );
        if (statisticName === "mean") {
          const allowedPathNodes = asArray(
            dataset.match(
              namedNode(policyNode),
              namedNode(ALLOWED_PATH_PREDICATE),
              null,
            ),
          )
            .map((q) => q.object?.value)
            .filter((v): v is string => typeof v === "string");
          const allowedPaths = allowedPathNodes.map((allowedPathNode) => {
            const minValuesLiteral = firstLiteral(
              dataset,
              allowedPathNode,
              MIN_VALUES_PREDICATE,
            );
            return {
              id: makeId("allowed"),
              graphPath: parseGraphPath(
                dataset,
                allObjectNodeValues(dataset, allowedPathNode, GRAPH_PATH_PREDICATE)[0],
              ),
              minValues: Number(minValuesLiteral ?? "1") || 1,
              filterValue:
                firstLiteral(dataset, allowedPathNode, FILTER_VALUE_PREDICATE) ?? "",
            };
          });
          statisticPolicies.push({
            id: makeId("stat"),
            statisticName: "mean",
            allowedPaths:
              allowedPaths.length > 0
                ? allowedPaths
                : [
                    {
                      id: makeId("allowed"),
                      graphPath: createEmptyGraphPath(),
                      minValues: 1,
                      filterValue: "",
                    },
                  ],
          });
        } else if (statisticName === "kaplan-meier") {
          statisticPolicies.push({
            id: makeId("stat"),
            statisticName: "kaplan-meier",
            cohortPath: allLiterals(dataset, policyNode, COHORT_PATH_PREDICATE),
            eventPath: allLiterals(dataset, policyNode, EVENT_PATH_PREDICATE),
            timePath: allLiterals(dataset, policyNode, TIME_PATH_PREDICATE),
          });
        }
      });

      return { dataSchemaName, statisticPolicies };
    }

    const parsedJson = JSON.parse(body) as Record<string, unknown>;
    const dataSchemaName =
      typeof parsedJson.dataSchema === "string" ? parsedJson.dataSchema : null;
    return { dataSchemaName, statisticPolicies: [] };
  }
  throw new Error("Unable to load any term policy resource variant.");
}

export function buildTermPolicyTurtle(
  dataSchemaName: string | null,
  statisticPolicies: StatisticPolicy[],
): string {
  const lines: string[] = [
    `@prefix tp: <${TP}> .`,
    `@prefix statp: <${STATP}> .`,
    "",
    "<#policy> a tp:TermPolicy ;",
    `  tp:dataSchema "${escapeTurtleLiteral(dataSchemaName ?? "nemaline")}"`,
  ];

  if (statisticPolicies.length === 0) {
    lines.push("  .", "");
    return lines.join("\n");
  }

  lines[lines.length - 1] += " ;";
  statisticPolicies.forEach((policy, policyIndex) => {
    const isLastPolicy = policyIndex === statisticPolicies.length - 1;
    lines.push("  tp:hasStatisticPolicy [");
    lines.push(`    tp:statisticName "${policy.statisticName}" ;`);
    if (policy.statisticName === "mean") {
      policy.allowedPaths.forEach((allowedPath, allowedPathIndex) => {
        lines.push("    statp:allowedPath [");
        lines.push(`      statp:graphPath ${graphPathInline(allowedPath.graphPath)} ;`);
        lines.push(`      statp:minValues ${Math.max(1, Number(allowedPath.minValues) || 1)}`);
        if (allowedPath.filterValue) {
          lines[lines.length - 1] += " ;";
          lines.push(
            `      statp:filterValue "${escapeTurtleLiteral(allowedPath.filterValue)}"`,
          );
        }
        lines.push(
          `    ]${allowedPathIndex === policy.allowedPaths.length - 1 ? "" : " ;"}`,
        );
      });
    } else {
      const cohort = policy.cohortPath
        .map((p) => `"${escapeTurtleLiteral(p)}"`)
        .join(", ");
      const event = policy.eventPath
        .map((p) => `"${escapeTurtleLiteral(p)}"`)
        .join(", ");
      const time = policy.timePath
        .map((p) => `"${escapeTurtleLiteral(p)}"`)
        .join(", ");
      lines.push(`    statp:cohortPath ${cohort || "\"\""} ;`);
      lines.push(`    statp:eventPath ${event || "\"\""} ;`);
      lines.push(`    statp:timePath ${time || "\"\""}`);
    }
    lines.push(`  ]${isLastPolicy ? " ." : " ;"}`);
  });
  lines.push("");
  return lines.join("\n");
}

