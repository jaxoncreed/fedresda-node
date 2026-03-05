import {
  ResolvedPolicyDocument,
  StatisticQueryNode,
  ValidationIssue,
} from "./types";

export interface StatisticsPluginValidationContext {
  node: StatisticQueryNode;
  policies: ResolvedPolicyDocument[];
}

export interface StatisticsPluginValidationResult {
  plugin: string;
  issues: ValidationIssue[];
}

export interface StatisticsPlugin {
  id: string;
  supports(operation: string): boolean;
  validate(context: StatisticsPluginValidationContext): StatisticsPluginValidationResult;
}

export class GenericPolicyPlugin implements StatisticsPlugin {
  public readonly id = "generic-policy";

  public supports(_operation: string): boolean {
    return true;
  }

  public validate(_context: StatisticsPluginValidationContext): StatisticsPluginValidationResult {
    return {
      plugin: this.id,
      issues: [],
    };
  }
}

/**
 * Example plugin showing how statistic-specific checks can be layered on top of
 * the shared policy checks. The generic policy plugin still handles permission
 * evaluation; this plugin only enforces shape constraints for this operation.
 */
export class KaplanMeierPlugin implements StatisticsPlugin {
  public readonly id = "kaplan-meier";
  public readonly operationIri: string;

  public constructor(operationIri: string) {
    this.operationIri = operationIri;
  }

  public supports(operation: string): boolean {
    return operation === this.operationIri;
  }

  public validate(context: StatisticsPluginValidationContext): StatisticsPluginValidationResult {
    const issues: ValidationIssue[] = [];
    const hasTimeRole = (context.node.requirements ?? []).some((requirement) =>
      requirement.category.endsWith("TimeVariable"),
    );
    const hasEventRole = (context.node.requirements ?? []).some((requirement) =>
      requirement.category.endsWith("EventVariable"),
    );

    if (!hasTimeRole) {
      issues.push({
        code: "missing_requirement",
        message: "Kaplan-Meier requires a TimeVariable requirement.",
      });
    }
    if (!hasEventRole) {
      issues.push({
        code: "missing_requirement",
        message: "Kaplan-Meier requires an EventVariable requirement.",
      });
    }

    return {
      plugin: this.id,
      issues,
    };
  }
}

export class StatisticsPluginRegistry {
  private readonly plugins: StatisticsPlugin[];
  private readonly fallbackPlugin: StatisticsPlugin;

  public constructor(plugins: StatisticsPlugin[], fallbackPlugin?: StatisticsPlugin) {
    this.plugins = plugins;
    this.fallbackPlugin = fallbackPlugin ?? new GenericPolicyPlugin();
  }

  public resolve(operation: string): StatisticsPlugin {
    return this.plugins.find((plugin) => plugin.supports(operation)) ?? this.fallbackPlugin;
  }
}
