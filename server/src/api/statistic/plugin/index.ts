import type { AnyStatisticPlugin } from "../StatisticPlugin";
import { kaplanMeierPlugin } from "./kaplanMeierPlugin";
import { meanPlugin } from "./meanPlugin";

/** All registered statistic plugins. Add new plugins here. */
export const statisticsPlugins: AnyStatisticPlugin[] = [
  meanPlugin,
  kaplanMeierPlugin,
];

export function findStatisticPlugin(
  route: string,
): AnyStatisticPlugin | undefined {
  return statisticsPlugins.find((plugin) => plugin.route === route);
}
