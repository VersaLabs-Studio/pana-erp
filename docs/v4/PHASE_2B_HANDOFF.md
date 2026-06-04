# Obsidian ERP v4.0 — Phase 2b Handoff (Remediation + Accounting Suite)

> **For:** Coding agent
> **Status of Phase 2a:** ❌ **NOT APPROVED.** Manual dev-server testing found the wizards cannot submit, detail pages link to unbuilt routes, and the UI violates v3 surface/skeleton standards. Root causes are diagnosed below with exact fixes.
> **This document is one job, done in a single pass:** (Part A) fix every broken 2a implementation **and the Sales Order golden template it was copied from**, (Part B) ship the new detail-page Flow UX, (Part C) build the Accounting suite. Report back with live-runtime proof.
> **Date:** 2026-06-03
> **Branch:** continue on `feat/v4-phase-2a-sales-stock` (rename allowed: `feat/v4-phase-2b-accounting`). Do **not** merge 2a as-is.

---

## 0. Why 2a was rejected (read this first)

The static gates were green (tsc 0 errors, 8/8 tests, no `@ts-nocheck`) but **none of it works at runtime**, because the failures are reactivity/wiring bugs that unit tests don't exercise. The reviewer reproduced all of the following on a live Frappe site:

1. **Wizards are permanently un-submittable.** You fill every required field, but the gate still shows `company: Company is required` and the Submit button stays disabled.
2. **Submitted documents offer invalid/404 actions** (e.g. a submitted Delivery Note links to `/accounting/sales-invoice/new`, which does not exist yet).
3. **Flow tracker offers self-referential "Create" actions** (a submitted Sales Order prompting you to create a Sales Order).
4. **Borders on every nested surface** — the "boxed-in" look the user has flagged twice as off-spec for v3.
5. **Skeletons / status colors** are ad-hoc and off-palette.

**These are not 2a-only bugs. The Sales Order "golden template" has the same defects** (confirmed: `app/sales/sales-order/new/page.tsx:227`). Fixing only the stock modules would re-introduce every bug the next time the template is copied. **Fix the template first, re-verify it, then propagate.**

---

## PART A — Critical Remediation (do before any new doctype)

Each item: **root cause → exact fix → files → done-check.** Apply the fix to the golden template **and** every page listed.

### A1 — BLOCKER: wizard validation gate is stale (cannot submit)

**Root cause.** The validation gate is memoized against `getValues()` (which is **not** reactive) with a dependency list that only includes `customer` and `items`:

```ts
// CURRENT — broken. app/sales/sales-order/new/page.tsx:219-227 and all 2a create pages
const validationResults = useMemo(() => {
  const values = { ...getValues(), items: watchedItems };
  return { step1: validateWizardStep(DT, "step1", values), /* ... */ };
}, [watchedItems, watchedCustomer, step, getValues]);
```

When the user edits `company`, `posting_date`, `purpose`, etc., **none of those deps change**, so the memo returns the result computed from the *initial empty form* — `{ valid:false, errors:{ company:"Company is required" } }` — forever. The Next/Submit button is gated on that stale result, so it can never enable. (It "works" only if the last field you touch happens to be `customer` or an item.)

**Exact fix — drive the gate off a full, reactive form watch:**

```ts
// FIXED — watch the entire form; recomputes on every keystroke.
const watchedAll = useWatch({ control }); // returns the whole form object, reactively

const validationResults = useMemo<Record<string, StepValidationResult>>(() => {
  const values = { ...getValues(), ...watchedAll };
  return {
    step1: validateWizardStep(DOCTYPE, "step1", values),
    step2: validateWizardStep(DOCTYPE, "step2", values),
    step3: { valid: true, errors: {} },
  };
}, [watchedAll, getValues]);
```

Also stop feeding `FlowWizard` a frozen snapshot — pass the reactive object:

```tsx
// CURRENT: formData={getValues() as ...}  onFormDataChange={() => {}}
// FIXED:
formData={watchedAll as unknown as Record<string, unknown>}
```

**Also verify field binding actually round-trips.** Independently confirm that `FormFrappeSelect`/`FormDatePicker` write their value into RHF such that `getValues().company` is populated after selection. If a control is uncontrolled or uses the wrong `name`, the value never reaches validation — fix the control, don't paper over it. Add a throwaway `console.log(watchedAll)` while testing to confirm every field updates.

