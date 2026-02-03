---
name: goop-execute
description: Start the Execute phase - wave-based implementation
---

# GoopSpec Execute

Implement the specification through wave-based task execution with orchestrated subagents.

## Usage

```
/goop-execute
```

## Workflow Position

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

The Execute phase answers: **Build exactly what the spec says.**

## What Happens

1. **Wave-Based Execution** - Tasks grouped into sequential waves:
   - **Wave 1: Foundation** - Setup, configuration, base structures
   - **Wave 2: Core** - Main feature, business logic, data handling
   - **Wave 3: Integration** - Connect components, wire to existing system
   - **Wave 4: Polish** - Error handling, edge cases, documentation

2. **Orchestrator Coordination** - Orchestrator acts as CONDUCTOR:
   - Delegates tasks to specialized subagents
   - Tracks progress in CHRONICLE.md
   - Applies deviation rules automatically
   - Handles blockers and checkpoints
   - **NEVER writes code itself**

3. **Task Execution** - For each task:
   - Read from BLUEPRINT.md
   - Check deviation rules
   - Delegate to goop-executor agent
   - Agent implements with memory protocol
   - Atomic commit per task
   - Update CHRONICLE.md
   - Verify tests pass

4. **Deviation Handling** - Auto-fix without asking:
   - **Rule 1:** Bugs (type errors, logic errors, crashes)
   - **Rule 2:** Missing critical functionality (validation, error handling)
   - **Rule 3:** Blocking issues (missing deps, broken imports)
   - **Rule 4:** STOP for architectural decisions (new tables, framework changes)

5. **Checkpoint Handling** - Pause for user input when needed:
   - `checkpoint:verify` - User verifies functionality
   - `checkpoint:decision` - User makes decision
   - `checkpoint:action` - User performs action

## Wave Principles

1. **Sequential waves** - Wave N completes before Wave N+1 starts
2. **Vertical slices** - Each wave delivers working functionality
3. **Atomic commits** - Each task = one commit
4. **Verification gates** - Tests must pass between waves

## Artifacts Created/Updated

- `CHRONICLE.md` - Real-time progress tracking:
  - Current wave and task
  - Completed tasks with commit hashes
  - Deviations logged
  - Blockers noted

- Git commits - One per task:
  ```
  feat(wave-task): description
  
  - Change 1
  - Change 2
  ```

## Example

After spec locked for authentication:

```
/goop-execute
```

Orchestrator executes:
- Wave 1: Setup auth directory, install jose library
- Wave 2: Implement login function, session management
- Wave 3: Wire to API routes, connect to user model
- Wave 4: Add error handling, write tests

Each task delegated to goop-executor, committed atomically.

## Continuation Enforcement

The agent **CANNOT stop** with incomplete tasks:
- Incomplete todos = forced continuation
- Only checkpoints allow pause
- User must explicitly confirm completion
- Max continuation prompts before escalation

## Next Steps

After execution:
- `/goop-accept` - Verify and accept completion (ACCEPTANCE GATE)

During execution:
- `/goop-status` - Check progress
- `/goop-pause` - Save checkpoint manually

## Quick Mode Execution

For Quick tasks:
- Abbreviated waves (often just 1-2)
- Faster delegation
- Less formal tracking
- Direct to Accept phase

---

**GoopSpec**: Execute with precision, deliver with confidence.
