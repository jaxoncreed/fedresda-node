/**
 * Plugin interface for aggregate statistic types (e.g. Mean, GroupBy, Count).
 * Each plugin handles one term, contributes to term policy semantics, and can build SPARQL.
 */

import type {
  NormalizedTermPolicy,
  AggregateRequest,
  AggregateOptions,
  ResultRow,
} from "../types";

/** Context passed when building SPARQL so plugins can coordinate (e.g. GROUP BY vars). */
export interface SparqlBuildContext {
  /** Variables used in SELECT (e.g. ?groupBy_bl1_dem_gen, ?count, ?avg_bl1_nmy_ady) */
  selectVars: string[];
  /** GROUP BY variables (field names that are grouped) */
  groupByFields: string[];
  /** WHERE filter predicates already added (to avoid duplicates) */
  filterPredicates: Set<string>;
  /** Options (rounding, minCellSize, etc.) */
  options: AggregateOptions;
}

/** Result of building one plugin's SPARQL fragment (SELECT vars + optional GROUP BY + HAVING) */
export interface SparqlFragment {
  /** Additional SELECT expressions (e.g. "(COUNT(?s) AS ?count)") */
  selectExpressions: string[];
  /** Additional GROUP BY variables (e.g. "?field_bl1_dem_gen") */
  groupByVars: string[];
  /** Optional HAVING clause (e.g. for minCellSize) */
  having?: string;
}

/**
 * An aggregate plugin handles one "term" (e.g. AVERAGE, GROUP_BY, COUNT).
 * - Dataset-level terms (e.g. COUNT) are allowed via datasetAllowedTerms.
 * - Field-level terms are allowed per field via allowedTerms.
 */
export interface AggregatePlugin {
  /** Term name as in the API (e.g. "AVERAGE", "GROUP_BY", "COUNT") */
  readonly term: string;

  /** If true, term is dataset-level (datasetAllowedTerms); otherwise field-level (allowedTerms). */
  readonly datasetLevel: boolean;

  /** Datatypes this term requires (e.g. ["integer","number"] for AVERAGE). Empty = any. */
  readonly requiredDatatypes?: string[];

  /**
   * Validate that the request's use of this term is allowed by the policy.
   * Throw (or return error) if not. Called for each measure/groupBy/where usage.
   */
  validate(
    policy: NormalizedTermPolicy,
    request: AggregateRequest,
    usage: { kind: "measure" | "groupBy" | "where"; field?: string },
  ): void;

  /**
   * Build SPARQL fragment for this term (SELECT expressions, GROUP BY vars, HAVING).
   * request + policy are already validated.
   */
  buildSparql(
    policy: NormalizedTermPolicy,
    request: AggregateRequest,
    ctx: SparqlBuildContext,
  ): SparqlFragment;

  /**
   * Transform raw SPARQL result bindings into result row keys/values for this term.
   * E.g. AVERAGE adds "AVERAGE(bl1_nmy_ady)": number; GROUP_BY adds field name: value.
   */
  mapResultRow?(
    row: ResultRow,
    bindings: Record<string, unknown>,
    request: AggregateRequest,
  ): void;
}
