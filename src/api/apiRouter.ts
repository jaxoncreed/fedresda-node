import express, { NextFunction, Request, Response } from "express";
import { createValidateWebId } from "./validateWebId";
import { HttpError } from "./HttpError";
import { getGlobals } from "../globals";
import { createAggregateRouter } from "./aggregate/aggregateRouter";

export function createApiRouter() {
  const apiRouter = express.Router();

  /**
   * ===========================================================================
   * AUTHENTICATED FUNCTIONS (including aggregate API)
   * ===========================================================================
   */
  apiRouter.use(createValidateWebId());

  /**
   * ===========================================================================
   * AGGREGATE API (term policy + aggregate search)
   * ===========================================================================
   */
  apiRouter.use("/aggregate", createAggregateRouter());

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
