# Execution Process

Detailed process for `/goop-execute` - wave-based implementation of the blueprint.

## Phase 1: Gate Check

**Execute BEFORE anything else:**

```
goop_status()
goop_state({ action: "get" })        # NEVER read state.json directly
Read(".goopspec/BLUEPRINT.md")
```

### 1.1 Check specLocked

```
IF state.specLocked != true:
  REFUSE with:
  
  ## 🔮 GoopSpec · Gate Blocked
  
  ✗ Specification must be locked before execution.
  
  → Run: `/goop-specify`
  
  ---
```

### 1.2 Gate passed

```
## 🔮 GoopSpec · Execution

✓ Spec gate passed

⚡ Starting wave-based execution...

---
```

---

## Phase 2: Load Context

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

---

## Phase 3: Wave Execution Loop

**Display wave start:**

```
## 🔮 GoopSpec · Wave [N] of [M]: [Wave Name]

**Tasks:** [X] | **Execution:** [Parallel/Sequential]

---
```

**For each task in wave:**

### 3.1 Delegate to executor

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

### 3.2 Parse XML response

- Extract status (COMPLETE/PARTIAL/BLOCKED)
- Extract artifacts (files, commits)
- Extract handoff instructions

### 3.3 Update CHRONICLE.md

```markdown
### Task [N.M]: [Name]
- Status: [Complete/Partial/Blocked]
- Commit: [sha]
- Files: [list]
- Time: [timestamp]
```

### 3.4 Handle status

| Status | Action |
|--------|--------|
| COMPLETE | Continue to next task |
| PARTIAL | Resume with partial context |
| BLOCKED | Check deviation rules |

---

## Phase 4: Deviation Handling

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

---

## Phase 5: Wave Completion

**At end of each wave:**

### 5.1 Run wave verification
```
Spawn goop-verifier for wave-level checks
```

### 5.2 Update CHRONICLE.md
```markdown
## Wave [N]: COMPLETE
- Tasks: [X/X]
- Commits: [list]
- Verification: PASSED
- Time: [timestamp]
```

### 5.3 Save checkpoint
```
goop_checkpoint({ 
  action: "save",
  context: { wave: N, phase: "execute" }
})
```

### 5.4 Generate HANDOFF.md
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

### 5.5 Suggest new session
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

---

## Phase 6: Execution Complete

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
```

### 6.1 Offer Pull Request Creation

Use `question` tool:
- header: "Pull Request"
- question: "Execution complete. Would you like to create a pull request now?"
- options:
  - "Create PR" — Create a well-formatted pull request
  - "Create draft PR" — Create as draft, finalize after acceptance
  - "Skip for now (Recommended)" — Create PR after verification in /goop-accept

**On "Create PR" or "Create draft PR":**

Follow the PR creation process from git-workflow reference:

1. Check branch status:
```bash
git branch --show-current
git log main..HEAD --oneline
git diff main...HEAD --stat
```

2. Generate PR title and description:
- **Title:** `type(scope): Descriptive summary` (no GoopSpec terminology)
- **Body:** Summary, Changes, Testing (from CHRONICLE.md), Notes

3. Create PR:
```bash
gh pr create --title "type(scope): Title" --body "..." [--draft]
```

4. Display PR URL

### 6.2 Display next steps

```
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

---

## Examples

### Starting Execution
```
User: /goop-execute

Orchestrator:
## 🔮 GoopSpec · Execution

✓ Spec gate passed

## 🔮 GoopSpec · Wave 1 of 3: Foundation

[Delegating Task 1.1...]

goop-executor: Task 1.1 COMPLETE (commit: abc123)

[Delegating Task 1.2...]

goop-executor: Task 1.2 COMPLETE (commit: def456)

## 🔮 GoopSpec · Wave 1 Complete

**Recommend:** Start new session for Wave 2
```

### Checkpoint Reached
```
goop-executor: BLOCKED - Rule 4 deviation

## 🔮 GoopSpec · Decision Required

**Context:** Database schema change needed

**Options:**
| A | Add index | Better performance |
| B | Skip index | Faster deployment |

Which option?

User: A

Orchestrator: Resuming with Option A...
```

---

*Execution Process v0.2.1*
