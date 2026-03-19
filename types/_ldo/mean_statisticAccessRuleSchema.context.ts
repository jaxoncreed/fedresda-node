import { LdoJsonldContext } from "@ldo/ldo";

/**
 * =============================================================================
 * mean_statisticAccessRuleSchemaContext: JSONLD Context for mean_statisticAccessRuleSchema
 * =============================================================================
 */
export const mean_statisticAccessRuleSchemaContext: LdoJsonldContext = {
  allowedPath: {
    "@id": "https://fedresda.setmeld.org/statistics#allowedPath",
    "@type": "@id",
    "@isCollection": true,
  },
  graphPath: {
    "@id": "https://fedresda.setmeld.org/statistics#graphPath",
    "@type": "@id",
  },
  start: {
    "@id": "https://fedresda.setmeld.org/statistics#start",
    "@type": "@id",
  },
  rdfType: {
    "@id": "https://fedresda.setmeld.org/statistics#rdfType",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@isCollection": true,
  },
  iri: {
    "@id": "https://fedresda.setmeld.org/statistics#iri",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@isCollection": true,
  },
  categories: {
    "@id": "https://fedresda.setmeld.org/statistics#categories",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@isCollection": true,
  },
  predicates: {
    "@id": "https://fedresda.setmeld.org/statistics#predicates",
    "@type": "@id",
    "@isCollection": true,
  },
  predicate: {
    "@id": "https://fedresda.setmeld.org/statistics#predicate",
    "@type": "@id",
  },
  inverse: {
    "@id": "https://fedresda.setmeld.org/statistics#inverse",
    "@type": "http://www.w3.org/2001/XMLSchema#boolean",
  },
  some: {
    "@id": "https://fedresda.setmeld.org/statistics#some",
    "@type": "@id",
  },
  node: {
    "@id": "https://fedresda.setmeld.org/statistics#node",
    "@type": "@id",
  },
  literal: {
    "@id": "https://fedresda.setmeld.org/statistics#literal",
    "@type": "@id",
  },
  datatype: {
    "@id": "https://fedresda.setmeld.org/statistics#datatype",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@isCollection": true,
  },
  lang: {
    "@id": "https://fedresda.setmeld.org/statistics#lang",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@isCollection": true,
  },
  equals: "https://fedresda.setmeld.org/statistics#equals",
  oneOf: "https://fedresda.setmeld.org/statistics#oneOf",
  min: {
    "@id": "https://fedresda.setmeld.org/statistics#min",
    "@type": "http://www.w3.org/2001/XMLSchema#decimal",
  },
  max: {
    "@id": "https://fedresda.setmeld.org/statistics#max",
    "@type": "http://www.w3.org/2001/XMLSchema#decimal",
  },
  every: {
    "@id": "https://fedresda.setmeld.org/statistics#every",
    "@type": "@id",
  },
  none: {
    "@id": "https://fedresda.setmeld.org/statistics#none",
    "@type": "@id",
  },
  steps: {
    "@id": "https://fedresda.setmeld.org/statistics#steps",
    "@type": "@id",
    "@isCollection": true,
  },
  via: {
    "@id": "https://fedresda.setmeld.org/statistics#via",
    "@type": "@id",
  },
  where: {
    "@id": "https://fedresda.setmeld.org/statistics#where",
    "@type": "@id",
  },
  target: {
    "@id": "https://fedresda.setmeld.org/statistics#target",
    "@type": "@id",
  },
  minValues: {
    "@id": "https://fedresda.setmeld.org/statistics#minValues",
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
  },
};
