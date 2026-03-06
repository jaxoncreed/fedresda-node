import type { StatisticPlugin } from "../StatisticsPlugin";
import { meanPlugin } from "./meanPlugin";
import { kaplanMeierPlugin } from "./kaplanMeierPlugin";
import type { Schema } from "shexj";

/** All registered statistic plugins. Add new plugins here. */
export const statisticsPlugins: StatisticPlugin<unknown, unknown, unknown>[] = [
  meanPlugin,
  kaplanMeierPlugin,
];

/**
 * Finds a statistic plugin by its route.
 * @param route - The route segment (e.g. "mean", "kaplan-meier")
 * @returns The plugin if found, otherwise undefined
 */
export function findStatisticPlugin(
  route: string,
): StatisticPlugin<unknown, unknown, unknown> | undefined {
  return statisticsPlugins.find((p) => p.route === route);
}

export function getTermPolicySchemas(): Record<string, Schema> {
  return statisticsPlugins.reduce(
    (agg, val) => ({ ...agg, [val.name]: val.termPolicySchema }),
    {},
  );
}
