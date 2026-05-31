# Pana ERP v3.0 - CRM Module Business Logic

> **Version:** 1.0.0  
> **Created:** 2026-01-27  
> **Module:** CRM (Customer Relationship Management)  
> **Status:** Production Ready

---

## Executive Summary

The CRM Module is the **foundation** of Pana ERP. It implements the "Front Office" workflow - capturing inquiries from potential customers and converting them into financial entities that can receive invoices.

**Business Context:** In a printing company, many people call with questions ("How much for 500 flyers?") but never commit. We don't want to clutter our accounting books with these names. The Lead → Customer conversion ensures only serious buyers enter the financial system.

---

## 1. Entity Map & Dependencies

| **Entity (DocType)** | **Role**               | **Dependency**        | **Standard ERPNext Behavior**                              |
| -------------------- | ---------------------- | --------------------- | ---------------------------------------------------------- |
| **Lead**             | The "Suspect"          | Independent           | Represents an inquiry. Has no financial/accounting weight. |
| **Customer**         | The "Payer"            | Optional from Lead    | The financial entity. Required for Sales Orders.           |
| **Address**          | Physical Location      | Dependent on Customer | Stored separately. Linked via "Dynamic Link".              |
| **Contact**          | Human Point of Contact | Dependent on Customer | Stored separately. Linked via "Dynamic Link".              |

### Settings DocTypes

| **DocType**        | **Purpose**                              | **Path**                           |
| ------------------ | ---------------------------------------- | ---------------------------------- |
| **Customer Group** | Classify customers for pricing/reporting | `app/crm/settings/customer-group/` |
| **Territory**      | Geographic classification                | `app/crm/settings/territory/`      |
| **Lead Source**    | Marketing attribution                    | `app/crm/settings/lead-source/`    |
| **Industry Type**  | Business sector classification           | `app/crm/settings/industry-type/`  |

---

## 2. Lead Module

### 2.1 Business Logic

**Purpose:** Capture inquiries without committing them to the accounting system.

**The Problem Solved:** A receptionist receives 50 calls a day. Only 10 become actual orders. Without a Lead system, you'd have 50 "Customer" records polluting your customer list.

**The Solution:** Record inquiries as "Leads" first. Only promote to "Customer" when they commit.

### 2.2 Lead Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LEAD LIFECYCLE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────┐    Called     ┌──────────┐    Quote    ┌────────────┐   │
│   │   OPEN   │ ────────────► │ REPLIED  │ ──────────► │ INTERESTED │   │
│   │  (New)   │               │(Responded)│             │(Wants Quote)│  │
│   └────┬─────┘               └────┬─────┘             └──────┬─────┘   │
│        │                          │                          │         │
│        │ No response              │ Not interested           │ Accepts │
│        ▼                          ▼                          ▼         │
│   ┌──────────┐              ┌──────────┐              ┌──────────┐    │
│   │ DO NOT   │              │   LOST   │              │ CONVERTED│    │
│   │ CONTACT  │              │          │              │→ Customer│    │
│   └──────────┘              └──────────┘              └──────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Lead Form Fields

| Field          | Type   | Required | Description                                                |
| -------------- | ------ | -------- | ---------------------------------------------------------- |
| `lead_name`    | Data   | ✅       | Person's name                                              |
| `company_name` | Data   | ❌       | Their company (if applicable)                              |
| `email_id`     | Data   | ❌       | Email address                                              |
| `mobile_no`    | Data   | ❌       | Phone number                                               |
| `source`       | Link   | ❌       | How they found us (Lead Source)                            |
| `status`       | Select | ✅       | Open, Replied, Interested, Converted, Lost, Do Not Contact |
| `notes`        | Text   | ❌       | Details of their inquiry                                   |

### 2.4 Lead Status Definitions

| Status             | Meaning                         | Next Action          |
| ------------------ | ------------------------------- | -------------------- |
| **Open**           | New inquiry, not yet contacted  | Respond to inquiry   |
| **Replied**        | We've responded with info/price | Wait for feedback    |
| **Interested**     | They want a formal quotation    | Create Quotation     |
| **Converted**      | Became a Customer               | View Customer record |
| **Lost**           | Did not proceed                 | Record lost reason   |
| **Do Not Contact** | Spam or unqualified             | Skip                 |

