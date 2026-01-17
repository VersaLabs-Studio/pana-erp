# Pana ERP v3.0 - Sales Order Module Implementation Tasks

> **Created:** 2026-01-17  
> **Target:** GLM 4.7 Agentic Coding Assistant  
> **Phase:** 2D - Sales Order Module  
> **Status:** Ready for Implementation

---

## Pre-Implementation Context

The following has been **COMPLETED** by the Lead Agent:

1. ✅ **Types Generated**: `SalesOrder`, `SalesPartner`, `SalesPerson` interfaces in `types/doctype-types.ts`
2. ✅ **Schemas Updated**: `SalesOrderCreateSchema`, `SalesPartnerCreateSchema`, `SalesPersonCreateSchema` in `lib/schemas/doctype-schemas.ts`
3. ✅ **DocType Config**: Sales Person and Sales Partner added to `lib/doctype-config.ts`
4. ✅ **Query Keys**: Added to `lib/query-keys.ts`
5. ✅ **Business Logic Doc**: `docs/v3/business-logic/SALES_ORDER_WORKFLOW.md`

---

## Implementation Tasks for GLM 4.7

### TASK 1: Sales Person Utility Module

**Reference Template:** `app/crm/settings/customer-group/`

#### 1.1 API Routes

**File: `app/api/sales/settings/sales-person/route.ts`**
```typescript
// Pana ERP v3.0 - Sales Person API (GET list, POST create)
import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { SalesPersonCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("Sales Person", {
  allowedFields: ["name", "sales_person_name", "enabled", "parent_sales_person", "employee", "is_group", "creation"],
  defaultSort: { field: "creation", order: "desc" },
  defaultLimit: 100,
});

export const POST = createCreateHandler("Sales Person", SalesPersonCreateSchema);
```

**File: `app/api/sales/settings/sales-person/[name]/route.ts`**
```typescript
// Pana ERP v3.0 - Sales Person Single Doc API
import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";
import { SalesPersonUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Sales Person");
export const PUT = createUpdateHandler("Sales Person", SalesPersonUpdateSchema);
export const DELETE = createDeleteHandler("Sales Person");
```

#### 1.2 Client Pages

**File: `app/sales/settings/sales-person/page.tsx`** (List)
- Display: `sales_person_name`, enabled badge
- Actions: Edit, Delete
- Search by name
- Follow the pattern from `app/crm/settings/customer-group/page.tsx`

**File: `app/sales/settings/sales-person/new/page.tsx`** (Create)
Form fields:
- `sales_person_name` (FormInput, required)
- `parent_sales_person` (FormFrappeSelect: "Sales Person", filter by is_group=1)
- `enabled` (FormSwitch, default: true)
- `employee` (FormFrappeSelect: "Employee", optional)

**File: `app/sales/settings/sales-person/[name]/edit/page.tsx`** (Edit)
- Same as create, pre-populated

---

### TASK 2: Sales Partner Utility Module

**Reference Template:** `app/crm/settings/customer-group/`

#### 2.1 API Routes

**File: `app/api/sales/settings/sales-partner/route.ts`**
```typescript
// Pana ERP v3.0 - Sales Partner API (GET list, POST create)
import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { SalesPartnerCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("Sales Partner", {
  allowedFields: ["name", "partner_name", "partner_type", "commission_rate", "territory", "creation"],
  defaultSort: { field: "creation", order: "desc" },
  defaultLimit: 100,
});

export const POST = createCreateHandler("Sales Partner", SalesPartnerCreateSchema);
```

**File: `app/api/sales/settings/sales-partner/[name]/route.ts`**
```typescript
// Pana ERP v3.0 - Sales Partner Single Doc API
import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";
import { SalesPartnerUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Sales Partner");
export const PUT = createUpdateHandler("Sales Partner", SalesPartnerUpdateSchema);
export const DELETE = createDeleteHandler("Sales Partner");
```

#### 2.2 Client Pages

**File: `app/sales/settings/sales-partner/page.tsx`** (List)
- Display: `partner_name`, `partner_type`, `commission_rate` badge
- Actions: Edit, Delete
- Search by name

**File: `app/sales/settings/sales-partner/new/page.tsx`** (Create)
Form fields:
- `partner_name` (FormInput, required) - e.g., "ABC Design Agency"
- `partner_type` (FormSelect with options: ["Reseller", "Agency", "Distributor", "Freelancer", "Other"])
- `commission_rate` (FormInput number, required) - Percentage, e.g., 10
- `territory` (FormFrappeSelect: "Territory", optional)
- `description` (FormTextarea, optional)

**File: `app/sales/settings/sales-partner/[name]/edit/page.tsx`** (Edit)
- Same as create, pre-populated

