import {
  KaplanMeierStatisticAccessRuleShapeType,
  MeanStatisticAccessRuleShapeType,
} from "@fedresda/types";
import { createLdoDataset, parseRdf } from "@ldo/ldo";
import { namedNode } from "@ldo/rdf-utils";
import type { Quad } from "@rdfjs/types";
import type { NextFunction, Request, Response } from "express";
import { validate } from "json-schema";
import type { IntegrationPodGlobals } from "../globals";
import { HttpError } from "./HttpError";
import { findStatisticPlugin } from "./statistics";

const STATISTIC_NAME_PREDICATE =
  "https://fedresda.setmeld.org/statistic-access-rule#statisticName";
const ALLOWED_PATH_PREDICATE =
  "https://fedresda.setmeld.org/statistics#allowedPath";

type RdfTerm = { value?: string };
type QuadLike = { subject?: RdfTerm; object?: RdfTerm };
type DatasetLike = {
  match: (s: unknown, p: unknown, o: unknown) => unknown;
  usingType: <T>(shapeType: unknown) => {
    fromSubject: (subject: string) => T;
  };
};

function asQuads(matchResult: unknown): QuadLike[] {
  const maybeToArray = matchResult as { toArray?: () => unknown[] };
  if (typeof maybeToArray.toArray !== "function") {
    return [];
  }
  return maybeToArray.toArray() as QuadLike[];
}

function getResourceUriFromQuery(query: unknown): string | undefined {
  if (!query || typeof query !== "object") {
    return undefined;
  }
  const value = (query as { resourceUri?: unknown }).resourceUri;
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }
  return value;
}

function getStatisticAccessRuleUri(resourceUri: string): string {
  if (resourceUri.endsWith(".statistic-access-rule.ttl")) {
    return resourceUri;
  }
  if (/\.ttl$/i.test(resourceUri)) {
    return resourceUri.replace(/\.ttl$/i, ".statistic-access-rule.ttl");
  }
  return `${resourceUri}.statistic-access-rule.ttl`;
}

function toResourceStorePath(uri: string): string {
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }
  return new URL(uri, "http://localhost:3000").href;
}

async function streamToArray(stream: unknown): Promise<unknown[]> {
  const iterable = stream as AsyncIterable<unknown>;
  if (
    !iterable ||
    typeof (iterable as { [Symbol.asyncIterator]?: unknown })[
      Symbol.asyncIterator
    ] !== "function"
  ) {
    throw new Error("Representation data is not readable.");
  }
  const chunks: unknown[] = [];
  for await (const chunk of iterable) {
    chunks.push(chunk);
  }
  return chunks;
}

