# MESH REPORTING CONTRACT — v1.0

> **Every Obsidian ERP v4 handoff references this file in one line. Read it before you
> write code and again before you write your completion report.** It exists because four
> consecutive build cycles passed `tsc`/`vitest` green with a glowing Definition-of-Done
> table while the app was broken at runtime — and one cycle shipped commit messages
> claiming fixes the code did not contain. This contract is how that stops.

The Brain (Opus 4.8) audits **every** claim in your report against the real tree
(`git show`, `grep`, `read`) — not against your DoD table. A claim that does not match the
code is treated as a failed deliverable, the same as a broken feature. Plan accordingly.

---

## The 6 rules

### 1. Claim = code = diff
For every fix or feature you report as done, quote the **`file:line`** and the
**before → after** of the actual change. "✅ Fixed G1" with no diff is treated as *not done*.
If your commit message says you added X, the commit must contain X. A commit message that
describes work absent from its own diff is the single most serious violation — it is the
reason a prior model was discarded mid-phase.

### 2. No invented abstraction layers
Reuse the existing `useFrappe*` hooks and `@/components/*`. Do **not** create new modules
like `optimizer.ts`, `auditor.ts`, `integrator.ts`, `composer.ts`, `voucher-linker.ts`, or
any file that no shipping code imports. **Every new file must be imported by something that
renders or runs.** Grep your own additions for callers before you report; a module with zero
callers is padding and will be deleted.

### 3. No `__init__.ts`, no Python-isms
This is a TypeScript / Next.js 16 repo. There are no package `__init__` files. Match the
idioms already in the tree.

### 4. Honor explicit guardrails
If a handoff says a doc is **standalone** (no FlowRail / no auto-fill / no flow stage), or a
file is **off-limits**, respect it exactly. Inventing a flow edge that does not exist in
ERPNext (e.g. "Purchase Order → Stock Reconciliation") is an architectural reject, not a
feature.

### 5. Static gates are necessary, not sufficient
`tsc --noEmit = 0` and `vitest` green **do not prove the UI works** — every prior failure
passed them. They are table stakes, not evidence. Before you report done:
- **Run the dev server and click the live retest paths** in the handoff.
- Report **what you actually observed** ("clicked Create on the SO detail, the Delivery Note
  wizard opened with customer = CUST-001 prefilled"), not a checkmark.
- A "real" URL that 404-frees but does not prefill is a **silent half-fix** — verify the
  target wizard actually reads the param you send (`searchParams.get(...)` must match).

### 6. Tests assert against real code, not literals
A test that asserts a hardcoded literal (`expect(filter[0]).toBe("Sales Invoice Item")`) or
*simulates* the lookup instead of rendering the real component proves nothing — that is how
a 404 shipped green. Component tests must **render the real component** (RTL) and assert on
its output. Helper tests must **import and call the real exported function**.

---

## Report format (paste this back, filled in)

```
PHASE <id> — <branch> — commits <hash1> <hash2>

STATIC GATES (observed, not asserted):
  tsc --noEmit:  <exit code>
  vitest run:    <pass/total>   (note if count unchanged = no new tests)

PER-ITEM (one row per fix/feature):
  <id> | <file:line> | before -> after (1 line) | live observation

LIVE RETEST (ran dev server):
  <step> -> <what I actually saw>

GUARDRAILS:
  standalone respected? off-limits files untouched? no orphan modules? no __init__.ts?

KNOWN GAPS (be honest — undone > falsely-claimed-done):
  <anything not finished, with why>
```

If something is not done, **say so**. An honest "I could not verify PO create against live
Frappe" costs you nothing. A false "✅ PO create works" costs the whole phase a re-cycle.
