// app/api/crm/territory/route.ts
import { createListHandler } from "@/lib/api-factory";

export const GET = createListHandler("Territory", {
  allowedFields: ["name", "territory_name"],
  defaultSort: { field: "territory_name", order: "asc" },
});
