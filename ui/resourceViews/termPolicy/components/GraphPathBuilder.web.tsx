import React from "react";
import type { GraphPathForm } from "../types";
import { createEmptyNodeFilter, createEmptyStep } from "../types";
import type { GraphPathOptionResolver } from "../utils/graphPathOptionResolver";

type Props = {
  value: GraphPathForm;
  predicateOptions: string[];
  optionResolver: GraphPathOptionResolver;
  onChange: (next: GraphPathForm) => void;
};

export function GraphPathBuilder({
  value,
  predicateOptions,
  optionResolver,
  onChange,
}: Props) {
  const safePredicateOptions =
    predicateOptions.length > 0 ? predicateOptions : [""];
  const startPredicateOptions = optionResolver.getStartPredicateOptions(value);
  const safeStartPredicateOptions =
    startPredicateOptions.length > 0 ? startPredicateOptions : safePredicateOptions;

  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.2)", borderRadius: 8, padding: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Start filters</div>
      {value.where.map((filter) => {
        const valueOptionsForPredicate = optionResolver.getStartValueOptions(
          value,
          filter.predicate,
        );
        const safeValues =
          valueOptionsForPredicate.length > 0
            ? valueOptionsForPredicate
            : [""];
        return (
          <div
            key={filter.id}
            style={{
              border: "1px dashed rgba(0,0,0,0.3)",
              borderRadius: 8,
              padding: 8,
              marginBottom: 8,
            }}
          >
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <label style={{ minWidth: 90 }}>Predicate</label>
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
              style={{ minHeight: 32, flex: 1 }}
            >
              {safeStartPredicateOptions.map((option) => (
                <option key={option} value={option}>
                  {option || "(no predicate options loaded)"}
                </option>
              ))}
            </select>
          </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <label style={{ minWidth: 90 }}>Value</label>
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
              style={{ minHeight: 32, flex: 1 }}
            >
              {safeValues.map((option) => (
                <option key={option} value={option}>
                  {option || "(no value options loaded)"}
                </option>
              ))}
            </select>
            </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...value,
                where: value.where.filter((f) => f.id !== filter.id),
              })
            }
          >
            Remove start filter
          </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange({ ...value, where: [...value.where, createEmptyNodeFilter()] })}
      >
        Add start filter
      </button>

      <div style={{ fontWeight: 600, margin: "10px 0 6px 0" }}>Traversal steps</div>
      {value.steps.map((step, stepIndex) => {
        const stepPredicateOptions = optionResolver.getStepPredicateOptions(value, stepIndex);
        const safeStepPredicateOptions =
          stepPredicateOptions.length > 0 ? stepPredicateOptions : safePredicateOptions;
        const stepWherePredicateOptions = optionResolver.getStepWherePredicateOptions(
          value,
          stepIndex,
        );
        const safeStepWherePredicateOptions =
          stepWherePredicateOptions.length > 0
            ? stepWherePredicateOptions
            : safePredicateOptions;
        return (
          <div
            key={step.id}
            style={{
              border: "1px dashed rgba(0,0,0,0.3)",
              borderRadius: 8,
              padding: 8,
              marginBottom: 8,
            }}
          >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>Step</span>
            <button
              type="button"
              onClick={() =>
                onChange({ ...value, steps: value.steps.filter((s) => s.id !== step.id) })
              }
            >
              Remove
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <label style={{ minWidth: 90 }}>Via</label>
            <select
              value={step.predicate}
              onChange={(e) =>
                onChange({
                  ...value,
                  steps: value.steps.map((s) =>
                    s.id === step.id ? { ...s, predicate: e.target.value } : s,
                  ),
                })
              }
              style={{ minHeight: 32, flex: 1 }}
            >
              {safeStepPredicateOptions.map((option) => (
                <option key={option} value={option}>
                  {option || "(no predicate options loaded)"}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              <input
                type="checkbox"
                checked={step.inverse}
                onChange={(e) =>
                  onChange({
                    ...value,
                    steps: value.steps.map((s) =>
                      s.id === step.id ? { ...s, inverse: e.target.checked } : s,
                    ),
                  })
                }
              />{" "}
              Inverse
            </label>
          </div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Where filters</div>
          {step.where.map((filter) => {
            const options = optionResolver.getStepWhereValueOptions(
              value,
              stepIndex,
              filter.predicate,
            );
            const contextValueOptions = options.length > 0 ? options : [""];
            return (
              <div
                key={filter.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.15)",
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 8,
                }}
              >
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <label style={{ minWidth: 90 }}>Predicate</label>
                <select
                  value={filter.predicate}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      steps: value.steps.map((s) =>
                        s.id !== step.id
                          ? s
                          : {
                              ...s,
                              where: s.where.map((f) =>
                                f.id === filter.id
                                  ? { ...f, predicate: e.target.value }
                                  : f,
                              ),
                            },
                      ),
                    })
                  }
                  style={{ minHeight: 32, flex: 1 }}
                >
                  {safeStepWherePredicateOptions.map((option) => (
                    <option key={option} value={option}>
                      {option || "(no predicate options loaded)"}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <label style={{ minWidth: 90 }}>Value</label>
                <select
                  value={filter.value}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      steps: value.steps.map((s) =>
                        s.id !== step.id
                          ? s
                          : {
                              ...s,
                              where: s.where.map((f) =>
                                f.id === filter.id ? { ...f, value: e.target.value } : f,
                              ),
                            },
                      ),
                    })
                  }
                  style={{ minHeight: 32, flex: 1 }}
                >
                  {contextValueOptions.map((option) => (
                    <option key={option} value={option}>
                      {option || "(no value options loaded)"}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    steps: value.steps.map((s) =>
                      s.id !== step.id
                        ? s
                        : {
                            ...s,
                            where: s.where.filter((f) => f.id !== filter.id),
                          },
                    ),
                  })
                }
              >
                Remove where filter
              </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...value,
                steps: value.steps.map((s) =>
                  s.id === step.id
                    ? { ...s, where: [...s.where, createEmptyNodeFilter()] }
                    : s,
                ),
              })
            }
          >
            Add where filter
          </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() =>
          onChange({
            ...value,
            steps: [
              ...value.steps,
              { ...createEmptyStep(), predicate: safePredicateOptions[0] ?? "" },
            ],
          })
        }
      >
        Add step
      </button>
    </div>
  );
}