---

### TASK 3: Update Sales Settings Hub

**File: `app/sales/settings/page.tsx`**

Add the new settings items to the existing page:

```typescript
const settingsItems = [
  {
    title: "Tax Templates",
    description: "Manage sales tax templates like VAT 15%, Withholding Tax, etc.",
    icon: Calculator,
    href: "/sales/settings/taxes",
  },
  {
    title: "Terms and Conditions",
    description: "Standard legal terms like '50% Advance Required', 'No Refunds on Custom Print'.",
    icon: FileText,
    href: "/sales/settings/terms",
  },
  // ADD THESE NEW ITEMS:
  {
    title: "Sales Persons",
    description: "Manage your sales team members for commission tracking and performance.",
    icon: Users,
    href: "/sales/settings/sales-person",
  },
  {
    title: "Sales Partners",
    description: "Manage external partners, resellers, and agencies who bring business.",
    icon: Handshake, // or UserPlus
    href: "/sales/settings/sales-partner",
  },
];
```

---

### TASK 4: Sales Order API Routes

#### 4.1 List & Create Route

**File: `app/api/sales/sales-order/route.ts`**
```typescript
// Pana ERP v3.0 - Sales Order API (GET list, POST create)
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
    "Sales Order.creation", // Use explicit table reference to avoid ambiguity
  ],
  defaultSort: { field: "Sales Order.creation", order: "desc" },
  defaultLimit: 50,
});

export const POST = createCreateHandler("Sales Order", SalesOrderCreateSchema);
```

#### 4.2 Single Document Route

**File: `app/api/sales/sales-order/[name]/route.ts`**
```typescript
// Pana ERP v3.0 - Sales Order Single Doc API
import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";
import { SalesOrderUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Sales Order");
export const PUT = createUpdateHandler("Sales Order", SalesOrderUpdateSchema);
export const DELETE = createDeleteHandler("Sales Order");
```

---

### TASK 5: Sales Order List Page

**File: `app/sales/sales-order/page.tsx`**

**Reference Template:** `app/sales/quotation/page.tsx`

#### Key Features:

1. **Status Filters:**
```typescript
const statusFilters = [
  { label: "All", value: "all" },
  { label: "Draft", value: "Draft" },
  { label: "To Deliver", value: "To Deliver and Bill" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];
```

2. **Status Badge Colors:**
```typescript
const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case "Draft": return "bg-secondary text-secondary-foreground";
    case "To Deliver and Bill": return "bg-blue-500/20 text-blue-600";
    case "To Deliver": return "bg-amber-500/20 text-amber-600";
    case "To Bill": return "bg-purple-500/20 text-purple-600";
    case "Completed": return "bg-emerald-500/20 text-emerald-600";
    case "Cancelled": return "bg-destructive/20 text-destructive";
    case "Closed": return "bg-gray-500/20 text-gray-600";
    default: return "bg-secondary text-secondary-foreground";
  }
};
```

3. **Overdue Indicator:**
```typescript
const isOverdue = (order: SalesOrder) => {
  if (!order.delivery_date) return false;
  if (order.status === "Completed" || order.status === "Cancelled") return false;
  return new Date(order.delivery_date) < new Date();
};
```
Display a red "Overdue" badge or border on overdue orders.

4. **Row Columns:**
   - Order ID (name)
   - Customer Name
   - Grand Total (formatted currency)
   - Delivery Date (with overdue indicator)
   - Status Badge
   - Actions Dropdown

---

### TASK 6: Sales Order Create Page

**File: `app/sales/sales-order/new/page.tsx`**

**Reference Template:** `app/sales/quotation/new/page.tsx`

#### Critical Features:

