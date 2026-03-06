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
              predicate: "https://fedresda.setmeld.org/statistics#path",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 1,
              max: -1,
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
  ],
};