### 2.5 UI Implementation

#### List Page (`app/crm/lead/page.tsx`)

- Card-based layout with status badges
- Quick filters: All, Open, Replied, Interested
- Search by name, company, phone
- Actions: View, Edit, Delete, Convert to Customer

#### Detail Page (`app/crm/lead/[name]/page.tsx`)

- Display all lead information
- **"Convert to Customer" Button:** Only visible if status is Open/Replied/Interested
- Activity timeline (if implemented)

#### Create/Edit Page

- Standard form with all lead fields
- Auto-default status to "Open" on create

### 2.6 Lead → Customer Conversion

**Trigger:** User clicks "Convert to Customer" on Lead detail page.

**Data Mapping:**

```typescript
// Lead fields → Customer fields
company_name → customer_name  // Required
lead_name → Contact → first_name
mobile_no → Contact → mobile_no
email_id → Contact → email_id
// Create Address if any address info exists
```

**UI Flow:**

1. Click "Convert to Customer"
2. Navigate to Customer Create page with pre-filled data
3. User reviews and saves
4. Lead status automatically updates to "Converted"

---

## 3. Customer Module

### 3.1 Business Logic

**Purpose:** The Customer is the **financial anchor**. Every Sale, Invoice, and Payment links to a Customer.

**The Customer "Hub" Concept:** Unlike the Lead (which is just a form), the Customer detail page acts as a **dashboard** showing:

- Basic customer info
- Linked Addresses (Billing, Shipping)
- Linked Contacts (People at the company)
- Transaction history (Quotations, Orders, Invoices)

### 3.2 Customer Form Fields

| Field              | Type   | Required | Description            |
| ------------------ | ------ | -------- | ---------------------- |
| `customer_name`    | Data   | ✅       | Official name          |
| `customer_type`    | Select | ✅       | Company or Individual  |
| `customer_group`   | Link   | ✅       | Pricing/classification |
| `territory`        | Link   | ❌       | Geographic region      |
| `tax_id`           | Data   | ❌       | TIN (Tax ID Number)    |
| `default_currency` | Link   | ❌       | ETB, USD, etc.         |
| `disabled`         | Check  | ❌       | Archive customer       |

### 3.3 The Dynamic Link Challenge

**The Problem:** In standard ERPNext, addresses are NOT stored inside the Customer table. They are separate records that "point back" to the Customer.

**How Dynamic Link Works:**

```
Address Table
├── name: "ADDR-001"
├── address_line1: "123 Main St"
├── city: "Addis Ababa"
└── links (child table)
    ├── link_doctype: "Customer"
    └── link_name: "CUST-00001"
```

**Querying Addresses for a Customer:**

```typescript
// Use Dynamic Link server-side filtering
const filters = [
  ["Dynamic Link", "link_doctype", "=", "Customer"],
  ["Dynamic Link", "link_name", "=", customerName],
];
```

### 3.4 Customer Detail Page Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER DETAIL PAGE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ HEADER                                                               ││
│  │ [Customer Name]                  [Edit] [Create Quotation] [More ▼] ││
│  │ Type: Company | Group: Retail | Territory: Addis Ababa              ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐│
│  │ TAB 1: OVERVIEW                │  │ TAB 2: ADDRESSES & CONTACTS    ││
│  │                                │  │                                ││
│  │ • Customer Name                │  │ ADDRESSES                      ││
│  │ • Type                         │  │ [+ Add Address]                ││
│  │ • Group                        │  │ ┌─────────────────────────────┐││
│  │ • Territory                    │  │ │ Billing: 123 Main St        │││
│  │ • Tax ID                       │  │ │ Addis Ababa                 │││
│  │ • Currency                     │  │ └─────────────────────────────┘││
│  │                                │  │                                ││
│  └────────────────────────────────┘  │ CONTACTS                       ││
│                                      │ [+ Add Contact]                ││
│  ┌────────────────────────────────┐  │ ┌─────────────────────────────┐││
│  │ TAB 3: TRANSACTIONS            │  │ │ John Doe - 0911234567       │││
│  │                                │  │ │ john@example.com            │││
│  │ Recent Quotations              │  │ └─────────────────────────────┘││
│  │ Recent Sales Orders            │  └────────────────────────────────┘│
│  │ Recent Invoices                │                                    │
│  └────────────────────────────────┘                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Key Actions

