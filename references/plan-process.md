# Planning Process

Detailed process for `/goop-plan` - creating SPEC.md and BLUEPRINT.md from discovery.

## Phase 1: Gate Check

**Execute BEFORE anything else:**

```
goop_status()
goop_state({ action: "get" })          # NEVER read state.json directly
Read(".goopspec/REQUIREMENTS.md")
```

### 1.1 Check interviewComplete

```
IF state.interviewComplete != true:
  REFUSE with:
  
  ## 🔮 GoopSpec · Gate Blocked
  
  ✗ Discovery interview required before planning.
  
  → Run: `/goop-discuss`
  
  ---
  
  EXIT command.
```

### 1.2 Check REQUIREMENTS.md exists

```
IF .goopspec/REQUIREMENTS.md does not exist:
  REFUSE with:
  
  ## 🔮 GoopSpec · Gate Blocked
  
  ✗ No discovery output found.
  
  → Run: `/goop-discuss`
  
  ---
  
  EXIT command.
```

### 1.3 Gate passed

```
## 🔮 GoopSpec · Planning

✓ Discovery gate passed

⏳ Creating specification and blueprint...

---
```

---

## Phase 2: Load Context

**Note:** Existing document archiving is handled in `/goop-discuss` Phase 1.2. 
By this point, any prior milestone has already been archived or the user chose to continue it.

### 2.1 Load discovery interview

```
Read(".goopspec/REQUIREMENTS.md")
```

Extract:
- Vision
- Must-haves (with acceptance criteria)
- Constraints
- Out of scope
- Assumptions
- Risks

### 2.2 Search memory

```
memory_search({ query: "[feature] architecture decisions patterns", limit: 5 })
```

### 2.3 Create or load project knowledge

```
Read(".goopspec/PROJECT_KNOWLEDGE_BASE.md")
```

**If PROJECT_KNOWLEDGE_BASE.md does not exist, CREATE IT:**

```markdown
# Project Knowledge Base

**Last Updated:** [timestamp]
**Updated By:** orchestrator (auto-generated from discovery)

---

## Project Identity

**Name:** [From REQUIREMENTS.md vision]
**Type:** [Inferred from constraints]
**Stage:** Active

---

## Stack (Non-Negotiable)

[Extract from REQUIREMENTS.md Constraints section]

### Runtime & Language
- **Runtime:** [e.g., Node.js / Bun / Browser]
- **Language:** [e.g., TypeScript]

### Frameworks & Libraries
- **Framework:** [From constraints]
- **Testing:** [From constraints or infer from package.json]

---

## Conventions

[Extract from REQUIREMENTS.md or infer from codebase]

### File Naming
- **Files:** [kebab-case / camelCase]
- **Tests:** [*.test.ts / *.spec.ts]

### Code Style
- **Exports:** [Named / Default]

---

## Architecture Decisions

*To be populated during planning and execution.*

---

## Known Gotchas

*To be populated as issues are discovered.*

---

*Auto-generated from discovery interview. Update as project evolves.*
```

Write to `.goopspec/PROJECT_KNOWLEDGE_BASE.md` before proceeding.

---

## Phase 3: Spawn Planner

**Display banner:**
```
## 🔮 GoopSpec · Creating Documents

⏳ Spawning planner to create SPEC.md and BLUEPRINT.md...

---
```

**Spawn goop-planner with full context:**

```
task({
  subagent_type: "goop-planner",
  description: "Create SPEC and BLUEPRINT",
  prompt: `
## TASK
Create specification and blueprint from discovery interview.

## PROJECT CONTEXT
[From PROJECT_KNOWLEDGE_BASE.md if exists]
- Stack: [technologies]
- Conventions: [naming, patterns]

## DISCOVERY INTERVIEW OUTPUT
[Full content of REQUIREMENTS.md]

## INSTRUCTIONS

1. **Verify discovery completeness:**
   - Vision defined? 
   - Must-haves listed with acceptance criteria?
   - Out of scope defined?
   - Risks identified?
   
   If missing critical info, return BLOCKED.

2. **Create .goopspec/SPEC.md:**
   - Transform must-haves into formal requirements (MH1, MH2, etc.)
   - Include acceptance criteria for each
   - Add traceability section (will be filled after blueprint)
   - Mark status as "Draft"

