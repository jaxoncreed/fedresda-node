import { LdoJsonldContext, LdSet } from "@ldo/ldo";

/**
 * =============================================================================
 * Typescript Typings for kaplanMeier_termPolicySchema
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
