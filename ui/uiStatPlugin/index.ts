import type { ResourceCreatorConfig, ResourceViewConfig } from 'linked-data-browser';
import type { UiStatPlugin } from './UiStatPlugin';
import { nemalinePlugin } from './nemaline/nemalinePlugin';

/** All registered UI stat plugins. Add new plugins here. */
export const uiStatPlugins: UiStatPlugin[] = [nemalinePlugin];

/** Collect all resource view configs from plugins. */
export function getResourceViewsFromPlugins(plugins: UiStatPlugin[]): ResourceViewConfig[] {
  return plugins.map((p) => p.resourceView);
}

/** Collect all resource creator configs from plugins. */
export function getResourceCreatorsFromPlugins(plugins: UiStatPlugin[]): ResourceCreatorConfig[] {
  return plugins.map((p) => p.resourceCreator);
}

export type { UiStatPlugin } from './UiStatPlugin';
