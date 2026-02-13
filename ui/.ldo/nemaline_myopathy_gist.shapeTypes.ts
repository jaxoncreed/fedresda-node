import { ShapeType } from "@ldo/ldo";
import { nemaline_myopathy_gistSchema } from "./nemaline_myopathy_gist.schema";
import { nemaline_myopathy_gistContext } from "./nemaline_myopathy_gist.context";
import {
  AssessmentEvent,
  Subject,
  TaskPerformance,
  TaskPerformanceProduces,
  TotalScoreResult,
  TotalMFMMagnitude,
  ID,
  AgeAtAssessmentMagnitude,
  LoAAgeMagnitude,
  MFMSubScoreMagnitude,
  TimeOffsetMagnitude,
} from "./nemaline_myopathy_gist.typings";

/**
 * =============================================================================
 * LDO ShapeTypes nemaline_myopathy_gist
 * =============================================================================
 */

/**
 * AssessmentEvent ShapeType
 */
export const AssessmentEventShapeType: ShapeType<AssessmentEvent> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/AssessmentEventShape",
  context: nemaline_myopathy_gistContext,
};

/**
 * Subject ShapeType
 */
export const SubjectShapeType: ShapeType<Subject> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/SubjectShape",
  context: nemaline_myopathy_gistContext,
};

/**
 * TaskPerformance ShapeType
 */
export const TaskPerformanceShapeType: ShapeType<TaskPerformance> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/TaskPerformanceShape",
  context: nemaline_myopathy_gistContext,
};

/**
 * TaskPerformanceProduces ShapeType
 */
export const TaskPerformanceProducesShapeType: ShapeType<TaskPerformanceProduces> =
  {
    schema: nemaline_myopathy_gistSchema,
    shape: "https://paediatrics.ox.ac.uk/terms/TaskPerformanceProduces",
    context: nemaline_myopathy_gistContext,
  };

/**
 * TotalScoreResult ShapeType
 */
export const TotalScoreResultShapeType: ShapeType<TotalScoreResult> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/TotalScoreResult",
  context: nemaline_myopathy_gistContext,
};

/**
 * TotalMFMMagnitude ShapeType
 */
export const TotalMFMMagnitudeShapeType: ShapeType<TotalMFMMagnitude> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/TotalMFMMagnitude",
  context: nemaline_myopathy_gistContext,
};

/**
 * ID ShapeType
 */
export const IDShapeType: ShapeType<ID> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/IDShape",
  context: nemaline_myopathy_gistContext,
};

/**
 * AgeAtAssessmentMagnitude ShapeType
 */
export const AgeAtAssessmentMagnitudeShapeType: ShapeType<AgeAtAssessmentMagnitude> =
  {
    schema: nemaline_myopathy_gistSchema,
    shape: "https://paediatrics.ox.ac.uk/terms/AgeAtAssessmentMagnitude",
    context: nemaline_myopathy_gistContext,
  };

/**
 * LoAAgeMagnitude ShapeType
 */
export const LoAAgeMagnitudeShapeType: ShapeType<LoAAgeMagnitude> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/LoAAgeMagnitude",
  context: nemaline_myopathy_gistContext,
};

/**
 * MFMSubScoreMagnitude ShapeType
 */
export const MFMSubScoreMagnitudeShapeType: ShapeType<MFMSubScoreMagnitude> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/MFMSubScoreMagnitude",
  context: nemaline_myopathy_gistContext,
};

/**
 * TimeOffsetMagnitude ShapeType
 */
export const TimeOffsetMagnitudeShapeType: ShapeType<TimeOffsetMagnitude> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/TimeOffsetMagnitude",
  context: nemaline_myopathy_gistContext,
};
