import { LdoJsonldContext } from "@ldo/ldo";

/**
 * =============================================================================
 * nemaline_myopathy_gistContext: JSONLD Context for nemaline_myopathy_gist
 * =============================================================================
 */
export const nemaline_myopathy_gistContext: LdoJsonldContext = {
  type: {
    "@id": "@type",
    "@isCollection": true,
  },
  Determination: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/Determination",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      isIdentifiedBy: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isIdentifiedBy",
        "@type": "@id",
      },
      hasParticipant: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasParticipant",
        "@type": "@id",
      },
      produces: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/produces",
        "@type": "@id",
      },
      hasPart: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasPart",
        "@type": "@id",
        "@isCollection": true,
      },
      isCategorizedBy: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
      },
    },
  },
  isIdentifiedBy: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isIdentifiedBy",
    "@type": "@id",
  },
  ID: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/ID",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      uniqueText: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/uniqueText",
        "@type": "http://www.w3.org/2001/XMLSchema#string",
      },
    },
  },
  uniqueText: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/uniqueText",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  hasParticipant: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasParticipant",
    "@type": "@id",
  },
  Person: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/Person",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      isCategorizedBy: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
        "@isCollection": true,
      },
      hasMagnitude: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
        "@type": "@id",
        "@isCollection": true,
      },
    },
  },
  isCategorizedBy: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
    "@isCollection": true,
  },
  C1: "https://paediatrics.ox.ac.uk/terms/C1",
  C2: "https://paediatrics.ox.ac.uk/terms/C2",
  C3: "https://paediatrics.ox.ac.uk/terms/C3",
  variant1: "https://paediatrics.ox.ac.uk/terms/variant1",
  variant2: "https://paediatrics.ox.ac.uk/terms/variant2",
  variant3: "https://paediatrics.ox.ac.uk/terms/variant3",
  Left: "https://paediatrics.ox.ac.uk/terms/Left",
  Right: "https://paediatrics.ox.ac.uk/terms/Right",
  Ambulant: "https://paediatrics.ox.ac.uk/terms/Ambulant",
  NonAmbulant: "https://paediatrics.ox.ac.uk/terms/Non-Ambulant",
  hasMagnitude: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
    "@type": "@id",
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
        "@isCollection": true,
      },
      numericValue: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
        "@type": "http://www.w3.org/2001/XMLSchema#decimal",
      },
    },
  },
  hasAspect: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasAspect",
    "@isCollection": true,
  },
  AspectAgeOfOnset: "https://paediatrics.ox.ac.uk/terms/Aspect_AgeOfOnset",
  numericValue: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
    "@type": "http://www.w3.org/2001/XMLSchema#decimal",
  },
  AspectAge: "https://paediatrics.ox.ac.uk/terms/Aspect_Age",
  produces: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/produces",
    "@type": "@id",
  },
  Content: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/Content",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      hasMagnitude: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
        "@type": "@id",
      },
    },
  },
  AspectTotalMFM: "https://paediatrics.ox.ac.uk/terms/Aspect_TotalMFM",
  hasPart: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasPart",
    "@type": "@id",
    "@isCollection": true,
  },
  Event: {
    "@id": "https://w3id.org/semanticarts/ns/ontology/gist/Event",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      produces: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/produces",
        "@type": "@id",
      },
      hasMagnitude: {
        "@id": "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
        "@type": "@id",
      },
    },
  },
  AspectMFMSubScore: "https://paediatrics.ox.ac.uk/terms/Aspect_MFM_SubScore",
  AspectTimeOffset: "https://paediatrics.ox.ac.uk/terms/Aspect_TimeOffset",
  BelowAverage: "https://paediatrics.ox.ac.uk/terms/BelowAverage",
};