| Action               | Trigger | Behavior                                           |
| -------------------- | ------- | -------------------------------------------------- |
| **Edit**             | Button  | Navigate to edit form                              |
| **Add Address**      | Button  | Navigate to `/crm/address/new?customer={name}`     |
| **Add Contact**      | Button  | Navigate to `/crm/contact/new?customer={name}`     |
| **Create Quotation** | Button  | Navigate to `/sales/quotation/new?customer={name}` |
| **Delete**           | Menu    | Only if no linked transactions                     |

---

## 4. Address Module

### 4.1 Business Logic

**Purpose:** Store physical locations (Billing Address, Shipping Address).

**The Link Pattern:** When creating an Address for a Customer, we must:

1. Create the Address record
2. In the `links` child table, add a row with `link_doctype=Customer` and `link_name={customer_name}`

### 4.2 Address Form Fields

| Field           | Type   | Required | Description                        |
| --------------- | ------ | -------- | ---------------------------------- |
| `address_title` | Data   | ✅       | Display name (e.g., "Head Office") |
| `address_type`  | Select | ✅       | Billing, Shipping, Warehouse, etc. |
| `address_line1` | Data   | ✅       | Street address                     |
| `address_line2` | Data   | ❌       | Additional line                    |
| `city`          | Data   | ✅       | City                               |
| `state`         | Data   | ❌       | State/Region                       |
| `country`       | Link   | ✅       | Country                            |
| `pincode`       | Data   | ❌       | Postal code                        |
| `phone`         | Data   | ❌       | Address phone                      |
| `email_id`      | Data   | ❌       | Address email                      |

### 4.3 Hidden Link Fields

When creating an Address from Customer context:

```typescript
// URL: /crm/address/new?customer=CUST-00001

// Form hidden fields (populated from URL param):
links: [
  {
    link_doctype: "Customer",
    link_name: "CUST-00001",
  },
];
```

### 4.4 Address Types

| Type          | Use Case                 |
| ------------- | ------------------------ |
| **Billing**   | Appears on invoices      |
| **Shipping**  | Delivery destination     |
| **Office**    | General business address |
| **Warehouse** | Storage location         |

---

## 5. Contact Module

### 5.1 Business Logic

**Purpose:** Store information about people at customer companies.

**Use Case:** A Customer is "Pana Promotion Ltd", but you interact with "John Doe" (Sales Manager) and "Jane Smith" (Accounts Payable). Contacts store these individuals.

### 5.2 Contact Form Fields

| Field                | Type  | Required | Description               |
| -------------------- | ----- | -------- | ------------------------- |
| `first_name`         | Data  | ✅       | First name                |
| `last_name`          | Data  | ❌       | Last name                 |
| `email_id`           | Data  | ❌       | Email                     |
| `phone`              | Data  | ❌       | Phone number              |
| `mobile_no`          | Data  | ❌       | Mobile number             |
| `designation`        | Data  | ❌       | Job title                 |
| `is_primary_contact` | Check | ❌       | Main contact for customer |
| `is_billing_contact` | Check | ❌       | Receives invoices         |

### 5.3 Link Pattern

Same as Address - uses Dynamic Link child table to associate with Customer.

---

## 6. Settings Modules

### 6.1 Customer Group

**Purpose:** Classify customers for pricing and reporting.

**Examples:**

- Walk-in (Standard retail price)
- Wholesale (Discounted bulk price)
- Design Agency (Partner pricing)
- Government (Special terms)

**Fields:**
| Field | Type | Required |
|-------|------|----------|
| `customer_group_name` | Data | ✅ |
| `parent_customer_group` | Link | ❌ (defaults to "All Customer Groups") |
| `default_price_list` | Link | ❌ |

### 6.2 Territory

**Purpose:** Geographic classification for sales reporting.

**Examples:**

- Addis Ababa
- Bole
- Regional
- Export

