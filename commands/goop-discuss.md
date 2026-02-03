---
name: goop-discuss
description: Capture user vision before planning - the discovery conversation
---

# GoopSpec Discuss

Capture user vision and gather requirements through structured conversation before formal planning.

## Usage

```
/goop-discuss [brief description]
```

## Workflow Position

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   DISCUSS   │ ──▶ │    PLAN     │ ──▶ │  RESEARCH   │
│  (Vision)   │     │  (Intent)   │     │  (Explore)  │
└─────────────┘     └─────────────┘     └─────────────┘
      ↑
(You are here)
```

The Discuss phase answers: **What does the user really want?**

## What Happens

1. **Vision Capture** - Understand the high-level goal
2. **Requirements Gathering** - Ask clarifying questions to understand:
   - Functional requirements (what it should do)
   - Non-functional requirements (performance, security, accessibility)
   - Constraints (time, technology, compatibility)
   - Success criteria (how to know it's done)
3. **Scope Definition** - Identify boundaries
4. **Priority Clarification** - Understand what matters most
5. **Memory Search** - Check for relevant past context

## Discussion Techniques

**Ask Open-Ended Questions:**
```
"Can you walk me through how a user would interact with this?"
"What happens if [edge case]?"
"Are there any existing patterns in the codebase we should follow?"
```

**Validate Understanding:**
```
"Let me make sure I understand correctly:
- The feature should [summary]
- It needs to handle [edge cases]
- Success looks like [acceptance criteria]

Is that accurate?"
```

**Challenge Assumptions:**
```
"I notice you mentioned X. Have you considered Y as an alternative? 
It might be simpler because [reason]."
```

## What to Gather

### Functional Requirements
- What should the feature DO?
- What are the inputs and outputs?
- What are the edge cases?
- What happens on errors?

### Non-Functional Requirements
- Performance expectations?
- Security considerations?
- Accessibility needs?
- Compatibility requirements?

### Context & Constraints
- Why is this needed? What problem does it solve?
- What existing code/patterns should be followed?
- Any technical constraints or limitations?
- Timeline or priority considerations?

### Acceptance Criteria
- How will we know it's "done"?
- What tests should pass?
- What should the user experience be?

## Artifacts Created

- Understanding of requirements (informal)
- Identified edge cases
- Agreement on acceptance criteria
- Technical research notes (if needed)

## Example

```
/goop-discuss Add user authentication
```

Agent asks:
- "What authentication methods? Email/password? OAuth?"
- "Should sessions persist across browser closes?"
- "Any specific security requirements?"
- "How should errors be displayed?"

After discussion, agent summarizes understanding and asks for confirmation.

## Transition to Plan

When requirements are clear:
```
"I have a clear picture of what we need:
[Summary of requirements]

Ready to move to planning? I'll capture the formal intent 
and requirements in the Plan phase."
```

## Next Steps

After discussion:
- `/goop-plan [description]` - Capture formal intent and requirements

## Tips

- Don't rush to planning - thorough discussion prevents rework
- Ask about edge cases early
- Validate understanding frequently
- Challenge assumptions respectfully
- Search memory for relevant past context

---

**GoopSpec**: Understand deeply, build correctly.
