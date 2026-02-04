---
name: goop-accept
description: Verify work and request acceptance
phase: accept
requires: execution_complete
next-step: "Once accepted, complete the milestone and archive"
next-command: /goop-complete
alternatives:
  - command: /goop-execute
    when: "If issues are found that need to be fixed"
  - command: /goop-amend
    when: "If spec needs modification before acceptance"
---

# /goop-accept

**Verify and accept work.** The final gate before completion.

## Usage

```bash
/goop-accept
```

## Gate Requirement

```
+================================================================+
|  ACCEPTANCE GATE: All tasks must be complete before acceptance. |
|  Verification must pass. User must explicitly accept.           |
+================================================================+
```

**Required before this command:**
- All waves complete in CHRONICLE.md
- No unresolved blockers
- Verification passing

**If not satisfied:** Refuse and show what's missing

## Tools Used

| Tool | Purpose in This Command |
|------|------------------------|
| `goop_status` | Check execution complete status |
| `goop_spec` | Load must-haves for verification |
| `goop_reference` | Load security-checklist, verification protocols |
| `memory_search` | Find relevant prior issues |
| `memory_decision` | Record accept/reject decision with evidence |
| `goop_adl` | Log verification gaps |

**Hook Support:** `tool.execute.after` may trigger archive phase on acceptance.

---

## Process

### Phase 1: Gate Check

**Execute BEFORE anything else:**

```
goop_status()
Read(".goopspec/CHRONICLE.md")
Read(".goopspec/SPEC.md")
Read(".goopspec/BLUEPRINT.md")
```

**1.1 Check execution complete:**

```
IF CHRONICLE shows incomplete waves:
  REFUSE with:
  
  +--------------------------------------------------------+
  |  GOOPSPEC > GATE BLOCKED                                |
  +--------------------------------------------------------+
  |  Execution incomplete.                                  |
  |                                                         |
  |  Remaining:                                             |
  |  - Wave [N]: [X] tasks pending                          |
  |                                                         |
  |  Run: /goop-execute                                     |
  +--------------------------------------------------------+
```

**1.2 Check for blockers:**

```
IF unresolved blockers exist:
  REFUSE with:
  
  +--------------------------------------------------------+
  |  GOOPSPEC > BLOCKERS UNRESOLVED                         |
  +--------------------------------------------------------+
  |  Cannot accept with active blockers:                    |
  |                                                         |
  |  - [Blocker 1]                                          |
  |  - [Blocker 2]                                          |
  |                                                         |
  |  Resolve blockers, then retry.                          |
  +--------------------------------------------------------+
```

**1.3 Gate passed:**

```
+--------------------------------------------------------+
|  GOOPSPEC > ACCEPTANCE                                  |
+--------------------------------------------------------+
|  Execution gate: PASSED                                  |
|  Running verification...                                 |
+--------------------------------------------------------+
```

### Phase 2: Run Verification

**Spawn goop-verifier:**

```
task({
  subagent_type: "goop-verifier",
  description: "Verify against specification",
  prompt: `
## TASK
Verify implementation against SPEC.md

## REQUIREMENTS
[Full SPEC.md content]

## BLUEPRINT
[Full BLUEPRINT.md content - for traceability]

## CHRONICLE
[Progress log - what was built]

## INSTRUCTIONS
1. Verify every must-have has:
   - Implementation (code exists)
   - Tests (coverage)
   - Acceptance criteria met

2. Build requirement matrix:
   | Must-Have | Status | Evidence |
   
3. Run security checklist

4. Check for regressions

5. Return XML with VERIFICATION PASSED/FAILED
  `
})
```

**Spawn goop-tester (parallel):**

```
task({
  subagent_type: "goop-tester",
  description: "Run test suite",
  prompt: `
## TASK
Run complete test suite and report results

## INSTRUCTIONS
1. Run: bun test
2. Run: bun run typecheck
3. Report coverage
4. Flag any failures
5. Return XML with test results
  `
})
```

### Phase 3: Present Verification Report

**Parse XML responses and present:**

```
+--------------------------------------------------------+
|  GOOPSPEC > VERIFICATION REPORT                         |
+--------------------------------------------------------+

## Requirement Matrix

| Must-Have | Status | Evidence |
|-----------|--------|----------|
| MH1: [Title] | PASS | Tests: 5/5, Commit: abc123 |
| MH2: [Title] | PASS | Tests: 3/3, Commit: def456 |
| MH3: [Title] | PASS | Manual: UI verified |

## Test Results

| Suite | Passed | Failed | Coverage |
|-------|--------|--------|----------|
| Unit | 42 | 0 | 87% |
| Integration | 8 | 0 | 92% |

## Security Check

| Check | Status |
|-------|--------|
| No hardcoded secrets | PASS |
| Input validation | PASS |
| Auth on protected routes | PASS |

## Overall: [PASSED/FAILED]

+--------------------------------------------------------+
```

**If FAILED:**

