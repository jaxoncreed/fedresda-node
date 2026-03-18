import type {
  GraphLiteralFilter,
  GraphNodeFilter,
  GraphPath,
  GraphPredicateFilter,
  GraphValueSelector,
} from "./graphPath";

type WherePatternAppender<T> = {
  WHERE(strings: TemplateStringsArray, ...values: unknown[]): T;
};

type GraphPathSparqlBuildResult = {
  startVar: string;
  terminalVar: string;
  requiresXsdPrefix: boolean;
  patterns: string[];
  applyWhere<T extends WherePatternAppender<T>>(query: T): T;
};

export type GraphPathBuildOptions = {
  startVar?: string;
  variableNamespace?: string;
};

const RDF_TYPE = "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>";
const GIST_IS_CATEGORIZED_BY =
  "<https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy>";

class SparqlPatternBuilder {
  private readonly lines: string[] = [];
  private nextId = 0;
  private usesXsdPrefix = false;
  private readonly variableNamespace: string;

  public constructor(variableNamespace = "") {
    this.variableNamespace = variableNamespace;
  }

  public nextVar(prefix: string): string {
    this.nextId += 1;
    return `?${this.variableNamespace}${prefix}${this.nextId}`;
  }

  public addLine(line: string): void {
    this.lines.push(line);
  }

  public markUsesXsdPrefix(): void {
    this.usesXsdPrefix = true;
  }

  public getLines(): string[] {
    return this.lines;
  }

  public getRequiresXsdPrefix(): boolean {
    return this.usesXsdPrefix;
  }
}

export function toTemplateStringsArray(value: string): TemplateStringsArray {
  return Object.assign([value], {
    raw: [value],
  }) as unknown as TemplateStringsArray;
}

function appendPattern<T extends WherePatternAppender<T>>(
  query: T,
  pattern: string,
): T {
  return query.WHERE(toTemplateStringsArray(pattern));
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function toIriToken(value: string): string {
  if (value.startsWith("<") && value.endsWith(">")) return value;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("urn:")
  ) {
    return `<${value}>`;
  }
  return value;
}

function toLiteralToken(value: string | number | boolean): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`Literal number must be finite. Received: ${value}`);
    }
    return `${value}`;
  }
  return value ? "true" : "false";
}

function quoteLang(value: string): string {
  return JSON.stringify(value.toLowerCase());
}

function asIndentedGroup(lines: string[]): string {
  return lines.map((line) => `  ${line}`).join("\n");
}

function triplePattern(
  subjectVar: string,
  predicate: string,
  objectVar: string,
  inverse?: boolean,
): string {
  const predicateToken = toIriToken(predicate);
  return inverse
    ? `${objectVar} ${predicateToken} ${subjectVar} .`
    : `${subjectVar} ${predicateToken} ${objectVar} .`;
}

function addNodeFilterPattern(
  builder: SparqlPatternBuilder,
  nodeVar: string,
  filter: GraphNodeFilter | undefined,
): void {
  if (!filter) return;

  const rdfTypes = toArray(filter.rdfType);
  if (rdfTypes.length > 0) {
    const typeVar = builder.nextVar("type");
    builder.addLine(`${nodeVar} ${RDF_TYPE} ${typeVar} .`);
    builder.addLine(
      `VALUES ${typeVar} { ${rdfTypes.map((item) => toIriToken(item)).join(" ")} }`,
    );
  }

  const iris = toArray(filter.iri);
  if (iris.length > 0) {
    builder.addLine(
      `VALUES ${nodeVar} { ${iris.map((item) => toIriToken(item)).join(" ")} }`,
    );
  }

  const categories = toArray(filter.categories);
  if (categories.length > 0) {
    const categoryVar = builder.nextVar("category");
    builder.addLine(`${nodeVar} ${GIST_IS_CATEGORIZED_BY} ${categoryVar} .`);
    builder.addLine(
      `VALUES ${categoryVar} { ${categories.map((item) => toIriToken(item)).join(" ")} }`,
    );
  }

  for (const predicateFilter of filter.predicates ?? []) {
    addPredicateFilterPattern(builder, nodeVar, predicateFilter);
  }
}

function addValueSelectorPattern(
  builder: SparqlPatternBuilder,
  valueVar: string,
  selector: GraphValueSelector | undefined,
): void {
  if (!selector) return;
  if ("node" in selector) {
    addNodeFilterPattern(builder, valueVar, selector.node);
  } else {
    addLiteralFilterPattern(builder, valueVar, selector.literal);
  }
}

function selectorPattern(
  valueVar: string,
  selector: GraphValueSelector | undefined,
): { lines: string[]; requiresXsdPrefix: boolean } {
  if (!selector) return { lines: [], requiresXsdPrefix: false };

  const selectorBuilder = new SparqlPatternBuilder();
  addValueSelectorPattern(selectorBuilder, valueVar, selector);
  return {
    lines: selectorBuilder.getLines(),
    requiresXsdPrefix: selectorBuilder.getRequiresXsdPrefix(),
  };
}

