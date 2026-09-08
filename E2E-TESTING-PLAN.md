# End-to-End Testing Plan - Blue Carbon Cost Tool Improvements

## Test Environment

- **Client**: http://localhost:3001
- **API**: http://localhost:4000
- **Database**: PostgreSQL (port 5433)

---

## Test 1: Break-even Toggle Filtering (Overview Table)

**Objective**: Verify that the priceType filter now properly filters the project list

**Steps**:

1. Navigate to Overview tab
2. Observe the table with "Break-even cost $(USD)/tCO2e" column
3. Note initial priceType toggle value (top right)
4. **Select "Opex breakeven"** from toggle
5. Verify table shows ONLY Opex breakeven projects (1 row per project)
6. Check break-even cost values match OPEX / creditsIssued calculation
7. **Toggle to "Total cost breakeven"**
8. Verify table shows ONLY Total cost breakeven projects (1 row per project)
9. Verify break-even cost values are DIFFERENT and higher than OpEx
10. Verify no duplicate rows appear

**Expected Results**:

- ✓ Toggle filters list (no more duplicates)
- ✓ OPEX breakeven prices are lower than Total cost breakeven
- ✓ Only one price type visible at a time

---

## Test 2: Offset Price Calculations (Project Details)

**Objective**: Verify offset price display and toggle in project details panel

**Steps**:

1. Click on a project from the table (e.g., "Australia Mangrove Restoration Hydrology Large")
2. Project details panel opens on the right
3. Observe "Offset price" card showing price in $/tCO₂e
4. Note "Price type" toggle (currently "OpEx breakeven")
5. **Toggle to "Total cost breakeven"**
6. Verify offset price INCREASES (shows higher cost)
7. **Click info icon** next to "Offset price"
8. Verify tooltip shows revenue strategy note about charging higher than break-even
9. **Toggle back to "OpEx breakeven"**
10. Verify offset price DECREASES back to original value

**Expected Results**:

- ✓ Offset price changes when price type toggled
- ✓ OpEx breakeven < Total cost breakeven
- ✓ Tooltip shows revenue strategy explanation
- ✓ Calculation is: (opex or totalCost) / creditsIssued

---

## Test 3: Infinity Value Handling

**Objective**: Verify projects with zero/minimal credits don't show infinity values

**Steps**:

1. Navigate to Overview tab
2. Observe "Credit potential (tCO2e)" column
3. Look for projects marked "insignificant or minimal" credits
4. Verify "Break-even cost" column shows **blank/null** (not $∞)
5. Click into such a project to verify details panel handles gracefully

**Expected Results**:

- ✓ No infinity symbols ($∞) in break-even column
- ✓ Projects with zero credits show blank/no value
- ✓ No console errors for division by zero

---

## Test 4: Cost Details Panel Changes (Item 4)

**Objective**: Verify revenue chart removed and offset price displayed

**Steps**:

1. Click into a project details panel
2. Verify **left card** shows "Total project cost" pie chart (CapEx + OpEx)
3. Verify **right card** shows "Offset price" (NOT "Net revenue after OPEX")
4. Verify revenue chart is completely removed
5. Verify price type toggle works in offset price card

**Expected Results**:

- ✓ Revenue chart removed (no "Net revenue" card)
- ✓ Offset price card replaces it
- ✓ Price type toggle functional

---

## Test 5: Data Integrity Checks

**Objective**: Spot-check calculations are correct

**Spot-check calculations**:

```
Project: Australia Mangrove Restoration Hydrology Large
Expected:
  - Credits Issued: should be ~80% of Abatement Potential
  - OpEx Breakeven = Opex total / Credits Issued
  - Total Cost Breakeven = (Capex + Opex) / Credits Issued
  - Total > OpEx always
```

---

## Test 6: Browser Console Validation

**Objective**: Verify no JavaScript errors or warnings

**Steps**:

1. Open Browser DevTools Console (F12)
2. Toggle between different price types
3. Click into projects and out
4. Toggle cost range selector (NPV vs Total)
5. Verify NO errors related to:
   - "Cannot read property of undefined"
   - "Division by zero"
   - "creditsIssued"
   - Component rendering issues

**Expected Results**:

- ✓ No errors in console
- ✓ Debug logs show correct calculations

---

## Test 7: Edge Cases

**Objective**: Verify edge cases handled properly

**Cases to test**:

1. **Seagrass projects** (known Tier 1 fallback)
   - Verify they still calculate correctly with Tier 1 data
2. **Salt Marsh** (partial Tier 2)
   - Verify they use Tier 1 when Tier 2 not available
3. **Projects with $0 abatement**
   - Should show blank break-even, not infinity
4. **Very large projects**
   - Verify numbers display correctly (formatting)
   - Verify no floating point precision issues

**Expected Results**:

- ✓ All projects calculate and display without errors
- ✓ Edge cases don't crash UI

---

## Issues Found During Testing

_(Document any issues encountered)_

---

## Approval Checklist

- [ ] Toggle filtering works end-to-end
- [ ] Offset price calculations correct
- [ ] Infinity values fixed
- [ ] Revenue chart removed
- [ ] Price type toggle functional
- [ ] No console errors
- [ ] Data calculations verified
- [ ] Edge cases handled
- [ ] All 6 items working correctly

**Status**: ⏳ Ready to test
