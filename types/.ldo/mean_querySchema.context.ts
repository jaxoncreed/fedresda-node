import { LdoJsonldContext } from "@ldo/ldo";

/**
 * =============================================================================
 * mean_querySchemaContext: JSONLD Context for mean_querySchema
 * =============================================================================
 */
export const mean_querySchemaContext: LdoJsonldContext = {
  queryVersion: {
    "@id": "https://fedresda.setmeld.org/statistics#queryVersion",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
};
