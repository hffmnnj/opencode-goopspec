---
name: goop-plan
description: Start the Plan phase - capture intent and requirements
---

# GoopSpec Plan

Capture user intent and establish the foundation for all subsequent work.

## Usage

```
/goop-plan [brief description]
```

## Workflow Position

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PLAN     │ ──▶ │  RESEARCH   │ ──▶ │   SPECIFY   │
│  (Intent)   │     │  (Explore)  │     │ (Contract)  │
└─────────────┘     └─────────────┘     └─────────────┘
     ↑
(You are here)
```

The Plan phase answers: **What does the user want and why?**

## What Happens

1. **Intent Capture** - Extract core intent from your request
2. **Clarifying Questions** - Resolve critical ambiguities
3. **Requirements Gathering** - Categorize must/should/could/won't haves
4. **Constraint Identification** - Document technical, time, resource limits
5. **Success Criteria** - Define observable completion conditions
6. **Memory Search** - Check for similar past work and preferences

The agent will ask questions to understand:
- Scope boundaries
- Priority trade-offs
- Performance/security requirements
- Integration with existing features

## Artifacts Created

- Intent statement (what and why)
- Requirements list (must/should/could/won't)
- Constraints documentation
- Success criteria

## Example

```
/goop-plan Add user authentication with email/password
```

Agent captures:
- **Intent:** Enable users to create accounts and log in
- **Must haves:** Email/password login, session persistence
- **Success:** User can log in and stay logged in across refresh

## Next Steps

After planning:
- `/goop-research` - Research implementation approaches
- `/goop-quick` - Skip research for simple tasks (Plan → Execute → Accept)

## Quick Mode Shortcut

For small tasks, Plan phase is abbreviated:
- Capture intent in 1-2 sentences
- Skip detailed requirements
- Define one clear success criterion
- Proceed directly to Execute

---

**GoopSpec**: Plan with precision, execute with confidence.
