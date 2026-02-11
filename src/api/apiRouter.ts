import express, { NextFunction, Request, Response } from "express";
import { createValidateWebId } from "./validateWebId";
import { HttpError } from "./HttpError";
import { getGlobals } from "../globals";

export function createApiRouter() {
  const apiRouter = express.Router();

  /**
   * ===========================================================================
   * AUTHENTICATED FUNCTIONS
   * ===========================================================================
   */
  apiRouter.use(createValidateWebId());

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
