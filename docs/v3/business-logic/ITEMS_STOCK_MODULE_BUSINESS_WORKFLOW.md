# Pana ERP v3.0 - Items & Stock Module Business Logic

> **Version:** 1.0.0  
> **Created:** 2026-01-27  
> **Module:** Stock (Items, Warehouses, Inventory)  
> **Status:** Production Ready

---

## Executive Summary

The Items & Stock Module is the **foundation of inventory management** in Pana ERP. It defines:

- **What you sell** (Finished Goods, Services)
- **What you consume** (Raw Materials)
- **Where you store things** (Warehouses)

**For a Printing Company:**

- Items include: Paper (raw material), Ink (raw material), Business Cards (finished good), Design Service (service item)
- Warehouses include: Raw Material Store, WIP (Work in Progress), Finished Goods

---

## 1. Entity Map & Dependencies

| **Entity (DocType)** | **Role**        | **Dependency**  | **Printing Context**                    |
| -------------------- | --------------- | --------------- | --------------------------------------- |
| **Item**             | Master Record   | Item Group, UOM | Paper, Ink, Printed Flyers              |
| **Item Group**       | Classification  | Tree Structure  | Raw Materials, Finished Goods, Services |
| **UOM**              | Unit of Measure | Independent     | Nos, Ream, Carton, Sheet                |
| **Warehouse**        | Location        | Tree Structure  | Raw Material Store, WIP, Finished Goods |
| **Stock UOM**        | Default UOM     | Linked to Item  | Each item has a default unit            |

---

## 2. Item Types for Printing Business

### 2.1 The Three Item Types

| Type              | `is_stock_item` | `is_sales_item` | `is_purchase_item` | Example                           |
| ----------------- | --------------- | --------------- | ------------------ | --------------------------------- |
| **Raw Material**  | ✅ 1            | ❌ 0            | ✅ 1               | A4 Paper, Cyan Ink                |
| **Finished Good** | ✅ 1            | ✅ 1            | ❌ 0               | 500 Business Cards, Custom Flyers |
| **Service Item**  | ❌ 0            | ✅ 1            | ❌ 0               | Design Fee, Rush Processing Fee   |

### 2.2 Why Item Types Matter

```
                    ┌─────────────────┐
                    │   RAW MATERIAL  │
                    │   (is_stock=1)  │
                    │   (is_purch=1)  │
                    └────────┬────────┘
                             │
                             ▼ Consumed in Manufacturing
                    ┌─────────────────┐
                    │  FINISHED GOOD  │
                    │   (is_stock=1)  │
                    │   (is_sales=1)  │
                    └────────┬────────┘
                             │
                             ▼ Sold to Customer
                    ┌─────────────────┐
                    │ SERVICE ITEM    │
                    │   (is_stock=0)  │ ← No stock tracking
                    │   (is_sales=1)  │
                    └─────────────────┘
```

### 2.3 Printing Industry Item Examples

**Raw Materials:**
| Item Code | Item Name | UOM | Description |
|-----------|-----------|-----|-------------|
| RM-PAPER-A4 | A4 Paper 80gsm | Ream | 500 sheets/ream |
| RM-PAPER-A3 | A3 Paper 120gsm | Ream | 250 sheets/ream |
| RM-INK-C | Cyan Ink Cartridge | Nos | For HP Indigo |
| RM-INK-M | Magenta Ink Cartridge | Nos | For HP Indigo |
| RM-LAMINATE | Lamination Roll | Meter | Glossy 125mic |

**Finished Goods:**
| Item Code | Item Name | UOM | Description |
|-----------|-----------|-----|-------------|
| FG-BCARD-STD | Business Cards Standard | Nos | 300gsm, 9x5cm |
| FG-FLYER-A5 | Flyer A5 Full Color | Nos | 150gsm glossy |
| FG-BANNER-LG | Large Format Banner | Sqm | 320gsm vinyl |

