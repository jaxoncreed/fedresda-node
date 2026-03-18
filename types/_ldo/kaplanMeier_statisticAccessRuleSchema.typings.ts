import { LdoJsonldContext, LdSet } from "@ldo/ldo";

/**
 * =============================================================================
 * Typescript Typings for kaplanMeier_statisticAccessRuleSchema
 * =============================================================================
 */

/**
 * KaplanMeierStatisticAccessRule Type
 */
export interface KaplanMeierStatisticAccessRule {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  cohortPath: LdSet<string>;
  eventPath: LdSet<string>;
  timePath: LdSet<string>;
}
