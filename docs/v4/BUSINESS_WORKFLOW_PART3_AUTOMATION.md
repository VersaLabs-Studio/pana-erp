# Obsidian ERP v4.0 — Business Workflow Document (Part 3 of 3)
# Automation Rules, Status Machines, Notifications & Flow Configuration

> **Product:** Obsidian ERP  
> **Company:** VersaLabs Studio  
> **Document Version:** 4.0.0  
> **Last Updated:** 2026-05-31  
> **Depends On:** Part 1 (Lead-to-Cash), Part 2 (Module Specs)  
> **Audience:** Coding Agents — This document contains every automation rule in the system

---

## Table of Contents

1. [Auto-Fill Mapping Registry](#1-auto-fill-mapping-registry)
2. [Status State Machines](#2-status-state-machines)
3. [Notification Rules](#3-notification-rules)
4. [Flow Tracker Configuration](#4-flow-tracker-configuration)
5. [Approval Workflows](#5-approval-workflows)
6. [Scheduled Automations (Cron)](#6-scheduled-automations-cron)
7. [Cross-Module Validation Rules](#7-cross-module-validation-rules)
8. [KPI Calculation Rules](#8-kpi-calculation-rules)
9. [Default Value Rules](#9-default-value-rules)
10. [Migration Checklist: V3 → V4](#10-migration-checklist-v3--v4)

---

## 1. Auto-Fill Mapping Registry

### 1.1 Complete Auto-Fill Map

This is the **definitive reference** for every auto-fill mapping in Obsidian ERP. When a document is created "from" another document, these fields are automatically populated.

```typescript
// lib/flows/flow-auto-fill.ts
// COMPLETE AUTO-FILL REGISTRY — Every mapping in the system

export const AUTO_FILL_REGISTRY: Record<string, AutoFillMapping> = {

  // ── LEAD → CUSTOMER ──
  "Lead->Customer": {
    source: "Lead",
    target: "Customer",
    trigger: "Convert to Customer button",
    mappings: [
      { from: "lead_name",     to: "customer_name" },
      { from: "company_name",  to: "customer_name",  condition: "if company_name exists" },
      { from: "email_id",      to: "email_id" },
      { from: "mobile_no",     to: "mobile_no" },
      { from: "territory",     to: "territory" },
      { from: "industry_type", to: "industry" },
      { from: "name",          to: "lead_name",      note: "Link back to lead" },
    ],
    sideEffects: [
      "Lead.status → 'Converted'",
      "Lead.converted_to → Customer.name",
    ],
  },

  // ── LEAD → OPPORTUNITY ──
  "Lead->Opportunity": {
    source: "Lead",
    target: "Opportunity",
    trigger: "Create Opportunity button",
    mappings: [
      { from: "lead_name",     to: "party_name" },
      { from: "company_name",  to: "customer_name" },
      { from: "name",          to: "party_name",     note: "Link to lead" },
      { from: "territory",     to: "territory" },
      { from: "source",        to: "source" },
    ],
    defaults: {
      opportunity_from: "Lead",
      status: "Open",
    },
  },

  // ── LEAD/CUSTOMER → QUOTATION ──
  "Customer->Quotation": {
    source: "Customer",
    target: "Quotation",
    trigger: "Create Quotation button on Customer detail page",
    mappings: [
      { from: "name",              to: "party_name" },
      { from: "customer_name",     to: "customer_name" },
      { from: "default_price_list",to: "selling_price_list" },
      { from: "payment_terms",     to: "payment_terms_template" },
      { from: "default_currency",  to: "currency" },
    ],
    defaults: {
      quotation_to: "Customer",
      transaction_date: "TODAY",
      valid_till: "TODAY+30",
    },
  },

  // ── QUOTATION → SALES ORDER ──
  "Quotation->Sales Order": {
    source: "Quotation",
    target: "Sales Order",
    trigger: "Create Sales Order button OR Wizard 'from_quotation' param",
    mappings: [
      { from: "party_name",      to: "customer" },
      { from: "customer_name",   to: "customer_name" },
      { from: "items",           to: "items",           type: "child_table" },
      { from: "taxes",           to: "taxes",           type: "child_table" },
      { from: "grand_total",     to: "grand_total" },
      { from: "net_total",       to: "net_total" },
      { from: "tc_name",         to: "tc_name" },
      { from: "terms",           to: "terms" },
      { from: "selling_price_list", to: "selling_price_list" },
      { from: "currency",        to: "currency" },
      { from: "name",            to: "quotation",       note: "Link back" },
      { from: "attachments",     to: "attachments",     type: "files" },
    ],
    childTableMappings: {
      items: [
        { from: "item_code", to: "item_code" },
        { from: "item_name", to: "item_name" },
        { from: "description", to: "description" },
        { from: "qty", to: "qty" },
        { from: "uom", to: "uom" },
        { from: "rate", to: "rate" },
        { from: "amount", to: "amount" },
        { from: "item_group", to: "item_group" },
        { from: "warehouse", to: "warehouse" },
      ],
    },
    defaults: {
      transaction_date: "TODAY",
      order_type: "Sales",
    },
    sideEffects: [
      "Quotation.status → 'Ordered'",
    ],
    userMustFill: ["delivery_date"],
  },

  // ── SALES ORDER → WORK ORDER ──
  "Sales Order->Work Order": {
    source: "Sales Order",
    target: "Work Order",
    trigger: "Create Work Order(s) button on submitted SO",
    note: "Creates ONE Work Order per qualifying stock item",
    filter: "Only items where is_stock_item = true AND bom_no exists",
    mappings: [
      { from: "items[].item_code",  to: "production_item" },
      { from: "items[].item_name",  to: "item_name" },
      { from: "items[].bom_no",     to: "bom_no",        fallback: "Default BOM for item" },
      { from: "items[].qty",        to: "qty",            transform: "UOM_ROUNDUP" },
      { from: "name",               to: "sales_order" },
      { from: "delivery_date",      to: "expected_delivery_date" },
    ],
    defaults: {
      fg_warehouse: "Finished Goods - Company",
      wip_warehouse: "Work In Progress - Company",
      status: "Not Started",
    },
    transforms: {
      UOM_ROUNDUP: "Round qty UP to nearest whole UOM conversion unit",
    },
  },

  // ── SALES ORDER → DELIVERY NOTE ──
  "Sales Order->Delivery Note": {
    source: "Sales Order",
    target: "Delivery Note",
    trigger: "Create Delivery Note button on submitted SO",
    mappings: [
      { from: "customer",       to: "customer" },
      { from: "customer_name",  to: "customer_name" },
      { from: "items",          to: "items",          type: "child_table" },
      { from: "taxes",          to: "taxes",          type: "child_table" },
      { from: "name",           to: "against_sales_order", note: "per item" },
    ],
    childTableMappings: {
      items: [
        { from: "item_code",    to: "item_code" },
        { from: "item_name",    to: "item_name" },
        { from: "qty",          to: "qty",       transform: "PENDING_QTY" },
        { from: "rate",         to: "rate" },
        { from: "warehouse",    to: "warehouse" },
        { from: "name",         to: "so_detail",  note: "SO Item reference" },
        { from: "parent",       to: "against_sales_order" },
      ],
    },
    transforms: {
      PENDING_QTY: "qty = so_item.qty - so_item.delivered_qty",
    },
    defaults: {
      posting_date: "TODAY",
    },
  },

  // ── SALES ORDER → SALES INVOICE ──
  "Sales Order->Sales Invoice": {
    source: "Sales Order",
    target: "Sales Invoice",
    trigger: "Create Invoice button (advance billing)",
    mappings: [
      { from: "customer",       to: "customer" },
      { from: "customer_name",  to: "customer_name" },
      { from: "items",          to: "items",          type: "child_table" },
      { from: "taxes",          to: "taxes",          type: "child_table" },
      { from: "name",           to: "sales_order" },
    ],
    defaults: {
      posting_date: "TODAY",
      is_pos: 0,
    },
  },

  // ── DELIVERY NOTE → SALES INVOICE ──
  "Delivery Note->Sales Invoice": {
    source: "Delivery Note",
    target: "Sales Invoice",
    trigger: "Create Sales Invoice button on submitted DN",
    mappings: [
      { from: "customer",       to: "customer" },
      { from: "customer_name",  to: "customer_name" },
      { from: "items",          to: "items",          type: "child_table" },
      { from: "taxes",          to: "taxes",          type: "child_table" },
      { from: "name",           to: "delivery_note" },
    ],
    defaults: {
      posting_date: "TODAY",
    },
    sideEffects: [
      "SO.per_billed updated",
    ],
  },

  // ── WORK ORDER → MATERIAL REQUEST ──
  "Work Order->Material Request": {
    source: "Work Order",
    target: "Material Request",
    trigger: "Create Material Request button",
    mappings: [
      { from: "required_items", to: "items",          type: "child_table" },
      { from: "name",           to: "work_order" },
    ],
    childTableMappings: {
      items: [
        { from: "item_code",     to: "item_code" },
        { from: "required_qty",  to: "qty",       transform: "PENDING_QTY" },
        { from: "source_warehouse", to: "warehouse" },
      ],
    },
    defaults: {
      material_request_type: "Material Transfer",
      schedule_date: "TODAY",
    },
  },

  // ── WORK ORDER → STOCK ENTRY (Manufacture) ──
  "Work Order->Stock Entry (Manufacture)": {
    source: "Work Order",
    target: "Stock Entry",
    trigger: "Create Stock Entry: Manufacture button",
    mappings: [
      { from: "production_item",    to: "items[FG].item_code" },
      { from: "qty",                to: "items[FG].qty",     transform: "PENDING_QTY" },
      { from: "fg_warehouse",       to: "items[FG].t_warehouse" },
      { from: "required_items",     to: "items[RM]",         note: "Raw materials consumed" },
      { from: "name",               to: "work_order" },
      { from: "bom_no",             to: "bom_no" },
    ],
    defaults: {
      purpose: "Manufacture",
    },
  },

  // ── MATERIAL REQUEST → PURCHASE ORDER ──
  "Material Request->Purchase Order": {
    source: "Material Request",
    target: "Purchase Order",
    trigger: "Create Purchase Order button (for type 'Purchase')",
    mappings: [
      { from: "items",           to: "items",          type: "child_table" },
    ],
    childTableMappings: {
      items: [
        { from: "item_code", to: "item_code" },
        { from: "qty",       to: "qty" },
        { from: "uom",       to: "uom" },
      ],
    },
    userMustFill: ["supplier", "schedule_date"],
    defaults: {
      transaction_date: "TODAY",
    },
  },

  // ── REQUEST FOR QUOTATION → SUPPLIER QUOTATION ──
  "RFQ->Supplier Quotation": {
    source: "Request for Quotation",
    target: "Supplier Quotation",
    trigger: "Auto-created when RFQ is sent to suppliers",
    note: "One Supplier Quotation created per selected supplier",
    mappings: [
      { from: "items",         to: "items",          type: "child_table" },
      { from: "name",          to: "request_for_quotation" },
    ],
    perSupplier: true,
  },

  // ── SUPPLIER QUOTATION → PURCHASE ORDER ──
  "Supplier Quotation->Purchase Order": {
    source: "Supplier Quotation",
    target: "Purchase Order",
    trigger: "Create Purchase Order button on accepted SQ",
    mappings: [
      { from: "supplier",       to: "supplier" },
      { from: "items",          to: "items",          type: "child_table" },
      { from: "grand_total",    to: "grand_total" },
      { from: "name",           to: "supplier_quotation" },
    ],
    defaults: {
      transaction_date: "TODAY",
    },
  },

  // ── PURCHASE ORDER → PURCHASE INVOICE ──
  "Purchase Order->Purchase Invoice": {
    source: "Purchase Order",
    target: "Purchase Invoice",
    trigger: "Create Purchase Invoice button",
    mappings: [
      { from: "supplier",       to: "supplier" },
      { from: "supplier_name",  to: "supplier_name" },
      { from: "items",          to: "items",          type: "child_table" },
      { from: "taxes",          to: "taxes",          type: "child_table" },
      { from: "name",           to: "purchase_order" },
    ],
    defaults: {
      posting_date: "TODAY",
    },
  },

  // ── INVOICE → PAYMENT ENTRY ──
  "Sales Invoice->Payment Entry": {
    source: "Sales Invoice",
    target: "Payment Entry",
    trigger: "Create Payment Entry button on submitted invoice",
    mappings: [
      { from: "customer",       to: "party" },
      { from: "customer_name",  to: "party_name" },
      { from: "outstanding_amount", to: "paid_amount" },
      { from: "name",           to: "references[0].reference_name" },
      { from: "outstanding_amount", to: "references[0].allocated_amount" },
    ],
    defaults: {
      payment_type: "Receive",
      party_type: "Customer",
      posting_date: "TODAY",
      "references[0].reference_doctype": "Sales Invoice",
    },
  },

  "Purchase Invoice->Payment Entry": {
    source: "Purchase Invoice",
    target: "Payment Entry",
    trigger: "Create Payment Entry button on submitted bill",
    mappings: [
      { from: "supplier",       to: "party" },
      { from: "supplier_name",  to: "party_name" },
      { from: "outstanding_amount", to: "paid_amount" },
      { from: "name",           to: "references[0].reference_name" },
      { from: "outstanding_amount", to: "references[0].allocated_amount" },
    ],
    defaults: {
      payment_type: "Pay",
      party_type: "Supplier",
      posting_date: "TODAY",
      "references[0].reference_doctype": "Purchase Invoice",
    },
  },
};
```

---

## 2. Status State Machines

### 2.1 Transactional Document Status Flows

```typescript
// Every transactional DocType follows a state machine

export const STATUS_MACHINES: Record<string, StatusMachine> = {

  Lead: {
    initial: "Lead",
    transitions: {
      "Lead → Open":        { trigger: "First activity/note added" },
      "Open → Replied":     { trigger: "Quotation created" },
      "Open → Opportunity": { trigger: "Opportunity created" },
      "Replied → Converted":{ trigger: "Convert to Customer clicked" },
      "* → Do Not Contact": { trigger: "Manual — user sets this" },
    },
  },

  Quotation: {
    initial: "Draft",
    transitions: {
      "Draft → Open":     { trigger: "Submit", validation: "Items must exist" },
      "Open → Ordered":   { trigger: "Sales Order created from this quote" },
      "Open → Lost":      { trigger: "Mark as Lost", requires: "lost_reason" },
      "Open → Cancelled": { trigger: "Cancel" },
    },
  },

  "Sales Order": {
    initial: "Draft",
    transitions: {
      "Draft → To Deliver and Bill": { 
        trigger: "Submit",
        validation: "Items exist, delivery_date set, customer valid",
        sideEffects: ["Lock order", "Allow downstream creation"],
      },
      "To Deliver and Bill → To Bill": {
        trigger: "All items delivered (per_delivered = 100)",
        auto: true,
      },
      "To Deliver and Bill → To Deliver": {
        trigger: "All items billed (per_billed = 100)",
        auto: true,
      },
      "To Bill → Completed": {
        trigger: "All items billed AND delivered",
        auto: true,
      },
      "To Deliver → Completed": {
        trigger: "All items delivered AND billed",
        auto: true,
      },
      "* → Cancelled": {
        trigger: "Cancel",
        validation: "No submitted DNs or Invoices linked",
        sideEffects: ["Reverse stock reservations"],
      },
    },
  },

  "Work Order": {
    initial: "Not Started",
    transitions: {
      "Not Started → In Process": {
        trigger: "Start button",
        validation: "Materials available",
        sideEffects: ["Allow Stock Entry creation"],
      },
      "In Process → Completed": {
        trigger: "All qty manufactured (produced_qty >= qty)",
        auto: true,
        sideEffects: ["Update SO if linked"],
      },
      "* → Stopped": {
        trigger: "Stop button",
        sideEffects: ["Pause production"],
      },
      "Stopped → In Process": {
        trigger: "Resume button",
      },
      "* → Cancelled": {
        trigger: "Cancel",
        validation: "No submitted Stock Entries",
      },
    },
  },

  "Delivery Note": {
    initial: "Draft",
    transitions: {
      "Draft → To Bill": {
        trigger: "Submit",
        validation: "Items with qty > 0, warehouse has stock",
        sideEffects: [
          "Deduct stock from warehouse",
          "Update SO per_delivered",
          "Update SO status",
        ],
      },
      "To Bill → Completed": {
        trigger: "Sales Invoice created and submitted",
        auto: true,
      },
      "* → Cancelled": {
        trigger: "Cancel",
        sideEffects: ["Reverse stock deduction", "Update SO per_delivered"],
      },
    },
  },

  "Sales Invoice": {
    initial: "Draft",
    transitions: {
      "Draft → Unpaid": {
        trigger: "Submit",
        validation: "Items exist, customer valid",
        sideEffects: [
          "GL Entry: Debit AR, Credit Revenue",
          "Post tax entries",
          "Update SO per_billed",
          "Update Customer outstanding",
        ],
      },
      "Unpaid → Partly Paid": {
        trigger: "Partial Payment Entry submitted",
        auto: true,
      },
      "Unpaid → Paid": {
        trigger: "Full Payment Entry submitted (outstanding = 0)",
        auto: true,
      },
      "Partly Paid → Paid": {
        trigger: "Remaining amount paid",
        auto: true,
      },
      "Unpaid → Overdue": {
        trigger: "due_date < today (automatic, checked daily)",
        auto: true,
      },
      "* → Cancelled": {
        trigger: "Cancel",
        validation: "No payments allocated",
        sideEffects: ["Reverse GL entries", "Update Customer outstanding"],
      },
    },
  },

  "Payment Entry": {
    initial: "Draft",
    transitions: {
      "Draft → Submitted": {
        trigger: "Submit",
        validation: "Amount > 0, allocations valid, bank balance check (warn)",
        sideEffects: [
          "GL Entry: Debit Cash/Bank, Credit AR (for Receive)",
          "Update linked invoice outstanding",
          "Update linked invoice status (Paid/Partly Paid)",
        ],
      },
      "Submitted → Cancelled": {
        trigger: "Cancel",
        sideEffects: ["Reverse GL entries", "Restore invoice outstanding"],
      },
    },
  },

  "Purchase Order": {
    initial: "Draft",
    transitions: {
      "Draft → Pending Approval": {
        trigger: "Submit (when amount > approval threshold)",
        condition: "amount > APPROVAL_THRESHOLD",
      },
      "Draft → To Receive and Bill": {
        trigger: "Submit (when amount ≤ approval threshold OR auto-approved)",
      },
      "Pending Approval → To Receive and Bill": {
        trigger: "Manager/Director approves",
      },
      "Pending Approval → Rejected": {
        trigger: "Manager/Director rejects",
      },
      "To Receive and Bill → To Bill": {
        trigger: "All items received",
        auto: true,
      },
      "To Bill → Completed": {
        trigger: "Purchase Invoice submitted",
        auto: true,
      },
    },
  },
};
```

---

## 3. Notification Rules

### 3.1 System Notifications

```typescript
export const NOTIFICATION_RULES: NotificationRule[] = [

  // ── OVERDUE SALES ORDERS ──
  {
    id: "overdue-so",
    name: "Overdue Sales Order Alert",
    trigger: "CRON: daily at 08:00",
    condition: "Sales Order.delivery_date < TODAY AND status IN ('To Deliver', 'To Deliver and Bill')",
    recipients: ["order_owner", "sales_manager"],
    channels: ["system", "email"],
    template: {
      subject: "⚠️ Overdue: Sales Order {name} — {customer_name}",
      body: "Sales Order {name} for {customer_name} was due on {delivery_date}. It is now {days_overdue} days overdue. Amount: ETB {grand_total}.",
      actions: [{ label: "View Order", link: "/sales/sales-order/{name}" }],
    },
  },

  // ── OVERDUE INVOICES ──
  {
    id: "overdue-invoice",
    name: "Overdue Invoice Alert",
    trigger: "CRON: daily at 08:00",
    condition: "Sales Invoice.due_date < TODAY AND status = 'Unpaid'",
    recipients: ["invoice_owner", "accounts_manager"],
    channels: ["system", "email"],
    template: {
      subject: "💰 Overdue: Invoice {name} — {customer_name} — ETB {outstanding_amount}",
      body: "Invoice {name} for {customer_name} is {days_overdue} days overdue. Outstanding: ETB {outstanding_amount}.",
    },
  },

  // ── LOW STOCK ALERT ──
  {
    id: "low-stock",
    name: "Low Stock Alert",
    trigger: "ON_STOCK_CHANGE: when actual_qty < reorder_level",
    condition: "Item.reorder_level > 0 AND actual_qty < reorder_level",
    recipients: ["stock_manager", "buying_manager"],
    channels: ["system"],
    template: {
      subject: "📦 Low Stock: {item_name} — {actual_qty} remaining",
      body: "{item_name} ({item_code}) stock is below minimum. Current: {actual_qty}. Minimum: {reorder_level}. Suggested action: Create Material Request.",
      actions: [{ label: "Create MR", link: "/stock/material-request/new?item={item_code}" }],
    },
  },

  // ── PURCHASE ORDER APPROVAL ──
  {
    id: "po-approval",
    name: "Purchase Order Approval Request",
    trigger: "ON_STATUS_CHANGE: PO status → 'Pending Approval'",
    condition: "Purchase Order.status = 'Pending Approval'",
    recipients: ["approval_manager"],
    channels: ["system", "email"],
    template: {
      subject: "🔒 Approval Required: PO {name} — ETB {grand_total}",
      body: "{created_by} has submitted Purchase Order {name} for {supplier_name}. Amount: ETB {grand_total}. Please review and approve.",
      actions: [
        { label: "Approve", link: "/buying/purchase-order/{name}?action=approve" },
        { label: "Reject", link: "/buying/purchase-order/{name}?action=reject" },
      ],
    },
  },

  // ── SALES ORDER SUBMITTED ──
  {
    id: "so-submitted",
    name: "New Sales Order",
    trigger: "ON_STATUS_CHANGE: SO status → 'To Deliver and Bill'",
    recipients: ["production_manager"],
    channels: ["system"],
    template: {
      subject: "🛒 New Order: {name} — {customer_name}",
      body: "Sales Order {name} has been submitted. Customer: {customer_name}. Delivery: {delivery_date}. Total: ETB {grand_total}.",
      actions: [{ label: "Create Work Orders", link: "/sales/sales-order/{name}" }],
    },
  },

  // ── PAYMENT RECEIVED ──
  {
    id: "payment-received",
    name: "Payment Received",
    trigger: "ON_SUBMIT: Payment Entry with payment_type = 'Receive'",
    recipients: ["accounts_manager", "order_owner"],
    channels: ["system"],
    template: {
      subject: "✅ Payment: ETB {paid_amount} from {party_name}",
      body: "Payment of ETB {paid_amount} received from {party_name} via {mode_of_payment}.",
    },
  },

  // ── WORK ORDER COMPLETED ──
  {
    id: "wo-completed",
    name: "Production Complete",
    trigger: "ON_STATUS_CHANGE: WO status → 'Completed'",
    recipients: ["sales_manager", "order_owner"],
    channels: ["system"],
    template: {
      subject: "🏭 Production Complete: {name} — {item_name}",
      body: "Work Order {name} for {item_name} (Qty: {qty}) is complete. Ready for delivery.",
      actions: [{ label: "Create DN", link: "/sales/sales-order/{sales_order}" }],
    },
  },
];
```

---

## 4. Flow Tracker Configuration

### 4.1 Flow Definition

```typescript
// lib/flows/flow-tracker-config.ts

export const LEAD_TO_CASH_FLOW: FlowTrackerConfig = {
  id: "lead-to-cash",
  name: "Lead to Cash",
  stages: [
    {
      position: 1,
      doctype: "Lead",
      label: "Lead",
      icon: "UserPlus",
      color: "blue",
      resolveFrom: {
        // How to find the Lead when viewing a downstream document
        Opportunity: "party_name (where opportunity_from = 'Lead')",
        Quotation: "via Opportunity → Lead",
        "Sales Order": "via Quotation → Opportunity → Lead",
      },
    },
    {
      position: 2,
      doctype: "Opportunity",
      label: "Opportunity",
      icon: "Target",
      color: "purple",
      optional: true,
      resolveFrom: {
        Quotation: "opportunity",
        "Sales Order": "via Quotation → opportunity",
      },
    },
    {
      position: 3,
      doctype: "Quotation",
      label: "Quotation",
      icon: "FileText",
      color: "amber",
      resolveFrom: {
        "Sales Order": "quotation",
      },
    },
    {
      position: 4,
      doctype: "Sales Order",
      label: "Sales Order",
      icon: "ShoppingCart",
      color: "green",
      resolveFrom: {
        "Work Order": "sales_order",
        "Delivery Note": "items[0].against_sales_order",
        "Sales Invoice": "items[0].sales_order",
      },
    },
    {
      position: 5,
      doctype: "Work Order",
      label: "Work Order",
      icon: "Factory",
      color: "orange",
      optional: true,
      multiple: true,  // Can have multiple WOs for one SO
      resolveFrom: {
        "Sales Order": "REVERSE: Work Order.sales_order = SO.name",
      },
    },
    {
      position: 6,
      doctype: "Delivery Note",
      label: "Delivery",
      icon: "Truck",
      color: "teal",
      multiple: true,  // Partial deliveries
      resolveFrom: {
        "Sales Order": "REVERSE: DN.items.against_sales_order = SO.name",
        "Sales Invoice": "items[0].delivery_note",
      },
    },
    {
      position: 7,
      doctype: "Sales Invoice",
      label: "Invoice",
      icon: "Receipt",
      color: "red",
      multiple: true,
      resolveFrom: {
        "Sales Order": "REVERSE: SINV.items.sales_order = SO.name",
        "Payment Entry": "references[0].reference_name (where ref_doctype = 'Sales Invoice')",
      },
    },
    {
      position: 8,
      doctype: "Payment Entry",
      label: "Payment",
      icon: "CreditCard",
      color: "emerald",
      multiple: true,
      resolveFrom: {
        "Sales Invoice": "REVERSE: PE.references.reference_name = SINV.name",
      },
    },
  ],
};
```

### 4.2 Flow Tracker Resolution Algorithm

```typescript
/**
 * Given a current document, resolve the full flow chain.
 * Returns which stages are completed, current, and pending.
 */
async function resolveFlowChain(
  currentDoctype: string,
  currentName: string
): Promise<FlowChainResult> {
  
  const currentPosition = LEAD_TO_CASH_FLOW.stages
    .find(s => s.doctype === currentDoctype)?.position;

  if (!currentPosition) return { stages: [], current: null };

  const result: FlowChainResult = { stages: [], current: currentPosition };

  // Walk backwards to find upstream documents
  for (let i = currentPosition - 1; i >= 1; i--) {
    const stage = LEAD_TO_CASH_FLOW.stages[i - 1];
    const resolver = stage.resolveFrom?.[currentDoctype];
    
    if (resolver) {
      const doc = await resolveUpstream(resolver, currentName);
      result.stages.push({
        position: stage.position,
        doctype: stage.doctype,
        name: doc?.name || null,
        status: doc ? 'completed' : (stage.optional ? 'skipped' : 'not_found'),
      });
    }
  }

  // Current stage
  result.stages.push({
    position: currentPosition,
    doctype: currentDoctype,
    name: currentName,
    status: 'current',
  });

  // Walk forwards to find downstream documents
  for (let i = currentPosition + 1; i <= 8; i++) {
    const stage = LEAD_TO_CASH_FLOW.stages[i - 1];
    const resolver = stage.resolveFrom?.[currentDoctype];
    
    if (resolver) {
      const doc = await resolveDownstream(resolver, currentName);
      result.stages.push({
        position: stage.position,
        doctype: stage.doctype,
        name: doc?.name || null,
        status: doc ? 'completed' : 'pending',
        canCreate: i === currentPosition + 1, // Only next step shows create button
      });
    }
  }

  return result;
}
```

---

## 5. Approval Workflows

### 5.1 Purchase Order Approval

```typescript
export const PO_APPROVAL_WORKFLOW = {
  doctype: "Purchase Order",
  thresholds: [
    { maxAmount: 10_000,  approver: null,         autoApprove: true },
    { maxAmount: 50_000,  approver: "Manager",    autoApprove: false },
    { maxAmount: Infinity, approver: "Director",   autoApprove: false },
  ],
  
  onSubmit: (po: PurchaseOrder) => {
    const threshold = PO_APPROVAL_WORKFLOW.thresholds
      .find(t => po.grand_total <= t.maxAmount);
    
    if (threshold?.autoApprove) {
      return { status: "To Receive and Bill" };
    } else {
      return { 
        status: "Pending Approval",
        notifyRole: threshold?.approver,
      };
    }
  },

  onApprove: (po: PurchaseOrder) => {
    return { status: "To Receive and Bill" };
  },

  onReject: (po: PurchaseOrder, reason: string) => {
    return { status: "Rejected", rejection_reason: reason };
  },
};
```

---

## 6. Scheduled Automations (Cron)

```typescript
export const SCHEDULED_TASKS = [
  {
    id: "overdue-check",
    name: "Check Overdue Documents",
    schedule: "0 8 * * *",  // 8:00 AM daily
    action: async () => {
      await checkOverdueSalesOrders();
      await checkOverdueInvoices();
      await updateInvoiceStatuses(); // Unpaid → Overdue
    },
  },
  {
    id: "low-stock-check",
    name: "Check Low Stock Levels",
    schedule: "0 7 * * *",  // 7:00 AM daily
    action: async () => {
      await checkLowStockItems();
    },
  },
  {
    id: "auto-repeat-po",
    name: "Process Auto-Repeat Purchase Orders",
    schedule: "0 6 * * 1",  // 6:00 AM every Monday
    action: async () => {
      await processAutoRepeatPurchaseOrders();
    },
  },
  {
    id: "backup",
    name: "Automated Backup",
    schedule: "0 2 * * *",  // 2:00 AM daily
    action: async () => {
      await runDatabaseBackup();
      await runSitesBackup();
    },
  },
];
```

---

## 7. Cross-Module Validation Rules

```typescript
export const CROSS_MODULE_VALIDATIONS = {

  // Can't deliver more than ordered
  "Delivery Note": {
    beforeSubmit: [
      {
        rule: "Delivery qty ≤ SO pending qty",
        check: (dn: DeliveryNote) => {
          for (const item of dn.items) {
            const soItem = getSalesOrderItem(item.so_detail);
            if (item.qty > soItem.qty - soItem.delivered_qty) {
              throw new Error(`Cannot deliver ${item.qty} of ${item.item_code}. Only ${soItem.qty - soItem.delivered_qty} pending.`);
            }
          }
        },
      },
      {
        rule: "Warehouse has sufficient stock",
        check: (dn: DeliveryNote) => {
          for (const item of dn.items) {
            const stock = getActualQty(item.item_code, item.warehouse);
            if (item.qty > stock) {
              throw new Error(`Insufficient stock for ${item.item_code} in ${item.warehouse}. Available: ${stock}`);
            }
          }
        },
      },
    ],
  },

  // Can't invoice more than delivered (for stock items)
  "Sales Invoice": {
    beforeSubmit: [
      {
        rule: "Invoice qty ≤ delivered qty (for stock items)",
        check: (sinv: SalesInvoice) => {
          for (const item of sinv.items) {
            if (item.is_stock_item && item.delivery_note) {
              const dnItem = getDeliveryNoteItem(item.dn_detail);
              if (item.qty > dnItem.qty) {
                throw new Error(`Cannot invoice more than delivered for ${item.item_code}`);
              }
            }
          }
        },
      },
      {
        rule: "Customer credit limit check",
        check: (sinv: SalesInvoice) => {
          const customer = getCustomer(sinv.customer);
          if (customer.credit_limit > 0) {
            const outstanding = getCustomerOutstanding(sinv.customer);
            if (outstanding + sinv.grand_total > customer.credit_limit) {
              warn(`Customer ${sinv.customer_name} will exceed credit limit. Outstanding: ETB ${outstanding}. Limit: ETB ${customer.credit_limit}`);
            }
          }
        },
      },
    ],
  },

  // Payment can't exceed invoice outstanding
  "Payment Entry": {
    beforeSubmit: [
      {
        rule: "Allocation ≤ invoice outstanding",
        check: (pe: PaymentEntry) => {
          for (const ref of pe.references) {
            const invoice = getDocument(ref.reference_doctype, ref.reference_name);
            if (ref.allocated_amount > invoice.outstanding_amount) {
              throw new Error(`Cannot allocate ETB ${ref.allocated_amount} to ${ref.reference_name}. Outstanding: ETB ${invoice.outstanding_amount}`);
            }
          }
        },
      },
      {
        rule: "Bank balance warning",
        check: (pe: PaymentEntry) => {
          if (pe.payment_type === "Pay") {
            const bankBalance = getAccountBalance(pe.paid_from);
            if (pe.paid_amount > bankBalance) {
              warn(`Payment of ETB ${pe.paid_amount} exceeds bank balance of ETB ${bankBalance}`);
            }
          }
        },
      },
    ],
  },

  // Journal Entry must balance
  "Journal Entry": {
    beforeSubmit: [
      {
        rule: "Total Debit = Total Credit",
        check: (je: JournalEntry) => {
          const totalDebit = je.accounts.reduce((sum, a) => sum + (a.debit || 0), 0);
          const totalCredit = je.accounts.reduce((sum, a) => sum + (a.credit || 0), 0);
          if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Journal Entry is unbalanced. Debit: ETB ${totalDebit}, Credit: ETB ${totalCredit}`);
          }
        },
      },
    ],
  },
};
```

---

## 8. KPI Calculation Rules

```typescript
export const KPI_CALCULATIONS = {

  // ── CRM Dashboard ──
  "crm.total_leads":       "COUNT(Lead)",
  "crm.open_leads":        "COUNT(Lead WHERE status = 'Open')",
  "crm.conversion_rate":   "COUNT(Lead WHERE status = 'Converted') / COUNT(Lead) * 100",
  "crm.new_this_month":    "COUNT(Lead WHERE creation >= FIRST_OF_MONTH)",

  // ── Sales Dashboard ──
  "sales.total_orders":    "COUNT(Sales Order WHERE docstatus = 1)",
  "sales.revenue_month":   "SUM(Sales Order.grand_total WHERE transaction_date >= FIRST_OF_MONTH AND docstatus = 1)",
  "sales.overdue":         "COUNT(Sales Order WHERE delivery_date < TODAY AND status IN ('To Deliver', 'To Deliver and Bill'))",
  "sales.draft":           "COUNT(Sales Order WHERE docstatus = 0)",

  // ── Stock Dashboard ──
  "stock.total_items":     "COUNT(Item WHERE disabled = 0)",
  "stock.low_stock":       "COUNT(Item WHERE actual_qty < reorder_level AND reorder_level > 0)",
  "stock.stock_items":     "COUNT(Item WHERE is_stock_item = 1)",
  "stock.service_items":   "COUNT(Item WHERE is_stock_item = 0)",

  // ── Manufacturing Dashboard ──
  "mfg.active_wo":         "COUNT(Work Order WHERE status = 'In Process')",
  "mfg.not_started":       "COUNT(Work Order WHERE status = 'Not Started')",
  "mfg.completed_month":   "COUNT(Work Order WHERE status = 'Completed' AND modified >= FIRST_OF_MONTH)",

  // ── Accounting Dashboard ──
  "acc.total_receivable":  "SUM(Sales Invoice.outstanding_amount WHERE docstatus = 1 AND outstanding_amount > 0)",
  "acc.total_payable":     "SUM(Purchase Invoice.outstanding_amount WHERE docstatus = 1 AND outstanding_amount > 0)",
  "acc.overdue_invoices":  "COUNT(Sales Invoice WHERE due_date < TODAY AND status = 'Overdue')",
  "acc.collected_month":   "SUM(Payment Entry.paid_amount WHERE payment_type = 'Receive' AND posting_date >= FIRST_OF_MONTH AND docstatus = 1)",
};
```

---

## 9. Default Value Rules

```typescript
export const DEFAULT_VALUES = {
  // Dates
  "*.transaction_date": "TODAY",
  "*.posting_date": "TODAY",
  "Quotation.valid_till": "TODAY + 30 days",

  // Currency
  "*.currency": "ETB",

  // Company
  "*.company": "TENANT_DEFAULT_COMPANY",

  // Warehouses
  "Work Order.fg_warehouse": "Finished Goods - {company}",
  "Work Order.wip_warehouse": "Work In Progress - {company}",
  "Stock Entry.from_warehouse": "Main Warehouse - {company}",

  // Naming Series
  "Quotation.naming_series": "QTN-.YYYY.-",
  "Sales Order.naming_series": "SO-.YYYY.-",
  "Sales Invoice.naming_series": "SINV-.YYYY.-",
  "Purchase Order.naming_series": "PO-.YYYY.-",
  "Purchase Invoice.naming_series": "PINV-.YYYY.-",
  "Payment Entry.naming_series": "PE-.YYYY.-",
  "Delivery Note.naming_series": "DN-.YYYY.-",
  "Work Order.naming_series": "WO-.YYYY.-",
  "Material Request.naming_series": "MR-.YYYY.-",
  "Stock Entry.naming_series": "SE-.YYYY.-",
  "Journal Entry.naming_series": "JE-.YYYY.-",

  // Tax
  "*.taxes_and_charges": "Ethiopian VAT 15% - {company}",
};
```

---

## 10. Migration Checklist: V3 → V4

### 10.1 Code Changes

```
[ ] Update package.json: name → "obsidian", version → "4.0.0"
[ ] Update app/layout.tsx: title → "Obsidian ERP", localStorage key → "obsidian-erp-theme"
[ ] Update all references: "Pana" → "Obsidian", "VersaForge" → "Obsidian"
[ ] Create docs/v4/ directory with all 7 architecture documents
[ ] Create components/flows/ directory (FlowWizard, FlowTracker, FlowStep)
[ ] Create components/ai/ directory (AICopilot, AIMessage, AIActionCard)
[ ] Create components/command/ directory (CommandPalette)
[ ] Create components/dashboard/ directory (KPICard, ActionCard)
[ ] Create lib/ai/ directory (ai-client, ai-tools, ai-context, ai-executor, ai-config)
[ ] Create lib/flows/ directory (flow-definitions, flow-auto-fill, flow-validation)
[ ] Create lib/tenant/ directory (tenant-config, tenant-middleware, tenant-branding)
[ ] Create types/ai-types.ts, types/flow-types.ts, types/tenant-types.ts
[ ] Create docker/ directory (Dockerfile, docker-compose.yml)
[ ] Add new dependencies to package.json (zustand, ai, @tanstack/react-table, etc.)
[ ] Rebuild Sales Order module as V4 Golden Template
[ ] Complete semi-complete modules (Stock Entry, Material Request)
[ ] Build documented-only modules (Delivery Note, Accounting suite)
[ ] Build new modules (RFQ, Supplier Quotation, Product Bundle, Quality Inspection)
[ ] Implement Command Palette (Cmd+K)
[ ] Implement Flow Tracker component
[ ] Implement SmartForm Wizard engine
[ ] Implement AI Copilot panel
[ ] Implement KPI dashboards for all modules
[ ] Implement notification rules
[ ] Implement approval workflows
[ ] Test all flows end-to-end
[ ] Verify dark mode on all new components
[ ] Verify mobile responsiveness (375px)
```

### 10.2 Files to Preserve (Do Not Modify)

```
✅ lib/api-factory.ts          — Factory patterns work perfectly
✅ lib/frappe-client.ts         — SDK wrapper is stable
✅ lib/query-keys.ts            — Cache key factory is correct
✅ lib/schemas/                 — Zod schemas are generated
✅ hooks/generic/               — Generic hooks are production-tested
✅ components/ui/               — Primitive components are stable
✅ components/form/             — Form components are stable
✅ components/smart/            — Smart components are stable (enhance, don't replace)
✅ scripts/generate-types.js   — Type generation script works
✅ types/doctype-types.ts      — Generated types (regenerate when needed)
```

---

## Summary

Part 3 completes the business workflow documentation:

1. ✅ **Auto-Fill Registry** — Every mapping between every document pair in the system
2. ✅ **Status State Machines** — Every status transition for every transactional DocType
3. ✅ **Notification Rules** — 7 notification types with triggers, recipients, templates
4. ✅ **Flow Tracker Config** — 8-stage lead-to-cash flow with resolution algorithm
5. ✅ **Approval Workflows** — PO approval with configurable thresholds
6. ✅ **Scheduled Tasks** — Cron jobs for overdue checks, low stock, auto-repeat, backups
7. ✅ **Cross-Module Validations** — Stock checks, credit limits, balance checks
8. ✅ **KPI Calculations** — Every dashboard metric formula
9. ✅ **Default Values** — Every auto-set field in the system
10. ✅ **Migration Checklist** — Complete V3→V4 migration guide

---

*Obsidian ERP v4.0 Business Workflow — Part 3 of 3*  
*© 2026 VersaLabs Studio. All rights reserved.*
