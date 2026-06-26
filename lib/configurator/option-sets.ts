import type { OptionSet } from "./types";

export const OPTION_SETS: Record<string, OptionSet> = {
  "BUSINESS-CARDS": {
    item_code: "BUSINESS-CARDS",
    item_name: "Business Cards",
    options: [
      {
        name: "Size",
        type: "single",
        choices: [
          { label: "Standard (3.5 × 2 in)", price_delta: 0, component_item: "CARD-STANDARD", qty_formula: 1 },
          { label: "Medium (4 × 2.5 in)", price_delta: 50, component_item: "CARD-MEDIUM", qty_formula: 1 },
          { label: "Large (5 × 3 in)", price_delta: 120, component_item: "CARD-LARGE", qty_formula: 1 },
        ],
      },
      {
        name: "Print Sides",
        type: "single",
        choices: [
          { label: "Single-sided", price_delta: 0 },
          { label: "Double-sided", price_delta: 150 },
        ],
      },
      {
        name: "Paper Thickness",
        type: "single",
        choices: [
          { label: "300 gsm", price_delta: 0, component_item: "PAPER-300GSM", qty_formula: 1 },
          { label: "350 gsm", price_delta: 80, component_item: "PAPER-350GSM", qty_formula: 1 },
          { label: "400 gsm", price_delta: 160, component_item: "PAPER-400GSM", qty_formula: 1 },
        ],
      },
      {
        name: "Lamination",
        type: "single",
        choices: [
          { label: "None", price_delta: 0 },
          { label: "Glossy", price_delta: 100, component_item: "LAM-GLOSSY", qty_formula: 1 },
          { label: "Matte", price_delta: 120, component_item: "LAM-MATTE", qty_formula: 1 },
        ],
      },
      {
        name: "Corners",
        type: "single",
        choices: [
          { label: "Sharp", price_delta: 0 },
          { label: "Rounded", price_delta: 60 },
        ],
      },
    ],
  },
};
