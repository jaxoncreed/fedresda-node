type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" ? (value as JsonObject) : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Transitional adapter that accepts either:
 * - legacy plain plugin statistic access rule JSON
 * - JSON-LD statistic access rule documents
 */
export function getPluginStatisticAccessRule(
  pluginName: string,
  statisticAccessRuleInput: unknown,
): JsonObject | undefined {
  const statisticAccessRuleObject = asObject(statisticAccessRuleInput);
  if (!statisticAccessRuleObject) {
    return undefined;
  }

  // JSON-LD container style
  const statisticPolicies = asObject(statisticAccessRuleObject.statisticPolicies);
  if (statisticPolicies) {
    const byName = asObject(statisticPolicies[pluginName]);
    if (byName) {
      return byName;
    }
  }

  // Alternate container key some clients may use
  const statistics = asObject(statisticAccessRuleObject.statistics);
  if (statistics) {
    const byName = asObject(statistics[pluginName]);
    if (byName) {
      return byName;
    }
  }

  // If this looks like a JSON-LD wrapper without plugin policy, return undefined.
  const typeValue = getString(statisticAccessRuleObject["@type"]);
  if (
    typeValue === "StatisticAccessRule" ||
    typeValue?.endsWith("#StatisticAccessRule")
  ) {
    return undefined;
  }

  // Legacy plain policy payload
  return statisticAccessRuleObject;
}

