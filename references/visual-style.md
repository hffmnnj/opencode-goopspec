# GoopSpec Visual Style Guide

A distinctive, minimal visual language for GoopSpec messages.

## Brand Identity

**Primary Icon:** 🔮 (Crystal Ball - represents foresight, planning, specification)

**Philosophy:** Clean, minimal, precise. GoopSpec is about careful planning and clear contracts - the visual style should feel refined without being cluttered.

## Header Styles

### Primary Phase Header
```
## 🔮 GoopSpec · [Phase/Context]

[Content here]

---
```

### Success Header
```
## 🔮 GoopSpec · Phase Complete

✨ [Success message]

---
```

### Warning/Blocked Header
```
## 🔮 GoopSpec · Gate Blocked

⚠️ [Warning message]

→ Run: `/goop-[command]`

---
```

## Phase Icons

| Phase | Icon | Usage |
|-------|------|-------|
| Discuss | 💬 | Discovery interview |
| Plan | 📋 | Blueprint creation |
| Research | 🔬 | Investigation |
| Specify | 📜 | Locking the contract |
| Execute | ⚡ | Wave-based implementation |
| Accept | ✅ | Verification & approval |
| Idle | 🔮 | Ready state |

## Status Indicators

| Status | Icon | Meaning |
|--------|------|---------|
| Complete | ✓ | Task/phase done |
| Pending | ⏳ | In progress or waiting |
| Blocked | ✗ | Cannot proceed |
| Locked | 🔒 | Spec is locked |
| Unlocked | 🔓 | Spec can be modified |
| Warning | ⚠️ | Attention needed |
| Success | ✨ | Milestone achieved |
| Error | ❌ | Something failed |

## Message Templates

### Phase Start
```markdown
## 🔮 GoopSpec · [Phase Name]

[Phase description and context]

---
```

### Gate Check - Pass
```markdown
## 🔮 GoopSpec · Gate Check

✓ Gate passed. Proceeding...

---
```

### Gate Check - Blocked
```markdown
## 🔮 GoopSpec · Gate Blocked

✗ [Reason for block]

→ Run: `/goop-[command]`

---
```

### Progress Update
```markdown
## 🔮 GoopSpec · Progress

**Phase:** ⚡ Execute | **Wave:** 2/3 | **Task:** 4/6

### Completed
- ✓ Task 2.1: [description]
- ✓ Task 2.2: [description]

### In Progress
- ⏳ Task 2.3: [description]

---
```

### Phase Complete
```markdown
## 🔮 GoopSpec · Phase Complete

✨ [Phase Name] finished successfully

### Summary
[Summary content]

### Next Step
→ `/goop-[next-command]`

---
```

### Decision Required
```markdown
## 🔮 GoopSpec · Decision Required

⚠️ [Context about the decision]

**Options:**
- **A)** [Option A description]
- **B)** [Option B description]

Which option?

---
```

### Handoff
```markdown
## 🔮 GoopSpec · Session Handoff

### Accomplished
- ✓ [Item 1]
- ✓ [Item 2]

### Current State
**Phase:** [phase] | **Spec:** [locked/unlocked] | **Wave:** [N/M]

### To Continue
Start a new session, then run: `/goop-[command]`

---
```

### Status Display
```markdown
## 🔮 GoopSpec · Status

**Project:** [name]

| Gate | Status |
|------|--------|
| Interview | ✓ Complete |
| Spec Lock | 🔒 Locked |
| Acceptance | ⏳ Pending |

### Next Step
→ `/goop-[command]`

---
```

## Comparison: GoopSpec vs GSD

| Element | GSD (Industrial) | GoopSpec (Minimal) |
|---------|------------------|-------------------|
| Primary icon | None | 🔮 |
| Headers | `+====+ GOOPSPEC > PHASE` | `## 🔮 GoopSpec · Phase` |
| Separators | `+----+` boxes | `---` dividers |
| Feel | Industrial, rigid | Clean, minimal |

## Usage Guidelines

1. **Consistency:** Always use `## 🔮 GoopSpec · [Context]` for main headers
2. **Dividers:** Use `---` to separate sections
3. **Breathing room:** Include blank lines between sections
4. **Bullet indicators:** Use ✓ ✗ ⏳ for status
5. **Actions:** Use → for "next step" callouts
6. **Phase awareness:** Use phase-specific icons (💬 📋 🔬 📜 ⚡ ✅) when relevant

---

*GoopSpec Visual Style v0.2.1*
