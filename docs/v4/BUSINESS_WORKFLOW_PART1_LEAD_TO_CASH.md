# Obsidian ERP v4.0 — Business Workflow Document (Part 1 of 3)
# Lead-to-Cash: The Complete SME Business Flow

> **Product:** Obsidian ERP  
> **Company:** VersaLabs Studio  
> **Document Version:** 4.0.0  
> **Last Updated:** 2026-05-31  
> **Audience:** Coding Agents, Implementation Teams, Business Analysts

---

## Table of Contents

1. [What This Document Is](#1-what-this-document-is)
2. [The Lead-to-Cash Cycle: Universal SME Model](#2-the-lead-to-cash-cycle-universal-sme-model)
3. [Stage 1: Lead Capture & Qualification](#3-stage-1-lead-capture--qualification)
4. [Stage 2: Opportunity & Quotation](#4-stage-2-opportunity--quotation)
5. [Stage 3: Sales Order & Order Confirmation](#5-stage-3-sales-order--order-confirmation)
6. [Stage 4: Procurement (Buying)](#6-stage-4-procurement-buying)
7. [Stage 5: Production (Manufacturing)](#7-stage-5-production-manufacturing)
8. [Stage 6: Delivery & Fulfillment](#8-stage-6-delivery--fulfillment)
9. [Stage 7: Invoicing & Revenue Recognition](#9-stage-7-invoicing--revenue-recognition)
10. [Stage 8: Payment Collection & Reconciliation](#10-stage-8-payment-collection--reconciliation)
11. [Parallel Flows: Inventory, Quality, Projects](#11-parallel-flows)
12. [Industry Adaptations](#12-industry-adaptations)

---

## 1. What This Document Is

This document defines the **universal business workflow** that Obsidian ERP supports. It describes how any SME — regardless of industry — moves a business opportunity from initial contact to cash collection. Every feature in Obsidian ERP maps to one or more stages of this flow.

### 1.1 Why Coding Agents Need This

When implementing any module, page, or feature, the coding agent must understand:

1. **Where** the feature sits in the business flow
2. **What comes before** it (upstream data to auto-fill)
3. **What comes after** it (downstream documents to create)
4. **What data** flows between stages
5. **What validations** apply at each transition
6. **What the user expects** to happen when they click a button

### 1.2 The Plug-and-Play Promise

Obsidian ERP is designed to be **plug-and-play for any SME**. This means:

- The core Lead-to-Cash flow works for **any business** that sells goods or services
- Industry-specific modules (Manufacturing, Quality) can be **activated or deactivated**
- The system **adapts** to the business, not the other way around

### 1.3 Flow Summary

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          OBSIDIAN ERP: LEAD-TO-CASH                          │
│                                                                              │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐        │
│  │ LEAD │──▶│ OPP  │──▶│QUOTE │──▶│  SO  │──▶│  WO  │──▶│  DN  │        │
│  │      │   │      │   │      │   │      │   │(opt) │   │      │        │
│  └──────┘   └──────┘   └──────┘   └──┬───┘   └──────┘   └──┬───┘        │
│     CRM        CRM       SALES      │  SALES    MFG         │  STOCK     │
│                                       │                      │             │
│                                       │    ┌──────┐          │             │
│                                       ├───▶│  PO  │          │             │
│                                       │    │(buy) │          │             │
│                                       │    └──────┘          │             │
│                                       │     BUYING           │             │
│                                       │                      │             │
│                                       │                ┌─────▼────┐        │
│                                       │                │ INVOICE  │        │
│                                       │                │          │        │
│                                       │                └─────┬────┘        │
│                                       │                 ACCT  │             │
│                                       │                      │             │
│                                       │                ┌─────▼────┐        │
│                                       │                │ PAYMENT  │        │
│                                       │                │    $$$   │        │
│                                       │                └──────────┘        │
│                                       │                 ACCT               │
│                                       │                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  GENERAL LEDGER — All transactions auto-post                          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Key: (opt) = optional stage, depends on business type
```

---

## 2. The Lead-to-Cash Cycle: Universal SME Model

### 2.1 The Eight Stages

Every SME business, whether it's a printing shop in Addis Ababa or a consulting firm in Nairobi, follows this lifecycle:

| Stage | Name | Question Answered | Obsidian Module |
|-------|------|-------------------|-----------------|
| 1 | **Lead Capture** | "Who is interested in our product/service?" | CRM |
| 2 | **Opportunity & Quote** | "What do they want and how much will it cost?" | CRM + Sales |
| 3 | **Order Confirmation** | "Are they buying? Lock in the deal." | Sales |
| 4 | **Procurement** | "Do we have the materials? If not, buy them." | Buying + Stock |
| 5 | **Production** | "Make the product." | Manufacturing |
| 6 | **Delivery** | "Ship it to the customer." | Stock |
| 7 | **Invoicing** | "Bill the customer." | Accounting |
| 8 | **Payment** | "Collect the money." | Accounting |

### 2.2 Which Stages Apply to Which Business?

| Business Type | Stages Used | Skipped Stages |
|---------------|-------------|----------------|
| **Manufacturer** (printing, garments, food) | All 8 | None |
| **Trading/Retail** (buy and resell) | 1, 2, 3, 4, 6, 7, 8 | Stage 5 (no production) |
| **Services** (consulting, IT, logistics) | 1, 2, 3, 7, 8 | Stages 4, 5, 6 (no physical goods) |
| **Hybrid** (manufacturing + services) | All 8 | None (some stages optional per line item) |

### 2.3 Document Status Lifecycle

Every transactional document follows the same status pattern:

```
Draft ──→ Submitted ──→ [Completed / Cancelled]
                    └──→ Amended ──→ Draft (new version)

Draft:     Editable. Not yet committed. Can be deleted.
Submitted: Locked. Financial impact. Can only be cancelled or amended.
Completed: All downstream actions finished. Read-only.
Cancelled: Voided. Financial reversal posted.
Amended:   Creates a new Draft version linked to the original.
```

---

## 3. Stage 1: Lead Capture & Qualification

### 3.1 Business Context

A **Lead** is a potential customer who has shown interest but hasn't committed to anything. In Ethiopian SME context:

- Walk-in customer asking about printing services
- Phone call requesting a price quote
- WhatsApp message asking about product availability
- Business card collected at a trade fair
- Referral from an existing customer

### 3.2 Data Model

```
Lead
├── lead_name: string (required)       — "Abebe Tadesse"
├── company_name: string (optional)    — "Abebe Trading PLC"
├── email_id: string (optional)        — "abebe@trading.com"
├── mobile_no: string (optional)       — "+251-91-123-4567"
├── source: Lead Source                — "Walk-In" | "Referral" | "WhatsApp"
├── territory: Territory               — "Addis Ababa"
├── industry_type: Industry Type       — "Printing"
├── status: string                     — "Lead" | "Open" | "Replied" | "Converted" | "Lost"
├── notes: text                        — Free-form notes
└── converted_to: link → Customer      — Set when lead converts
```

### 3.3 Obsidian V4 UX for Lead Capture

**Wizard Flow (3 steps):**

```
Step 1: Contact Info
  ├── Lead Name * (free text)
  ├── Company Name (free text, optional)
  ├── Mobile Number (with +251 prefix auto-detected)
  └── Email (optional)

Step 2: Qualification
  ├── Source * (Lead Source dropdown — auto-detected if from referral link)
  ├── Territory (auto-detected: "Addis Ababa" if phone is +251-91)
  ├── Industry Type (dropdown)
  └── Notes (free text)

Step 3: Confirm
  └── Preview card showing all info
  └── Optional: "Also create a Quotation" checkbox
```

### 3.4 Downstream Actions

When a Lead is qualified:

| Action | Creates | Auto-Fill |
|--------|---------|-----------|
| **Convert to Customer** | Customer record | Name, company, email, phone, territory |
| **Create Opportunity** | Opportunity record | Lead link, customer info |
| **Create Quotation** | Quotation record | Customer (if converted), items (manual) |

### 3.5 V4 Automation Rules

```typescript
// Lead Automation Rules

1. AUTO_TERRITORY:
   If mobile_no starts with "+251-91" or "+251-11" → territory = "Addis Ababa"
   If mobile_no starts with "+251-25" → territory = "Dire Dawa"
   // Extend for other regions

2. AUTO_STATUS:
   On creation → status = "Lead"
   On first reply/note → status = "Open"
   On quotation creation → status = "Replied"
   On customer conversion → status = "Converted"

3. LEAD_PROPAGATION:
   When Lead is edited (name, email, phone):
   If Lead is linked to a Customer → update Customer record too
   If Lead has Opportunities → update contact info on Opportunities

4. DUPLICATE_CHECK:
   Before saving → check for existing leads with same:
   - mobile_no (exact match)
   - email_id (exact match)
   - lead_name + company_name (fuzzy match)
   If found → warn user, offer to merge
```

---

## 4. Stage 2: Opportunity & Quotation

### 4.1 Business Context

Once a lead is qualified, the sales process begins:

1. **Opportunity**: The formal record that "this customer wants to buy X" (optional but recommended)
2. **Quotation**: The formal price proposal sent to the customer

In Ethiopian SME context:
- Customer calls and asks "How much for 500 business cards?"
- Sales person creates a quotation with items, quantities, and prices
- Quotation may be sent via WhatsApp, email, or printed
- Customer may negotiate → revised quotation
- Customer may attach artwork or specifications

### 4.2 Quotation Data Model

```
Quotation
├── naming_series: string              — "QTN-.YYYY.-"
├── quotation_to: "Customer" | "Lead"  — Who this is for
├── party_name: link → Customer/Lead   — "Abebe Trading PLC"
├── customer_name: string              — Display name
├── transaction_date: date             — Quote date
├── valid_till: date                   — Expiry date
├── items: [Quotation Item]            — Line items
│   ├── item_code: link → Item         — "BC-PM"
│   ├── item_name: string              — "Business Cards (Premium Matte)"
│   ├── qty: number                    — 500
│   ├── rate: currency                 — 2.50
│   ├── amount: currency               — 1,250.00 (auto-calculated)
│   └── uom: link → UOM               — "Box"
├── taxes: [Tax Template]              — Applied taxes
│   └── tax_amount: currency           — Auto-calculated from template
├── grand_total: currency              — Net + Taxes
├── terms: link → Terms & Conditions   — Standard terms
├── attachments: [File]                — NEW V4: Customer artwork, specs
├── status: string                     — "Draft" | "Open" | "Ordered" | "Lost"
└── order_type: "Sales" | "Maintenance"
```

### 4.3 V4 UX Enhancements for Quotation

**New Feature: Attachment for Customer Template/Artwork**

```
On the Quotation form:
  ├── Standard fields (customer, items, etc.)
  └── NEW: Attachments Section
      ├── "📎 Attach Customer Artwork" button
      ├── Supported formats: PDF, PNG, JPG, AI, PSD
      ├── Max file size: 25MB
      ├── Attachments carry over to Sales Order automatically
      └── Visible on the detail page in a gallery view
```

**Wizard Flow (3 steps):**

```
Step 1: Customer
  ├── Customer * (FrappeSelect — auto-filled if from Lead/Opportunity)
  ├── Quote Date * (auto: today)
  ├── Valid Until * (auto: today + 30 days)
  └── Attachments (file upload — customer artwork)

Step 2: Items & Pricing
  ├── Item table (add items with qty, rate)
  │   └── Rate auto-filled from Item Price (if exists)
  ├── Tax Template (auto-applied from Customer settings)
  └── Grand Total (auto-calculated, displayed prominently)

Step 3: Terms & Confirm
  ├── Terms & Conditions (auto-selected from default)
  ├── Notes / special instructions
  └── Preview: formatted quotation summary
  └── Action: [Create Quote] or [Create & Send via Email]
```

### 4.4 Downstream Actions

| Action | Creates | Auto-Fill |
|--------|---------|-----------|
| **Create Sales Order** | Sales Order | ALL fields from quotation (customer, items, taxes, terms, attachments) |
| **Revise Quotation** | New Quotation (amended) | Copy all, allow edits |
| **Mark as Lost** | Status change | Reason for loss (competitor, price, timing) |

---

## 5. Stage 3: Sales Order & Order Confirmation

### 5.1 Business Context

The **Sales Order** is the moment the customer says "yes, I'm buying." It is the **central document** that drives everything downstream:

- Work Orders (production)
- Purchase Orders (procurement)
- Delivery Notes (fulfillment)
- Sales Invoices (billing)

### 5.2 Sales Order Data Model

```
Sales Order
├── naming_series: string              — "SO-.YYYY.-"
├── customer: link → Customer          — "Abebe Trading PLC"
├── customer_name: string              — Display name
├── transaction_date: date             — Order date
├── delivery_date: date                — Expected delivery
├── po_no: string                      — Customer's PO number
├── items: [Sales Order Item]          — Line items
│   ├── item_code: link → Item
│   ├── item_name: string
│   ├── qty: number
│   ├── delivered_qty: number          — Auto-tracked
│   ├── rate: currency
│   ├── amount: currency
│   ├── warehouse: link → Warehouse    — Source warehouse
│   ├── bom_no: link → BOM            — For manufacturing items
│   └── is_stock_item: boolean         — Stock vs Service item
├── taxes: [Tax Template]
├── grand_total: currency
├── status: string                     — "Draft" | "To Deliver and Bill" | "To Bill" | "To Deliver" | "Completed" | "Cancelled"
├── per_delivered: number              — % delivered (auto-tracked)
├── per_billed: number                 — % invoiced (auto-tracked)
├── per_picked: number                 — % picked (auto-tracked)
├── attachments: [File]                — Carried from quotation
└── quotation: link → Quotation        — Source quotation
```

### 5.3 V4 Auto-Fill: Quotation → Sales Order

This is the **most important auto-fill** in the system. When creating a Sales Order from a Quotation:

```typescript
// Auto-fill mapping: Quotation → Sales Order

FIELD MAPPINGS:
  party_name     → customer
  customer_name  → customer_name
  items[]        → items[] (all items with qty, rate, amount)
  taxes[]        → taxes[] (all tax lines)
  terms          → tc_name
  grand_total    → grand_total
  net_total      → net_total
  attachments[]  → attachments[] (carry forward)
  name           → quotation (link back)

USER FILLS:
  delivery_date  → manual (required)
  po_no          → manual (optional — customer's PO)
  warehouse      → manual per item OR auto from default warehouse

SYSTEM AUTO-FILLS:
  transaction_date → today
  naming_series    → next in sequence
  status           → "Draft"
  per_delivered    → 0
  per_billed       → 0
```

### 5.4 Downstream Actions from Sales Order

| Action | Creates | When | Auto-Fill |
|--------|---------|------|-----------|
| **Submit** | Locks the order | User confirms order is final | Status → "To Deliver and Bill" |
| **Create Work Order(s)** | Work Order per stock item | After submit, for manufacturing items | BOM, qty, item, sales_order link |
| **Create Purchase Order** | Purchase Order | For items needing procurement | Items, qty, preferred supplier |
| **Create Delivery Note** | Delivery Note | When goods are ready to ship | Customer, items (pending qty), SO link |
| **Create Sales Invoice** | Sales Invoice | After delivery (or advance billing) | Customer, items, taxes, SO link |

### 5.5 V4 Automation: Sales Order → Work Order Flow

**This is a NEW V4 feature that was not in V3.**

```typescript
// Automated SO → WO Creation

TRIGGER: User clicks "Create Work Order(s)" on submitted Sales Order

LOGIC:
  1. Filter SO items where is_stock_item = true AND bom_no exists
  2. For each qualifying item:
     a. Create Work Order:
        - production_item: item_code
        - item_name: item_name
        - bom_no: bom_no (from SO item) OR default BOM for item
        - qty: pending_qty (qty - produced_qty)
        - sales_order: SO name
        - expected_delivery_date: SO delivery_date
        - fg_warehouse: "Finished Goods" (default)
        - wip_warehouse: "WIP" (default)
     b. Show confirmation before creating
  3. Return list of created Work Orders
  4. Update SO with work_order links

USER EXPERIENCE:
  "Create Work Order(s)" button shows:
  ┌──────────────────────────────────────────────┐
  │  📋 Work Orders to Create:                   │
  │                                               │
  │  ✅ Business Cards (PM) — Qty: 500           │
  │     BOM: BOM-BC-001                           │
  │                                               │
  │  ✅ Letterheads (A4) — Qty: 1000             │
  │     BOM: BOM-LH-001                           │
  │                                               │
  │  ⬜ Design Services — Qty: 1                 │
  │     (Service item — no WO needed)             │
  │                                               │
  │  [Create 2 Work Orders]  [Cancel]             │
  └──────────────────────────────────────────────┘
```

### 5.6 Service Items vs Stock Items

**V4 distinguishes between items that need production/inventory and items that don't:**

```
Stock Item (is_stock_item = true):
  → Tracked in inventory (warehouse quantities)
  → Requires Work Order for production
  → Requires Delivery Note for fulfillment
  → Affects stock levels
  Examples: Business Cards, Paper, Ink

Service Item (is_stock_item = false):
  → NOT tracked in inventory
  → NO Work Order needed
  → NO Delivery Note needed (service is "delivered" when marked complete)
  → Does NOT affect stock levels
  Examples: Design Services, Consultation, Installation

On Sales Order:
  → Stock items generate Work Orders + Delivery Notes
  → Service items are "delivered" by marking them complete on the SO
  → Both types appear on the Sales Invoice
```

### 5.7 Overdue Sales Order Monitoring

**V4 Feature: Automated Overdue Notifications**

```typescript
// Overdue monitoring system

CHECK FREQUENCY: Daily at 8:00 AM (server cron)

LOGIC:
  1. Query Sales Orders where:
     - status IN ("To Deliver", "To Deliver and Bill")
     - delivery_date < today
  2. For each overdue order:
     a. Send System Notification to order owner
     b. Send Email Notification to owner
     c. Show on Dashboard (overdue KPI card)
  3. Optionally: Send email to customer (configurable per tenant)

NOTIFICATION CONTENT:
  Subject: "⚠️ Overdue: Sales Order {name} — {customer_name}"
  Body: "Sales Order {name} for {customer_name} was due on {delivery_date}.
         It is now {days_overdue} days overdue.
         Amount: ETB {grand_total}
         [View Order →]"
```

---

## 6. Stage 4: Procurement (Buying)

### 6.1 Business Context

When a Sales Order requires materials that aren't in stock, procurement kicks in:

1. **Material Request**: "We need 50 reams of paper" — internal request
2. **Request for Quotation (RFQ)**: "Suppliers, how much for 50 reams?" — get prices
3. **Supplier Quotation**: Supplier responds with prices
4. **Purchase Order**: "We'll buy from Supplier X at this price" — committed order

### 6.2 Procurement Flow

```
Sales Order
     │
     ▼ (items with insufficient stock)
Material Request (type: Purchase)
     │
     ├──▶ Request for Quotation (to multiple suppliers)
     │         │
     │         ▼
     │    Supplier Quotation (responses from suppliers)
     │         │
     │         ▼ (select best quote)
     │    
     ▼
Purchase Order (to selected supplier)
     │
     ▼
Purchase Receipt (goods received at warehouse)
     │
     ▼
Purchase Invoice (supplier bill → Accounts Payable)
     │
     ▼
Payment Entry (pay the supplier)
```

### 6.3 Purchase Order Automation

```typescript
// V4 Automations for Purchase Orders

1. AUTO_REPEAT:
   Recurring POs can be set to auto-repeat:
   - Frequency: Weekly | Monthly | Quarterly
   - Creates new Draft PO at specified interval
   - Pre-filled with same items, qty, supplier

2. MINIMUM_STOCK_ALERT:
   When item stock falls below minimum:
   - Send notification to buying manager
   - Suggest creating Material Request
   - Show on Dashboard as alert

3. APPROVAL_WORKFLOW:
   Purchase Orders above threshold need approval:
   - < ETB 10,000 → Auto-approved
   - ETB 10,000 - 50,000 → Manager approval
   - > ETB 50,000 → Director approval
   
   Status flow: Draft → Pending Approval → Approved → Submitted
```

---

## 7. Stage 5: Production (Manufacturing)

### 7.1 Business Context

For manufacturing businesses, the Work Order is where the product gets made:

1. **Work Order** created from Sales Order
2. **Material Request** created from Work Order (to get raw materials)
3. **Stock Entry (Material Transfer)** moves materials to WIP warehouse
4. Production happens (tracked via Work Order operations)
5. **Stock Entry (Manufacture)** moves finished goods to FG warehouse

### 7.2 Manufacturing Flow

```
Work Order (from Sales Order)
     │
     ├──▶ Material Request (raw materials needed)
     │         │
     │         ▼
     │    Stock Entry: Material Transfer
     │    (Raw Material WH → WIP WH)
     │
     ├──▶ Operations (tracked on workstations)
     │    ├── Operation 1: Plate Making (Plate Maker)
     │    ├── Operation 2: Printing (Press Machine)
     │    └── Operation 3: Cutting (Cutter)
     │
     ▼
Stock Entry: Manufacture
(WIP WH → Finished Goods WH)
(Raw materials consumed, finished goods produced)
     │
     ▼
Quality Inspection (NEW V4 — optional)
(Pass → release to Delivery, Fail → rework)
```

### 7.3 V4 Enhancements for Manufacturing

```typescript
// BOM Enhancements

1. QUALITY_INSPECTION:
   BOM can now specify: quality_inspection_required = true
   When enabled:
   - After manufacture Stock Entry, system prompts for QI
   - QI template linked to BOM
   - Pass → goods released for delivery
   - Fail → goods held, rework Work Order suggested

2. SCRAP_AND_PROCESS_LOSS:
   BOM now includes:
   - scrap_items: [{ item_code, qty, rate }]
   - process_loss_percentage: number
   
   During Manufacture Stock Entry:
   - Finished qty = ordered_qty - (ordered_qty × process_loss_pct)
   - Scrap items added as separate stock entries
   - Cost adjusted accordingly

3. FIXED_TIME_OPERATION:
   Operation child table on BOM now supports:
   - time_in_mins: number (variable — based on qty)
   - fixed_time: boolean (NEW)
   - If fixed_time = true, time_in_mins is constant regardless of qty
   - Used for setup operations (e.g., plate making takes same time for 100 or 1000 copies)

4. UOM_ROUNDUP:
   Work Order creation from Sales Order:
   - If SO item qty = 75 and UOM conversion = 100 per box
   - Work Order qty rounds UP to 100 (next whole UOM)
   - User is warned: "Quantity rounded to 100 (1 box minimum)"
```

---

## 8. Stage 6: Delivery & Fulfillment

### 8.1 Business Context

The Delivery Note records that goods have left the warehouse and are heading to (or have arrived at) the customer.

### 8.2 Delivery Flow

```
Sales Order (submitted, goods produced)
     │
     ▼
Delivery Note
├── Items: from SO (pending qty)
├── Warehouse: source warehouse
├── Customer: from SO
├── Driver: assigned (V4)
├── Vehicle: assigned (V4)
└── Status: Draft → Submitted (stock deducted) → Completed

On Submit:
  1. Stock deducted from source warehouse
  2. SO per_delivered updated
  3. SO status updated (if fully delivered → "To Bill")
  4. Gate Pass can be printed (without amount)

Partial Delivery:
  → Only delivered qty is deducted
  → SO shows remaining qty
  → Another DN can be created for remainder
```

### 8.3 V4 Delivery Enhancements

```
1. GATE_PASS_PRINTING:
   DN detail page has "Print Gate Pass" button
   Gate Pass format: items, qty, customer, driver, vehicle
   Does NOT show pricing (security)

2. LOGISTICS_TRACKING:
   DN now includes:
   - driver: link → Driver
   - vehicle: link → Vehicle
   - transporter: string
   - lr_no: string (logistics receipt number)
   - lr_date: date
```

---

## 9. Stage 7: Invoicing & Revenue Recognition

### 9.1 Business Context

The Sales Invoice is the billing document that creates an Accounts Receivable entry. The customer now owes money.

### 9.2 Invoice Creation Flow

```
Sales Invoice can be created from:
  1. Sales Order (advance billing — before delivery)
  2. Delivery Note (standard — after delivery)
  3. Standalone (for services)

On Submit:
  1. GL Entry: Debit Accounts Receivable, Credit Revenue
  2. Tax entries posted
  3. SO per_billed updated
  4. Customer outstanding balance updated
```

### 9.3 Auto-Fill Rules

```typescript
// Auto-fill: Delivery Note → Sales Invoice

FIELD MAPPINGS:
  customer       → customer
  customer_name  → customer_name
  items[]        → items[] (delivered items with qty, rate)
  taxes[]        → taxes[] (from SO/DN)
  delivery_note  → delivery_note (link)

// Auto-fill: Sales Order → Sales Invoice (advance billing)

FIELD MAPPINGS:
  customer       → customer
  items[]        → items[] (all items, full qty)
  taxes[]        → taxes[]
  sales_order    → sales_order (link)
  is_advance     → true
```

---

## 10. Stage 8: Payment Collection & Reconciliation

### 10.1 Business Context

Payment Entry records money received from customers (or paid to suppliers).

### 10.2 Payment Flow

```
Payment Entry
├── payment_type: "Receive" (from customer) | "Pay" (to supplier) | "Internal Transfer"
├── party_type: "Customer" | "Supplier"
├── party: link → Customer/Supplier
├── paid_amount: currency
├── mode_of_payment: "Cash" | "Bank Transfer" | "Check" | "Mobile Money"
├── references: [Payment Entry Reference]
│   ├── reference_doctype: "Sales Invoice"
│   ├── reference_name: "SINV-2026-001"
│   ├── total_amount: currency
│   ├── outstanding_amount: currency
│   └── allocated_amount: currency (how much of this payment goes to this invoice)
└── status: "Draft" → "Submitted" (GL entries posted)

On Submit:
  1. GL Entry: Debit Cash/Bank, Credit Accounts Receivable
  2. Linked invoices: outstanding reduced
  3. If invoice fully paid → invoice status = "Paid"
  4. Customer balance updated
```

### 10.3 Outstanding Invoice Auto-Fetch

```
When user creates Payment Entry and selects a Customer:
  1. System fetches all unpaid/partially paid invoices for that customer
  2. Displays them in a table with outstanding amounts
  3. User allocates payment to specific invoices
  4. System validates total allocation ≤ paid_amount

Example:
  Customer: Abebe Trading PLC
  Payment Amount: ETB 5,000

  ┌────────────────┬───────────┬────────────┬──────────┐
  │ Invoice        │ Total     │ Outstanding│ Allocate │
  ├────────────────┼───────────┼────────────┼──────────┤
  │ SINV-2026-001  │ ETB 3,050 │ ETB 3,050  │ [3,050]  │
  │ SINV-2026-003  │ ETB 5,200 │ ETB 5,200  │ [1,950]  │
  └────────────────┴───────────┴────────────┴──────────┘
  Total Allocated: ETB 5,000 ✅
```

---

## 11. Parallel Flows

### 11.1 Inventory Management (Runs Parallel)

Stock levels are tracked automatically:

```
Increases stock:
  + Stock Entry (Material Receipt) — raw materials received
  + Stock Entry (Manufacture) — finished goods produced
  + Purchase Receipt — goods received from supplier

Decreases stock:
  - Stock Entry (Material Issue) — materials consumed
  - Stock Entry (Material Transfer) — moved between warehouses
  - Delivery Note — goods shipped to customer
  - Stock Entry (Send to Subcontractor) — outsourced work

Stock Valuation:
  → Weighted Average (default)
  → Updated on every stock transaction
```

### 11.2 Quality Inspection (V4 NEW)

```
Quality Inspection
├── item_code: link → Item
├── reference_type: "Purchase Receipt" | "Stock Entry"
├── reference_name: string
├── inspection_template: link → Quality Inspection Template
├── parameters: [QI Parameter]
│   ├── parameter: string (e.g., "Color Match")
│   ├── acceptance_criteria: string (e.g., "≥ 95% match")
│   ├── reading: string (actual value)
│   └── status: "Accepted" | "Rejected"
├── status: "Draft" → "Accepted" | "Rejected"
└── remarks: text

Flow:
  Stock Entry (Manufacture) → Quality Inspection → Pass → DN
                                                 → Fail → Rework WO
```

### 11.3 Project Tracking (V4 Master Module)

```
Project (Master Module — V4)
├── project_name: string
├── sales_order: link → Sales Order (NEW V4: linked)
├── work_orders: [link → Work Order] (NEW V4: linked)
├── status: "Open" | "In Progress" | "Completed" | "Cancelled"
├── percent_complete: number (auto-calculated)
├── tasks: [Task]
│   ├── subject: string
│   ├── status: "Open" | "Working" | "Completed"
│   ├── assigned_to: link → Employee
│   └── due_date: date
├── timesheets: [Timesheet] (time tracking)
└── expected_end_date: date

V4 Enhancements:
  → Link to Sales Order (see project cost vs sale price)
  → Link to Work Orders (production progress)
  → Move to main navigation menu (not settings)
  → Status display graph bug fix
  → KPI dashboard with completion metrics
```

---

## 12. Industry Adaptations

### 12.1 How Obsidian ERP Adapts to Different Businesses

| Business Type | Activated Modules | Disabled/Hidden | Key Workflow |
|---------------|-------------------|-----------------|-------------|
| **Printing Company** | All modules | None | Lead → Quote → SO → WO → DN → Invoice → Pay |
| **Trading Company** | CRM, Sales, Stock, Buying, Accounting | Manufacturing | Lead → Quote → SO → PO → DN → Invoice → Pay |
| **Consulting Firm** | CRM, Sales, Accounting, HR, Projects | Stock, Manufacturing, Buying | Lead → Quote → SO → Project → Invoice → Pay |
| **Restaurant/Food** | Stock, Manufacturing, Sales, Accounting | CRM (simplified) | PO → Receive → Produce → Sell → Invoice → Pay |
| **Construction** | All + Projects | Simplified Manufacturing | Lead → Quote → SO → PO → Project → Invoice → Pay |

### 12.2 Module Activation

During tenant onboarding, the admin selects which modules to activate. Disabled modules:

- Are hidden from navigation
- Their menu items don't appear
- Their API routes still exist (but return empty)
- Can be activated later without data loss

---

## Summary

Part 1 establishes:

1. ✅ **Universal Lead-to-Cash** — 8 stages covering every SME type
2. ✅ **Stage-by-stage breakdown** — data models, UX flows, auto-fill rules
3. ✅ **V4 automations** — SO→WO creation, overdue monitoring, approval workflows
4. ✅ **Service vs Stock items** — handling for hybrid businesses
5. ✅ **Procurement flow** — Material Request → RFQ → PO → Receipt
6. ✅ **Manufacturing flow** — WO → Stock Entry → QI → DN
7. ✅ **Parallel flows** — inventory, quality, projects
8. ✅ **Industry adaptations** — plug-and-play module activation

**Next:** Part 2 covers detailed Module Specifications — every DocType, every field, every validation rule.

---

*Obsidian ERP v4.0 Business Workflow — Part 1 of 3*  
*© 2026 VersaLabs Studio. All rights reserved.*