```
+--------------------------------------------------------+
|  GOOPSPEC > VERIFICATION FAILED                         |
+--------------------------------------------------------+

**Failures:**

| Must-Have | Issue | Resolution |
|-----------|-------|------------|
| MH2 | Test failing | Fix auth edge case |
| MH3 | Missing feature | Implement retry logic |

+--------------------------------------------------------+

**Options:**
1. Fix issues → /goop-execute to continue
2. Amend spec → /goop-amend to change requirements
3. Accept anyway → Type "accept-with-issues"

+--------------------------------------------------------+
```

### Phase 4: Request Acceptance

**If PASSED:**

```
+--------------------------------------------------------+
|  GOOPSPEC > ACCEPTANCE GATE                             |
+--------------------------------------------------------+

**Verification:** PASSED
**Must-Haves:** [N/N] complete
**Tests:** [X] passing

+--------------------------------------------------------+

Type **"accept"** to complete this milestone.
Type **"issues"** to report problems.
Type **"cancel"** to return to execution.

+--------------------------------------------------------+
```

### Phase 5: Handle Response

**On "accept":**

1. Update state.json:
```json
{
  "phase": "accept",
  "verification_passed": true,
  "user_accepted": true,
  "accepted_at": "[timestamp]"
}
```

2. Save to memory:
```
memory_save({
  type: "decision",
  title: "Accepted: [Feature]",
  content: "User accepted [feature] with [N] must-haves verified",
  importance: 0.8
})
```

3. Generate HANDOFF.md:
```markdown
# Session Handoff

**Phase:** accept

## Accomplished
- All must-haves verified
- Tests passing
- User accepted

## Next Session
Run: /goop-complete

## Context
Verification passed. Ready to archive.
```

4. Display completion:
```
+--------------------------------------------------------+
|  GOOPSPEC > ACCEPTED                                    |
+--------------------------------------------------------+

**Feature:** [Name]
**Status:** Accepted
**Verified:** [timestamp]

+--------------------------------------------------------+

## > Next Step

**Complete the milestone** — Archive and extract learnings

`/goop-complete`

Start a new session for clean archive.

+--------------------------------------------------------+
```

**On "issues":**

```
What issues did you find?

[Use question tool or text input]
```

Then:
1. Log issues in CHRONICLE.md
2. Return to execution phase
3. Suggest `/goop-execute` to fix

**On "accept-with-issues":**

1. Log that acceptance was with known issues
2. Document issues in CHRONICLE.md
3. Proceed to acceptance

```
+--------------------------------------------------------+
|  GOOPSPEC > ACCEPTED WITH ISSUES                        |
+--------------------------------------------------------+

**Known Issues:**
- [Issue 1]
- [Issue 2]

These will be documented in the retrospective.

## > Next Step
`/goop-complete`
+--------------------------------------------------------+
```

## Output

| File | Purpose |
|------|---------|
| `.goopspec/state.json` | Updated with acceptance |
| `.goopspec/CHRONICLE.md` | Verification results |
| `.goopspec/HANDOFF.md` | Session handoff |

## Transitions

| Outcome | Next Step |
|---------|-----------|
| Accepted | `/goop-complete` to archive |
| Verification failed | `/goop-execute` to fix |
| Issues reported | `/goop-execute` to address |
| Spec needs change | `/goop-amend` to modify |

## Examples

**Successful Acceptance:**
```
User: /goop-accept

Orchestrator:
+--------------------------------------------------------+
|  GOOPSPEC > VERIFICATION REPORT                         |
+--------------------------------------------------------+

| Must-Have | Status | Evidence |
|-----------|--------|----------|
| MH1: Toggle UI | PASS | Tests: 3/3 |
| MH2: Theme switch | PASS | Tests: 5/5 |
| MH3: Persist pref | PASS | Tests: 2/2 |

## Overall: PASSED

Type "accept" to complete.

User: accept

Orchestrator:
+--------------------------------------------------------+
|  GOOPSPEC > ACCEPTED                                    |
+--------------------------------------------------------+

## > Next Step
`/goop-complete`
```

**Verification Failed:**
```
User: /goop-accept

Orchestrator:
+--------------------------------------------------------+
|  GOOPSPEC > VERIFICATION FAILED                         |
+--------------------------------------------------------+

**Failures:**
| MH2 | Test failing | edge case in theme switch |

**Options:**
1. Fix issues → /goop-execute
2. Accept anyway → "accept-with-issues"

User: Let's fix it

Orchestrator: Run `/goop-execute` to continue.
```

## Success Criteria

- [ ] Gate check performed (execution complete, no blockers)
- [ ] goop-verifier spawned with full context
- [ ] goop-tester spawned for test suite
- [ ] Verification report presented clearly
- [ ] Requirement matrix shows all must-haves
- [ ] User explicitly typed "accept"
- [ ] state.json updated with acceptance
- [ ] HANDOFF.md generated
- [ ] User knows next step is `/goop-complete`

## Anti-Patterns

**DON'T:**
- Skip the execution completion check
- Accept without running verification
- Auto-accept without user confirmation
- Skip handoff generation

**DO:**
- Verify every must-have has evidence
- Present clear verification report
- Require explicit "accept" keyword
- Document any accepted issues

---

*Acceptance Protocol v0.1.4*
*"Verify everything. Accept explicitly."*