1. **URL-Based Pre-population from Quotation:**
```typescript
const searchParams = useSearchParams();
const quotationId = searchParams.get('quotation');

useEffect(() => {
  if (quotationId) {
    fetch(`/api/sales/quotation/${encodeURIComponent(quotationId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          const quotation = data.data;
          form.reset({
            customer: quotation.party_name,
            customer_name: quotation.customer_name,
            customer_address: quotation.customer_address,
            contact_person: quotation.contact_person,
            taxes_and_charges: quotation.taxes_and_charges,
            tc_name: quotation.tc_name,
            terms: quotation.terms,
            items: quotation.items?.map((item: any) => ({
              item_code: item.item_code,
              item_name: item.item_name,
              description: item.description,
              qty: item.qty,
              rate: item.rate,
              amount: item.amount,
              uom: item.uom,
            })),
            // Required fields with defaults
            transaction_date: new Date().toISOString().split('T')[0],
            delivery_date: "", // User MUST fill this
            order_type: "Sales",
            // ... other defaults
          });
          
          toast.info(`Pre-filled from Quotation: ${quotationId}`);
        }
      });
  }
}, [quotationId]);
```

2. **Form Sections:**

**Header Section:**
- `customer` (FormFrappeSelect: "Customer", required)
- `transaction_date` (FormDatePicker, default: today)
- `delivery_date` (FormDatePicker, **REQUIRED**, label: "Due Date")
- `order_type` (FormSelect: ["Sales", "Maintenance"], default: "Sales")
- `company` (FormFrappeSelect: "Company", required)

**Address & Contact Section:**
- `customer_address` (FormFrappeSelect: "Address", filtered by Dynamic Link to customer)
- `contact_person` (FormFrappeSelect: "Contact", filtered by Dynamic Link to customer)

**Customer PO Section (Collapsible):**
- `po_no` (FormInput - Customer's PO Number)
- `po_date` (FormDatePicker)

**Sales Team Section (Collapsible):**
- `sales_partner` (FormFrappeSelect: "Sales Partner", optional)
- On sales_partner change, fetch commission_rate and display it

**Items Grid Section:**
- Same as Quotation: useFieldArray for `items`
- Columns: `item_code`, `description` (Technical Specs), `qty`, `rate`, `amount`
- Real-time subtotal calculation

**Financials Section:**
- `taxes_and_charges` (FormFrappeSelect: "Sales Taxes and Charges Template")
- Display: Subtotal, Taxes, Grand Total (calculated)

**Terms Section:**
- `tc_name` (FormFrappeSelect: "Terms and Conditions")
- On tc_name change, fetch and display terms text preview

3. **Default Values:**
```typescript
const defaultValues = {
  naming_series: "SAL-ORD-.YYYY.-",
  order_type: "Sales",
  transaction_date: new Date().toISOString().split('T')[0],
  delivery_date: "", // Required - user must input
  status: "Draft",
  currency: "ETB",
  conversion_rate: 1,
  selling_price_list: "Standard Selling",
  price_list_currency: "ETB",
  plc_conversion_rate: 1,
  items: [],
};
```

---

### TASK 7: Sales Order Edit Page

**File: `app/sales/sales-order/[name]/edit/page.tsx`**

**Reference Template:** `app/sales/quotation/[name]/edit/page.tsx`

- Same structure as Create page
- Pre-populate with existing data using `useFrappeDoc`
- Only allow editing if `docstatus === 0` (Draft)
- If `docstatus !== 0`, show read-only view or redirect to detail page with warning

---

### TASK 8: Sales Order Detail Page (THE CRITICAL ONE)

**File: `app/sales/sales-order/[name]/page.tsx`**

**Reference Template:** `app/sales/quotation/[name]/page.tsx`

#### Critical Features:

1. **The "Artwork Gatekeeper" UI (Frontend-Only Logic):**
```typescript
// React state for artwork verification
const [isArtworkVerified, setIsArtworkVerified] = useState(false);

// In the UI, create a prominent card:
<InfoCard title="Pre-Production Checklist" icon="clipboard-check" variant="warning">
  <div className="space-y-4">
    <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl">
      <div>
        <p className="font-semibold text-foreground">Artwork Verification</p>
        <p className="text-sm text-muted-foreground">
          Confirm that all artwork files have been received and approved before starting production.
        </p>
      </div>
      <Switch
        checked={isArtworkVerified}
        onCheckedChange={setIsArtworkVerified}
        className="data-[state=checked]:bg-emerald-500"
      />
    </div>
    
    {!isArtworkVerified && salesOrder.docstatus === 0 && (
      <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Production cannot start until artwork is verified. Toggle the switch above when ready.
        </p>
      </div>
    )}
  </div>
</InfoCard>
```

2. **Submit Button Logic:**
```typescript
// The Submit button in actions
<Button
  onClick={handleSubmit}
  disabled={!isArtworkVerified || salesOrder.docstatus !== 0 || submitMutation.isPending}
  className="..."
>
  {submitMutation.isPending ? <Loader2 className="animate-spin" /> : null}
  Submit Order
</Button>
```

3. **Action Handlers:**
```typescript
// Submit (Draft → To Deliver and Bill)
const handleSubmit = async () => {
  if (!isArtworkVerified) {
    toast.error("Please verify artwork before submitting");
    return;
  }
  await updateMutation.mutateAsync({ docstatus: 1 });
  toast.success("Sales Order submitted successfully");
};

// Cancel (docstatus 1 → 2)
const handleCancel = async () => {
  await updateMutation.mutateAsync({ docstatus: 2 });
  toast.success("Sales Order cancelled");
};
```

4. **Action Buttons by Status:**
```typescript
// Draft (docstatus: 0)
- Edit
- Delete
- Submit (ONLY enabled if isArtworkVerified)

