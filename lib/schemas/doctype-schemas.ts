// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated at: 2025-12-30T15:35:04.341Z
// Source: Frappe DocType Metadata API
// Script: scripts/generate-types.js

import { z } from "zod";

/**
 * Item Zod Schema
 * @doctype Item
 * @generated 2026-01-12T20:21:37.953Z
 */
export const ItemSchema = z.object({
  naming_series: z.enum(["STO-ITEM-.YYYY.-"]).optional(),
  item_code: z.string().min(1, "Item Code is required"),
  item_name: z.string().optional(),
  item_group: z.string().min(1, "Item Group is required"),
  stock_uom: z.string().min(1, "Default Unit of Measure is required"),
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
  allow_alternative_item: z.union([z.literal(0), z.literal(1)]).optional(),
  is_stock_item: z.union([z.literal(0), z.literal(1)]).optional(),
  has_variants: z.union([z.literal(0), z.literal(1)]).optional(),
  opening_stock: z.number().optional(),
  valuation_rate: z.number().optional(),
  standard_rate: z.number().optional(),
  is_fixed_asset: z.union([z.literal(0), z.literal(1)]).optional(),
  auto_create_assets: z.union([z.literal(0), z.literal(1)]).optional(),
  is_grouped_asset: z.union([z.literal(0), z.literal(1)]).optional(),
  asset_category: z.string().optional(),
  asset_naming_series: z.string().optional(),
  over_delivery_receipt_allowance: z.number().optional(),
  over_billing_allowance: z.number().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  uoms: z.array(z.unknown()).optional(),
  shelf_life_in_days: z.number().int().optional(),
  end_of_life: z.string().optional(),
  default_material_request_type: z
    .enum([
      "Purchase",
      "Material Transfer",
      "Material Issue",
      "Manufacture",
      "Customer Provided",
    ])
    .optional(),
  valuation_method: z.enum(["FIFO", "Moving Average", "LIFO"]).optional(),
  warranty_period: z.string().optional(),
  weight_per_unit: z.number().optional(),
  weight_uom: z.string().optional(),
  allow_negative_stock: z.union([z.literal(0), z.literal(1)]).optional(),
  barcodes: z.array(z.unknown()).optional(),
  reorder_levels: z.array(z.unknown()).optional(),
  has_batch_no: z.union([z.literal(0), z.literal(1)]).optional(),
  create_new_batch: z.union([z.literal(0), z.literal(1)]).optional(),
  batch_number_series: z.string().optional(),
  has_expiry_date: z.union([z.literal(0), z.literal(1)]).optional(),
  retain_sample: z.union([z.literal(0), z.literal(1)]).optional(),
  sample_quantity: z.number().int().optional(),
  has_serial_no: z.union([z.literal(0), z.literal(1)]).optional(),
  serial_no_series: z.string().optional(),
  variant_of: z.string().optional(),
  variant_based_on: z.enum(["Item Attribute", "Manufacturer"]).optional(),
  attributes: z.array(z.unknown()).optional(),
  enable_deferred_expense: z.union([z.literal(0), z.literal(1)]).optional(),
  no_of_months_exp: z.number().int().optional(),
  enable_deferred_revenue: z.union([z.literal(0), z.literal(1)]).optional(),
  no_of_months: z.number().int().optional(),
  item_defaults: z.array(z.unknown()).optional(),
  purchase_uom: z.string().optional(),
  min_order_qty: z.number().optional(),
  safety_stock: z.number().optional(),
  is_purchase_item: z.union([z.literal(0), z.literal(1)]).optional(),
  lead_time_days: z.number().int().optional(),
  last_purchase_rate: z.number().optional(),
  is_customer_provided_item: z.union([z.literal(0), z.literal(1)]).optional(),
  customer: z.string().optional(),
  delivered_by_supplier: z.union([z.literal(0), z.literal(1)]).optional(),
  supplier_items: z.array(z.unknown()).optional(),
  country_of_origin: z.string().optional(),
  customs_tariff_number: z.string().optional(),
  sales_uom: z.string().optional(),
  grant_commission: z.union([z.literal(0), z.literal(1)]).optional(),
  is_sales_item: z.union([z.literal(0), z.literal(1)]).optional(),
  max_discount: z.number().optional(),
  customer_items: z.array(z.unknown()).optional(),
  taxes: z.array(z.unknown()).optional(),
  inspection_required_before_purchase: z
    .union([z.literal(0), z.literal(1)])
    .optional(),
  quality_inspection_template: z.string().optional(),
  inspection_required_before_delivery: z
    .union([z.literal(0), z.literal(1)])
    .optional(),
  include_item_in_manufacturing: z
    .union([z.literal(0), z.literal(1)])
    .optional(),
  is_sub_contracted_item: z.union([z.literal(0), z.literal(1)]).optional(),
  default_bom: z.string().optional(),
  customer_code: z.string().optional(),
  default_item_manufacturer: z.string().optional(),
  default_manufacturer_part_no: z.string().optional(),
  total_projected_qty: z.number().optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const ItemCreateSchema = ItemSchema.pick({
  item_code: true,
  item_group: true,
  stock_uom: true,
}).extend({
  description: z.string().optional(),
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const ItemUpdateSchema = ItemSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type ItemSchemaType = z.infer<typeof ItemSchema>;

/**
 * Lead Zod Schema
 * @doctype Lead
 * @generated 2026-01-12T20:21:37.953Z
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
  request_type: z
    .enum([
      "Product Enquiry",
      "Request for Information",
      "Suggestions",
      "Other",
    ])
    .optional(),
  email_id: z.string().optional(),
  website: z.string().optional(),
  mobile_no: z.string().optional(),
  whatsapp_no: z.string().optional(),
  phone: z.string().optional(),
  phone_ext: z.string().optional(),
  company_name: z.string().optional(),
  no_of_employees: z
    .enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"])
    .optional(),
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
  qualification_status: z
    .enum(["Unqualified", "In Process", "Qualified"])
    .optional(),
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
  first_name: true,
  last_name: true,
  lead_name: true,
  company_name: true,
  email_id: true,
  mobile_no: true,
  phone: true,
  status: true,
  source: true,
  territory: true,
  industry: true,
  type: true,
  request_type: true,
})
  .extend({
    disabled: z.union([z.literal(0), z.literal(1)]).optional(),
  })
  .refine(
    (data) => {
      const hasPersonName =
        (data.first_name?.trim() || "") !== "" ||
        (data.lead_name?.trim() || "") !== "";
      const hasOrgName = (data.company_name?.trim() || "") !== "";
      return hasPersonName || hasOrgName;
    },
    {
      message: "At least First Name or Company Name is required",
      path: ["first_name"], // Highlight first_name as the primary field
    }
  );

export const LeadUpdateSchema = LeadSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type LeadSchemaType = z.infer<typeof LeadSchema>;
export type LeadFormData = z.infer<typeof LeadCreateSchema>;

/**
 * Customer Group Zod Schema
 * @doctype Customer Group
 * @generated 2026-01-12T20:21:37.953Z
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
 * @generated 2026-01-12T20:21:37.953Z
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

// Address schemas moved to the end of the file for customization

/**
 * Contact Zod Schema
 * @doctype Contact
 * @generated 2026-01-12T20:21:37.953Z
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
 * @generated 2026-01-12T20:21:37.953Z
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
  allow_purchase_invoice_creation_without_purchase_order: z
    .union([z.literal(0), z.literal(1)])
    .optional(),
  allow_purchase_invoice_creation_without_purchase_receipt: z
    .union([z.literal(0), z.literal(1)])
    .optional(),
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
 * @generated 2026-01-12T20:21:37.953Z
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
  delivery_status: z
    .enum([
      "Not Delivered",
      "Fully Delivered",
      "Partly Delivered",
      "Closed",
      "Not Applicable",
    ])
    .optional(),
  per_delivered: z.number().optional(),
  per_billed: z.number().optional(),
  per_picked: z.number().optional(),
  billing_status: z
    .enum(["Not Billed", "Fully Billed", "Partly Billed", "Closed"])
    .optional(),
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
}).extend({});

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
 * @generated 2026-01-12T20:21:37.953Z
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
}).extend({});

export const PurchaseReceiptUpdateSchema = PurchaseReceiptSchema.partial().omit(
  {
    name: true,
    creation: true,
    owner: true,
    docstatus: true,
  }
);

export type PurchaseReceiptSchemaType = z.infer<typeof PurchaseReceiptSchema>;

/**
 * Stock Entry Zod Schema
 * @doctype Stock Entry
 * @generated 2026-01-12T20:21:37.953Z
 */
export const StockEntrySchema = z.object({
  naming_series: z.string().min(1, "Series is required"),
  stock_entry_type: z.string().min(1, "Stock Entry Type is required"),
  outgoing_stock_entry: z.string().optional(),
  purpose: z
    .enum([
      "Material Issue",
      "Material Receipt",
      "Material Transfer",
      "Material Transfer for Manufacture",
      "Material Consumption for Manufacture",
      "Manufacture",
      "Repack",
      "Send to Subcontractor",
      "Disassemble",
    ])
    .optional(),
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
}).extend({});

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
 * @generated 2026-01-12T20:21:37.953Z
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
}).extend({});

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
 * @generated 2026-01-12T20:21:37.953Z
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
 * @generated 2026-01-12T20:21:37.953Z
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
}).extend({});

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
 * @generated 2026-01-12T20:21:37.953Z
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
 * @generated 2026-01-12T20:21:37.953Z
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

