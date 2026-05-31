# Pana ERP v3.0 - End-to-End UI/UX Testing Guide

> **Version:** 1.0.0  
> **Created:** 2026-01-27  
> **Purpose:** Complete workflow testing from Lead to Payment  
> **Target Audience:** Developers, QA, Client Demo  
> **Estimated Time:** 2-3 hours for full walkthrough

---

## Overview

This document provides a step-by-step guide to test the complete Pana ERP v3.0 workflow, simulating a real printing job from initial customer inquiry to final payment collection.

**Scenario Used:** "Pana Promotion receives a phone call from a new client requesting 500 business cards. The job goes through quotation, approval, manufacturing, delivery, and invoicing."

---

## Pre-Test Checklist

Before starting the workflow test, ensure:

- [ ] Development server is running (`npm run dev`)
- [ ] ERPNext backend is accessible
- [ ] You can login to the dashboard
- [ ] The following master data exists:
  - At least 1 Company
  - At least 1 Customer Group
  - At least 1 Territory
  - At least 1 Item Group (Raw Materials, Finished Goods)
  - At least 1 Warehouse (Raw Materials, Finished Goods)

---

## Demo Data Setup (If Starting Fresh)

### Step 0.1: Create Required Settings

| Setting        | Path                           | Data to Create                                |
| -------------- | ------------------------------ | --------------------------------------------- |
| Customer Group | `/crm/settings/customer-group` | "Retail", "Wholesale"                         |
| Territory      | `/crm/settings/territory`      | "Addis Ababa"                                 |
| Lead Source    | `/crm/settings/lead-source`    | "Walk-in", "Phone", "Referral"                |
| Item Group     | (ERPNext setup or API)         | "Raw Materials", "Finished Goods", "Services" |

### Step 0.2: Create Raw Material Items

Navigate to `/stock/item/new`

**Item 1: A4 Card Stock**

```
item_code: RM-CARD-A4
item_name: A4 Card Stock 300gsm
item_group: Raw Materials
stock_uom: Sheet
is_stock_item: ✓ (checked)
is_purchase_item: ✓ (checked)
is_sales_item: ✗ (unchecked)
standard_rate: 5 (ETB per sheet)
```

**Item 2: Business Card Template**

```
item_code: FG-BCARD-STD
item_name: Standard Business Cards
item_group: Finished Goods
stock_uom: Nos
is_stock_item: ✓ (checked)
is_purchase_item: ✗ (unchecked)
is_sales_item: ✓ (checked)
standard_rate: 0.50 (ETB per card)
```

### Step 0.3: Create Warehouses

Navigate to `/stock/warehouse/new`

```
Warehouse 1: Raw Material Store
Warehouse 2: Finished Goods Store
Warehouse 3: WIP - Production
```

### Step 0.4: Create Initial Stock

Navigate to `/stock/stock-entry/new`

```
Stock Entry Type: Material Receipt
Items:
- Item: RM-CARD-A4
  Qty: 100
  Target Warehouse: Raw Material Store
```

---

## Test Scenario: Complete Print Job Lifecycle

### Phase 1: CRM - Lead Capture & Conversion

#### Test 1.1: Create Lead

**Navigation:** Dashboard → CRM → Leads → New Lead

**Action:**

1. Click "New Lead" button
2. Fill in the form:
   ```
   Lead Name: John Wondwosen
   Company Name: Alpha Trading PLC
   Mobile No: 0911234567
   Email: john@alphatrading.com
   Source: Phone
   Status: Open
   Notes: Interested in business cards for new office opening
   ```
3. Click "Create Lead"

**Expected Result:**

- [ ] Lead created successfully
- [ ] Toast notification appears
- [ ] Redirected to lead detail page
- [ ] Lead appears in list with "Open" status badge

#### Test 1.2: Update Lead Status

**Navigation:** CRM → Leads → Click on "John Wondwosen"

**Action:**

1. Click "Edit" button
2. Change Status to "Interested"
3. Save changes

**Expected Result:**

- [ ] Status badge updates to "Interested"
- [ ] Lead is now ready for conversion

#### Test 1.3: Convert Lead to Customer

**Navigation:** Lead detail page

**Action:**