// Submitted (docstatus: 1, status: "To Deliver and Bill")
- Create Delivery Note (placeholder/disabled - Phase 3)
- Create Invoice (placeholder/disabled - Phase 3)
- Cancel
- Print

// Completed
- Print
- View linked documents (future)

// Cancelled
- No actions
```

5. **Invoice-Like Layout:**
- Company header with logo
- Customer info section
- Items table with description, qty, rate, amount
- Totals section (Subtotal, Taxes, Grand Total)
- Terms section
- Source quotation link (if applicable)

---

### TASK 9: Update Quotation Detail Page

**File: `app/sales/quotation/[name]/page.tsx`**

Add the "Create Sales Order" button for submitted quotations:

```typescript
// In the actions section, add:
{quotation.docstatus === 1 && quotation.status === "Open" && (
  <Button
    variant="default"
    className="rounded-full"
    onClick={() => router.push(`/sales/sales-order/new?quotation=${encodeURIComponent(quotation.name)}`)}
  >
    <ShoppingCart className="h-4 w-4 mr-2" />
    Create Sales Order
  </Button>
)}
```

Make sure to import `ShoppingCart` from lucide-react.

---

## File Structure Summary

```
app/sales/
├── sales-order/
│   ├── page.tsx                   # List View (Task 5)
│   ├── new/page.tsx               # Create Form with Quotation pre-fill (Task 6)
│   └── [name]/
│       ├── page.tsx               # Detail View with Artwork Gatekeeper (Task 8)
│       └── edit/page.tsx          # Edit Form (Task 7)
│
├── quotation/
│   └── [name]/page.tsx            # UPDATE: Add "Create Sales Order" button (Task 9)
│
└── settings/
    ├── page.tsx                   # UPDATE: Add Sales Person, Sales Partner links (Task 3)
    ├── sales-person/
    │   ├── page.tsx               # List (Task 1.2)
    │   ├── new/page.tsx           # Create (Task 1.2)
    │   └── [name]/edit/page.tsx   # Edit (Task 1.2)
    └── sales-partner/
        ├── page.tsx               # List (Task 2.2)
        ├── new/page.tsx           # Create (Task 2.2)
        └── [name]/edit/page.tsx   # Edit (Task 2.2)

app/api/sales/
├── sales-order/
│   ├── route.ts                   # GET list, POST create (Task 4.1)
│   └── [name]/route.ts            # GET, PUT, DELETE (Task 4.2)
│
└── settings/
    ├── sales-person/
    │   ├── route.ts               # GET list, POST create (Task 1.1)
    │   └── [name]/route.ts        # GET, PUT, DELETE (Task 1.1)
    └── sales-partner/
        ├── route.ts               # GET list, POST create (Task 2.1)
        └── [name]/route.ts        # GET, PUT, DELETE (Task 2.1)
```

---

## Import Patterns

```typescript
// Types
import type { SalesOrder, SalesPartner, SalesPerson } from "@/types/doctype-types";

// Schemas
import { 
  SalesOrderCreateSchema, 
  SalesPartnerCreateSchema, 
  SalesPersonCreateSchema 
} from "@/lib/schemas/doctype-schemas";

// Hooks
import { useFrappeList, useFrappeDoc, useFrappeCreate, useFrappeUpdate, useFrappeDelete } from "@/hooks/generic";

// Components
import { PageHeader, ConfirmDialog, LoadingState, EmptyState } from "@/components/smart";
import { InfoCard, DataPoint } from "@/components/ui/info-card";
import { FormInput, FormTextarea, FormSelect, FormFrappeSelect, FormSwitch, FormDatePicker } from "@/components/form";
```

---

## Testing Checklist

After implementation:

- [ ] Create Sales Person "John Sales"
- [ ] Create Sales Partner "ABC Design Agency" with 10% commission
- [ ] Verify settings hub shows all 4 items
- [ ] Create Sales Order directly (without quotation)
- [ ] Verify delivery_date is required
- [ ] Try to Submit without checking Artwork Verified → should be disabled
- [ ] Check Artwork Verified → Submit should enable
- [ ] Submit Sales Order successfully
- [ ] Create Sales Order FROM Quotation using URL param
- [ ] Verify data pre-fills correctly
- [ ] Edit draft Sales Order
- [ ] Delete draft Sales Order
- [ ] Cancel submitted Sales Order
- [ ] Verify overdue indicator on list page
- [ ] Test dark mode on all pages
- [ ] Test responsive design

---

*This document serves as the implementation task guide for GLM 4.7 to build the Sales Order module.*
