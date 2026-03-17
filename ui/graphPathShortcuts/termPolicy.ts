import { makeId, type GraphPathForm } from "../resourceViews/termPolicy/types";
import { getGraphPathShortcutsForDataSchema } from "./registry";
import type { GraphPathShortcut, GraphPathShortcutTemplate } from "./types";

function normalizeGraphPathForComparison(value: GraphPathForm) {
  return {
    where: value.where.map((filter) => ({
      predicate: filter.predicate.trim(),
      value: filter.value.trim(),
    })),
    steps: value.steps.map((step) => ({
      predicate: step.predicate.trim(),
      inverse: Boolean(step.inverse),
      where: step.where.map((filter) => ({
        predicate: filter.predicate.trim(),
        value: filter.value.trim(),
      })),
    })),
  };
}

function normalizeTemplateForComparison(value: GraphPathShortcutTemplate) {
  return {
    where: (value.where ?? []).map((filter) => ({
      predicate: filter.predicate.trim(),
      value: filter.value.trim(),
    })),
    steps: value.steps.map((step) => ({
      predicate: step.predicate.trim(),
      inverse: Boolean(step.inverse),
      where: (step.where ?? []).map((filter) => ({
        predicate: filter.predicate.trim(),
        value: filter.value.trim(),
      })),
    })),
  };
}

export function instantiateGraphPathShortcut(
  shortcut: GraphPathShortcut,
): GraphPathForm {
  return {
    where: (shortcut.template.where ?? []).map((filter) => ({
      id: makeId("where"),
      predicate: filter.predicate,
      value: filter.value,
    })),
    steps: shortcut.template.steps.map((step) => ({
      id: makeId("step"),
      predicate: step.predicate,
      inverse: Boolean(step.inverse),
      where: (step.where ?? []).map((filter) => ({
        id: makeId("where"),
        predicate: filter.predicate,
        value: filter.value,
      })),
    })),
  };
}

export function resolveGraphPathShortcut(
  dataSchemaName: string | null | undefined,
  graphPath: GraphPathForm,
): GraphPathShortcut | null {
  const normalizedPath = normalizeGraphPathForComparison(graphPath);
  const shortcuts = getGraphPathShortcutsForDataSchema(dataSchemaName);
  return (
    shortcuts.find((shortcut) => {
      const normalizedTemplate = normalizeTemplateForComparison(shortcut.template);
      return JSON.stringify(normalizedTemplate) === JSON.stringify(normalizedPath);
    }) ?? null
  );
}
