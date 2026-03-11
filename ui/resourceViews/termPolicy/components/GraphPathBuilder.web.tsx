import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Filter,
  Plus,
  Route,
  Trash2,
} from "lucide-react-native";
import type { GraphPathForm, GraphTraversalStepForm } from "../types";
import { createEmptyNodeFilter, createEmptyStep } from "../types";
import type {
  StartPredicateOptionGetter,
  StartValueOptionGetter,
  StepPredicateOptionGetter,
  StepTargetShapeNameGetter,
  StepWherePredicateOptionGetter,
  StepWhereValueOptionGetter,
} from "../utils/graphPathOptionResolver";

type Props = {
  value: GraphPathForm;
  predicateOptions: string[];
  getStartPredicateOptions: StartPredicateOptionGetter;
  getStartValueOptions: StartValueOptionGetter;
  getStepPredicateOptions: StepPredicateOptionGetter;
  getStepWherePredicateOptions: StepWherePredicateOptionGetter;
  getStepWhereValueOptions: StepWhereValueOptionGetter;
  getStepTargetShapeNames: StepTargetShapeNameGetter;
  onChange: (next: GraphPathForm) => void;
};

function shortIri(value: string): string {
  if (!value) return "(not set)";
  const hashIndex = value.lastIndexOf("#");
  if (hashIndex >= 0 && hashIndex < value.length - 1) {
    return value.slice(hashIndex + 1);
  }
  const slashIndex = value.lastIndexOf("/");
  if (slashIndex >= 0 && slashIndex < value.length - 1) {
    return value.slice(slashIndex + 1);
  }
  return value;
}

