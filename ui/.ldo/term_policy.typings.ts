import { LdoJsonldContext, LdSet } from "@ldo/ldo";

/**
 * =============================================================================
 * Typescript Typings for term_policy
 * =============================================================================
 */

/**
 * AccessControl Type
 */
export interface AccessControl {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Permission";
  }>;
  isAbout: {
    "@id": string;
  };
  allows: LdSet<MeasureSpecification>;
}

/**
 * MeasureSpecification Type
 */
export interface MeasureSpecification {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Specification";
  }>;
  isCategorizedBy: {
    "@id": string;
  };
  hasMagnitude?: LdSet<ConfigurationMagnitude>;
  requires?: LdSet<InputRequirement>;
}

/**
 * ConfigurationMagnitude Type
 */
export interface ConfigurationMagnitude {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Magnitude";
  }>;
  hasAspect: {
    "@id": string;
  };
  numericValue: number;
}

/**
 * InputRequirement Type
 */
export interface InputRequirement {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Requirement";
  }>;
  isAbout: {
    "@id": string;
  };
  isCategorizedBy: {
    "@id": string;
  };
}
