import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";
import { WorkstationUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Workstation");
export const PUT = createUpdateHandler("Workstation", WorkstationUpdateSchema);
export const DELETE = createDeleteHandler("Workstation");