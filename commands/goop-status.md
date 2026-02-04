---
name: goop-status
description: Show current GoopSpec status and next steps
---

# /goop-status

**Show project status.** View progress, active phase, gates, and suggested next command.

## Usage

```bash
/goop-status [--verbose]
```

## Tools Used

| Tool | Purpose in This Command |
|------|------------------------|
| `goop_status` | Primary tool - retrieves full workflow state |
| `memory_search` | Optionally find recent context |

**Hook Support:** None specific - read-only operation.

---

## Process

**Execute these reads:**

```
Read(".goopspec/state.json")
Read(".goopspec/REQUIREMENTS.md")
Read(".goopspec/SPEC.md")
Read(".goopspec/BLUEPRINT.md")
Read(".goopspec/CHRONICLE.md")
Read(".goopspec/HANDOFF.md")
```

## Status Dashboard

Display a comprehensive status view:

```
+--------------------------------------------------------+
|  GOOPSPEC STATUS                                        |
+--------------------------------------------------------+

## Project State

| Attribute | Value |
|-----------|-------|
| Phase | [current phase] |
| Interview Complete | [Yes/No] |
| Spec Locked | [Yes/No] |
| Wave | [N of M] |
| Task | [X of Y] |

## Gate Status

| Gate | Status | Requirement |
|------|--------|-------------|
| Discovery | [PASSED/BLOCKED] | interview_complete |
| Spec | [PASSED/BLOCKED] | spec_locked |
| Execution | [PASSED/BLOCKED] | all_tasks_done |
| Acceptance | [PASSED/BLOCKED] | verification_passed |

## Progress

[Progress bar and completion percentage]

### Completed
- [x] [Item 1]
- [x] [Item 2]

### In Progress
- [ ] [Current item] <- **Current**

### Remaining
- [ ] [Item 3]
- [ ] [Item 4]

## Active Blockers

[None | List of blockers]

## Pending Decisions

[None | List of decisions awaiting user input]

## Recent Activity

| Time | Action | Agent |
|------|--------|-------|
| [time] | [action] | [agent] |

+--------------------------------------------------------+

## > Suggested Next Command

Based on current state: `/goop-[command]`

[Brief explanation of why this is suggested]

+--------------------------------------------------------+
```

## Information Sources

| Source | Information |
|--------|-------------|
| `state.json` | Phase, locks, timestamps |
| `REQUIREMENTS.md` | Interview status |
| `SPEC.md` | Must-haves, lock status |
| `BLUEPRINT.md` | Waves, tasks, traceability |
| `CHRONICLE.md` | Progress, decisions, blockers |
| `HANDOFF.md` | Last session context |

## Gate Logic

### Discovery Gate
```
IF REQUIREMENTS.md exists AND interview_complete == true:
  PASSED
ELSE:
  BLOCKED - Run /goop-discuss
```

### Spec Gate
```
IF SPEC.md exists AND spec_locked == true:
  PASSED
ELSE:
  BLOCKED - Run /goop-specify
```

### Execution Gate
```
IF CHRONICLE shows all waves complete:
  PASSED
ELSE:
  BLOCKED - Continue /goop-execute
```

### Acceptance Gate
```
IF verification_passed == true AND user_accepted == true:
  PASSED
ELSE:
  BLOCKED - Run /goop-accept
```

## Suggested Commands

Based on current state, suggest the appropriate next command:

| State | Suggested Command |
|-------|-------------------|
| No project | `/goop-discuss` to start discovery |
| Interview incomplete | `/goop-discuss` to complete interview |
| Interview complete, no spec | `/goop-plan` to create blueprint |
| Spec draft, not locked | `/goop-specify` to lock |
| Spec locked, not executing | `/goop-execute` to start |
| Executing, tasks remaining | `/goop-execute` to continue |
| Executing, all done | `/goop-accept` to verify |
| Verified, not accepted | `/goop-accept` to accept |
| Accepted | `/goop-complete` to archive |

## Verbose Mode

With `--verbose`:

```
## Full Task History

| Wave | Task | Status | Commit | Time |
|------|------|--------|--------|------|
| 1 | 1.1 | Complete | abc123 | 10m |
| 1 | 1.2 | Complete | def456 | 15m |
| 2 | 2.1 | In Progress | - | - |

## Memory Stats

- Total memories: [N]
- Decisions: [M]
- Observations: [P]
- Recent: [list]

## Recent Deviations

| Rule | Description | Resolution |
|------|-------------|------------|
| [N] | [What happened] | [How resolved] |

## Checkpoint History

| ID | Phase | Wave | Created |
|----|-------|------|---------|
| [id] | [phase] | [wave] | [time] |
```

## Examples

**Fresh Project:**
```
User: /goop-status

+--------------------------------------------------------+
|  GOOPSPEC STATUS                                        |
+--------------------------------------------------------+

## Project State

| Attribute | Value |
|-----------|-------|
| Phase | idle |
| Interview Complete | No |
| Spec Locked | No |

## Gate Status

| Gate | Status |
|------|--------|
| Discovery | BLOCKED |
| Spec | BLOCKED |
| Execution | BLOCKED |
| Acceptance | BLOCKED |

## > Suggested Next Command

`/goop-discuss` - Start discovery interview

No project documents found. Begin with discovery.
```

**Mid-Execution:**
```
User: /goop-status

+--------------------------------------------------------+
|  GOOPSPEC STATUS                                        |
+--------------------------------------------------------+

## Project State

| Attribute | Value |
|-----------|-------|
| Phase | execute |
| Interview Complete | Yes |
| Spec Locked | Yes |
| Wave | 2 of 3 |
| Task | 3 of 4 |

## Gate Status

| Gate | Status |
|------|--------|
| Discovery | PASSED |
| Spec | PASSED |
| Execution | In Progress |
| Acceptance | Pending |

## Progress

[################____] 75%

### Completed
- [x] Wave 1: Foundation (4/4 tasks)
- [x] Wave 2.1: Define types
- [x] Wave 2.2: Implement handler

### In Progress
- [ ] Wave 2.3: Add validation <- **Current**

### Remaining
- [ ] Wave 2.4: Add tests
- [ ] Wave 3: Integration (3 tasks)

## > Suggested Next Command

`/goop-execute` - Continue Wave 2

2 tasks remaining in Wave 2, then Wave 3.
```

## Success Criteria

- [ ] All state files read
- [ ] Phase correctly identified
- [ ] Gate status accurately shown
- [ ] Progress clearly displayed
- [ ] Blockers highlighted
- [ ] Next command suggested based on state
- [ ] Verbose mode shows full history

---

*Status Protocol v0.1.5*
*"Know where you are. Know where to go."*
