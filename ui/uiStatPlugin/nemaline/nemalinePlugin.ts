import type { UiStatPlugin } from '../UiStatPlugin';
import { NemalineConfig } from './NemalineConfig';
import { NemalineCsvResourceCreator } from './NemalineCsvResourceCreator';

export const nemalinePlugin: UiStatPlugin = {
  name: 'nemaline',
  icon: 'stethoscope',
  resourceView: NemalineConfig,
  resourceCreator: NemalineCsvResourceCreator,
};
