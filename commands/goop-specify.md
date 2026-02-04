---
name: goop-specify
description: Lock the specification contract
phase: specify
requires: planning_complete
next-step: "Once the spec is locked and confirmed, begin implementation"
next-command: /goop-execute
alternatives:
  - command: /goop-amend
    when: "If you need to modify the locked specification"
  - command: /goop-pause
    when: "To save progress and continue later"
---

# /goop-specify

**Lock the specification.** Create a binding contract between user and agent.

## Usage

```bash
/goop-specify
```

## Gate Requirement

```
+================================================================+
|  SPEC GATE: Planning must be complete before locking.           |
|  SPEC.md and BLUEPRINT.md must exist with full traceability.    |
+================================================================+
```

**Required before this command:**
- `.goopspec/SPEC.md` exists
- `.goopspec/BLUEPRINT.md` exists
- Traceability matrix shows 100% coverage

**If not satisfied:** Refuse and redirect to `/goop-plan`

## Tools Used

| Tool | Purpose in This Command |
|------|------------------------|
| `goop_status` | Check current phase and readiness |
| `goop_state` | **Lock the specification** - NEVER edit state.json directly |
| `goop_spec` | Validate spec structure |
| `memory_search` | Find relevant prior context |
| `goop_adl` | Log the spec lock decision |

**CRITICAL: Never read or edit .goopspec/state.json directly. Always use `goop_state` tool.**

---

## Process

### Phase 1: Gate Check

**Execute BEFORE anything else:**

```
goop_status()
Read(".goopspec/SPEC.md")
Read(".goopspec/BLUEPRINT.md")
```

**1.1 Check documents exist:**

```
IF .goopspec/SPEC.md does not exist:
  REFUSE with:
  
  ## 🔮 GoopSpec · Gate Blocked
  
  ✗ No specification found.
  
  → Run: `/goop-plan`
  
  ---
```

**1.2 Check traceability:**

```
IF traceability matrix shows < 100%:
  REFUSE with:
  
  ## 🔮 GoopSpec · Traceability Incomplete
  
  ✗ Not all must-haves have mapped tasks.
  
  → Update BLUEPRINT.md or re-run `/goop-plan`
  
  ---
```

### Phase 2: Present Contract

**Display the contract for confirmation:**

```
## 🔮 GoopSpec · Contract Gate

📜 Review and confirm the specification

### SPECIFICATION: [Name]

#### Must-Haves (The Contract)

| ID | Requirement | Covered By |
|----|-------------|------------|
| MH1 | [Title] | Wave X, Tasks Y |
| MH2 | [Title] | Wave X, Tasks Y |

#### Out of Scope

- [Item 1]
- [Item 2]

#### Execution Plan

| Wave | Focus | Tasks |
|------|-------|-------|
| 1 | [Name] | [N] |
| 2 | [Name] | [M] |

✓ Traceability: 100%

---

⚠️ **Action Required:**
- Type **"confirm"** to lock the specification
- Type **"amend"** to modify requirements
- Type **"cancel"** to return to planning
```

### Phase 3: Handle Response

**On "confirm":**

1. Lock the spec using goop_state:
```
goop_state({ action: "lock-spec" })
```

This atomically updates the workflow state. **NEVER edit state.json directly.**

2. Update SPEC.md:
```markdown
**Status:** Locked
**Locked At:** [timestamp]
```

3. Save to memory:
```
memory_decision({
  decision: "Spec locked for [feature]",
  reasoning: "User confirmed requirements after review",
  impact: "high"
})
```

4. Generate HANDOFF.md:
```
# Session Handoff

**Phase:** specify

## Accomplished
- Spec locked with [N] must-haves
- Traceability verified at 100%

## Next Session
Run: /goop-execute

## Context
Specification locked. Ready for execution.
```

