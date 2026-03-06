import { LdoJsonldContext } from "@ldo/ldo";

/**
 * =============================================================================
 * statistics_kaplan_meier_term_policyContext: JSONLD Context for statistics_kaplan_meier_term_policy
 * =============================================================================
 */
export const statistics_kaplan_meier_term_policyContext: LdoJsonldContext = {
  cohortPath: {
    "@id": "https://fedresda.setmeld.org/statistics#cohortPath",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@isCollection": true,
  },
  eventPath: {
    "@id": "https://fedresda.setmeld.org/statistics#eventPath",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@isCollection": true,
  },
  timePath: {
    "@id": "https://fedresda.setmeld.org/statistics#timePath",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@isCollection": true,
  },
};
