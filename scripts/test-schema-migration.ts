import assert from "node:assert/strict";
import { asJsonDataSchema, findDataSchema } from "../src/api/dataSchemas";
import { getPluginTermPolicy } from "../src/api/statistics/termPolicyAdapter";

function run(): void {
  const schema = findDataSchema("nemaline");
  assert.ok(schema, "nemaline schema must be registered");

  const schemaJsonView = asJsonDataSchema("nemaline", schema!);
  assert.ok(schemaJsonView.shapeCount > 0, "JSON schema view should include shapes");
  assert.ok(
    schemaJsonView.shapes.some((shape) => shape.tripleConstraints.length > 0),
    "JSON schema view should include triple constraints",
  );

  const legacyPolicy = {
    allowedPaths: [{ path: [{ type: "property", value: "x" }], minValues: 1 }],
  };
  const adaptedLegacyPolicy = getPluginTermPolicy("mean", legacyPolicy);
  assert.deepEqual(
    adaptedLegacyPolicy,
    legacyPolicy,
    "legacy term policies should pass through unchanged",
  );

  const linkedDataPolicy = {
    "@type": "TermPolicy",
    dataSchema: "nemaline",
    statisticPolicies: {
      mean: {
        allowedPaths: [{ path: [{ type: "property", value: "x" }], minValues: 1 }],
      },
    },
  };
  const adaptedLinkedDataPolicy = getPluginTermPolicy("mean", linkedDataPolicy);
  assert.deepEqual(
    adaptedLinkedDataPolicy,
    linkedDataPolicy.statisticPolicies.mean,
    "JSON-LD term policies should adapt to plugin-specific policy",
  );

  console.log("Schema migration smoke tests passed.");
}

run();