5. Display completion:
```
## 🔮 GoopSpec · Specification Locked

🔒 The spec is now a binding contract

| Status | Value |
|--------|-------|
| Locked | ✓ Yes |
| Must-Haves | [N] |
| Waves | [M] |
| Tasks | [P] |

Changes now require `/goop-amend` with impact analysis.

### Next Step

**Begin execution** — Implement the blueprint

→ `/goop-execute`

---

Start a **new session** for fresh context, then run the command.
```

**On "amend":**

```
## 🔮 GoopSpec · Amendment Mode

What would you like to change?

1. Add a must-have
2. Remove a must-have
3. Modify acceptance criteria
4. Change out of scope
5. Cancel

---
```

Use `question` tool to get choice, then process amendment.

**On "cancel":**

```
Specification not locked. Returning to planning.
Run `/goop-plan` to modify or `/goop-discuss` to restart discovery.
```

## Output

| File | Change |
|------|--------|
| `.goopspec/SPEC.md` | Status updated to "Locked" |
| State (via goop_state) | `specLocked: true` |
| `.goopspec/HANDOFF.md` | Session handoff generated |

## Transitions

| Outcome | Next Step |
|---------|-----------|
| Spec locked | `/goop-execute` to begin implementation |
| Amendments requested | Process changes, re-present contract |
| Cancelled | `/goop-plan` to modify planning |

## Amendment Protocol (After Lock)

Once locked, changes require formal amendment:

1. **Propose change:** User describes modification
2. **Impact analysis:** Orchestrator assesses affected tasks
3. **Blueprint update:** Modify BLUEPRINT.md if needed
4. **Re-confirm:** User confirms amended spec
5. **Log amendment:** Add to SPEC.md amendment history

```markdown
## Amendment History

| Version | Date | Change | Impact | Approved |
|---------|------|--------|--------|----------|
| 1.1 | [date] | Added MH3 | +1 task | User |
```

## Examples

**Successful Lock:**
```
User: /goop-specify

Orchestrator:
+--------------------------------------------------------+
|  GOOPSPEC > CONTRACT GATE                               |
+--------------------------------------------------------+

## SPECIFICATION: Dark Mode Toggle

### Must-Haves
| ID | Requirement | Covered By |
|----|-------------|------------|
| MH1 | Toggle UI | W1.T1 |
| MH2 | Theme switch | W1.T2, W2.T1 |
| MH3 | Persist preference | W2.T2 |

### Out of Scope
- Multiple themes (beyond light/dark)
- Per-component theming

### Traceability: 100%

Type "confirm" to lock.

User: confirm

Orchestrator:
+--------------------------------------------------------+
|  GOOPSPEC > SPECIFICATION LOCKED                        |
+--------------------------------------------------------+

## > Next Step
`/goop-execute`
```

**Gate Blocked:**
```
User: /goop-specify

Orchestrator:
+--------------------------------------------------------+
|  GOOPSPEC > GATE BLOCKED                                |
+--------------------------------------------------------+
|  No specification found.                                |
|  Run: /goop-plan                                        |
+--------------------------------------------------------+
```

## Success Criteria

- [ ] Gate check performed (SPEC.md + BLUEPRINT.md exist)
- [ ] Traceability verified at 100%
- [ ] Contract presented clearly with must-haves and out-of-scope
- [ ] User explicitly confirmed with "confirm"
- [ ] State updated via `goop_state({ action: "lock-spec" })`
- [ ] SPEC.md updated with Locked status
- [ ] HANDOFF.md generated
- [ ] User knows next step is `/goop-execute`

## Anti-Patterns

**DON'T:**
- Skip the gate check
- Lock without user confirmation
- Proceed with incomplete traceability
- Skip handoff generation

**DO:**
- Verify 100% traceability before presenting
- Require explicit "confirm" keyword
- Log the lock to memory
- Generate clear handoff

---

*Specification Lock Protocol v0.1.4*
*"The spec is a contract. Lock it before you build."*
