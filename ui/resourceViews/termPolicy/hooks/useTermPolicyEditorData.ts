import { useEffect, useMemo, useState } from "react";
import type {
  DataSchemaJsonView,
  StatisticPolicy,
  TermPolicySchemas,
} from "../types";
import {
  buildTermPolicyTurtle,
  getTermPolicyTtlUri,
  loadTermPolicy,
} from "../utils/termPolicyRdf";
import {
  extractPredicateOptions,
} from "../utils/schemaOptions";
import {
  createEmptyGraphPathOptionGetters,
  createGraphPathOptionGetters,
} from "../utils/graphPathOptionResolver";
import { asJsonDataSchema, findDataSchema } from "../dataSchemas";
import { getTermPolicySchemasByStatisticPlugin } from "../statisticPlugins";
import { createDefaultStatisticPolicy } from "../utils/termPolicySchemaForm";

function createSnapshot(
  dataSchemaName: string | null,
  statisticPolicies: StatisticPolicy[],
): string {
  return JSON.stringify({ dataSchemaName, statisticPolicies });
}

function getDataSchema(schemaName: string): DataSchemaJsonView {
  const schema = findDataSchema(schemaName);
  if (!schema) {
    throw new Error(`Unknown data schema: ${schemaName}`);
  }
  return asJsonDataSchema(schemaName, schema);
}

export function useTermPolicyEditorData(
  authFetch: typeof fetch,
  targetUri: string | undefined,
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [termPolicySchemas, setTermPolicySchemas] = useState<TermPolicySchemas>(
    {},
  );
  const [dataSchemaName, setDataSchemaName] = useState<string | null>(null);
  const [dataSchema, setDataSchema] = useState<DataSchemaJsonView | null>(null);
  const [statisticPolicies, setStatisticPolicies] = useState<StatisticPolicy[]>([]);
  const [newStatisticName, setNewStatisticName] = useState<string>("");
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUri) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setSaveMessage(null);
    setInitialSnapshot(null);
    const schemas = getTermPolicySchemasByStatisticPlugin();
    setTermPolicySchemas(schemas);

    Promise.resolve(loadTermPolicy(authFetch, targetUri, schemas))
      .then((termPolicy) => {
        let loadedDataSchema: DataSchemaJsonView | null = null;
        if (termPolicy.dataSchemaName) {
          loadedDataSchema = getDataSchema(termPolicy.dataSchemaName);
        }
        if (cancelled) return;
        setDataSchemaName(termPolicy.dataSchemaName);
        setDataSchema(loadedDataSchema);
        setStatisticPolicies(termPolicy.statisticPolicies);
        setInitialSnapshot(
          createSnapshot(termPolicy.dataSchemaName, termPolicy.statisticPolicies),
        );
        setIsLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authFetch, targetUri]);

  const predicateOptions = useMemo(
    () => extractPredicateOptions(dataSchema),
    [dataSchema],
  );
  const emptyGetters = useMemo(() => createEmptyGraphPathOptionGetters(), []);
  const [graphPathGetters, setGraphPathGetters] = useState(emptyGetters);
  useEffect(() => {
    let cancelled = false;
    setGraphPathGetters(emptyGetters);
    Promise.resolve(createGraphPathOptionGetters(dataSchema))
      .then((getters) => {
        if (cancelled) return;
        setGraphPathGetters(getters);
      })
      .catch(() => {
        if (cancelled) return;
        setGraphPathGetters(emptyGetters);
      });
    return () => {
      cancelled = true;
    };
  }, [dataSchema, emptyGetters]);
  const statisticNames = useMemo(
    () => Object.keys(termPolicySchemas).sort(),
    [termPolicySchemas],
  );
  const currentSnapshot = useMemo(
    () => createSnapshot(dataSchemaName, statisticPolicies),
    [dataSchemaName, statisticPolicies],
  );
  const isDirty = useMemo(
    () => initialSnapshot !== null && currentSnapshot !== initialSnapshot,
    [currentSnapshot, initialSnapshot],
  );

  useEffect(() => {
    if (!newStatisticName && statisticNames.length > 0) {
      setNewStatisticName(statisticNames[0]);
    }
  }, [newStatisticName, statisticNames]);

  const addStatisticPolicy = () => {
    const selected = newStatisticName || statisticNames[0];
    if (!selected) return;
    const schema = termPolicySchemas[selected];
    if (!schema) return;
    setStatisticPolicies((prev) => [
      ...prev,
      createDefaultStatisticPolicy(selected, schema),
    ]);
  };

  const save = async () => {
    if (!targetUri) return;
    setIsSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const ttl = buildTermPolicyTurtle(
        dataSchemaName,
        statisticPolicies,
        termPolicySchemas,
      );
      const saveUri = getTermPolicyTtlUri(targetUri);
      const res = await authFetch(saveUri, {
        method: "PUT",
        headers: {
          "content-type": "text/turtle",
        },
        body: ttl,
      });
      if (!res.ok) {
        throw new Error((await res.text()) || `Save failed: ${res.status}`);
      }
      setSaveMessage(`Saved term policy to ${saveUri}`);
      setInitialSnapshot(currentSnapshot);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    error,
    saveMessage,
    termPolicySchemas,
    dataSchemaName,
    dataSchema,
    statisticPolicies,
    setStatisticPolicies,
    statisticNames,
    newStatisticName,
    setNewStatisticName,
    predicateOptions,
    getStartPredicateOptions: graphPathGetters.getStartPredicateOptions,
    getStartValueOptions: graphPathGetters.getStartValueOptions,
    getStepPredicateOptions: graphPathGetters.getStepPredicateOptions,
    getStepWherePredicateOptions: graphPathGetters.getStepWherePredicateOptions,
    getStepWhereValueOptions: graphPathGetters.getStepWhereValueOptions,
    getStepTargetShapeNames: graphPathGetters.getStepTargetShapeNames,
    isDirty,
    addStatisticPolicy,
    save,
  };
}