function addPredicateFilterPattern(
  builder: SparqlPatternBuilder,
  nodeVar: string,
  filter: GraphPredicateFilter,
): void {
  if (filter.some) {
    const someVar = builder.nextVar("some");
    builder.addLine(
      triplePattern(nodeVar, filter.predicate, someVar, filter.inverse),
    );
    addValueSelectorPattern(builder, someVar, filter.some);
  }

  if (filter.none) {
    const noneVar = builder.nextVar("none");
    const selector = selectorPattern(noneVar, filter.none);
    if (selector.requiresXsdPrefix) builder.markUsesXsdPrefix();
    const innerLines = [
      triplePattern(nodeVar, filter.predicate, noneVar, filter.inverse),
      ...selector.lines,
    ];
    builder.addLine(`FILTER NOT EXISTS {\n${asIndentedGroup(innerLines)}\n}`);
  }

  if (filter.every) {
    const everyVar = builder.nextVar("every");
    const selector = selectorPattern(everyVar, filter.every);
    if (selector.requiresXsdPrefix) builder.markUsesXsdPrefix();
    const violationLines = [
      triplePattern(nodeVar, filter.predicate, everyVar, filter.inverse),
    ];
    if (selector.lines.length > 0) {
      violationLines.push(
        `FILTER NOT EXISTS {\n${asIndentedGroup(selector.lines)}\n}`,
      );
    }
    builder.addLine(
      `FILTER NOT EXISTS {\n${asIndentedGroup(violationLines)}\n}`,
    );
  }

  if (!filter.some && !filter.none && !filter.every) {
    const anyVar = builder.nextVar("any");
    builder.addLine(
      triplePattern(nodeVar, filter.predicate, anyVar, filter.inverse),
    );
  }
}

function addLiteralFilterPattern(
  builder: SparqlPatternBuilder,
  valueVar: string,
  filter: GraphLiteralFilter | undefined,
): void {
  if (!filter) return;

  const datatypes = toArray(filter.datatype);
  if (datatypes.length > 0) {
    builder.addLine(
      `FILTER(datatype(${valueVar}) IN (${datatypes
        .map((datatype) => toIriToken(datatype))
        .join(", ")}))`,
    );
  }

  const languages = toArray(filter.lang);
  if (languages.length > 0) {
    builder.addLine(
      `FILTER(LCASE(lang(${valueVar})) IN (${languages
        .map((language) => quoteLang(language))
        .join(", ")}))`,
    );
  }

  if (filter.equals !== undefined) {
    builder.addLine(`FILTER(${valueVar} = ${toLiteralToken(filter.equals)})`);
  }
  if (filter.oneOf && filter.oneOf.length > 0) {
    builder.addLine(
      `FILTER(${valueVar} IN (${filter.oneOf
        .map((item) => toLiteralToken(item))
        .join(", ")}))`,
    );
  }

  if (filter.min !== undefined || filter.max !== undefined) {
    builder.markUsesXsdPrefix();
    builder.addLine(`FILTER(isNumeric(${valueVar}))`);
    if (filter.min !== undefined) {
      builder.addLine(`FILTER(xsd:decimal(${valueVar}) >= ${filter.min})`);
    }
    if (filter.max !== undefined) {
      builder.addLine(`FILTER(xsd:decimal(${valueVar}) <= ${filter.max})`);
    }
  }
}

export function buildGraphPathWhereClause(
  graphPath: GraphPath,
  options?: GraphPathBuildOptions,
): GraphPathSparqlBuildResult {
  const namespace = options?.variableNamespace ?? "";
  const startVar = options?.startVar ?? `?${namespace}node0`;
  const builder = new SparqlPatternBuilder(namespace);
  let currentVar = startVar;

  addNodeFilterPattern(builder, currentVar, graphPath.start);
  for (const step of graphPath.steps) {
    const nextVar = builder.nextVar("node");
    builder.addLine(triplePattern(currentVar, step.via, nextVar, step.inverse));
    addNodeFilterPattern(builder, nextVar, step.where);
    currentVar = nextVar;
  }
  addValueSelectorPattern(builder, currentVar, graphPath.target);

  const patterns = builder.getLines();
  return {
    startVar,
    terminalVar: currentVar,
    requiresXsdPrefix: builder.getRequiresXsdPrefix(),
    patterns,
    applyWhere<T extends WherePatternAppender<T>>(query: T): T {
      return patterns.reduce(
        (currentQuery, pattern) => appendPattern(currentQuery, pattern),
        query,
      );
    },
  };
}
