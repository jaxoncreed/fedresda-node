import { Schema } from "shexj";

/**
 * =============================================================================
 * statistics_mean_term_policySchema: ShexJ Schema for statistics_mean_term_policy
 * =============================================================================
 */
export const statistics_mean_term_policySchema: Schema = {
  type: "Schema",
  shapes: [
    {
      id: "https://fedresda.setmeld.org/statistics#MeanTermPolicyShape",
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
              predicate: "https://fedresda.setmeld.org/statistics#where",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphNodeFilterShape",
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#step",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphTraversalStepShape",
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
              predicate: "https://fedresda.setmeld.org/statistics#predicate",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#value",
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
              predicate: "https://fedresda.setmeld.org/statistics#where",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphNodeFilterShape",
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "https://fedresda.setmeld.org/statistics#step",
              valueExpr:
                "https://fedresda.setmeld.org/statistics#GraphTraversalStepShape",
              min: 0,
              max: 1,
            },
          ],
        },
      },
    },
  ],
};
