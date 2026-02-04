---
name: goop-discuss
description: Capture user vision through discovery interview before planning
phase: discuss
next-step: "When discovery is complete, create the blueprint"
next-command: /goop-plan
alternatives:
  - command: /goop-research
    when: "If there are unknowns to investigate first"
  - command: /goop-quick
    when: "For small, single-file tasks that don't need planning"
---

# /goop-discuss

**Start the Discovery Interview.** Capture vision, requirements, constraints, and risks before planning begins.

## Usage

```bash
/goop-discuss [brief description of what you want to build]
```

## Core Purpose

The Discovery Interview is a **mandatory gate** before planning. It ensures requirements are "nailed down" before any work begins.

```
+================================================================+
|  NO PLANNING WITHOUT DISCOVERY.                                 |
|  The interview ensures we build the RIGHT thing.                |
|  Skipping discovery leads to scope creep and rework.            |
+================================================================+
```

## Orchestrator Role

**YOU conduct the interview directly.** Do NOT spawn agents for conversation.

Why: The interview builds shared understanding. That understanding stays in YOUR context and informs how you delegate. Spawning for conversation fragments knowledge.

## The Six Questions

Every discovery interview MUST answer these questions:

### 1. Vision (The What)
- What are you trying to build?
- What problem does this solve?
- Who is this for?

### 2. Must-Haves (The Contract)
- What are the non-negotiable requirements?
- What MUST be delivered for this to be complete?
- What are the acceptance criteria?

### 3. Constraints (The Boundaries)
- What stack/frameworks are we using?
- What are the performance requirements?
- What existing code must we integrate with?

### 4. Out of Scope (The Guardrails)
- What are we explicitly NOT building?
- What features are deferred to later?

### 5. Assumptions (The Baseline)
- What existing functionality are we relying on?
- What decisions have already been made?

### 6. Risks (The Unknowns)
- What could go wrong?
- What are we uncertain about?
- What dependencies could block us?

## Tools Used

| Tool | Purpose in This Command |
|------|------------------------|
| `goop_status` | Check current phase and project state |
| `memory_search` | Find prior context about the project |
| `memory_save` | Persist discovery interview results |
| `goop_reference` | Load discovery-interview protocol |

**Hook Support:** `system.transform` injects relevant memories before execution.

---

## Process

### Phase 1: Setup

**Execute these checks BEFORE any user interaction:**

**1.1 Check current state:**
```
goop_status()
goop_state({ action: "get" })        # NEVER read state.json directly
Read(".goopspec/REQUIREMENTS.md")    # If exists, interview was done
```

**CRITICAL: Never read or edit .goopspec/state.json directly. Always use `goop_state` tool.**

**1.2 If REQUIREMENTS.md exists:**

Use `question` tool:
- header: "Existing Discovery"
- question: "I found an existing discovery interview. How would you like to proceed?"
- options:
  - "Start fresh (Recommended)" — Clear previous discovery, start new interview
  - "Review and update" — Load previous answers, modify as needed
  - "Use existing" — Skip interview, go straight to /goop-plan

**1.3 Initialize if needed:**
```bash
mkdir -p .goopspec
```

**1.4 Search memory for context:**
```
memory_search({ query: "project preferences architecture [user's topic]", limit: 5 })
```

Store relevant findings - use them to skip questions you already know answers to.

### Phase 2: Discovery Interview

**Display stage banner:**
```
## 🔮 GoopSpec · Discovery Interview

Let's nail down the requirements before planning.
I'll ask six key questions to understand your needs.

---
```

**2.1 Open the conversation:**

If `$ARGUMENTS` provided:
> "You want to **[argument]**. Let me understand this better."

Otherwise:
> "What do you want to build?"

**2.2 Work through the six questions:**

Ask naturally, not as a checklist. Weave questions based on their responses.

**Memory-first protocol:**
Before asking ANYTHING:
1. Check memory: `memory_search({ query: "[topic] preference" })`
2. If found: "I recall you prefer X for this. Still true? [Y/n]"
3. If not found: Ask, then SAVE the answer with `memory_note`

**2.3 Probe for specifics:**

| Vague Answer | Follow-up |
|--------------|-----------|
| "It should be fast" | "What's the target? Sub-100ms? Sub-1s?" |
| "Standard auth" | "JWT? Sessions? OAuth? What's the token TTL?" |
| "Good UX" | "What does that mean for this feature? Animations? Accessibility level?" |

**2.4 Checklist tracker (internal):**

Track progress through the six questions:
- [ ] Vision defined (goal, problem, users)
- [ ] Must-haves listed (at least 1)
- [ ] Constraints documented (stack, performance)
- [ ] Out of scope defined (at least 1 item)
- [ ] Assumptions listed
- [ ] Risks identified (at least 1 with mitigation)

**2.5 Completion check:**

When all six questions are answered, confirm:

Use `question` tool:
- header: "Discovery Check"
- question: "I think I have what I need. Let me summarize..."
- options:
  - "Looks good, proceed" — Generate REQUIREMENTS.md
  - "I want to add more" — Continue discussion
  - "Start over" — Clear and restart interview

### Phase 3: Generate REQUIREMENTS.md

**Display stage banner:**
```
## 🔮 GoopSpec · Saving Discovery

⏳ Generating REQUIREMENTS.md...

---
```

