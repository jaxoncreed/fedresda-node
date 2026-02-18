/**
 * Types for the Process Service Aggregate API (term policies and aggregate queries).
 * Aligned with the Oxford Medical Data Project Detailed Plan.
 */

/** Vocabulary prefix for aggregate terms */
export const EX = "https://setmeld.com/vocab/aggregate#";

/** Dataset-level terms (e.g. COUNT). Field-level: SUM, AVERAGE, WHERE, GROUP_BY */
export type DatasetTerm = "COUNT";
export type FieldTerm = "SUM" | "AVERAGE" | "WHERE" | "GROUP_BY";
export type Term = DatasetTerm | FieldTerm;

/** Primitive datatype for a field (enforced by backend) */
export type FieldDatatype =
  | "integer"
  | "number"
  | "string"
  | "boolean"
  | "date";

/** Field descriptor in a term policy */
export interface FieldShape {
  "@type"?: "Field";
  fieldName: string;
  name?: string;
  description?: string;
  datatype: FieldDatatype;
  allowedTerms: FieldTerm[];
}

/** Term policy document (owned by Pod owner) */
export interface TermPolicy {
  "@context"?: string | Record<string, unknown>;
  "@id"?: string;
  "@type"?: "TermPolicy";
  /** Opaque version string */
  dct_hasVersion?: string;
  /** Alias in example: subject */
  subject?: string;
  dct_subject?: string;
  /** Base URL of this API */
  hydra_entrypoint?: string;
  entrypoint?: string;
  /** Dataset-level terms (e.g. COUNT) */
  ex_datasetAllowedTerms?: string[];
  datasetAllowedTerms?: string[];
  /** Disclosure threshold: suppress rows with count < minCellSize */
  ex_minCellSize?: number;
  minCellSize?: number;
  /** Field descriptors */
  ex_fields?: FieldShape[];
  fields?: FieldShape[];
}

/** Normalized view of term policy for internal use */
export interface NormalizedTermPolicy {
  version: string;
  subject: string;
  entrypoint: string;
  datasetAllowedTerms: DatasetTerm[];
  minCellSize: number;
  fields: Map<string, FieldShape>;
  /** Base IRI for field predicates (default used if not set). */
  predicateBase?: string;
}

/** Filter operators */
export type FilterOp =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"
  | "isNull"
  | "isNotNull";

/** Single predicate in a WHERE clause */
export interface Predicate {
  field: string;
  op: FilterOp;
  value?: unknown;
  values?: unknown[];
}

/** AND/OR filter */
export interface Filter {
  all?: Predicate[];
  any?: Predicate[];
}

/** One measure in an aggregate request */
export interface Measure {
  term: string;
  field?: string;
}

/** Aggregate search request body. documentUrl is the governed document (e.g. dataset); its term policy aux is loaded from the Pod. */
export interface AggregateRequest {
  /** URL of the document being queried (e.g. https://mypod.com/admin/nemaline_findings.ttl). Required; used to load the term policy auxiliary resource. */
  documentUrl: string;
  measures: Measure[];
  groupBy?: string[];
  where?: Filter;
  options?: {
    rounding?: number;
    suppressSmallCells?: boolean;
  };
}

/** Options for SPARQL execution */
export interface AggregateOptions {
  rounding?: number;
  suppressSmallCells?: boolean;
  minCellSize: number;
}

/** One row in the aggregate result */
export type ResultRow = Record<string, unknown>;

/** Aggregate search response (JSON-LD) */
export interface AggregateResult {
  "@context"?: string | Record<string, unknown>;
  "@type"?: string;
  conformsTo?: string;
  policyVersion?: string;
  disclosure?: {
    minCellSize: number;
    suppressed: number;
    rounded?: boolean;
  };
  groupBy?: string[];
  rows: ResultRow[];
}
