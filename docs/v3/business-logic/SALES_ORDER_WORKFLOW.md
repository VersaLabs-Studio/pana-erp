# Pana ERP v3.0 - Sales Order Module Business Logic

> **Version:** 1.0.0  
> **Created:** 2026-01-17  
> **Module:** Sales  
> **Phase:** 2D - The Commitment  
> **Status:** Implementation Ready

---

## Executive Summary

The **Sales Order (SO)** is the **pivot point** of the ERP and serves as the **"Single Source of Truth"** for the entire company:

- **For Sales:** It confirms the deal and the revenue.
- **For Production:** It is the instruction manual (Quantity, Specs, Deadline).
- **For Finance:** It is the trigger for billing.

**Key Innovation:** Since we cannot add custom fields (like `artwork_approved`), we implement the **"Artwork Check"** as a **Frontend Gatekeeper** feature. The database doesn't need to know; the UI prevents the user from clicking "Submit" until they explicitly confirm the artwork is ready.

---

## 1. Entity Map & Dependencies

| **DocType** | **Role** | **Dependency** | **Nuance for Printing** |
|-------------|----------|----------------|-------------------------|
| **Sales Order** | The Master Record | Customer, Quotation | The "Project File" for the job. |
| **Sales Order Item** | The Job Specs | Item | **Child Table**. Contains the definitive "Description" (Specs). |
| **Sales Person** | Performance Tracking | Independent | Who sold this? (Important for commissions). |
| **Sales Partner** | Channel Sales | Independent | External designers/agencies who bring work. |
| **Project** | Job Management | Optional | For large orders, link the SO to a Project. |

---

## 2. Business Workflow Logic

### A. The "Create from Quote" Flow (The Happy Path)

- **Trigger:** A Quotation reaches `Open` status (docstatus: 1).
- **Action:** User clicks "Create Sales Order" on the Quotation detail page.
- **Data Mapping:**
  - `customer`, `customer_name` → Copy 1:1
  - `items` (item_code, description, qty, rate) → Copy 1:1
  - `taxes_and_charges`, `taxes` → Copy 1:1
  - `tc_name`, `terms` → Copy 1:1
  - `customer_address`, `contact_person` → Copy 1:1
  - `delivery_date`: **Critical** - User must specify. This tells production the "Due Date."

### B. The "Artwork Gatekeeper" (Frontend Business Rule)

**The Problem:** We cannot add a custom `artwork_approved` field to the database.

**The Solution:** A **UI-Only Logic Layer** on the Detail Page.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ARTWORK GATEKEEPER UI PATTERN                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │ ⚠️  ARTWORK VERIFICATION REQUIRED                                 │  │
│   │    Production cannot start until artwork files are verified.     │  │
│   │                                                                   │  │
│   │    [ ] Artwork Files Verified & Ready                            │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   Implementation:                                                       │
│   1. React state: const [isArtworkVerified, setIsArtworkVerified]      │
│   2. "Submit" button is disabled={!isArtworkVerified || docstatus!==0} │
│   3. Visual alert when unchecked                                        │
│   4. No database field needed - purely frontend logic                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### C. Inventory Reservation (Standard ERPNext)

When a Sales Order is **Submitted** (docstatus: 1), ERPNext "Reserves" the items.

**Printing Business Context:**
- **Service Items** (e.g., "Printing Service"): No reservation needed.
- **Stock Items** (e.g., "1000 Business Cards"): Reserves stock, prevents double-selling.
- **Production Lite Strategy:** Raw material consumption handled via Stock Entry (Manufacture) in later phases.

### D. The "Reseller" Loop (Sales Partner)

**Context:** Print shops work with freelance designers (Resellers) who bring jobs.

**Implementation:**
- Use the standard `sales_partner` field on Sales Order.
- If a Designer brings the job, select them as Sales Partner.
- Standard ERPNext handles the "Commission Rate" automatically.

---

## 3. The Sales Order Lifecycle