function ShapeChips({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span style={{ color: "rgba(0,0,0,0.6)" }}>(none)</span>;
  }
  return (
    <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
      {values.map((shape) => (
        <span
          key={shape}
          title={shape}
          style={{
            fontSize: 12,
            borderRadius: 999,
            padding: "2px 8px",
            border: "1px solid rgba(0,0,0,0.16)",
            backgroundColor: "rgba(0,0,0,0.04)",
          }}
        >
          {shortIri(shape)}
        </span>
      ))}
    </span>
  );
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
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    value.steps[0]?.id ?? null,
  );
  const safePredicateOptions = predicateOptions.length > 0 ? predicateOptions : [""];
  const startPredicateOptions = getStartPredicateOptions(value);
  const safeStartPredicateOptions =
    startPredicateOptions.length > 0 ? startPredicateOptions : safePredicateOptions;

  useEffect(() => {
    if (value.steps.length === 0) {
      setSelectedStepId(null);
      return;
    }
    if (!selectedStepId || !value.steps.some((step) => step.id === selectedStepId)) {
      setSelectedStepId(value.steps[0].id);
    }
  }, [value.steps, selectedStepId]);

  const selectedStepIndex = value.steps.findIndex((step) => step.id === selectedStepId);
  const selectedStep =
    selectedStepIndex >= 0 ? value.steps[selectedStepIndex] : undefined;
  const previewPath: GraphPathForm = useMemo(
    () => ({ ...value, steps: [...value.steps, createEmptyStep()] }),
    [value],
  );

  const updateStep = (
    stepId: string,
    updater: (step: GraphTraversalStepForm) => GraphTraversalStepForm,
  ) => {
    onChange({
      ...value,
      steps: value.steps.map((step) => (step.id === stepId ? updater(step) : step)),
    });
  };

  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.14)",
        borderRadius: 12,
        padding: 14,
        backgroundColor: "rgba(255,255,255,0.88)",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Start filters</div>
        {value.where.map((filter) => {
          const valueOptions = getStartValueOptions(value, filter.predicate);
          const safeValues = valueOptions.length > 0 ? valueOptions : [""];
          return (
            <div
              key={filter.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <select
                value={filter.predicate}
                onChange={(e) =>
                  onChange({
                    ...value,
                    where: value.where.map((f) =>
                      f.id === filter.id ? { ...f, predicate: e.target.value } : f,
                    ),
                  })
                }
                style={{ minHeight: 32 }}
              >
                {safeStartPredicateOptions.map((option) => (
                  <option key={option} value={option}>
                    {option || "(no predicate options loaded)"}
                  </option>
                ))}
              </select>
              <select
                value={filter.value}
                onChange={(e) =>
                  onChange({
                    ...value,
                    where: value.where.map((f) =>
                      f.id === filter.id ? { ...f, value: e.target.value } : f,
                    ),
                  })
                }
                style={{ minHeight: 32 }}
              >
                {safeValues.map((option) => (
                  <option key={option} value={option}>
                    {option || "(no value options loaded)"}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    where: value.where.filter((f) => f.id !== filter.id),
                  })
                }
                style={{
                  minHeight: 32,
                  padding: "0 10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Trash2 size={14} color="currentColor" />
                Remove
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() =>
            onChange({ ...value, where: [...value.where, createEmptyNodeFilter()] })
          }
          style={{
            minHeight: 34,
            padding: "0 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 8,
          }}
        >
          <Plus size={14} color="currentColor" />
          Add start filter
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 12,
          alignItems: "start",
        }}
      >
        <div style={{ borderRight: "1px solid rgba(0,0,0,0.1)", paddingRight: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {value.steps.map((step, index) => {
              const currentShapes = getStepTargetShapeNames(value, index);
              const nextShapes = getStepTargetShapeNames(previewPath, index + 1);
              const isSelected = step.id === selectedStepId;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setSelectedStepId(step.id)}
                  style={{
                    border: isSelected
                      ? "2px solid rgba(0,0,0,0.55)"
                      : "1px solid rgba(0,0,0,0.14)",
                    borderRadius: 10,
                    padding: 10,
                    textAlign: "left",
                    background: isSelected ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.92)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <Route size={14} color="currentColor" />
                    {index + 1}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(0,0,0,0.74)" }}>
                    {shortIri(step.predicate)}
                    {step.inverse ? " (inverse)" : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(0,0,0,0.6)", marginTop: 4 }}>
                    {currentShapes.length} current shape(s) {"->"} {nextShapes.length} next shape(s)
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={() => {
                const step = { ...createEmptyStep(), predicate: safePredicateOptions[0] ?? "" };
                onChange({
                  ...value,
                  steps: [...value.steps, step],
                });
                setSelectedStepId(step.id);
              }}
              style={{
                minHeight: 34,
                padding: "0 12px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 8,
              }}
            >
              <Plus size={14} color="currentColor" />
              Add step
            </button>
          </div>
        </div>

        <div
          style={{
            padding: 4,
            borderRadius: 10,
            backgroundColor: "rgba(0,0,0,0.015)",
          }}
        >
          {selectedStep ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>
                Step {selectedStepIndex + 1}
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.66)", marginBottom: 4 }}>
                  Current shape
                </div>
                <ShapeChips values={getStepTargetShapeNames(value, selectedStepIndex)} />
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, marginBottom: 8 }}>
                  <label style={{ alignSelf: "center" }}>Via</label>
                  <select
                    value={selectedStep.predicate}
                    onChange={(e) =>
                      updateStep(selectedStep.id, (step) => ({
                        ...step,
                        predicate: e.target.value,
                      }))
                    }
                    style={{ minHeight: 34 }}
                  >
                    {(getStepPredicateOptions(value, selectedStepIndex).length > 0
                      ? getStepPredicateOptions(value, selectedStepIndex)
                      : safePredicateOptions
                    ).map((option) => (
                      <option key={option} value={option}>
                        {option || "(no predicate options loaded)"}
                      </option>
                    ))}
                  </select>
                </div>
                <label style={{ fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={selectedStep.inverse}
                    onChange={(e) =>
                      updateStep(selectedStep.id, (step) => ({
                        ...step,
                        inverse: e.target.checked,
                      }))
                    }
                  />{" "}
                  Inverse
                </label>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.66)", marginBottom: 6 }}>
                  Filters
                </div>
                {selectedStep.where.map((filter) => {
                  const predicateOptions = getStepWherePredicateOptions(value, selectedStepIndex);
                  const valueOptions = getStepWhereValueOptions(
                    value,
                    selectedStepIndex,
                    filter.predicate,
                  );
                  const safePredicates =
                    predicateOptions.length > 0 ? predicateOptions : safePredicateOptions;
                  const safeValues = valueOptions.length > 0 ? valueOptions : [""];
                  return (
                    <div
                      key={filter.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <select
                        value={filter.predicate}
                        onChange={(e) =>
                          updateStep(selectedStep.id, (step) => ({
                            ...step,
                            where: step.where.map((f) =>
                              f.id === filter.id ? { ...f, predicate: e.target.value } : f,
                            ),
                          }))
                        }
                        style={{ minHeight: 32 }}
                      >
                        {safePredicates.map((option) => (
                          <option key={option} value={option}>
                            {option || "(no predicate options loaded)"}
                          </option>
                        ))}
                      </select>
                      <select
                        value={filter.value}
                        onChange={(e) =>
                          updateStep(selectedStep.id, (step) => ({
                            ...step,
                            where: step.where.map((f) =>
                              f.id === filter.id ? { ...f, value: e.target.value } : f,
                            ),
                          }))
                        }
                        style={{ minHeight: 32 }}
                      >
                        {safeValues.map((option) => (
                          <option key={option} value={option}>
                            {option || "(no value options loaded)"}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          updateStep(selectedStep.id, (step) => ({
                            ...step,
                            where: step.where.filter((f) => f.id !== filter.id),
                          }))
                        }
                        style={{
                          minHeight: 32,
                          padding: "0 10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Trash2 size={14} color="currentColor" />
                        Remove
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    updateStep(selectedStep.id, (step) => ({
                      ...step,
                      where: [...step.where, createEmptyNodeFilter()],
                    }))
                  }
                  style={{
                    minHeight: 34,
                    padding: "0 12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 8,
                  }}
                >
                  <Filter size={14} color="currentColor" />
                  Add where filter
                </button>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.66)", marginBottom: 4 }}>
                  Next shape
                </div>
                <ShapeChips values={getStepTargetShapeNames(previewPath, selectedStepIndex + 1)} />
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={selectedStepIndex <= 0}
                  onClick={() => {
                    if (selectedStepIndex <= 0) return;
                    const nextSteps = [...value.steps];
                    [nextSteps[selectedStepIndex - 1], nextSteps[selectedStepIndex]] = [
                      nextSteps[selectedStepIndex],
                      nextSteps[selectedStepIndex - 1],
                    ];
                    onChange({ ...value, steps: nextSteps });
                  }}
                >
                  <ArrowUp size={14} color="currentColor" />
                  Move up
                </button>
                <button
                  type="button"
                  disabled={selectedStepIndex >= value.steps.length - 1}
                  onClick={() => {
                    if (selectedStepIndex >= value.steps.length - 1) return;
                    const nextSteps = [...value.steps];
                    [nextSteps[selectedStepIndex + 1], nextSteps[selectedStepIndex]] = [
                      nextSteps[selectedStepIndex],
                      nextSteps[selectedStepIndex + 1],
                    ];
                    onChange({ ...value, steps: nextSteps });
                  }}
                >
                  <ArrowDown size={14} color="currentColor" />
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const duplicate: GraphTraversalStepForm = {
                      ...selectedStep,
                      id: createEmptyStep().id,
                      where: selectedStep.where.map((f) => ({
                        ...f,
                        id: createEmptyNodeFilter().id,
                      })),
                    };
                    const nextSteps = [
                      ...value.steps.slice(0, selectedStepIndex + 1),
                      duplicate,
                      ...value.steps.slice(selectedStepIndex + 1),
                    ];
                    onChange({ ...value, steps: nextSteps });
                    setSelectedStepId(duplicate.id);
                  }}
                >
                  <Copy size={14} color="currentColor" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextSteps = value.steps.filter((step) => step.id !== selectedStep.id);
                    onChange({ ...value, steps: nextSteps });
                    setSelectedStepId(nextSteps[0]?.id ?? null);
                  }}
                >
                  <Trash2 size={14} color="currentColor" />
                  Remove step
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: "rgba(0,0,0,0.65)" }}>
              Select a step from the navigator to edit details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
