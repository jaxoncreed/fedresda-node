import type { StatisticPlugin } from "../StatisticsPlugin";
import { meanPlugin } from "./meanPlugin";

/** All registered statistic plugins. Add new plugins here. */
export const statisticsPlugins: StatisticPlugin<unknown, unknown, unknown>[] = [
  meanPlugin,
];

export function findStatisticPlugin(
  route: string,
): StatisticPlugin<unknown, unknown, unknown> | undefined {
  return statisticsPlugins.find((plugin) => plugin.route === route);
}