### Status Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SALES ORDER LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────┐    Submit     ┌────────────────────┐                     │
│   │  DRAFT   │ ─────────────▶│  TO DELIVER AND    │                     │
│   │(docstatus:0)            │     BILL           │                     │
│   └────┬─────┘              │ (docstatus:1)      │                     │
│        │                    └────────┬───────────┘                     │
│        │ Edit/Delete                 │                                 │
│        └─────────────────────────────│                                 │
│                                      │                                 │
│                    ┌─────────────────┼─────────────────┐               │
│                    │                 │                 │               │
│                    ▼                 ▼                 ▼               │
│              ┌──────────┐    ┌───────────┐    ┌───────────────┐        │
│              │   TO     │    │    TO     │    │               │        │
│              │ DELIVER  │    │   BILL    │    │  COMPLETED    │        │
│              └────┬─────┘    └─────┬─────┘    │  (All Done)   │        │
│                   │                │          └───────────────┘        │
│                   │ Delivery Note  │ Sales Invoice                     │
│                   │ Created        │ Created                           │
│                   │                │                                   │
│                   └────────────────┴───────────────────────────────▶   │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │ CANCELLED: docstatus = 2 (Can only cancel if no linked docs)     │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │ OVERDUE: Display-only. delivery_date < today AND status != Done  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Status Definitions

| Status | `docstatus` | Description | Allowed Actions |
|--------|-------------|-------------|-----------------|
| **Draft** | `0` | Initial state. Order being prepared. | Edit, Delete, Submit |
| **To Deliver and Bill** | `1` | Submitted. Awaiting delivery and payment. | Create Delivery, Create Invoice |
| **To Deliver** | `1` | Invoiced but not delivered. | Create Delivery |
| **To Bill** | `1` | Delivered but not invoiced. | Create Invoice |
| **Completed** | `1` | Fully delivered and billed. | View only |
| **Cancelled** | `2` | Permanently cancelled. | None |
| **Overdue** | N/A | Calculated: `delivery_date < today` && not completed. | Display only |

---

## 4. Sales Order Form Fields

### Header Section
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company` | Link (Company) | ✅ | Your company |
| `customer` | Link (Customer) | ✅ | The buyer |
| `transaction_date` | Date | ✅ | Order date (default: today) |
| `delivery_date` | Date | ✅ | **Due Date** - Critical for production |
| `po_no` | Data | ❌ | Customer's PO Number (B2B tracking) |
| `po_date` | Date | ❌ | Customer's PO Date |

### Address & Contact Section
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customer_address` | Link (Address) | ❌ | Billing/Delivery address |
| `contact_person` | Link (Contact) | ❌ | Customer contact |

### Sales Team Section (Collapsible)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sales_partner` | Link (Sales Partner) | ❌ | Reseller/Designer who brought the job |
| `commission_rate` | Percent | ❌ | Auto-populated from Sales Partner |

### Items Section (Child Table)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item_code` | Link (Item) | ✅ | The service/product |
| `description` | Text | ✅ | **Technical specs** (GSM, color, size) |
| `qty` | Float | ✅ | Quantity |
| `rate` | Currency | ✅ | Per-unit price |
| `amount` | Currency | Auto | `qty × rate` (calculated) |

### Financials Section
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `selling_price_list` | Link | ✅ | Price list for currency |
| `currency` | Link | ✅ | Transaction currency |
| `taxes_and_charges` | Link | ❌ | Tax template |
| `total` | Currency | Auto | Sum of item amounts |
| `total_taxes_and_charges` | Currency | Auto | Tax amount |
| `grand_total` | Currency | Auto | Final total |

### Footer Section
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tc_name` | Link | ❌ | Terms and Conditions template |
| `terms` | Text | Auto | Populated from tc_name |

---

## 5. Quotation → Sales Order Integration

### URL-Based Pre-population

When creating a Sales Order from a Quotation:

```typescript
// In app/sales/sales-order/new/page.tsx
const searchParams = useSearchParams();
const quotationId = searchParams.get('quotation');

