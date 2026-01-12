// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated at: 2025-12-30T15:35:04.341Z
// Source: Frappe DocType Metadata API
// Script: scripts/generate-types.js

import { z } from "zod";

/**
 * Item Group Zod Schema
 * @doctype Item Group
 * @generated 2025-12-30T16:02:53.867Z
 */
export const ItemGroupSchema = z.object({
  item_group_name: z.string().min(1, "Item Group Name is required"),
  parent_item_group: z.string().optional(),
  is_group: z.union([z.literal(0), z.literal(1)]).optional(),
  image: z.string().optional(),
  item_group_defaults: z.array(z.unknown()).optional(),
  taxes: z.array(z.unknown()).optional(),
  lft: z.number().int().optional(),
  old_parent: z.string().optional(),
  rgt: z.number().int().optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const ItemGroupCreateSchema = ItemGroupSchema.pick({
  item_group_name: true,
}).extend({
  is_group: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const ItemGroupUpdateSchema = ItemGroupSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type ItemGroupSchemaType = z.infer<typeof ItemGroupSchema>;

/**
 * Lead Zod Schema
 * @doctype Lead
 * @generated 2025-12-30T16:02:53.867Z
 */
export const LeadSchema = z.object({
  naming_series: z.enum(["CRM-LEAD-.YYYY.-"]).optional(),
  salutation: z.string().optional(),
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  lead_name: z.string().optional(),
  job_title: z.string().optional(),
  gender: z.string().optional(),
  source: z.string().optional(),
  lead_owner: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  customer: z.string().optional(),
  type: z.enum(["Client", "Channel Partner", "Consultant"]).optional(),
  request_type: z.enum(["Product Enquiry", "Request for Information", "Suggestions", "Other"]).optional(),
  email_id: z.string().optional(),
  website: z.string().optional(),
  mobile_no: z.string().optional(),
  whatsapp_no: z.string().optional(),
  phone: z.string().optional(),
  phone_ext: z.string().optional(),
  company_name: z.string().optional(),
  no_of_employees: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]).optional(),
  annual_revenue: z.number().optional(),
  industry: z.string().optional(),
  market_segment: z.string().optional(),
  territory: z.string().optional(),
  fax: z.string().optional(),
  address_html: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  contact_html: z.string().optional(),
  qualification_status: z.enum(["Unqualified", "In Process", "Qualified"]).optional(),
  qualified_by: z.string().optional(),
  qualified_on: z.string().optional(),
  campaign_name: z.string().optional(),
  company: z.string().optional(),
  language: z.string().optional(),
  image: z.string().optional(),
  title: z.string().optional(),
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
  unsubscribed: z.union([z.literal(0), z.literal(1)]).optional(),
  blog_subscriber: z.union([z.literal(0), z.literal(1)]).optional(),
  open_activities_html: z.string().optional(),
  all_activities_html: z.string().optional(),
  notes_html: z.string().optional(),
  notes: z.array(z.unknown()).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const LeadCreateSchema = LeadSchema.pick({
  status: true,
}).extend({
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const LeadUpdateSchema = LeadSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type LeadSchemaType = z.infer<typeof LeadSchema>;

/**
 * Customer Group Zod Schema
 * @doctype Customer Group
 * @generated 2025-12-30T16:49:49.957Z
 */
export const CustomerGroupSchema = z.object({
  customer_group_name: z.string().min(1, "Customer Group Name is required"),
  parent_customer_group: z.string().optional(),
  is_group: z.union([z.literal(0), z.literal(1)]).optional(),
  default_price_list: z.string().optional(),
  payment_terms: z.string().optional(),
  lft: z.number().int().optional(),
  rgt: z.number().int().optional(),
  old_parent: z.string().optional(),
  accounts: z.array(z.unknown()).optional(),
  credit_limits: z.array(z.unknown()).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const CustomerGroupCreateSchema = CustomerGroupSchema.pick({
  customer_group_name: true,
}).extend({
  is_group: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const CustomerGroupUpdateSchema = CustomerGroupSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type CustomerGroupSchemaType = z.infer<typeof CustomerGroupSchema>;

/**
 * Address Zod Schema
 * @doctype Address
 * @generated 2025-12-30T16:02:53.867Z
 */
export const AddressSchema = z.object({
  address_title: z.string().optional(),
  address_type: z.string().min(1, "Address Type is required"),
  address_line1: z.string().min(1, "Address Line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City/Town is required"),
  county: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().optional(),
  email_id: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  is_primary_address: z.union([z.literal(0), z.literal(1)]).optional(),
  is_shipping_address: z.union([z.literal(0), z.literal(1)]).optional(),
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
  links: z.array(z.unknown()).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const AddressCreateSchema = AddressSchema.pick({
  address_type: true,
  address_line1: true,
  city: true,
  country: true,
}).extend({
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const AddressUpdateSchema = AddressSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type AddressSchemaType = z.infer<typeof AddressSchema>;

/**
 * Contact Zod Schema
 * @doctype Contact
 * @generated 2025-12-30T16:02:53.867Z
 */
export const ContactSchema = z.object({
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),
  email_id: z.string().optional(),
  user: z.string().optional(),
  address: z.string().optional(),
  sync_with_google_contacts: z.union([z.literal(0), z.literal(1)]).optional(),
  status: z.enum(["Passive", "Open", "Replied"]).optional(),
  salutation: z.string().optional(),
  designation: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  mobile_no: z.string().optional(),
  company_name: z.string().optional(),
  image: z.string().optional(),
  google_contacts: z.string().optional(),
  google_contacts_id: z.string().optional(),
  pulled_from_google_contacts: z.union([z.literal(0), z.literal(1)]).optional(),
  email_ids: z.array(z.unknown()).optional(),
  phone_nos: z.array(z.unknown()).optional(),
  links: z.array(z.unknown()).optional(),
  is_primary_contact: z.union([z.literal(0), z.literal(1)]).optional(),
  department: z.string().optional(),
  unsubscribed: z.union([z.literal(0), z.literal(1)]).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const ContactUpdateSchema = ContactSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type ContactSchemaType = z.infer<typeof ContactSchema>;

/**
 * Supplier Zod Schema
 * @doctype Supplier
 * @generated 2025-12-30T16:02:53.867Z
 */
export const SupplierSchema = z.object({
  naming_series: z.enum(["SUP-.YYYY.-"]).optional(),
  supplier_name: z.string().min(1, "Supplier Name is required"),
  country: z.string().optional(),
  supplier_group: z.string().optional(),
  supplier_type: z.string().min(1, "Supplier Type is required"),
  is_transporter: z.union([z.literal(0), z.literal(1)]).optional(),
  image: z.string().optional(),
  default_currency: z.string().optional(),
  default_bank_account: z.string().optional(),
  default_price_list: z.string().optional(),
  is_internal_supplier: z.union([z.literal(0), z.literal(1)]).optional(),
  represents_company: z.string().optional(),
  companies: z.array(z.unknown()).optional(),
  supplier_details: z.string().optional(),
  website: z.string().optional(),
  language: z.string().optional(),
  tax_id: z.string().optional(),
  tax_category: z.string().optional(),
  tax_withholding_category: z.string().optional(),
  address_html: z.string().optional(),
  contact_html: z.string().optional(),
  supplier_primary_address: z.string().optional(),
  primary_address: z.string().optional(),
  supplier_primary_contact: z.string().optional(),
  mobile_no: z.string().optional(),
  email_id: z.string().optional(),
  payment_terms: z.string().optional(),
  accounts: z.array(z.unknown()).optional(),
  allow_purchase_invoice_creation_without_purchase_order: z.union([z.literal(0), z.literal(1)]).optional(),
  allow_purchase_invoice_creation_without_purchase_receipt: z.union([z.literal(0), z.literal(1)]).optional(),
  is_frozen: z.union([z.literal(0), z.literal(1)]).optional(),
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
  warn_rfqs: z.union([z.literal(0), z.literal(1)]).optional(),
  warn_pos: z.union([z.literal(0), z.literal(1)]).optional(),
  prevent_rfqs: z.union([z.literal(0), z.literal(1)]).optional(),
  prevent_pos: z.union([z.literal(0), z.literal(1)]).optional(),
  on_hold: z.union([z.literal(0), z.literal(1)]).optional(),
  hold_type: z.enum(["All", "Invoices", "Payments"]).optional(),
  release_date: z.string().optional(),
  portal_users: z.array(z.unknown()).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const SupplierCreateSchema = SupplierSchema.pick({
  supplier_name: true,
  supplier_type: true,
}).extend({
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const SupplierUpdateSchema = SupplierSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type SupplierSchemaType = z.infer<typeof SupplierSchema>;

/**
 * Sales Order Zod Schema
 * @doctype Sales Order
 * @generated 2025-12-30T16:02:53.867Z
 */
export const SalesOrderSchema = z.object({
  title: z.string().optional(),
  naming_series: z.string().min(1, "Series is required"),
  customer: z.string().min(1, "Customer is required"),
  customer_name: z.string().optional(),
  tax_id: z.string().optional(),
  order_type: z.string().min(1, "Order Type is required"),
  transaction_date: z.string().min(1, "Date is required"),
  delivery_date: z.string().optional(),
  po_no: z.string().optional(),
  po_date: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  skip_delivery_note: z.union([z.literal(0), z.literal(1)]).optional(),
  has_unit_price_items: z.union([z.literal(0), z.literal(1)]).optional(),
  amended_from: z.string().optional(),
  cost_center: z.string().optional(),
  project: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  conversion_rate: z.number(),
  selling_price_list: z.string().min(1, "Price List is required"),
  price_list_currency: z.string().min(1, "Price List Currency is required"),
  plc_conversion_rate: z.number(),
  ignore_pricing_rule: z.union([z.literal(0), z.literal(1)]).optional(),
  scan_barcode: z.string().optional(),
  last_scanned_warehouse: z.string().optional(),
  set_warehouse: z.string().optional(),
  reserve_stock: z.union([z.literal(0), z.literal(1)]).optional(),
  items: z.array(z.unknown()),
  total_qty: z.number().optional(),
  total_net_weight: z.number().optional(),
  base_total: z.number().optional(),
  base_net_total: z.number().optional(),
  total: z.number().optional(),
  net_total: z.number().optional(),
  tax_category: z.string().optional(),
  taxes_and_charges: z.string().optional(),
  shipping_rule: z.string().optional(),
  incoterm: z.string().optional(),
  named_place: z.string().optional(),
  taxes: z.array(z.unknown()).optional(),
  base_total_taxes_and_charges: z.number().optional(),
  total_taxes_and_charges: z.number().optional(),
  base_grand_total: z.number().optional(),
  base_rounding_adjustment: z.number().optional(),
  base_rounded_total: z.number().optional(),
  base_in_words: z.string().optional(),
  grand_total: z.number().optional(),
  rounding_adjustment: z.number().optional(),
  rounded_total: z.number().optional(),
  in_words: z.string().optional(),
  advance_paid: z.number().optional(),
  disable_rounded_total: z.union([z.literal(0), z.literal(1)]).optional(),
  apply_discount_on: z.enum(["Grand Total", "Net Total"]).optional(),
  base_discount_amount: z.number().optional(),
  coupon_code: z.string().optional(),
  additional_discount_percentage: z.number().optional(),
  discount_amount: z.number().optional(),
  other_charges_calculation: z.string().optional(),
  packed_items: z.array(z.unknown()).optional(),
  pricing_rules: z.array(z.unknown()).optional(),
  customer_address: z.string().optional(),
  address_display: z.string().optional(),
  customer_group: z.string().optional(),
  territory: z.string().optional(),
  contact_person: z.string().optional(),
  contact_display: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_mobile: z.string().optional(),
  contact_email: z.string().optional(),
  shipping_address_name: z.string().optional(),
  shipping_address: z.string().optional(),
  dispatch_address_name: z.string().optional(),
  dispatch_address: z.string().optional(),
  company_address: z.string().optional(),
  company_address_display: z.string().optional(),
  company_contact_person: z.string().optional(),
  payment_terms_template: z.string().optional(),
  payment_schedule: z.array(z.unknown()).optional(),
  tc_name: z.string().optional(),
  terms: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  delivery_status: z.enum(["Not Delivered", "Fully Delivered", "Partly Delivered", "Closed", "Not Applicable"]).optional(),
  per_delivered: z.number().optional(),
  per_billed: z.number().optional(),
  per_picked: z.number().optional(),
  billing_status: z.enum(["Not Billed", "Fully Billed", "Partly Billed", "Closed"]).optional(),
  sales_partner: z.string().optional(),
  amount_eligible_for_commission: z.number().optional(),
  commission_rate: z.number().optional(),
  total_commission: z.number().optional(),
  sales_team: z.array(z.unknown()).optional(),
  loyalty_points: z.number().int().optional(),
  loyalty_amount: z.number().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  auto_repeat: z.string().optional(),
  update_auto_repeat_reference: z.unknown().optional(),
  letter_head: z.string().optional(),
  group_same_items: z.union([z.literal(0), z.literal(1)]).optional(),
  select_print_heading: z.string().optional(),
  language: z.string().optional(),
  is_internal_customer: z.union([z.literal(0), z.literal(1)]).optional(),
  represents_company: z.string().optional(),
  source: z.string().optional(),
  inter_company_order_reference: z.string().optional(),
  campaign: z.string().optional(),
  party_account_currency: z.string().optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const SalesOrderCreateSchema = SalesOrderSchema.pick({
  naming_series: true,
  customer: true,
  order_type: true,
  transaction_date: true,
  company: true,
  currency: true,
  conversion_rate: true,
  selling_price_list: true,
  price_list_currency: true,
  plc_conversion_rate: true,
  items: true,
  status: true,
}).extend({
});

export const SalesOrderUpdateSchema = SalesOrderSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type SalesOrderSchemaType = z.infer<typeof SalesOrderSchema>;

/**
 * Purchase Receipt Zod Schema
 * @doctype Purchase Receipt
 * @generated 2025-12-30T16:02:53.868Z
 */
export const PurchaseReceiptSchema = z.object({
  title: z.string().optional(),
  naming_series: z.string().min(1, "Series is required"),
  supplier: z.string().min(1, "Supplier is required"),
  supplier_name: z.string().optional(),
  supplier_delivery_note: z.string().optional(),
  subcontracting_receipt: z.string().optional(),
  posting_date: z.string().min(1, "Date is required"),
  posting_time: z.string().min(1, "Posting Time is required"),
  set_posting_time: z.union([z.literal(0), z.literal(1)]).optional(),
  company: z.string().min(1, "Company is required"),
  apply_putaway_rule: z.union([z.literal(0), z.literal(1)]).optional(),
  is_return: z.union([z.literal(0), z.literal(1)]).optional(),
  return_against: z.string().optional(),
  cost_center: z.string().optional(),
  project: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  conversion_rate: z.number(),
  buying_price_list: z.string().optional(),
  price_list_currency: z.string().optional(),
  plc_conversion_rate: z.number().optional(),
  ignore_pricing_rule: z.union([z.literal(0), z.literal(1)]).optional(),
  scan_barcode: z.string().optional(),
  last_scanned_warehouse: z.string().optional(),
  set_warehouse: z.string().optional(),
  set_from_warehouse: z.string().optional(),
  rejected_warehouse: z.string().optional(),
  is_subcontracted: z.union([z.literal(0), z.literal(1)]).optional(),
  supplier_warehouse: z.string().optional(),
  items: z.array(z.unknown()),
  total_qty: z.number().optional(),
  total_net_weight: z.number().optional(),
  base_total: z.number().optional(),
  base_net_total: z.number(),
  total: z.number().optional(),
  net_total: z.number().optional(),
  tax_withholding_net_total: z.number().optional(),
  base_tax_withholding_net_total: z.number().optional(),
  tax_category: z.string().optional(),
  taxes_and_charges: z.string().optional(),
  shipping_rule: z.string().optional(),
  incoterm: z.string().optional(),
  named_place: z.string().optional(),
  taxes: z.array(z.unknown()).optional(),
  base_taxes_and_charges_added: z.number().optional(),
  base_taxes_and_charges_deducted: z.number().optional(),
  base_total_taxes_and_charges: z.number().optional(),
  taxes_and_charges_added: z.number().optional(),
  taxes_and_charges_deducted: z.number().optional(),
  total_taxes_and_charges: z.number().optional(),
  base_grand_total: z.number().optional(),
  base_rounding_adjustment: z.number().optional(),
  base_rounded_total: z.number().optional(),
  base_in_words: z.string().optional(),
  grand_total: z.number().optional(),
  rounding_adjustment: z.number().optional(),
  rounded_total: z.number().optional(),
  in_words: z.string().optional(),
  disable_rounded_total: z.union([z.literal(0), z.literal(1)]).optional(),
  apply_discount_on: z.enum(["Grand Total", "Net Total"]).optional(),
  base_discount_amount: z.number().optional(),
  additional_discount_percentage: z.number().optional(),
  discount_amount: z.number().optional(),
  other_charges_calculation: z.string().optional(),
  pricing_rules: z.array(z.unknown()).optional(),
  get_current_stock: z.unknown().optional(),
  supplied_items: z.array(z.unknown()).optional(),
  supplier_address: z.string().optional(),
  address_display: z.string().optional(),
  contact_person: z.string().optional(),
  contact_display: z.string().optional(),
  contact_mobile: z.string().optional(),
  contact_email: z.string().optional(),
  dispatch_address: z.string().optional(),
  dispatch_address_display: z.string().optional(),
  shipping_address: z.string().optional(),
  shipping_address_display: z.string().optional(),
  billing_address: z.string().optional(),
  billing_address_display: z.string().optional(),
  tc_name: z.string().optional(),
  terms: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  per_billed: z.number().optional(),
  per_returned: z.number().optional(),
  auto_repeat: z.string().optional(),
  letter_head: z.string().optional(),
  group_same_items: z.union([z.literal(0), z.literal(1)]).optional(),
  select_print_heading: z.string().optional(),
  language: z.string().optional(),
  transporter_name: z.string().optional(),
  lr_no: z.string().optional(),
  lr_date: z.string().optional(),
  instructions: z.string().optional(),
  is_internal_supplier: z.union([z.literal(0), z.literal(1)]).optional(),
  represents_company: z.string().optional(),
  inter_company_reference: z.string().optional(),
  remarks: z.string().optional(),
  range: z.string().optional(),
  amended_from: z.string().optional(),
  is_old_subcontracting_flow: z.union([z.literal(0), z.literal(1)]).optional(),
  other_details: z.string().optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const PurchaseReceiptCreateSchema = PurchaseReceiptSchema.pick({
  naming_series: true,
  supplier: true,
  posting_date: true,
  posting_time: true,
  company: true,
  currency: true,
  conversion_rate: true,
  items: true,
  base_net_total: true,
  status: true,
}).extend({
});

export const PurchaseReceiptUpdateSchema = PurchaseReceiptSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type PurchaseReceiptSchemaType = z.infer<typeof PurchaseReceiptSchema>;

/**
 * Stock Entry Zod Schema
 * @doctype Stock Entry
 * @generated 2025-12-30T16:02:53.867Z
 */
export const StockEntrySchema = z.object({
  naming_series: z.string().min(1, "Series is required"),
  stock_entry_type: z.string().min(1, "Stock Entry Type is required"),
  outgoing_stock_entry: z.string().optional(),
  purpose: z.enum(["Material Issue", "Material Receipt", "Material Transfer", "Material Transfer for Manufacture", "Material Consumption for Manufacture", "Manufacture", "Repack", "Send to Subcontractor", "Disassemble"]).optional(),
  add_to_transit: z.union([z.literal(0), z.literal(1)]).optional(),
  work_order: z.string().optional(),
  purchase_order: z.string().optional(),
  subcontracting_order: z.string().optional(),
  delivery_note_no: z.string().optional(),
  sales_invoice_no: z.string().optional(),
  pick_list: z.string().optional(),
  purchase_receipt_no: z.string().optional(),
  asset_repair: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  posting_date: z.string().optional(),
  posting_time: z.string().optional(),
  set_posting_time: z.union([z.literal(0), z.literal(1)]).optional(),
  inspection_required: z.union([z.literal(0), z.literal(1)]).optional(),
  apply_putaway_rule: z.union([z.literal(0), z.literal(1)]).optional(),
  from_bom: z.union([z.literal(0), z.literal(1)]).optional(),
  use_multi_level_bom: z.union([z.literal(0), z.literal(1)]).optional(),
  bom_no: z.string().optional(),
  fg_completed_qty: z.number().optional(),
  get_items: z.unknown().optional(),
  process_loss_percentage: z.number().optional(),
  process_loss_qty: z.number().optional(),
  from_warehouse: z.string().optional(),
  source_warehouse_address: z.string().optional(),
  source_address_display: z.string().optional(),
  to_warehouse: z.string().optional(),
  target_warehouse_address: z.string().optional(),
  target_address_display: z.string().optional(),
  scan_barcode: z.string().optional(),
  last_scanned_warehouse: z.string().optional(),
  items: z.array(z.unknown()),
  get_stock_and_rate: z.unknown().optional(),
  total_outgoing_value: z.number().optional(),
  total_incoming_value: z.number().optional(),
  value_difference: z.number().optional(),
  additional_costs: z.array(z.unknown()).optional(),
  total_additional_costs: z.number().optional(),
  supplier: z.string().optional(),
  supplier_name: z.string().optional(),
  supplier_address: z.string().optional(),
  address_display: z.string().optional(),
  project: z.string().optional(),
  select_print_heading: z.string().optional(),
  letter_head: z.string().optional(),
  is_opening: z.enum(["No", "Yes"]).optional(),
  remarks: z.string().optional(),
  per_transferred: z.number().optional(),
  total_amount: z.number().optional(),
  job_card: z.string().optional(),
  amended_from: z.string().optional(),
  credit_note: z.string().optional(),
  is_return: z.union([z.literal(0), z.literal(1)]).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const StockEntryCreateSchema = StockEntrySchema.pick({
  naming_series: true,
  stock_entry_type: true,
  company: true,
  items: true,
}).extend({
});

export const StockEntryUpdateSchema = StockEntrySchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type StockEntrySchemaType = z.infer<typeof StockEntrySchema>;

/**
 * Delivery Note Zod Schema
 * @doctype Delivery Note
 * @generated 2025-12-30T16:02:53.867Z
 */
export const DeliveryNoteSchema = z.object({
  title: z.string().optional(),
  naming_series: z.string().min(1, "Series is required"),
  customer: z.string().min(1, "Customer is required"),
  tax_id: z.string().optional(),
  customer_name: z.string().optional(),
  posting_date: z.string().min(1, "Date is required"),
  posting_time: z.string().min(1, "Posting Time is required"),
  set_posting_time: z.union([z.literal(0), z.literal(1)]).optional(),
  company: z.string().min(1, "Company is required"),
  amended_from: z.string().optional(),
  is_return: z.union([z.literal(0), z.literal(1)]).optional(),
  issue_credit_note: z.union([z.literal(0), z.literal(1)]).optional(),
  return_against: z.string().optional(),
  cost_center: z.string().optional(),
  project: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  conversion_rate: z.number(),
  selling_price_list: z.string().min(1, "Price List is required"),
  price_list_currency: z.string().min(1, "Price List Currency is required"),
  plc_conversion_rate: z.number(),
  ignore_pricing_rule: z.union([z.literal(0), z.literal(1)]).optional(),
  scan_barcode: z.string().optional(),
  last_scanned_warehouse: z.string().optional(),
  set_warehouse: z.string().optional(),
  set_target_warehouse: z.string().optional(),
  items: z.array(z.unknown()),
  total_qty: z.number().optional(),
  total_net_weight: z.number().optional(),
  base_total: z.number().optional(),
  base_net_total: z.number().optional(),
  total: z.number().optional(),
  net_total: z.number().optional(),
  tax_category: z.string().optional(),
  taxes_and_charges: z.string().optional(),
  shipping_rule: z.string().optional(),
  incoterm: z.string().optional(),
  named_place: z.string().optional(),
  taxes: z.array(z.unknown()).optional(),
  base_total_taxes_and_charges: z.number().optional(),
  total_taxes_and_charges: z.number().optional(),
  base_grand_total: z.number().optional(),
  base_rounding_adjustment: z.number().optional(),
  base_rounded_total: z.number().optional(),
  base_in_words: z.string().optional(),
  grand_total: z.number().optional(),
  rounding_adjustment: z.number().optional(),
  rounded_total: z.number().optional(),
  in_words: z.string().optional(),
  disable_rounded_total: z.union([z.literal(0), z.literal(1)]).optional(),
  apply_discount_on: z.enum(["Grand Total", "Net Total"]).optional(),
  base_discount_amount: z.number().optional(),
  additional_discount_percentage: z.number().optional(),
  discount_amount: z.number().optional(),
  other_charges_calculation: z.string().optional(),
  packed_items: z.array(z.unknown()).optional(),
  product_bundle_help: z.string().optional(),
  pricing_rules: z.array(z.unknown()).optional(),
  customer_address: z.string().optional(),
  address_display: z.string().optional(),
  contact_person: z.string().optional(),
  contact_display: z.string().optional(),
  contact_mobile: z.string().optional(),
  contact_email: z.string().optional(),
  shipping_address_name: z.string().optional(),
  shipping_address: z.string().optional(),
  dispatch_address_name: z.string().optional(),
  dispatch_address: z.string().optional(),
  company_address: z.string().optional(),
  company_address_display: z.string().optional(),
  company_contact_person: z.string().optional(),
  tc_name: z.string().optional(),
  terms: z.string().optional(),
  per_billed: z.number().optional(),
  status: z.string().min(1, "Status is required"),
  per_installed: z.number().optional(),
  installation_status: z.string().optional(),
  per_returned: z.number().optional(),
  transporter: z.string().optional(),
  driver: z.string().optional(),
  lr_no: z.string().optional(),
  vehicle_no: z.string().optional(),
  transporter_name: z.string().optional(),
  driver_name: z.string().optional(),
  lr_date: z.string().optional(),
  po_no: z.string().optional(),
  po_date: z.string().optional(),
  sales_partner: z.string().optional(),
  amount_eligible_for_commission: z.number().optional(),
  commission_rate: z.number().optional(),
  total_commission: z.number().optional(),
  sales_team: z.array(z.unknown()).optional(),
  auto_repeat: z.string().optional(),
  letter_head: z.string().optional(),
  print_without_amount: z.union([z.literal(0), z.literal(1)]).optional(),
  group_same_items: z.union([z.literal(0), z.literal(1)]).optional(),
  select_print_heading: z.string().optional(),
  language: z.string().optional(),
  is_internal_customer: z.union([z.literal(0), z.literal(1)]).optional(),
  represents_company: z.string().optional(),
  inter_company_reference: z.string().optional(),
  customer_group: z.string().optional(),
  territory: z.string().optional(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  excise_page: z.string().optional(),
  instructions: z.string().optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const DeliveryNoteCreateSchema = DeliveryNoteSchema.pick({
  naming_series: true,
  customer: true,
  posting_date: true,
  posting_time: true,
  company: true,
  currency: true,
  conversion_rate: true,
  selling_price_list: true,
  price_list_currency: true,
  plc_conversion_rate: true,
  items: true,
  status: true,
}).extend({
});

export const DeliveryNoteUpdateSchema = DeliveryNoteSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type DeliveryNoteSchemaType = z.infer<typeof DeliveryNoteSchema>;

/**
 * Warehouse Zod Schema
 * @doctype Warehouse
 * @generated 2025-12-30T16:02:53.868Z
 */
export const WarehouseSchema = z.object({
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
  warehouse_name: z.string().min(1, "Warehouse Name is required"),
  is_group: z.union([z.literal(0), z.literal(1)]).optional(),
  parent_warehouse: z.string().optional(),
  is_rejected_warehouse: z.union([z.literal(0), z.literal(1)]).optional(),
  account: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  address_html: z.string().optional(),
  contact_html: z.string().optional(),
  email_id: z.string().optional(),
  phone_no: z.string().optional(),
  mobile_no: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pin: z.string().optional(),
  warehouse_type: z.string().optional(),
  default_in_transit_warehouse: z.string().optional(),
  lft: z.number().int().optional(),
  rgt: z.number().int().optional(),
  old_parent: z.string().optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const WarehouseCreateSchema = WarehouseSchema.pick({
  warehouse_name: true,
  company: true,
}).extend({
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
  is_group: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const WarehouseUpdateSchema = WarehouseSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type WarehouseSchemaType = z.infer<typeof WarehouseSchema>;

/**
 * UOM Zod Schema
 * @doctype UOM
 * @generated 2025-12-30T16:02:53.868Z
 */
export const UomSchema = z.object({
  enabled: z.union([z.literal(0), z.literal(1)]).optional(),
  uom_name: z.string().min(1, "UOM Name is required"),
  must_be_whole_number: z.union([z.literal(0), z.literal(1)]).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const UomCreateSchema = UomSchema.pick({
  uom_name: true,
}).extend({
});

export const UomUpdateSchema = UomSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type UomSchemaType = z.infer<typeof UomSchema>;

/**
 * Territory Zod Schema
 * @doctype Territory
 * @generated 2025-12-30T16:49:49.957Z
 */
export const TerritorySchema = z.object({
  territory_name: z.string().min(1, "Territory Name is required"),
  parent_territory: z.string().optional(),
  is_group: z.union([z.literal(0), z.literal(1)]).optional(),
  territory_manager: z.string().optional(),
  lft: z.number().int().optional(),
  rgt: z.number().int().optional(),
  old_parent: z.string().optional(),
  targets: z.array(z.unknown()).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const TerritoryCreateSchema = TerritorySchema.pick({
  territory_name: true,
}).extend({
  is_group: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const TerritoryUpdateSchema = TerritorySchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type TerritorySchemaType = z.infer<typeof TerritorySchema>;

/**
 * Salutation Zod Schema
 * @doctype Salutation
 * @generated 2025-12-30T16:59:19.734Z
 */
export const SalutationSchema = z.object({
  salutation: z.string().optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const SalutationUpdateSchema = SalutationSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type SalutationSchemaType = z.infer<typeof SalutationSchema>;