1. Click "Convert to Customer" button
2. Review pre-filled customer form:
   ```
   Customer Name: Alpha Trading PLC (from company_name)
   Customer Type: Company
   Customer Group: Retail
   Territory: Addis Ababa
   ```
3. Click "Create Customer"

**Expected Result:**

- [ ] Customer created successfully
- [ ] Redirected to new Customer page
- [ ] Original Lead status changes to "Converted"

#### Test 1.4: Add Customer Address

**Navigation:** Customer detail page → Addresses & Contacts tab

**Action:**

1. Click "Add Address"
2. Fill in:
   ```
   Address Title: Head Office
   Address Type: Billing
   Address Line 1: Bole Road, Building 45
   City: Addis Ababa
   Country: Ethiopia
   Phone: 0911234567
   ```
3. Save address

**Expected Result:**

- [ ] Address created and linked to Customer
- [ ] Address appears in Customer's "Addresses" section
- [ ] Can be selected in Quotation later

#### Test 1.5: Add Customer Contact

**Navigation:** Customer detail page → Addresses & Contacts tab

**Action:**

1. Click "Add Contact"
2. Fill in:
   ```
   First Name: John
   Last Name: Wondwosen
   Email: john@alphatrading.com
   Mobile: 0911234567
   Designation: Procurement Manager
   Is Primary Contact: ✓
   ```
3. Save contact

**Expected Result:**

- [ ] Contact created and linked to Customer
- [ ] Contact appears in Customer's "Contacts" section

---

### Phase 2: Sales - Quotation & Order

#### Test 2.1: Create Quotation

**Navigation:** Sales → Quotations → New Quotation

**Action:**

1. Fill header:
   ```
   Quotation To: Customer
   Customer: Alpha Trading PLC
   Transaction Date: [today]
   Valid Till: [today + 15 days]
   Company: Pana Promotion
   ```
2. Verify address/contact auto-populate

3. Add line item:
   ```
   Item: FG-BCARD-STD
   Description: 500 Business Cards, 300gsm, Full Color, Matt Lamination
              Design: Client to provide artwork
              Size: 9x5cm standard
   Qty: 500
   Rate: 1.50 ETB
   ```
4. (Optional) Select Tax Template
5. (Optional) Select Terms and Conditions
6. Click "Create"

**Expected Result:**

- [ ] Quotation created with status "Draft"
- [ ] Line item amount calculated (500 × 1.50 = 750 ETB)
- [ ] Grand total displays correctly

#### Test 2.2: Submit Quotation

**Navigation:** Quotation detail page

**Action:**

1. Review all details
2. Click "Submit" button
3. Confirm submission

**Expected Result:**

- [ ] Status changes from "Draft" to "Open"
- [ ] "Submit" button becomes unavailable
- [ ] "Create Sales Order" button appears
- [ ] Document is now un-editable

#### Test 2.3: Create Sales Order from Quotation

**Navigation:** Quotation detail page

**Action:**

1. Click "Create Sales Order" button
2. Review pre-filled data from Quotation
3. Add required field:
   ```
   Delivery Date: [today + 7 days]
   ```
4. **Artwork Check:** Verify the "Artwork Verified" checkbox requirement
5. Check the artwork verification box
6. Click "Create Sales Order"

**Expected Result:**

- [ ] Sales Order created
- [ ] All quotation data copied correctly
- [ ] Delivery date is set
- [ ] Quotation status updates to "Ordered"

#### Test 2.4: Submit Sales Order

**Navigation:** Sales Order detail page

**Action:**

1. Verify all details correct
2. Ensure artwork checkbox is checked
3. Click "Submit"

**Expected Result:**

- [ ] Status changes to "To Deliver and Bill"
- [ ] Document locked for editing
- [ ] "Create Delivery Note" action available
- [ ] "Create Work Order" action available (if manufacturing)

---

### Phase 3: Manufacturing (If Applicable)

_Skip this phase if using pre-made stock items. Include if manufacturing is needed._

#### Test 3.1: Create BOM (Bill of Materials)

**Navigation:** Manufacturing → BOM → New BOM

**Action:**

1. Fill form:
   ```
   Item: FG-BCARD-STD
   Quantity: 100 (produces 100 cards)
   ```
