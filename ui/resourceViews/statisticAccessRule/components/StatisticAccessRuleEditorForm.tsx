import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Button, Text } from "linked-data-browser";
import type {
  GraphPathForm,
  StatisticPolicy,
  StatisticAccessRuleObjectValue,
  StatisticAccessRuleScalarValue,
  StatisticAccessRuleSchemas,
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
} from "../utils/statisticAccessRuleSchemaForm";
import { GraphPathBuilder } from "./GraphPathBuilder";
import {
  instantiateGraphPathShortcut,
  resolveGraphPathShortcut,
  type GraphPathShortcut,
} from "../../../graphPathShortcuts";

type Props = {
  error: string | null;
  saveMessage: string | null;
  dataSchemaName: string | null;
  statisticAccessRuleSchemas: StatisticAccessRuleSchemas;
  statisticPolicies: StatisticPolicy[];
  setStatisticPolicies: React.Dispatch<React.SetStateAction<StatisticPolicy[]>>;
  statisticNames: string[];
  addStatisticPolicyByName: (name: string) => void;
  predicateOptions: string[];
  graphPathShortcuts: GraphPathShortcut[];
  getStartPredicateOptions: StartPredicateOptionGetter;
  getStartValueOptions: StartValueOptionGetter;
  getStepPredicateOptions: StepPredicateOptionGetter;
  getStepWherePredicateOptions: StepWherePredicateOptionGetter;
  getStepWhereValueOptions: StepWhereValueOptionGetter;
  getStepTargetShapeNames: StepTargetShapeNameGetter;
};

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

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    error: { color: colors.notification, marginBottom: 8 },
    success: { color: colors.primary, marginBottom: 8 },
    countText: { fontSize: 12, opacity: 0.7, marginBottom: 8, color: colors.text },
    policyCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      backgroundColor: colors.card,
    },
    policyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    policyHeaderTextWrap: {
      flexShrink: 1,
      gap: 2,
    },
    policyTitle: { fontWeight: "600" },
    policyMeta: { fontSize: 12, opacity: 0.7 },
    policyActions: { alignItems: "flex-end", gap: 4 },
    policyBody: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 10,
      paddingTop: 10,
    },
    expandHint: { fontSize: 12, opacity: 0.65 },
    block: { marginBottom: 12 },
    sectionLabel: { fontWeight: "600", marginBottom: 8 },
    fieldWrapper: { marginBottom: 10 },
    fieldLabel: { marginBottom: 6, fontWeight: "600", fontSize: 13 },
    nestedCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
      backgroundColor: colors.background,
    },
    nestedHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    nestedTitle: { fontWeight: "600" },
    input: {
      minHeight: 36,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: colors.background,
      color: colors.text,
    },
    switchRow: { alignSelf: "flex-start" },
    repeatedItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    repeatedInputWrap: {
      flex: 1,
    },
    addPolicyRow: {
      marginTop: 6,
      marginBottom: 12,
      alignSelf: "flex-start",
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: colors.background,
    },
    menuCard: {
      width: "100%",
      maxWidth: 420,
      maxHeight: 360,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.card,
      padding: 8,
    },
    menuItem: {
      marginBottom: 6,
    },
    inlineRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    selectedPathText: {
      opacity: 0.78,
    },
  });
}

