import { Schema } from "shexj";

/**
 * =============================================================================
 * term_policySchema: ShexJ Schema for term_policy
 * =============================================================================
 */
export const term_policySchema: Schema = {
  type: "Schema",
  shapes: [
    {
      id: "http://example.org/analytics/AccessControlShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Permission",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isAbout",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/allows",
              valueExpr:
                "http://example.org/analytics/MeasureSpecificationShape",
              min: 1,
              max: -1,
            },
          ],
        },
      },
    },
    {
      id: "http://example.org/analytics/MeasureSpecificationShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Specification",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
              valueExpr:
                "http://example.org/analytics/ConfigurationMagnitudeShape",
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/requires",
              valueExpr: "http://example.org/analytics/InputRequirementShape",
              min: 0,
              max: -1,
            },
          ],
        },
      },
    },
    {
      id: "http://example.org/analytics/ConfigurationMagnitudeShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Magnitude",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasAspect",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#decimal",
              },
            },
          ],
        },
      },
    },
    {
      id: "http://example.org/analytics/InputRequirementShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Requirement",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isAbout",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
            },
          ],
        },
      },
    },
  ],
};
