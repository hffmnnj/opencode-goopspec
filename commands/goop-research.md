---
name: goop-research
description: Start the Research phase - explore implementation approaches
---

# GoopSpec Research

Gather context and explore implementation approaches before committing to a specification.

## Usage

```
/goop-research
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

The Research phase answers: **How should we build this?**

## What Happens

1. **Parallel Agent Spawning** - Multiple agents work simultaneously:
   - **Researcher** - Deep domain research (technologies, patterns, best practices)
   - **Explorer** - Codebase analysis (existing patterns, conventions, integration points)
   - **Librarian** - Documentation gathering (API docs, library guides, examples)
   - **Designer** - (UI tasks only) Visual research (patterns, components, UX)

2. **Research Areas Covered:**
   - Technology options and trade-offs
   - Existing codebase patterns
   - Domain knowledge and edge cases
   - Security and performance considerations
   - Industry standards and best practices

3. **Consolidation** - Findings merged into RESEARCH.md with:
   - Technology recommendations
   - Codebase integration points
   - Key decisions needed
   - Risk assessment
   - Estimated complexity

4. **Memory Integration** - Past research and patterns retrieved

## Artifacts Created

- `RESEARCH.md` - Consolidated research findings
- Technology comparison table
- Recommended approach with rationale
- Risk catalog
- Integration points identified

## Example

After planning "Add user authentication":

```
/goop-research
```

Research agents explore:
- JWT vs session-based auth
- Existing auth patterns in codebase
- Security best practices
- Library options (jose, jsonwebtoken, etc.)
- Integration with current user model

## Next Steps

After research:
- `/goop-specify` - Lock the specification (CONTRACT GATE)

## Quick Mode Shortcut

For Quick tasks, Research phase is **SKIPPED entirely**:
- Assumes existing patterns are sufficient
- No parallel agent spawning
- Jumps directly from Plan to Execute

## Comprehensive Mode

For Comprehensive tasks:
- Deeper research per agent
- More alternatives explored
- Extended timeframe
- User reviews RESEARCH.md before Specify

---

**GoopSpec**: Research thoroughly, decide confidently.