**Files (golden template FIRST, then every create + edit):**
`app/sales/sales-order/new/page.tsx`, `app/sales/sales-order/[name]/edit/page.tsx`, `app/stock/delivery-note/new/page.tsx`, `app/stock/delivery-note/[name]/edit/page.tsx`, `app/stock/stock-entry/new/page.tsx`, `app/stock/material-request/new/page.tsx`.

**Done-check:** On a live site, fill the wizard in any field order → Next enables the moment the last required field is valid → Submit fires `useFrappeCreate` → row exists in Frappe after reload. Capture the network 200 + the persisted doc.

---

### A2 — BLOCKER: detail pages link to unbuilt routes / contradict themselves

**Root cause.** On a **submitted** Delivery Note the page-header renders a *live* link to a page that doesn't exist yet, while the WhatsNext panel disables the *same* action:

```tsx
// app/stock/delivery-note/[name]/page.tsx:206-212 — live <Link> to a route that 404s
{isSubmitted && (
  <Button asChild><Link href={`/accounting/sales-invoice/new?delivery_note=${name}`}>Create Invoice</Link></Button>
)}
// ...but lines 160-166 disable "Create Sales Invoice" as "Coming in Phase 2". Contradiction.
```

**Rule (absolute):** a downstream action is **either** a working route in this build **or** disabled with a tooltip. **Never** a live link/button to a not-yet-built page. No action may appear in two states.

**Exact fix:** Until the target module ships in 2b, the action is `disabled` with `disabledReason`. The single source of truth for "can I create X downstream" is a small capability map, not scattered JSX:

```ts
// lib/flows/module-availability.ts (new) — one place that knows what's built.
export const BUILT_MODULES = new Set<string>([
  "Sales Order","Delivery Note","Stock Entry","Material Request","Quotation",
  // add "Sales Invoice","Payment Entry",... as Part C lands them
]);
export const isModuleBuilt = (doctype: string) => BUILT_MODULES.has(doctype);
```

Every header action, WhatsNext action, and FlowTracker `createAction` checks `isModuleBuilt(target)` → enabled link vs disabled+tooltip. As you build each 2b doctype, add it to the set; its downstream buttons light up automatically across the app.

**Files:** all `[name]/page.tsx` detail pages (sales-order, delivery-note, stock-entry, material-request) + `components/flows/WhatsNext` + `FlowTracker`.

**Done-check:** No clickable action anywhere navigates to a 404. Disabled actions show the tooltip. Header and WhatsNext never disagree.

---

### A3 — BLOCKER: FlowTracker self-referential / wrong "current" stage

**Root cause.** The "current" stage and its `createAction` can resolve to the doctype you're already on, producing "submitted Sales Order → Create Sales Order." The `createAction` must always target the **downstream** doctype, and only when that downstream is built.

**Exact fix:** In `resolveFlowChain`/`resolveStageStatuses`, the stage matching the document you're viewing is `current` (or `completed` if submitted); its `canCreateDownstream` is true **only** when (a) a real downstream stage exists in the chain and (b) `isModuleBuilt(downstreamDoctype)`. The "Create" affordance lives on the **downstream** stage, never the current one. Gate the button in `FlowTracker.tsx:101-113` accordingly.

**Done-check:** Viewing any submitted doc, the only enabled "Create" points to a real, built next step; nothing offers to create its own type.

---

### A4 — Edit pages: same gate bug + empty step config + must persist

**Root cause.** Edit pages copy the broken gate (A1) and ship `WIZARD_STEPS` with `fields: []`, `schema: null`, so step metadata is empty. Reviewer also reports edit appears to render read-only content rather than an editable wizard.

**Exact fix:** Apply A1's reactive gate. Populate `WIZARD_STEPS[].fields` to match the create pages. Confirm the edit page (i) loads via `useFrappeDoc`, (ii) **prefills** the RHF form in a `useEffect` once data arrives, (iii) persists via `useFrappeUpdate`, (iv) hard-guards non-Draft (`docstatus !== 0` → "Only Draft … can be edited"). Edit is a wizard, not a detail view.

**Files:** `app/sales/sales-order/[name]/edit/page.tsx`, `app/stock/delivery-note/[name]/edit/page.tsx`.

**Done-check:** Open a Draft DN → Edit → change qty → Save → reload shows the change. Submitted DN → Edit → blocked.

---

### A5 — Off-palette status colors (the false "zero off-palette" claim)

**Root cause.** Raw Tailwind color-number classes survive in every list page (the 2a DoD claimed zero — it was wrong):
`app/stock/delivery-note/page.tsx:124-125`, `material-request/page.tsx:104-106,166`, `stock-entry/page.tsx:121`, and the pre-existing `app/sales/sales-order/page.tsx`.

