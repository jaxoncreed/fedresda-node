import { nemalineGraphPathShortcutModule } from "./schemas/nemaline";
import type { GraphPathShortcut, GraphPathShortcutSchemaModule } from "./types";

const modules: GraphPathShortcutSchemaModule[] = [nemalineGraphPathShortcutModule];

function normalizeSchemaName(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function createGraphPathShortcutRegistry(): Record<string, GraphPathShortcut[]> {
  return modules.reduce<Record<string, GraphPathShortcut[]>>((registry, module) => {
    const key = normalizeSchemaName(module.dataSchemaName);
    const existing = registry[key] ?? [];
    registry[key] = [...existing, ...module.shortcuts];
    return registry;
  }, {});
}

const graphPathShortcutRegistry = createGraphPathShortcutRegistry();

export function getGraphPathShortcutsForDataSchema(
  dataSchemaName: string | null | undefined,
): GraphPathShortcut[] {
  const normalizedName = normalizeSchemaName(dataSchemaName);
  return graphPathShortcutRegistry[normalizedName] ?? [];
}

export function findGraphPathShortcutByName(
  dataSchemaName: string | null | undefined,
  shortcutName: string,
): GraphPathShortcut | null {
  const shortcuts = getGraphPathShortcutsForDataSchema(dataSchemaName);
  return shortcuts.find((shortcut) => shortcut.name === shortcutName) ?? null;
}
