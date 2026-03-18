import { parseRdf } from "@ldo/ldo";
import { namedNode } from "@ldo/rdf-utils";
import type {
  GraphNodeFilterForm,
  GraphPathForm,
  StatisticPolicy,
  StatisticAccessRuleLoadResult,
  StatisticAccessRuleScalarValue,
  StatisticAccessRuleSchemas,
  StatisticAccessRuleValue,
} from "../types";
import { createEmptyGraphPath, createEmptyNodeFilter, makeId } from "../types";
import {
  createDefaultPolicyValues,
  getGraphPathFromValue,
  getPolicyFieldDefinitions,
  type SchemaFieldDefinition,
} from "./statisticAccessRuleSchemaForm";

const SAR = "https://fedresda.setmeld.org/statistic-access-rule#";
const STATP = "https://fedresda.setmeld.org/statistics#";
const DATA_SCHEMA_PREDICATE = `${SAR}dataSchema`;
const HAS_STATISTIC_POLICY_PREDICATE = `${SAR}hasStatisticPolicy`;
const STATISTIC_NAME_PREDICATE = `${SAR}statisticName`;
const STEP_PREDICATE = `${STATP}step`;
const WHERE_PREDICATE = `${STATP}where`;
const PREDICATE_PREDICATE = `${STATP}predicate`;
const VALUE_PREDICATE = `${STATP}value`;
const INVERSE_PREDICATE = `${STATP}inverse`;
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

export function getStatisticAccessRuleTtlUri(targetUri: string): string {
  if (targetUri.endsWith(".statistic-access-rule.ttl")) return targetUri;
  if (targetUri.endsWith(".statistic-access-rule.jsonld")) {
    return targetUri.replace(
      /\.statistic-access-rule\.jsonld$/i,
      ".statistic-access-rule.ttl",
    );
  }
  if (targetUri.endsWith(".statistic-access-rule.json")) {
    return targetUri.replace(
      /\.statistic-access-rule\.json$/i,
      ".statistic-access-rule.ttl",
    );
  }
  return targetUri;
}

export function getCandidateStatisticAccessRuleUris(targetUri: string): string[] {
  const ttl = getStatisticAccessRuleTtlUri(targetUri);
  const jsonld = ttl.replace(
    /\.statistic-access-rule\.ttl$/i,
    ".statistic-access-rule.jsonld",
  );
  const json = ttl.replace(
    /\.statistic-access-rule\.ttl$/i,
    ".statistic-access-rule.json",
  );
  return [ttl, jsonld, json];
}

export async function loadStatisticAccessRule(
  authFetch: typeof fetch,
  targetUri: string,
  statisticAccessRuleSchemas: StatisticAccessRuleSchemas,
): Promise<StatisticAccessRuleLoadResult> {
  const candidates = getCandidateStatisticAccessRuleUris(targetUri);
  for (const uri of candidates) {
    const res = await authFetch(uri);
    if (!res.ok) continue;
    const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
    const body = await res.text();

    if (uri.endsWith(".ttl") || contentType.includes("text/turtle")) {
      const dataset = await parseRdf(body, { baseIRI: uri, format: "Turtle" });
      const datasetLike = dataset as unknown as {
        match: (s: unknown, p: unknown, o: unknown) => unknown;
      };
      const dataSchemaMatches = allPredicateMatches(datasetLike, DATA_SCHEMA_PREDICATE);
      const policySubject = dataSchemaMatches[0]?.subject?.value;
      const dataSchemaName = dataSchemaMatches[0]?.object?.value;
      if (!policySubject || typeof dataSchemaName !== "string") {
        return { dataSchemaName: null, statisticPolicies: [] };
      }
      const policyNodes = allObjectNodeValues(
        datasetLike,
        policySubject,
        HAS_STATISTIC_POLICY_PREDICATE,
      );

      const statisticPolicies: StatisticPolicy[] = [];
      policyNodes.forEach((policyNode) => {
        const statisticName = firstLiteral(
          datasetLike,
          policyNode,
          STATISTIC_NAME_PREDICATE,
        );
        if (!statisticName) return;
        const schema = statisticAccessRuleSchemas[statisticName];
        const fieldDefs = schema ? getPolicyFieldDefinitions(schema) : [];
        const values: Record<string, StatisticAccessRuleValue> = schema
          ? createDefaultPolicyValues(schema)
          : {};
        fieldDefs.forEach((field) => {
          values[field.key] = parseFieldValue(datasetLike, policyNode, field);
        });
        statisticPolicies.push({
          id: makeId("stat"),
          statisticName,
          values,
        });
      });

      return { dataSchemaName, statisticPolicies };
    }

    const parsedJson = JSON.parse(body) as Record<string, unknown>;
    const dataSchemaName =
      typeof parsedJson.dataSchema === "string" ? parsedJson.dataSchema : null;
    return { dataSchemaName, statisticPolicies: [] };
  }
  throw new Error("Unable to load any statistic access rule resource variant.");
}

