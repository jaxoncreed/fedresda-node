import React from "react";
import { Database, Plus, Save, Trash2 } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "linked-data-browser";
import type {
  GraphPathForm,
  StatisticPolicy,
  TermPolicyObjectValue,
  TermPolicyScalarValue,
  TermPolicySchemas,
} from "../types";
import { createEmptyGraphPath, makeId } from "../types";
import type {
  StartPredicateOptionGetter,
  StartValueOptionGetter,
  StepPredicateOptionGetter,
  StepTargetShapeNameGetter,
  StepWherePredicateOptionGetter,
  StepWhereValueOptionGetter,
} from "../utils/graphPathOptionResolver";
import {
  getGraphPathFromValue,
  getPolicyFieldDefinitions,
  type SchemaFieldDefinition,
} from "../utils/termPolicySchemaForm";
import { GraphPathBuilder } from "./GraphPathBuilder.web";
import {
  findGraphPathShortcutByName,
  instantiateGraphPathShortcut,
  resolveGraphPathShortcut,
  type GraphPathShortcut,
} from "../../../graphPathShortcuts";

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
  graphPathShortcuts: GraphPathShortcut[];
  getStartPredicateOptions: StartPredicateOptionGetter;
  getStartValueOptions: StartValueOptionGetter;
  getStepPredicateOptions: StepPredicateOptionGetter;
  getStepWherePredicateOptions: StepWherePredicateOptionGetter;
  getStepWhereValueOptions: StepWhereValueOptionGetter;
  getStepTargetShapeNames: StepTargetShapeNameGetter;
  isDirty: boolean;
  addStatisticPolicy: () => void;
  save: () => Promise<void>;
  isSaving: boolean;
};

const separator = { borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 12, marginBottom: 12 };
const policyCard = {
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
  backgroundColor: "rgba(255,255,255,0.92)",
};
const labelCell = { fontSize: 13, fontWeight: 500 };
const textInputBase = {
  minHeight: 34,
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,0.16)",
  padding: "0 10px",
  backgroundColor: "white",
};
const actionBtn = {
  minHeight: 32,
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,0.12)",
  padding: "0 10px",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  backgroundColor: "rgba(0,0,0,0.02)",
};
const rowStyle = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: 8,
  marginBottom: 10,
  alignItems: "center",
};

const graphPathSelectStyle = {
  ...textInputBase,
  width: "100%",
  minHeight: 36,
};

function renderScalarInput(
  value: TermPolicyScalarValue,
  field: SchemaFieldDefinition,
  onChange: (next: TermPolicyScalarValue) => void,
) {
  if (field.type === "integer") {
    return (
      <input
        type="number"
        min={1}
        value={typeof value === "number" ? value : Number(value || 1)}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value || "1")))}
        style={textInputBase}
      />
    );
  }
  if (field.type === "boolean") {
    return <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />;
  }
  return (
    <input
      type="text"
      value={typeof value === "string" ? value : String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      style={textInputBase}
    />
  );
}

type GraphPathFieldEditorProps = {
  dataSchemaName: string | null;
  graphPathValue: GraphPathForm;
  graphPathShortcuts: GraphPathShortcut[];
  predicateOptions: string[];
  getStartPredicateOptions: StartPredicateOptionGetter;
  getStartValueOptions: StartValueOptionGetter;
  getStepPredicateOptions: StepPredicateOptionGetter;
  getStepWherePredicateOptions: StepWherePredicateOptionGetter;
  getStepWhereValueOptions: StepWhereValueOptionGetter;
  getStepTargetShapeNames: StepTargetShapeNameGetter;
  onChange: (nextGraphPath: GraphPathForm) => void;
};