**Exact fix:** Introduce one status→token helper and use it everywhere a status drives color:

```ts
// lib/ui/status-accent.ts (new)
export type Accent = "neutral" | "info" | "warning" | "success" | "danger";
export const ACCENT_BAR: Record<Accent,string> = {
  neutral:"bg-muted-foreground/40", info:"bg-primary/60",
  warning:"bg-amber-500/0 bg-[--warning]", // see note
  success:"bg-primary", danger:"bg-destructive",
};
```

If the OKLCH theme lacks a dedicated warning/success token, **add semantic tokens** (`--warning`, `--success`) to the theme in `globals.css` for both light/dark — do **not** reach for `amber-500`/`emerald-500`. Map each doctype's statuses to an `Accent`, render via the helper. Grep gate must be empty:
`git grep -nE "(text|bg|border)-(blue|amber|emerald|purple|indigo|gray|red|green)-[0-9]" -- app/stock app/sales` → **0 lines**.

---

### A6 — Surface & border system ("no invented borders", strict v3 patterns)

**Root cause.** Every nested element is its own bordered box (FlowTracker chips, item tables, info cards), producing the "boxed-in" look flagged twice. `InfoCard` also ships off-palette gradient defaults (`from-indigo-50/50 to-purple-50/50`, `info-card.tsx:32-33`) and an oversized `rounded-[2rem] p-8`.

**Exact fix — one surface hierarchy, elevation-first:**

| Surface | Recipe | Border? |
|---|---|---|
| Primary content card | `bg-card shadow-sm rounded-2xl p-6` | **none** (elevation only) |
| Elevated/glass panel | `backdrop-blur-xl bg-card/80 shadow-xl shadow-black/5 rounded-2xl` | `border border-border/40` (outer only) |
| Inner grouping (table, list) | `bg-card/40 rounded-xl` + **row dividers** `divide-y divide-border/40` | no box border |
| Divider | `border-t border-border/40` | hairline only |

Rules: **never nest a bordered box inside a bordered box.** Borders are hairline dividers or the single outermost container — not decoration on every chip. Remove `border` from `FlowTracker` stage chips (use `bg-primary/10` fill + the elevation recipe). Fix `InfoCard`: replace off-palette gradient defaults with `from-primary/5 to-primary/10`, drop to `rounded-2xl p-6`. No `border-black`, no raw shadows heavier than `shadow-xl`.

**Done-check:** Visual pass in both themes at 1440px and 375px — surfaces read as elevated, not caged; no double borders; `git grep "rounded-\[2rem\]"` and `git grep "border-black"` empty.

---

### A7 — Skeletons: one shared primitive, content-shaped, no spinners

**Root cause.** Loading states are ad-hoc `animate-pulse bg-muted` blocks (and a `Loader2` spinner inside FlowTracker stages), inconsistent and off the v3 standard.

**Exact fix:** Add a single `components/ui/skeleton.tsx` (`bg-muted/60` + shimmer keyframe in `globals.css`). Build three composed skeletons that mirror real layout: **list-card**, **detail**, **wizard-step**. Replace every inline pulse block and the FlowTracker per-stage spinner with these. No spinners anywhere except inside a button mid-submit.

**Done-check:** Throttle the network — each page shows a content-shaped shimmer, never a bare spinner or layout jump.

---

### A8 — Architecture integrity (don't regress v3)

Re-assert and verify, with greps, that 2a did not bypass the factory:
- Pages call **only** `hooks/generic` (`useFrappeList/Doc/Create/Update/Delete`). `git grep -nE "frappe-client|axios|fetch\(" -- app/stock app/sales` → only inside `lib/`, never in pages.
- No `any`, no `@ts-nocheck` in any touched file. Import-direction rule intact (`ui/` never imports features).
- Schema-first: each new 2b doctype has its Zod schema + `DocTypeConfigV4` entry before its UI.

---

## PART B — New Detail-Page Flow UX (design + implementation plan)

The current horizontal chip strip is cramped, self-referential, and hard to read on mobile. Replace it on **all detail pages** with the design below.

