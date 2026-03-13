import express, { NextFunction, Request, Response } from "express";
import { createValidateWebId } from "./validateWebId";
import { HttpError } from "./HttpError";
import { getGlobals } from "../globals";
import { findStatisticPlugin } from "./statistics";
import { validate } from "json-schema";

export function createApiRouter() {
  const apiRouter = express.Router();
  const globals = getGlobals();
  const handleStatisticQuery = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
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

    const result = await plugin.performQuery(req.body, globals);
    res.json(result);
  };

  /**
   * ===========================================================================
   * AUTHENTICATED FUNCTIONS
   * ===========================================================================
   */
  apiRouter.use(createValidateWebId());
  apiRouter.use(express.json({ limit: "1mb" }));

  /**
   * ===========================================================================
   * STATISTICS ROUTES
   * ===========================================================================
   */
  apiRouter.post("/stat/:route", handleStatisticQuery);

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
