# RESEARCH: Baseline Token Audit (Wave 1, Task 1.1)

**Date:** 2026-02-08  
**Methodology:** token estimate = `chars / 4`  
**Scope:** tools, agents, references, skills, and auto-injected prompt content used during agent launch.

## Baseline Summary

- **Total baseline chars:** `400,854`
- **Total baseline tokens (estimated):** `100,213.50`
- **Primary contributors:** reference docs + agent markdown dominate the launch overhead.

## Category Breakdown

| Category | Files/Sections | Chars | Est. Tokens | Share |
|---|---:|---:|---:|---:|
| Tool descriptions | 16 | 4,043 | 1,010.75 | 1.01% |
| Agent markdown files | 13 | 163,420 | 40,855.00 | 40.77% |
| Reference docs | 36 | 222,407 | 55,601.75 | 55.48% |
| Skill docs | 1 | 8,249 | 2,062.25 | 2.06% |
| Auto-injected boilerplate | 5 sections | 2,735 | 683.75 | 0.68% |
| **Total Baseline** | **71 measured units** | **400,854** | **100,213.50** | **100%** |

## Ranked Largest Contributors (Top 15)

| Rank | Contributor | Category | Chars | Est. Tokens |
|---:|---|---|---:|---:|
| 1 | `agents/goop-orchestrator.md` | agent-file | 22,496 | 5,624.00 |
| 2 | `agents/goop-planner.md` | agent-file | 16,165 | 4,041.25 |
| 3 | `references/plan-process.md` | reference-file | 14,772 | 3,693.00 |
| 4 | `agents/goop-researcher.md` | agent-file | 13,785 | 3,446.25 |
| 5 | `references/discuss-process.md` | reference-file | 13,020 | 3,255.00 |
| 6 | `agents/goop-writer.md` | agent-file | 12,984 | 3,246.00 |
| 7 | `agents/goop-tester.md` | agent-file | 12,892 | 3,223.00 |
| 8 | `agents/goop-executor.md` | agent-file | 12,775 | 3,193.75 |
| 9 | `agents/goop-designer.md` | agent-file | 12,684 | 3,171.00 |
| 10 | `agents/goop-verifier.md` | agent-file | 11,821 | 2,955.25 |
| 11 | `agents/goop-debugger.md` | agent-file | 10,983 | 2,745.75 |
| 12 | `agents/goop-librarian.md` | agent-file | 10,041 | 2,510.25 |
| 13 | `references/subagent-protocol.md` | reference-file | 10,035 | 2,508.75 |
| 14 | `agents/goop-explorer.md` | agent-file | 9,970 | 2,492.50 |
| 15 | `agents/memory-distiller.md` | agent-file | 9,244 | 2,311.00 |

---

## 1) Tool Description Baseline (16 tools)

Extraction rule: measure **only** the description string literal/template used by `return tool({ ... })`.

| Tool file | Description source | Chars | Est. Tokens |
|---|---|---:|---:|
| `src/tools/goop-state/index.ts` | literal | 856 | 214.00 |
| `src/tools/goop-reference/index.ts` | literal | 722 | 180.50 |
| `src/tools/goop-setup/index.ts` | literal | 386 | 96.50 |
| `src/tools/memory-save/index.ts` | literal | 355 | 88.75 |
| `src/tools/memory-search/index.ts` | literal | 331 | 82.75 |
| `src/tools/memory-decision/index.ts` | literal | 258 | 64.50 |
| `src/tools/memory-forget/index.ts` | literal | 240 | 60.00 |
| `src/tools/memory-note/index.ts` | literal | 202 | 50.50 |
| `src/tools/goop-delegate/index.ts` | literal | 139 | 34.75 |
| `src/tools/goop-skill/index.ts` | literal | 116 | 29.00 |
| `src/tools/goop-adl/index.ts` | literal | 111 | 27.75 |
| `src/tools/session-search/index.ts` | literal | 110 | 27.50 |
| `src/tools/goop-spec/index.ts` | literal | 69 | 17.25 |
| `src/tools/goop-checkpoint/index.ts` | literal | 65 | 16.25 |
| `src/tools/goop-status/index.ts` | literal | 62 | 15.50 |
| `src/tools/slashcommand/index.ts` | buildDescription template literal | 21 | 5.25 |
| **Tools Total** |  | **4,043** | **1,010.75** |

---

## 2) Agent Markdown Baseline (13 agents)

Measurement rule: full raw markdown file size per file.

| Agent file | Chars | Est. Tokens |
|---|---:|---:|
| `agents/goop-orchestrator.md` | 22,496 | 5,624.00 |
| `agents/goop-planner.md` | 16,165 | 4,041.25 |
| `agents/goop-researcher.md` | 13,785 | 3,446.25 |
| `agents/goop-writer.md` | 12,984 | 3,246.00 |
| `agents/goop-tester.md` | 12,892 | 3,223.00 |
| `agents/goop-executor.md` | 12,775 | 3,193.75 |
| `agents/goop-designer.md` | 12,684 | 3,171.00 |
| `agents/goop-verifier.md` | 11,821 | 2,955.25 |
| `agents/goop-debugger.md` | 10,983 | 2,745.75 |
| `agents/goop-librarian.md` | 10,041 | 2,510.25 |
| `agents/goop-explorer.md` | 9,970 | 2,492.50 |
| `agents/memory-distiller.md` | 9,244 | 2,311.00 |
| `agents/goop-creative.md` | 7,580 | 1,895.00 |
| **Agents Total** | **163,420** | **40,855.00** |

