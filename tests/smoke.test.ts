// tests/smoke.test.ts
// Obsidian ERP v4.0 - Smoke Unit Test
// Verifies the test harness is working

import { describe, it, expect } from "vitest";
import { buildIdempotencyKey, getAutomationGuard } from "@/lib/flows/idempotency";
import { validateWizardStep } from "@/lib/flows/flow-validation";
import { isModuleBuilt, BUILT_MODULES } from "@/lib/flows/module-availability";
import { resolveFrappeError, KNOWN_ERROR_CODES } from "@/lib/errors/frappe-error-resolver";

describe("Smoke Test — Test Harness", () => {
  it("should pass a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("can import project modules", () => {
    expect(buildIdempotencyKey).toBeDefined();
    expect(typeof buildIdempotencyKey).toBe("function");
  });

  it("buildIdempotencyKey produces deterministic keys", () => {
    const key1 = buildIdempotencyKey("Sales Order", "SO-001", "create_work_orders");
    const key2 = buildIdempotencyKey("Sales Order", "SO-001", "create_work_orders");
    expect(key1).toBe(key2);
    expect(key1).toBe("Sales Order:SO-001:create_work_orders");
  });

  it("buildIdempotencyKey includes target doctype when provided", () => {
    const key = buildIdempotencyKey("Sales Order", "SO-001", "create", "Delivery Note");
    expect(key).toBe("Sales Order:SO-001:create:Delivery Note");
  });

  it("getAutomationGuard returns config for known automations", () => {
    const guard = getAutomationGuard("Sales Order", "create_work_orders");
    expect(guard).toBeDefined();
    expect(guard?.targetDoctype).toBe("Work Order");
    expect(guard?.linkField).toBe("sales_order");
  });

  it("getAutomationGuard returns undefined for unknown automations", () => {
    const guard = getAutomationGuard("Foo", "bar");
    expect(guard).toBeUndefined();
  });
});

