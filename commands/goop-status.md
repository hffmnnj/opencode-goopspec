---
name: goop-status
description: Show GoopSpec status and progress
---

# GoopSpec Status

Display the current status of your GoopSpec project and workflow progress.

## Usage

```
/goop-status
```

## Information Shown

### Project State
- Initialized: Yes/No
- Active: Yes/No
- Current milestone (if any)
- Task mode: Quick | Standard | Comprehensive | Milestone

### Current Workflow
- Phase: Plan | Research | Specify | Execute | Accept
- Spec locked: Yes/No
- Acceptance confirmed: Yes/No
- Last activity timestamp

### Execution Progress (if in Execute phase)
- Current wave: N of M
- Tasks completed in current wave
- Total tasks completed
- Recent commits

### Contract Status
- Specification locked at: [timestamp]
- Must-haves: N total
- Must-haves completed: N of M
- Nice-to-haves completed: N of M

### Checkpoints
- Total checkpoints saved
- Latest checkpoint info
- Resume available: Yes/No

### Memory Stats
- Decisions logged: N
- Observations saved: N
- Patterns documented: N

## Example Output

```
⬢ GoopSpec · Status
──────────────────────────────────────────────────────

Project: Initialized ✓
Mode: Standard
Milestone: Authentication System

WORKFLOW:
Phase: Execute (Wave 2 of 4)
Spec Locked: Yes (2024-01-15 10:30)
Acceptance: Pending

PROGRESS:
Wave 1: Foundation [COMPLETE] ✓
  ☑ Task 1.1: Setup
  ☑ Task 1.2: Config
  ☑ Task 1.3: Base

Wave 2: Core [IN PROGRESS]
  ☑ Task 2.1: Auth
  ◉ Task 2.2: Logic
  ○ Task 2.3: Data

Wave 3: Integration [PENDING]
Wave 4: Polish [PENDING]

MUST-HAVES: 2 of 3 complete
☑ User can log in
☑ Session persists
○ Error messages displayed

CHECKPOINTS: 2 saved
Latest: checkpoint-xyz789 (30 mins ago)

MEMORY: 5 decisions, 12 observations

──────────────────────────────────────────────────────
```

## Phase-Specific Information

### Plan Phase
- Intent captured: Yes/No
- Requirements categorized: Yes/No
- Success criteria defined: Yes/No
- Ready for research: Yes/No

### Research Phase
- Agents spawned: N
- Research complete: Yes/No
- RESEARCH.md created: Yes/No
- Ready for specify: Yes/No

### Specify Phase
- SPEC.md created: Yes/No
- BLUEPRINT.md created: Yes/No
- Contract presented: Yes/No
- User confirmed: Yes/No

### Execute Phase
- Current wave: N of M
- Tasks complete: N of M
- Deviations: N logged
- Blockers: N active

### Accept Phase
- Verification complete: Yes/No
- Must-haves verified: N of M
- Tests passing: Yes/No
- User accepted: Yes/No

## Quick Actions

From status view, you can:
- `/goop-plan [intent]` - Start planning
- `/goop-research` - Begin research
- `/goop-specify` - Lock specification
- `/goop-execute` - Continue execution
- `/goop-accept` - Verify completion
- `/goop-pause` - Save checkpoint
- `/goop-resume` - Resume from checkpoint

## Verbose Mode

For detailed status:

```
/goop-status --verbose
```

Shows additional information:
- Full task list with commit hashes
- All deviations with details
- Complete checkpoint history
- Memory entries related to current work

---

**GoopSpec**: Know exactly where you stand.
