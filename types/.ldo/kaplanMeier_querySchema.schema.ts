import { Schema } from "shexj";

/**
 * =============================================================================
 * kaplanMeier_querySchemaSchema: ShexJ Schema for kaplanMeier_querySchema
 * =============================================================================
 */
export const kaplanMeier_querySchemaSchema: Schema = {
  type: "Schema",
  shapes: [
    {
      id: "https://fedresda.setmeld.org/statistics#KaplanMeierQueryShape",
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
