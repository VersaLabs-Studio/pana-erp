// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated at: 2025-12-30T15:35:04.337Z
// Source: Frappe DocType Metadata API
// Script: scripts/generate-types.js

/**
 * Item Group DocType
 * @doctype Item Group
 * @generated 2025-12-30T16:02:53.862Z
 */
export interface ItemGroup {
  /** Item Group Name */
  item_group_name: string;
  /** Parent Item Group */
  parent_item_group?: string;
  /** Is Group - Only leaf nodes are allowed in transaction */
  is_group?: 0 | 1;
  /** Image */
  image?: string;
  /** Item Group Defaults */
  item_group_defaults?: unknown[];
  /** Taxes */
  taxes?: unknown[];
  /** lft */
  lft?: number;
  /** old_parent */
  old_parent?: string;
  /** rgt */
  rgt?: number;
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Item Group Create Request
 * Fields required to create a new Item Group
 */
export type ItemGroupCreateRequest = Pick<ItemGroup, "item_group_name"> & Partial<Pick<ItemGroup, "parent_item_group" | "is_group" | "image" | "item_group_defaults" | "taxes" | "lft" | "old_parent" | "rgt">>;

/**
 * Item Group Update Request
 * All fields optional for update
 */
export type ItemGroupUpdateRequest = Partial<Omit<ItemGroup, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Lead DocType
 * @doctype Lead
 * @generated 2025-12-30T16:02:53.862Z
 */
export interface Lead {
  /** Series */
  naming_series?: "CRM-LEAD-.YYYY.-";
  /** Salutation */
  salutation?: string;
  /** First Name */
  first_name?: string;
  /** Middle Name */
  middle_name?: string;
  /** Last Name */
  last_name?: string;
  /** Full Name */
  lead_name?: string;
  /** Job Title */
  job_title?: string;
  /** Gender */
  gender?: string;
  /** Source */
  source?: string;
  /** Lead Owner */
  lead_owner?: string;
  /** Status */
  status: "Lead" | "Open" | "Replied" | "Opportunity" | "Quotation" | "Lost Quotation" | "Interested" | "Converted" | "Do Not Contact";
  /** From Customer */
  customer?: string;
  /** Lead Type */
  type?: "Client" | "Channel Partner" | "Consultant";
  /** Request Type */
  request_type?: "Product Enquiry" | "Request for Information" | "Suggestions" | "Other";
  /** Email */
  email_id?: string;
  /** Website */
  website?: string;
  /** Mobile No */
  mobile_no?: string;
  /** WhatsApp */
  whatsapp_no?: string;
  /** Phone */
  phone?: string;
  /** Phone Ext. */
  phone_ext?: string;
  /** Organization Name */
  company_name?: string;
  /** No of Employees */
  no_of_employees?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  /** Annual Revenue */
  annual_revenue?: number;
  /** Industry */
  industry?: string;
  /** Market Segment */
  market_segment?: string;
  /** Territory */
  territory?: string;
  /** Fax */
  fax?: string;
  /** Address HTML */
  address_html?: string;
  /** City */
  city?: string;
  /** State/Province */
  state?: string;
  /** Country */
  country?: string;
  /** Contact HTML */
  contact_html?: string;
  /** Qualification Status */
  qualification_status?: "Unqualified" | "In Process" | "Qualified";
  /** Qualified By */
  qualified_by?: string;
  /** Qualified on */
  qualified_on?: string;
  /** Campaign Name */
  campaign_name?: string;
  /** Company */
  company?: string;
  /** Print Language */
  language?: string;
  /** Image */
  image?: string;
  /** Title */
  title?: string;
  /** Disabled */
  disabled?: 0 | 1;
  /** Unsubscribed */
  unsubscribed?: 0 | 1;
  /** Blog Subscriber */
  blog_subscriber?: 0 | 1;
  /** Open Activities HTML */
  open_activities_html?: string;
  /** All Activities HTML */
  all_activities_html?: string;
  /** Notes HTML */
  notes_html?: string;
  /** Notes */
  notes?: unknown[];
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Lead Create Request
 * Fields required to create a new Lead
 */
export type LeadCreateRequest = Pick<Lead, "status"> & Partial<Pick<Lead, "naming_series" | "salutation" | "first_name" | "middle_name" | "last_name" | "lead_name" | "job_title" | "gender" | "source" | "lead_owner">>;

/**
 * Lead Update Request
 * All fields optional for update
 */
export type LeadUpdateRequest = Partial<Omit<Lead, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Customer Group DocType
 * @doctype Customer Group
 * @generated 2025-12-30T16:49:49.943Z
 */
export interface CustomerGroup {
  /** Customer Group Name */
  customer_group_name: string;
  /** Parent Customer Group */
  parent_customer_group?: string;
  /** Is Group - Only leaf nodes are allowed in transaction */
  is_group?: 0 | 1;
  /** Default Price List */
  default_price_list?: string;
  /** Default Payment Terms Template */
  payment_terms?: string;
  /** lft */
  lft?: number;
  /** rgt */
  rgt?: number;
  /** old_parent */
  old_parent?: string;
  /** Accounts - Mention if non-standard receivable account applicable */
  accounts?: unknown[];
  /** Credit Limit */
  credit_limits?: unknown[];
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Customer Group Create Request
 * Fields required to create a new Customer Group
 */
export type CustomerGroupCreateRequest = Pick<CustomerGroup, "customer_group_name"> & Partial<Pick<CustomerGroup, "parent_customer_group" | "is_group" | "default_price_list" | "payment_terms" | "lft" | "rgt" | "old_parent" | "accounts" | "credit_limits">>;

/**
 * Customer Group Update Request
 * All fields optional for update
 */
export type CustomerGroupUpdateRequest = Partial<Omit<CustomerGroup, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Address DocType
 * @doctype Address
 * @generated 2025-12-30T16:02:53.862Z
 */
export interface Address {
  /** Address Title */
  address_title?: string;
  /** Address Type */
  address_type: "Billing" | "Shipping" | "Office" | "Personal" | "Plant" | "Postal" | "Shop" | "Subsidiary" | "Warehouse" | "Current" | "Permanent" | "Other";
  /** Address Line 1 */
  address_line1: string;
  /** Address Line 2 */
  address_line2?: string;
  /** City/Town */
  city: string;
  /** County */
  county?: string;
  /** State/Province */
  state?: string;
  /** Country */
  country: string;
  /** Postal Code */
  pincode?: string;
  /** Email Address */
  email_id?: string;
  /** Phone */
  phone?: string;
  /** Fax */
  fax?: string;
  /** Preferred Billing Address */
  is_primary_address?: 0 | 1;
  /** Preferred Shipping Address */
  is_shipping_address?: 0 | 1;
  /** Disabled */
  disabled?: 0 | 1;
  /** Links */
  links?: unknown[];
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Address Create Request
 * Fields required to create a new Address
 */
export type AddressCreateRequest = Pick<Address, "address_type" | "address_line1" | "city" | "country"> & Partial<Pick<Address, "address_title" | "address_line2" | "county" | "state" | "pincode" | "email_id" | "phone" | "fax" | "is_primary_address" | "is_shipping_address">>;

/**
 * Address Update Request
 * All fields optional for update
 */
export type AddressUpdateRequest = Partial<Omit<Address, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Contact DocType
 * @doctype Contact
 * @generated 2025-12-30T16:02:53.862Z
 */
export interface Contact {
  /** First Name */
  first_name?: string;
  /** Middle Name */
  middle_name?: string;
  /** Last Name */
  last_name?: string;
  /** Full Name */
  full_name?: string;
  /** Email Address */
  email_id?: string;
  /** User Id */
  user?: string;
  /** Address */
  address?: string;
  /** Sync with Google Contacts */
  sync_with_google_contacts?: 0 | 1;
  /** Status */
  status?: "Passive" | "Open" | "Replied";
  /** Salutation */
  salutation?: string;
  /** Designation */
  designation?: string;
  /** Gender */
  gender?: string;
  /** Phone */
  phone?: string;
  /** Mobile No */
  mobile_no?: string;
  /** Company Name */
  company_name?: string;
  /** Image */
  image?: string;
  /** Google Contacts */
  google_contacts?: string;
  /** Google Contacts Id */
  google_contacts_id?: string;
  /** Pulled from Google Contacts */
  pulled_from_google_contacts?: 0 | 1;
  /** Email IDs */
  email_ids?: unknown[];
  /** Contact Numbers */
  phone_nos?: unknown[];
  /** Links */
  links?: unknown[];
  /** Is Primary Contact */
  is_primary_contact?: 0 | 1;
  /** Department */
  department?: string;
  /** Unsubscribed */
  unsubscribed?: 0 | 1;
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Contact Update Request
 * All fields optional for update
 */
export type ContactUpdateRequest = Partial<Omit<Contact, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Supplier DocType
 * @doctype Supplier
 * @generated 2025-12-30T16:02:53.862Z
 */
export interface Supplier {
  /** Series */
  naming_series?: "SUP-.YYYY.-";
  /** Supplier Name */
  supplier_name: string;
  /** Country */
  country?: string;
  /** Supplier Group */
  supplier_group?: string;
  /** Supplier Type */
  supplier_type: "Company" | "Individual" | "Partnership";
  /** Is Transporter */
  is_transporter?: 0 | 1;
  /** Image */
  image?: string;
  /** Billing Currency */
  default_currency?: string;
  /** Default Company Bank Account */
  default_bank_account?: string;
  /** Price List */
  default_price_list?: string;
  /** Is Internal Supplier */
  is_internal_supplier?: 0 | 1;
  /** Represents Company */
  represents_company?: string;
  /** Allowed To Transact With */
  companies?: unknown[];
  /** Supplier Details - Statutory info and other general information about your Supplier */
  supplier_details?: string;
  /** Website */
  website?: string;
  /** Print Language */
  language?: string;
  /** Tax ID */
  tax_id?: string;
  /** Tax Category */
  tax_category?: string;
  /** Tax Withholding Category */
  tax_withholding_category?: string;
  /** Address HTML */
  address_html?: string;
  /** Contact HTML */
  contact_html?: string;
  /** Supplier Primary Address - Reselect, if the chosen address is edited after save */
  supplier_primary_address?: string;
  /** Primary Address */
  primary_address?: string;
  /** Supplier Primary Contact - Reselect, if the chosen contact is edited after save */
  supplier_primary_contact?: string;
  /** Mobile No */
  mobile_no?: string;
  /** Email Id */
  email_id?: string;
  /** Default Payment Terms Template */
  payment_terms?: string;
  /** Accounts - Mention if non-standard payable account */
  accounts?: unknown[];
  /** Allow Purchase Invoice Creation Without Purchase Order */
  allow_purchase_invoice_creation_without_purchase_order?: 0 | 1;
  /** Allow Purchase Invoice Creation Without Purchase Receipt */
  allow_purchase_invoice_creation_without_purchase_receipt?: 0 | 1;
  /** Is Frozen */
  is_frozen?: 0 | 1;
  /** Disabled */
  disabled?: 0 | 1;
  /** Warn RFQs */
  warn_rfqs?: 0 | 1;
  /** Warn POs */
  warn_pos?: 0 | 1;
  /** Prevent RFQs */
  prevent_rfqs?: 0 | 1;
  /** Prevent POs */
  prevent_pos?: 0 | 1;
  /** Block Supplier */
  on_hold?: 0 | 1;
  /** Hold Type */
  hold_type?: "All" | "Invoices" | "Payments";
  /** Release Date - Leave blank if the Supplier is blocked indefinitely */
  release_date?: string;
  /** Supplier Portal Users */
  portal_users?: unknown[];
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Supplier Create Request
 * Fields required to create a new Supplier
 */
export type SupplierCreateRequest = Pick<Supplier, "supplier_name" | "supplier_type"> & Partial<Pick<Supplier, "naming_series" | "country" | "supplier_group" | "is_transporter" | "image" | "default_currency" | "default_bank_account" | "default_price_list" | "is_internal_supplier" | "represents_company">>;

/**
 * Supplier Update Request
 * All fields optional for update
 */
export type SupplierUpdateRequest = Partial<Omit<Supplier, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Sales Order DocType
 * @doctype Sales Order
 * @generated 2025-12-30T16:02:53.862Z
 */
export interface SalesOrder {
  /** Title */
  title?: string;
  /** Series */
  naming_series: "SAL-ORD-.YYYY.-";
  /** Customer */
  customer: string;
  /** Customer Name */
  customer_name?: string;
  /** Tax Id */
  tax_id?: string;
  /** Order Type */
  order_type: "Sales" | "Maintenance" | "Shopping Cart";
  /** Date */
  transaction_date: string;
  /** Delivery Date */
  delivery_date?: string;
  /** Customer's Purchase Order */
  po_no?: string;
  /** Customer's Purchase Order Date */
  po_date?: string;
  /** Company */
  company: string;
  /** Skip Delivery Note */
  skip_delivery_note?: 0 | 1;
  /** Has Unit Price Items */
  has_unit_price_items?: 0 | 1;
  /** Amended From */
  amended_from?: string;
  /** Cost Center */
  cost_center?: string;
  /** Project */
  project?: string;
  /** Currency */
  currency: string;
  /** Exchange Rate - Rate at which customer's currency is converted to company's base currency */
  conversion_rate: number;
  /** Price List */
  selling_price_list: string;
  /** Price List Currency */
  price_list_currency: string;
  /** Price List Exchange Rate - Rate at which Price list currency is converted to company's base currency */
  plc_conversion_rate: number;
  /** Ignore Pricing Rule */
  ignore_pricing_rule?: 0 | 1;
  /** Scan Barcode */
  scan_barcode?: string;
  /** Last Scanned Warehouse */
  last_scanned_warehouse?: string;
  /** Set Source Warehouse */
  set_warehouse?: string;
  /** Reserve Stock - If checked, Stock will be reserved on <b>Submit</b> */
  reserve_stock?: 0 | 1;
  /** Items */
  items: unknown[];
  /** Total Quantity */
  total_qty?: number;
  /** Total Net Weight */
  total_net_weight?: number;
  /** Total (Company Currency) */
  base_total?: number;
  /** Net Total (Company Currency) */
  base_net_total?: number;
  /** Total */
  total?: number;
  /** Net Total */
  net_total?: number;
  /** Tax Category */
  tax_category?: string;
  /** Sales Taxes and Charges Template */
  taxes_and_charges?: string;
  /** Shipping Rule */
  shipping_rule?: string;
  /** Incoterm */
  incoterm?: string;
  /** Named Place */
  named_place?: string;
  /** Sales Taxes and Charges */
  taxes?: unknown[];
  /** Total Taxes and Charges (Company Currency) */
  base_total_taxes_and_charges?: number;
  /** Total Taxes and Charges */
  total_taxes_and_charges?: number;
  /** Grand Total (Company Currency) */
  base_grand_total?: number;
  /** Rounding Adjustment (Company Currency) */
  base_rounding_adjustment?: number;
  /** Rounded Total (Company Currency) */
  base_rounded_total?: number;
  /** In Words (Company Currency) - In Words will be visible once you save the Sales Order. */
  base_in_words?: string;
  /** Grand Total */
  grand_total?: number;
  /** Rounding Adjustment */
  rounding_adjustment?: number;
  /** Rounded Total */
  rounded_total?: number;
  /** In Words */
  in_words?: string;
  /** Advance Paid */
  advance_paid?: number;
  /** Disable Rounded Total */
  disable_rounded_total?: 0 | 1;
  /** Apply Additional Discount On */
  apply_discount_on?: "Grand Total" | "Net Total";
  /** Additional Discount Amount (Company Currency) */
  base_discount_amount?: number;
  /** Coupon Code */
  coupon_code?: string;
  /** Additional Discount Percentage */
  additional_discount_percentage?: number;
  /** Additional Discount Amount */
  discount_amount?: number;
  /** Taxes and Charges Calculation */
  other_charges_calculation?: string;
  /** Packed Items */
  packed_items?: unknown[];
  /** Pricing Rule Detail */
  pricing_rules?: unknown[];
  /** Customer Address */
  customer_address?: string;
  /** Address */
  address_display?: string;
  /** Customer Group */
  customer_group?: string;
  /** Territory */
  territory?: string;
  /** Contact Person */
  contact_person?: string;
  /** Contact */
  contact_display?: string;
  /** Phone */
  contact_phone?: string;
  /** Mobile No */
  contact_mobile?: string;
  /** Contact Email */
  contact_email?: string;
  /** Shipping Address Name */
  shipping_address_name?: string;
  /** Shipping Address */
  shipping_address?: string;
  /** Dispatch Address Name */
  dispatch_address_name?: string;
  /** Dispatch Address */
  dispatch_address?: string;
  /** Company Address Name */
  company_address?: string;
  /** Company Address */
  company_address_display?: string;
  /** Company Contact Person */
  company_contact_person?: string;
  /** Payment Terms Template */
  payment_terms_template?: string;
  /** Payment Schedule */
  payment_schedule?: unknown[];
  /** Terms */
  tc_name?: string;
  /** Terms and Conditions Details */
  terms?: string;
  /** Status */
  status: "Draft" | "On Hold" | "To Deliver and Bill" | "To Bill" | "To Deliver" | "Completed" | "Cancelled" | "Closed";
  /** Delivery Status */
  delivery_status?: "Not Delivered" | "Fully Delivered" | "Partly Delivered" | "Closed" | "Not Applicable";
  /** %  Delivered - % of materials delivered against this Sales Order */
  per_delivered?: number;
  /** % Amount Billed - % of materials billed against this Sales Order */
  per_billed?: number;
  /** % Picked */
  per_picked?: number;
  /** Billing Status */
  billing_status?: "Not Billed" | "Fully Billed" | "Partly Billed" | "Closed";
  /** Sales Partner */
  sales_partner?: string;
  /** Amount Eligible for Commission */
  amount_eligible_for_commission?: number;
  /** Commission Rate */
  commission_rate?: number;
  /** Total Commission */
  total_commission?: number;
  /** Sales Team */
  sales_team?: unknown[];
  /** Loyalty Points */
  loyalty_points?: number;
  /** Loyalty Amount */
  loyalty_amount?: number;
  /** From Date */
  from_date?: string;
  /** To Date */
  to_date?: string;
  /** Auto Repeat */
  auto_repeat?: string;
  /** Update Auto Repeat Reference */
  update_auto_repeat_reference?: unknown;
  /** Letter Head */
  letter_head?: string;
  /** Group same items */
  group_same_items?: 0 | 1;
  /** Print Heading */
  select_print_heading?: string;
  /** Print Language */
  language?: string;
  /** Is Internal Customer */
  is_internal_customer?: 0 | 1;
  /** Represents Company */
  represents_company?: string;
  /** Source */
  source?: string;
  /** Inter Company Order Reference */
  inter_company_order_reference?: string;
  /** Campaign */
  campaign?: string;
  /** Party Account Currency */
  party_account_currency?: string;
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Sales Order Create Request
 * Fields required to create a new Sales Order
 */
export type SalesOrderCreateRequest = Pick<SalesOrder, "naming_series" | "customer" | "order_type" | "transaction_date" | "company" | "currency" | "conversion_rate" | "selling_price_list" | "price_list_currency" | "plc_conversion_rate" | "items" | "status"> & Partial<Pick<SalesOrder, "title" | "customer_name" | "tax_id" | "delivery_date" | "po_no" | "po_date" | "skip_delivery_note" | "has_unit_price_items" | "amended_from" | "cost_center">>;

/**
 * Sales Order Update Request
 * All fields optional for update
 */
export type SalesOrderUpdateRequest = Partial<Omit<SalesOrder, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Purchase Receipt DocType
 * @doctype Purchase Receipt
 * @generated 2025-12-30T16:02:53.864Z
 */
export interface PurchaseReceipt {
  /** Title */
  title?: string;
  /** Series */
  naming_series: "MAT-PRE-.YYYY.-" | "MAT-PR-RET-.YYYY.-";
  /** Supplier */
  supplier: string;
  /** Supplier Name */
  supplier_name?: string;
  /** Supplier Delivery Note */
  supplier_delivery_note?: string;
  /** Subcontracting Receipt */
  subcontracting_receipt?: string;
  /** Date */
  posting_date: string;
  /** Posting Time */
  posting_time: string;
  /** Edit Posting Date and Time */
  set_posting_time?: 0 | 1;
  /** Company */
  company: string;
  /** Apply Putaway Rule */
  apply_putaway_rule?: 0 | 1;
  /** Is Return */
  is_return?: 0 | 1;
  /** Return Against Purchase Receipt */
  return_against?: string;
  /** Cost Center */
  cost_center?: string;
  /** Project */
  project?: string;
  /** Currency */
  currency: string;
  /** Exchange Rate - Rate at which supplier's currency is converted to company's base currency */
  conversion_rate: number;
  /** Price List */
  buying_price_list?: string;
  /** Price List Currency */
  price_list_currency?: string;
  /** Price List Exchange Rate */
  plc_conversion_rate?: number;
  /** Ignore Pricing Rule */
  ignore_pricing_rule?: 0 | 1;
  /** Scan Barcode */
  scan_barcode?: string;
  /** Last Scanned Warehouse */
  last_scanned_warehouse?: string;
  /** Accepted Warehouse */
  set_warehouse?: string;
  /** Set From Warehouse */
  set_from_warehouse?: string;
  /** Rejected Warehouse */
  rejected_warehouse?: string;
  /** Is Subcontracted */
  is_subcontracted?: 0 | 1;
  /** Supplier Warehouse */
  supplier_warehouse?: string;
  /** Items */
  items: unknown[];
  /** Total Quantity */
  total_qty?: number;
  /** Total Net Weight */
  total_net_weight?: number;
  /** Total (Company Currency) */
  base_total?: number;
  /** Net Total (Company Currency) */
  base_net_total: number;
  /** Total */
  total?: number;
  /** Net Total */
  net_total?: number;
  /** Tax Withholding Net Total */
  tax_withholding_net_total?: number;
  /** Base Tax Withholding Net Total */
  base_tax_withholding_net_total?: number;
  /** Tax Category */
  tax_category?: string;
  /** Purchase Taxes and Charges Template */
  taxes_and_charges?: string;
  /** Shipping Rule */
  shipping_rule?: string;
  /** Incoterm */
  incoterm?: string;
  /** Named Place */
  named_place?: string;
  /** Purchase Taxes and Charges */
  taxes?: unknown[];
  /** Taxes and Charges Added (Company Currency) */
  base_taxes_and_charges_added?: number;
  /** Taxes and Charges Deducted (Company Currency) */
  base_taxes_and_charges_deducted?: number;
  /** Total Taxes and Charges (Company Currency) */
  base_total_taxes_and_charges?: number;
  /** Taxes and Charges Added */
  taxes_and_charges_added?: number;
  /** Taxes and Charges Deducted */
  taxes_and_charges_deducted?: number;
  /** Total Taxes and Charges */
  total_taxes_and_charges?: number;
  /** Grand Total (Company Currency) */
  base_grand_total?: number;
  /** Rounding Adjustment (Company Currency) */
  base_rounding_adjustment?: number;
  /** Rounded Total (Company Currency) */
  base_rounded_total?: number;
  /** In Words (Company Currency) */
  base_in_words?: string;
  /** Grand Total */
  grand_total?: number;
  /** Rounding Adjustment */
  rounding_adjustment?: number;
  /** Rounded Total */
  rounded_total?: number;
  /** In Words */
  in_words?: string;
  /** Disable Rounded Total */
  disable_rounded_total?: 0 | 1;
  /** Apply Additional Discount On */
  apply_discount_on?: "Grand Total" | "Net Total";
  /** Additional Discount Amount (Company Currency) */
  base_discount_amount?: number;
  /** Additional Discount Percentage */
  additional_discount_percentage?: number;
  /** Additional Discount Amount */
  discount_amount?: number;
  /** Taxes and Charges Calculation */
  other_charges_calculation?: string;
  /** Pricing Rule Detail */
  pricing_rules?: unknown[];
  /** Get Current Stock */
  get_current_stock?: unknown;
  /** Consumed Items */
  supplied_items?: unknown[];
  /** Supplier Address */
  supplier_address?: string;
  /** Address */
  address_display?: string;
  /** Contact Person */
  contact_person?: string;
  /** Contact */
  contact_display?: string;
  /** Mobile No */
  contact_mobile?: string;
  /** Contact Email */
  contact_email?: string;
  /** Dispatch Address Template */
  dispatch_address?: string;
  /** Dispatch Address */
  dispatch_address_display?: string;
  /** Shipping Address Template */
  shipping_address?: string;
  /** Shipping Address */
  shipping_address_display?: string;
  /** Billing Address */
  billing_address?: string;
  /** Billing Address */
  billing_address_display?: string;
  /** Terms */
  tc_name?: string;
  /** Terms and Conditions */
  terms?: string;
  /** Status */
  status: "Draft" | "Partly Billed" | "To Bill" | "Completed" | "Return" | "Return Issued" | "Cancelled" | "Closed";
  /** % Amount Billed */
  per_billed?: number;
  /** % Returned */
  per_returned?: number;
  /** Auto Repeat */
  auto_repeat?: string;
  /** Letter Head */
  letter_head?: string;
  /** Group same items */
  group_same_items?: 0 | 1;
  /** Print Heading */
  select_print_heading?: string;
  /** Print Language */
  language?: string;
  /** Transporter Name */
  transporter_name?: string;
  /** Vehicle Number */
  lr_no?: string;
  /** Vehicle Date */
  lr_date?: string;
  /** Instructions */
  instructions?: string;
  /** Is Internal Supplier */
  is_internal_supplier?: 0 | 1;
  /** Represents Company */
  represents_company?: string;
  /** Inter Company Reference */
  inter_company_reference?: string;
  /** Remarks */
  remarks?: string;
  /** Range */
  range?: string;
  /** Amended From */
  amended_from?: string;
  /** Is Old Subcontracting Flow */
  is_old_subcontracting_flow?: 0 | 1;
  /** Other Details */
  other_details?: string;
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Purchase Receipt Create Request
 * Fields required to create a new Purchase Receipt
 */
export type PurchaseReceiptCreateRequest = Pick<PurchaseReceipt, "naming_series" | "supplier" | "posting_date" | "posting_time" | "company" | "currency" | "conversion_rate" | "items" | "base_net_total" | "status"> & Partial<Pick<PurchaseReceipt, "title" | "supplier_name" | "supplier_delivery_note" | "subcontracting_receipt" | "set_posting_time" | "apply_putaway_rule" | "is_return" | "return_against" | "cost_center" | "project">>;

/**
 * Purchase Receipt Update Request
 * All fields optional for update
 */
export type PurchaseReceiptUpdateRequest = Partial<Omit<PurchaseReceipt, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Stock Entry DocType
 * @doctype Stock Entry
 * @generated 2025-12-30T16:02:53.864Z
 */
export interface StockEntry {
  /** Series */
  naming_series: "MAT-STE-.YYYY.-";
  /** Stock Entry Type */
  stock_entry_type: string;
  /** Stock Entry (Outward GIT) */
  outgoing_stock_entry?: string;
  /** Purpose */
  purpose?: "Material Issue" | "Material Receipt" | "Material Transfer" | "Material Transfer for Manufacture" | "Material Consumption for Manufacture" | "Manufacture" | "Repack" | "Send to Subcontractor" | "Disassemble";
  /** Add to Transit */
  add_to_transit?: 0 | 1;
  /** Work Order */
  work_order?: string;
  /** Purchase Order */
  purchase_order?: string;
  /** Subcontracting Order */
  subcontracting_order?: string;
  /** Delivery Note No */
  delivery_note_no?: string;
  /** Sales Invoice No */
  sales_invoice_no?: string;
  /** Pick List */
  pick_list?: string;
  /** Purchase Receipt No */
  purchase_receipt_no?: string;
  /** Asset Repair */
  asset_repair?: string;
  /** Company */
  company: string;
  /** Posting Date */
  posting_date?: string;
  /** Posting Time */
  posting_time?: string;
  /** Edit Posting Date and Time */
  set_posting_time?: 0 | 1;
  /** Inspection Required */
  inspection_required?: 0 | 1;
  /** Apply Putaway Rule */
  apply_putaway_rule?: 0 | 1;
  /** From BOM */
  from_bom?: 0 | 1;
  /** Use Multi-Level BOM - Including items for sub assemblies */
  use_multi_level_bom?: 0 | 1;
  /** BOM No */
  bom_no?: string;
  /** Finished Good Quantity  - As per Stock UOM */
  fg_completed_qty?: number;
  /** Get Items */
  get_items?: unknown;
  /** % Process Loss */
  process_loss_percentage?: number;
  /** Process Loss Qty */
  process_loss_qty?: number;
  /** Default Source Warehouse - Sets 'Source Warehouse' in each row of the items table. */
  from_warehouse?: string;
  /** Source Warehouse Address Link */
  source_warehouse_address?: string;
  /** Source Warehouse Address */
  source_address_display?: string;
  /** Default Target Warehouse - Sets 'Target Warehouse' in each row of the items table. */
  to_warehouse?: string;
  /** Target Warehouse Address Link */
  target_warehouse_address?: string;
  /** Target Warehouse Address */
  target_address_display?: string;
  /** Scan Barcode */
  scan_barcode?: string;
  /** Last Scanned Warehouse */
  last_scanned_warehouse?: string;
  /** Items */
  items: unknown[];
  /** Update Rate and Availability */
  get_stock_and_rate?: unknown;
  /** Total Outgoing Value (Consumption) */
  total_outgoing_value?: number;
  /** Total Incoming Value (Receipt) */
  total_incoming_value?: number;
  /** Total Value Difference (Incoming - Outgoing) */
  value_difference?: number;
  /** Additional Costs */
  additional_costs?: unknown[];
  /** Total Additional Costs */
  total_additional_costs?: number;
  /** Supplier */
  supplier?: string;
  /** Supplier Name */
  supplier_name?: string;
  /** Supplier Address */
  supplier_address?: string;
  /** Address */
  address_display?: string;
  /** Project */
  project?: string;
  /** Print Heading */
  select_print_heading?: string;
  /** Letter Head */
  letter_head?: string;
  /** Is Opening */
  is_opening?: "No" | "Yes";
  /** Remarks */
  remarks?: string;
  /** Per Transferred */
  per_transferred?: number;
  /** Total Amount */
  total_amount?: number;
  /** Job Card */
  job_card?: string;
  /** Amended From */
  amended_from?: string;
  /** Credit Note */
  credit_note?: string;
  /** Is Return */
  is_return?: 0 | 1;
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Stock Entry Create Request
 * Fields required to create a new Stock Entry
 */
export type StockEntryCreateRequest = Pick<StockEntry, "naming_series" | "stock_entry_type" | "company" | "items"> & Partial<Pick<StockEntry, "outgoing_stock_entry" | "purpose" | "add_to_transit" | "work_order" | "purchase_order" | "subcontracting_order" | "delivery_note_no" | "sales_invoice_no" | "pick_list" | "purchase_receipt_no">>;

/**
 * Stock Entry Update Request
 * All fields optional for update
 */
export type StockEntryUpdateRequest = Partial<Omit<StockEntry, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Delivery Note DocType
 * @doctype Delivery Note
 * @generated 2025-12-30T16:02:53.864Z
 */
export interface DeliveryNote {
  /** Title */
  title?: string;
  /** Series */
  naming_series: "MAT-DN-.YYYY.-" | "MAT-DN-RET-.YYYY.-";
  /** Customer */
  customer: string;
  /** Tax Id */
  tax_id?: string;
  /** Customer Name */
  customer_name?: string;
  /** Date */
  posting_date: string;
  /** Posting Time */
  posting_time: string;
  /** Edit Posting Date and Time */
  set_posting_time?: 0 | 1;
  /** Company */
  company: string;
  /** Amended From */
  amended_from?: string;
  /** Is Return */
  is_return?: 0 | 1;
  /** Issue Credit Note */
  issue_credit_note?: 0 | 1;
  /** Return Against Delivery Note */
  return_against?: string;
  /** Cost Center */
  cost_center?: string;
  /** Project */
  project?: string;
  /** Currency */
  currency: string;
  /** Exchange Rate - Rate at which customer's currency is converted to company's base currency */
  conversion_rate: number;
  /** Price List */
  selling_price_list: string;
  /** Price List Currency */
  price_list_currency: string;
  /** Price List Exchange Rate - Rate at which Price list currency is converted to company's base currency */
  plc_conversion_rate: number;
  /** Ignore Pricing Rule */
  ignore_pricing_rule?: 0 | 1;
  /** Scan Barcode */
  scan_barcode?: string;
  /** Last Scanned Warehouse */
  last_scanned_warehouse?: string;
  /** Set Source Warehouse */
  set_warehouse?: string;
  /** Set Target Warehouse */
  set_target_warehouse?: string;
  /** Delivery Note Item */
  items: unknown[];
  /** Total Quantity */
  total_qty?: number;
  /** Total Net Weight */
  total_net_weight?: number;
  /** Total (Company Currency) */
  base_total?: number;
  /** Net Total (Company Currency) */
  base_net_total?: number;
  /** Total */
  total?: number;
  /** Net Total */
  net_total?: number;
  /** Tax Category */
  tax_category?: string;
  /** Sales Taxes and Charges Template */
  taxes_and_charges?: string;
  /** Shipping Rule */
  shipping_rule?: string;
  /** Incoterm */
  incoterm?: string;
  /** Named Place */
  named_place?: string;
  /** Sales Taxes and Charges */
  taxes?: unknown[];
  /** Total Taxes and Charges (Company Currency) */
  base_total_taxes_and_charges?: number;
  /** Total Taxes and Charges */
  total_taxes_and_charges?: number;
  /** Grand Total (Company Currency) */
  base_grand_total?: number;
  /** Rounding Adjustment (Company Currency) */
  base_rounding_adjustment?: number;
  /** Rounded Total (Company Currency) */
  base_rounded_total?: number;
  /** In Words (Company Currency) - In Words will be visible once you save the Delivery Note. */
  base_in_words?: string;
  /** Grand Total */
  grand_total?: number;
  /** Rounding Adjustment */
  rounding_adjustment?: number;
  /** Rounded Total */
  rounded_total?: number;
  /** In Words - In Words (Export) will be visible once you save the Delivery Note. */
  in_words?: string;
  /** Disable Rounded Total */
  disable_rounded_total?: 0 | 1;
  /** Apply Additional Discount On */
  apply_discount_on?: "Grand Total" | "Net Total";
  /** Additional Discount Amount (Company Currency) */
  base_discount_amount?: number;
  /** Additional Discount Percentage */
  additional_discount_percentage?: number;
  /** Additional Discount Amount */
  discount_amount?: number;
  /** Taxes and Charges Calculation */
  other_charges_calculation?: string;
  /** Packed Items */
  packed_items?: unknown[];
  /** Product Bundle Help */
  product_bundle_help?: string;
  /** Pricing Rule Detail */
  pricing_rules?: unknown[];
  /** Billing Address Name */
  customer_address?: string;
  /** Billing Address */
  address_display?: string;
  /** Contact Person */
  contact_person?: string;
  /** Contact */
  contact_display?: string;
  /** Mobile No */
  contact_mobile?: string;
  /** Contact Email */
  contact_email?: string;
  /** Shipping Address */
  shipping_address_name?: string;
  /** Shipping Address */
  shipping_address?: string;
  /** Dispatch Address Name */
  dispatch_address_name?: string;
  /** Dispatch Address */
  dispatch_address?: string;
  /** Company Address Name */
  company_address?: string;
  /** Company Address */
  company_address_display?: string;
  /** Company Contact Person */
  company_contact_person?: string;
  /** Terms */
  tc_name?: string;
  /** Terms and Conditions Details */
  terms?: string;
  /** % Amount Billed */
  per_billed?: number;
  /** Status */
  status: "Draft" | "To Bill" | "Completed" | "Return" | "Return Issued" | "Cancelled" | "Closed";
  /** % Installed */
  per_installed?: number;
  /** Installation Status */
  installation_status?: string;
  /** % Returned */
  per_returned?: number;
  /** Transporter */
  transporter?: string;
  /** Driver */
  driver?: string;
  /** Transport Receipt No */
  lr_no?: string;
  /** Vehicle No */
  vehicle_no?: string;
  /** Transporter Name */
  transporter_name?: string;
  /** Driver Name */
  driver_name?: string;
  /** Transport Receipt Date */
  lr_date?: string;
  /** Customer's Purchase Order No */
  po_no?: string;
  /** Customer's Purchase Order Date */
  po_date?: string;
  /** Sales Partner */
  sales_partner?: string;
  /** Amount Eligible for Commission */
  amount_eligible_for_commission?: number;
  /** Commission Rate (%) */
  commission_rate?: number;
  /** Total Commission */
  total_commission?: number;
  /** Sales Team */
  sales_team?: unknown[];
  /** Auto Repeat */
  auto_repeat?: string;
  /** Letter Head */
  letter_head?: string;
  /** Print Without Amount */
  print_without_amount?: 0 | 1;
  /** Group same items */
  group_same_items?: 0 | 1;
  /** Print Heading */
  select_print_heading?: string;
  /** Print Language */
  language?: string;
  /** Is Internal Customer */
  is_internal_customer?: 0 | 1;
  /** Represents Company - Company which internal customer represents. */
  represents_company?: string;
  /** Inter Company Reference */
  inter_company_reference?: string;
  /** Customer Group */
  customer_group?: string;
  /** Territory */
  territory?: string;
  /** Source */
  source?: string;
  /** Campaign */
  campaign?: string;
  /** Excise Page Number */
  excise_page?: string;
  /** Instructions */
  instructions?: string;
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Delivery Note Create Request
 * Fields required to create a new Delivery Note
 */
export type DeliveryNoteCreateRequest = Pick<DeliveryNote, "naming_series" | "customer" | "posting_date" | "posting_time" | "company" | "currency" | "conversion_rate" | "selling_price_list" | "price_list_currency" | "plc_conversion_rate" | "items" | "status"> & Partial<Pick<DeliveryNote, "title" | "tax_id" | "customer_name" | "set_posting_time" | "amended_from" | "is_return" | "issue_credit_note" | "return_against" | "cost_center" | "project">>;

/**
 * Delivery Note Update Request
 * All fields optional for update
 */
export type DeliveryNoteUpdateRequest = Partial<Omit<DeliveryNote, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Warehouse DocType
 * @doctype Warehouse
 * @generated 2025-12-30T16:02:53.865Z
 */
export interface Warehouse {
  /** Disabled */
  disabled?: 0 | 1;
  /** Warehouse Name */
  warehouse_name: string;
  /** Is Group Warehouse */
  is_group?: 0 | 1;
  /** Parent Warehouse */
  parent_warehouse?: string;
  /** Is Rejected Warehouse - If yes, then this warehouse will be used to store rejected materials */
  is_rejected_warehouse?: 0 | 1;
  /** Account - If blank, parent Warehouse Account or company default will be considered in transactions */
  account?: string;
  /** Company */
  company: string;
  /** Address HTML */
  address_html?: string;
  /** Contact HTML */
  contact_html?: string;
  /** Email Address */
  email_id?: string;
  /** Phone No */
  phone_no?: string;
  /** Mobile No */
  mobile_no?: string;
  /** Address Line 1 */
  address_line_1?: string;
  /** Address Line 2 */
  address_line_2?: string;
  /** City */
  city?: string;
  /** State/Province */
  state?: string;
  /** PIN */
  pin?: string;
  /** Warehouse Type */
  warehouse_type?: string;
  /** Default In-Transit Warehouse */
  default_in_transit_warehouse?: string;
  /** lft */
  lft?: number;
  /** rgt */
  rgt?: number;
  /** Old Parent */
  old_parent?: string;
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Warehouse Create Request
 * Fields required to create a new Warehouse
 */
export type WarehouseCreateRequest = Pick<Warehouse, "warehouse_name" | "company"> & Partial<Pick<Warehouse, "disabled" | "is_group" | "parent_warehouse" | "is_rejected_warehouse" | "account" | "address_html" | "contact_html" | "email_id" | "phone_no" | "mobile_no">>;

/**
 * Warehouse Update Request
 * All fields optional for update
 */
export type WarehouseUpdateRequest = Partial<Omit<Warehouse, "name" | "creation" | "owner" | "docstatus">>;

/**
 * UOM DocType
 * @doctype UOM
 * @generated 2025-12-30T16:02:53.865Z
 */
export interface Uom {
  /** Enabled */
  enabled?: 0 | 1;
  /** UOM Name */
  uom_name: string;
  /** Must be Whole Number - Check this to disallow fractions. (for Nos) */
  must_be_whole_number?: 0 | 1;
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * UOM Create Request
 * Fields required to create a new UOM
 */
export type UomCreateRequest = Pick<Uom, "uom_name"> & Partial<Pick<Uom, "enabled" | "must_be_whole_number">>;

/**
 * UOM Update Request
 * All fields optional for update
 */
export type UomUpdateRequest = Partial<Omit<Uom, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Territory DocType
 * @doctype Territory
 * @generated 2025-12-30T16:49:49.956Z
 */
export interface Territory {
  /** Territory Name */
  territory_name: string;
  /** Parent Territory */
  parent_territory?: string;
  /** Is Group - Only leaf nodes are allowed in transaction */
  is_group?: 0 | 1;
  /** Territory Manager - For reference */
  territory_manager?: string;
  /** lft */
  lft?: number;
  /** rgt */
  rgt?: number;
  /** old_parent */
  old_parent?: string;
  /** Targets */
  targets?: unknown[];
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Territory Create Request
 * Fields required to create a new Territory
 */
export type TerritoryCreateRequest = Pick<Territory, "territory_name"> & Partial<Pick<Territory, "parent_territory" | "is_group" | "territory_manager" | "lft" | "rgt" | "old_parent" | "targets">>;

/**
 * Territory Update Request
 * All fields optional for update
 */
export type TerritoryUpdateRequest = Partial<Omit<Territory, "name" | "creation" | "owner" | "docstatus">>;

/**
 * Salutation DocType
 * @doctype Salutation
 * @generated 2025-12-30T16:59:19.725Z
 */
export interface Salutation {
  /** Salutation */
  salutation?: string;
  /** ID */
  name: string;
  /** Owner */
  owner?: string;
  /** Created On */
  creation?: string;
  /** Modified On */
  modified?: string;
  /** Modified By */
  modified_by?: string;
  /** Document Status */
  docstatus?: 0 | 1 | 2;
}

/**
 * Salutation Update Request
 * All fields optional for update
 */
export type SalutationUpdateRequest = Partial<Omit<Salutation, "name" | "creation" | "owner" | "docstatus">>;