2. Add raw materials:
   ```
   Item: RM-CARD-A4
   Qty: 2 (2 sheets make 100 cards)
   ```
3. Save and Submit BOM

**Expected Result:**

- [ ] BOM created showing cost calculation
- [ ] Raw material cost aggregated

#### Test 3.2: Create Work Order

**Navigation:** Manufacturing → Work Orders → New Work Order

OR from Sales Order: Click "Create Work Order"

**Action:**

1. Fill form:
   ```
   Item: FG-BCARD-STD
   BOM: [select the BOM created]
   Qty to Manufacture: 500
   Source Warehouse: Raw Material Store
   Target Warehouse: Finished Goods Store
   Sales Order: [link to SO if created from SO]
   ```
2. Submit Work Order

**Expected Result:**

- [ ] Work Order created
- [ ] Raw materials calculated (500 cards needs 10 sheets)
- [ ] Status: "Not Started"

#### Test 3.3: Execute Stock Entry (Manufacture)

**Navigation:** Work Order detail page → Create Stock Entry

OR: Stock → Stock Entry → New Stock Entry

**Action:**

1. Stock Entry Type: Manufacture
2. Link to Work Order
3. Verify items:

   ```
   Source Items (Consumed):
   - RM-CARD-A4, Qty: 10, From: Raw Material Store

   Target Item (Produced):
   - FG-BCARD-STD, Qty: 500, To: Finished Goods Store
   ```

4. Submit Stock Entry

**Expected Result:**

- [ ] Raw Material Store decreased by 10 sheets
- [ ] Finished Goods Store increased by 500 cards
- [ ] Work Order status updates to "Completed"

---

### Phase 4: Delivery

#### Test 4.1: Create Delivery Note

**Navigation:** Sales Order detail page → "Create Delivery Note"

OR: Stock → Delivery Notes → New

**Action:**

1. Pre-filled from Sales Order:
   ```
   Customer: Alpha Trading PLC
   Items from Sales Order auto-populated
   ```
2. Add delivery details (if logistics module active):
   ```
   Driver: [select driver]
   Vehicle: [select vehicle]
   ```
3. Verify items and quantities:
   ```
   Item: FG-BCARD-STD
   Qty: 500
   Warehouse: Finished Goods Store
   ```
4. Save as Draft first

**Expected Result:**

- [ ] Delivery Note created in Draft
- [ ] Items linked to Sales Order

#### Test 4.2: Print Gate Pass

**Navigation:** Delivery Note detail page

**Action:**

1. Click "Print Gate Pass" button
2. Review print preview (should NOT show amounts - just items and quantities)
3. Print or save PDF

**Expected Result:**

- [ ] Gate pass displays without prices
- [ ] Shows: Customer, Items, Quantities, Driver info
- [ ] Suitable for security checkpoint

#### Test 4.3: Submit Delivery Note

**Navigation:** Delivery Note detail page

**Action:**

1. Click "Submit" button
2. Confirm

**Expected Result:**

- [ ] Status changes to "To Bill"
- [ ] Stock in Finished Goods Store decreases by 500
- [ ] Sales Order status updates to "To Bill" (if fully delivered)
- [ ] "Create Invoice" action appears

---

### Phase 5: Accounting

#### Test 5.1: Create Sales Invoice

**Navigation:** Delivery Note page → "Create Invoice"

OR: Accounting → Sales Invoices → New

**Action:**

1. Pre-filled from Delivery Note:
   ```
   Customer: Alpha Trading PLC
   Items: FG-BCARD-STD × 500 @ 1.50 ETB
   ```
2. Verify totals match
3. Add due date:
   ```
   Due Date: [today + 30 days] (Net 30 terms)
   ```
4. Submit Invoice

**Expected Result:**

- [ ] Invoice created and submitted
- [ ] Status: "Unpaid" (or "Overdue" if past due)
- [ ] Grand Total: 750 ETB
- [ ] GL entries posted (Accounts Receivable debited)

#### Test 5.2: View Outstanding Invoices

**Navigation:** Accounting → Sales Invoices

**Action:**

1. Filter by "Unpaid"
2. Verify the Alpha Trading invoice appears

**Expected Result:**

- [ ] Invoice visible in list
- [ ] Outstanding amount shows correctly

#### Test 5.3: Create Payment Entry

