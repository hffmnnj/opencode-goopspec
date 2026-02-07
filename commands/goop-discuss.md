---
name: goop-discuss
description: Capture user vision through discovery interview before planning
phase: discuss
next-step: "When discovery is complete, create the blueprint"
next-command: /goop-plan
alternatives:
  - command: /goop-research
    when: "If there are unknowns to investigate first"
  - command: /goop-quick
    when: "For small, single-file tasks that don't need planning"
---

# /goop-discuss

**Start the Discovery Interview.** Capture vision, requirements, constraints, and risks before planning.

## Immediate Action

**STOP. Execute this tool call NOW before reading anything else:**
```
goop_reference({ name: "discuss-process" })
```

**Then follow the process from that reference.** Do not process user messages until you have loaded and understood the protocol.

## Quick Summary

**You conduct the interview directly.** Do NOT spawn agents for conversation.

**Exception:** After the vision question, you offer opt-in creative brainstorming with The Visionary (`goop-creative`). This is the only agent delegation during the interview.

### The Six Questions

1. **Vision** — What are you building? What problem? Who for?
2. **Must-Haves** — Non-negotiable requirements and acceptance criteria
3. **Constraints** — Stack, frameworks, performance, timeline
4. **Out of Scope** — What we're NOT building
5. **Assumptions** — What we're relying on being true
6. **Risks** — What could go wrong? Mitigations?

### Tools Used

| Tool | Purpose |
|------|---------|
| `goop_status` | Check current phase |
| `goop_state` | Update workflow state (NEVER edit state.json directly) |
| `question` | Capture structured user choices (including depth selection) |
| `goop_delegate` | Delegate to creative agent (opt-in) |
| `memory_search` | Find prior context |
| `memory_save` | Persist interview results |
| `goop_reference` | Load detailed process |

## Output

- `.goopspec/REQUIREMENTS.md` — Discovery interview output
- State updated with `interviewComplete: true`

## Success Criteria

- [ ] Existing project documents archived (if present)
- [ ] Research depth selected (Light/Standard/Deep) before interview begins
- [ ] Depth persisted via `goop_state({ action: "set-depth", depth: "[shallow|standard|deep]" })`
- [ ] Creative agent opt-in offered after vision question (accepted or declined)
- [ ] All six questions answered with specifics
- [ ] At least 1 must-have, 1 out-of-scope, 1 risk defined
- [ ] REQUIREMENTS.md created
- [ ] State updated via `goop_state({ action: "complete-interview" })`

## Anti-Patterns

**DON'T:** Accept vague answers, skip risks, rush, auto-trigger creative agent
**DO:** Probe for specifics, challenge "no risks", conduct interview yourself, offer creative input as opt-in choice

---

*Load `goop_reference({ name: "discuss-process" })` for full process details.*
