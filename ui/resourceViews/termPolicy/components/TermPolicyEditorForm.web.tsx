import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "linked-data-browser";
import type { StatisticPolicy, TermPolicySchemas } from "../types";
import { createEmptyGraphPath, makeId } from "../types";
import type {
  StartPredicateOptionGetter,
  StartValueOptionGetter,
  StepPredicateOptionGetter,
  StepWherePredicateOptionGetter,
  StepWhereValueOptionGetter,
} from "../utils/graphPathOptionResolver";
import { GraphPathInput } from "./GraphPathInput.web";
import { GraphPathBuilder } from "./GraphPathBuilder.web";

type Props = {
  error: string | null;
  saveMessage: string | null;
  dataSchemaName: string | null;
  termPolicySchemas: TermPolicySchemas;
  statisticPolicies: StatisticPolicy[];
  setStatisticPolicies: React.Dispatch<React.SetStateAction<StatisticPolicy[]>>;
  statisticNames: string[];
  newStatisticName: string;
  setNewStatisticName: (value: string) => void;
  predicateOptions: string[];
  filterValueOptions: string[];
  getStartPredicateOptions: StartPredicateOptionGetter;
  getStartValueOptions: StartValueOptionGetter;
  getStepPredicateOptions: StepPredicateOptionGetter;
  getStepWherePredicateOptions: StepWherePredicateOptionGetter;
  getStepWhereValueOptions: StepWhereValueOptionGetter;
  addStatisticPolicy: () => void;
  save: () => Promise<void>;
  isSaving: boolean;
};

