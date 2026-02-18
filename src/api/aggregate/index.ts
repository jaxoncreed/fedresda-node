/**
 * Aggregate API: term policies and statistic plugins.
 *
 * - GET /aggregate/term-policy?document=<url> — return term policy auxiliary resource (JSON-LD) from the Pod
 * - POST /aggregate/search — body must include documentUrl; term policy is loaded from the Pod and enforced
 *
 * Term policy is stored as a Solid auxiliary resource (document URL + .term-policy).
 * To add a new statistic type (e.g. Kaplan-Meier): implement AggregatePlugin and register it.
 */

export { createAggregateRouter } from "./aggregateRouter";
export { normalizeTermPolicy, validateRequestAgainstPolicy, PolicyViolationError } from "./termPolicy";
export { AGGREGATE_PLUGINS, getAggregatePlugin, getAllPlugins } from "./plugins";
export { loadTermPolicyFromPod, getTermPolicyAuxUrl, TERM_POLICY_SUFFIX } from "./termPolicyAux";
export { parseGistTermPolicy } from "./gistTermPolicy";
export { defaultTermPolicy } from "./defaultPolicy";
export type { TermPolicy, NormalizedTermPolicy, AggregateRequest, AggregateResult } from "./types";
export type { AggregatePlugin } from "./plugins/types";
