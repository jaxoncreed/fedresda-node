import { ShapeType } from "@ldo/ldo";
import { nemaline_myopathy_gistSchema } from "./nemaline_myopathy_gist.schema";
import { nemaline_myopathy_gistContext } from "./nemaline_myopathy_gist.context";
import {
  Person,
  MFMAssessmentEvent,
  AssessmentResult,
  TimeFromBaselineMagnitude,
  MFMScoreMagnitude,
  TotalMFMMagnitude,
  BaselineAgeMagnitude,
  LoAAgeMagnitude,
  ID,
} from "./nemaline_myopathy_gist.typings";

/**
 * =============================================================================
 * LDO ShapeTypes nemaline_myopathy_gist
 * =============================================================================
 */

/**
 * Person ShapeType
 */
export const PersonShapeType: ShapeType<Person> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/PersonShape",
  context: nemaline_myopathy_gistContext,
};

/**
 * MFMAssessmentEvent ShapeType
 */
export const MFMAssessmentEventShapeType: ShapeType<MFMAssessmentEvent> = {
  schema: nemaline_myopathy_gistSchema,
  shape:
    "https://paediatrics.ox.ac.uk/nemaline-myopathy/terms/MFMAssessmentEventShape",
  context: nemaline_myopathy_gistContext,
};

/**
 * AssessmentResult ShapeType
 */
export const AssessmentResultShapeType: ShapeType<AssessmentResult> = {
  schema: nemaline_myopathy_gistSchema,
  shape:
    "https://paediatrics.ox.ac.uk/nemaline-myopathy/terms/AssessmentResult",
  context: nemaline_myopathy_gistContext,
};

/**
 * TimeFromBaselineMagnitude ShapeType
 */
export const TimeFromBaselineMagnitudeShapeType: ShapeType<TimeFromBaselineMagnitude> =
  {
    schema: nemaline_myopathy_gistSchema,
    shape:
      "https://paediatrics.ox.ac.uk/nemaline-myopathy/terms/TimeFromBaselineMagnitude",
    context: nemaline_myopathy_gistContext,
  };

/**
 * MFMScoreMagnitude ShapeType
 */
export const MFMScoreMagnitudeShapeType: ShapeType<MFMScoreMagnitude> = {
  schema: nemaline_myopathy_gistSchema,
  shape:
    "https://paediatrics.ox.ac.uk/nemaline-myopathy/terms/MFMScoreMagnitude",
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
 * BaselineAgeMagnitude ShapeType
 */
export const BaselineAgeMagnitudeShapeType: ShapeType<BaselineAgeMagnitude> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/BaselineAgeMagnitude",
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
 * ID ShapeType
 */
export const IDShapeType: ShapeType<ID> = {
  schema: nemaline_myopathy_gistSchema,
  shape: "https://paediatrics.ox.ac.uk/terms/IDShape",
  context: nemaline_myopathy_gistContext,
};