**Fields:**
| Field | Type | Required |
|-------|------|----------|
| `territory_name` | Data | ✅ |
| `parent_territory` | Link | ❌ (defaults to "All Territories") |

### 6.3 Lead Source

**Purpose:** Track where leads come from (marketing attribution).

**Examples:**

- Walk-in
- Phone Call
- Website
- Referral
- Instagram
- Facebook

**Fields:**
| Field | Type | Required |
|-------|------|----------|
| `source_name` | Data | ✅ |

### 6.4 Industry Type

**Purpose:** Classify customers by business sector.

**Examples:**

- Retail
- Manufacturing
- Healthcare
- Education
- Government

**Fields:**
| Field | Type | Required |
|-------|------|----------|
| `industry_type` | Data | ✅ |

---

## 7. File Structure

```
app/crm/
├── page.tsx                          # CRM Dashboard/Hub
├── lead/
│   ├── page.tsx                      # Lead List
│   ├── new/page.tsx                  # Create Lead
│   └── [name]/
│       ├── page.tsx                  # Lead Detail
│       └── edit/page.tsx             # Edit Lead
├── customer/
│   ├── page.tsx                      # Customer List
│   ├── new/page.tsx                  # Create Customer
│   └── [name]/
│       ├── page.tsx                  # Customer Detail (Hub)
│       └── edit/page.tsx             # Edit Customer
├── address/
│   ├── page.tsx                      # Address List (utility)
│   ├── new/page.tsx                  # Create Address
│   └── [name]/
│       ├── page.tsx                  # Address Detail
│       └── edit/page.tsx             # Edit Address
├── contact/
│   ├── page.tsx                      # Contact List (utility)
│   ├── new/page.tsx                  # Create Contact
│   └── [name]/
│       ├── page.tsx                  # Contact Detail
│       └── edit/page.tsx             # Edit Contact
└── settings/
    ├── page.tsx                      # Settings Hub
    ├── customer-group/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [name]/edit/page.tsx
    ├── territory/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [name]/edit/page.tsx
    ├── lead-source/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [name]/edit/page.tsx
    └── industry-type/
        ├── page.tsx
        ├── new/page.tsx
        └── [name]/edit/page.tsx
```

---

## 8. API Routes

```
app/api/crm/
├── lead/
│   ├── route.ts                      # GET (list), POST (create)
│   └── [name]/route.ts               # GET, PUT, DELETE
├── customer/
│   ├── route.ts                      # GET (list), POST (create)
│   └── [name]/route.ts               # GET, PUT, DELETE
├── address/
│   ├── route.ts                      # GET (list with Dynamic Link filter), POST
│   └── [name]/route.ts               # GET, PUT, DELETE
├── contact/
│   ├── route.ts                      # GET (list with Dynamic Link filter), POST
│   └── [name]/route.ts               # GET, PUT, DELETE
└── settings/
    ├── customer-group/...
    ├── territory/...
    ├── lead-source/...
    └── industry-type/...
```

---

## 9. Testing Checklist

### Lead Module

- [ ] Create new Lead with all fields
- [ ] Edit existing Lead
- [ ] Change Lead status (Open → Replied → Interested)
- [ ] Convert Lead to Customer
- [ ] Verify Lead shows as "Converted" after conversion
- [ ] Delete Draft Lead
- [ ] Search/filter Leads by status

### Customer Module

- [ ] Create Customer directly
- [ ] Create Customer from Lead conversion
- [ ] Edit Customer details
- [ ] Add Address to Customer
- [ ] Add Contact to Customer
- [ ] View Customer Hub with linked Addresses/Contacts
- [ ] Create Quotation from Customer page
- [ ] Delete Customer (verify blocked if has transactions)

### Address/Contact Module

- [ ] Create Address with Customer link
- [ ] Address appears in Customer Hub
- [ ] Edit Address
- [ ] Delete Address
- [ ] Same tests for Contact

### Settings

- [ ] Create Customer Group
- [ ] Create Territory
- [ ] Create Lead Source
- [ ] Create Industry Type
- [ ] Use these in Lead/Customer forms (dropdowns work)

---

_This document serves as the authoritative business logic reference for the CRM module in Pana ERP v3.0._
