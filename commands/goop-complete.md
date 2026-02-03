---
name: goop-complete
description: Complete and archive a milestone
---

# GoopSpec Complete

Complete and archive a milestone, extracting learnings and preparing for the next phase.

## Usage

```
/goop-complete
```

## When to Use

Use `/goop-complete` when:
- A major milestone is finished
- Multiple features are complete
- Ready to close a development cycle
- Want to extract learnings before next phase

**Note:** For individual features, `/goop-accept` is sufficient. Use `/goop-complete` for larger milestones.

## What Happens

1. **Verify Completion** - Confirm all milestone features accepted
2. **Generate RETROSPECTIVE.md** - Reflect on what worked/didn't
3. **Extract LEARNINGS.md** - Document patterns, decisions, insights
4. **Archive Files** - Move to `archive/milestone-N/`:
   - SPEC.md
   - BLUEPRINT.md
   - CHRONICLE.md
   - RESEARCH.md
   - RETROSPECTIVE.md
   - LEARNINGS.md
5. **Persist to Memory** - Save key learnings for future reference
6. **Tag Git** - Create version tag (e.g., `v1.0.0`)
7. **Clean Workspace** - Clear active workflow state
8. **Celebrate** - Acknowledge completion

## RETROSPECTIVE.md

Generated retrospective includes:

```markdown
# Retrospective: [Milestone Name]

**Completed:** [Date]
**Duration:** [Time period]
**Features Delivered:** [Count]

## What Went Well

- [Success 1]
- [Success 2]

## What Could Improve

- [Challenge 1]
- [Challenge 2]

## Key Decisions

- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

## Metrics

- Tasks completed: [N]
- Commits: [N]
- Tests added: [N]
- Files modified: [N]
- Deviations: [N]

## Team Feedback

[User observations and feedback]
```

## LEARNINGS.md

Extracted learnings include:

```markdown
# Learnings: [Milestone Name]

## Technical Patterns

### Pattern 1: [Name]
**Context:** [When to use]
**Implementation:** [How it works]
**Benefits:** [Why it's good]
**Files:** [Where it's used]

## Architectural Decisions

### Decision 1: [Name]
**Problem:** [What we needed to solve]
**Solution:** [What we chose]
**Alternatives:** [What we didn't choose]
**Rationale:** [Why this was best]

## Gotchas Discovered

- [Gotcha 1]: [How to avoid]
- [Gotcha 2]: [How to avoid]

## Reusable Components

- [Component 1]: [Purpose and location]
- [Component 2]: [Purpose and location]

## Future Recommendations

- [Recommendation 1]
- [Recommendation 2]
```

## Archive Structure

```
archive/
└── milestone-1-auth-system/
    ├── SPEC.md
    ├── BLUEPRINT.md
    ├── CHRONICLE.md
    ├── RESEARCH.md
    ├── RETROSPECTIVE.md
    └── LEARNINGS.md
```

## Memory Persistence

Key information saved to memory:
- Architectural decisions
- Reusable patterns discovered
- Gotchas and how to avoid them
- Performance insights
- Security considerations

## Git Tagging

Milestone tagged in git:

```bash
git tag -a v1.0.0 -m "Milestone 1: Authentication System"
git push origin v1.0.0
```

## Completion Prompt

```
╭─ ⬢ GoopSpec ───────────────────────────────────────╮
│                                                    │
│  🎯 MILESTONE COMPLETE                             │
│                                                    │
│  Milestone: Authentication System                  │
│                                                    │
│  DELIVERED:                                        │
│  • User login/logout                               │
│  • Session management                              │
│  • Password reset                                  │
│  • OAuth integration                               │
│                                                    │
│  METRICS:                                          │
│  • Duration: 3 days                                │
│  • Tasks: 24 completed                             │
│  • Commits: 24                                     │
│  • Tests: 87% coverage                             │
│                                                    │
│  ARCHIVED:                                         │
│  • Specifications                                  │
│  • Research findings                               │
│  • Learnings extracted                             │
│  • Git tagged: v1.0.0                              │
│                                                    │
╰────────────────────────────────────────────────────╯

What's next?
• /goop-milestone [name] - Start next milestone
• /goop-plan [feature] - Plan next feature
• /goop-status - Check project status
```

## Example

After completing authentication system milestone:

```
/goop-complete
```

Agent generates retrospective, extracts learnings, archives files, tags git, and prepares for next milestone.

## Next Steps

After completion:
- `/goop-milestone [name]` - Start new milestone
- `/goop-plan [feature]` - Plan next feature
- Review LEARNINGS.md for insights

---

**GoopSpec**: Complete with reflection, start fresh with wisdom.
