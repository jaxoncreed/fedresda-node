import React, { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "linked-data-browser";

export const TermPolicyView: FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <Text variant="h2" style={styles.title}>
        Not Compatible With Mobile App
      </Text>
      <Text style={styles.subtitle}>
        This editor is available in the web application only.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: { marginBottom: 8 },
  subtitle: { opacity: 0.8 },
});
