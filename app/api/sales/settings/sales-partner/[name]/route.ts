import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";
import { SalesPartnerUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Sales Partner");
export const PUT = createUpdateHandler("Sales Partner", SalesPartnerUpdateSchema);
export const DELETE = createDeleteHandler("Sales Partner");