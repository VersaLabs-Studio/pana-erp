# Obsidian ERP v4.0 — Business Workflow Document (Part 2 of 3)
# Module Specifications: DocTypes, Fields, Validations & Wizards

> **Product:** Obsidian ERP  
> **Company:** VersaLabs Studio  
> **Document Version:** 4.0.0  
> **Last Updated:** 2026-05-31  
> **Depends On:** Part 1 (Lead-to-Cash)  
> **Audience:** Coding Agents — This document contains implementation-ready specifications

---

## Table of Contents

1. [How to Read This Document](#1-how-to-read-this-document)
2. [CRM Module Specs](#2-crm-module-specs)
3. [Sales Module Specs](#3-sales-module-specs)
4. [Stock Module Specs](#4-stock-module-specs)
5. [Buying Module Specs](#5-buying-module-specs)
6. [Manufacturing Module Specs](#6-manufacturing-module-specs)
7. [Accounting Module Specs](#7-accounting-module-specs)
8. [HR Module Specs](#8-hr-module-specs)
9. [New V4 Modules](#9-new-v4-modules)
10. [Settings/Master Modules](#10-settingsmaster-modules)

---

## 1. How to Read This Document

Each module specification follows this format:

```
MODULE: [Name]
├── DocType: [DocType Name]
│   ├── STATUS: Complete | Semi-Complete | Docs Only | NEW
│   ├── V4 ACTION: UX Overhaul | Full Build | Master Module Upgrade | New
│   ├── WIZARD STEPS: [number] — step descriptions
│   ├── AUTO-FILL FROM: [upstream DocType]
│   ├── CREATES DOWNSTREAM: [downstream DocType]
│   ├── KEY FIELDS: [list of important fields]
│   ├── VALIDATIONS: [business rules]
│   ├── LIST PAGE KPIs: [metrics shown on list page]
│   └── DETAIL PAGE ACTIONS: [buttons shown on detail page]
```

**For coding agents:** Use these specs to build pages. Every field listed here must appear in the wizard or detail view. Every validation must be implemented. Every auto-fill rule must work.

---

## 2. CRM Module Specs

### 2.1 Lead (Master Module Upgrade)

```
DocType: Lead
V3 STATUS: ✅ Complete
V4 ACTION: Master Module Upgrade — add activity tracking, link to all downstream docs

WIZARD STEPS: 2
  Step 1: "Contact Info"
    - lead_name * (input)
    - company_name (input)
    - mobile_no (input — auto-detect territory from prefix)
    - email_id (input)
  Step 2: "Qualification"
    - source * (FrappeSelect → Lead Source)
    - territory (FrappeSelect → Territory — auto-filled from phone)
    - industry_type (FrappeSelect → Industry Type)
    - notes (textarea)

AUTO-FILL FROM: None (entry point)
CREATES DOWNSTREAM: Customer, Opportunity, Quotation

KEY FIELDS:
  - lead_name (required, unique check)
  - status: "Lead" | "Open" | "Replied" | "Opportunity" | "Quotation" | "Converted" | "Do Not Contact"
  - converted_to (link → Customer — set on conversion)

VALIDATIONS:
  - Duplicate check: mobile_no + email_id
  - Cannot convert to Customer if already converted
  - V4: Edit propagation — changes to Lead flow to linked Customer

LIST PAGE KPIs:
  [Total Leads] [Open] [Qualified] [Converted This Month] [Conversion Rate %]

DETAIL PAGE ACTIONS:
  [Convert to Customer] [Create Opportunity] [Create Quotation]
  [Mark as Lost] [Send Email]

WHATS NEXT:
  If status = "Lead": "Qualify this lead by adding source and territory"
  If status = "Open": "Create an Opportunity or Quotation"
  If status = "Replied": "Follow up or convert to Customer"
```

### 2.2 Customer (Master Module Upgrade)

```
DocType: Customer
V3 STATUS: ✅ Complete
V4 ACTION: Master Module Upgrade — link past orders, invoices, payments, credit

WIZARD STEPS: 3
  Step 1: "Company Info"
    - customer_name * (input)
    - customer_type * (select: "Company" | "Individual")
    - customer_group (FrappeSelect → Customer Group)
    - territory (FrappeSelect → Territory)
  Step 2: "Contact Details"
    - email_id (input)
    - mobile_no (input)
    - primary_address (FrappeSelect → Address — optional)
  Step 3: "Settings"
    - default_currency (FrappeSelect → Currency — default ETB)
    - default_price_list (FrappeSelect → Price List)
    - payment_terms (FrappeSelect → Payment Terms Template)
    - credit_limit (number — 0 = unlimited)

AUTO-FILL FROM: Lead (on conversion)
CREATES DOWNSTREAM: Quotation, Sales Order, Sales Invoice

MASTER MODULE FEATURES (V4):
  - Linked Documents Tab: All SOs, DNs, Invoices, Payments for this customer
  - Credit Summary: Total credit, used, available
  - Outstanding Balance: Total unpaid invoices
  - Order History: Timeline of all transactions
  - Activity Feed: All interactions (notes, emails, calls)

LIST PAGE KPIs:
  [Total Customers] [Active This Month] [Top Customer by Revenue] [Total Outstanding]

DETAIL PAGE TABS:
  [Overview] [Orders] [Invoices] [Payments] [Addresses] [Contacts] [Activity]

DETAIL PAGE ACTIONS:
  [Create Quotation] [Create Sales Order] [View Outstanding] [Send Statement]
```

### 2.3 Contact (Standard — V3 Golden Template)

```
DocType: Contact
V3 STATUS: ✅ Complete (Golden Template 2)
V4 ACTION: UX Overhaul only

WIZARD STEPS: 2
  Step 1: "Personal Info"
    - first_name * (input)
    - last_name (input)
    - email_id (input)
    - mobile_no (input)
    - salutation (FrappeSelect → Salutation)
    - gender (FrappeSelect → Gender)
  Step 2: "Link to Customer/Supplier"
    - links (child table — link_doctype + link_name)
    - company_name (input)
    - designation (input)

No KPIs needed (utility doctype)
```

### 2.4 Address (Standard)

```
DocType: Address
V3 STATUS: ✅ Complete
V4 ACTION: UX Overhaul only

WIZARD STEPS: 2
  Step 1: "Address"
    - address_title * (input)
    - address_line1 * (input)
    - address_line2 (input)
    - city * (input)
    - state (input)
    - country * (FrappeSelect → Country)
    - pincode (input)
  Step 2: "Type & Links"
    - address_type * (select: "Billing" | "Shipping" | "Office" | "Other")
    - links (child table — link_doctype + link_name)
    - is_primary_address (switch)
    - is_shipping_address (switch)
```

---

## 3. Sales Module Specs

### 3.1 Quotation

```
DocType: Quotation
V3 STATUS: ✅ Complete
V4 ACTION: UX Overhaul + Attachment Support

WIZARD STEPS: 3
  Step 1: "Customer & Dates"
    - quotation_to * (select: "Customer" | "Lead")
    - party_name * (FrappeSelect → Customer or Lead)
    - transaction_date * (date — auto: today)
    - valid_till * (date — auto: today + 30)
    - attachments (file upload — NEW: customer artwork)
  Step 2: "Items & Pricing"
    - items * (child table)
      - item_code * (FrappeSelect → Item)
      - qty * (number)
      - rate * (currency — auto from Item Price)
      - amount (auto-calculated: qty × rate)
    - taxes (FrappeSelect → Tax Template — auto from customer)
    - grand_total (auto-calculated, displayed)
  Step 3: "Terms & Review"
    - tc_name (FrappeSelect → Terms and Conditions)
    - notes (textarea)
    - Preview summary

AUTO-FILL FROM: Lead (customer info)
CREATES DOWNSTREAM: Sales Order

LIST PAGE KPIs:
  [Total Quotes] [Open] [Ordered] [Lost] [Win Rate %]

DETAIL PAGE ACTIONS:
  [Create Sales Order ★] [Revise] [Print] [Email] [Mark Lost]
```

### 3.2 Sales Order (V4 Golden Template)

```
DocType: Sales Order
V3 STATUS: ✅ Complete
V4 ACTION: UX Overhaul + Auto SO→WO flow (NEW)

WIZARD STEPS: 3
  Step 1: "Customer & Delivery"
    - customer * (FrappeSelect → Customer — auto-filled from Quotation)
    - transaction_date * (date — auto: today)
    - delivery_date * (date — REQUIRED, user must set)
    - po_no (input — customer's PO number)
    - attachments (carried from Quotation)
  Step 2: "Order Items"
    - items * (child table — auto-filled from Quotation)
      - item_code * (FrappeSelect → Item)
      - qty * (number)
      - rate * (currency)
      - amount (auto)
      - warehouse (FrappeSelect → Warehouse — default)
      - is_stock_item (read-only — from Item master)
      - bom_no (FrappeSelect → BOM — for stock items)
    - taxes (auto-filled from Quotation)
    - grand_total (auto-calculated)
  Step 3: "Review & Confirm"
    - Summary preview
    - Optional: "Also create Work Order(s)" checkbox (for stock items with BOM)

AUTO-FILL FROM: Quotation (all fields — see Part 1 Section 5.3)
CREATES DOWNSTREAM: Work Order, Delivery Note, Sales Invoice, Material Request

LIST PAGE KPIs:
  [Total Orders] [Draft] [To Deliver] [To Bill] [Overdue ⚠️] [Revenue This Month]

DETAIL PAGE FLOW TRACKER: Yes (position 4 of 8)

DETAIL PAGE ACTIONS:
  Draft: [Submit ★] [Edit] [Duplicate]
  Submitted: [Create Work Order(s)] [Create Delivery Note] [Create Invoice]
  Overdue: [Send Reminder] [Update Delivery Date]
  Completed: [View Invoice] [View Payment]

WHATS NEXT:
  Status "Draft": "Submit this order to confirm with the customer"
  Status "To Deliver and Bill": "Create Work Orders for production items"
  Status "To Deliver": "All items produced — create a Delivery Note"
  Status "To Bill": "All items delivered — create a Sales Invoice"
```

### 3.3 Project (Master Module Upgrade)

```
DocType: Project
V3 STATUS: ✅ Basic
V4 ACTION: Master Module Upgrade — link to SO/WO, move to main menu

WIZARD STEPS: 2
  Step 1: "Project Info"
    - project_name * (input)
    - sales_order (FrappeSelect → Sales Order — NEW V4 link)
    - expected_start_date (date)
    - expected_end_date (date)
    - priority (select: "Low" | "Medium" | "High")
  Step 2: "Team & Status"
    - status (select: "Open" | "In Progress" | "Completed" | "Cancelled")
    - department (FrappeSelect → Department)
    - notes (textarea)

MASTER MODULE FEATURES (V4):
  - Link to Sales Order (see project vs sale value)
  - Link to Work Orders (production progress tracking)
  - Task list with assignments
  - Status display graph (BUG FIX needed)
  - Timeline view of project milestones
  - Percentage complete (auto from tasks)

NAVIGATION: Move from Settings to Main Menu (between HR and Settings)

LIST PAGE KPIs:
  [Total Projects] [Active] [Completed This Month] [Overdue]
```

---

## 4. Stock Module Specs

### 4.1 Item (Master Module Extension)

```
DocType: Item
V3 STATUS: ✅ Complete (Golden Template)
V4 ACTION: Master Module Extension — Item Price, Product Bundle, Export

WIZARD STEPS: 3
  Step 1: "Basic Info"
    - item_code * (input — auto-generated if blank)
    - item_name * (input)
    - item_group * (FrappeSelect → Item Group)
    - stock_uom * (FrappeSelect → UOM)
  Step 2: "Item Type"
    - is_stock_item (switch — "Does this item have inventory?")
    - is_purchase_item (switch — "Can this be purchased?")
    - is_sales_item (switch — "Can this be sold?")
    - description (textarea)
  Step 3: "Defaults"
    - default_warehouse (FrappeSelect → Warehouse)
    - default_bom (FrappeSelect → BOM — for manufacturing items)
    - valuation_method (select: "FIFO" | "Weighted Average")
    - minimum_order_qty (number — for reorder alert)

MASTER MODULE FEATURES (V4):
  - Item Price tab (all prices across price lists)
  - Product Bundle tab (if item is a bundle)
  - BOM tab (linked BOMs)
  - Stock Levels tab (qty per warehouse)
  - Transaction History tab (all SOs, POs, DNs involving this item)
  - Export button (NEW V4)

LIST PAGE KPIs:
  [Total Items] [Stock Items] [Service Items] [Low Stock ⚠️] [New This Month]
```

### 4.2 Warehouse (Standard)

```
DocType: Warehouse
V3 STATUS: ✅ Complete
V4 ACTION: UX Overhaul only
WIZARD STEPS: 1 (simple form)
  - warehouse_name * (input)
  - warehouse_type (select: "Storage" | "Production" | "Dispatch" | "Transit")
  - parent_warehouse (FrappeSelect → Warehouse)
  - company (FrappeSelect → Company)
```

### 4.3 Material Request (Complete + UX)

```
DocType: Material Request
V3 STATUS: 🟡 Semi-Complete
V4 ACTION: Complete + UX Overhaul

WIZARD STEPS: 2
  Step 1: "Request Type"
    - material_request_type * (select: "Purchase" | "Material Transfer" | "Material Issue")
    - schedule_date * (date — when is this needed?)
    - work_order (FrappeSelect → Work Order — if from production)
  Step 2: "Items"
    - items * (child table)
      - item_code * (FrappeSelect → Item)
      - qty * (number)
      - warehouse * (FrappeSelect → Warehouse — source/target)
      - uom (auto from item)

AUTO-FILL FROM: Work Order (items from BOM)
CREATES DOWNSTREAM: Purchase Order (for type "Purchase"), Stock Entry (for type "Material Transfer")

LIST PAGE KPIs:
  [Total Requests] [Pending] [Partially Fulfilled] [Completed]
```

### 4.4 Stock Entry (Complete + UX)

```
DocType: Stock Entry
V3 STATUS: 🟡 Semi-Complete
V4 ACTION: Complete + UX Overhaul

WIZARD STEPS: 2
  Step 1: "Entry Type"
    - purpose * (select: "Material Receipt" | "Material Issue" | "Material Transfer" | "Manufacture" | "Repack" | "Send to Subcontractor")
    - work_order (FrappeSelect → Work Order — for Manufacture type)
    - from_warehouse (FrappeSelect → Warehouse — for Transfer/Issue)
    - to_warehouse (FrappeSelect → Warehouse — for Transfer/Receipt)
  Step 2: "Items"
    - items * (child table — auto-filled from Work Order/MR)
      - item_code * (FrappeSelect → Item)
      - qty * (number)
      - basic_rate (currency — auto from valuation)
      - s_warehouse (source)
      - t_warehouse (target)

AUTO-FILL FROM: Work Order (items from BOM for Manufacture type), Material Request
CREATES DOWNSTREAM: None (terminal stock transaction)
```

### 4.5 Delivery Note (Full Build)

```
DocType: Delivery Note
V3 STATUS: 📝 Docs Only
V4 ACTION: Full Build

WIZARD STEPS: 3
  Step 1: "Customer & Shipping"
    - customer * (FrappeSelect → Customer — auto from SO)
    - posting_date * (date — auto: today)
    - sales_order (FrappeSelect → Sales Order — source)
    - shipping_address (FrappeSelect → Address)
  Step 2: "Items"
    - items * (child table — auto-filled from SO pending qty)
      - item_code * (FrappeSelect → Item)
      - qty * (number — default: pending qty from SO)
      - warehouse * (FrappeSelect → Warehouse)
      - against_sales_order (auto: SO name)
  Step 3: "Logistics & Review"
    - driver (FrappeSelect → Driver)
    - vehicle (FrappeSelect → Vehicle)
    - transporter_name (input)
    - lr_no (input — logistics receipt)
    - Review summary

AUTO-FILL FROM: Sales Order (customer, items with pending qty)
CREATES DOWNSTREAM: Sales Invoice

LIST PAGE KPIs:
  [Total DNs] [Draft] [Submitted] [Return Pending]

DETAIL PAGE ACTIONS:
  Draft: [Submit ★] [Edit]
  Submitted: [Create Sales Invoice] [Print Gate Pass] [Print DN]
```

---

## 5. Buying Module Specs

### 5.1 Supplier (Standard)

```
DocType: Supplier
V3 STATUS: ✅ Complete
V4 ACTION: UX Overhaul only
WIZARD STEPS: 2
  Step 1: "Supplier Info"
    - supplier_name * (input)
    - supplier_group (FrappeSelect → Supplier Group)
    - supplier_type (select: "Company" | "Individual")
    - country (FrappeSelect → Country)
  Step 2: "Contact & Payment"
    - email_id (input)
    - mobile_no (input)
    - default_currency (FrappeSelect → Currency)
    - payment_terms (FrappeSelect → Payment Terms Template)
```

### 5.2 Purchase Order (Standard + Approval + Auto-Repeat)

```
DocType: Purchase Order
V3 STATUS: ✅ Complete
V4 ACTION: UX Overhaul + Approval Workflow + Auto-Repeat + Min Stock Notification

WIZARD STEPS: 3
  Step 1: "Supplier & Dates"
    - supplier * (FrappeSelect → Supplier — auto from MR/RFQ)
    - transaction_date * (date — auto: today)
    - schedule_date * (date — when needed)
    - material_request (FrappeSelect → Material Request — source)
  Step 2: "Items"
    - items * (child table — auto from MR/Supplier Quotation)
      - item_code *
      - qty *
      - rate *
      - warehouse * (target warehouse)
  Step 3: "Review & Submit"
    - taxes (tax template)
    - terms (terms template)
    - auto_repeat (switch — NEW: enable recurring PO)
    - auto_repeat_frequency (select: "Weekly" | "Monthly" | "Quarterly")
    - Preview

APPROVAL WORKFLOW (V4):
  - PO Amount < ETB 10,000 → Auto-approved
  - PO Amount ETB 10,000 - 50,000 → Requires Manager approval
  - PO Amount > ETB 50,000 → Requires Director approval
  - Status: Draft → Pending Approval → Approved → Submitted

AUTO-FILL FROM: Material Request, Supplier Quotation, RFQ
CREATES DOWNSTREAM: Purchase Receipt, Purchase Invoice

LIST PAGE KPIs:
  [Total POs] [Pending Approval] [To Receive] [Overdue] [This Month's Spend]
```

### 5.3 Request for Quotation (NEW)

```
DocType: Request for Quotation
V3 STATUS: ❌ Does not exist
V4 ACTION: Full Build (NEW)

WIZARD STEPS: 3
  Step 1: "What do you need?"
    - items * (child table)
      - item_code * (FrappeSelect → Item)
      - qty * (number)
      - required_date (date)
  Step 2: "Which suppliers?"
    - suppliers * (multi-select FrappeSelect → Supplier)
    - message_for_supplier (textarea — optional custom message)
  Step 3: "Review & Send"
    - Preview: items + selected suppliers
    - [Send RFQ to X Suppliers]

AUTO-FILL FROM: Material Request
CREATES DOWNSTREAM: Supplier Quotation (one per supplier)

LIST PAGE KPIs:
  [Total RFQs] [Pending Responses] [Completed]
```

### 5.4 Supplier Quotation (NEW)

```
DocType: Supplier Quotation
V3 STATUS: ❌ Does not exist
V4 ACTION: Full Build (NEW)

WIZARD STEPS: 2
  Step 1: "Supplier Response"
    - supplier * (FrappeSelect → Supplier — auto from RFQ)
    - quotation_number (input — supplier's quote reference)
    - items * (child table — auto from RFQ)
      - item_code *
      - qty *
      - rate * (supplier fills this)
  Step 2: "Review"
    - grand_total (auto-calculated)
    - valid_till (date)
    - [Accept] or [Reject]

AUTO-FILL FROM: Request for Quotation
CREATES DOWNSTREAM: Purchase Order (from accepted quotation)

DETAIL PAGE ACTIONS:
  [Create Purchase Order ★] [Reject]
```

---

## 6. Manufacturing Module Specs

### 6.1 BOM (Standard + V4 Enhancements)

```
DocType: BOM
V3 STATUS: ✅ Complete
V4 ACTION: UX + Quality Inspection + Scrap/Process Loss + Fixed Time

WIZARD STEPS: 3
  Step 1: "Product"
    - item * (FrappeSelect → Item — what are we making?)
    - quantity * (number — standard batch size)
    - is_active (switch — default: true)
    - is_default (switch — default BOM for this item?)
  Step 2: "Materials & Operations"
    - items * (child table — raw materials)
      - item_code *
      - qty *
      - uom
      - rate (auto from Item Price)
    - operations (child table — production steps)
      - operation * (FrappeSelect → Operation)
      - workstation * (FrappeSelect → Workstation)
      - time_in_mins * (number)
      - fixed_time (switch — NEW V4: time constant regardless of qty)
      - operating_cost (auto-calculated)
  Step 3: "Quality & Scrap" (NEW V4)
    - quality_inspection_required (switch — NEW)
    - quality_inspection_template (FrappeSelect → QI Template — NEW)
    - scrap_items (child table — NEW)
      - item_code *
      - qty *
      - rate
    - process_loss_percentage (number — NEW: expected loss %)
    - Review: total cost breakdown

LIST PAGE KPIs:
  [Total BOMs] [Active] [Default BOMs] [Items Without BOM ⚠️]
```

### 6.2 Work Order (Standard + UOM Fix)

```
DocType: Work Order
V3 STATUS: ✅ Complete
V4 ACTION: UX Overhaul + UOM Round-Up Fix

WIZARD STEPS: 2
  Step 1: "What to Produce"
    - production_item * (FrappeSelect → Item — auto from SO)
    - bom_no * (FrappeSelect → BOM — auto: default BOM for item)
    - qty * (number — auto from SO, ROUNDED UP to nearest UOM — V4 FIX)
    - sales_order (FrappeSelect → Sales Order — source link)
    - expected_delivery_date (date — auto from SO delivery_date)
  Step 2: "Warehouses"
    - fg_warehouse * (FrappeSelect → Warehouse — default: "Finished Goods")
    - wip_warehouse * (FrappeSelect → Warehouse — default: "WIP")
    - source_warehouse (FrappeSelect → Warehouse — default: "Main Warehouse")
    - planned_start_date (date)

V4 UOM ROUNDUP FIX:
  When creating WO from SO:
    If SO item qty = 75 and Item's UOM conversion = 100 per box
    → WO qty = 100 (rounded up to nearest UOM)
    → User warned: "Quantity rounded from 75 to 100 (minimum 1 box)"

AUTO-FILL FROM: Sales Order (item, qty, BOM, delivery date)
CREATES DOWNSTREAM: Material Request, Stock Entry (Transfer), Stock Entry (Manufacture)

LIST PAGE KPIs:
  [Total WOs] [Not Started] [In Process] [Completed] [Overdue]

DETAIL PAGE ACTIONS:
  Not Started: [Start ★] [Create Material Request] [Edit]
  In Process: [Create Stock Entry: Manufacture ★] [Update Progress]
  Completed: [View Stock Entry] [View Sales Order]

DETAIL PAGE FLOW TRACKER: Yes (position 5 of 8)
```

---

## 7. Accounting Module Specs

### 7.1 Sales Invoice (Full Build)

```
DocType: Sales Invoice
V3 STATUS: 📝 Docs Only
V4 ACTION: Full Build

WIZARD STEPS: 3
  Step 1: "Customer & Source"
    - customer * (FrappeSelect → Customer — auto from DN/SO)
    - posting_date * (date — auto: today)
    - due_date * (date — auto from payment terms)
    - delivery_note (FrappeSelect → Delivery Note — source)
    - sales_order (FrappeSelect → Sales Order — alternative source)
  Step 2: "Items & Taxes"
    - items * (child table — auto from DN/SO)
      - item_code *
      - qty *
      - rate *
      - amount (auto)
    - taxes (auto from source doc or customer default)
    - grand_total (displayed prominently)
  Step 3: "Payment & Review"
    - payment_terms_template (FrappeSelect → Payment Terms Template)
    - remarks (textarea)
    - Preview: full invoice summary

AUTO-FILL FROM: Delivery Note (standard), Sales Order (advance billing)
CREATES DOWNSTREAM: Payment Entry

LIST PAGE KPIs:
  [Total Invoices] [Unpaid] [Overdue ⚠️] [Paid This Month] [Total Outstanding]

DETAIL PAGE ACTIONS:
  Draft: [Submit ★] [Edit]
  Submitted/Unpaid: [Create Payment Entry ★] [Send to Customer] [Print]
  Overdue: [Send Reminder ★] [Create Payment Entry]
  Paid: [Print Receipt] [View Payment]

DETAIL PAGE FLOW TRACKER: Yes (position 7 of 8)
```

### 7.2 Purchase Invoice (Full Build)

```
DocType: Purchase Invoice
V3 STATUS: 📝 Docs Only
V4 ACTION: Full Build

WIZARD STEPS: 3
  Step 1: "Supplier & Source"
    - supplier * (FrappeSelect → Supplier — auto from PO)
    - posting_date * (date)
    - bill_no (input — supplier's invoice number)
    - bill_date (date — supplier's invoice date)
    - purchase_order (FrappeSelect → Purchase Order — source)
  Step 2: "Items & Taxes"
    - items * (child table — auto from PO)
    - taxes (auto)
    - grand_total (auto)
  Step 3: "Review"
    - Preview + 3-way match check (PO qty vs Receipt qty vs Invoice qty)

AUTO-FILL FROM: Purchase Order, Purchase Receipt
CREATES DOWNSTREAM: Payment Entry

LIST PAGE KPIs:
  [Total Bills] [Unpaid] [Overdue ⚠️] [Paid This Month] [Total Payable]
```

### 7.3 Payment Entry (Full Build)

```
DocType: Payment Entry
V3 STATUS: 📝 Docs Only
V4 ACTION: Full Build

WIZARD STEPS: 3
  Step 1: "Payment Type"
    - payment_type * (select: "Receive" | "Pay" | "Internal Transfer")
    - party_type * (select: "Customer" | "Supplier" — auto based on payment_type)
    - party * (FrappeSelect → Customer/Supplier)
    - paid_amount * (currency)
    - mode_of_payment * (FrappeSelect → Mode of Payment: Cash, Bank, Mobile)
  Step 2: "Allocate to Invoices"
    - references (auto-fetched: outstanding invoices for this party)
      Display table of unpaid invoices
      User clicks to allocate payment amount to invoices
      System validates: total allocation ≤ paid_amount
  Step 3: "Review & Post"
    - posting_date * (date — auto: today)
    - reference_no (input — check/transfer reference)
    - reference_date (date)
    - Preview: GL entries that will be posted

VALIDATIONS:
  - Bank balance check: warn if payment exceeds account balance
  - Allocation check: total ≤ paid_amount
  - Duplicate check: same party + same amount + same date

LIST PAGE KPIs:
  [Total Payments] [Received Today] [Paid Today] [Unallocated]
```

### 7.4 Journal Entry (Full Build)

```
DocType: Journal Entry
V3 STATUS: 📝 Docs Only
V4 ACTION: Full Build

WIZARD STEPS: 2
  Step 1: "Entry Type"
    - voucher_type * (select: "Journal Entry" | "Opening Entry" | "Depreciation" | "Write Off")
    - posting_date * (date)
    - cheque_no (input)
    - cheque_date (date)
    - user_remark (textarea)
  Step 2: "Accounts"
    - accounts * (child table — must balance)
      - account * (FrappeSelect → Account)
      - debit_in_account_currency (currency)
      - credit_in_account_currency (currency)
      - party_type (select — optional)
      - party (FrappeSelect — optional)

VALIDATIONS:
  - Total Debit MUST equal Total Credit (cannot submit if unbalanced)
  - Display running balance during entry
  - Warn if posting to frozen account

LIST PAGE KPIs:
  [Total Entries] [This Month] [Opening Entries] [Adjustments]
```

---

## 8. HR Module Specs

### 8.1 Employee (Standard)

```
DocType: Employee
V3 STATUS: ✅ Complete
V4 ACTION: UX Overhaul only

WIZARD STEPS: 3
  Step 1: "Personal Info"
    - employee_name * (input)
    - date_of_birth (date)
    - gender (FrappeSelect → Gender)
    - cell_phone (input)
    - personal_email (input)
  Step 2: "Employment"
    - company * (FrappeSelect → Company)
    - department (FrappeSelect → Department)
    - designation (FrappeSelect → Designation)
    - date_of_joining (date)
    - status (select: "Active" | "Inactive" | "Suspended" | "Left")
  Step 3: "Contact"
    - company_email (input)
    - current_address (textarea)
    - emergency_contact_name (input)
    - emergency_phone (input)

LIST PAGE KPIs:
  [Total Employees] [Active] [New This Month] [Left This Month]
```

---

## 9. New V4 Modules

### 9.1 Quality Inspection (NEW)

```
DocType: Quality Inspection
V4 ACTION: Full Build (NEW)

WIZARD STEPS: 2
  Step 1: "Inspection Source"
    - item_code * (FrappeSelect → Item)
    - reference_type * (select: "Stock Entry" | "Purchase Receipt" | "Delivery Note")
    - reference_name * (FrappeSelect → referenced document)
    - sample_size * (number)
    - inspection_type (select: "Incoming" | "Outgoing" | "In Process")
  Step 2: "Parameters"
    - readings * (child table — auto from QI Template)
      - specification * (string — e.g., "Color Match")
      - acceptance_criteria * (string — e.g., "≥ 95%")
      - reading_1 * (string — actual value)
      - status * (select: "Accepted" | "Rejected")
    - remarks (textarea)

DETAIL PAGE ACTIONS:
  [Accept All ★] [Reject All] [Submit]

Result: If all Accepted → Status "Accepted", goods released
        If any Rejected → Status "Rejected", rework suggested
```

### 9.2 Product Bundle (NEW)

```
DocType: Product Bundle
V4 ACTION: Full Build (NEW)

WIZARD STEPS: 2
  Step 1: "Bundle Item"
    - new_item_code * (FrappeSelect → Item — the "parent" product)
    - description (textarea)
  Step 2: "Bundle Contents"
    - items * (child table — what's in the bundle)
      - item_code * (FrappeSelect → Item)
      - qty * (number)
      - uom (auto from item)
      - rate (informational — from Item Price)

Use Case: "Business Kit" = 500 Business Cards + 1000 Letterheads + 500 Envelopes
When Business Kit is added to a Sales Order, the system:
  → Expands into individual items for production
  → But shows as single line to customer on invoice
```

### 9.3 Activity Tracking (NEW — Global)

```
DocType: Activity Log
V4 ACTION: Full Build (NEW — Global Module)

NOT a wizard — auto-generated

Fields:
  - action (string — "Created" | "Updated" | "Submitted" | "Cancelled" | "Comment")
  - doctype (string — which document)
  - document_name (string — document ID)
  - user (string — who did it)
  - timestamp (datetime)
  - details (text — what changed)
  - comment (text — user's comment, if action = "Comment")

DISPLAY: Footer on every detail page showing chronological activity
  "📝 Kidus created this on May 28, 2026 at 2:30 PM"
  "✏️ Kidus updated delivery_date from Jun 10 to Jun 14"
  "💬 Abebe: Please prioritize this order"
  "✅ System submitted this on May 29, 2026 at 9:00 AM"
```

---

## 10. Settings/Master Modules

### 10.1 Tax Templates (Master Module — V4)

```
DocType: Sales Taxes and Charges Template
V4 ACTION: Expand into Master Module — add to Accounting menu

Current: Listed under Sales settings only
V4: Also accessible from Accounting menu

Features:
  - Template management (create, edit, delete)
  - Tax Category support (classify templates)
  - Default template per Customer/Customer Group
  - Ethiopian VAT (15%) pre-configured for new tenants

Tax Category (NEW):
  - category_name * (input — e.g., "Standard", "Zero-Rated", "Exempt")
  - description (textarea)
  - Used to classify items and auto-apply correct tax template
```

### 10.2 Terms & Conditions (Master Module — V4)

```
DocType: Terms and Conditions
V4 ACTION: Expand into Master Module

Current: Listed under Sales settings only
V4: Standalone module under Settings

Features:
  - Rich text editor for terms
  - Default terms per document type (Quotation, SO, Invoice)
  - Version history (track changes over time)
  - Multi-language support (future)
```

### 10.3 Payment Terms Template (Master Module — V4)

```
DocType: Payment Terms Template
V4 ACTION: Expand into Master Module

Features:
  - Template with multiple payment milestones
  - Example: "50% on order, 50% on delivery"
  - Auto-calculates due dates based on posting date
  - Linkable to Customer (default payment terms)
  - Linkable to Sales Invoice (auto-calculate due schedule)
```

### 10.4 Item Price (Master Module — V4)

```
DocType: Item Price
V4 ACTION: Expand into standalone accessible module

Features:
  - Price per item per price list
  - Price history tracking
  - Bulk price update
  - Import/export prices (CSV)
  - Price validity dates (effective from/to)
  - Currency support
```

---

## Summary

Part 2 provides implementation-ready specifications for:

1. ✅ **CRM** — Lead (master), Customer (master), Contact, Address
2. ✅ **Sales** — Quotation (attachments), Sales Order (golden template), Project (master)
3. ✅ **Stock** — Item (master), Warehouse, Material Request, Stock Entry, Delivery Note
4. ✅ **Buying** — Supplier, Purchase Order (approval), RFQ (new), Supplier Quotation (new)
5. ✅ **Manufacturing** — BOM (QI + scrap), Work Order (UOM fix)
6. ✅ **Accounting** — Sales Invoice, Purchase Invoice, Payment Entry, Journal Entry
7. ✅ **HR** — Employee
8. ✅ **New Modules** — Quality Inspection, Product Bundle, Activity Tracking
9. ✅ **Settings** — Tax Templates, Terms, Payment Terms, Item Price (all expanded to master modules)

**Every specification includes:** Wizard steps, auto-fill rules, validations, KPIs, detail page actions, and "What's Next" guidance.

**Next:** Part 3 covers Automation Rules — every auto-fill mapping, every status transition, every notification trigger, and the complete Flow Tracker configuration.

---

*Obsidian ERP v4.0 Business Workflow — Part 2 of 3*  
*© 2026 VersaLabs Studio. All rights reserved.*
