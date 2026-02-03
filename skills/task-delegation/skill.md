---
name: task-delegation
description: Patterns for delegating tasks to specialized agents
category: core
triggers:
  - delegate
  - spawn
  - subagent
  - task
version: 0.1.0
requires:
  - goop-core
---

# Task Delegation Skill

## When to Delegate

Delegate when:
- Task requires specialized expertise (testing, security, documentation)
- Context is getting bloated (>70% usage)
- Task can run in parallel with other work
- Fresh perspective needed

Don't delegate when:
- Task is trivial (<5 minutes)
- Heavy context sharing required
- Sequential dependency on current work

## Delegation Patterns

### Sequential Delegation

```json
{
  "mode": "sequential",
  "tasks": [
    { "agent": "planner", "task": "Create plan" },
    { "agent": "executor", "task": "Implement plan" },
    { "agent": "verifier", "task": "Verify implementation" }
  ]
}
```

### Parallel Delegation

```json
{
  "mode": "parallel",
  "max_concurrent": 3,
  "tasks": [
    { "agent": "executor", "task": "Implement feature A" },
    { "agent": "executor", "task": "Implement feature B" },
    { "agent": "tester", "task": "Write tests" }
  ]
}
```

### Background Delegation

```json
{
  "mode": "background",
  "agent": "researcher",
  "task": "Research best practices",
  "notify_on_complete": true
}
```

## Agent Selection

| Task Type | Agent | Model Tier |
|-----------|-------|------------|
| Planning | goop-planner | quality |
| Implementation | goop-executor | balanced |
| Verification | goop-verifier | quality |
| Research | goop-researcher | balanced |
| Documentation | goop-writer | budget |
| Testing | goop-tester | balanced |
| Debugging | goop-debugger | quality |
| Security | goop-verifier | quality |

## Context Handoff

When delegating, pass:
1. **Essential state:** Current phase, spec, todos
2. **Relevant files:** Only files the agent needs
3. **Recent decisions:** Last 3-5 ADL entries
4. **Constraints:** Boundaries, deadlines, blockers

Don't pass:
- Full conversation history
- Verbose logs
- Unrelated file contents
- Completed task details

## Using task Tool

```typescript
task({
  subagent_type: "general",
  description: "Implement authentication",
  prompt: `
    ## TASK
    Implement user authentication

    ## CONTEXT
    - SPEC: .goopspec/phases/phase-1/SPEC.md
  `
})
```

## Error Handling

If delegated task fails:
1. Check error type (timeout, crash, assertion)
2. Save partial progress as checkpoint
3. Decide: retry, reassign, or escalate
4. Log failure to ADL if significant

## Best Practices

1. **Clear instructions:** Specific, unambiguous task descriptions
2. **Scoped context:** Only relevant information
3. **Defined success:** Clear verification criteria
4. **Timeout limits:** Set reasonable time bounds
5. **Progress tracking:** Monitor via todos/checkpoints
