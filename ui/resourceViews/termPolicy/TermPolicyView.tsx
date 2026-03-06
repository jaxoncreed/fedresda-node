import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, LoadingBar, useViewContext } from "linked-data-browser";
import { useSolidAuth } from "@ldo/solid-react";
import { parseRdf } from "@ldo/ldo";
import { namedNode } from "@ldo/rdf-utils";
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

const DATA_SCHEMA_PREDICATE = "https://fedresda.setmeld.org/term-policy#dataSchema";

type RdfTerm = {
  termType?: string;
  value?: string;
};

function getCandidateTermPolicyUris(targetUri: string): string[] {
  if (targetUri.endsWith(".term-policy.ttl")) {
    return [
      targetUri,
      targetUri.replace(/\.term-policy\.ttl$/i, ".term-policy.jsonld"),
      targetUri.replace(/\.term-policy\.ttl$/i, ".term-policy.json"),
    ];
  }
  if (targetUri.endsWith(".term-policy.jsonld")) {
    return [
      targetUri.replace(/\.term-policy\.jsonld$/i, ".term-policy.ttl"),
      targetUri,
      targetUri.replace(/\.term-policy\.jsonld$/i, ".term-policy.json"),
    ];
  }
  if (targetUri.endsWith(".term-policy.json")) {
    return [
      targetUri.replace(/\.term-policy\.json$/i, ".term-policy.ttl"),
      targetUri.replace(/\.term-policy\.json$/i, ".term-policy.jsonld"),
      targetUri,
    ];
  }
  return [targetUri];
}

function getDataSchemaNameFromJson(termPolicyDoc: Record<string, unknown>): string | null {
  const raw = termPolicyDoc.dataSchema;
  if (typeof raw === "string") {
    return raw;
  }
  if (raw && typeof raw === "object" && "@id" in raw) {
    const id = (raw as { "@id"?: unknown })["@id"];
    if (typeof id === "string") {
      return id;
    }
  }
  return null;
}

async function parseTermPolicySchemaName(
  payload: string,
  sourceUri: string,
  contentType: string,
): Promise<string | null> {
  const lowerContentType = contentType.toLowerCase();
  const looksLikeTurtle =
    sourceUri.endsWith(".ttl") ||
    lowerContentType.includes("text/turtle") ||
    lowerContentType.includes("application/x-turtle");
  if (looksLikeTurtle) {
    const dataset = await parseRdf(payload, {
      baseIRI: sourceUri,
      format: "Turtle",
    });
    const matches = dataset.match(
      null,
      namedNode(DATA_SCHEMA_PREDICATE),
      null,
    );
    const quads =
      typeof (matches as { toArray?: () => unknown[] }).toArray === "function"
        ? (matches as { toArray: () => unknown[] }).toArray()
        : [];
    const firstMatch = quads[0] as { object?: RdfTerm } | undefined;
    const object = firstMatch?.object;
    return typeof object?.value === "string" ? object.value : null;
  }

  const json = JSON.parse(payload) as Record<string, unknown>;
  return getDataSchemaNameFromJson(json);
}

async function fetchTermPolicySchemaName(
  authFetch: typeof fetch,
  targetUri: string,
): Promise<string | null> {
  const candidateUris = getCandidateTermPolicyUris(targetUri);
  const errors: string[] = [];

  for (const uri of candidateUris) {
    const res = await authFetch(uri);
    if (!res.ok) {
      errors.push(`${uri}: ${res.status}`);
      continue;
    }
    const contentType = res.headers.get("content-type") ?? "";
    const payload = await res.text();
    try {
      return await parseTermPolicySchemaName(payload, uri, contentType);
    } catch (e) {
      errors.push(
        `${uri}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  throw new Error(
    `Unable to parse term policy resource. Attempts: ${errors.join("; ")}`,
  );
}

async function fetchDataSchema(
  authFetch: typeof fetch,
  schemaName: string,
): Promise<unknown> {
  const origin = window.location.origin;
  const res = await authFetch(
    `${origin}/.api/data-schema/${encodeURIComponent(schemaName)}?view=json`,
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

    Promise.all([fetchTermPolicies(fetch), fetchTermPolicySchemaName(fetch, targetUri)])
      .then(async ([policySchemas, schemaNameValue]) => {
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
