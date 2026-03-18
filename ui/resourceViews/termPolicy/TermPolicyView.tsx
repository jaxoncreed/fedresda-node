import React, { FunctionComponent } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Button, LoadingBar, Text, useViewContext } from "linked-data-browser";
import { useSolidAuth } from "@ldo/solid-react";
import { useTermPolicyEditorData } from "./hooks/useTermPolicyEditorData";
import { TermPolicyEditorForm } from "./components/TermPolicyEditorForm";

function getDataDocumentUri(termPolicyUri: string | undefined): string | undefined {
  if (!termPolicyUri) return undefined;
  return termPolicyUri.replace(".term-policy.", ".");
}

export const TermPolicyView: FunctionComponent = () => {
  const { targetUri } = useViewContext();
  const { fetch } = useSolidAuth();
  const { colors } = useTheme();
  const editor = useTermPolicyEditorData(fetch, targetUri);
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        header: {
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        },
        headerTextWrap: {
          flexShrink: 1,
        },
        titleRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        },
        title: {
          fontWeight: "700",
          letterSpacing: 0.2,
        },
        documentLink: {
          paddingVertical: 2,
          alignSelf: "flex-start",
        },
        documentLinkText: {
          color: colors.primary,
          textDecorationLine: "underline",
          fontWeight: "700",
        },
        dataType: {
          marginTop: 4,
          opacity: 0.75,
          fontSize: 14,
        },
        saveButton: {
          alignSelf: "center",
        },
        saveButtonDisabled: {
          opacity: 0.5,
        },
        scroll: {
          flex: 1,
        },
        content: {
          padding: 16,
          paddingBottom: 40,
        },
      }),
    [colors.background, colors.border, colors.primary],
  );

  if (editor.isLoading) {
    return (
      <View style={styles.container}>
        <LoadingBar isLoading />
      </View>
    );
  }

  const dataDocumentUri = getDataDocumentUri(editor.termPolicyUri);
  const dataDocumentName = dataDocumentUri?.split("/").pop() ?? "document.ttl";
  const isSaveDisabled = editor.isSaving || !editor.isDirty;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <View style={styles.titleRow}>
            <Text variant="h2" style={styles.title}>Term Policy for</Text>
            <Pressable
              style={styles.documentLink}
              onPress={() => {
                if (dataDocumentUri) {
                  Linking.openURL(dataDocumentUri);
                }
              }}
            >
              <Text variant="h2" style={{ ...styles.title, ...styles.documentLinkText }}>
                {dataDocumentName}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.dataType}>Data Type: {editor.dataSchemaName ?? "Unknown"}</Text>
        </View>
        <Button
          text={editor.isSaving ? "Saving..." : "Save Term Policy"}
          variant="default"
          style={[styles.saveButton, isSaveDisabled ? styles.saveButtonDisabled : undefined]}
          onPress={() => {
            if (!isSaveDisabled) {
              void editor.save();
            }
          }}
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TermPolicyEditorForm
          error={editor.error}
          saveMessage={editor.saveMessage}
          dataSchemaName={editor.dataSchemaName}
          termPolicySchemas={editor.termPolicySchemas}
          statisticPolicies={editor.statisticPolicies}
          setStatisticPolicies={editor.setStatisticPolicies}
          statisticNames={editor.statisticNames}
          addStatisticPolicyByName={editor.addStatisticPolicyByName}
          predicateOptions={editor.predicateOptions}
          graphPathShortcuts={editor.graphPathShortcuts}
          getStartPredicateOptions={editor.getStartPredicateOptions}
          getStartValueOptions={editor.getStartValueOptions}
          getStepPredicateOptions={editor.getStepPredicateOptions}
          getStepWherePredicateOptions={editor.getStepWherePredicateOptions}
          getStepWhereValueOptions={editor.getStepWhereValueOptions}
          getStepTargetShapeNames={editor.getStepTargetShapeNames}
        />
      </ScrollView>
    </View>
  );
};
