import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, LoadingBar, useViewContext } from "linked-data-browser";
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

async function fetchTermPolicyDocument(
  authFetch: typeof fetch,
  targetUri: string,
): Promise<Record<string, unknown>> {
  const res = await authFetch(targetUri);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function fetchDataSchema(
  authFetch: typeof fetch,
  schemaName: string,
): Promise<unknown> {
  const origin = window.location.origin;
  const res = await authFetch(
    `${origin}/.api/data-schema/${encodeURIComponent(schemaName)}`,
  );
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const TermPolicyView: FunctionComponent = () => {
  const { targetUri } = useViewContext();
  const { fetch } = useSolidAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [termPolicies, setTermPolicies] = useState<Record<string, JSONSchema4>>(
    {},
  );
  const [dataSchemaName, setDataSchemaName] = useState<string | null>(null);
  const [dataSchema, setDataSchema] = useState<unknown | null>(null);
  const [dataSchemaError, setDataSchemaError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUri) return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([fetchTermPolicies(fetch), fetchTermPolicyDocument(fetch, targetUri)])
      .then(async ([policySchemas, termPolicyDoc]) => {
        const schemaNameValue =
          typeof termPolicyDoc.dataSchema === "string"
            ? termPolicyDoc.dataSchema
            : null;
        let resolvedDataSchema: unknown | null = null;
        let resolvedDataSchemaError: string | null = null;

        if (schemaNameValue) {
          try {
            resolvedDataSchema = await fetchDataSchema(fetch, schemaNameValue);
          } catch (schemaErr) {
            resolvedDataSchemaError =
              schemaErr instanceof Error ? schemaErr.message : String(schemaErr);
          }
        }

        if (!cancelled) {
          setTermPolicies(policySchemas);
          setDataSchemaName(schemaNameValue);
          setDataSchema(resolvedDataSchema);
          setDataSchemaError(resolvedDataSchemaError);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetch, targetUri]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (isLoading) {
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
      <View style={styles.item}>
        <Text style={styles.key}>Data schema</Text>
        {dataSchemaName ? (
          <>
            <Text style={styles.subtitleText}>Configured schema: {dataSchemaName}</Text>
            {dataSchemaError ? (
              <Text style={styles.error}>{dataSchemaError}</Text>
            ) : (
              <Text style={styles.schema} selectable>
                {JSON.stringify(dataSchema, null, 2)}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.empty}>
            No data schema configured in this term policy.
          </Text>
        )}
      </View>
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
  subtitleText: {
    marginBottom: 8,
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
