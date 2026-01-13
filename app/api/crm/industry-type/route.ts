// app/api/crm/industry-type/route.ts
import { createListHandler } from "@/lib/api-factory";

export const GET = createListHandler("Industry Type", {
  allowedFields: ["name", "industry"],
  defaultSort: { field: "industry", order: "asc" },
});