### B.1 Design spec — "Flow Rail"
- **Layout:** vertical rail on `lg`, horizontal scroll-snap on mobile. Each stage = a row: status glyph · stage name · linked doc id (mono) · timestamp · a single right-aligned action slot.
- **States (token-only):** completed = filled `bg-primary/10`, primary check, clickable → real doc; current = subtle ring `ring-1 ring-primary/30`, animated clock; pending = muted, no border; skipped = muted/60 + strikethrough label; blocked = `bg-destructive/5`, ban icon.
- **Connectors:** a continuous vertical line (`bg-primary/30` up to current, `bg-border/40` after) — one line, not a border per node.
- **Action slot:** exactly one affordance per stage, gated by `isModuleBuilt` (A2). Completed → "View"; the next buildable stage → "Create"; everything else → nothing.
- **Empty/loading/error:** use the A7 skeleton + a single-line empty state; never the raw spinner.
- **No borders on individual nodes** — the rail is one elevated card (A6).

### B.2 Implementation plan
1. Build `components/flows/FlowRail.tsx` (new) implementing B.1; keep the `FlowChainResult` prop contract so chain resolution is unchanged.
2. Add `lib/flows/module-availability.ts` (A2) and wire `canCreateDownstream`/action gating through it.
3. Fix `resolveFlowChain`/`resolveStageStatuses` so `current` is the viewed doc and the create affordance sits on the downstream stage (A3).
4. Swap `FlowTracker` → `FlowRail` in all four detail pages; keep `FlowTracker` only if something else uses it (grep first; if not, delete it — no dead components).
5. Verify upstream links open the real doc and downstream "Create" deep-links carry the correct query param (e.g. `?sales_order=`, `?delivery_note=`) **only when that module is built**.

---

## PART C — Phase 2b scope: Accounting suite

Build these on the **now-fixed** golden template. End-to-end target: **Delivery Note → Sales Invoice → Payment Entry.**

| Doctype | Notes / B4 spec gap to resolve |
|---|---|
| **Sales Invoice** | From DN (auto-fill via `AUTO_FILL_REGISTRY` "Delivery Note→Sales Invoice"; carry items, compute outstanding). Add to `BUILT_MODULES` so DN's "Create Invoice" lights up. |
| **Purchase Invoice** | From Purchase Receipt / PO where present; supplier + taxes. |
| **Payment Entry** | Outstanding auto-fetch (Workflow P1 §10.3): selecting party + invoice pulls outstanding amount; partial/over-payment validation. |
| **Journal Entry** | Debit==Credit balance validation gate before submit; multi-line table. |

For each: register the `AUTO_FILL_REGISTRY` entry + `WIZARD_STEP_SCHEMAS` step schemas (real gates, like `materialRequestStepSchemas`), status machine, factory routes with `allowedFields`, and **B3 idempotency** on any create-from-upstream (double-submit = one doc — gate on `mutation.isPending` + a deterministic key).

---

## PART D — Definition of Done (per item) & process

**This is a single-pass job.** Do Part A in full, re-verify the golden template, then B, then C. Don't open a new doctype while A is red.

**Automated (must all pass, show the commands' output in your report):**
- `tsc --noEmit` 0 errors; `git grep -n "@ts-nocheck" -- app` empty; no `any`.
- Off-palette grep (A5) empty across `app/stock app/sales`.
- `git grep -nE "frappe-client|axios" -- app` empty (factory-only).
- `vitest run` green, **plus a new test** asserting the wizard gate flips to `valid:true` once required fields are set (this is the bug class that escaped — cover it).

**Manual (against a live Frappe v15 + ERPNext site — non-negotiable, attach proof):**
- [ ] Each wizard submits and the doc **persists** (reload). Screenshot + network 200.
- [ ] No action navigates to a 404; disabled actions show tooltips; header ⇄ WhatsNext consistent.
- [ ] Flow Rail: upstream "View" opens the real doc; downstream "Create" only on built modules; no self-create.
- [ ] Edit persists on Draft, blocked on submitted.
- [ ] DN → Sales Invoice → Payment Entry end-to-end completes and each doc links back in the rail.
- [ ] Double-submit any create-from-upstream → exactly one document.
- [ ] Dark + light, 1440px + 375px: elevated surfaces (no caged borders), content-shaped skeletons, semantic status colors.

**Report back** with: the grep/test outputs, screenshots of the three flows, and a short note on anything you changed in the golden template. We review by re-running, not by trusting the summary.

---

## PART E — Security carry-forward (still gating Phase 3, not this phase)
`lib/auth/resolve-user.ts` is a dev stub; `createScopedFrappeClient` throws. Per-user RBAC (B1) must land **before** the AI phase. Track it; do not start Phase 3 without it.
