import { LdoJsonldContext, LdSet } from "@ldo/ldo";

/**
 * =============================================================================
 * Typescript Typings for statistics_kaplan_meier_term_policy
 * =============================================================================
 */

/**
 * KaplanMeierTermPolicy Type
 */
export interface KaplanMeierTermPolicy {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  cohortPath: LdSet<string>;
  eventPath: LdSet<string>;
  timePath: LdSet<string>;
}
