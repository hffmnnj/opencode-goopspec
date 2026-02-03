---
name: goop-accept
description: Verify and accept completion - the ACCEPTANCE GATE
---

# GoopSpec Accept

Verify the implementation against the specification and obtain user sign-off.

## Usage

```
/goop-accept
```

## Workflow Position

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

The Accept phase answers: **Did we deliver what we promised?**

## What Happens

1. **Spec Compliance Check** - Verify each must-have from SPEC.md:
   - Check observable behaviors
   - Confirm acceptance criteria met
   - Document evidence (tests, manual verification)

2. **Automated Verification** - Run all quality gates:
   - Type checking (`npm run typecheck`)
   - Linting (`npm run lint`)
   - Tests (`npm test`)
   - Build (`npm run build`)

3. **Manual Verification** - For behaviors that can't be automated:
   - End-to-end flows
   - UI/UX checks
   - Accessibility verification
   - Mobile responsiveness

4. **Security Audit** - For security-sensitive features:
   - Input validation present
   - No hardcoded secrets
   - Auth/authz properly enforced
   - No obvious vulnerabilities

5. **Verifier Agent** - Delegate comprehensive verification to goop-verifier

6. **Present Results** - Show verification report with must-haves status

7. **Wait for Acceptance** - User MUST type "accept" to confirm

## Acceptance Prompt

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

## User Responses

| Response | Effect |
|----------|--------|
| `accept` | Work marked complete, proceed to archive |
| `issues: [desc]` | Return to Execute phase for fixes |
| `amend: [change]` | Modify spec, reassess what's needed |

## Post-Acceptance

After user accepts:

1. **Generate Summary** - Create completion summary with:
   - Delivered features
   - Key decisions made
   - Files modified
   - Duration and task count

2. **Archive (Milestones)** - For milestone completion:
   - Move to archive/
   - Generate RETROSPECTIVE.md
   - Extract LEARNINGS.md
   - Persist learnings to memory
   - Tag git with version

3. **Clean Up** - Clear active workflow state, ready for next task

## Handling Issues

### Minor Issues
Issues that don't fundamentally change the spec:
- Note as fix task
- Delegate quick fix
- Re-verify affected area
- Present for re-acceptance

### Major Issues
Issues that reveal missing requirements:
- Note as spec change
- Prompt for `/goop-amend`
- Update SPEC.md
- Re-plan affected tasks
- Execute additions
- Re-verify

## Artifacts Created

- Verification report in CHRONICLE.md
- Summary document
- RETROSPECTIVE.md (for milestones)
- LEARNINGS.md (for milestones)
- Memory entries for patterns and decisions

## Example

After execution of authentication feature:

```
/goop-accept
```

Verifier checks all must-haves, runs tests, presents results.
User types "accept" to confirm completion.

## Next Steps

After acceptance:
- `/goop-complete` - Complete and archive milestone
- `/goop-plan [next]` - Start next feature
- `/goop-quick` - Handle quick task

## Quick Mode Accept

For Quick tasks:
- Abbreviated verification
- No formal report
- Quick confirmation prompt
- Direct archive to quick/

---

**GoopSpec**: Verify rigorously, accept confidently.
