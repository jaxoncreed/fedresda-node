import { ResourceStore } from "@solid/community-server";
import { Logger } from "./util/logger";

export interface IntegrationPodGlobals {
  baseUrl: string;
  rootFilePath: string;
  logger: Logger;
  resourceStore: ResourceStore;
}

const globals: IntegrationPodGlobals = {
  baseUrl: "",
  rootFilePath: "",
  logger: new Logger(),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore This will be set by the createApp function
  resourceStore: undefined,
};

export function getGlobals(): IntegrationPodGlobals {
  return globals;
}

export function setGlobals(givenGlobals: Partial<IntegrationPodGlobals>) {
  Object.assign(globals, givenGlobals);
}
