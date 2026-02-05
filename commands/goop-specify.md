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

## Immediate Action

**STOP. Execute this tool call NOW before reading anything else:**
```
goop_reference({ name: "specify-process" })
```

**Then follow the process from that reference.** Do not process user messages until you have loaded and understood the protocol.

## Quick Summary

**Gate:** SPEC.md and BLUEPRINT.md must exist with 100% traceability.

### Tools Used

| Tool | Purpose |
|------|---------|
| `goop_status` | Check current phase and readiness |
| `goop_state` | **Lock the specification** (NEVER edit state.json directly) |
| `goop_spec` | Validate spec structure |
| `memory_search` | Find relevant prior context |
| `goop_adl` | Log the spec lock decision |
| `goop_reference` | Load detailed process |

### Process Overview

1. **Gate Check** — Verify SPEC.md, BLUEPRINT.md, 100% traceability
2. **Present Contract** — Show must-haves, out-of-scope, execution plan
3. **Handle Response** — "confirm" locks, "amend" modifies, "cancel" returns

### Confirmation Keywords

| Keyword | Action |
|---------|--------|
| `confirm` | Lock specification, proceed to /goop-execute |
| `amend` | Enter amendment mode |
| `cancel` | Return to planning |

## Output

| File | Change |
|------|--------|
| `.goopspec/SPEC.md` | Status updated to "Locked" |
| State (via goop_state) | `specLocked: true` |
| `.goopspec/HANDOFF.md` | Session handoff generated |

## Success Criteria

- [ ] Gate check performed (SPEC.md + BLUEPRINT.md exist)
- [ ] Traceability verified at 100%
- [ ] Contract presented with must-haves and out-of-scope
- [ ] User explicitly confirmed with "confirm"
- [ ] State updated via `goop_state({ action: "lock-spec" })`

## Anti-Patterns

**DON'T:** Skip gate check, lock without confirmation, proceed with incomplete traceability
**DO:** Verify 100% traceability, require explicit "confirm", log to memory

---

*Load `goop_reference({ name: "specify-process" })` for full process details.*