async function extractPluginStatisticAccessRule(
  dataset: DatasetLike,
  pluginName: string,
): Promise<unknown> {
  const byStatisticName = asQuads(
    dataset.match(null, namedNode(STATISTIC_NAME_PREDICATE), null),
  );
  const policyNode = byStatisticName.find(
    (quad) => quad.object?.value === pluginName,
  )?.subject?.value;
  // #region agent log
  fetch("http://127.0.0.1:7246/ingest/1a0f9c29-0ae3-48eb-b88e-09395ef55ec4", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "d30084",
    },
    body: JSON.stringify({
      sessionId: "d30084",
      runId: "policy-debug-2",
      hypothesisId: "H5",
      location: "handleStatiscQuery.ts:extractPluginStatisticAccessRule",
      message: "Selected policy node for plugin",
      data: {
        pluginName,
        policyNode,
        statisticNameMatchCount: byStatisticName.length,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!policyNode) {
    throw new HttpError(
      403,
      `No statistic access rule entry found for statistic '${pluginName}'.`,
    );
  }

  const allowedPathMatches = asQuads(
    dataset.match(policyNode, namedNode(ALLOWED_PATH_PREDICATE), null),
  );
  // #region agent log
  fetch("http://127.0.0.1:7246/ingest/1a0f9c29-0ae3-48eb-b88e-09395ef55ec4", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "d30084",
    },
    body: JSON.stringify({
      sessionId: "d30084",
      runId: "policy-debug-2",
      hypothesisId: "H6",
      location: "handleStatiscQuery.ts:extractPluginStatisticAccessRule",
      message: "Allowed path triples on selected policy node",
      data: {
        policyNode,
        allowedPathTripleCount: allowedPathMatches.length,
        firstAllowedPathNode: allowedPathMatches[0]?.object?.value ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (pluginName === "mean") {
    return dataset
      .usingType(MeanStatisticAccessRuleShapeType)
      .fromSubject(policyNode);
  }
  if (pluginName === "kaplan-meier") {
    return dataset
      .usingType(KaplanMeierStatisticAccessRuleShapeType)
      .fromSubject(policyNode);
  }

  throw new HttpError(
    500,
    `Statistic access rule parsing is not configured for statistic '${pluginName}'.`,
  );
}

async function loadStatisticAccessRuleFromStore(
  globals: IntegrationPodGlobals,
  statisticAccessRuleUri: string,
): Promise<DatasetLike> {
  const path = toResourceStorePath(statisticAccessRuleUri);
  const store = globals.resourceStore as unknown as {
    getRepresentation: (identifier: { path: string }) => Promise<unknown>;
  };
  const representation = await store.getRepresentation({ path });
  const data = (representation as { data?: unknown }).data;
  if (!data) {
    throw new Error(
      "Statistic access rule representation has no readable body.",
    );
  }
  const chunks = await streamToArray(data);
  const firstChunk = chunks[0];
  const firstChunkType = Buffer.isBuffer(firstChunk)
    ? "buffer"
    : typeof firstChunk;

  if (
    firstChunkType === "string" ||
    firstChunkType === "buffer" ||
    firstChunk === undefined
  ) {
    const binaryChunks: Buffer[] = chunks.map((chunk) => {
      if (typeof chunk === "string") {
        return Buffer.from(chunk);
      }
      if (Buffer.isBuffer(chunk)) {
        return chunk;
      }
      return Buffer.from(String(chunk));
    });
    const turtle = Buffer.concat(binaryChunks).toString("utf8");
    return (await parseRdf(turtle, {
      baseIRI: statisticAccessRuleUri,
      format: "Turtle",
    })) as unknown as DatasetLike;
  }

  return createLdoDataset(chunks as Quad[]) as unknown as DatasetLike;
}

export function createHandleStatiscQuery(globals: IntegrationPodGlobals) {
  return async (req: Request, res: Response, _next: NextFunction) => {
    const { route } = req.params;
    const plugin = findStatisticPlugin(route);
    if (!plugin) {
      res.status(404).json({ error: `Unknown statistic: ${route}` });
      return;
    }

    const validationResult = validate(req.body, plugin.querySchema);
    if (!validationResult.valid) {
      const message = validationResult.errors
        .map((error) => `${error.property || "<root>"}: ${error.message}`)
        .join("; ");
      throw new HttpError(
        400,
        `Invalid query for statistic '${route}': ${message}`,
      );
    }

    const resourceUri = getResourceUriFromQuery(req.body);
    if (!resourceUri) {
      throw new HttpError(
        400,
        "Missing query.resourceUri for statistic access rule evaluation.",
      );
    }

    const statisticAccessRuleUri = getStatisticAccessRuleUri(resourceUri);
    const statisticAccessRuleDataset = await loadStatisticAccessRuleFromStore(
      globals,
      statisticAccessRuleUri,
    );
    const pluginStatisticAccessRule = await extractPluginStatisticAccessRule(
      statisticAccessRuleDataset,
      plugin.name,
    );
    const policyResult = plugin.evaluateStatisticAccessRule(
      req.body,
      pluginStatisticAccessRule,
    );
    if (policyResult instanceof Error) {
      throw new HttpError(403, policyResult.message);
    }
    const result = await plugin.performQuery(req.body, globals);
    res.json(result);
  };
}
