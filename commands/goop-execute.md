---
name: goop-execute
description: Begin wave-based execution
phase: execute
requires: spec_locked
next-step: "When all waves are complete, verify the work and request acceptance"
next-command: /goop-accept
alternatives:
  - command: /goop-status
    when: "To check current progress and wave status"
  - command: /goop-pause
    when: "To save a checkpoint and continue later"
---

# /goop-execute

**Start the Execution Phase.** Implement the blueprint using wave-based orchestration.

## Usage

```bash
/goop-execute
```

## Gate Requirement

```
+================================================================+
|  EXECUTION GATE: Specification must be locked before executing. |
|  This ensures we build what was agreed upon.                    |
+================================================================+
```

**Required before this command:**
- `specLocked: true` (check via `goop_state({ action: "get" })`)
- `.goopspec/BLUEPRINT.md` exists with wave structure

**If not satisfied:** Refuse and redirect to `/goop-specify`

**CRITICAL: Never read or edit .goopspec/state.json directly. Always use `goop_state` tool.**

## Tools Used

| Tool | Purpose in This Command |
|------|------------------------|
| `goop_status` | Check spec lock status and wave progress |
| `goop_state` | **ALL state operations** - check spec lock, update wave progress. NEVER edit state.json directly |
| `goop_spec` | Load blueprint for execution |
| `goop_checkpoint` | Save state at wave boundaries |
| `goop_delegate` | Spawn executor agents for implementation |
| `goop_adl` | Log deviations during execution |
| `memory_search` | Find relevant patterns and conventions |

**Hook Support:** `tool.execute.after` auto-progresses to accept phase when all waves complete.

---

## Process

### Phase 1: Gate Check

**Execute BEFORE anything else:**

```
goop_status()
goop_state({ action: "get" })        # NEVER read state.json directly
Read(".goopspec/BLUEPRINT.md")
```

**1.1 Check specLocked:**

```
IF state.specLocked != true:
  REFUSE with:
  
  ## 🔮 GoopSpec · Gate Blocked
  
  ✗ Specification must be locked before execution.
  
  → Run: `/goop-specify`
  
  ---
```

**1.2 Gate passed:**

```
## 🔮 GoopSpec · Execution

✓ Spec gate passed

⚡ Starting wave-based execution...

---
```

### Phase 2: Load Context

```
Read(".goopspec/SPEC.md")           # Must-haves
Read(".goopspec/BLUEPRINT.md")      # Waves and tasks
Read(".goopspec/CHRONICLE.md")      # Progress (if resuming)
Read(".goopspec/PROJECT_KNOWLEDGE_BASE.md")  # Conventions

memory_search({ query: "[feature] implementation patterns" })
```

Identify:
- Current wave (from CHRONICLE or start at 1)
- Tasks to execute
- Dependencies between tasks

### Phase 3: Wave Execution Loop

**Display wave start:**

```
## 🔮 GoopSpec · Wave [N] of [M]: [Wave Name]

**Tasks:** [X] | **Execution:** [Parallel/Sequential]

---
```

**For each task in wave:**

1. **Delegate to executor:**
```
task({
  subagent_type: "goop-executor",
  description: "Execute Task [N.M]",
  prompt: `
## TASK
Wave [N], Task [M]: [Task Name]

## PROJECT CONTEXT
[From PROJECT_KNOWLEDGE_BASE.md]

## SPEC REQUIREMENTS
[Relevant must-have from SPEC.md]

## TASK DETAILS
[From BLUEPRINT.md]

Intent: [intent]
Deliverables: [list]
Files: [paths]
Verification: [command]
Acceptance: [criteria]

## INSTRUCTIONS
1. Implement following existing patterns
2. Commit atomically
3. Return XML response envelope
4. Include spec coverage in response
  `
})
```

2. **Parse XML response:**
   - Extract status (COMPLETE/PARTIAL/BLOCKED)
   - Extract artifacts (files, commits)
   - Extract handoff instructions

3. **Update CHRONICLE.md:**
```markdown
### Task [N.M]: [Name]
- Status: [Complete/Partial/Blocked]
- Commit: [sha]
- Files: [list]
- Time: [timestamp]
```

4. **Handle status:**

| Status | Action |
|--------|--------|
| COMPLETE | Continue to next task |
| PARTIAL | Resume with partial context |
| BLOCKED | Check deviation rules |

### Phase 4: Deviation Handling

**Apply deviation rules:**

| Rule | Trigger | Action |
|------|---------|--------|
| Rule 1 | Bug found | Auto-fix, document |
| Rule 2 | Missing critical | Auto-add, document |
| Rule 3 | Blocking issue | Auto-fix, document |
| Rule 4 | Architectural | **STOP**, ask user |

**On Rule 4:**
```
## 🔮 GoopSpec · Decision Required

⚠️ **Type:** Architectural Decision

**Context:** [From executor response]

**Options:**
- **A)** [option] — [impact]
- **B)** [option] — [impact]

**Recommendation:** [If any]

Which option? (A/B/other)

---
```