**Service Items:**
| Item Code | Item Name | UOM | Description |
|-----------|-----------|-----|-------------|
| SVC-DESIGN | Design Service | Hour | Per hour rate |
| SVC-RUSH | Rush Processing | Nos | Next-day surcharge |
| SVC-DELIVERY | Delivery Fee | Nos | Local delivery |

---

## 3. Item Module

### 3.1 Item Form Fields

#### Basic Information

| Field         | Type | Required | Description                        |
| ------------- | ---- | -------- | ---------------------------------- |
| `item_code`   | Data | ✅       | Unique identifier (auto or manual) |
| `item_name`   | Data | ❌       | Display name                       |
| `item_group`  | Link | ✅       | Category (Raw Materials, etc.)     |
| `stock_uom`   | Link | ✅       | Default unit of measure            |
| `description` | Text | ❌       | Detailed description               |

#### Stock Settings

| Field               | Type  | Required | Description              |
| ------------------- | ----- | -------- | ------------------------ |
| `is_stock_item`     | Check | ✅       | Track inventory?         |
| `has_batch_no`      | Check | ❌       | Track batches?           |
| `has_serial_no`     | Check | ❌       | Track serial numbers?    |
| `default_warehouse` | Link  | ❌       | Default storage location |

#### Sales Settings

| Field           | Type     | Required | Description           |
| --------------- | -------- | -------- | --------------------- |
| `is_sales_item` | Check    | ✅       | Can be sold?          |
| `standard_rate` | Currency | ❌       | Default selling price |

#### Purchase Settings

| Field                | Type     | Required | Description            |
| -------------------- | -------- | -------- | ---------------------- |
| `is_purchase_item`   | Check    | ✅       | Can be purchased?      |
| `last_purchase_rate` | Currency | Auto     | Last purchase price    |
| `min_order_qty`      | Float    | ❌       | Minimum order quantity |

#### Inventory Settings

| Field              | Type   | Required | Description                  |
| ------------------ | ------ | -------- | ---------------------------- |
| `safety_stock`     | Float  | ❌       | Minimum stock alert level    |
| `lead_time_days`   | Int    | ❌       | Days to receive when ordered |
| `valuation_method` | Select | ❌       | FIFO, Moving Average         |

### 3.2 Item Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ITEM LIFECYCLE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────────┐                                                  │
│   │   CREATE ITEM    │                                                  │
│   │  (is_stock = 1)  │                                                  │
│   └────────┬─────────┘                                                  │
│            │                                                            │
│            ▼                                                            │
│   ┌──────────────────┐     ┌──────────────────┐                        │
│   │  PURCHASE ORDER  │────►│ PURCHASE RECEIPT │                        │
│   │  (Order from     │     │ (Receive goods,  │                        │
│   │   Supplier)      │     │  stock increases)│                        │
│   └──────────────────┘     └────────┬─────────┘                        │
│                                     │                                   │
│                                     ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                        WAREHOUSE                                 │  │
│   │                     (Stock Balance)                              │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                     │                                   │
│            ┌────────────────────────┼────────────────────────┐         │
│            ▼                        ▼                        ▼         │
│   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐│
│   │  STOCK ENTRY     │    │  STOCK ENTRY     │    │  DELIVERY NOTE   ││
│   │  (Transfer)      │    │  (Manufacture)   │    │  (Ship to Cust)  ││
│   │  Move between    │    │  Consume raw,    │    │  Stock decreases ││
│   │  warehouses      │    │  produce finished│    │                  ││
│   └──────────────────┘    └──────────────────┘    └──────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 UI Implementation

#### List Page (`app/stock/item/page.tsx`)

- Card/table view with item image (if available)
- Quick filters: By Item Group, By Type (Stock/Service)
- Search by code, name, description
- Stock indicator (Low/Normal/High)
- Actions: View, Edit, Delete, View Stock Balance

#### Detail Page (`app/stock/item/[name]/page.tsx`)

- All item information organized in sections
- **Stock Balance Card:** Current qty per warehouse
- **Transaction History:** Recent Stock Entries affecting this item
- **BOM Usage:** Which BOMs use this item (if raw material)

#### Create/Edit Page

