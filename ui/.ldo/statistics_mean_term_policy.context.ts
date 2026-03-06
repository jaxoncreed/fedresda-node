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
  graphPath: {
    "@id": "https://fedresda.setmeld.org/statistics#graphPath",
    "@type": "@id",
  },
  where: {
    "@id": "https://fedresda.setmeld.org/statistics#where",
    "@type": "@id",
    "@isCollection": true,
  },
  predicate: {
    "@id": "https://fedresda.setmeld.org/statistics#predicate",
    "@type": "@id",
  },
  value: "https://fedresda.setmeld.org/statistics#value",
  step: {
    "@id": "https://fedresda.setmeld.org/statistics#step",
    "@type": "@id",
  },
  inverse: {
    "@id": "https://fedresda.setmeld.org/statistics#inverse",
    "@type": "http://www.w3.org/2001/XMLSchema#boolean",
  },
  minValues: {
    "@id": "https://fedresda.setmeld.org/statistics#minValues",
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
  },
};
