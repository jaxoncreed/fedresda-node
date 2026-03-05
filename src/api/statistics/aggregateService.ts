import { HttpError } from "../HttpError";
import {
  AggregateRequestBody,
  AuxiliaryDiscoveryHeaders,
  OperationValidationResult,
  StatisticQueryNode,
} from "./types";
import { TermPolicyService } from "./policy";
import {
  GenericPolicyPlugin,
  KaplanMeierPlugin,
  StatisticsPluginRegistry,
} from "./plugins";

function isNode(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isRequirementList(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => {
    if (!isNode(item)) {
      return false;
    }
    return typeof item.category === "string" && typeof item.target === "string";
  });
}

function isMagnitudeList(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => {
    if (!isNode(item)) {
      return false;
    }
    return (
      typeof item.aspect === "string" &&
      typeof item.numericValue === "number" &&
      Number.isFinite(item.numericValue)
    );
  });
}

function isValidQueryNode(value: unknown): value is StatisticQueryNode {
  if (!isNode(value)) {
    return false;
  }
  if (typeof value.operation !== "string" || typeof value.target !== "string") {
    return false;
  }
  if (value.requirements !== undefined && !isRequirementList(value.requirements)) {
    return false;
  }
  if (value.magnitudes !== undefined && !isMagnitudeList(value.magnitudes)) {
    return false;
  }
  if (value.inputs !== undefined) {
    if (!Array.isArray(value.inputs)) {
      return false;
    }
    if (!value.inputs.every(isValidQueryNode)) {
      return false;
    }
  }
  if (value.options !== undefined && !isNode(value.options)) {
    return false;
  }
  return true;
}

function parseRequestBody(body: unknown): AggregateRequestBody {
  if (!isNode(body) || !Array.isArray(body.documents) || !isValidQueryNode(body.query)) {
    throw new HttpError(
      400,
      "Invalid request body. Expected { documents: string[], query: StatisticQueryNode }.",
    );
  }
  if (!body.documents.every((value) => typeof value === "string")) {
    throw new HttpError(400, "Each document in documents[] must be a string URL.");
  }
  return {
    documents: body.documents,
    query: body.query,
  };
}

function collectNodes(root: StatisticQueryNode): StatisticQueryNode[] {
  const all: StatisticQueryNode[] = [root];
  for (const child of root.inputs ?? []) {
    all.push(...collectNodes(child));
  }
  return all;
}

export class AggregateService {
  private readonly policyService: TermPolicyService;
  private readonly pluginRegistry: StatisticsPluginRegistry;

  public constructor(policyService: TermPolicyService) {
    this.policyService = policyService;
    this.pluginRegistry = new StatisticsPluginRegistry(
      [
        new KaplanMeierPlugin(
          "https://paediatrics.ox.ac.uk/statistics/KaplanMeier",
        ),
      ],
      new GenericPolicyPlugin(),
    );
  }

  public async validateRequest(
    rawBody: unknown,
    discoveryHeaders?: AuxiliaryDiscoveryHeaders,
  ): Promise<{
    request: AggregateRequestBody;
    validations: OperationValidationResult[];
    policyDocuments: string[];
  }> {
    const request = parseRequestBody(rawBody);
    const policies = await this.policyService.loadForDocuments(
      request.documents,
      discoveryHeaders,
    );
    const nodes = collectNodes(request.query);

    const validations: OperationValidationResult[] = nodes.map((node) => {
      const plugin = this.pluginRegistry.resolve(node.operation);
      const policyIssues = this.policyService.validateNodeAgainstPolicies(
        node,
        policies,
      );
      const pluginValidation = plugin.validate({
        node,
        policies,
      });
      const issues = [...policyIssues, ...pluginValidation.issues];

      return {
        operation: node.operation,
        plugin: pluginValidation.plugin,
        valid: issues.length === 0,
        issues,
      };
    });

    const hasInvalidOperation = validations.some((validation) => !validation.valid);
    if (hasInvalidOperation) {
      throw new HttpError(
        403,
        JSON.stringify(
          {
            error: "policy_violation",
            message: "One or more operations are not allowed by term policy.",
            validations,
          },
          null,
          2,
        ),
      );
    }

    return {
      request,
      validations,
      policyDocuments: policies.map((policy) => policy.policyDocument),
    };
  }
}
