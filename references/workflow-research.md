# Workflow: Research Phase

The Research phase gathers context and explores implementation approaches before committing to a specification.

## Position in Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PLAN     │ ──▶ │  RESEARCH   │ ──▶ │   SPECIFY   │
│  (Intent)   │     │  (Explore)  │     │ (Contract)  │
└─────────────┘     └─────────────┘     └─────────────┘
                          ↑
                    (You are here)
```

## Purpose

The Research phase answers: **How should we build this?**

It explores the problem space, gathers context, evaluates approaches, and informs specification decisions.

## Entry Criteria

- Plan phase complete
- Intent and requirements documented
- User has confirmed understanding

## Parallel Research Agents

Research phase spawns multiple agents working simultaneously:

| Agent | Focus |
|-------|-------|
| **Researcher** | Deep domain research - technologies, patterns, best practices |
| **Explorer** | Codebase analysis - existing patterns, conventions, integration points |
| **Librarian** | Documentation gathering - API docs, library guides, examples |
| **Designer** | (For UI tasks) Visual research - patterns, components, UX |

### Research Delegation

```
task({
  subagent_type: "general",
  description: "Research topic",
  prompt: "Research [topic] for [project intent]. Focus on: ..."
})

task({
  subagent_type: "explore",
  description: "Explore codebase",
  prompt: "Explore codebase for patterns related to [feature]. Map: ..."
})

task({
  subagent_type: "general",
  description: "Gather documentation",
  prompt: "Gather documentation for [library/API]. Find: ..."
})
```

## Research Areas

### 1. Technology Research

- Available libraries/frameworks
- Tradeoffs between approaches
- Performance characteristics
- Security considerations
- Community support/maturity

### 2. Codebase Exploration

- Existing patterns and conventions
- Related implementations
- Integration points
- Potential conflicts
- Test coverage gaps

### 3. Domain Knowledge

- Business rules
- Edge cases
- User expectations
- Industry standards
- Compliance requirements

### 4. Visual Research (UI Tasks)

- Design patterns
- Component libraries
- Accessibility requirements
- Responsive considerations
- Animation/interaction patterns

## RESEARCH.md Output

Research findings are consolidated into RESEARCH.md:

```markdown
# Research: [Feature Name]

## Domain Analysis

### Technology Options
| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| Option A | ... | ... | Recommended |
| Option B | ... | ... | Alternative |

### Relevant Documentation
- [Link 1]: Key insight
- [Link 2]: Key insight

## Codebase Analysis

### Existing Patterns
- Pattern 1: Used in [files], suitable for [use case]
- Pattern 2: Used in [files], suitable for [use case]

### Integration Points
- Component A: Will need [modification]
- Service B: Already supports [capability]

### Conventions Discovered
- Naming: [convention]
- Structure: [convention]
- Testing: [convention]

## Recommendations

### Approach
[Recommended implementation approach]

### Key Decisions Needed
- Decision 1: [options]
- Decision 2: [options]

### Risks
- Risk 1: [description, mitigation]
- Risk 2: [description, mitigation]

### Estimated Complexity
[Low / Medium / High] - [rationale]
```

## Research Quality Criteria

### Good Research
- Multiple sources consulted
- Alternatives considered
- Tradeoffs explicitly stated
- Recommendations justified
- Risks identified

### Bad Research
- Single source only
- First option accepted
- No alternatives considered
- Recommendations without rationale
- No risk assessment

## Transition to Specify Phase

Research phase is complete when:

- [ ] All parallel agents have reported findings
- [ ] RESEARCH.md consolidated and saved
- [ ] Key decisions identified
- [ ] Recommended approach documented
- [ ] Risks catalogued

**Transition prompt:**
```
"Research complete. Key findings:

Recommended approach: [summary]
Key decisions needed: [list]
Main risks: [list]

Ready to lock the specification?"
```

## Quick Mode Shortcut

For Quick tasks, Research phase is SKIPPED entirely:
- Assume existing patterns are sufficient
- No parallel agent spawning
- Jump directly from Plan to Execute

## Comprehensive Mode Extension

For Comprehensive tasks:
- Deeper research per agent
- More alternatives explored
- Extended timeframe
- User reviews RESEARCH.md before Specify

## Memory Protocol

### Before Starting
```
memory_search({ 
  query: "past research on [topic]",
  concepts: ["technology", "pattern"]
})
```

### During Research
Each agent saves findings:
```
memory_save({
  type: "observation",
  title: "Research: [specific finding]",
  concepts: ["relevant", "concepts"]
})
```

### After Completing
```
memory_save({
  type: "observation",
  title: "Research Summary: [feature]",
  content: "[key findings]",
  concepts: ["tech-choices", "patterns"]
})
```

## Commands

| Command | Effect |
|---------|--------|
| `/goop-research` | Start Research phase |
| `/goop-status` | Check research progress |
| `/goop-recall [query]` | Search past research |
