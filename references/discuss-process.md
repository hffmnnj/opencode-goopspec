# Discovery Interview Process

Detailed process for conducting the `/goop-discuss` discovery interview.

## Phase 1: Setup

**Execute these checks BEFORE any user interaction:**

### 1.1 Check current state

```
goop_status()
goop_state({ action: "get" })        # NEVER read state.json directly
```

**CRITICAL: Never read or edit .goopspec/state.json directly. Always use `goop_state` tool.**

### 1.2 Git branch check (Session Start)

Check current branch and offer to create a new one for this work:

```bash
git branch --show-current
git status
```

Use `question` tool:
- header: "Git Branch"
- question: "You're on branch `[current-branch]`. How would you like to proceed?"
- options:
  - "Create new feature branch (Recommended)" — Create a clean branch for this work
  - "Stay on current branch" — Continue on [current-branch]

**On "Create new feature branch":**

Ask for branch name context (or infer from topic):
```
Branch name will be: feat/[short-description]
```

Then create branch:
```bash
git checkout -b feat/[short-description]
```

**Branch naming rules:**
- Format: `type/short-description`
- Types: `feat/`, `fix/`, `refactor/`, `chore/`
- Keep descriptions short and kebab-case
- Check existing branches first: `git branch --list`

### 1.3 Check for existing project documents

```
Read(".goopspec/SPEC.md")
Read(".goopspec/BLUEPRINT.md")
```

**If SPEC.md or BLUEPRINT.md exist**, the user may have completed work that needs archiving.

Use `question` tool:
- header: "Existing Project"
- question: "I found existing project documents. How would you like to proceed?"
- options:
  - "Archive and start fresh (Recommended)" — Move current docs to archive, create new
  - "Continue existing project" — Resume work (exit, run /goop-status)
  - "Overwrite without archiving" — Replace documents (loses history)

**On "Archive":** 
```
task({
  subagent_type: "goop-writer",
  description: "Archive milestone",
  prompt: "Archive the current milestone. Move SPEC.md, BLUEPRINT.md, CHRONICLE.md to .goopspec/archive/[milestone-slug]/"
})
```
Then continue with discovery.

**On "Continue":** Exit and suggest `/goop-status`.
**On "Overwrite":** Warn about losing history, then continue.

### 1.4 Check for existing REQUIREMENTS.md

```
Read(".goopspec/REQUIREMENTS.md")    # If exists, interview was done
```

### 1.5 If REQUIREMENTS.md exists

Use `question` tool:
- header: "Existing Discovery"
- question: "I found an existing discovery interview. How would you like to proceed?"
- options:
  - "Start fresh (Recommended)" — Clear previous discovery, start new interview
  - "Review and update" — Load previous answers, modify as needed
  - "Use existing" — Skip interview, go straight to /goop-plan

### 1.6 Initialize if needed

```bash
mkdir -p .goopspec
```

### 1.7 Search memory for context

```
memory_search({ query: "project preferences architecture [user's topic]", limit: 5 })
```

Store relevant findings - use them to skip questions you already know answers to.

---

## Phase 2: Discovery Interview

**Display stage banner:**
```
## 🔮 GoopSpec · Discovery Interview

Let's nail down the requirements before planning.
I'll ask six key questions to understand your needs.

---
```

### 2.1 Open the conversation

If `$ARGUMENTS` provided:
> "You want to **[argument]**. Let me understand this better."

Otherwise:
> "What do you want to build?"

### 2.2 Work through the six questions

Ask naturally, not as a checklist. Weave questions based on their responses.

**Memory-first protocol:**
Before asking ANYTHING:
1. Check memory: `memory_search({ query: "[topic] preference" })`
2. If found: "I recall you prefer X for this. Still true? [Y/n]"
3. If not found: Ask, then SAVE the answer with `memory_note`

### 2.3 Probe for specifics

| Vague Answer | Follow-up |
|--------------|-----------|
| "It should be fast" | "What's the target? Sub-100ms? Sub-1s?" |
| "Standard auth" | "JWT? Sessions? OAuth? What's the token TTL?" |
| "Good UX" | "What does that mean for this feature? Animations? Accessibility level?" |

### 2.4 Checklist tracker (internal)

Track progress through the six questions:
- [ ] Vision defined (goal, problem, users)
- [ ] Must-haves listed (at least 1)
- [ ] Constraints documented (stack, performance)
- [ ] Out of scope defined (at least 1 item)
- [ ] Assumptions listed
- [ ] Risks identified (at least 1 with mitigation)

### 2.5 Completion check

When all six questions are answered, confirm:

Use `question` tool:
- header: "Discovery Check"
- question: "I think I have what I need. Let me summarize..."
- options:
  - "Looks good, proceed" — Generate REQUIREMENTS.md
  - "I want to add more" — Continue discussion
  - "Start over" — Clear and restart interview

---

## Phase 3: Generate REQUIREMENTS.md

**Display stage banner:**
```
## 🔮 GoopSpec · Saving Discovery

⏳ Generating REQUIREMENTS.md...

---
```

### 3.1 Create REQUIREMENTS.md

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

### 3.2 Mark interview complete

```
goop_state({ action: "complete-interview" })
```

This atomically updates the workflow state. **NEVER edit state.json directly.**

### 3.3 Save to memory

```
memory_save({
  type: "note",
  title: "Discovery: [Feature Name]",
  content: "[Summary of key requirements and constraints]",
  concepts: ["discovery", "requirements", "[domain]"],
  importance: 0.7
})
```

---

## Phase 4: Completion

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

---

## Examples

### Simple Feature

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

### Complex Feature

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

---

*Discovery Interview Process v0.2.0*
