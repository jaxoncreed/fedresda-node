export type QueryGraphNodeFilter = {
  rdfType?: string | string[];
  iri?: string | string[];
  categories?: string | string[];
  predicates?: Array<{
    predicate: string;
    inverse?: boolean;
    some?: QueryGraphValueSelector;
    every?: QueryGraphValueSelector;
    none?: QueryGraphValueSelector;
  }>;
};

export type QueryGraphTraversalStep = {
  via: string;
  inverse?: boolean;
  where?: QueryGraphNodeFilter;
};

export type QueryGraphValueSelector =
  | { node: QueryGraphNodeFilter }
  | {
      literal: {
        datatype?: string | string[];
        lang?: string | string[];
        equals?: string | number | boolean;
        oneOf?: Array<string | number | boolean>;
        min?: number;
        max?: number;
      };
    };

export type QueryGraphPath = {
  start: QueryGraphNodeFilter;
  steps: QueryGraphTraversalStep[];
  target?: QueryGraphValueSelector;
};

export type GraphPathShortcutTemplateFilter = {
  predicate: string;
  value: string;
};

export type GraphPathShortcutTemplateStep = {
  predicate: string;
  inverse?: boolean;
  where?: GraphPathShortcutTemplateFilter[];
};

export type GraphPathShortcutTemplate = {
  where?: GraphPathShortcutTemplateFilter[];
  steps: GraphPathShortcutTemplateStep[];
};

export type GraphPathShortcut = {
  name: string;
  label: string;
  description?: string;
  template: GraphPathShortcutTemplate;
  queryPath?: QueryGraphPath;
};

export type GraphPathShortcutSchemaModule = {
  dataSchemaName: string;
  shortcuts: GraphPathShortcut[];
};