**3.1 Create REQUIREMENTS.md:**

Write directly (orchestrator can write planning docs):

```markdown
# REQUIREMENTS: [Feature Name]

**Generated:** [timestamp]
**Interview Status:** Complete
**Ready for Planning:** Yes

---

## Vision

[Vision statement from interview]

**Problem Solved:** [From interview]

**Why Now:** [From interview]

---

## Must-Haves (The Contract)

- [ ] **MH1**: [Title]
  - [Description]
  - **Acceptance:** [Criteria]

- [ ] **MH2**: [Title]
  - [Description]
  - **Acceptance:** [Criteria]

---

## Out of Scope

- **[Item]** — [Reason]
- **[Item]** — [Reason]

---

## Constraints

### Technical Constraints
- [Stack, frameworks, versions]

### Practical Constraints
- [Timeline, resources]

---

## Assumptions

- **[Assumption]** — If false: [Impact]

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk] | [H/M/L] | [H/M/L] | [Plan] |

---

*Discovery interview completed. Ready for /goop-plan.*
```

**3.2 Mark interview complete (using goop_state tool):**

```
goop_state({ action: "complete-interview" })
```

This atomically updates the workflow state. **NEVER edit state.json directly.**

**3.3 Save to memory:**

```
memory_save({
  type: "note",
  title: "Discovery: [Feature Name]",
  content: "[Summary of key requirements and constraints]",
  concepts: ["discovery", "requirements", "[domain]"],
  importance: 0.7
})
```

### Phase 4: Completion

**Display completion banner:**

```
## 🔮 GoopSpec · Discovery Complete

✨ Requirements captured successfully

**Feature:** [Name]

| Question | Status |
|----------|--------|
| Vision | ✓ Defined |
| Must-Haves | ✓ [N] items |
| Constraints | ✓ Documented |
| Out of Scope | ✓ [M] items |
| Assumptions | ✓ Listed |
| Risks | ✓ [P] identified |

### Next Step

**Create the blueprint** — Transform requirements into an execution plan

→ `/goop-plan`

---

**Also available:**
- `cat .goopspec/REQUIREMENTS.md` — Review discovery output
- `/goop-research [topic]` — Investigate unknowns first
```

## Output

| File | Purpose |
|------|---------|
| `.goopspec/REQUIREMENTS.md` | Discovery interview output |
| State (via goop_state) | Updated with `interviewComplete: true` |

## Transitions

| Outcome | Next Step |
|---------|-----------|
| Discovery complete | `/goop-plan` to create blueprint |
| Unknowns found | `/goop-research` to investigate |
| Small task | `/goop-quick` to skip planning |

## Bypass Conditions

Discovery MAY be skipped only for:
- `/goop-quick` small tasks (single file, < 30 min work)
- Bug fixes with clear reproduction steps
- Documentation-only changes

## Examples

**Simple Feature:**
```
User: /goop-discuss add dark mode toggle

Orchestrator: "Dark mode toggle. Let me understand what you need.

**Vision:** What's the goal here?
- Toggle in settings that switches the app theme
- Persist preference across sessions
- Respect system preference as default

**Must-haves:** What MUST work?
- Toggle UI in settings
- Theme actually changes
- Persists to localStorage

**Out of scope?**
- Per-component theme overrides
- Multiple theme options beyond light/dark

**Constraints?**
- Using existing Tailwind dark: classes
- No new dependencies

**Assumptions?**
- CSS already has dark variants (will verify)

**Risks?**
- Some components may not have dark styles → will audit first

Great, I have what I need. Creating REQUIREMENTS.md..."
```

**Complex Feature:**
```
User: /goop-discuss rebuild the payment system

Orchestrator: "Payment system rebuild - that's significant. 
Let me understand the scope.

**Vision:** What's driving this?
- Current system uses deprecated Stripe API
- Need to add PayPal as alternative
- Improve error handling and retry logic

**Must-haves:**
- Migrate to Stripe v2 API
- Add PayPal integration
- Unified payment interface
- Retry with exponential backoff
- Webhook handling for async payments

**Out of scope:**
- Cryptocurrency payments (future)
- Subscription management (separate project)

**Risks:**
- Stripe migration may have breaking changes → research first
- PayPal integration complexity unknown → estimate 2x buffer

I'd recommend running `/goop-research stripe v2 migration` before 
planning. Want to do that first?"
```

## Success Criteria

- [ ] All six questions answered with specifics
- [ ] At least 1 must-have defined
- [ ] At least 1 out-of-scope item defined
- [ ] At least 1 risk with mitigation
- [ ] REQUIREMENTS.md created
- [ ] State updated via `goop_state({ action: "complete-interview" })`
- [ ] User knows next step is `/goop-plan`

## Anti-Patterns

**DON'T:**
- Accept vague answers ("it should be good")
- Skip the risks question ("nothing could go wrong")
- Rush through to get to coding
- Spawn agents to conduct the interview
- Create SPEC.md directly (that's /goop-plan's job)

**DO:**
- Probe vague answers for specifics
- Challenge "no risks" with scenarios
- Take time - discovery is highest leverage
- Conduct interview yourself (keeps context)
- Save answers to memory for future reference

---

*Discovery Interview Protocol v0.1.4*
*"Nail the spec before you write the code."*