function GraphPathFieldEditor({
  dataSchemaName,
  graphPathValue,
  graphPathShortcuts,
  predicateOptions,
  getStartPredicateOptions,
  getStartValueOptions,
  getStepPredicateOptions,
  getStepWherePredicateOptions,
  getStepWhereValueOptions,
  getStepTargetShapeNames,
  onChange,
}: GraphPathFieldEditorProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);
  const matchedShortcut = resolveGraphPathShortcut(dataSchemaName, graphPathValue);
  const selectedShortcutName = matchedShortcut?.name ?? "__custom__";

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <select
          value={selectedShortcutName}
          onChange={(e) => {
            const nextShortcut = findGraphPathShortcutByName(dataSchemaName, e.target.value);
            if (!nextShortcut) {
              setIsAdvancedOpen(true);
              return;
            }
            onChange(instantiateGraphPathShortcut(nextShortcut));
          }}
          style={graphPathSelectStyle}
        >
          {graphPathShortcuts.map((shortcut) => (
            <option key={shortcut.name} value={shortcut.name}>
              {shortcut.name} - {shortcut.label}
            </option>
          ))}
          <option value="__custom__">Custom (advanced)</option>
        </select>
        <button
          type="button"
          style={actionBtn}
          onClick={() => setIsAdvancedOpen((prev) => !prev)}
        >
          {isAdvancedOpen ? "Hide advanced" : "Advanced"}
        </button>
      </div>
      {selectedShortcutName === "__custom__" ? (
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
          This path is custom and does not match a saved shortcut.
        </div>
      ) : null}
      {isAdvancedOpen ? (
        <GraphPathBuilder
          value={graphPathValue}
          predicateOptions={predicateOptions}
          getStartPredicateOptions={getStartPredicateOptions}
          getStartValueOptions={getStartValueOptions}
          getStepPredicateOptions={getStepPredicateOptions}
          getStepWherePredicateOptions={getStepWherePredicateOptions}
          getStepWhereValueOptions={getStepWhereValueOptions}
          getStepTargetShapeNames={getStepTargetShapeNames}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}

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
  graphPathShortcuts,
  getStartPredicateOptions,
  getStartValueOptions,
  getStepPredicateOptions,
  getStepWherePredicateOptions,
  getStepWhereValueOptions,
  getStepTargetShapeNames,
  isDirty,
  addStatisticPolicy,
  save,
  isSaving,
}: Props) {
  const updatePolicy = (id: string, updater: (policy: StatisticPolicy) => StatisticPolicy) =>
    setStatisticPolicies((prev) => prev.map((policy) => (policy.id === id ? updater(policy) : policy)));

  return (
    <>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saveMessage ? <Text style={styles.success}>{saveMessage}</Text> : null}

      <div style={separator}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Database size={16} color="currentColor" />
          <strong>Data schema</strong>
        </div>
        <div style={{ marginTop: 6, opacity: 0.8 }}>{dataSchemaName ?? "not configured"}</div>
      </div>

      <div style={separator}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Add statistic plugin policy</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={newStatisticName}
            onChange={(e) => setNewStatisticName(e.target.value)}
            style={{ ...textInputBase, minWidth: 220 }}
          >
            {statisticNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button type="button" onClick={addStatisticPolicy} style={actionBtn}>
            <Plus size={14} color="currentColor" />
            Add
          </button>
        </div>
      </div>

      {statisticPolicies.length > 0 ? (
        <div style={{ marginBottom: 8, fontSize: 12, letterSpacing: 0.4, opacity: 0.7 }}>
          STATISTIC PLUGIN POLICIES
        </div>
      ) : null}

      {statisticPolicies.map((policy, policyIndex) => {
        const schema = termPolicySchemas[policy.statisticName];
        const fields = schema ? getPolicyFieldDefinitions(schema) : [];
        return (
          <div key={policy.id} style={policyCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={styles.key}>{policyIndex + 1}. {policy.statisticName}</Text>
              <button
                type="button"
                style={actionBtn}
                onClick={() => setStatisticPolicies((prev) => prev.filter((entry) => entry.id !== policy.id))}
              >
                <Trash2 size={14} color="currentColor" />
                Remove
              </button>
            </div>

            {fields.map((field) => {
              const fieldValue = policy.values[field.key];

              if (field.type === "object") {
                const objects = Array.isArray(fieldValue) ? (fieldValue as TermPolicyObjectValue[]) : [];
                return (
                  <div key={field.key} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{field.label}</div>
                    {objects.map((item, itemIndex) => (
                      <div key={item.id} style={{ ...separator, marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div>{field.label} {itemIndex + 1}</div>
                          <button
                            type="button"
                            style={actionBtn}
                            onClick={() =>
                              updatePolicy(policy.id, (entry) => ({
                                ...entry,
                                values: { ...entry.values, [field.key]: objects.filter((x) => x.id !== item.id) },
                              }))
                            }
                          >
                            <Trash2 size={14} color="currentColor" />
                            Remove
                          </button>
                        </div>
                        {(field.nestedFields ?? []).map((nestedField) => {
                          const nestedValue = item.values[nestedField.key];
                          if (nestedField.type === "graphPath") {
                            return (
                              <div key={nestedField.key} style={rowStyle}>
                                <label style={labelCell}>{nestedField.label}</label>
                                <GraphPathFieldEditor
                                  dataSchemaName={dataSchemaName}
                                  graphPathValue={getGraphPathFromValue(nestedValue)}
                                  graphPathShortcuts={graphPathShortcuts}
                                  predicateOptions={predicateOptions}
                                  getStartPredicateOptions={getStartPredicateOptions}
                                  getStartValueOptions={getStartValueOptions}
                                  getStepPredicateOptions={getStepPredicateOptions}
                                  getStepWherePredicateOptions={getStepWherePredicateOptions}
                                  getStepWhereValueOptions={getStepWhereValueOptions}
                                  getStepTargetShapeNames={getStepTargetShapeNames}
                                  onChange={(nextGraphPath: GraphPathForm) =>
                                    updatePolicy(policy.id, (entry) => ({
                                      ...entry,
                                      values: {
                                        ...entry.values,
                                        [field.key]: objects.map((x) =>
                                          x.id !== item.id
                                            ? x
                                            : {
                                                ...x,
                                                values: { ...x.values, [nestedField.key]: nextGraphPath },
                                              },
                                        ),
                                      },
                                    }))
                                  }
                                />
                              </div>
                            );
                          }
                          if (nestedField.type === "object") return null;
                          return (
                            <div key={nestedField.key} style={{ ...rowStyle }}>
                              <label style={labelCell}>{nestedField.label}</label>
                              {renderScalarInput(
                                (nestedValue as TermPolicyScalarValue) ?? "",
                                nestedField,
                                (nextValue) =>
                                  updatePolicy(policy.id, (entry) => ({
                                    ...entry,
                                    values: {
                                      ...entry.values,
                                      [field.key]: objects.map((x) =>
                                        x.id !== item.id
                                          ? x
                                          : { ...x, values: { ...x.values, [nestedField.key]: nextValue } },
                                      ),
                                    },
                                  })),
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <button
                      type="button"
                      style={actionBtn}
                      onClick={() =>
                        updatePolicy(policy.id, (entry) => ({
                          ...entry,
                          values: {
                            ...entry.values,
                            [field.key]: [
                              ...objects,
                              {
                                id: makeId("item"),
                                values: Object.fromEntries(
                                  (field.nestedFields ?? []).map((nestedField) => [
                                    nestedField.key,
                                    nestedField.type === "graphPath"
                                      ? createEmptyGraphPath()
                                      : nestedField.type === "integer"
                                        ? 1
                                        : nestedField.type === "boolean"
                                          ? false
                                          : "",
                                  ]),
                                ),
                              },
                            ],
                          },
                        }))
                      }
                    >
                      <Plus size={14} color="currentColor" />
                      Add {field.label}
                    </button>
                  </div>
                );
              }

              if (field.type === "graphPath") {
                return (
                  <div key={field.key} style={rowStyle}>
                    <label style={labelCell}>{field.label}</label>
                    <GraphPathFieldEditor
                      dataSchemaName={dataSchemaName}
                      graphPathValue={getGraphPathFromValue(fieldValue)}
                      graphPathShortcuts={graphPathShortcuts}
                      predicateOptions={predicateOptions}
                      getStartPredicateOptions={getStartPredicateOptions}
                      getStartValueOptions={getStartValueOptions}
                      getStepPredicateOptions={getStepPredicateOptions}
                      getStepWherePredicateOptions={getStepWherePredicateOptions}
                      getStepWhereValueOptions={getStepWhereValueOptions}
                      getStepTargetShapeNames={getStepTargetShapeNames}
                      onChange={(nextGraphPath: GraphPathForm) =>
                        updatePolicy(policy.id, (entry) => ({
                          ...entry,
                          values: { ...entry.values, [field.key]: nextGraphPath },
                        }))
                      }
                    />
                  </div>
                );
              }

              if (field.repeated) {
                const values = Array.isArray(fieldValue) ? (fieldValue as TermPolicyScalarValue[]) : [];
                return (
                  <div key={field.key} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{field.label}</div>
                    {values.map((itemValue, itemIndex) => (
                      <div key={`${field.key}-${itemIndex}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginBottom: 8 }}>
                        {renderScalarInput(itemValue, field, (nextValue) =>
                          updatePolicy(policy.id, (entry) => ({
                            ...entry,
                            values: {
                              ...entry.values,
                              [field.key]: values.map((v, idx) => (idx === itemIndex ? nextValue : v)),
                            },
                          })),
                        )}
                        <button
                          type="button"
                          style={actionBtn}
                          onClick={() =>
                            updatePolicy(policy.id, (entry) => ({
                              ...entry,
                              values: {
                                ...entry.values,
                                [field.key]: values.filter((_, idx) => idx !== itemIndex),
                              },
                            }))
                          }
                        >
                          <Trash2 size={14} color="currentColor" />
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      style={actionBtn}
                      onClick={() =>
                        updatePolicy(policy.id, (entry) => ({
                          ...entry,
                          values: {
                            ...entry.values,
                            [field.key]: [...values, field.type === "integer" ? 1 : field.type === "boolean" ? false : ""],
                          },
                        }))
                      }
                    >
                      <Plus size={14} color="currentColor" />
                      Add {field.label}
                    </button>
                  </div>
                );
              }

              return (
                <div key={field.key} style={rowStyle}>
                  <label style={labelCell}>{field.label}</label>
                  {renderScalarInput(
                    (fieldValue as TermPolicyScalarValue) ?? "",
                    field,
                    (nextValue) =>
                      updatePolicy(policy.id, (entry) => ({
                        ...entry,
                        values: { ...entry.values, [field.key]: nextValue },
                      })),
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <div
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 20,
          backgroundColor: "rgba(255,255,255,0.96)",
          borderTop: "1px solid rgba(0,0,0,0.1)",
          paddingTop: 10,
          marginTop: 14,
        }}
      >
        <button
          type="button"
          onClick={save}
          disabled={isSaving || !isDirty}
          style={{
            ...actionBtn,
            opacity: isSaving || !isDirty ? 0.5 : 1,
            cursor: isSaving || !isDirty ? "not-allowed" : "pointer",
          }}
        >
          <Save size={14} color="currentColor" />
          {isSaving ? "Saving..." : "Save Term Policy"}
        </button>
      </div>
    </>
  );
}

const styles = StyleSheet.create({
  key: { fontWeight: "600" },
  error: { color: "red", marginBottom: 8 },
  success: { color: "green", marginBottom: 8 },
});
