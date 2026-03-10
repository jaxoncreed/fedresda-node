import { LdoJsonldContext } from "@ldo/ldo";

/**
 * =============================================================================
 * kaplanMeier_termPolicySchemaContext: JSONLD Context for kaplanMeier_termPolicySchema
 * =============================================================================
 */
export const kaplanMeier_termPolicySchemaContext: LdoJsonldContext = {
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