---

## 3) Reference Document Baseline (`references/*.md`)

Measurement rule: full raw markdown file size per file.

| Reference file | Chars | Est. Tokens |
|---|---:|---:|
| `references/plan-process.md` | 14,772 | 3,693.00 |
| `references/discuss-process.md` | 13,020 | 3,255.00 |
| `references/subagent-protocol.md` | 10,035 | 2,508.75 |
| `references/plugin-architecture.md` | 9,144 | 2,286.00 |
| `references/response-format.md` | 9,126 | 2,281.50 |
| `references/phase-gates.md` | 8,732 | 2,183.00 |
| `references/agent-patterns.md` | 8,324 | 2,081.00 |
| `references/git-workflow.md` | 7,645 | 1,911.25 |
| `references/xml-response-schema.md` | 7,256 | 1,814.00 |
| `references/context-injection.md` | 6,922 | 1,730.50 |
| `references/handoff-protocol.md` | 6,870 | 1,717.50 |
| `references/map-codebase-process.md` | 6,706 | 1,676.50 |
| `references/discovery-interview.md` | 6,635 | 1,658.75 |
| `references/accept-process.md` | 6,631 | 1,657.75 |
| `references/ui-brand.md` | 6,520 | 1,630.00 |
| `references/execute-process.md` | 6,223 | 1,555.75 |
| `references/orchestrator-philosophy.md` | 6,202 | 1,550.50 |
| `references/quick-process.md` | 6,005 | 1,501.25 |
| `references/team-coordination.md` | 5,849 | 1,462.25 |
| `references/dispatch-patterns.md` | 5,775 | 1,443.75 |
| `references/enforcement-system.md` | 5,748 | 1,437.00 |
| `references/model-profiles.md` | 5,114 | 1,278.50 |
| `references/tdd.md` | 4,913 | 1,228.25 |
| `references/security-checklist.md` | 4,573 | 1,143.25 |
| `references/status-process.md` | 4,538 | 1,134.50 |
| `references/specify-process.md` | 4,111 | 1,027.75 |
| `references/workflow-plan.md` | 3,910 | 977.50 |
| `references/interactive-questioning.md` | 3,887 | 971.75 |
| `references/workflow-specify.md` | 3,752 | 938.00 |
| `references/workflow-research.md` | 3,710 | 927.50 |
| `references/ui-interaction-patterns.md` | 3,591 | 897.75 |
| `references/visual-style.md` | 3,580 | 895.00 |
| `references/workflow-accept.md` | 3,377 | 844.25 |
| `references/boundary-system.md` | 3,275 | 818.75 |
| `references/workflow-execute.md` | 3,091 | 772.75 |
| `references/deviation-rules.md` | 2,845 | 711.25 |
| **References Total** | **222,407** | **55,601.75** |

---

## 4) Skill File Baseline (`skills/*.md`)

| Skill file | Chars | Est. Tokens |
|---|---:|---:|
| `skills/README.md` | 8,249 | 2,062.25 |
| **Skills Total** | **8,249** | **2,062.25** |

---

## 5) Auto-Injected Content Baseline

### Agent factory (`src/agents/agent-factory.ts`)

Measured sections injected into every composed agent prompt:

| Section | Chars | Est. Tokens |
|---|---:|---:|
| `#question-tool-instructions-section` | 1,393 | 348.25 |
| `#memory-instructions-section` | 773 | 193.25 |

### System transform (`src/hooks/system-transform.ts`)

Measured runtime-injected templates/blocks:

| Section | Chars | Est. Tokens |
|---|---:|---:|
| `#persistent-memory-context-block` | 298 | 74.50 |
| `#session-context-template` | 234 | 58.50 |
| `#session-context-wrapper` | 37 | 9.25 |
| **Auto-Injected Total** | **2,735** | **683.75** |

---

## Notes and Caveats

1. `references/*.md` currently contains **36** files (not 35).
2. `skills/*.md` currently contains **1** markdown file (`skills/README.md`).
3. `slashcommand` uses a dynamic getter for description; measured from the template literal inside `buildDescription()`.
4. `system-transform.ts` does not contain a literal `<goopspec_context>` block in current code; measured actual injected sections present in this file.

## Reproducibility

To reproduce this Baseline audit, rerun file-size and string-literal extraction with the same rules:

- Tool descriptions: extract only `description` literals/templates from each `src/tools/*/index.ts` tool definition.
- Agents/references/skills: raw file character count.
- Auto-injected sections: explicit injected template blocks in `src/agents/agent-factory.ts` and `src/hooks/system-transform.ts`.
