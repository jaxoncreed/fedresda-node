import express, { NextFunction, Request, Response } from "express";
import { createValidateWebId } from "./validateWebId";
import { HttpError } from "./HttpError";
import { getGlobals } from "../globals";
import { findStatisticPlugin, getTermPolicySchemas } from "./statistics";
import { findDataSchema } from "./dataSchemas";

export function createApiRouter() {
  const apiRouter = express.Router();
  getGlobals();

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
  apiRouter.get(
    "/stat/:route",
    (req: Request, res: Response, _next: NextFunction) => {
      const { route } = req.params;
      const plugin = findStatisticPlugin(route);
      if (!plugin) {
        res.status(404).json({ error: `Unknown statistic: ${route}` });
        return;
      }
      res.json({
        name: plugin.name,
        route: plugin.route,
        termPolicySchema: plugin.termPolicySchema,
      });
    },
  );

  /**
   * ===========================================================================
   * TERM POLICY ROUTES
   * ===========================================================================
   */
  apiRouter.get(
    "/term-policy",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const termPolicies = await getTermPolicySchemas();
        res.json(termPolicies);
      } catch (err) {
        next(err);
      }
    },
  );

  apiRouter.get(
    "/data-schema/:name",
    (req: Request, res: Response, _next: NextFunction) => {
      const { name } = req.params;
      const schema = findDataSchema(name);
      if (!schema) {
        res.status(404).json({ error: `Unknown data schema: ${name}` });
        return;
      }
      res.json(schema);
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
