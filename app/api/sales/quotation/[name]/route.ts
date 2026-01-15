// app/api/sales/quotation/[name]/route.ts
// Pana ERP v3.0 - Single Quotation API Routes

import {
  createDocHandler,
  createUpdateHandler,
  createDeleteHandler,
} from "@/lib/api-factory";
import { QuotationUpdateSchema } from "@/lib/schemas/doctype-schemas";

// GET /api/sales/quotation/[name] - Get single quotation
export const GET = createDocHandler("Quotation");

// PUT /api/sales/quotation/[name] - Update quotation
export const PUT = createUpdateHandler("Quotation", QuotationUpdateSchema);

// DELETE /api/sales/quotation/[name] - Delete quotation
export const DELETE = createDeleteHandler("Quotation");
