# Workflow: Plan Phase

The Plan phase captures user intent and establishes the foundation for all subsequent work.

## Position in Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PLAN     │ ──▶ │  RESEARCH   │ ──▶ │   SPECIFY   │
│  (Intent)   │     │  (Explore)  │     │ (Contract)  │
└─────────────┘     └─────────────┘     └─────────────┘
     ↑
(You are here)
```

## Purpose

The Plan phase answers: **What does the user want and why?**

This is NOT about HOW to build it - that comes later. The Plan phase focuses purely on understanding intent, constraints, and success criteria.

## Entry Criteria

- User has expressed a need or request
- Orchestrator has classified the work (Quick, Standard, Comprehensive, Milestone)

## Activities

### 1. Intent Capture

Extract the core intent from the user's request:

```markdown
## Intent

**User wants to:** [Action] [Target] [Context]
**Because:** [Motivation/Problem being solved]
**Success looks like:** [Observable outcome]
```

### 2. Clarifying Questions

Ask questions to resolve ambiguity:

- **Scope questions:** "Should this include X or just Y?"
- **Priority questions:** "Is A more important than B?"
- **Constraint questions:** "Are there performance/security requirements?"
- **Integration questions:** "How should this work with existing feature Z?"

**Rule:** If ambiguity could lead to 2x+ effort difference, MUST ask before proceeding.

### 3. Requirements Gathering

Categorize requirements:

```markdown
## Requirements

### Must Have (Non-negotiable)
- Requirement 1
- Requirement 2

### Should Have (Important)
- Requirement 3
- Requirement 4

### Could Have (Nice to have)
- Requirement 5

### Won't Have (Explicitly excluded)
- Out of scope item 1
```

### 4. Constraint Identification

Document known constraints:

- Technical constraints (existing stack, compatibility)
- Time constraints (deadlines, urgency)
- Resource constraints (budget, team)
- Business constraints (compliance, brand)

### 5. Success Criteria Definition

Define how we'll know when we're done:

```markdown
## Success Criteria

1. [Observable behavior 1]
2. [Observable behavior 2]
3. [Measurable outcome]
```

## Artifacts Produced

| Artifact | Purpose |
|----------|---------|
| Intent statement | Clear understanding of what and why |
| Requirements list | Categorized list of needs |
| Constraints | Known limitations |
| Success criteria | Acceptance conditions |

## Transition to Research Phase

The Plan phase is complete when:

- [ ] Intent is clearly understood and documented
- [ ] All critical ambiguities resolved
- [ ] Requirements categorized (must/should/could/won't)
- [ ] Success criteria defined
- [ ] User confirms understanding is correct

**Transition prompt:**
```
"I understand you want to [intent summary].

Must haves:
- [list]

Success looks like:
- [criteria]

Is this understanding correct? Ready to research implementation approaches?"
```

## Quick Mode Shortcut

For Quick tasks, Plan phase is abbreviated:
- Capture intent in 1-2 sentences
- Skip detailed requirements (scope is small)
- Define one clear success criterion
- Proceed directly to Execute

## Common Pitfalls

### Over-planning
**Symptom:** Spending hours documenting a 30-minute fix
**Fix:** Match planning depth to task complexity

### Under-planning
**Symptom:** Starting work without clear success criteria
**Fix:** Always define at least one observable success criterion

### Assumption accumulation
**Symptom:** Making multiple assumptions without noting them
**Fix:** Document assumptions explicitly, validate critical ones

### Scope creep during planning
**Symptom:** Requirements keep growing
**Fix:** Establish must-haves first, push additions to could-have

## Memory Protocol

### Before Starting
```
memory_search({ query: "similar features, past requirements" })
```

### During Planning
```
memory_note({ note: "User prefers X approach over Y" })
```

### After Completing
```
memory_save({ 
  type: "note",
  title: "Project Intent: [name]",
  content: "[intent summary]"
})
```

## Commands

| Command | Effect |
|---------|--------|
| `/goop-plan [intent]` | Start Plan phase with initial intent |
| `/goop-status` | Check current phase status |
