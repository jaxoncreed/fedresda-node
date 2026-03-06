type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" ? (value as JsonObject) : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Transitional adapter that accepts either:
 * - legacy plain plugin term policy JSON
 * - JSON-LD term policy documents
 */
export function getPluginTermPolicy(
  pluginName: string,
  termPolicyInput: unknown,
): JsonObject | undefined {
  const termPolicyObject = asObject(termPolicyInput);
  if (!termPolicyObject) {
    return undefined;
  }

  // JSON-LD container style
  const statisticPolicies = asObject(termPolicyObject.statisticPolicies);
  if (statisticPolicies) {
    const byName = asObject(statisticPolicies[pluginName]);
    if (byName) {
      return byName;
    }
  }

  // Alternate container key some clients may use
  const statistics = asObject(termPolicyObject.statistics);
  if (statistics) {
    const byName = asObject(statistics[pluginName]);
    if (byName) {
      return byName;
    }
  }

  // If this looks like a JSON-LD wrapper without plugin policy, return undefined.
  const typeValue = getString(termPolicyObject["@type"]);
  if (typeValue === "TermPolicy" || typeValue?.endsWith("#TermPolicy")) {
    return undefined;
  }

  // Legacy plain policy payload
  return termPolicyObject;
}