Use `question` tool, then resume with decision.

### Phase 5: Wave Completion

**At end of each wave:**

1. **Run wave verification:**
```
Spawn goop-verifier for wave-level checks
```

2. **Update CHRONICLE.md:**
```markdown
## Wave [N]: COMPLETE
- Tasks: [X/X]
- Commits: [list]
- Verification: PASSED
- Time: [timestamp]
```

3. **Save checkpoint:**
```
goop_checkpoint({ 
  action: "save",
  context: { wave: N, phase: "execute" }
})
```

4. **Generate HANDOFF.md:**
```markdown
# Session Handoff

**Phase:** execute
**Wave:** [N] of [M] complete

## Accomplished
- [x] Task N.1: [description]
- [x] Task N.2: [description]

## Next Session
Run: /goop-execute

## Context
Wave [N] complete. Starting Wave [N+1] next.
```

5. **Suggest new session:**
```
## 🔮 GoopSpec · Wave [N] Complete

✨ Wave finished successfully

| Metric | Status |
|--------|--------|
| Tasks | ✓ [X/X] complete |
| Commits | [Y] |
| Verification | ✓ PASSED |

### Next

**Option A:** Continue to Wave [N+1] (current session)
**Option B:** Start new session for fresh context (Recommended)

For Option B:
1. Start a new session
2. Run: `/goop-execute`

---
```

### Phase 6: Execution Complete

**When all waves done:**

```
## 🔮 GoopSpec · Execution Complete

✨ All waves finished successfully

| Metric | Status |
|--------|--------|
| Waves | ✓ [M/M] complete |
| Tasks | ✓ [P/P] complete |
| Commits | [Q] |

All must-haves implemented and verified.

### Next Step

**Verify and accept** — Final verification against spec

→ `/goop-accept`

---

Start a new session for fresh context.
```

Update state using goop_state:
```
goop_state({ action: "transition", phase: "accept" })
```

This atomically updates the workflow state. **NEVER edit state.json directly.**

## Output

| File | Purpose |
|------|---------|
| Source files | Implementation |
| Commits | Atomic changes |
| `.goopspec/CHRONICLE.md` | Progress log |
| `.goopspec/HANDOFF.md` | Session handoff |

## Transitions

| Outcome | Next Step |
|---------|-----------|
| All waves complete | `/goop-accept` for verification |
| Checkpoint reached | `/goop-pause` to save, resume later |
| Wave complete | Continue or new session |
| Gate blocked | `/goop-specify` to lock spec |

## Examples

**Starting Execution:**
```
User: /goop-execute

Orchestrator:
+--------------------------------------------------------+
|  GOOPSPEC > EXECUTION                                   |
+--------------------------------------------------------+
|  Spec gate: PASSED                                       |
|  Starting wave-based execution...                        |
+--------------------------------------------------------+

+--------------------------------------------------------+
|  GOOPSPEC > WAVE 1 of 3: Foundation                     |
+--------------------------------------------------------+

[Delegating Task 1.1...]

goop-executor: Task 1.1 COMPLETE (commit: abc123)

[Delegating Task 1.2...]

goop-executor: Task 1.2 COMPLETE (commit: def456)

+--------------------------------------------------------+
|  GOOPSPEC > WAVE 1 COMPLETE                             |
+--------------------------------------------------------+

**Recommend:** Start new session for Wave 2
```

**Checkpoint Reached:**
```
goop-executor: BLOCKED - Rule 4 deviation

+--------------------------------------------------------+
|  GOOPSPEC > CHECKPOINT: Decision Required               |
+--------------------------------------------------------+

**Context:** Database schema change needed

**Options:**
| A | Add index | Better performance |
| B | Skip index | Faster deployment |

Which option?

User: A

Orchestrator: Resuming with Option A...
```

## Success Criteria

- [ ] Gate check performed (spec_locked)
- [ ] Project context loaded (KNOWLEDGE_BASE, memory)
- [ ] Each task delegated with full context
- [ ] XML responses parsed correctly
- [ ] CHRONICLE.md updated after each task
- [ ] Deviation rules applied (auto-fix or checkpoint)
- [ ] Checkpoints saved at wave boundaries
- [ ] HANDOFF.md generated at natural pauses
- [ ] User informed of progress throughout

## Anti-Patterns

**DON'T:**
- Skip the spec_locked gate
- Delegate without full context
- Ignore XML response status
- Skip wave-boundary checkpoints
- Continue indefinitely without handoffs

**DO:**
- Enforce the gate strictly
- Include PROJECT_KNOWLEDGE_BASE in delegations
- Parse and act on XML responses
- Save checkpoints at wave boundaries
- Suggest new sessions for fresh context

---

*Execution Protocol v0.1.4*
*"Execute in waves. Checkpoint often. Handoff clean."*
