import { LdoJsonldContext } from "@ldo/ldo";

/**
 * =============================================================================
 * term_policyContext: JSONLD Context for term_policy
 * =============================================================================
 */
export const term_policyContext: LdoJsonldContext = {
  type: {
    "@id": "@type",
    "@isCollection": true,
  },
  Permission: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/Permission",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      isAbout: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isAbout",
        "@type": "@id",
      },
      allows: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/allows",
        "@type": "@id",
        "@isCollection": true,
      },
    },
  },
  isAbout: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isAbout",
    "@type": "@id",
  },
  allows: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/allows",
    "@type": "@id",
    "@isCollection": true,
  },
  Specification: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/Specification",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      isCategorizedBy: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
        "@type": "@id",
      },
      hasMagnitude: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
        "@type": "@id",
        "@isCollection": true,
      },
      requires: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/requires",
        "@type": "@id",
        "@isCollection": true,
      },
    },
  },
  isCategorizedBy: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
    "@type": "@id",
  },
  hasMagnitude: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
    "@type": "@id",
    "@isCollection": true,
  },
  Magnitude: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/Magnitude",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      hasAspect: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasAspect",
        "@type": "@id",
      },
      numericValue: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
        "@type": "http://www.w3.org/2001/XMLSchema#decimal",
      },
    },
  },
  hasAspect: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasAspect",
    "@type": "@id",
  },
  numericValue: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
    "@type": "http://www.w3.org/2001/XMLSchema#decimal",
  },
  requires: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/requires",
    "@type": "@id",
    "@isCollection": true,
  },
  Requirement: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/Requirement",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      isAbout: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isAbout",
        "@type": "@id",
      },
      isCategorizedBy: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
        "@type": "@id",
      },
    },
  },
};
