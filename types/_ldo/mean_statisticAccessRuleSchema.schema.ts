import { Schema } from "shexj";

/**
 * =============================================================================
 * mean_statisticAccessRuleSchemaSchema: ShexJ Schema for mean_statisticAccessRuleSchema
 * =============================================================================
 */
export const mean_statisticAccessRuleSchemaSchema: Schema = {
  type: "Schema",
  shapes: [
    {
      id: "https://fedresda.setmeld.org/statistics#MeanStatisticAccessRuleShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "TripleConstraint",
          predicate: "https://fedresda.setmeld.org/statistics#allowedPath",
          valueExpr: "https://fedresda.setmeld.org/statistics#AllowedPathShape",
          min: 1,
          max: -1,
        },
      },
    },
    {
      id: "https://fedresda.setmeld.org/statistics#AllowedPathShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#graphPath",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphPathShape",
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#minValues",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#integer",
              },
            },
          ],
        },
      },
    },
    {
      id: "https://fedresda.setmeld.org/statistics#GraphPathShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#start",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphNodeFilterShape",
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#steps",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphTraversalStepShape",
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#target",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphValueSelectorShape",
              min: 0,
              max: 1,
            },
          ],
        },
      },
    },
    {
      id: "https://fedresda.setmeld.org/statistics#GraphNodeFilterShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#rdfType",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#iri",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#categories",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#predicates",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphPredicateFilterShape",
              min: 0,
              max: -1,
            },
          ],
        },
      },
    },
    {
      id: "https://fedresda.setmeld.org/statistics#GraphPredicateFilterShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#predicate",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#inverse",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#boolean",
              },
              min: 0,
              max: 1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#some",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphValueSelectorShape",
              min: 0,
              max: 1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#every",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphValueSelectorShape",
              min: 0,
              max: 1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#none",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphValueSelectorShape",
              min: 0,
              max: 1,
            },
          ],
        },
      },
    },
    {
      id: "https://fedresda.setmeld.org/statistics#GraphTraversalStepShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#via",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#inverse",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#boolean",
              },
              min: 0,
              max: 1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#where",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphNodeFilterShape",
              min: 0,
              max: 1,
            },
          ],
        },
      },
    },
    {
      id: "https://fedresda.setmeld.org/statistics#GraphValueSelectorShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "OneOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#node",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphNodeFilterShape",
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#literal",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphLiteralFilterShape",
            },
          ],
        },
      },
    },
    {
      id: "https://fedresda.setmeld.org/statistics#GraphLiteralFilterShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#datatype",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#lang",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#equals",
              min: 0,
              max: 1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#oneOf",
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#min",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#decimal",
              },
              min: 0,
              max: 1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#max",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#decimal",
              },
              min: 0,
              max: 1,
            },
          ],
        },
      },
    },
  ],
};
