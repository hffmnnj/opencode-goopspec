# Workflow: Execute Phase

The Execute phase implements the specification through wave-based task execution.

## Position in Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PLAN     │ ──▶ │  RESEARCH   │ ──▶ │   SPECIFY   │
│  (Intent)   │     │  (Explore)  │     │ (Contract)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
       ┌──────────────────────────────────────┘
       ▼
┌─────────────┐     ┌─────────────┐
│   EXECUTE   │ ──▶ │   ACCEPT    │
│   (Build)   │     │  (Verify)   │
└─────────────┘     └─────────────┘
       ↑
 (You are here)
```

## Purpose

The Execute phase answers: **Build exactly what the spec says.**

Implementation happens in waves, with the orchestrator coordinating specialized subagents. Progress is tracked in CHRONICLE.md.

## Entry Criteria

- Specify phase complete
- SPEC.md locked and confirmed
- BLUEPRINT.md ready with waves and tasks

## Wave-Based Execution

### Wave Structure

```
Wave 1: Foundation
  ├── Task 1.1: Setup
  ├── Task 1.2: Configuration
  └── Task 1.3: Base structures

Wave 2: Core
  ├── Task 2.1: Main feature
  ├── Task 2.2: Business logic
  └── Task 2.3: Data handling

Wave 3: Integration
  ├── Task 3.1: Connect components
  └── Task 3.2: Wire to existing system

Wave 4: Polish
  ├── Task 4.1: Error handling
  ├── Task 4.2: Edge cases
  └── Task 4.3: Documentation
```

### Wave Principles

1. **Sequential waves** - Wave N completes before Wave N+1 starts
2. **Vertical slices** - Each wave delivers working functionality
3. **Atomic commits** - Each task = one commit
4. **Verification gates** - Tests must pass between waves

## Orchestrator Role

The orchestrator is a CONDUCTOR - it coordinates but NEVER writes code.

### Orchestrator Does
- Delegate tasks to subagents
- Track progress in CHRONICLE.md
- Apply deviation rules
- Coordinate between waves
- Handle blockers

### Orchestrator Does NOT
- Write implementation code
- Make architectural decisions alone
- Modify files directly
- "Quickly fix" things itself

### Delegation Pattern

```
task({
  subagent_type: "general",
  description: "Execute auth task",
  prompt: `
    Execute Task 2.1: Implement user authentication
    
    SPEC Reference: .goopspec/SPEC.md
    BLUEPRINT: .goopspec/BLUEPRINT.md
    
    Files to modify:
    - src/auth/login.ts
    - src/auth/session.ts
    
    Acceptance criteria:
    - User can log in with email/password
    - Session persists across refresh
    
    Constraints:
    - Follow existing patterns in src/auth/
    - Use jose library (per RESEARCH.md)
  `
})
```

## Task Execution Flow

For each task:

```
1. Read task from BLUEPRINT.md
2. Check deviation rules (can auto-fix?)
3. Delegate to appropriate agent
4. Agent implements with memory protocol
5. Agent commits atomically
6. Update CHRONICLE.md
7. Verify (tests pass?)
8. Move to next task or wave
```

### Task Types

| Type | Behavior |
|------|----------|
| `auto` | Execute automatically via delegation |
| `checkpoint:verify` | Pause for user verification |
| `checkpoint:decision` | Pause for user decision |
| `checkpoint:action` | Pause for user action |

### Checkpoint Handling

```markdown
### Task 2.4 (checkpoint:verify): Verify Auth Flow

**What Built:** Authentication system
**How to Verify:**
1. Start dev server
2. Navigate to /login
3. Test with credentials

**Resume Signal:** "verified" or list issues
```

When checkpoint reached:
1. Save state to CHRONICLE.md
2. Present verification instructions
3. Wait for user signal
4. Resume or address issues

## CHRONICLE.md Tracking

Progress tracked in real-time:

```markdown
# Chronicle: [Feature Name]

## Current State
- Phase: Execute
- Wave: 2 of 4
- Task: 2.3 of 3
- Status: In Progress

## Wave History

### Wave 1: Foundation [COMPLETE]
- [x] Task 1.1: Setup (commit: abc123)
- [x] Task 1.2: Config (commit: def456)
- [x] Task 1.3: Base (commit: ghi789)

### Wave 2: Core [IN PROGRESS]
- [x] Task 2.1: Auth (commit: jkl012)
- [x] Task 2.2: Logic (commit: mno345)
- [ ] Task 2.3: Data [WORKING]

### Wave 3: Integration [PENDING]
...

## Deviations
- DEV-001: Fixed missing validation (Rule 2)
- DEV-002: Added error handler (Rule 2)

## Blockers
- (none currently)
```

## Deviation Handling

Apply deviation rules during execution:

| Rule | Trigger | Action |
|------|---------|--------|
| Rule 1 | Bug found | Auto-fix |
| Rule 2 | Missing critical functionality | Auto-add |
| Rule 3 | Blocking issue | Auto-fix |
| Rule 4 | Architectural decision | STOP and ask |

All deviations logged to CHRONICLE.md.

## Commit Protocol

### Commit Format

```
type(wave-task): description

- Change 1
- Change 2
```

### Commit Timing

- One commit per completed task
- NEVER batch multiple tasks
- NEVER commit incomplete work (except checkpoints)

### Pre-Commit Checks

Before each commit:
1. Run linter
2. Run type checker
3. Run relevant tests
4. Verify changes match task

## Error Recovery

### On Task Failure

1. Log error to CHRONICLE.md
2. Attempt auto-recovery (deviation rules)
3. If 3 failures: pause and notify user

### On Agent Context Overflow

1. Save checkpoint
2. Spawn fresh agent with handoff:
   - Current spec reference
   - Incomplete tasks
   - Recent decisions
3. Resume from checkpoint

## Continuation Enforcement

The agent CANNOT stop with incomplete tasks:

- Incomplete todos = forced continuation
- Only checkpoints allow pause
- User must explicitly confirm completion
- Max continuation prompts before escalation

## Transition to Accept Phase

Execute phase is complete when:

- [ ] All waves executed
- [ ] All tasks completed
- [ ] All tests passing
- [ ] All deviations logged
- [ ] CHRONICLE.md up to date

**Transition:**
```
"Execution complete.

Tasks: 12/12 completed
Commits: 12 atomic commits
Tests: All passing

Ready for acceptance verification?"
```

## Memory Protocol

### Before Starting
```
memory_search({ 
  query: "past implementation patterns for [feature]",
  concepts: ["implementation"]
})
```

### During Execution
```
memory_note({ 
  note: "Pattern discovered: [description]" 
})

memory_decision({
  decision: "Used approach X over Y",
  reasoning: "[rationale]"
})
```

### After Completing
```
memory_save({
  type: "observation",
  title: "Execution: [feature] complete",
  content: "[summary of approach taken]",
  concepts: ["patterns-used"]
})
```

## Commands

| Command | Effect |
|---------|--------|
| `/goop-execute` | Start/resume execution |
| `/goop-status` | Check execution progress |
| `/goop-checkpoint` | Save progress manually |
| `/goop-pause` | Pause execution |
