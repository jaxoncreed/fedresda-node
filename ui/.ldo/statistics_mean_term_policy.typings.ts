import { LdoJsonldContext, LdSet } from "@ldo/ldo";

/**
 * =============================================================================
 * Typescript Typings for statistics_mean_term_policy
 * =============================================================================
 */

/**
 * MeanTermPolicy Type
 */
export interface MeanTermPolicy {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  allowedPath: LdSet<AllowedPath>;
}

/**
 * AllowedPath Type
 */
export interface AllowedPath {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  path: LdSet<string>;
  minValues: number;
}
