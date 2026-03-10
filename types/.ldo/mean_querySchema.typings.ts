import { LdoJsonldContext, LdSet } from "@ldo/ldo";

/**
 * =============================================================================
 * Typescript Typings for mean_querySchema
 * =============================================================================
 */

/**
 * MeanQuery Type
 */
export interface MeanQuery {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  queryVersion?: string;
}