useEffect(() => {
  if (quotationId) {
    // Fetch quotation data
    fetch(`/api/sales/quotation/${quotationId}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          const quotation = data.data;
          // Pre-fill form with quotation data
          form.reset({
            customer: quotation.party_name,
            customer_name: quotation.customer_name,
            customer_address: quotation.customer_address,
            contact_person: quotation.contact_person,
            taxes_and_charges: quotation.taxes_and_charges,
            tc_name: quotation.tc_name,
            terms: quotation.terms,
            items: quotation.items?.map(item => ({
              item_code: item.item_code,
              item_name: item.item_name,
              description: item.description,
              qty: item.qty,
              rate: item.rate,
              amount: item.amount,
            })),
            // User must specify delivery_date
            delivery_date: '', // Required - user input
          });
        }
      });
  }
}, [quotationId]);
```

### Quotation Detail Page Enhancement

Add "Create Sales Order" button to Quotation detail page when status is "Open":

```typescript
// In quotation detail page actions
{quotation.docstatus === 1 && quotation.status === "Open" && (
  <Button onClick={() => router.push(`/sales/sales-order/new?quotation=${quotation.name}`)}>
    <ShoppingCart className="h-4 w-4 mr-2" /> Create Sales Order
  </Button>
)}
```

---

## 6. UI/UX Considerations

### List Page
- Premium card-based layout with status badges
- Quick filters: All, Draft, To Deliver, Completed, Overdue
- **Overdue Indicator:** Red badge/border if `delivery_date < today` and not completed
- Search by ID, customer name

### Detail Page
- Professional invoice-like layout
- **Artwork Gatekeeper Card:** Prominent toggle with alert messaging
- Clear action buttons based on current status
- Link to source Quotation (if applicable)
- Future: Link to Delivery Notes and Invoices

### Create/Edit Page
- Smart auto-selection of address/contact from Customer
- **delivery_date as mandatory field** with date picker
- Items table editor (similar to Quotation)
- Collapsible "Sales Team" section for partner/commission
- Sticky action bar with Artwork verification reminder on submit

---

## 7. File Structure

```
app/sales/
├── sales-order/
│   ├── page.tsx                   # List View
│   ├── new/page.tsx               # Create Form (with quotation pre-fill)
│   └── [name]/
│       ├── page.tsx               # Detail View (with Artwork Gatekeeper)
│       └── edit/page.tsx          # Edit Form
│
└── settings/
    ├── page.tsx                   # Settings Hub (add Sales Person, Sales Partner)
    ├── sales-person/
    │   ├── page.tsx               # List
    │   ├── new/page.tsx           # Create
    │   └── [name]/edit/page.tsx   # Edit
    └── sales-partner/
        ├── page.tsx               # List
        ├── new/page.tsx           # Create
        └── [name]/edit/page.tsx   # Edit
```

---

## 8. API Routes

```
app/api/sales/
├── sales-order/
│   ├── route.ts                   # GET (list), POST (create)
│   └── [name]/route.ts            # GET (single), PUT (update), DELETE
│
└── settings/
    ├── sales-person/
    │   ├── route.ts               # GET (list), POST (create)
    │   └── [name]/route.ts        # GET, PUT, DELETE
    └── sales-partner/
        ├── route.ts               # GET (list), POST (create)
        └── [name]/route.ts        # GET, PUT, DELETE
```

---

## 9. Testing Checklist

- [ ] Create Sales Person ("John Sales")
- [ ] Create Sales Partner ("Reseller Design Co", commission 10%)
- [ ] Create Sales Order directly (without quotation)
- [ ] Verify Artwork Gatekeeper blocks Submit when unchecked
- [ ] Verify Submit works when Artwork is checked
- [ ] Create Sales Order FROM Quotation (test URL pre-fill)
- [ ] Verify quotation data populates correctly
- [ ] Edit draft Sales Order
- [ ] Delete draft Sales Order
- [ ] Cancel submitted Sales Order
- [ ] Verify overdue indicator on list page
- [ ] Test dark/light mode
- [ ] Test responsive design

---

## 10. Phase 3 Hooks (Future)

The Sales Order detail page will eventually have:
- "Create Delivery Note" button → Phase 3
- "Create Sales Invoice" button → Phase 3
- View linked documents section

For now, these buttons can be placeholder/disabled with tooltip "Coming in Phase 3".

---

*This document serves as the authoritative business logic reference for the Sales Order module in Pana ERP v3.0.*
