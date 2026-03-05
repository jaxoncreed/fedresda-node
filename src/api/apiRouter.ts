import express, { NextFunction, Request, Response } from "express";
import { createValidateWebId } from "./validateWebId";
import { HttpError } from "./HttpError";
import { getGlobals } from "../globals";
import { TermPolicyService } from "./statistics/policy";
import { AggregateService } from "./statistics/aggregateService";

function asSingleHeaderValue(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return undefined;
}

export function createApiRouter() {
  const apiRouter = express.Router();
  const { resourceStore } = getGlobals();
  const termPolicyService = new TermPolicyService(resourceStore);
  const aggregateService = new AggregateService(termPolicyService);

  /**
   * ===========================================================================
   * AUTHENTICATED FUNCTIONS
   * ===========================================================================
   */
  apiRouter.use(createValidateWebId());
  apiRouter.use(express.json({ limit: "1mb" }));

  /**
   * ===========================================================================
   * AGGREGATE TERM POLICY API
   * ===========================================================================
   */
  apiRouter.post(
    "/aggregate",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const validated = await aggregateService.validateRequest(req.body, {
          authorization: asSingleHeaderValue(req.headers.authorization),
          cookie: asSingleHeaderValue(req.headers.cookie),
          dpop: asSingleHeaderValue(
            req.headers.dpop as string | string[] | undefined,
          ),
        });
        res.status(202).json({
          status: "accepted",
          note: "Policy validation succeeded. Aggregate execution engine is pending implementation.",
          policyDocuments: validated.policyDocuments,
          validations: validated.validations,
          query: validated.request.query,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * ===========================================================================
   * ERROR HANDLING
   * ===========================================================================
   */
  apiRouter.use(
    (err: unknown, req: Request, res: Response, _next: NextFunction) => {
      const { logger } = getGlobals();
      if (err instanceof Error) {
        logger.error("API Error", { error: err.message, stack: err.stack });
      }
      const error = HttpError.from(err);
      res.status(error.status).send(error.message);
    },
  );

  return apiRouter;
}
