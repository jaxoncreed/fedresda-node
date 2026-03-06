import type { JSONSchema4 } from "json-schema";

/**
 * Defines a traversal of a graph to get to a specific value
 */
export interface GraphPath {
  /**
   * Initial node selector where traversal begins.
   * Example: { rdfType: "gist:Person" }
   */
  start: GraphNodeFilter;
  /**
   * Ordered traversal steps from the starting node.
   */
  steps: GraphTraversalStep[];
  /**
   * Optional final selector/value expectation at the end of traversal.
   * Useful for selecting a specific literal or constrained node.
   */
  target?: GraphValueSelector;
}

/**
 * Filter constraints that can be applied to any graph node.
 * All provided constraints must match.
 */
export interface GraphNodeFilter {
  /** Match node RDF type(s), e.g. "gist:Person". */
  rdfType?: string | string[];
  /** Match node IRI(s) directly when known. */
  iri?: string | string[];
  /** Match one or more category IRIs (e.g. gist:isCategorizedBy). */
  categories?: string | string[];
  /**
   * Match arbitrary predicates on this node.
   * Example:
   * {
   *   predicate: "gist:hasMagnitude",
   *   some: { node: { predicates: [{ predicate: "gist:hasAspect", some: { node: { iri: "nm:Aspect_DurationSinceStudyEnrollment" } } }] } }
   * }
   */
  predicates?: GraphPredicateFilter[];
}

export interface GraphPredicateFilter {
  /** Predicate IRI/prefixed name, e.g. "gist:hasAspect". */
  predicate: string;
  /**
   * If true, traverse inverse edge (^predicate).
   * False means subject -> object direction.
   */
  inverse?: boolean;
  /** Match if at least one object satisfies this selector. */
  some?: GraphValueSelector;
  /** Match only if all objects satisfy this selector. */
  every?: GraphValueSelector;
  /** Match only if no objects satisfy this selector. */
  none?: GraphValueSelector;
}

export interface GraphTraversalStep {
  /**
   * Predicate used to move from the current node to next node(s).
   * Use inverse=true for incoming edges.
   */
  via: string;
  inverse?: boolean;
  /**
   * Optional filter to apply to destination nodes for this step.
   */
  where?: GraphNodeFilter;
}

export type GraphValueSelector =
  | { node: GraphNodeFilter }
  | { literal: GraphLiteralFilter };

export interface GraphLiteralFilter {
  datatype?: string | string[];
  lang?: string | string[];
  equals?: string | number | boolean;
  oneOf?: Array<string | number | boolean>;
  min?: number;
  max?: number;
}

const stringOrStringArraySchema: JSONSchema4 = {
  anyOf: [
    { type: "string" },
    {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
  ],
};

const scalarLiteralSchema: JSONSchema4 = {
  anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }],
};

/**
 * JSON Schema representation of GraphPath.
 * Uses recursive definitions so node/predicate/value filters can be nested.
 */
export const graphPathSchema: JSONSchema4 = {
  type: "object",
  additionalProperties: false,
  required: ["start", "steps"],
  properties: {
    start: { $ref: "#/definitions/graphNodeFilter" },
    steps: {
      type: "array",
      items: { $ref: "#/definitions/graphTraversalStep" },
    },
    target: { $ref: "#/definitions/graphValueSelector" },
  },
  definitions: {
    graphPath: {
      type: "object",
      additionalProperties: false,
      required: ["start", "steps"],
      properties: {
        start: { $ref: "#/definitions/graphNodeFilter" },
        steps: {
          type: "array",
          items: { $ref: "#/definitions/graphTraversalStep" },
        },
        target: { $ref: "#/definitions/graphValueSelector" },
      },
    },
    graphNodeFilter: {
      type: "object",
      additionalProperties: false,
      properties: {
        rdfType: stringOrStringArraySchema,
        iri: stringOrStringArraySchema,
        categories: stringOrStringArraySchema,
        predicates: {
          type: "array",
          items: { $ref: "#/definitions/graphPredicateFilter" },
        },
      },
    },
    graphPredicateFilter: {
      type: "object",
      additionalProperties: false,
      required: ["predicate"],
      properties: {
        predicate: { type: "string" },
        inverse: { type: "boolean" },
        some: { $ref: "#/definitions/graphValueSelector" },
        every: { $ref: "#/definitions/graphValueSelector" },
        none: { $ref: "#/definitions/graphValueSelector" },
      },
    },
    graphTraversalStep: {
      type: "object",
      additionalProperties: false,
      required: ["via"],
      properties: {
        via: { type: "string" },
        inverse: { type: "boolean" },
        where: { $ref: "#/definitions/graphNodeFilter" },
      },
    },
    graphValueSelector: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["node"],
          properties: {
            node: { $ref: "#/definitions/graphNodeFilter" },
          },
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["literal"],
          properties: {
            literal: { $ref: "#/definitions/graphLiteralFilter" },
          },
        },
      ],
    },
    graphLiteralFilter: {
      type: "object",
      additionalProperties: false,
      properties: {
        datatype: stringOrStringArraySchema,
        lang: stringOrStringArraySchema,
        equals: scalarLiteralSchema,
        oneOf: {
          type: "array",
          items: scalarLiteralSchema,
          minItems: 1,
        },
        min: { type: "number" },
        max: { type: "number" },
      },
    },
  },
};
