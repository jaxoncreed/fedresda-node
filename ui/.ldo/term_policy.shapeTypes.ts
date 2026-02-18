import { ShapeType } from "@ldo/ldo";
import { term_policySchema } from "./term_policy.schema";
import { term_policyContext } from "./term_policy.context";
import {
  AccessControl,
  MeasureSpecification,
  ConfigurationMagnitude,
  InputRequirement,
} from "./term_policy.typings";

/**
 * =============================================================================
 * LDO ShapeTypes term_policy
 * =============================================================================
 */

/**
 * AccessControl ShapeType
 */
export const AccessControlShapeType: ShapeType<AccessControl> = {
  schema: term_policySchema,
  shape: "http://example.org/analytics/AccessControlShape",
  context: term_policyContext,
};

/**
 * MeasureSpecification ShapeType
 */
export const MeasureSpecificationShapeType: ShapeType<MeasureSpecification> = {
  schema: term_policySchema,
  shape: "http://example.org/analytics/MeasureSpecificationShape",
  context: term_policyContext,
};

/**
 * ConfigurationMagnitude ShapeType
 */
export const ConfigurationMagnitudeShapeType: ShapeType<ConfigurationMagnitude> =
  {
    schema: term_policySchema,
    shape: "http://example.org/analytics/ConfigurationMagnitudeShape",
    context: term_policyContext,
  };

/**
 * InputRequirement ShapeType
 */
export const InputRequirementShapeType: ShapeType<InputRequirement> = {
  schema: term_policySchema,
  shape: "http://example.org/analytics/InputRequirementShape",
  context: term_policyContext,
};
