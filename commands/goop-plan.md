---
name: goop-plan
description: Create specification and blueprint from discovery interview
phase: plan
requires: interview_complete
next-step: "When planning is complete, lock the specification"
next-command: /goop-specify
alternatives:
  - command: /goop-discuss
    when: "If discovery interview was not completed"
  - command: /goop-research
    when: "If there are unknowns to investigate"
  - command: /goop-pause
    when: "To save progress and continue later"
---

# /goop-plan

**Create Specification and Blueprint.** Transform discovery interview into executable plans.

## Usage

```bash
/goop-plan
```

## Gate Requirement

```
+================================================================+
|  DISCOVERY GATE: Interview must be complete before planning.    |
|  This ensures we build the RIGHT thing.                         |
+================================================================+
```

**Required before this command:**
- `interviewComplete: true` (check via `goop_state({ action: "get" })`)
- `.goopspec/REQUIREMENTS.md` exists

**If not satisfied:** Refuse and redirect to `/goop-discuss`

**CRITICAL: Never read or edit .goopspec/state.json directly. Always use `goop_state` tool.**

## Orchestrator Role

**You check the gate, then spawn the planner.** The planner creates SPEC.md and BLUEPRINT.md.

## Tools Used

| Tool | Purpose in This Command |
|------|------------------------|
| `goop_status` | Check current phase and gate requirements |
| `goop_spec` | Validate interview complete, load existing specs |
| `memory_search` | Find prior architecture decisions |
| `memory_decision` | Record new planning decisions |
| `goop_reference` | Load spec/blueprint templates |

**Hook Support:** `tool.execute.after` may auto-transition to specify phase.

---

## Process

### Phase 1: Gate Check

**Execute BEFORE anything else:**

```
goop_status()
goop_state({ action: "get" })          # NEVER read state.json directly
Read(".goopspec/REQUIREMENTS.md")
```

**1.1 Check interviewComplete:**

```
IF state.interviewComplete != true:
  REFUSE with:
  
  ## 🔮 GoopSpec · Gate Blocked
  
  ✗ Discovery interview required before planning.
  
  → Run: `/goop-discuss`
  
  ---
  
  EXIT command.
```

**1.2 Check REQUIREMENTS.md exists:**

```
IF .goopspec/REQUIREMENTS.md does not exist:
  REFUSE with:
  
  ## 🔮 GoopSpec · Gate Blocked
  
  ✗ No discovery output found.
  
  → Run: `/goop-discuss`
  
  ---
  
  EXIT command.
```

**1.3 Gate passed:**

```
## 🔮 GoopSpec · Planning

✓ Discovery gate passed

⏳ Creating specification and blueprint...

---
```

### Phase 2: Check for Existing Documents

**2.1 Check for existing SPEC.md/BLUEPRINT.md:**

```
Read(".goopspec/SPEC.md")
Read(".goopspec/BLUEPRINT.md")
```

**2.2 If documents exist:**

Use `question` tool:
- header: "Existing Project"
- question: "I found existing project documents. How would you like to proceed?"
- options:
  - "Archive and start fresh (Recommended)" — Move current docs to archive, create new
  - "Continue existing project" — Resume work (exit, run /goop-status)
  - "Overwrite without archiving" — Replace documents (loses history)

**On "Archive":** Spawn writer to archive, then continue.
**On "Continue":** Exit, suggest `/goop-status`.
**On "Overwrite":** Warn, then continue.

### Phase 3: Load Context

**3.1 Load discovery interview:**

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

**3.2 Search memory:**

```
memory_search({ query: "[feature] architecture decisions patterns", limit: 5 })
```

**3.3 Load project knowledge:**

```
Read(".goopspec/PROJECT_KNOWLEDGE_BASE.md")  # If exists
```

### Phase 4: Spawn Planner

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

### Vision
[Vision section]

### Must-Haves
[Must-haves with acceptance criteria]

### Constraints
[Technical and practical constraints]

### Out of Scope
[Explicit exclusions]

### Assumptions
[Baseline assumptions]

### Risks
[Identified risks with mitigations]

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

### Phase 5: Handle Response

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

**Also available:**
- `cat .goopspec/SPEC.md` — Review specification
- `cat .goopspec/BLUEPRINT.md` — Review execution plan
- `/goop-research [topic]` — Investigate unknowns first
```

**Generate HANDOFF.md:**

```
Write(".goopspec/HANDOFF.md", `
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
`)
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

**On `PARTIAL` status:**

Present what was created, explain gaps, offer to continue or restart.

### Phase 6: Memory Persistence

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

## Output

| File | Purpose |
|------|---------|
| `.goopspec/SPEC.md` | Specification (Draft) |
| `.goopspec/BLUEPRINT.md` | Wave-based execution plan |
| `.goopspec/CHRONICLE.md` | Progress tracking |
| `.goopspec/HANDOFF.md` | Session handoff |
| State (via goop_state) | Workflow state (phase transitions) |

## Transitions

| Outcome | Next Step |
|---------|-----------|
| Planning complete | `/goop-specify` to lock |
| Missing discovery | `/goop-discuss` to interview |
| Unknowns remain | `/goop-research` to investigate |
| Need to pause | `/goop-pause` to checkpoint |

## Examples

**Gate Passed:**
```
User: /goop-plan

Orchestrator: 
+--------------------------------------------------------+
|  GOOPSPEC > PLANNING                                    |
+--------------------------------------------------------+
|  Discovery gate: PASSED                                  |
|  Creating specification and blueprint...                 |
+--------------------------------------------------------+

[Spawns goop-planner]

...

+--------------------------------------------------------+
|  GOOPSPEC > PLANNING COMPLETE                           |
+--------------------------------------------------------+

**Feature:** Dark Mode Toggle

| Document   | Status  |
|------------|---------|
| Spec       | Created |
| Blueprint  | Created |

**3 must-haves** | **2 waves** | **5 tasks**

## > Next Step
`/goop-specify`
```

**Gate Blocked:**
```
User: /goop-plan

Orchestrator:
+--------------------------------------------------------+
|  GOOPSPEC > GATE BLOCKED                                |
+--------------------------------------------------------+
|  Discovery interview required before planning.          |
|                                                         |
|  Run: /goop-discuss                                     |
+--------------------------------------------------------+
```

## Success Criteria

- [ ] Gate check performed (interview_complete + REQUIREMENTS.md)
- [ ] If gate fails, refused with clear redirect to /goop-discuss
- [ ] Existing documents handled (archive/continue/overwrite)
- [ ] goop-planner spawned with full discovery context
- [ ] SPEC.md created with traceability
- [ ] BLUEPRINT.md created with spec coverage
- [ ] 100% must-have coverage achieved
- [ ] HANDOFF.md generated
- [ ] User knows next step is `/goop-specify`
- [ ] Suggested to start new session for fresh context

## Anti-Patterns

**DON'T:**
- Skip the discovery gate check
- Conduct interview in /goop-plan (that's /goop-discuss)
- Create documents without traceability
- Leave user without next steps
- Skip handoff generation

**DO:**
- Enforce the gate strictly
- Spawn planner with complete context
- Verify 100% traceability
- Generate HANDOFF.md
- Suggest new session for clean context

---

*Planning Protocol v0.1.4*
*"Every must-have traces to tasks."*
