import { LdoJsonldContext, LdSet } from "@ldo/ldo";

/**
 * =============================================================================
 * Typescript Typings for mean_statisticAccessRuleSchema
 * =============================================================================
 */

/**
 * MeanStatisticAccessRule Type
 */
export interface MeanStatisticAccessRule {
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
  graphPath: GraphPath;
  minValues: number;
}

/**
 * GraphPath Type
 */
export interface GraphPath {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  where?: LdSet<GraphNodeFilter>;
  step: GraphTraversalStep;
}

/**
 * GraphNodeFilter Type
 */
export interface GraphNodeFilter {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  predicate: {
    "@id": string;
  };
  value: any;
}

/**
 * GraphTraversalStep Type
 */
export interface GraphTraversalStep {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  predicate: {
    "@id": string;
  };
  inverse?: boolean;
  where?: LdSet<GraphNodeFilter>;
  step?: GraphTraversalStep;
}
