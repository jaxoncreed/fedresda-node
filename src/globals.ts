import { Logger } from "./util/logger";
import type { ResourceStore } from "@solid/community-server";

export interface IntegrationPodGlobals {
  baseUrl: string;
  rootFilePath: string;
  sparqlEndpoint: string;
  logger: Logger;
  /** Solid Pod resource store; used to read term policy auxiliary resources. */
  resourceStore?: ResourceStore;
}

const globals: IntegrationPodGlobals = {
  baseUrl: "",
  rootFilePath: "",
  sparqlEndpoint: "",
  logger: new Logger(),
};

export function getGlobals(): IntegrationPodGlobals {
  return globals;
}

export function setGlobals(givenGlobals: Partial<IntegrationPodGlobals>) {
  Object.assign(globals, givenGlobals);
}
