// app/api/crm/lead-source/route.ts
import { createListHandler } from "@/lib/api-factory";

export const GET = createListHandler("Lead Source", {
  allowedFields: ["name", "source_name"],
  defaultSort: { field: "source_name", order: "asc" },
});
