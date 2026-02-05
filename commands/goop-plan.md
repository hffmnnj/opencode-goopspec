---
name: goop-plan
description: Create specification and blueprint from discovery interview
phase: plan
requires: interview_complete
next-step: "When planning is complete, lock the specification"
next-command: /goop-specify
alternatives:
  - command: /goop-discuss
    when: "If discovery interview was not completed"
  - command: /goop-research
    when: "If there are unknowns to investigate"
  - command: /goop-pause
    when: "To save progress and continue later"
---

# /goop-plan

**Create Specification and Blueprint.** Transform discovery interview into executable plans.

## Immediate Action

**STOP. Execute this tool call NOW before reading anything else:**
```
goop_reference({ name: "plan-process" })
```

**Then execute the gate checks from that reference.** Do not process user messages until gates are checked.

## Quick Summary

**Gate:** `interviewComplete: true` required. Check via `goop_state({ action: "get" })`.

**You check the gate, then spawn the planner.** The planner creates SPEC.md and BLUEPRINT.md.

### Tools Used

| Tool | Purpose |
|------|---------|
| `goop_status` | Check current phase and gate requirements |
| `goop_state` | Check/update workflow state (NEVER edit state.json directly) |
| `goop_spec` | Validate interview complete, load existing specs |
| `memory_search` | Find prior architecture decisions |
| `goop_reference` | Load detailed process |

### Process Overview

1. **Gate Check** — Verify `interviewComplete` and REQUIREMENTS.md exist
2. **Handle Existing** — Archive or continue if docs already exist
3. **Load Context** — Read REQUIREMENTS.md, search memory
4. **Create PROJECT_KNOWLEDGE_BASE.md** — If missing, generate from constraints
5. **Spawn goop-planner** — With full discovery context
6. **Generate HANDOFF.md** — For session continuity

## Output

| File | Purpose |
|------|---------|
| `.goopspec/SPEC.md` | Specification (Draft) |
| `.goopspec/BLUEPRINT.md` | Wave-based execution plan |
| `.goopspec/CHRONICLE.md` | Progress tracking |
| `.goopspec/HANDOFF.md` | Session handoff |
| `.goopspec/PROJECT_KNOWLEDGE_BASE.md` | Stack and conventions |

## Success Criteria

- [ ] Gate check performed (interview_complete + REQUIREMENTS.md)
- [ ] PROJECT_KNOWLEDGE_BASE.md created if missing
- [ ] goop-planner spawned with full discovery context
- [ ] 100% must-have coverage achieved
- [ ] User knows next step is `/goop-specify`

## Anti-Patterns

**DON'T:** Skip gate check, conduct interview here, create docs without traceability
**DO:** Enforce gate strictly, spawn planner with complete context, verify 100% traceability

---

*Load `goop_reference({ name: "plan-process" })` for full process details.*
