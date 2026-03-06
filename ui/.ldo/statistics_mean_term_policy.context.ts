import { LdoJsonldContext } from "@ldo/ldo";

/**
 * =============================================================================
 * statistics_mean_term_policyContext: JSONLD Context for statistics_mean_term_policy
 * =============================================================================
 */
export const statistics_mean_term_policyContext: LdoJsonldContext = {
  allowedPath: {
    "@id": "https://fedresda.setmeld.org/statistics#allowedPath",
    "@type": "@id",
    "@isCollection": true,
  },
  path: {
    "@id": "https://fedresda.setmeld.org/statistics#path",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@isCollection": true,
  },
  minValues: {
    "@id": "https://fedresda.setmeld.org/statistics#minValues",
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
  },
};
