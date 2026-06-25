export interface OptionChoice {
  label: string;
  price_delta: number;
  component_item?: string;
  qty_formula?: number;
}

export interface OptionGroup {
  name: string;
  type: "single" | "multi";
  choices: OptionChoice[];
}

export interface OptionSet {
  item_code: string;
  item_name: string;
  options: OptionGroup[];
}

export interface ConfiguredLine {
  item_code: string;
  description: string;
  options: Record<string, string | string[]>;
  rate: number;
  components: Array<{
    item_code: string;
    qty: number;
  }>;
}
