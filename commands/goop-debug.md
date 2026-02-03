---
name: goop-debug
description: Systematic debugging using scientific method - investigate bugs with hypothesis testing
tools:
  read: true
  write: true
  edit: true
  bash: true
  grep: true
  glob: true
---

<objective>
Systematic debugging using the scientific method.

Investigates bugs through hypothesis testing, manages persistent debug sessions, and handles checkpoints when user input is needed.

**Key principles:**
- User = Reporter (knows symptoms), Claude = Investigator (finds cause)
- Hypothesis testing with falsifiable predictions
- Change one variable at a time
- Document everything in DEBUG.md

**Creates:**
- `.goopspec/debug/DEBUG-{id}.md` - Debug session record
</objective>

<execution_context>
<!-- Debug template is embedded in the process section above -->
</execution_context>

<context>
@.goopspec/PROJECT.md
@.goopspec/STATE.md
</context>

<process>
## Phase 1: Gather Evidence

**Opening questions:**

"Tell me about the bug. What did you expect to happen, and what actually happened?"

Listen for:
- Expected behavior
- Actual behavior
- Error messages
- When it started
- Reproduction steps
- Environment details

**Do NOT ask:**
- "What's causing it?" (User doesn't know)
- "Which file has the bug?" (That's your job)
- "How should we fix it?" (Investigate first)

**DO ask about:**
- "What were you doing when it happened?"
- "Does it happen every time?"
- "When did you first notice it?"
- "What error messages did you see?"

## Phase 2: Initialize Debug Session

Create debug session file:

```bash
DEBUG_ID=$(date +%Y%m%d-%H%M%S)
mkdir -p .goopspec/debug
```

Create `.goopspec/debug/DEBUG-$DEBUG_ID.md`:

```markdown
# Debug Session: $DEBUG_ID

**Started:** [Timestamp]
**Status:** In Progress
**Severity:** [Critical/Major/Minor]

## Problem Statement

**Expected:** [What should happen]
**Actual:** [What actually happens]
**Impact:** [Who/what is affected]

## Evidence Gathered

### Error Messages
```
[Paste error messages]
```

### Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Environment
- [OS/Version]
- [Runtime version]
- [Relevant env vars]

## Investigation Log

### Hypothesis 1: [Brief description]
**Prediction:** If true, [observable outcome]
**Test:** [What to do]
**Result:** [Pending/Confirmed/Refuted]
**Conclusion:** [What we learned]

---

## Current Status

**Active Hypothesis:** [Which one we're testing]
**Next Step:** [What to do next]

## Resolution

**Root Cause:** [What was actually wrong]
**Fix Applied:** [What was changed]
**Verification:** [How we confirmed it's fixed]
**Committed:** [Commit hash]

---
*Debug session following scientific method*
```

## Phase 3: Form Hypotheses

Based on evidence, generate 3+ independent hypotheses:

**Good hypotheses (falsifiable):**
- "User state resets because component remounts on route change"
- "API returns 404 because URL construction is wrong"
- "Race condition between async operations"

**Bad hypotheses (unfalsifiable):**
- "Something is wrong with the state"
- "The timing is off"
- "There's a bug somewhere"

For each hypothesis, design an experiment:

```markdown
### Hypothesis N: [Description]
**Prediction:** If this hypothesis is true, I will observe [specific outcome]
**Test:** [Exact steps to test]
**Measurement:** [What to measure]
**Success criteria:** [What confirms/refutes]
```

## Phase 4: Test Hypotheses

**Rule: Change ONE variable at a time**

For each hypothesis:
1. Run the test
2. Record the exact outcome
3. Compare to prediction
4. Document in DEBUG.md

**If hypothesis confirmed:**
- Move to Phase 5 (Action)
- Update DEBUG.md with conclusion

**If hypothesis refuted:**
- Document what we learned (rules something out)
- Form new hypothesis based on new information
- Continue testing

## Phase 5: Take Action

**Only act when ALL are true:**
1. Understand the mechanism (not just "what fails" but "why")
2. Can reproduce reliably
3. Have evidence, not just theory
4. Ruled out alternatives

**Action types:**

### Fix the bug
- Make minimal, targeted change
- Update tests to prevent regression
- Verify fix works
- Document in DEBUG.md

### Checkpoint (if blocked)
If you need user input:
```
<task type="checkpoint:decision" gate="blocking">
  <decision>[What needs deciding]</decision>
  <context>[Why this matters]</context>
  <options>[Available options]</options>
</task>
```

## Phase 6: Document Resolution

Update DEBUG.md:

```markdown
## Resolution

**Root Cause:** [Clear explanation]
**Fix Applied:** [What was changed]
```diff
- [Old code]
+ [New code]
```

**Verification:** [How confirmed]
- [ ] Test passes
- [ ] Manual verification
- [ ] No regressions

**Committed:** [Hash]
**Duration:** [How long it took]
**Status:** RESOLVED
```

## Phase 7: Offer Next Steps

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GOOPSPEC > DEBUG COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Bug Resolved**

Root Cause: [Brief description]
Fix: [What was changed]
Commit: [Hash]

Debug record: .goopspec/debug/DEBUG-{id}.md

───────────────────────────────────────────────────────────────

## Lessons Learned

[Key insight from this debug session]

───────────────────────────────────────────────────────────────

**Next steps:**
- Continue with current work
- /goop-status - Check overall progress
- /goop-pause - Save checkpoint

───────────────────────────────────────────────────────────────
```
</process>

<methodology>
**Scientific Method Steps:**

1. **Observe precisely**
   - Not "it's broken" but "counter shows 3 when clicking once, should show 1"

2. **Form falsifiable hypotheses**
   - Must be provable wrong
   - Make specific, testable claims

3. **Design experiments**
   - One variable at a time
   - Clear prediction
   - Unambiguous outcome

4. **Run experiments**
   - Document exact results
   - No interpretation yet

5. **Conclude based on evidence**
   - Update mental model
   - Form new hypotheses if needed

**Cognitive Biases to Avoid:**

| Bias | Trap | Antidote |
|------|------|----------|
| Confirmation | Only look for supporting evidence | Actively seek disproof |
| Anchoring | First explanation becomes anchor | Generate 3+ hypotheses |
| Availability | Recent bugs -> similar cause | Treat each bug as novel |
| Sunk Cost | Keep going despite evidence | "If I started fresh...?" |

**When to Restart:**
- 2+ hours with no progress
- 3+ "fixes" that didn't work
- Can't explain current behavior
- Debugging the debugger

**Restart protocol:**
1. Close all files
2. Write what you know for certain
3. Write what you've ruled out
4. List new hypotheses
5. Begin again
</methodology>

<checkpoint_types>
**When to use checkpoints in debugging:**

**checkpoint:human-verify**
- After implementing fix, need user to test
- Can't reproduce in your environment
- Needs specific hardware/data

**checkpoint:decision**
- Multiple possible fixes, user must choose
- Fix has tradeoffs (performance vs simplicity)
- Requires architectural change

**checkpoint:human-action**
- Needs user to provide data/credentials
- Requires access to external system
- Needs deployment to test environment
</checkpoint_types>
