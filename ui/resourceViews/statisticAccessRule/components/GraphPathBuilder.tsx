import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Button, Text } from "linked-data-browser";
import type { GraphNodeFilter, GraphPath } from "@fedresda/types";
import type {
  StartPredicateOptionGetter,
  StartValueOptionGetter,
  StepPredicateOptionGetter,
  StepTargetShapeNameGetter,
  StepWherePredicateOptionGetter,
  StepWhereValueOptionGetter,
} from "../utils/graphPathOptionResolver";

type Props = {
  value: GraphPath;
  predicateOptions: string[];
  getStartPredicateOptions: StartPredicateOptionGetter;
  getStartValueOptions: StartValueOptionGetter;
  getStepPredicateOptions: StepPredicateOptionGetter;
  getStepWherePredicateOptions: StepWherePredicateOptionGetter;
  getStepWhereValueOptions: StepWhereValueOptionGetter;
  getStepTargetShapeNames: StepTargetShapeNameGetter;
  onChange: (next: GraphPath) => void;
};

function parseGraphPath(value: string): GraphPath | null {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    if (!("start" in parsed)) return null;
    return parsed as GraphPath;
  } catch {
    return null;
  }
}

type IriObject = { "@id": string };

function toCollectionArray<T>(value: T | T[] | Iterable<T> | undefined): T[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value as T];
  if (typeof value === "object" && Symbol.iterator in (value as object)) {
    return Array.from(value as Iterable<T>);
  }
  return [value as T];
}

function getIriValue(value: string | IriObject | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value["@id"] === "string") {
    return value["@id"];
  }
  return undefined;
}

function getSimpleWhereFilters(nodeFilter: GraphNodeFilter | undefined): Array<{ predicate: string }> {
  return toCollectionArray(nodeFilter?.predicates).flatMap((filter) => {
    const predicate = getIriValue(filter.predicate as string | IriObject | undefined);
    return predicate ? [{ predicate }] : [];
  });
}

export function GraphPathBuilder({
  value,
  predicateOptions,
  getStartPredicateOptions,
  getStartValueOptions,
  getStepPredicateOptions,
  getStepWherePredicateOptions,
  getStepWhereValueOptions,
  getStepTargetShapeNames,
  onChange,
}: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          padding: 10,
          backgroundColor: colors.card,
        },
        title: {
          marginBottom: 8,
          fontWeight: "600",
        },
        codeInput: {
          minHeight: 160,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 10,
          backgroundColor: colors.background,
          color: colors.text,
          fontFamily: "monospace",
          fontSize: 12,
          textAlignVertical: "top",
        },
        actions: {
          marginTop: 8,
          flexDirection: "row",
          gap: 8,
          flexWrap: "wrap",
        },
        meta: {
          marginTop: 8,
          fontSize: 12,
          opacity: 0.75,
        },
        error: {
          marginTop: 6,
          color: colors.notification,
          fontSize: 12,
        },
      }),
    [colors.background, colors.border, colors.card, colors.notification, colors.text],
  );

  const [jsonDraft, setJsonDraft] = React.useState(() => JSON.stringify(value, null, 2));
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setJsonDraft(JSON.stringify(value, null, 2));
  }, [value]);

  const steps = toCollectionArray(value.steps);
  const startWhere = getSimpleWhereFilters(value.start);
  const firstStepWhere = getSimpleWhereFilters(steps[0]?.where as GraphNodeFilter | undefined);
  const startPredicates = getStartPredicateOptions(value).length;
  const firstStepPredicates = steps.length > 0 ? getStepPredicateOptions(value, 0).length : 0;
  const firstStepWherePredicates =
    steps.length > 0 ? getStepWherePredicateOptions(value, 0).length : 0;
  const firstStepWhereValues =
    steps.length > 0 && firstStepWhere[0]?.predicate
      ? getStepWhereValueOptions(value, 0, firstStepWhere[0].predicate).length
      : 0;
  const firstStepShapes = steps.length > 0 ? getStepTargetShapeNames(value, 0).length : 0;
  const firstStartValueOptions =
    startWhere[0]?.predicate
      ? getStartValueOptions(value, startWhere[0].predicate).length
      : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Graph Path (Advanced)</Text>
      <TextInput
        value={jsonDraft}
        onChangeText={(nextValue) => {
          setJsonDraft(nextValue);
          const parsed = parseGraphPath(nextValue);
          if (!parsed) {
            setJsonError("Invalid graph path JSON");
            return;
          }
          setJsonError(null);
          onChange(parsed);
        }}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        style={styles.codeInput}
      />
      {jsonError ? <Text style={styles.error}>{jsonError}</Text> : null}
      <View style={styles.actions}>
        <Button
          text="Format JSON"
          variant="secondary"
          onPress={() => {
            const parsed = parseGraphPath(jsonDraft);
            if (!parsed) {
              setJsonError("Invalid graph path JSON");
              return;
            }
            setJsonError(null);
            setJsonDraft(JSON.stringify(parsed, null, 2));
          }}
        />
      </View>
      <Text style={styles.meta}>
        predicates: {predicateOptions.length} | start predicates: {startPredicates} | start values:{" "}
        {firstStartValueOptions} | step predicates: {firstStepPredicates} | step where predicates:{" "}
        {firstStepWherePredicates} | step where values: {firstStepWhereValues} | step target shapes:{" "}
        {firstStepShapes}
      </Text>
    </View>
  );
}