3. **Create .goopspec/BLUEPRINT.md:**
   - Design wave architecture
   - Create tasks that cover ALL must-haves
   - Add spec coverage to each task
   - Build traceability matrix

4. **Update .goopspec/SPEC.md:**
   - Fill traceability matrix (must-have → tasks)
   - Verify 100% coverage

5. **Initialize .goopspec/CHRONICLE.md:**
   - Phase: plan → ready for specify
   - Documents created with timestamps

6. **Save to memory:**
   - Key architectural decisions
   - Technology choices with rationale

7. **Return XML response envelope** with:
   - BLUEPRINT COMPLETE status
   - Wave summary
   - Traceability summary
   - Handoff instructions

## VERIFICATION
Before returning COMPLETE:
- [ ] Every must-have has mapped tasks
- [ ] Every task has spec coverage
- [ ] Traceability matrix shows 100%
- [ ] SPEC.md has all sections filled
- [ ] BLUEPRINT.md has verification commands
  `
})
```

---

## Phase 4: Handle Response

**Parse XML response from planner.**

**On `COMPLETE` status:**

Read created documents:
```
Read(".goopspec/SPEC.md")
Read(".goopspec/BLUEPRINT.md")
```

Display completion:
```
## 🔮 GoopSpec · Planning Complete

✨ Blueprint created successfully

**Feature:** [Name from SPEC.md]

| Document | Status | Location |
|----------|--------|----------|
| Spec | ✓ Created | .goopspec/SPEC.md |
| Blueprint | ✓ Created | .goopspec/BLUEPRINT.md |
| Chronicle | ✓ Created | .goopspec/CHRONICLE.md |

**[N] must-haves** | **[M] waves** | **[P] tasks**

### Traceability
| Must-Have | Covered By |
|-----------|------------|
| MH1 | Wave X, Tasks Y |
| MH2 | Wave X, Tasks Y |

✓ Coverage: 100%

### Next Step

**Lock the specification** — Confirm requirements before execution

→ `/goop-specify`

---

Start a **new session** for fresh context, then run the command.
```

**Generate HANDOFF.md:**

```markdown
# Session Handoff

**Generated:** [timestamp]
**Phase:** plan

## Accomplished
- [x] Discovery interview completed
- [x] SPEC.md created with [N] must-haves
- [x] BLUEPRINT.md created with [M] waves, [P] tasks
- [x] 100% traceability achieved

## Current State
- Phase: plan
- Interview: complete
- Spec: draft (not locked)

## Next Session
Run: /goop-specify

## Files to Read
1. .goopspec/SPEC.md — Requirements
2. .goopspec/BLUEPRINT.md — Execution plan

## Context Summary
Planning complete for [feature]. [N] must-haves mapped to [P] tasks
across [M] waves. Ready to lock specification.
```

**On `BLOCKED` status:**

```
## 🔮 GoopSpec · Planning Blocked

✗ Cannot proceed

**Blocker:** [From planner response]

**Options:**
1. Provide more context → `/goop-discuss`
2. Research the unknown → `/goop-research [topic]`

---
```

Use `question` tool to get user choice.

---

## Phase 5: Memory Persistence

After successful planning:

```
memory_save({
  type: "note",
  title: "Plan: [Feature Name]",
  content: "Created [N]-wave blueprint. Key decisions: [list]. Must-haves: [summary].",
  concepts: ["planning", "blueprint", "[domain]"],
  importance: 0.7
})
```

---

## Examples

### Gate Passed
```
User: /goop-plan

Orchestrator: 
## 🔮 GoopSpec · Planning

✓ Discovery gate passed

[Spawns goop-planner]

...

## 🔮 GoopSpec · Planning Complete

**Feature:** Dark Mode Toggle

| Document   | Status  |
|------------|---------|
| Spec       | Created |
| Blueprint  | Created |

**3 must-haves** | **2 waves** | **5 tasks**

→ Next: `/goop-specify`
```

### Gate Blocked
```
User: /goop-plan

Orchestrator:
## 🔮 GoopSpec · Gate Blocked

✗ Discovery interview required before planning.

→ Run: `/goop-discuss`
```

---

*Planning Process v0.2.0*
