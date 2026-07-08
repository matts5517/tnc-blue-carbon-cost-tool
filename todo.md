# Developer To-Dos – Blue Carbon Cost Tool

## Phase 1 – Verify & Fix Core Calculation Logic (Highest Priority)

### 1.1 – Audit `costPerTCO2e` formula against Excel
- Current code (`cost.calculator.ts:97`): `costPerTCO2e = totalNPV / totalCreditsIssued`
- `totalCreditsIssued` is already buffer-adjusted (20% withheld in `sequestration-rate.calculator.ts:76`)
- **Action:** Confirm Excel uses NPV (discounted) or undiscounted total cost in its cost/ton formula. If undiscounted, replace `totalNPV` with `totalCapex + totalOpex`

### 1.2 – Verify break-even algorithm vs Excel
- Code uses an iterative Newton-style algorithm (`calculation.engine.ts:81–138`) — NOT the simple `Total Cost / Credit Potential` formula
- **Why:** `communityBenefitSharingFund` is `revenue × fund_rate`, which creates a circular dependency (OPEX depends on carbon price → carbon price depends on OPEX)
- **Action:** Check Excel — does it use a one-shot division or iterate? If one-shot, either (a) move `communityBenefitSharingFund` out of OPEX for break-even purposes, or (b) verify the iterative result matches Excel numerically

### 1.3 – Confirm `Landowner/community benefit share` summary field is correct
- Summary value (`cost.calculator.ts:110–117`) is a **ratio**: `communityBenefitSharingFundNPV / totalRevenueNPV`
- It IS included in `calculateOpexTotalPlan()` (`cost.calculator.ts:1026–1040`), so it drives OPEX break-even
- **Action:** Confirm with Excel whether landowner share should be (a) % of revenue in OPEX (current), (b) a fixed $/ha cost, or (c) excluded from OPEX break-even but shown separately
- This is the most likely root cause of discrepancy if Excel outputs differ

---

## Phase 2 – Fix Tier 2 Fallback (Cost/Ton Discrepancy)

### 2.1 – Understand the silent fallback
- When Tier 2 data is null, code falls back to Tier 1 silently (`restoration-project.input.ts:63–69`, `conservation-project.input.ts:79–84`)
- Tier 1 = global average → lower sequestration rate → fewer credits → **inflated cost/ton**
- **Action:** Add a warning/log (or a flag in the output DTO) whenever Tier 2 fallback is triggered, so you can detect which country/ecosystem combos are affected

### 2.2 – After Tier 2 upload: spot-check seagrass + salt marsh
- Run the smoke test (`custom-project-example-2.spec.ts`) after ingesting new data
- Add a new smoke test for a known Tier-2-covered country (e.g., seagrass/salt marsh) with expected values from Excel
- Update `expected-output.ts` fixture to match Excel after upload

---

## Phase 3 – Tier 2 Data Upload Workflow

### 3.1 – Validate upload schema before staging
- Check `shared/excel_to_db_map.json` maps Lindsey's columns correctly to `tier_2_factor` / `emission_factor_agb` / `emission_factor_soc`
- **Warning:** `ImportRepository.ingest()` **wipes all existing data** before re-ingesting. Verify staging has a backup or that the full dataset (Tier 1 + Tier 2) is in the new file

### 3.2 – Upload to staging, validate 9 Tier 2 countries
- After upload, query DB: for the 9 target countries, confirm `tier2SequestrationRate` and `emissionFactorAgb`/`emissionFactorSoc` are non-null
- Run the custom project calculation for at least one Tier 2 country and compare output to Excel

### 3.3 – Promote to production
- Same validation as 3.2
- Confirm `ModelComponentsVersionEntity` record is created with a correct `versionName`

---

## Phase 4 – Cost Details Panel (UI)

### 4.1 – Verify cost/ton display uses correct calculation
- `cost-details/table/columns.tsx` shows `$/tCO₂e` column
- Once Phase 1 is resolved, confirm `costPerTCO2e` flowing through the DTO chain reflects the corrected formula

### 4.2 – Surface OPEX and total cost break-even prices
- Break-even prices are computed and stored in `breakevenPriceComputationOutput` on the project entity
- Confirm both OPEX break-even and total cost break-even are visible in the cost details panel or summary header — add them if not

---

## Phase 5 – Versioning

### 5.1 – Confirm version is attached to calculation output
- `ModelComponentsVersionEntity` is linked to `CustomProject` via `version_id`
- **Action:** Confirm the version ID is being set at project creation time in the import/ingestion flow
- The backoffice already shows versions sorted by date — confirm the upload creates a version record with a meaningful `versionName`

### 5.2 – Surface version in UI (if needed)
- If stakeholders need to know which dataset version a project used, expose `version_id` or `versionName` in the project summary output

---

## Verification Checklist (run after any change)

- [ ] Run existing smoke test: `api/test/integration/calculations/smoke-tests/custom-project-example-2/`
- [ ] After Tier 2 upload: query DB to confirm 9 countries have non-null Tier 2 values
- [ ] Spot-check seagrass and salt marsh outputs vs Excel for a known country
- [ ] Run full integration test suite before promoting to production

---

## Key Risk

**Landowner circular dependency** — if Excel uses a simple `Total Cost / Credits` formula (treating landowner share as a fixed cost), the iterative algorithm will produce different results. This is the most likely root cause of the discrepancy and should be verified against Excel first.
