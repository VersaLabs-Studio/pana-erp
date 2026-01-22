// @ts-nocheck
import {
  createGetHandler,
  createUpdateHandler,
  createDeleteHandler,
} from "@/lib/api-factory";
import { BOMUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("BOM");
export const PUT = createUpdateHandler("BOM", BOMUpdateSchema);
export const DELETE = createDeleteHandler("BOM");
