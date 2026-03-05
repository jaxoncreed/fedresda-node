import {
  APPLICATION_LD_JSON,
  ResourceStore,
  readableToString,
} from "@solid/community-server";
import { HttpError } from "../HttpError";
import {
  AuxiliaryDiscoveryHeaders,
  PolicyPermission,
  PolicySpecification,
  QueryMagnitude,
  QueryRequirement,
  ResolvedPolicyDocument,
  StatisticQueryNode,
  ValidationIssue,
} from "./types";

const GIST = "https://w3id.org/semanticarts/ns/ontology/gist/";

const TYPE_KEYS = ["@type", "type", `${GIST}type`];
const IS_ABOUT_KEYS = ["isAbout", `${GIST}isAbout`];
const ALLOWS_KEYS = ["allows", `${GIST}allows`];
const CATEGORIZED_BY_KEYS = ["isCategorizedBy", `${GIST}isCategorizedBy`];
const REQUIRES_KEYS = ["requires", `${GIST}requires`];
const HAS_MAGNITUDE_KEYS = ["hasMagnitude", `${GIST}hasMagnitude`];
const HAS_ASPECT_KEYS = ["hasAspect", `${GIST}hasAspect`];
const NUMERIC_VALUE_KEYS = ["numericValue", `${GIST}numericValue`];

const PERMISSION_IRI = `${GIST}Permission`;
const SPECIFICATION_IRI = `${GIST}Specification`;

type JsonLdNode = Record<string, unknown>;

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function asNode(value: unknown): JsonLdNode | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as JsonLdNode;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  const node = asNode(value);
  if (!node) {
    return undefined;
  }
  if (typeof node["@id"] === "string") {
    return node["@id"];
  }
  if (typeof node["@value"] === "string") {
    return node["@value"];
  }
  return undefined;
}

function getValues(node: JsonLdNode, keys: string[]): unknown[] {
  const values: unknown[] = [];
  for (const key of keys) {
    values.push(...asArray(node[key]));
  }
  return values;
}

function hasType(node: JsonLdNode, expected: string): boolean {
  return getValues(node, TYPE_KEYS).some((value) => {
    const asIri = asString(value);
    if (!asIri) {
      return false;
    }
    return asIri === expected || asIri.endsWith(`/${expected}`) || asIri === expected.replace(`${GIST}`, "");
  });
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  const node = asNode(value);
  if (node && typeof node["@value"] === "number") {
    return node["@value"];
  }
  return undefined;
}

function buildIndex(root: JsonLdNode): Map<string, JsonLdNode> {
  const idIndex = new Map<string, JsonLdNode>();
  for (const graphNode of asArray(root["@graph"])) {
    const node = asNode(graphNode);
    if (!node) {
      continue;
    }
    if (typeof node["@id"] === "string") {
      idIndex.set(node["@id"], node);
    }
  }
  return idIndex;
}

function dereference(value: unknown, idIndex: Map<string, JsonLdNode>): JsonLdNode | undefined {
  const node = asNode(value);
  if (!node) {
    return undefined;
  }
  if (Object.keys(node).length > 1) {
    return node;
  }
  const id = asString(node);
  if (!id) {
    return node;
  }
  return idIndex.get(id) ?? node;
}