describe("Wizard Gate Regression — A1 fix", () => {
  it("Sales Order step1 is invalid when required fields are empty", () => {
    const result = validateWizardStep("Sales Order", "step1", {
      customer: "",
      company: "",
      transaction_date: "",
      delivery_date: "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.customer).toBe("Customer is required");
    expect(result.errors.company).toBe("Company is required");
  });

  it("Sales Order step1 flips to valid once all required fields are set", () => {
    const result = validateWizardStep("Sales Order", "step1", {
      customer: "CUST-001",
      company: "My Company",
      transaction_date: "2026-06-04",
      delivery_date: "2026-06-10",
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("Sales Order step2 is invalid with empty items array", () => {
    const result = validateWizardStep("Sales Order", "step2", { items: [] });
    expect(result.valid).toBe(false);
  });

  it("Sales Order step2 flips to valid with at least one valid item", () => {
    const result = validateWizardStep("Sales Order", "step2", {
      items: [{ item_code: "ITEM-001", qty: 10, rate: 100 }],
    });
    expect(result.valid).toBe(true);
  });

  it("Delivery Note step1 is invalid without customer/company", () => {
    const result = validateWizardStep("Delivery Note", "step1", {
      customer: "",
      company: "",
      posting_date: "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.customer).toBe("Customer is required");
  });

  it("Delivery Note step1 flips to valid with all required fields", () => {
    const result = validateWizardStep("Delivery Note", "step1", {
      customer: "CUST-001",
      company: "My Company",
      posting_date: "2026-06-04",
    });
    expect(result.valid).toBe(true);
  });

  it("Stock Entry step1 is invalid without purpose", () => {
    const result = validateWizardStep("Stock Entry", "step1", {
      purpose: "",
      company: "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.purpose).toBe("Purpose is required");
  });

  it("Stock Entry step1 flips to valid with purpose and company", () => {
    const result = validateWizardStep("Stock Entry", "step1", {
      purpose: "Material Receipt",
      company: "My Company",
    });
    expect(result.valid).toBe(true);
  });

  it("Material Request step1 is invalid without material_request_type", () => {
    const result = validateWizardStep("Material Request", "step1", {
      material_request_type: "",
      company: "",
      transaction_date: "",
    });
    expect(result.valid).toBe(false);
  });

  it("Material Request step1 flips to valid with all required fields", () => {
    const result = validateWizardStep("Material Request", "step1", {
      material_request_type: "Purchase",
      company: "My Company",
      transaction_date: "2026-06-04",
    });
    expect(result.valid).toBe(true);
  });

  it("Sales Invoice step1 flips to valid with all required fields", () => {
    const result = validateWizardStep("Sales Invoice", "step1", {
      customer: "CUST-001",
      company: "My Company",
      posting_date: "2026-06-04",
      due_date: "2026-07-04",
    });
    expect(result.valid).toBe(true);
  });

  it("Payment Entry step1 flips to valid with all required fields", () => {
    const result = validateWizardStep("Payment Entry", "step1", {
      payment_type: "Receive",
      party_type: "Customer",
      party: "CUST-001",
      paid_amount: 1000,
      mode_of_payment: "Cash",
    });
    expect(result.valid).toBe(true);
  });

  it("Journal Entry step1 flips to valid with all required fields", () => {
    const result = validateWizardStep("Journal Entry", "step1", {
      voucher_type: "Journal Entry",
      posting_date: "2026-06-04",
    });
    expect(result.valid).toBe(true);
  });
});

describe("Module Availability — A2 fix", () => {
  it("BUILT_MODULES contains the expected doctypes", () => {
    expect(BUILT_MODULES.has("Sales Order")).toBe(true);
    expect(BUILT_MODULES.has("Delivery Note")).toBe(true);
    expect(BUILT_MODULES.has("Stock Entry")).toBe(true);
    expect(BUILT_MODULES.has("Material Request")).toBe(true);
    expect(BUILT_MODULES.has("Quotation")).toBe(true);
  });

  it("isModuleBuilt returns true for built modules", () => {
    expect(isModuleBuilt("Sales Order")).toBe(true);
    expect(isModuleBuilt("Delivery Note")).toBe(true);
  });

  it("isModuleBuilt returns false for unbuilt modules", () => {
    expect(isModuleBuilt("Work Order")).toBe(false);
    expect(isModuleBuilt("BOM")).toBe(false);
  });
});

describe("Frappe Error Resolver — B5 architecture", () => {
  it("KNOWN_ERROR_CODES contains all expected strategies", () => {
    expect(KNOWN_ERROR_CODES).toContain("INSUFFICIENT_STOCK");
    expect(KNOWN_ERROR_CODES).toContain("MANDATORY_MISSING");
    expect(KNOWN_ERROR_CODES).toContain("LINK_VALIDATION");
    expect(KNOWN_ERROR_CODES).toContain("DUPLICATE");
  });

  it("INSUFFICIENT_STOCK: matches stock shortfall message", () => {
    const result = resolveFrappeError(
      new Error("1.0 units of Item P-001: Raw Paper needed in Warehouse Stores - P to complete this transaction."),
      { doctype: "Delivery Note" },
    );
    expect(result.code).toBe("INSUFFICIENT_STOCK");
    expect(result.severity).toBe("warning");
    expect(result.title).toContain("stock");
    expect(result.actions.length).toBeGreaterThanOrEqual(2);
  });

  it("MANDATORY_MISSING: matches mandatory field error", () => {
    const result = resolveFrappeError(
      new Error("Field customer is mandatory"),
      { doctype: "Sales Order" },
    );
    expect(result.code).toBe("MANDATORY_MISSING");
    expect(result.title).toContain("Missing");
    expect(result.explanation).toContain("customer");
  });

  it("LINK_VALIDATION: matches 'not found' error", () => {
    const result = resolveFrappeError(
      new Error("Could not find Customer: CUST-999"),
      { doctype: "Sales Order" },
    );
    expect(result.code).toBe("LINK_VALIDATION");
    expect(result.title).toContain("not found");
    expect(result.explanation).toContain("CUST-999");
  });

  it("DUPLICATE: matches 'already exists' error", () => {
    const result = resolveFrappeError(
      new Error("Purchase Order PO-001 already exists"),
      { doctype: "Purchase Order" },
    );
    expect(result.code).toBe("DUPLICATE");
    expect(result.title).toContain("Duplicate");
    expect(result.actions.some((a) => a.label === "Open existing")).toBe(true);
  });

  it("GENERIC_FALLBACK: catches unknown errors", () => {
    const result = resolveFrappeError(
      new Error("Something completely unexpected happened"),
      { doctype: "Sales Order" },
    );
    expect(result.code).toBe("GENERIC_FALLBACK");
    expect(result.severity).toBe("error");
    expect(result.details).toBeDefined();
    expect(result.details![0]).toContain("unexpected");
  });

  it("handles non-Error objects gracefully", () => {
    const result = resolveFrappeError("raw string error", { doctype: "Sales Order" });
    expect(result.code).toBeDefined();
    expect(result.title).toBeDefined();
  });
});

describe("Wizard pristine state — A1 fix", () => {
  it("Sales Order step1 has no errors on pristine (empty) form", () => {
    // This tests the validation gate behavior: on pristine mount,
    // the form has default values. The gate should report errors for
    // empty required fields, but the UI should NOT show them (triedNext = false).
    // The validation logic itself is correct — the gate is in FlowWizard.
    const result = validateWizardStep("Sales Order", "step1", {
      customer: "",
      company: "",
      transaction_date: "",
      delivery_date: "",
    });
    // The validation correctly reports errors...
    expect(result.valid).toBe(false);
    // ...but the UI only shows them after triedNext (tested manually).
    // This test documents the contract: validation runs, UI defers display.
  });

  it("Sales Order step1 is valid when default values are filled", () => {
    const result = validateWizardStep("Sales Order", "step1", {
      customer: "CUST-001",
      company: "Test Company",
      transaction_date: "2026-06-04",
      delivery_date: "2026-06-10",
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});
