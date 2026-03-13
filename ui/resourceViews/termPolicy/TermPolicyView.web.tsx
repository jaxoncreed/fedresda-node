import React, { FunctionComponent } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { LoadingBar, Text, useViewContext } from "linked-data-browser";
import { useSolidAuth } from "@ldo/solid-react";
import { useTermPolicyEditorData } from "./hooks/useTermPolicyEditorData";
import { TermPolicyEditorForm } from "./components/TermPolicyEditorForm.web";

export const TermPolicyView: FunctionComponent = () => {
  const { targetUri } = useViewContext();
  const { fetch } = useSolidAuth();
  const editor = useTermPolicyEditorData(fetch, targetUri);

  if (editor.isLoading) {
    return (
      <View style={styles.container}>
        <LoadingBar isLoading />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h1" style={styles.title}>
        Term Policy Editor
      </Text>
      <TermPolicyEditorForm
        error={editor.error}
        saveMessage={editor.saveMessage}
        dataSchemaName={editor.dataSchemaName}
        termPolicySchemas={editor.termPolicySchemas}
        statisticPolicies={editor.statisticPolicies}
        setStatisticPolicies={editor.setStatisticPolicies}
        statisticNames={editor.statisticNames}
        newStatisticName={editor.newStatisticName}
        setNewStatisticName={editor.setNewStatisticName}
        predicateOptions={editor.predicateOptions}
        getStartPredicateOptions={editor.getStartPredicateOptions}
        getStartValueOptions={editor.getStartValueOptions}
        getStepPredicateOptions={editor.getStepPredicateOptions}
        getStepWherePredicateOptions={editor.getStepWherePredicateOptions}
        getStepWhereValueOptions={editor.getStepWhereValueOptions}
        getStepTargetShapeNames={editor.getStepTargetShapeNames}
        isDirty={editor.isDirty}
        addStatisticPolicy={editor.addStatisticPolicy}
        save={editor.save}
        isSaving={editor.isSaving}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 12 },
  title: { marginBottom: 6 },
  subtitle: { marginBottom: 12, opacity: 0.8 },
});