export function TermPolicyEditorForm({
  error,
  saveMessage,
  dataSchemaName,
  termPolicySchemas,
  statisticPolicies,
  setStatisticPolicies,
  statisticNames,
  newStatisticName,
  setNewStatisticName,
  predicateOptions,
  filterValueOptions,
  getStartPredicateOptions,
  getStartValueOptions,
  getStepPredicateOptions,
  getStepWherePredicateOptions,
  getStepWhereValueOptions,
  addStatisticPolicy,
  save,
  isSaving,
}: Props) {
  return (
    <>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saveMessage ? <Text style={styles.success}>{saveMessage}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.key}>Data schema</Text>
        <Text>{dataSchemaName ?? "not configured"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.key}>Add statistic plugin policy</Text>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={newStatisticName}
            onChange={(e) => setNewStatisticName(e.target.value)}
            style={{ minHeight: 32, minWidth: 220 }}
          >
            {statisticNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button type="button" onClick={addStatisticPolicy}>
            Add
          </button>
        </div>
      </View>

      {statisticPolicies.map((policy, policyIndex) => (
        <View key={policy.id} style={styles.card}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <Text style={styles.key}>
              {policyIndex + 1}. {policy.statisticName}
            </Text>
            <button
              type="button"
              onClick={() =>
                setStatisticPolicies((prev) => prev.filter((p) => p.id !== policy.id))
              }
            >
              Remove
            </button>
          </div>

          {policy.statisticName === "mean" ? (
            <div>
              {policy.allowedPaths.map((allowedPath, allowedPathIndex) => (
                <div
                  key={allowedPath.id}
                  style={{
                    border: "1px solid rgba(0,0,0,0.2)",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "600" }}>
                      Allowed path {allowedPathIndex + 1}
                    </Text>
                    <button
                      type="button"
                      onClick={() =>
                        setStatisticPolicies((prev) =>
                          prev.map((p) =>
                            p.id !== policy.id || p.statisticName !== "mean"
                              ? p
                              : {
                                  ...p,
                                  allowedPaths: p.allowedPaths.filter(
                                    (ap) => ap.id !== allowedPath.id,
                                  ),
                                },
                          ),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <GraphPathBuilder
                    value={allowedPath.graphPath}
                    predicateOptions={predicateOptions}
                    getStartPredicateOptions={getStartPredicateOptions}
                    getStartValueOptions={getStartValueOptions}
                    getStepPredicateOptions={getStepPredicateOptions}
                    getStepWherePredicateOptions={getStepWherePredicateOptions}
                    getStepWhereValueOptions={getStepWhereValueOptions}
                    onChange={(nextGraphPath) =>
                      setStatisticPolicies((prev) =>
                        prev.map((p) =>
                          p.id !== policy.id || p.statisticName !== "mean"
                            ? p
                            : {
                                ...p,
                                allowedPaths: p.allowedPaths.map((ap) =>
                                  ap.id === allowedPath.id
                                    ? { ...ap, graphPath: nextGraphPath }
                                    : ap,
                                ),
                              },
                        ),
                      )
                    }
                  />

                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <label style={{ minWidth: 100 }}>Min values</label>
                    <input
                      type="number"
                      min={1}
                      value={allowedPath.minValues}
                      onChange={(e) =>
                        setStatisticPolicies((prev) =>
                          prev.map((p) =>
                            p.id !== policy.id || p.statisticName !== "mean"
                              ? p
                              : {
                                  ...p,
                                  allowedPaths: p.allowedPaths.map((ap) =>
                                    ap.id === allowedPath.id
                                      ? {
                                          ...ap,
                                          minValues: Math.max(
                                            1,
                                            Number(e.target.value || "1"),
                                          ),
                                        }
                                      : ap,
                                  ),
                                },
                          ),
                        )
                      }
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <label style={{ minWidth: 100 }}>Filter value</label>
                    <select
                      value={allowedPath.filterValue}
                      onChange={(e) =>
                        setStatisticPolicies((prev) =>
                          prev.map((p) =>
                            p.id !== policy.id || p.statisticName !== "mean"
                              ? p
                              : {
                                  ...p,
                                  allowedPaths: p.allowedPaths.map((ap) =>
                                    ap.id === allowedPath.id
                                      ? { ...ap, filterValue: e.target.value }
                                      : ap,
                                  ),
                                },
                          ),
                        )
                      }
                      style={{ minHeight: 32, minWidth: 260 }}
                    >
                      <option value="">(none)</option>
                      {filterValueOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setStatisticPolicies((prev) =>
                    prev.map((p) =>
                      p.id !== policy.id || p.statisticName !== "mean"
                        ? p
                        : {
                            ...p,
                            allowedPaths: [
                              ...p.allowedPaths,
                              {
                                id: makeId("allowed"),
                                graphPath: createEmptyGraphPath(),
                                minValues: 1,
                                filterValue: "",
                              },
                            ],
                          },
                    ),
                  )
                }
              >
                Add allowed path
              </button>
            </div>
          ) : (
            <div>
              <GraphPathInput
                label="Cohort path"
                value={policy.cohortPath}
                predicateOptions={predicateOptions}
                onChange={(next) =>
                  setStatisticPolicies((prev) =>
                    prev.map((p) =>
                      p.id === policy.id && p.statisticName === "kaplan-meier"
                        ? { ...p, cohortPath: next }
                        : p,
                    ),
                  )
                }
              />
              <GraphPathInput
                label="Event path"
                value={policy.eventPath}
                predicateOptions={predicateOptions}
                onChange={(next) =>
                  setStatisticPolicies((prev) =>
                    prev.map((p) =>
                      p.id === policy.id && p.statisticName === "kaplan-meier"
                        ? { ...p, eventPath: next }
                        : p,
                    ),
                  )
                }
              />
              <GraphPathInput
                label="Time path"
                value={policy.timePath}
                predicateOptions={predicateOptions}
                onChange={(next) =>
                  setStatisticPolicies((prev) =>
                    prev.map((p) =>
                      p.id === policy.id && p.statisticName === "kaplan-meier"
                        ? { ...p, timePath: next }
                        : p,
                    ),
                  )
                }
              />
            </div>
          )}
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.key}>Term policy schemas (ShexJ)</Text>
        {Object.entries(termPolicySchemas).map(([name, schema]) => (
          <View key={name} style={styles.schemaBlock}>
            <Text style={styles.key}>{name} statistic plugin</Text>
            <Text style={styles.schema} selectable>
              {JSON.stringify(schema, null, 2)}
            </Text>
          </View>
        ))}
      </View>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={save} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Term Policy"}
        </button>
      </div>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  key: { fontWeight: "600", marginBottom: 8 },
  schemaBlock: { marginBottom: 12 },
  schema: { fontSize: 12, fontFamily: "monospace" },
  error: { color: "red", marginBottom: 8 },
  success: { color: "green", marginBottom: 8 },
});