- Multi-section form:
  1. Basic Info
  2. Stock Settings (toggle visibility based on is_stock_item)
  3. Sales Settings (toggle based on is_sales_item)
  4. Purchase Settings (toggle based on is_purchase_item)

### 3.4 Item Defaults

When creating a new Raw Material:

```typescript
const defaultValues = {
  is_stock_item: 1,
  is_sales_item: 0,
  is_purchase_item: 1,
  item_group: "Raw Materials",
  stock_uom: "Nos",
};
```

When creating a Finished Good:

```typescript
const defaultValues = {
  is_stock_item: 1,
  is_sales_item: 1,
  is_purchase_item: 0,
  item_group: "Finished Goods",
  stock_uom: "Nos",
};
```

When creating a Service:

```typescript
const defaultValues = {
  is_stock_item: 0,
  is_sales_item: 1,
  is_purchase_item: 0,
  item_group: "Services",
  stock_uom: "Nos",
};
```

---

## 4. Item Group Module

### 4.1 Business Logic

**Purpose:** Hierarchical classification of items for organization, reporting, and default settings.

**Tree Structure:**

```
All Item Groups
├── Raw Materials
│   ├── Paper
│   ├── Ink
│   └── Finishing Materials
├── Finished Goods
│   ├── Business Stationery
│   ├── Marketing Materials
│   └── Signage
├── Services
│   ├── Design Services
│   └── Value Added Services
└── Consumables
    ├── Office Supplies
    └── Equipment Parts
```

### 4.2 Item Group Form Fields

| Field                     | Type  | Required | Description                          |
| ------------------------- | ----- | -------- | ------------------------------------ |
| `item_group_name`         | Data  | ✅       | Group name                           |
| `parent_item_group`       | Link  | ❌       | Parent group                         |
| `is_group`                | Check | ❌       | Has children?                        |
| `default_warehouse`       | Link  | ❌       | Default warehouse for items in group |
| `default_expense_account` | Link  | ❌       | Default accounting                   |
| `default_income_account`  | Link  | ❌       | Default accounting                   |

### 4.3 Item Group Benefits

1. **Organization:** Easy browsing of 1000+ items
2. **Reporting:** "Sales by Item Group" report
3. **Defaults:** Set warehouse/accounts at group level
4. **Access Control:** Restrict certain groups to certain roles

---

## 5. Warehouse Module

### 5.1 Business Logic

**Purpose:** Define physical and logical storage locations.

**Warehouse Types for Printing:**
| Warehouse | Purpose | Example Contents |
|-----------|---------|------------------|
| **Raw Material Store** | Store purchased materials | Paper reams, ink cartridges |
| **WIP (Work in Progress)** | Items being manufactured | Partially printed sheets |
| **Finished Goods** | Ready to deliver | Completed print jobs |
| **Scrap/Waste** | Damaged/waste materials | Misprints, paper offcuts |
| **Transit** | Goods being delivered | Out for delivery |

### 5.2 Warehouse Tree Structure

```
All Warehouses
├── Pana Main Warehouse
│   ├── Raw Material Store
│   ├── WIP - Production
│   ├── Finished Goods
│   └── Scrap
├── Branch 1
│   ├── Raw Material Store
│   └── Finished Goods
└── Transit
    └── Delivery Van 1
```

### 5.3 Warehouse Form Fields

| Field              | Type   | Required | Description              |
| ------------------ | ------ | -------- | ------------------------ |
| `warehouse_name`   | Data   | ✅       | Warehouse name           |
| `parent_warehouse` | Link   | ❌       | Parent in tree           |
| `is_group`         | Check  | ❌       | Has child warehouses?    |
| `company`          | Link   | ✅       | Owning company           |
| `warehouse_type`   | Select | ❌       | Raw Material/Transit/etc |
| `address`          | Link   | ❌       | Physical location        |
| `disabled`         | Check  | ❌       | Archive warehouse        |

### 5.4 Stock Balance Query

Stock balance per warehouse is not stored in Warehouse - it's calculated from Stock Ledger Entry:

```sql
-- Query executed by ERPNext
SELECT
  warehouse,
  item_code,
  SUM(actual_qty) as qty_after_transaction
FROM `tabStock Ledger Entry`
WHERE item_code = 'ITEM-001'
GROUP BY warehouse
```

### 5.5 UI Implementation

#### List Page (`app/stock/warehouse/page.tsx`)

- Tree view showing hierarchy
- Or flat list with parent indicator
- Show: warehouse name, type, parent, company
- Actions: View, Edit, Delete (if no stock)

#### Detail Page (`app/stock/warehouse/[name]/page.tsx`)

- Warehouse information
- **Stock Summary:** All items currently in this warehouse with quantities
- **Recent Transactions:** Stock Entries affecting this warehouse

---

## 6. Unit of Measure (UOM) Module

### 6.1 Business Logic

**Purpose:** Define measurement units.

**Standard UOMs for Printing:**
| UOM | Description | Use Case |
|-----|-------------|----------|
| **Nos** | Numbers/Pieces | Individual items |
| **Ream** | 500 sheets | Paper |
| **Box** | Packaging unit | Ink cartridges |
| **Meter** | Length | Vinyl, fabric |
| **Sqm** | Square metre | Banners, signage |
| **Sheet** | Single sheet | Special papers |
| **Kg** | Kilogram | Paper weight |

### 6.2 UOM Conversion

For items sold in pieces but purchased in reams:

```
1 Ream = 500 Nos (sheets)
```

**ERPNext handles conversions via:**

- `UOM Conversion Factor` child table on Item
- Stock always tracked in Stock UOM
- Can sell/purchase in different UOM

### 6.3 UOM Form Fields

| Field                  | Type  | Required | Description         |
| ---------------------- | ----- | -------- | ------------------- |
| `uom_name`             | Data  | ✅       | Unit name           |
| `must_be_whole_number` | Check | ❌       | No decimals allowed |

---

## 7. Stock Entry (Overview)

### 7.1 Stock Entry Types

| Type                      | Purpose                       | Source Warehouse   | Target Warehouse    |
| ------------------------- | ----------------------------- | ------------------ | ------------------- |
| **Material Receipt**      | Receive goods                 | -                  | ✅                  |
| **Material Issue**        | Consume/write-off             | ✅                 | -                   |
| **Material Transfer**     | Move between warehouses       | ✅                 | ✅                  |
| **Manufacture**           | Consume raw, produce finished | ✅ (Raw Materials) | ✅ (Finished Goods) |
| **Repack**                | Repackage items               | ✅                 | ✅                  |
| **Send to Subcontractor** | Out for processing            | ✅                 | ✅ (Subcontractor)  |

### 7.2 Manufacturing Stock Entry (Key for Printing)

**Scenario:** Produce 1000 Business Cards

**BOM (Bill of Materials):**

- Input: 10 sheets A4 Card 300gsm
- Input: 0.01 units Cyan Ink
- Output: 1000 Business Cards

**Stock Entry of type "Manufacture":**

```
Items:
┌───────────────────┬──────────┬─────────────────────┬─────────────────────┐
│ Item              │ Qty      │ Source Warehouse    │ Target Warehouse    │
├───────────────────┼──────────┼─────────────────────┼─────────────────────┤
│ A4 Card 300gsm    │ -10      │ Raw Material Store  │ -                   │
│ Cyan Ink          │ -0.01    │ Raw Material Store  │ -                   │
│ Business Cards    │ +1000    │ -                   │ Finished Goods      │
└───────────────────┴──────────┴─────────────────────┴─────────────────────┘
```

**Result:**

- Raw Material Store loses: 10 sheets, 0.01 ink units
- Finished Goods gains: 1000 business cards

---

## 8. Integration Points

### 8.1 Items Used In:

