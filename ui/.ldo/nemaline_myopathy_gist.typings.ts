import { LdoJsonldContext, LdSet } from "@ldo/ldo";

/**
 * =============================================================================
 * Typescript Typings for nemaline_myopathy_gist
 * =============================================================================
 */

/**
 * AssessmentEvent Type
 */
export interface AssessmentEvent {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Determination";
  }>;
  isIdentifiedBy: ID;
  hasParticipant: Subject;
  produces: TotalScoreResult;
  hasPart: LdSet<TaskPerformance>;
  isCategorizedBy?: {
    "@id": "BelowAverage";
  };
}

/**
 * Subject Type
 */
export interface Subject {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Person";
  }>;
  isCategorizedBy?: LdSet<
    | {
        "@id": "C1";
      }
    | {
        "@id": "C2";
      }
    | {
        "@id": "C3";
      }
    | {
        "@id": "variant1";
      }
    | {
        "@id": "variant2";
      }
    | {
        "@id": "variant3";
      }
    | {
        "@id": "Left";
      }
    | {
        "@id": "Right";
      }
    | {
        "@id": "Ambulant";
      }
    | {
        "@id": "NonAmbulant";
      }
  >;
  hasMagnitude?: LdSet<LoAAgeMagnitude | AgeAtAssessmentMagnitude>;
}

/**
 * TaskPerformance Type
 */
export interface TaskPerformance {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Event";
  }>;
  produces: TaskPerformanceProduces;
  hasMagnitude: TimeOffsetMagnitude;
}

/**
 * TaskPerformanceProduces Type
 */
export interface TaskPerformanceProduces {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Content";
  }>;
  hasMagnitude: MFMSubScoreMagnitude;
}

/**
 * TotalScoreResult Type
 */
export interface TotalScoreResult {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Content";
  }>;
  hasMagnitude: TotalMFMMagnitude;
}

/**
 * TotalMFMMagnitude Type
 */
export interface TotalMFMMagnitude {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Magnitude";
  }>;
  hasAspect: {
    "@id": "AspectTotalMFM";
  };
  numericValue: number;
}

/**
 * ID Type
 */
export interface ID {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "ID";
  }>;
  uniqueText: string;
}

/**
 * AgeAtAssessmentMagnitude Type
 */
export interface AgeAtAssessmentMagnitude {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Magnitude";
  }>;
  hasAspect: {
    "@id": "AspectAge";
  };
  numericValue: number;
}

/**
 * LoAAgeMagnitude Type
 */
export interface LoAAgeMagnitude {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Magnitude";
  }>;
  hasAspect: {
    "@id": "AspectAgeOfOnset";
  };
  numericValue: number;
}

/**
 * MFMSubScoreMagnitude Type
 */
export interface MFMSubScoreMagnitude {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Magnitude";
  }>;
  hasAspect: {
    "@id": "AspectMFMSubScore";
  };
  numericValue: number;
}

/**
 * TimeOffsetMagnitude Type
 */
export interface TimeOffsetMagnitude {
  "@id"?: string;
  "@context"?: LdoJsonldContext;
  type: LdSet<{
    "@id": "Magnitude";
  }>;
  hasAspect: {
    "@id": "AspectTimeOffset";
  };
  numericValue: number;
}
