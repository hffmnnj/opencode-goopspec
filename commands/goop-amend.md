---
name: goop-amend
description: Propose changes to a locked specification
---

# GoopSpec Amend

Propose changes to a locked specification after the CONTRACT GATE.

## Usage

```
/goop-amend [change description]
```

## When to Use

Use `/goop-amend` when:
- Specification is already locked
- Requirements have changed
- New constraints discovered
- Scope needs adjustment
- User realizes something was missed

**Before locking:** Just type "amend" at the CONTRACT GATE prompt.

**After locking:** Use this command to propose changes.

## What Happens

1. **Stop Current Execution** - Pause any in-progress work
2. **Document Change Request** - Record what needs to change and why
3. **Assess Impact** - Analyze effect on:
   - Completed work
   - In-progress tasks
   - Remaining tasks
   - Timeline and effort
4. **Present Options** - Show impact and alternatives
5. **User Confirms Amendment** - Must explicitly approve
6. **Update SPEC.md** - Modify locked specification
7. **Update BLUEPRINT.md** - Adjust wave/task plan
8. **Resume or Restart** - Continue execution with new spec

## Amendment Types

### Additive Amendment
Adding new requirements without removing existing ones.

**Example:**
```
/goop-amend Add OAuth login support alongside email/password
```

**Impact:** Extends scope, adds tasks, increases timeline.

### Subtractive Amendment
Removing requirements to reduce scope.

**Example:**
```
/goop-amend Remove remember me feature, focus on core login
```

**Impact:** Reduces scope, removes tasks, decreases timeline.

### Replacement Amendment
Changing approach or swapping requirements.

**Example:**
```
/goop-amend Use session-based auth instead of JWT
```

**Impact:** May require rework, affects architecture.

## Amendment Process

```
User: /goop-amend Add password reset functionality

Agent:
╭─ ⬢ GoopSpec ───────────────────────────────────────╮
│                                                    │
│  📝 AMENDMENT REQUEST                              │
│                                                    │
│  PROPOSED CHANGE:                                  │
│  Add password reset functionality                  │
│                                                    │
│  IMPACT ASSESSMENT:                                │
│  • Current progress: Wave 2 of 4 (50% complete)    │
│  • Completed work: Not affected                    │
│  • New work required:                              │
│    - Add password reset endpoint                   │
│    - Email service integration                     │
│    - Reset token management                        │
│    - UI for reset flow                             │
│  • Estimated additional effort: +4 hours           │
│  • New must-have: User can reset password          │
│                                                    │
│  OPTIONS:                                          │
│  1. Add to current spec (extends timeline)         │
│  2. Defer to next phase (separate feature)         │
│  3. Cancel amendment (keep current spec)           │
│                                                    │
│  ─────────────────────────────────────────────     │
│  Type "confirm" to update spec and continue.       │
│  Type "defer" to handle in next phase.             │
│  Type "cancel" to keep current spec.               │
│                                                    │
╰────────────────────────────────────────────────────╯
```

## Artifacts Updated

- `SPEC.md` - Updated with amendment:
  ```markdown
  ## Amendment History
  
  ### Amendment 1 - [Date]
  **Change:** Added password reset functionality
  **Reason:** User requirement discovered during execution
  **Impact:** +4 hours, +1 must-have
  ```

- `BLUEPRINT.md` - Updated with new/modified tasks
- `CHRONICLE.md` - Amendment logged with impact

## Best Practices

### When to Amend

**GOOD reasons:**
- Critical requirement missed
- User needs changed
- Technical constraint discovered
- Security issue requires different approach

**BAD reasons:**
- "Nice to have" feature idea
- Scope creep without justification
- Avoiding difficult implementation
- Perfectionism

### Minimizing Amendments

To reduce need for amendments:
- Thorough planning phase
- Clear success criteria
- Explicit out-of-scope items
- User confirmation at CONTRACT GATE

## Example

During authentication implementation, user realizes password reset is critical:

```
/goop-amend Add password reset - users need recovery option
```

Agent assesses impact, presents options, user confirms.
SPEC.md updated, new tasks added to BLUEPRINT.md.

## Next Steps

After amendment confirmed:
- `/goop-execute` - Resume execution with updated spec
- `/goop-status` - Check updated progress

If amendment deferred:
- Continue current work
- Plan amendment as next phase

---

**GoopSpec**: Adapt when needed, maintain the contract.