function parseSpecification(node: JsonLdNode, idIndex: Map<string, JsonLdNode>): PolicySpecification | undefined {
  if (!hasType(node, SPECIFICATION_IRI) && !hasType(node, "Specification")) {
    return undefined;
  }
  const category = asString(getValues(node, CATEGORIZED_BY_KEYS)[0]);
  if (!category) {
    return undefined;
  }

  const requirements: QueryRequirement[] = [];
  for (const requirementValue of getValues(node, REQUIRES_KEYS)) {
    const requirementNode = dereference(requirementValue, idIndex);
    if (!requirementNode) {
      continue;
    }
    const reqCategory = asString(getValues(requirementNode, CATEGORIZED_BY_KEYS)[0]);
    const reqTarget = asString(getValues(requirementNode, IS_ABOUT_KEYS)[0]);
    if (reqCategory && reqTarget) {
      requirements.push({ category: reqCategory, target: reqTarget });
    }
  }

  const magnitudes: QueryMagnitude[] = [];
  for (const magnitudeValue of getValues(node, HAS_MAGNITUDE_KEYS)) {
    const magnitudeNode = dereference(magnitudeValue, idIndex);
    if (!magnitudeNode) {
      continue;
    }
    const aspect = asString(getValues(magnitudeNode, HAS_ASPECT_KEYS)[0]);
    const numericValue = parseNumber(getValues(magnitudeNode, NUMERIC_VALUE_KEYS)[0]);
    if (aspect !== undefined && numericValue !== undefined) {
      magnitudes.push({ aspect, numericValue });
    }
  }

  return { category, requirements, magnitudes };
}

function parsePermissionNode(node: JsonLdNode, idIndex: Map<string, JsonLdNode>): PolicyPermission | undefined {
  if (!hasType(node, PERMISSION_IRI) && !hasType(node, "Permission")) {
    return undefined;
  }
  const target = asString(getValues(node, IS_ABOUT_KEYS)[0]);
  if (!target) {
    return undefined;
  }
  const allows: PolicySpecification[] = [];
  for (const specValue of getValues(node, ALLOWS_KEYS)) {
    const specNode = dereference(specValue, idIndex);
    if (!specNode) {
      continue;
    }
    const parsed = parseSpecification(specNode, idIndex);
    if (parsed) {
      allows.push(parsed);
    }
  }
  return { target, allows };
}

function parsePolicyDocument(jsonLdText: string): PolicyPermission[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonLdText);
  } catch (error) {
    throw new HttpError(500, "Term policy auxiliary resource is not valid JSON-LD.");
  }
  const root = asNode(parsed);
  if (!root) {
    throw new HttpError(500, "Term policy auxiliary resource has invalid JSON-LD structure.");
  }

  const idIndex = buildIndex(root);
  const rootNodes = asArray(root["@graph"]).length > 0 ? asArray(root["@graph"]) : [root];

  const permissions: PolicyPermission[] = [];
  for (const value of rootNodes) {
    const node = asNode(value);
    if (!node) {
      continue;
    }
    if (typeof node["@id"] === "string") {
      idIndex.set(node["@id"], node);
    }
    const permission = parsePermissionNode(node, idIndex);
    if (permission) {
      permissions.push(permission);
    }
  }
  return permissions;
}

function parseDescribedByLink(linkHeader: string | null, documentUrl: string): string | undefined {
  if (!linkHeader) {
    return undefined;
  }
  const entries = linkHeader.split(",");
  for (const entry of entries) {
    const match = entry.match(/<([^>]+)>\s*;\s*rel="?([^";]+)"?/i);
    if (!match) {
      continue;
    }
    const [, candidate, rel] = match;
    if (rel.trim().toLowerCase() !== "describedby") {
      continue;
    }
    try {
      return new URL(candidate, documentUrl).toString();
    } catch {
      continue;
    }
  }
  return undefined;
}

async function discoverPolicyAuxResource(
  documentUrl: string,
  discoveryHeaders?: AuxiliaryDiscoveryHeaders,
): Promise<string> {
  try {
    const headResponse = await fetch(documentUrl, {
      method: "HEAD",
      headers: {
        ...(discoveryHeaders?.authorization
          ? { authorization: discoveryHeaders.authorization }
          : {}),
        ...(discoveryHeaders?.cookie ? { cookie: discoveryHeaders.cookie } : {}),
        ...(discoveryHeaders?.dpop ? { dpop: discoveryHeaders.dpop } : {}),
      },
    });
    if (headResponse.ok) {
      const discovered = parseDescribedByLink(headResponse.headers.get("link"), documentUrl);
      if (discovered) {
        return discovered;
      }
    }
  } catch {
    // Fall through to deterministic legacy fallback.
  }

  // Fallback for pods that expose auxiliary metadata at a deterministic location.
  return `${documentUrl}.meta`;
}

