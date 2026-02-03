# Workflow: Specify Phase

The Specify phase locks the specification - the CONTRACT between user and agent.

## Position in Workflow

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

## Purpose

The Specify phase answers: **What exactly will we deliver?**

This is the CONTRACT phase. Once locked, the specification becomes the binding agreement:
- Agent commits to delivering must-haves
- User commits to accepting if must-haves are met
- Changes require explicit amendment

## Entry Criteria

- Plan phase complete (intent captured)
- Research phase complete (approach researched)
- RESEARCH.md available with recommendations

## The Contract Concept

### Why Contracts Matter

Without a locked spec:
- Scope creeps silently
- "Almost done" never ends
- Success criteria shift
- Both parties frustrated

With a locked spec:
- Clear deliverables
- Measurable completion
- Explicit change process
- Satisfied expectations

### Contract Terms

```markdown
## Specification Contract

### Must Haves (Guaranteed)
If these aren't delivered, the work is incomplete.
- [ ] Must-have 1
- [ ] Must-have 2

### Nice to Haves (Best Effort)
Will attempt if time permits after must-haves.
- [ ] Nice-to-have 1
- [ ] Nice-to-have 2

### Out of Scope (Explicitly Excluded)
These are NOT part of this work.
- Excluded item 1
- Excluded item 2

### Acceptance Criteria
How we'll verify completion.
1. Criterion 1
2. Criterion 2
```

## SPEC.md Structure

```markdown
# Specification: [Feature Name]

**Status:** LOCKED | DRAFT
**Locked At:** [timestamp]
**Locked By:** [user confirmation]

## Intent
[Summary from Plan phase]

## Requirements

### Must Haves
- [ ] Requirement 1
  - Acceptance: [how to verify]
- [ ] Requirement 2
  - Acceptance: [how to verify]

### Nice to Haves
- [ ] Requirement 3
- [ ] Requirement 4

### Out of Scope
- Item 1 (reason: ...)
- Item 2 (reason: ...)

## Technical Approach
[Summary from Research phase]

## Target Files
- `path/to/file1.ts` - [change description]
- `path/to/file2.ts` - [change description]

## Dependencies
- Depends on: [list]
- Blocks: [list]

## Risks
- Risk 1: [description, mitigation]

## Estimated Effort
[T-shirt size: XS, S, M, L, XL]
```

## Specify Activities

### 1. Synthesize Plan + Research

Combine intent (Plan) with approach (Research):
- Match requirements to technical solutions
- Identify which must-haves are feasible
- Determine what should be nice-to-have vs out-of-scope

### 2. Define Must-Haves

Critical: Must-haves should be:
- **Observable** - Can be seen/tested
- **Achievable** - Within scope of work
- **Specific** - No ambiguity
- **Limited** - Keep list short (3-7 items)

### 3. Set Boundaries

Explicitly define what's out:
- Features that seem related but aren't included
- Edge cases that won't be handled
- Future enhancements

### 4. Create BLUEPRINT.md

Transform spec into executable plan:

```markdown
# Blueprint: [Feature Name]

## Wave 1: [Foundation]

### Task 1.1: [Name]
**Files:** path/to/file.ts
**Action:** [What to do]
**Verify:** [How to verify]
**Done:** [Acceptance criterion]

### Task 1.2: [Name]
...

## Wave 2: [Core]
...
```

## Contract Gate

**CRITICAL**: User MUST explicitly confirm the specification.

### Confirmation Prompt

```
╭─ ⬢ GoopSpec ───────────────────────────────────────╮
│                                                    │
│  🔒 CONTRACT GATE                                  │
│                                                    │
│  I'm ready to lock the specification.              │
│                                                    │
│  MUST HAVES (I commit to delivering):              │
│  • Must-have 1                                     │
│  • Must-have 2                                     │
│                                                    │
│  NICE TO HAVES (Best effort):                      │
│  • Nice-to-have 1                                  │
│                                                    │
│  OUT OF SCOPE:                                     │
│  • Excluded 1                                      │
│                                                    │
│  ACCEPTANCE CRITERIA:                              │
│  1. Criterion 1                                    │
│  2. Criterion 2                                    │
│                                                    │
│  ─────────────────────────────────────────────     │
│  Type "confirm" to lock and proceed.               │
│  Type "amend" to request changes.                  │
│                                                    │
╰────────────────────────────────────────────────────╯
```

### After Confirmation

- SPEC.md status changes to LOCKED
- Timestamp recorded
- Execution phase can begin
- Changes require `/goop-amend` command

## Amendments

If spec needs to change after locking:

```
/goop-amend "Add support for X"
```

Amendment process:
1. Stop current execution
2. Document the change request
3. Assess impact on existing work
4. User confirms amendment
5. Update SPEC.md
6. Resume or restart execution

## Transition to Execute Phase

Specify phase is complete when:

- [ ] SPEC.md written with all sections
- [ ] Must-haves clearly defined
- [ ] Out-of-scope explicitly stated
- [ ] BLUEPRINT.md created with waves/tasks
- [ ] **User has confirmed the specification**

## Quick Mode Shortcut

For Quick tasks, Specify phase is SKIPPED:
- Intent from Plan phase serves as implicit spec
- No formal SPEC.md
- Jump directly to Execute

## Memory Protocol

### Before Starting
```
memory_search({ 
  query: "past specs for similar features",
  types: ["decision"]
})
```

### During Specifying
```
memory_decision({
  decision: "Feature X out of scope",
  reasoning: "User confirmed focus on core functionality"
})
```

### After Locking
```
memory_save({
  type: "decision",
  title: "Spec Locked: [feature]",
  content: "[must-haves summary]",
  importance: 0.8
})
```

## Commands

| Command | Effect |
|---------|--------|
| `/goop-specify` | Create and present spec for confirmation |
| `/goop-amend [change]` | Request spec amendment |
| `/goop-status` | Check spec lock status |
