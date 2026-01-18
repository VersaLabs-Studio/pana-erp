import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { SalesOrderCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("Sales Order", {
  allowedFields: [
    "name",
    "customer",
    "customer_name",
    "transaction_date",
    "delivery_date",
    "status",
    "grand_total",
    "currency",
    "per_delivered",
    "per_billed",
    "docstatus",
    "`tabSales Order`.creation", // Use explicit table reference to avoid ambiguity
  ],
  defaultSort: { field: "`tabSales Order`.creation", order: "desc" },
  defaultLimit: 50,
});

export const POST = createCreateHandler("Sales Order", SalesOrderCreateSchema);