| Module            | DocType          | How Items Are Used     |
| ----------------- | ---------------- | ---------------------- |
| **Sales**         | Quotation        | Line items for pricing |
| **Sales**         | Sales Order      | Ordered items          |
| **Purchasing**    | Purchase Order   | Items to buy           |
| **Manufacturing** | BOM              | Recipe inputs/outputs  |
| **Manufacturing** | Work Order       | Production item        |
| **Stock**         | Stock Entry      | Inventory movements    |
| **Stock**         | Delivery Note    | Items to deliver       |
| **Accounting**    | Sales Invoice    | Billed items           |
| **Accounting**    | Purchase Invoice | Received items         |

### 8.2 Warehouse Used In:

| Module         | DocType          | How Warehouses Are Used |
| -------------- | ---------------- | ----------------------- |
| **Stock**      | Stock Entry      | Source/Target warehouse |
| **Stock**      | Delivery Note    | Items shipped from      |
| **Stock**      | Material Request | Items requested to      |
| **Purchasing** | Purchase Order   | Delivery warehouse      |

---

## 9. File Structure

```
app/stock/
├── item/
│   ├── page.tsx                      # Item List
│   ├── new/page.tsx                  # Create Item
│   └── [name]/
│       ├── page.tsx                  # Item Detail
│       └── edit/page.tsx             # Edit Item
├── warehouse/
│   ├── page.tsx                      # Warehouse List/Tree
│   ├── new/page.tsx                  # Create Warehouse
│   └── [name]/
│       ├── page.tsx                  # Warehouse Detail
│       └── edit/page.tsx             # Edit Warehouse
├── stock-entry/
│   ├── page.tsx                      # Stock Entry List
│   ├── new/page.tsx                  # Create Stock Entry
│   └── [name]/
│       └── page.tsx                  # Stock Entry Detail
├── material-request/
│   ├── page.tsx                      # Material Request List
│   ├── new/page.tsx                  # Create MR
│   └── [name]/
│       └── page.tsx                  # MR Detail
├── delivery-note/
│   ├── page.tsx                      # Delivery Note List
│   ├── new/page.tsx                  # Create DN
│   └── [name]/
│       └── page.tsx                  # DN Detail
├── settings/
│   └── page.tsx                      # Stock Settings Hub
└── setup/
    ├── driver/                       # Delivery drivers
    └── vehicle/                      # Delivery vehicles
```

---

## 10. API Routes

```
app/api/stock/
├── item/
│   ├── route.ts                      # GET (list), POST (create)
│   └── [name]/route.ts               # GET, PUT, DELETE
├── item-group/
│   ├── route.ts
│   └── [name]/route.ts
├── warehouse/
│   ├── route.ts
│   └── [name]/route.ts
├── uom/
│   ├── route.ts
│   └── [name]/route.ts
├── stock-entry/
│   ├── route.ts
│   └── [name]/route.ts
├── material-request/
│   ├── route.ts
│   └── [name]/route.ts
└── delivery-note/
    ├── route.ts
    └── [name]/route.ts
```

---

## 11. Testing Checklist

### Item Module

- [ ] Create Raw Material item (is_stock_item=1, is_purchase_item=1)
- [ ] Create Finished Good item (is_stock_item=1, is_sales_item=1)
- [ ] Create Service item (is_stock_item=0, is_sales_item=1)
- [ ] Assign item to Item Group
- [ ] Set default warehouse
- [ ] Edit item details
- [ ] Delete item (verify blocked if has transactions)
- [ ] Search items by code and name
- [ ] Filter items by group

### Item Group Module

- [ ] Create parent Item Group
- [ ] Create child Item Group
- [ ] Verify tree structure displays correctly
- [ ] Delete empty Item Group
- [ ] Verify cannot delete group with items

### Warehouse Module

- [ ] Create parent Warehouse
- [ ] Create child Warehouse (e.g., WIP under Main)
- [ ] Verify tree structure
- [ ] View stock balance in warehouse
- [ ] Delete empty warehouse

### Stock Entry

- [ ] Create Material Receipt (add stock)
- [ ] Create Material Issue (remove stock)
- [ ] Create Material Transfer (move stock)
- [ ] Create Manufacture (consume raw, produce finished)
- [ ] Verify stock balances update correctly

---

_This document serves as the authoritative business logic reference for the Items & Stock module in Pana ERP v3.0._