**Navigation:** Accounting → Payment Entry → New

OR from Sales Invoice: "Create Payment"

**Action:**

1. Fill form:
   ```
   Payment Type: Receive
   Party Type: Customer
   Party: Alpha Trading PLC
   Paid Amount: 750 ETB
   Mode of Payment: Cash (or Bank)
   ```
2. Click "Get Outstanding Invoices"
3. Verify invoice auto-selected
4. Submit Payment

**Expected Result:**

- [ ] Payment Entry created
- [ ] Invoice status changes to "Paid"
- [ ] GL entries posted (Cash/Bank debited, AR credited)

#### Test 5.4: Verify Full Cycle Completion

**Navigation:** Various pages

**Checklist:**

- [ ] Lead status: "Converted"
- [ ] Customer exists with Address/Contact
- [ ] Quotation status: "Ordered"
- [ ] Sales Order status: "Completed"
- [ ] Work Order status: "Completed" (if applicable)
- [ ] Delivery Note status: "Completed"
- [ ] Sales Invoice status: "Paid"
- [ ] Payment Entry exists and submitted

---

## UI/UX Testing Notes

### Cross-Module Navigation Tests

| From          | To            | Method             | Expected                      |
| ------------- | ------------- | ------------------ | ----------------------------- |
| Lead          | Customer      | "Convert" button   | Pre-fill customer form        |
| Customer      | Quotation     | "Create Quotation" | Pre-select customer           |
| Quotation     | Sales Order   | "Create SO"        | Copy all data                 |
| Sales Order   | Delivery Note | "Create DN"        | Copy items                    |
| Sales Order   | Work Order    | "Create WO"        | Link production               |
| Delivery Note | Invoice       | "Create Invoice"   | Copy items/amounts            |
| Invoice       | Payment       | "Create Payment"   | Pre-fill party, fetch invoice |

### Status Badge Color Verification

| DocType     | Status     | Expected Color |
| ----------- | ---------- | -------------- |
| Lead        | Open       | Blue           |
| Lead        | Interested | Green          |
| Lead        | Converted  | Success/Green  |
| Lead        | Lost       | Red            |
| Quotation   | Draft      | Gray           |
| Quotation   | Open       | Blue           |
| Quotation   | Ordered    | Green          |
| Sales Order | Draft      | Gray           |
| Sales Order | To Deliver | Blue           |
| Sales Order | Completed  | Green          |
| Invoice     | Unpaid     | Yellow/Warning |
| Invoice     | Overdue    | Red            |
| Invoice     | Paid       | Green          |

### Theme Testing

For each page visited, toggle between light and dark mode:

1. Click theme toggle (sun/moon icon)
2. Verify:
   - [ ] All text is readable
   - [ ] Cards have proper background
   - [ ] Borders are visible
   - [ ] Status badges have correct colors
   - [ ] Forms have proper input visibility

### Responsive Design Testing

Test key pages at different viewport widths:

| Width  | Device  | Test Priority                  |
| ------ | ------- | ------------------------------ |
| 375px  | Mobile  | Forms usable, cards stack      |
| 768px  | Tablet  | Side-by-side where appropriate |
| 1280px | Desktop | Full layout                    |

---

## Error Scenario Testing

### Test: Create Invalid Quotation

**Action:** Try to create quotation without items

**Expected:**

- [ ] Validation error: "At least one item required"
- [ ] Form does not submit

### Test: Delete Submitted Document

**Action:** Try to delete a submitted Sales Order

**Expected:**

- [ ] Error: "Cannot delete submitted document"
- [ ] Document remains

### Test: Negative Stock

**Action:** Try to deliver more than available stock

**Expected:**

- [ ] Error: "Insufficient stock for item X in warehouse Y"
- [ ] Delivery Note not submitted

### Test: Credit Limit Warning

**Action:** Create invoice that exceeds customer credit limit (if configured)

**Expected:**

- [ ] Warning displayed
- [ ] User can still proceed (warning, not block)

### Test: Unbalanced Journal Entry

**Action:** Create journal entry with unequal debits/credits

**Expected:**

- [ ] Error: "Total Debit must equal Total Credit"
- [ ] Cannot submit

---

## Performance Benchmarks

Record load times for key pages:

