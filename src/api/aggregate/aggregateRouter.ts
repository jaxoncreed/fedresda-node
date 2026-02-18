/**
 * Express router for aggregate API: GET term-policy (by document URL), POST search.
 * Term policy is stored as a Solid auxiliary resource; GET fetches it from the Pod.
 */

import { Router, Request, Response } from "express";
import { getGlobals } from "../../globals";
import { HttpError } from "../HttpError";
import {
  PolicyViolationError,
  validateRequestAgainstPolicy,
} from "./termPolicy";
import { runAggregateQuery } from "./sparql";
import type { AggregateRequest, NormalizedTermPolicy } from "./types";
import { loadTermPolicyFromPod } from "./termPolicyAux";
import { parseGistTermPolicy } from "./gistTermPolicy";
import { getDefaultGistTermPolicyJsonLd } from "./defaultGistTermPolicy";

export function createAggregateRouter(): Router {
  const router = Router();

  /**
   * GET /.api/aggregate/default-term-policy?document=<url>
   * Return default Gist term policy JSON-LD for the given document. Use when creating the auxiliary resource (e.g. after uploading a nemaline CSV).
   */
  router.get("/default-term-policy", (req: Request, res: Response) => {
    const documentUrl = req.query.document as string | undefined;
    if (!documentUrl || typeof documentUrl !== "string") {
      throw new HttpError(
        400,
        "invalid_request: query parameter 'document' is required.",
      );
    }
    const body = getDefaultGistTermPolicyJsonLd(documentUrl);
    res.setHeader("Content-Type", "application/ld+json");
    res.send(body);
  });

  /**
   * GET /.api/aggregate/term-policy?document=<url>
   * Return the term policy auxiliary resource for the given document (JSON-LD).
   * The document URL is the governed resource (e.g. https://mypod.com/admin/nemaline_findings.ttl).
   */
  router.get("/term-policy", async (req: Request, res: Response) => {
    const documentUrl = req.query.document as string | undefined;
    if (!documentUrl || typeof documentUrl !== "string") {
      throw new HttpError(
        400,
        "invalid_request: query parameter 'document' (URL of the governed document) is required.",
      );
    }
    try {
      const jsonLdString = await loadTermPolicyFromPod(documentUrl);
      res.setHeader("Content-Type", "application/ld+json");
      res.send(jsonLdString);
    } catch (e) {
      const err = e as Error & { statusCode?: number; code?: string };
      if (
        err.statusCode === 404 ||
        err.code === "ENOENT" ||
        (err.message && err.message.includes("404"))
      ) {
        throw new HttpError(
          404,
          "Term policy auxiliary resource not found for this document.",
        );
      }
      throw e;
    }
  });

  /**
   * POST /.api/aggregate/search
   * Body must include documentUrl (URL of the document being queried). The term policy is loaded from the Pod (auxiliary resource) and enforced.
   */
  router.post("/search", async (req: Request, res: Response) => {
    const { sparqlEndpoint, resourceStore } = getGlobals();
    if (!sparqlEndpoint) {
      throw new HttpError(503, "SPARQL endpoint not configured.");
    }
    if (!resourceStore) {
      throw new HttpError(
        503,
        "resourceStore not configured; cannot load term policy.",
      );
    }

    const body = req.body as AggregateRequest;
    if (!body || !Array.isArray(body.measures)) {
      throw new HttpError(
        400,
        "invalid_request: body must include measures array.",
      );
    }
    if (!body.documentUrl || typeof body.documentUrl !== "string") {
      throw new HttpError(
        400,
        "invalid_request: body must include documentUrl (URL of the document being queried, e.g. https://mypod.com/admin/nemaline_findings.ttl).",
      );
    }

    let policy: NormalizedTermPolicy;
    try {
      const jsonLdString = await loadTermPolicyFromPod(body.documentUrl);
      policy = parseGistTermPolicy(jsonLdString, body.documentUrl);
    } catch (e) {
      const err = e as Error & { statusCode?: number; code?: string };
      if (
        err.statusCode === 404 ||
        err.code === "ENOENT" ||
        (err.message && err.message.includes("404"))
      ) {
        throw new HttpError(
          404,
          "Term policy auxiliary resource not found for document. Create the auxiliary resource (e.g. by uploading a nemaline CSV or creating it in the UI).",
        );
      }
      throw e;
    }

    try {
      validateRequestAgainstPolicy(policy, body);
    } catch (e) {
      if (e instanceof PolicyViolationError) {
        throw new HttpError(403, `policy_violation: ${e.message}`);
      }
      throw e;
    }

    const options = {
      rounding: body.options?.rounding ?? 0,
      suppressSmallCells: body.options?.suppressSmallCells !== false,
      minCellSize: policy.minCellSize,
    };

    try {
      const result = await runAggregateQuery(
        policy,
        body,
        options,
        sparqlEndpoint,
      );
      res.setHeader("Content-Type", "application/ld+json");
      res.json(result);
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "disclosure_control") {
        throw new HttpError(
          422,
          "disclosure_control: " + (err.message ?? "Result suppressed"),
        );
      }
      throw e;
    }
  });

  return router;
}