function renderScalarInput(
  value: StatisticAccessRuleScalarValue,
  field: SchemaFieldDefinition,
  onChange: (next: StatisticAccessRuleScalarValue) => void,
  styles: ReturnType<typeof createStyles>,
) {
  if (field.type === "integer") {
    return (
      <TextInput
        value={String(typeof value === "number" ? value : Number(value || 1))}
        onChangeText={(nextValue) => {
          const asNumber = Math.max(1, Number(nextValue || "1"));
          onChange(Number.isFinite(asNumber) ? asNumber : 1);
        }}
        keyboardType="numeric"
        style={styles.input}
      />
    );
  }
  if (field.type === "boolean") {
    return (
      <View style={styles.switchRow}>
        <Switch value={Boolean(value)} onValueChange={(nextValue) => onChange(nextValue)} />
      </View>
    );
  }
  return (
    <TextInput
      value={typeof value === "string" ? value : String(value ?? "")}
      onChangeText={(nextValue) => onChange(nextValue)}
      style={styles.input}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

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
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [isShortcutMenuOpen, setIsShortcutMenuOpen] = React.useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);
  const matchedShortcut = resolveGraphPathShortcut(dataSchemaName, graphPathValue);

  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.inlineRow}>
        <Text style={styles.selectedPathText}>
          {matchedShortcut ? `${matchedShortcut.name} - ${matchedShortcut.label}` : "Custom"}
        </Text>
        <Button text="Choose path" variant="secondary" onPress={() => setIsShortcutMenuOpen(true)} />
        <Button
          text={isAdvancedOpen ? "Hide advanced" : "Advanced"}
          variant="secondary"
          onPress={() => setIsAdvancedOpen((prev) => !prev)}
        />
      </View>

      <Modal visible={isShortcutMenuOpen} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setIsShortcutMenuOpen(false)}>
          <Pressable style={styles.menuCard}>
            <ScrollView>
              {graphPathShortcuts.map((shortcut) => (
                <Button
                  key={shortcut.name}
                  text={`${shortcut.name} - ${shortcut.label}`}
                  variant="secondary"
                  style={styles.menuItem}
                  onPress={() => {
                    onChange(instantiateGraphPathShortcut(shortcut));
                    setIsShortcutMenuOpen(false);
                  }}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
    </View>
  );
}

export function StatisticAccessRuleEditorForm({
  error,
  saveMessage,
  dataSchemaName,
  statisticAccessRuleSchemas,
  statisticPolicies,
  setStatisticPolicies,
  statisticNames,
  addStatisticPolicyByName,
  predicateOptions,
  graphPathShortcuts,
  getStartPredicateOptions,
  getStartValueOptions,
  getStepPredicateOptions,
  getStepWherePredicateOptions,
  getStepWhereValueOptions,
  getStepTargetShapeNames,
}: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [expandedPolicyIds, setExpandedPolicyIds] = React.useState<Record<string, boolean>>({});
  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);
  const updatePolicy = (id: string, updater: (policy: StatisticPolicy) => StatisticPolicy) =>
    setStatisticPolicies((prev) => prev.map((policy) => (policy.id === id ? updater(policy) : policy)));

  return (
    <View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saveMessage ? <Text style={styles.success}>{saveMessage}</Text> : null}
      <Text style={styles.countText}>
        {statisticPolicies.length} {statisticPolicies.length === 1 ? "policy" : "policies"}
      </Text>

      {statisticPolicies.map((policy, policyIndex) => {
        const schema = statisticAccessRuleSchemas[policy.statisticName];
        const fields = schema ? getPolicyFieldDefinitions(schema) : [];
        const objectFieldCount = fields.reduce((count, field) => {
          if (field.type !== "object") return count;
          const fieldValue = policy.values[field.key];
          return count + (Array.isArray(fieldValue) ? fieldValue.length : 0);
        }, 0);
        const isExpanded = Boolean(expandedPolicyIds[policy.id]);

        return (
          <View key={policy.id} style={styles.policyCard}>
            <Pressable
              onPress={() =>
                setExpandedPolicyIds((prev) => ({ ...prev, [policy.id]: !prev[policy.id] }))
              }
              style={styles.policyHeader}
            >
              <View style={styles.policyHeaderTextWrap}>
                <Text style={styles.policyTitle}>{policyIndex + 1}. {policy.statisticName}</Text>
                <Text style={styles.policyMeta}>
                  {objectFieldCount} {objectFieldCount === 1 ? "allowed path" : "allowed paths"}
                </Text>
              </View>
              <View style={styles.policyActions}>
                <Button
                  text="Remove"
                  variant="secondary"
                  onPress={() =>
                    setStatisticPolicies((prev) => prev.filter((entry) => entry.id !== policy.id))
                  }
                />
                <Text style={styles.expandHint}>{isExpanded ? "Collapse" : "Expand"}</Text>
              </View>
            </Pressable>

            {isExpanded ? (
              <View style={styles.policyBody}>
                {fields.map((field) => {
                  const fieldValue = policy.values[field.key];

                  if (field.type === "object") {
                    const objects = Array.isArray(fieldValue)
                      ? (fieldValue as StatisticAccessRuleObjectValue[])
                      : [];
                    return (
                      <View key={field.key} style={styles.block}>
                        <Text style={styles.sectionLabel}>{field.label}</Text>
                        {objects.map((item, itemIndex) => (
                          <View key={item.id} style={styles.nestedCard}>
                            <View style={styles.nestedHeader}>
                              <Text style={styles.nestedTitle}>{field.label} {itemIndex + 1}</Text>
                              <Button
                                text="Remove"
                                variant="secondary"
                                onPress={() =>
                                  updatePolicy(policy.id, (entry) => ({
                                    ...entry,
                                    values: { ...entry.values, [field.key]: objects.filter((x) => x.id !== item.id) },
                                  }))
                                }
                              />
                            </View>
                            {(field.nestedFields ?? []).map((nestedField) => {
                              const nestedValue = item.values[nestedField.key];
                              if (nestedField.type === "graphPath") {
                                return (
                                  <View key={nestedField.key} style={styles.fieldWrapper}>
                                    <Text style={styles.fieldLabel}>{nestedField.label}</Text>
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
                                  </View>
                                );
                              }
                              if (nestedField.type === "object") return null;
                              return (
                                <View key={nestedField.key} style={styles.fieldWrapper}>
                                  <Text style={styles.fieldLabel}>{nestedField.label}</Text>
                                  {renderScalarInput(
                                    (nestedValue as StatisticAccessRuleScalarValue) ?? "",
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
                                    styles,
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        ))}
                        <Button
                          text={`Add ${field.label}`}
                          variant="secondary"
                          onPress={() =>
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
                        />
                      </View>
                    );
                  }

                  if (field.type === "graphPath") {
                    return (
                      <View key={field.key} style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>{field.label}</Text>
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
                      </View>
                    );
                  }

                  if (field.repeated) {
                    const values = Array.isArray(fieldValue)
                      ? (fieldValue as StatisticAccessRuleScalarValue[])
                      : [];
                    return (
                      <View key={field.key} style={styles.block}>
                        <Text style={styles.sectionLabel}>{field.label}</Text>
                        {values.map((itemValue, itemIndex) => (
                          <View key={`${field.key}-${itemIndex}`} style={styles.repeatedItem}>
                            <View style={styles.repeatedInputWrap}>
                              {renderScalarInput(
                                itemValue,
                                field,
                                (nextValue) =>
                                  updatePolicy(policy.id, (entry) => ({
                                    ...entry,
                                    values: {
                                      ...entry.values,
                                      [field.key]: values.map((v, idx) => (idx === itemIndex ? nextValue : v)),
                                    },
                                  })),
                                styles,
                              )}
                            </View>
                            <Button
                              text="Remove"
                              variant="secondary"
                              onPress={() =>
                                updatePolicy(policy.id, (entry) => ({
                                  ...entry,
                                  values: {
                                    ...entry.values,
                                    [field.key]: values.filter((_, idx) => idx !== itemIndex),
                                  },
                                }))
                              }
                            />
                          </View>
                        ))}
                        <Button
                          text={`Add ${field.label}`}
                          variant="secondary"
                          onPress={() =>
                            updatePolicy(policy.id, (entry) => ({
                              ...entry,
                              values: {
                                ...entry.values,
                                [field.key]: [...values, field.type === "integer" ? 1 : field.type === "boolean" ? false : ""],
                              },
                            }))
                          }
                        />
                      </View>
                    );
                  }

                  return (
                    <View key={field.key} style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      {renderScalarInput(
                        (fieldValue as StatisticAccessRuleScalarValue) ?? "",
                        field,
                        (nextValue) =>
                          updatePolicy(policy.id, (entry) => ({
                            ...entry,
                            values: { ...entry.values, [field.key]: nextValue },
                          })),
                        styles,
                      )}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}

      <View style={styles.addPolicyRow}>
        <Button
          text="Add statistic plugin policy"
          variant="secondary"
          onPress={() => setIsAddMenuOpen(true)}
        />
      </View>

      <Modal visible={isAddMenuOpen} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setIsAddMenuOpen(false)}>
          <Pressable style={styles.menuCard}>
            <ScrollView>
              {statisticNames.map((name) => (
                <Button
                  key={name}
                  text={name}
                  variant="secondary"
                  style={styles.menuItem}
                  onPress={() => {
                    addStatisticPolicyByName(name);
                    setIsAddMenuOpen(false);
                  }}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
