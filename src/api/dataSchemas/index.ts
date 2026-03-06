import type { Schema } from "shexj";
import { nemaline_myopathy_gistSchema } from "./nemaline";

const dataSchemaRegistry: Record<string, Schema> = {
  nemaline: nemaline_myopathy_gistSchema,
};

export function findDataSchema(name: string): Schema | undefined {
  return dataSchemaRegistry[name.toLowerCase()];
}
