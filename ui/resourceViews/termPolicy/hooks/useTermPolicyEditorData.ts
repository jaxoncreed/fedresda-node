import { useEffect, useMemo, useState } from "react";
import type {
  DataSchemaJsonView,
  StatisticPolicy,
  TermPolicySchemas,
} from "../types";
import { createEmptyGraphPath, makeId } from "../types";
import {
  buildTermPolicyTurtle,
  getTermPolicyTtlUri,
  loadTermPolicy,
} from "../utils/termPolicyRdf";
import {
  extractPredicateOptions,
  extractValueOptions,
} from "../utils/schemaOptions";
import {
  createStartPredicateOptionGetter,
  createStartValueOptionGetter,
  createStepPredicateOptionGetter,
  createStepWherePredicateOptionGetter,
  createStepWhereValueOptionGetter,
} from "../utils/graphPathOptionResolver";
import { asJsonDataSchema, findDataSchema } from "../dataSchemas";
import { getTermPolicySchemasByStatisticPlugin } from "../statisticPlugins";

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

  useEffect(() => {
    if (!targetUri) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setSaveMessage(null);

    Promise.resolve(loadTermPolicy(authFetch, targetUri))
      .then((termPolicy) => {
        const schemas = getTermPolicySchemasByStatisticPlugin();
        let loadedDataSchema: DataSchemaJsonView | null = null;
        if (termPolicy.dataSchemaName) {
          loadedDataSchema = getDataSchema(termPolicy.dataSchemaName);
        }
        if (cancelled) return;
        setTermPolicySchemas(schemas);
        setDataSchemaName(termPolicy.dataSchemaName);
        setDataSchema(loadedDataSchema);
        setStatisticPolicies(termPolicy.statisticPolicies);
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
  const filterValueOptions = useMemo(
    () => extractValueOptions(dataSchema),
    [dataSchema],
  );
  const getStartPredicateOptions = useMemo(
    () => createStartPredicateOptionGetter(dataSchema),
    [dataSchema],
  );
  const getStartValueOptions = useMemo(
    () => createStartValueOptionGetter(dataSchema),
    [dataSchema],
  );
  const getStepPredicateOptions = useMemo(
    () => createStepPredicateOptionGetter(dataSchema),
    [dataSchema],
  );
  const getStepWherePredicateOptions = useMemo(
    () => createStepWherePredicateOptionGetter(dataSchema),
    [dataSchema],
  );
  const getStepWhereValueOptions = useMemo(
    () => createStepWhereValueOptionGetter(dataSchema),
    [dataSchema],
  );
  const statisticNames = useMemo(
    () => Object.keys(termPolicySchemas).sort(),
    [termPolicySchemas],
  );

  useEffect(() => {
    if (!newStatisticName && statisticNames.length > 0) {
      setNewStatisticName(statisticNames[0]);
    }
  }, [newStatisticName, statisticNames]);

  const addStatisticPolicy = () => {
    const selected = newStatisticName || statisticNames[0];
    if (!selected) return;
    if (selected === "mean") {
      setStatisticPolicies((prev) => [
        ...prev,
        {
          id: makeId("stat"),
          statisticName: "mean",
          allowedPaths: [
            {
              id: makeId("allowed"),
              graphPath: createEmptyGraphPath(),
              minValues: 1,
              filterValue: "",
            },
          ],
        },
      ]);
      return;
    }
    if (selected === "kaplan-meier") {
      setStatisticPolicies((prev) => [
        ...prev,
        {
          id: makeId("stat"),
          statisticName: "kaplan-meier",
          cohortPath: predicateOptions.slice(0, 1),
          eventPath: predicateOptions.slice(0, 1),
          timePath: predicateOptions.slice(0, 1),
        },
      ]);
    }
  };

  const save = async () => {
    if (!targetUri) return;
    setIsSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const ttl = buildTermPolicyTurtle(dataSchemaName, statisticPolicies);
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
    filterValueOptions,
    getStartPredicateOptions,
    getStartValueOptions,
    getStepPredicateOptions,
    getStepWherePredicateOptions,
    getStepWhereValueOptions,
    addStatisticPolicy,
    save,
  };
}

