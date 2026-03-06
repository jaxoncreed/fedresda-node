import React from "react";

type GraphPathInputProps = {
  label: string;
  value: string[];
  predicateOptions: string[];
  onChange: (next: string[]) => void;
};

function makeEmptyStep(predicateOptions: string[]): string {
  return predicateOptions[0] ?? "";
}

export function GraphPathInput({
  label,
  value,
  predicateOptions,
  onChange,
}: GraphPathInputProps) {
  const steps = value.length > 0 ? value : [makeEmptyStep(predicateOptions)];

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {steps.map((step, index) => (
        <div
          key={`${label}-${index}`}
          style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}
        >
          <select
            value={step}
            onChange={(e) => {
              const next = [...steps];
              next[index] = e.target.value;
              onChange(next.filter((p) => p.trim() !== ""));
            }}
            style={{ flex: 1, minHeight: 32 }}
          >
            {predicateOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              const next = steps.filter((_, i) => i !== index);
              onChange(next.filter((p) => p.trim() !== ""));
            }}
            disabled={steps.length <= 1}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...steps, makeEmptyStep(predicateOptions)])}
      >
        Add Step
      </button>
    </div>
  );
}