export function buildStatisticAccessRuleTurtle(
  dataSchemaName: string | null,
  statisticPolicies: StatisticPolicy[],
  statisticAccessRuleSchemas: StatisticAccessRuleSchemas,
): string {
  const lines: string[] = [
    `@prefix sar: <${SAR}> .`,
    `@prefix statp: <${STATP}> .`,
    "",
    "<#policy> a sar:StatisticAccessRule ;",
    `  sar:dataSchema "${escapeTurtleLiteral(dataSchemaName ?? "nemaline")}"`,
  ];

  if (statisticPolicies.length === 0) {
    lines.push("  .", "");
    return lines.join("\n");
  }

  lines[lines.length - 1] += " ;";
  statisticPolicies.forEach((policy, policyIndex) => {
    const schema = statisticAccessRuleSchemas[policy.statisticName];
    const fieldDefs = schema ? getPolicyFieldDefinitions(schema) : [];
    const isLastPolicy = policyIndex === statisticPolicies.length - 1;
    lines.push("  sar:hasStatisticPolicy [");
    lines.push(`    sar:statisticName "${policy.statisticName}" ;`);
    appendPolicyFields(lines, policy, fieldDefs);
    lines.push(`  ]${isLastPolicy ? " ." : " ;"}`);
  });
  lines.push("");
  return lines.join("\n");
}

function toLiteral(value: string | number | boolean): string {
  if (typeof value === "number") return `${Number(value)}`;
  if (typeof value === "boolean") return value ? "true" : "false";
  return `"${escapeTurtleLiteral(value)}"`;
}

function parseFieldValue(
  dataset: { match: (s: unknown, p: unknown, o: unknown) => unknown },
  subjectNode: string,
  field: SchemaFieldDefinition,
): StatisticAccessRuleValue {
  if (field.type === "graphPath") {
    const nodes = allObjectNodeValues(dataset, subjectNode, field.predicate);
    if (field.repeated) {
      return nodes.map((node) => parseGraphPath(dataset, node));
    }
    return parseGraphPath(dataset, nodes[0]);
  }

  if (field.type === "object") {
    const nodes = allObjectNodeValues(dataset, subjectNode, field.predicate);
    return nodes.map((node) => {
      const values: Record<string, StatisticAccessRuleValue> = {};
      (field.nestedFields ?? []).forEach((nestedField) => {
        values[nestedField.key] = parseFieldValue(dataset, node, nestedField);
      });
      return { id: makeId("item"), values };
    });
  }

  const literals = allLiterals(dataset, subjectNode, field.predicate);
  if (field.repeated) {
    return literals.map((literal) =>
      parseScalarLiteral(
        literal,
        field.type === "integer" || field.type === "boolean" ? field.type : "string",
      ),
    );
  }
  return parseScalarLiteral(
    literals[0] ?? "",
    field.type === "integer" || field.type === "boolean" ? field.type : "string",
  );
}

function parseScalarLiteral(
  literal: string,
  fieldType: "string" | "integer" | "boolean",
): string | number | boolean {
  if (fieldType === "integer") {
    const numeric = Number(literal);
    return Number.isFinite(numeric) ? Math.max(1, Math.trunc(numeric)) : 1;
  }
  if (fieldType === "boolean") {
    return literal === "true";
  }
  return literal;
}

function appendPolicyFields(
  lines: string[],
  policy: StatisticPolicy,
  fields: SchemaFieldDefinition[],
) {
  const rendered: string[] = [];
  fields.forEach((field) => {
    const value = policy.values[field.key];
    if (field.type === "graphPath") {
      if (field.repeated) {
        const list = Array.isArray(value) ? (value as GraphPathForm[]) : [];
        list.forEach((graphPath) => {
          rendered.push(`    <${field.predicate}> ${graphPathInline(graphPath)} ;`);
        });
        return;
      }
      const graphPath = getGraphPathFromValue(value);
      rendered.push(`    <${field.predicate}> ${graphPathInline(graphPath)} ;`);
      return;
    }

    if (field.type === "object") {
      const items = Array.isArray(value) ? value : [];
      (items as { values: Record<string, StatisticAccessRuleValue> }[]).forEach((item) => {
        const nestedLines: string[] = [];
        (field.nestedFields ?? []).forEach((nestedField) => {
          appendNestedField(nestedLines, nestedField, item.values[nestedField.key]);
        });
        if (nestedLines.length > 0) {
          const last = nestedLines[nestedLines.length - 1];
          nestedLines[nestedLines.length - 1] = last.replace(/ ;$/, "");
        }
        rendered.push(`    <${field.predicate}> [`);
        nestedLines.forEach((line) => rendered.push(line));
        rendered.push("    ] ;");
      });
      return;
    }

    if (field.repeated) {
      const list = Array.isArray(value)
        ? (value as StatisticAccessRuleScalarValue[])
        : [];
      list.forEach((item) => {
        rendered.push(`    <${field.predicate}> ${toLiteral(item)} ;`);
      });
      return;
    }

    rendered.push(
      `    <${field.predicate}> ${toLiteral((value as StatisticAccessRuleScalarValue) ?? "")} ;`,
    );
  });

  if (rendered.length > 0) {
    const last = rendered[rendered.length - 1];
    rendered[rendered.length - 1] = last.replace(/ ;$/, "");
    lines.push(...rendered);
  } else {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.replace(/ ;$/, "");
  }
}

function appendNestedField(
  lines: string[],
  field: SchemaFieldDefinition,
  value: StatisticAccessRuleValue | undefined,
) {
  if (field.type === "graphPath") {
    lines.push(`      <${field.predicate}> ${graphPathInline(getGraphPathFromValue(value))} ;`);
    return;
  }
  if (field.type === "object") {
    return;
  }
  if (field.repeated) {
    const list = Array.isArray(value)
      ? (value as StatisticAccessRuleScalarValue[])
      : [];
    list.forEach((item) => {
      lines.push(`      <${field.predicate}> ${toLiteral(item)} ;`);
    });
    return;
  }
  lines.push(
    `      <${field.predicate}> ${toLiteral((value as StatisticAccessRuleScalarValue) ?? "")} ;`,
  );
}

