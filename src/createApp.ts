import express, { Express } from "express";
import { createApiRouter } from "./api/apiRouter";
import { setGlobals } from "./globals";

export function createApp(base: string, rootFilePath: string): Express {
  const app = express();
  app.use(express.json());

  setGlobals({
    baseUrl: base,
    rootFilePath,
  });

  const apiRouter = createApiRouter();

  app.use("/.api", apiRouter);

  return app;
}
