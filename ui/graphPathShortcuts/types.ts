import type { GraphPath } from "@fedresda/types";

export type GraphPathShortcutMap = Record<string, GraphPath>;

export type GraphPathShortcut = {
  name: string;
  graphPath: GraphPath;
};

export type GraphPathShortcutRegistry = Record<string, GraphPathShortcutMap>;
