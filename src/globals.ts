import { Logger } from "./util/logger";

export interface IntegrationPodGlobals {
  baseUrl: string;
  rootFilePath: string;
  logger: Logger;
}

const globals: IntegrationPodGlobals = {
  baseUrl: "",
  rootFilePath: "",
  logger: new Logger(),
};

export function getGlobals(): IntegrationPodGlobals {
  return globals;
}

export function setGlobals(givenGlobals: Partial<IntegrationPodGlobals>) {
  Object.assign(globals, givenGlobals);
}
