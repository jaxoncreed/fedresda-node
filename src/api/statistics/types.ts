export interface QueryRequirement {
  category: string;
  target: string;
}

export interface QueryMagnitude {
  aspect: string;
  numericValue: number;
}

export interface StatisticQueryNode {
  operation: string;
  target: string;
  requirements?: QueryRequirement[];
  magnitudes?: QueryMagnitude[];
  inputs?: StatisticQueryNode[];
  options?: Record<string, unknown>;
}

export interface AggregateRequestBody {
  documents: string[];
  query: StatisticQueryNode;
}

export interface AuxiliaryDiscoveryHeaders {
  authorization?: string;
  cookie?: string;
  dpop?: string;
}

export interface PolicySpecification {
  category: string;
  requirements: QueryRequirement[];
  magnitudes: QueryMagnitude[];
}

export interface PolicyPermission {
  target: string;
  allows: PolicySpecification[];
}

export interface ResolvedPolicyDocument {
  sourceDocument: string;
  policyDocument: string;
  permissions: PolicyPermission[];
}

export interface ValidationIssue {
  code: "missing_permission" | "missing_requirement" | "missing_magnitude";
  message: string;
}

export interface OperationValidationResult {
  operation: string;
  plugin: string;
  valid: boolean;
  issues: ValidationIssue[];
}
