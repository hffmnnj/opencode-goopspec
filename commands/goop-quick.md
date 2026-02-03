---
name: goop-quick
description: Execute small tasks with abbreviated workflow (Plan → Execute → Accept)
---

# GoopSpec Quick

Execute small, ad-hoc tasks with GoopSpec guarantees using an abbreviated workflow.

## Usage

```
/goop-quick [brief description]
```

## Workflow Position

Quick mode uses a shortened path:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PLAN     │ ──▶ │   EXECUTE   │ ──▶ │   ACCEPT    │
│  (Intent)   │     │   (Build)   │     │  (Verify)   │
└─────────────┘     └─────────────┘     └─────────────┘

Research and Specify phases SKIPPED
```

Quick mode skips:
- Research phase (assumes existing patterns sufficient)
- Specify phase (intent serves as implicit spec)
- Formal SPEC.md and BLUEPRINT.md
- Comprehensive verification

## When to Use Quick Mode

**Good for:**
- Fix a specific bug
- Add a small feature
- Refactor a specific function
- Update documentation
- Add a test
- Configure a tool
- 15-60 minutes of work

**Too big for quick mode:**
- New major feature
- Architecture changes
- Multiple interdependent changes
- Unknown problem domain
- Anything requiring research

## What Happens

1. **Quick Planning** - Abbreviated Plan phase:
   - Capture intent in 1-2 sentences
   - Define one clear success criterion
   - Skip detailed requirements

2. **Direct Execution** - Simplified Execute phase:
   - 1-2 waves maximum
   - Faster delegation
   - Less formal tracking
   - Atomic commits still required

3. **Quick Acceptance** - Abbreviated Accept phase:
   - Quick verification
   - No formal report
   - Simple confirmation prompt

## Artifacts Created

- `.goopspec/quick/NNN-slug/PLAN.md` - Brief task plan
- `.goopspec/quick/NNN-slug/SUMMARY.md` - Completion summary
- Git commits (atomic, per task)
- STATE.md updated with quick task entry

## Task Size Guide

| Duration | Appropriate? |
|----------|--------------|
| < 15 min | Yes (might be too simple) |
| 15-30 min | Ideal |
| 30-60 min | Good |
| 1-2 hours | Borderline |
| > 2 hours | Use standard workflow |

## Example

```
/goop-quick Fix login button styling to match design system
```

Agent:
1. Captures intent: "Update login button to use design system styles"
2. Success criterion: "Button matches design system colors and spacing"
3. Executes: Modify button component, update styles
4. Commits: `fix(quick): update login button to match design system`
5. Verifies: Visual check, no errors
6. Presents for acceptance

## Good Quick Task Examples

**GOOD:**
- "Fix the login button styling"
- "Add validation to the email field"
- "Update the README with new setup steps"
- "Refactor the auth utility to use async/await"
- "Add unit test for user validation"

**TOO BIG:**
- "Implement user authentication" (use standard workflow)
- "Add payment processing" (use standard workflow)
- "Refactor the entire codebase" (use milestone)

## Quick Mode Guarantees

Even in quick mode, you still get:
- Atomic commits
- Deviation rule enforcement
- Memory integration
- Verification before acceptance
- User confirmation gate

What you skip:
- Formal research
- Locked specification
- Wave-based planning
- Comprehensive verification report

## Next Steps

After quick task:
- `/goop-quick [next]` - Another quick task
- `/goop-plan [feature]` - Start standard workflow
- `/goop-status` - Check overall progress

## Completion Prompt

```
╭─ ⬢ GoopSpec ───────────────────────────────────────╮
│                                                    │
│  ⚡ QUICK TASK COMPLETE                            │
│                                                    │
│  Task: Fix login button styling                   │
│                                                    │
│  Duration: 12 minutes                              │
│  Files: 1 modified                                 │
│  Commits: 1                                        │
│                                                    │
│  VERIFICATION:                                     │
│  ☑ Button matches design system                    │
│  ☑ No console errors                               │
│  ☑ Tests passing                                   │
│                                                    │
│  ─────────────────────────────────────────────     │
│  Type "accept" to confirm.                         │
│  Type "issues: [description]" for fixes.           │
│                                                    │
╰────────────────────────────────────────────────────╯
```

---

**GoopSpec**: Quick tasks, same guarantees.