function normalizeDocumentList(documentUrls: string[]): string[] {
  const urls = documentUrls
    .map((value) => value.trim())
    .filter(Boolean);
  if (urls.length === 0) {
    throw new HttpError(400, "Request must include at least one document URL.");
  }
  const deduplicated = [...new Set(urls)];
  for (const url of deduplicated) {
    try {
      new URL(url);
    } catch {
      throw new HttpError(400, `Document "${url}" is not a valid URL.`);
    }
  }
  return deduplicated;
}

export class TermPolicyService {
  private readonly resourceStore: ResourceStore;

  public constructor(resourceStore: ResourceStore) {
    this.resourceStore = resourceStore;
  }

  public async loadForDocuments(
    documentUrls: string[],
    discoveryHeaders?: AuxiliaryDiscoveryHeaders,
  ): Promise<ResolvedPolicyDocument[]> {
    const normalizedDocs = normalizeDocumentList(documentUrls);

    const resolved: ResolvedPolicyDocument[] = [];
    for (const sourceDocument of normalizedDocs) {
      const policyDocument = await discoverPolicyAuxResource(
        sourceDocument,
        discoveryHeaders,
      );
      let representation;
      try {
        representation = await (this.resourceStore as any).getRepresentation(
          policyDocument,
          {
            type: { [APPLICATION_LD_JSON]: 1 },
          },
        );
      } catch {
        throw new HttpError(
          403,
          `No readable term policy found for document "${sourceDocument}" at "${policyDocument}".`,
        );
      }
      const jsonLdString = await readableToString(representation.data);
      const permissions = parsePolicyDocument(jsonLdString);
      resolved.push({
        sourceDocument,
        policyDocument,
        permissions,
      });
    }
    return resolved;
  }

  public validateNodeAgainstPolicies(
    node: StatisticQueryNode,
    policies: ResolvedPolicyDocument[],
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const allPermissions = policies.flatMap((policy) => policy.permissions);
    const matchingPermissions = allPermissions.filter((permission) => permission.target === node.target);

    if (matchingPermissions.length === 0) {
      issues.push({
        code: "missing_permission",
        message: `No permission targets "${node.target}".`,
      });
      return issues;
    }

    const matchingSpecs = matchingPermissions.flatMap((permission) =>
      permission.allows.filter((spec) => spec.category === node.operation),
    );

    if (matchingSpecs.length === 0) {
      issues.push({
        code: "missing_permission",
        message: `Operation "${node.operation}" is not allowed for target "${node.target}".`,
      });
      return issues;
    }

    for (const requirement of node.requirements ?? []) {
      const hasRequirement = matchingSpecs.some((spec) =>
        spec.requirements.some(
          (specRequirement) =>
            specRequirement.category === requirement.category &&
            specRequirement.target === requirement.target,
        ),
      );
      if (!hasRequirement) {
        issues.push({
          code: "missing_requirement",
          message: `Requirement ${requirement.category} -> ${requirement.target} is not permitted.`,
        });
      }
    }

    for (const magnitude of node.magnitudes ?? []) {
      const hasMagnitude = matchingSpecs.some((spec) =>
        spec.magnitudes.some(
          (specMagnitude) =>
            specMagnitude.aspect === magnitude.aspect &&
            specMagnitude.numericValue === magnitude.numericValue,
        ),
      );
      if (!hasMagnitude) {
        issues.push({
          code: "missing_magnitude",
          message: `Magnitude ${magnitude.aspect}=${magnitude.numericValue} is not permitted.`,
        });
      }
    }

    return issues;
  }
}
