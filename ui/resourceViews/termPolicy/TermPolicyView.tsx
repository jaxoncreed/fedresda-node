import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, LoadingBar } from "linked-data-browser";
import { useSolidAuth } from "@ldo/solid-react";
import type { JSONSchema4 } from "json-schema";

async function fetchTermPolicies(
  authFetch: typeof fetch,
): Promise<Record<string, JSONSchema4>> {
  const origin = window.location.origin;
  const res = await authFetch(`${origin}/.api/term-policy`);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const TermPolicyView: FunctionComponent = () => {
  const { fetch } = useSolidAuth();
  const [termPolicies, setTermPolicies] = useState<Record<string, JSONSchema4> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchTermPolicies(fetch)
      .then((data) => {
        if (!cancelled) {
          setTermPolicies(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setTermPolicies(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetch]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (termPolicies === null) {
    return (
      <View style={styles.container}>
        <LoadingBar isLoading />
      </View>
    );
  }

  const entries = Object.entries(termPolicies);
  const count = entries.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h1" style={styles.title}>
        Term Policies
      </Text>
      <Text style={styles.subtitle}>
        {count} term polic{count === 1 ? "y" : "ies"}
      </Text>
      {count === 0 ? (
        <Text style={styles.empty}>No term policies found.</Text>
      ) : (
        <View style={styles.list}>
          {entries.map(([key, schema]) => (
            <View key={key} style={styles.item}>
              <Text style={styles.key}>{key}</Text>
              <Text style={styles.schema} selectable>
                {JSON.stringify(schema, null, 2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.8,
  },
  empty: {
    fontStyle: "italic",
  },
  list: {
    gap: 12,
  },
  item: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 8,
  },
  key: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  schema: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  error: {
    color: "red",
    padding: 24,
  },
});