| Page                      | Target Load Time | Notes     |
| ------------------------- | ---------------- | --------- |
| Dashboard                 | < 2s             |           |
| Customer List (100 items) | < 3s             |           |
| Item List (500 items)     | < 3s             |           |
| Quotation Create          | < 1s             | Form load |
| Sales Invoice Detail      | < 2s             |           |

---

## Post-Test Report Template

```
## Pana ERP v3.0 E2E Test Report

**Date:** [YYYY-MM-DD]
**Tester:** [Name]
**Environment:** [Dev/Staging/Production]
**Browser:** [Chrome/Firefox/Safari] v[X]

### Summary
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

### Failed Tests
| Test ID | Description | Expected | Actual | Screenshot |
|---------|-------------|----------|--------|------------|
| 2.1 | Create Quotation | Success | Error on save | link |

### Bugs Found
| Bug ID | Severity | Description | Steps to Reproduce |
|--------|----------|-------------|-------------------|
| BUG-001 | High | ... | 1. 2. 3. |

### UX Issues
| Issue | Page | Suggestion |
|-------|------|------------|
| Button hard to find | SO Detail | Move to top action bar |

### Notes
[Any additional observations]
```

---

## Client Demo: Business Gains & Value Proposition

**Purpose:** During the demo, communicate these business benefits to help the client understand the value of Pana ERP beyond the features.

### 💰 Projected Business Gains (Addis Ababa Context)

Use these talking points during the demo to connect features to real business value.

#### 1. **Time Savings**

| Current Pain Point                         | ERP Solution                          | Estimated Savings       |
| ------------------------------------------ | ------------------------------------- | ----------------------- |
| Manual quotation writing in Word/Excel     | Auto-calculate, one-click quotes      | **2-3 hours/day** saved |
| Searching paper files for customer history | Instant customer hub with all records | **30+ min/day** saved   |
| Calling warehouse to check stock           | Real-time stock visibility            | **1 hour/day** saved    |
| Manual invoice preparation                 | One-click invoice from delivery       | **1-2 hours/day** saved |

> **Demo Script:** _"Ato [Client], right now when a customer calls asking about a past order, how long does it take to find that information? With this system, it's 3 seconds - just search the customer name."_

#### 2. **Revenue Protection (Preventing Leakage)**

| Risk                                           | ERP Prevention                                        | Impact                                |
| ---------------------------------------------- | ----------------------------------------------------- | ------------------------------------- |
| Forgetting to invoice a delivery               | Delivery Note automatically triggers "To Bill" status | Prevents **unbilled revenue**         |
| Giving incorrect quotes from memory            | Standard rate cards, linked items                     | Prevents **underpricing** by 5-10%    |
| Lost leads due to no follow-up                 | Lead status tracking, visible pipeline                | Recover **10-20% lost opportunities** |
| Delivering without payment on credit customers | Credit limit warnings                                 | Reduce **bad debt exposure**          |

> **Demo Script:** _"Last month, how many deliveries happened where the invoice was delayed or forgotten? Each one of those is money sitting outside your bank account. This system makes it impossible to forget."_

#### 3. **Operational Visibility (Manager Benefits)**

| Question                               | Before ERP                       | With ERP                                |
| -------------------------------------- | -------------------------------- | --------------------------------------- |
| "How much did we sell this week?"      | Manual calculation from receipts | Dashboard shows instantly               |
| "Do we have paper stock for this job?" | Walk to warehouse, count         | Real-time stock levels on screen        |
| "Which jobs are overdue?"              | Check with each department       | Overdue Sales Orders highlighted in red |
| "Who owes us money?"                   | Review paper ledger              | Outstanding Invoices report, one click  |

> **Demo Script:** _"Imagine starting every morning knowing exactly which jobs are overdue, which customers owe money, and what stock you're running low on - without asking anyone."_

#### 4. **Cost Reduction**

| Expense                                    | ERP Impact                              | Estimated Savings          |
| ------------------------------------------ | --------------------------------------- | -------------------------- |
| Paper forms (quotations, invoices, DN)     | Digital documents, print on demand      | **ETB 5,000-10,000/month** |
| Staff overtime for end-of-month accounting | Automated ledger, no month-end scramble | **10-20 hours/month**      |
| Expedited purchases due to stock-out       | Low stock alerts, planned purchasing    | **5-10% on rush orders**   |
| Wasted materials from duplicate orders     | Clear Work Order tracking               | **Reduce waste 5-15%**     |

