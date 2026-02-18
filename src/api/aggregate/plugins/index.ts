/**
 * Aggregate plugins: add plugins to the array to extend supported terms.
 */

import { countPlugin } from "./count";
import { meanPlugin } from "./mean";
import { groupByPlugin } from "./groupBy";

export { countPlugin } from "./count";
export { meanPlugin } from "./mean";
export { groupByPlugin } from "./groupBy";
export type {
  AggregatePlugin,
  SparqlBuildContext,
  SparqlFragment,
} from "./types";

/** All aggregate plugins. Add new plugins (e.g. Kaplan-Meier) here. */
export const AGGREGATE_PLUGINS = [countPlugin, meanPlugin, groupByPlugin];

export function getAggregatePlugin(term: string) {
  return AGGREGATE_PLUGINS.find((p) => p.term === term);
}

export function getAllPlugins() {
  return AGGREGATE_PLUGINS;
}
