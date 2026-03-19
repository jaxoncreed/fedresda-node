import { nemalineGraphPathShortcuts } from "./schemas/nemaline";
import type { GraphPathShortcut, GraphPathShortcutMap, GraphPathShortcutRegistry } from "./types";

const graphPathShortcutRegistry: GraphPathShortcutRegistry = {
  nemaline: nemalineGraphPathShortcuts,
};

function normalizeSchemaName(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function getGraphPathShortcutMapForDataSchema(
  dataSchemaName: string | null | undefined,
): GraphPathShortcutMap {
  const normalizedName = normalizeSchemaName(dataSchemaName);
  return graphPathShortcutRegistry[normalizedName] ?? {};
}

export function getGraphPathShortcutsForDataSchema(
  dataSchemaName: string | null | undefined,
): GraphPathShortcut[] {
  const shortcutMap = getGraphPathShortcutMapForDataSchema(dataSchemaName);
  return Object.entries(shortcutMap).map(([name, graphPath]) => ({ name, graphPath }));
}

export function findGraphPathShortcutByName(
  dataSchemaName: string | null | undefined,
  shortcutName: string,
): GraphPathShortcut | null {
  const shortcutMap = getGraphPathShortcutMapForDataSchema(dataSchemaName);
  const graphPath = shortcutMap[shortcutName];
  return graphPath ? { name: shortcutName, graphPath } : null;
}
