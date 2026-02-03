---
name: goop-milestone
description: Start a new milestone
---

# GoopSpec Milestone

Start a new milestone - a major development cycle with multiple related features.

## Usage

```
/goop-milestone [milestone name]
```

## What is a Milestone?

A milestone is a collection of related features that together deliver significant value:

**Examples:**
- "Authentication System" (login, logout, password reset, OAuth)
- "Payment Integration" (checkout, subscriptions, invoices)
- "Admin Dashboard" (user management, analytics, settings)
- "Mobile App" (iOS/Android apps with core features)

**Not milestones:**
- Single features (use `/goop-plan` instead)
- Bug fixes (use `/goop-quick` instead)
- Small enhancements (use `/goop-plan` instead)

## What Happens

1. **Milestone Planning** - Define scope and features:
   - Milestone objectives
   - Feature list
   - Success criteria
   - Timeline estimate

2. **Create Milestone Structure**:
   ```
   .goopspec/
   └── milestones/
       └── milestone-1-auth-system/
           ├── MILESTONE.md
           ├── features/
           │   ├── feature-1-login/
           │   ├── feature-2-password-reset/
           │   └── feature-3-oauth/
           └── shared/
   ```

3. **Feature Breakdown** - Identify individual features within milestone

4. **Dependency Mapping** - Determine feature order and dependencies

5. **User Confirmation** - Confirm milestone scope before starting

## MILESTONE.md Structure

```markdown
# Milestone: [Name]

**Status:** Active | Complete
**Started:** [Date]
**Target:** [Date]
**Progress:** [N/M features complete]

## Objectives

[What this milestone achieves]

## Features

### Feature 1: [Name]
**Status:** Planned | In Progress | Complete
**Dependencies:** None
**Estimated Effort:** [Size]

### Feature 2: [Name]
**Status:** Planned
**Dependencies:** Feature 1
**Estimated Effort:** [Size]

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Timeline

- Week 1: Features 1-2
- Week 2: Features 3-4
- Week 3: Integration and polish

## Notes

[Important context, constraints, decisions]
```

## Milestone Workflow

```
/goop-milestone [name]
    ↓
Plan milestone scope
    ↓
Break into features
    ↓
For each feature:
    /goop-plan → /goop-research → /goop-specify → /goop-execute → /goop-accept
    ↓
/goop-complete (archive milestone)
```

## Task Modes

Milestones use **Comprehensive Mode**:
- Deeper research per feature
- More thorough planning
- Extended verification
- Formal retrospectives

## Example

Starting authentication system milestone:

```
/goop-milestone Authentication System
```

Agent creates:
- MILESTONE.md with objectives
- Feature breakdown:
  - Feature 1: Email/password login
  - Feature 2: Session management
  - Feature 3: Password reset
  - Feature 4: OAuth integration
- Dependency map
- Timeline estimate

User confirms scope, then proceeds feature by feature.

## Milestone Tracking

Track progress with:

```
/goop-status
```

Shows:
- Current milestone
- Features complete/in-progress/planned
- Overall progress percentage
- Estimated completion

## Milestone Completion

When all features complete:

```
/goop-complete
```

This:
- Archives milestone files
- Generates retrospective
- Extracts learnings
- Tags git version
- Prepares for next milestone

## Best Practices

### Good Milestone Scope

**Right size:**
- 3-8 related features
- 1-4 weeks of work
- Clear theme/objective
- Delivers user value

**Too small:**
- Single feature (use `/goop-plan`)
- < 1 week work
- No clear theme

**Too large:**
- > 10 features
- > 1 month work
- Multiple unrelated areas
- Split into multiple milestones

### Milestone Planning

1. **Start with objectives** - What value does this deliver?
2. **List features** - What's needed to achieve objectives?
3. **Map dependencies** - What order makes sense?
4. **Estimate effort** - How long will this take?
5. **Get confirmation** - Does user agree with scope?

## Next Steps

After milestone started:
- `/goop-plan [feature]` - Plan first feature
- `/goop-status` - Check milestone progress

After milestone complete:
- `/goop-milestone [next]` - Start next milestone
- Review RETROSPECTIVE.md for insights

---

**GoopSpec**: Think in milestones, deliver in features.