/**
 * Item Group Zod Schema
 * @doctype Item Group
 * @generated 2026-01-12T20:21:37.953Z
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
 * Customer Zod Schema
 * @doctype Customer
 * @generated 2026-01-12T20:21:37.953Z
 */
export const CustomerSchema = z.object({
  naming_series: z.enum(["CUST-.YYYY.-"]).optional(),
  salutation: z.string().optional(),
  customer_name: z.string().min(1, "Customer Name is required"),
  customer_type: z.string().min(1, "Customer Type is required"),
  customer_group: z.string().optional(),
  territory: z.string().optional(),
  gender: z.string().optional(),
  lead_name: z.string().optional(),
  opportunity_name: z.string().optional(),
  prospect_name: z.string().optional(),
  account_manager: z.string().optional(),
  image: z.string().optional(),
  default_currency: z.string().optional(),
  default_bank_account: z.string().optional(),
  default_price_list: z.string().optional(),
  is_internal_customer: z.union([z.literal(0), z.literal(1)]).optional(),
  represents_company: z.string().optional(),
  companies: z.array(z.unknown()).optional(),
  market_segment: z.string().optional(),
  industry: z.string().optional(),
  customer_pos_id: z.string().optional(),
  website: z.string().optional(),
  language: z.string().optional(),
  customer_details: z.string().optional(),
  address_html: z.string().optional(),
  contact_html: z.string().optional(),
  customer_primary_address: z.string().optional(),
  primary_address: z.string().optional(),
  customer_primary_contact: z.string().optional(),
  mobile_no: z.string().optional(),
  email_id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  tax_id: z.string().optional(),
  tax_category: z.string().optional(),
  tax_withholding_category: z.string().optional(),
  payment_terms: z.string().optional(),
  credit_limits: z.array(z.unknown()).optional(),
  accounts: z.array(z.unknown()).optional(),
  loyalty_program: z.string().optional(),
  loyalty_program_tier: z.string().optional(),
  sales_team: z.array(z.unknown()).optional(),
  default_sales_partner: z.string().optional(),
  default_commission_rate: z.number().optional(),
  so_required: z.union([z.literal(0), z.literal(1)]).optional(),
  dn_required: z.union([z.literal(0), z.literal(1)]).optional(),
  is_frozen: z.union([z.literal(0), z.literal(1)]).optional(),
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
  portal_users: z.array(z.unknown()).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const CustomerCreateSchema = CustomerSchema.pick({
  customer_name: true,
  customer_type: true,
}).extend({
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const CustomerUpdateSchema = CustomerSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type CustomerSchemaType = z.infer<typeof CustomerSchema>;

/**
 * Purchase Order Zod Schema
 * @doctype Purchase Order
 * @generated 2026-01-12T20:21:37.953Z
 */
export const PurchaseOrderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  naming_series: z.string().min(1, "Series is required"),
  supplier: z.string().min(1, "Supplier is required"),
  supplier_name: z.string().optional(),
  order_confirmation_no: z.string().optional(),
  order_confirmation_date: z.string().optional(),
  get_items_from_open_material_requests: z.unknown().optional(),
  transaction_date: z.string().min(1, "Date is required"),
  schedule_date: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  apply_tds: z.union([z.literal(0), z.literal(1)]).optional(),
  tax_withholding_category: z.string().optional(),
  is_subcontracted: z.union([z.literal(0), z.literal(1)]).optional(),
  has_unit_price_items: z.union([z.literal(0), z.literal(1)]).optional(),
  supplier_warehouse: z.string().optional(),
  amended_from: z.string().optional(),
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
  set_from_warehouse: z.string().optional(),
  set_warehouse: z.string().optional(),
  items: z.array(z.unknown()),
  total_qty: z.number().optional(),
  total_net_weight: z.number().optional(),
  base_total: z.number().optional(),
  base_net_total: z.number().optional(),
  total: z.number().optional(),
  net_total: z.number().optional(),
  tax_withholding_net_total: z.number().optional(),
  base_tax_withholding_net_total: z.number().optional(),
  pricing_rules: z.array(z.unknown()).optional(),
  set_reserve_warehouse: z.string().optional(),
  supplied_items: z.array(z.unknown()).optional(),
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
  base_in_words: z.string().optional(),
  base_rounded_total: z.number().optional(),
  grand_total: z.number().optional(),
  rounding_adjustment: z.number().optional(),
  rounded_total: z.number().optional(),
  disable_rounded_total: z.union([z.literal(0), z.literal(1)]).optional(),
  in_words: z.string().optional(),
  advance_paid: z.number().optional(),
  apply_discount_on: z.enum(["Grand Total", "Net Total"]).optional(),
  base_discount_amount: z.number().optional(),
  additional_discount_percentage: z.number().optional(),
  discount_amount: z.number().optional(),
  other_charges_calculation: z.string().optional(),
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
  customer: z.string().optional(),
  customer_name: z.string().optional(),
  customer_contact_person: z.string().optional(),
  customer_contact_display: z.string().optional(),
  customer_contact_mobile: z.string().optional(),
  customer_contact_email: z.string().optional(),
  payment_terms_template: z.string().optional(),
  payment_schedule: z.array(z.unknown()).optional(),
  tc_name: z.string().optional(),
  terms: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  per_billed: z.number().optional(),
  per_received: z.number().optional(),
  letter_head: z.string().optional(),
  group_same_items: z.union([z.literal(0), z.literal(1)]).optional(),
  select_print_heading: z.string().optional(),
  language: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  auto_repeat: z.string().optional(),
  update_auto_repeat_reference: z.unknown().optional(),
  is_internal_supplier: z.union([z.literal(0), z.literal(1)]).optional(),
  represents_company: z.string().optional(),
  ref_sq: z.string().optional(),
  party_account_currency: z.string().optional(),
  inter_company_order_reference: z.string().optional(),
  is_old_subcontracting_flow: z.union([z.literal(0), z.literal(1)]).optional(),
  name: z.string().min(1, "ID is required"),
  owner: z.string().optional(),
  creation: z.string().optional(),
  modified: z.string().optional(),
  modified_by: z.string().optional(),
  docstatus: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export const PurchaseOrderCreateSchema = PurchaseOrderSchema.pick({
  title: true,
  naming_series: true,
  supplier: true,
  transaction_date: true,
  company: true,
  currency: true,
  conversion_rate: true,
  items: true,
  status: true,
}).extend({});

export const PurchaseOrderUpdateSchema = PurchaseOrderSchema.partial().omit({
  name: true,
  creation: true,
  owner: true,
  docstatus: true,
});

export type PurchaseOrderSchemaType = z.infer<typeof PurchaseOrderSchema>;

// =============================================================================
// ADDRESS SCHEMAS
// =============================================================================

// Dynamic Link schema for Address/Contact
export const DynamicLinkSchema = z.object({
  link_doctype: z.string().min(1, "Link DocType is required"),
  link_name: z.string().min(1, "Link Name is required"),
});

export const AddressCreateSchema = z.object({
  // REQUIRED
  address_type: z.enum([
    "Billing",
    "Shipping",
    "Office",
    "Personal",
    "Plant",
    "Postal",
    "Shop",
    "Subsidiary",
    "Warehouse",
    "Current",
    "Permanent",
    "Other",
  ]),
  address_line1: z.string().min(1, "Address Line 1 is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),

  // OPTIONAL
  address_title: z.string().optional(),
  address_line2: z.string().optional(),
  county: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  email_id: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  fax: z.string().optional(),
  is_primary_address: z.union([z.literal(0), z.literal(1)]).optional(),
  is_shipping_address: z.union([z.literal(0), z.literal(1)]).optional(),
  disabled: z.union([z.literal(0), z.literal(1)]).optional(),

  // DYNAMIC LINKS
  links: z.array(DynamicLinkSchema).optional(),
});

export const AddressUpdateSchema = AddressCreateSchema.partial();
export type AddressFormData = z.infer<typeof AddressCreateSchema>;

// =============================================================================
// CONTACT SCHEMAS
// =============================================================================

export const ContactCreateSchema = z.object({
  // NAME FIELDS
  first_name: z.string().min(1, "First Name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),

  // CONTACT INFO
  email_id: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile_no: z.string().optional(),

  // PERSONAL/BUSINESS INFO
  salutation: z.string().optional(),
  designation: z.string().optional(),
  gender: z.string().optional(),
  company_name: z.string().optional(),
  department: z.string().optional(),
  address: z.string().optional(),

  // STATUS
  status: z.enum(["Passive", "Open", "Replied"]).optional(),
  is_primary_contact: z.union([z.literal(0), z.literal(1)]).optional(),
  unsubscribed: z.union([z.literal(0), z.literal(1)]).optional(),

  // DYNAMIC LINKS (same as Address)
  links: z.array(DynamicLinkSchema).optional(),
});

export const ContactUpdateSchema = ContactCreateSchema.partial();
export type ContactFormData = z.infer<typeof ContactCreateSchema>;
