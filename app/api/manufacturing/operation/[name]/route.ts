// app/api/manufacturing/operation/[name]/route.ts
// Pana ERP v3.0 - Operation Single Document API

import {
  createGetHandler,
  createUpdateHandler,
  createDeleteHandler,
} from "@/lib/api-factory";
import { OperationUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Operation");
export const PUT = createUpdateHandler("Operation", OperationUpdateSchema);
export const DELETE = createDeleteHandler("Operation");
