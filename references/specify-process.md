# Specification Lock Process

Detailed process for `/goop-specify` - locking the specification contract.

## Phase 1: Gate Check

**Execute BEFORE anything else:**

```
goop_status()
Read(".goopspec/SPEC.md")
Read(".goopspec/BLUEPRINT.md")
```

### 1.1 Check documents exist

```
IF .goopspec/SPEC.md does not exist:
  REFUSE with:
  
  ## 🔮 GoopSpec · Gate Blocked
  
  ✗ No specification found.
  
  → Run: `/goop-plan`
  
  ---
```

### 1.2 Check traceability

```
IF traceability matrix shows < 100%:
  REFUSE with:
  
  ## 🔮 GoopSpec · Traceability Incomplete
  
  ✗ Not all must-haves have mapped tasks.
  
  → Update BLUEPRINT.md or re-run `/goop-plan`
  
  ---
```

---

## Phase 2: Present Contract

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

---

## Phase 3: Handle Response

**On "confirm":**

1. Lock the spec using goop_state:
```
goop_state({ action: "lock-spec" })
```

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
```markdown
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

---

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

---

## Examples

### Successful Lock
```
User: /goop-specify

Orchestrator:
## 🔮 GoopSpec · Contract Gate

### SPECIFICATION: Dark Mode Toggle

#### Must-Haves
| ID | Requirement | Covered By |
|----|-------------|------------|
| MH1 | Toggle UI | W1.T1 |
| MH2 | Theme switch | W1.T2, W2.T1 |
| MH3 | Persist preference | W2.T2 |

#### Out of Scope
- Multiple themes (beyond light/dark)
- Per-component theming

✓ Traceability: 100%

Type "confirm" to lock.

User: confirm

Orchestrator:
## 🔮 GoopSpec · Specification Locked

→ Next: `/goop-execute`
```

### Gate Blocked
```
User: /goop-specify

Orchestrator:
## 🔮 GoopSpec · Gate Blocked

✗ No specification found.

→ Run: `/goop-plan`
```

---

*Specification Lock Process v0.2.1*
