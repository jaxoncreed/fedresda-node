import { Schema } from "shexj";

/**
 * =============================================================================
 * mean_querySchemaSchema: ShexJ Schema for mean_querySchema
 * =============================================================================
 */
export const mean_querySchemaSchema: Schema = {
  type: "Schema",
  shapes: [
    {
      id: "https://fedresda.setmeld.org/statistics#MeanQueryShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "TripleConstraint",
          predicate: "https://fedresda.setmeld.org/statistics#queryVersion",
          valueExpr: {
            type: "NodeConstraint",
            datatype: "http://www.w3.org/2001/XMLSchema#string",
          },
          min: 0,
          max: 1,
        },
      },
    },
  ],
};
