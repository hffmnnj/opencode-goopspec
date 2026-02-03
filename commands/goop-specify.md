---
name: goop-specify
description: Lock the specification - the CONTRACT between user and agent
---

# GoopSpec Specify

Lock the specification - the binding contract that defines exactly what will be delivered.

## Usage

```
/goop-specify
```

## Workflow Position

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PLAN     │ ──▶ │  RESEARCH   │ ──▶ │   SPECIFY   │
│  (Intent)   │     │  (Explore)  │     │ (Contract)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              ↑
                                        (You are here)

       ╔══════════════════════════════════════════════╗
       ║          CONTRACT GATE                        ║
       ║   User MUST confirm before execution begins   ║
       ╚══════════════════════════════════════════════╝
```

The Specify phase answers: **What exactly will we deliver?**

## What Happens

1. **Synthesize Plan + Research** - Combine intent with technical approach
2. **Define Must-Haves** - Observable, achievable, specific deliverables (3-7 items)
3. **Set Boundaries** - Explicitly state what's out of scope
4. **Create SPEC.md** - The locked specification document
5. **Create BLUEPRINT.md** - Wave-based execution plan
6. **Present Contract** - Show must-haves, nice-to-haves, out-of-scope
7. **Wait for Confirmation** - User MUST type "confirm" to proceed

## The Contract Concept

Once locked, the specification becomes a binding agreement:
- **Agent commits** to delivering must-haves
- **User commits** to accepting if must-haves are met
- **Changes require** explicit amendment via `/goop-amend`

### Why Contracts Matter

**Without a locked spec:**
- Scope creeps silently
- "Almost done" never ends
- Success criteria shift
- Both parties frustrated

**With a locked spec:**
- Clear deliverables
- Measurable completion
- Explicit change process
- Satisfied expectations

## Artifacts Created

- `SPEC.md` - Locked specification with:
  - Intent summary
  - Must-haves (guaranteed)
  - Nice-to-haves (best effort)
  - Out-of-scope (explicitly excluded)
  - Technical approach
  - Target files
  - Acceptance criteria

- `BLUEPRINT.md` - Wave-based execution plan with:
  - Wave 1: Foundation tasks
  - Wave 2: Core tasks
  - Wave 3: Integration tasks
  - Wave 4: Polish tasks

## Confirmation Prompt

```
╭─ ⬢ GoopSpec ───────────────────────────────────────╮
│                                                    │
│  🔒 CONTRACT GATE                                  │
│                                                    │
│  I'm ready to lock the specification.              │
│                                                    │
│  MUST HAVES (I commit to delivering):              │
│  • User can log in with email/password             │
│  • Session persists across refresh                 │
│  • Error messages displayed                        │
│                                                    │
│  NICE TO HAVES (Best effort):                      │
│  • Remember me option                              │
│                                                    │
│  OUT OF SCOPE:                                     │
│  • OAuth providers (future enhancement)            │
│  • Password reset (separate feature)               │
│                                                    │
│  ACCEPTANCE CRITERIA:                              │
│  1. User can successfully log in                   │
│  2. Tests pass for auth flow                       │
│  3. Session management works                       │
│                                                    │
│  ─────────────────────────────────────────────     │
│  Type "confirm" to lock and proceed.               │
│  Type "amend" to request changes.                  │
│                                                    │
╰────────────────────────────────────────────────────╯
```

## Example

After research on authentication:

```
/goop-specify
```

Agent creates SPEC.md and BLUEPRINT.md, then presents contract for confirmation.

## Next Steps

After confirmation:
- `/goop-execute` - Start wave-based implementation

If changes needed:
- Type "amend" to modify specification before locking

After locking:
- `/goop-amend [change]` - Propose changes to locked spec

## Quick Mode Shortcut

For Quick tasks, Specify phase is **SKIPPED**:
- Intent from Plan phase serves as implicit spec
- No formal SPEC.md
- Jumps directly to Execute

---

**GoopSpec**: Lock the contract, deliver with confidence.