> **Demo Script:** _"Every time you run out of paper and have to buy emergency stock at a higher price from wherever is closest - that's money lost. This system tells you 3 days before you run out."_

#### 5. **Professionalism & Customer Trust**

| Old Way                             | New Way                                          | Customer Perception         |
| ----------------------------------- | ------------------------------------------------ | --------------------------- |
| Handwritten quotation on letterhead | Professional printed quotation with company logo | "This is a serious company" |
| Verbal delivery confirmation        | Signed Delivery Note with clear items            | "They're organized"         |
| Delayed/inconsistent invoicing      | Same-day invoice after delivery                  | "They're professional"      |
| No record of past orders            | "Let me pull up your history..."                 | "They remember me"          |

> **Demo Script:** _"When a customer from Bole calls and you instantly know their company name, their last 5 orders, and their preferred paper stock - how does that make your business look? World-class."_

---

### 📊 ROI Calculation Template

Use this during the demo to calculate rough ROI for the specific client:

```
MONTHLY SAVINGS ESTIMATE
────────────────────────────────────────────────────────
Time Saved (hours/day × 25 days × hourly cost):   ETB _______
Paper/Printing Saved:                              ETB _______
Revenue Recovered (forgotten invoices):            ETB _______
Rush Purchase Avoidance:                           ETB _______
────────────────────────────────────────────────────────
TOTAL ESTIMATED MONTHLY BENEFIT:                   ETB _______

vs. System Cost:                                   ETB _______
────────────────────────────────────────────────────────
NET MONTHLY GAIN:                                  ETB _______
```

> **Demo Script:** _"Let's do a quick calculation together. If you save just 2 hours per day across your team, and recover just 2 forgotten invoices per month, you've already paid for the system."_

---

### 🎯 Demo Talking Points by Audience

#### For the Owner/MD

- "Complete visibility into your business from your phone"
- "Know exactly who owes you money, every day"
- "Your business data is safe and organized forever"
- "Professional image attracts bigger clients"

#### For the Accountant

- "No more month-end scramble - books are always up to date"
- "One-click payment reconciliation"
- "Automatic VAT calculation on every invoice"
- "Clear audit trail for every transaction"

#### For the Sales Team

- "Create quotations in 2 minutes, not 20"
- "Know instantly if you have stock before promising delivery"
- "Track your leads - never forget to follow up"
- "Look professional with branded documents"

#### For Production/Operations

- "Clear work orders - no more verbal instructions"
- "Know exactly what raw materials are needed"
- "Delivery notes ready when the job is done"
- "No confusion about what's been delivered"

---

### 🇪🇹 Ethiopia-Specific Compliance Benefits

| Compliance Area          | ERP Support                                         |
| ------------------------ | --------------------------------------------------- |
| **VAT (15%)**            | Auto-calculated on invoices, clear records for ERCA |
| **Withholding Tax (2%)** | Can be configured in tax templates                  |
| **TIN Tracking**         | Customer TIN stored, appears on invoices            |
| **Receipt Numbering**    | Sequential, unique, compliant numbering             |
| **Financial Records**    | 10-year retention ready, meets audit requirements   |

> **Demo Script:** _"When ERCA comes for an audit, you hand them the laptop and say 'search anything.' All your invoices, all your payments, all organized."_

---

## Quick Reference: Demo Flow Summary

For a quick client demo, follow this condensed flow:

1. **Create Lead** → Show inquiry capture
2. **Convert to Customer** → Add address/contact
3. **Create Quotation** → Add item with specs
4. **Submit Quotation** → Show status change
5. **Create Sales Order** → Show artwork check
6. _(Optional)_ **Create Work Order** → Show manufacturing
7. **Create Delivery Note** → Print gate pass
8. **Create Invoice** → Show outstanding
9. **Create Payment** → Show paid status
10. **Show Dashboard** → Summarize the completed cycle

**Estimated Demo Time:** 30-45 minutes

---

_This testing guide ensures complete validation of Pana ERP v3.0 before client deployment._
