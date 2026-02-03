# Workflow: Accept Phase

The Accept phase verifies the implementation against the specification and obtains user sign-off.

## Position in Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PLAN     │ ──▶ │  RESEARCH   │ ──▶ │   SPECIFY   │
│  (Intent)   │     │  (Explore)  │     │ (Contract)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
       ┌──────────────────────────────────────┘
       ▼
┌─────────────┐     ┌─────────────┐
│   EXECUTE   │ ──▶ │   ACCEPT    │
│   (Build)   │     │  (Verify)   │
└─────────────┘     └─────────────┘
                          ↑
                    (You are here)

       ╔══════════════════════════════════════════════╗
       ║          ACCEPTANCE GATE                      ║
       ║   User MUST confirm completion               ║
       ╚══════════════════════════════════════════════╝
```

## Purpose

The Accept phase answers: **Did we deliver what we promised?**

This is the final verification against the locked specification. The user confirms the work is complete before it's considered done.

## Entry Criteria

- Execute phase complete
- All tasks finished
- All tests passing
- CHRONICLE.md updated

## Verification Activities

### 1. Spec Compliance Check

Verify each must-have from SPEC.md:

```markdown
## Must-Have Verification

| Requirement | Status | Evidence |
|-------------|--------|----------|
| User can log in | ✓ | Test: auth.test.ts:15 |
| Session persists | ✓ | Test: session.test.ts:42 |
| Error messages shown | ✓ | Manual verification |
```

### 2. Automated Verification

Run all quality gates:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Tests
npm test

# Build
npm run build
```

### 3. Manual Verification

For behaviors that can't be automated:

```markdown
## Manual Verification Checklist

- [ ] Login flow works end-to-end
- [ ] Error states display correctly
- [ ] Mobile responsive (if applicable)
- [ ] Accessibility check (keyboard nav, screen reader)
```

### 4. Security Audit (If Applicable)

For security-sensitive features:

```markdown
## Security Verification

- [ ] Input validation present
- [ ] No hardcoded secrets
- [ ] Auth/authz properly enforced
- [ ] No obvious vulnerabilities
```

## Verifier Agent

Delegate comprehensive verification to goop-verifier:

```
task({
  subagent_type: "general",
  description: "Verify spec",
  prompt: `
    Verify implementation against specification.
    
    SPEC: .goopspec/SPEC.md
    CHRONICLE: .goopspec/CHRONICLE.md
    
    Verify:
    1. All must-haves implemented
    2. Acceptance criteria met
    3. No regressions introduced
    4. Security considerations addressed
    5. Code quality standards met
    
    Return: Detailed verification report
  `
})
```

## Acceptance Gate

**CRITICAL**: User MUST explicitly accept the work.

### Acceptance Prompt

```
╭─ ⬢ GoopSpec ───────────────────────────────────────╮
│                                                    │
│  ✓ ACCEPTANCE GATE                                 │
│                                                    │
│  Implementation complete. Verification results:    │
│                                                    │
│  MUST HAVES:                                       │
│  ☑ User can log in - VERIFIED                      │
│  ☑ Session persists - VERIFIED                     │
│  ☑ Errors displayed - VERIFIED                     │
│                                                    │
│  AUTOMATED CHECKS:                                 │
│  ✓ TypeScript: No errors                           │
│  ✓ Lint: No issues                                 │
│  ✓ Tests: 24/24 passing                            │
│  ✓ Build: Successful                               │
│                                                    │
│  NICE TO HAVES COMPLETED:                          │
│  ☑ Remember me option                              │
│                                                    │
│  ─────────────────────────────────────────────     │
│  Type "accept" to confirm completion.              │
│  Type "issues: [description]" to request fixes.    │
│                                                    │
╰────────────────────────────────────────────────────╯
```

### Acceptance Responses

| Response | Effect |
|----------|--------|
| `accept` | Work marked complete, proceed to archive |
| `issues: [desc]` | Return to Execute phase for fixes |
| `amend: [change]` | Modify spec, reassess what's needed |

## Post-Acceptance

After user accepts:

### 1. Generate Summary

```markdown
# Summary: [Feature Name]

**Completed:** [timestamp]
**Duration:** [time]
**Tasks:** 12 completed
**Commits:** 12

## Delivered
- Must-have 1 ✓
- Must-have 2 ✓
- Nice-to-have 1 ✓ (bonus)

## Key Decisions
- Used jose library for JWT (better ESM support)
- Stored refresh tokens in httpOnly cookies

## Files Modified
- src/auth/login.ts (new)
- src/auth/session.ts (new)
- src/routes/api.ts (modified)
```

### 2. Archive (For Milestones)

If this completes a milestone:

```
/goop-complete
```

This triggers:
1. Move to archive/
2. Generate RETROSPECTIVE.md
3. Extract LEARNINGS.md
4. Persist learnings to memory
5. Tag git with version

### 3. Clean Up

- Clear active workflow state
- Keep SPEC.md and CHRONICLE.md for reference
- Ready for next task

## Handling Issues

### Minor Issues

Issues that don't fundamentally change the spec:

```
User: "issues: Login button color should be blue, not gray"

Agent:
1. Note as fix task
2. Delegate quick fix
3. Re-verify affected area
4. Present for re-acceptance
```

### Major Issues

Issues that reveal missing requirements:

```
User: "issues: Wait, it also needs OAuth support"

Agent:
1. Note as spec change
2. Prompt for `/goop-amend`
3. Update SPEC.md
4. Re-plan affected tasks
5. Execute additions
6. Re-verify
```

## Verification Report

Full verification saved to CHRONICLE.md:

```markdown
## Verification Report

**Date:** [timestamp]
**Verifier:** goop-verifier

### Spec Compliance
| Must-Have | Status | Evidence |
|-----------|--------|----------|
| Req 1 | PASS | test:auth:15 |
| Req 2 | PASS | test:session:42 |

### Quality Metrics
- TypeScript: Clean
- Lint: Clean
- Test Coverage: 87%
- Build: Success

### Security Review
- Input validation: Present
- Auth checks: Proper
- No secrets: Verified

### Recommendation
READY FOR ACCEPTANCE
```

## Quick Mode Accept

For Quick tasks:
- Abbreviated verification
- No formal report
- Quick confirmation prompt
- Direct archive to quick/

## Memory Protocol

### Before Verifying
```
memory_search({ 
  query: "verification patterns, past issues",
  types: ["observation"]
})
```

### During Verification
```
memory_note({
  note: "Verification passed for [feature]"
})
```

### After Acceptance
```
memory_save({
  type: "observation",
  title: "Feature Accepted: [name]",
  content: "[summary of delivered work]",
  concepts: ["completed", "patterns-used"],
  importance: 0.7
})
```

## Commands

| Command | Effect |
|---------|--------|
| `/goop-accept` | Trigger acceptance verification |
| `/goop-status` | Check verification status |
| `/goop-complete` | Complete and archive milestone |
| `/goop-amend [change]` | Modify spec if issues found |
