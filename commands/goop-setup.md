---
name: goop-setup
description: First-time GoopSpec setup wizard with model picker
---

# GoopSpec Setup Wizard

You are helping the user set up GoopSpec for the first time. This wizard includes an in-depth model picker for configuring each agent.

## Step 1: Detect Current Environment

First, call the `goop_setup` tool with `action: "detect"` to see what's already configured:

```
goop_setup(action: "detect")
```

Review the output and share a brief summary with the user about their current state.

## Step 2: Configuration Scope

Ask: "Where should GoopSpec be configured?"

Use the question tool to present these options:
- **both** (Recommended) - Both global and project-specific settings
- **global** - Only system-wide settings (~/.config/opencode/goopspec.json)
- **project** - Only this project (.goopspec/config.json)

## Step 3: MCP Preset

Ask: "Which MCPs should be installed?"

Use the question tool to present these options:
- **recommended** - Context7 + Exa + Playwright (full GoopSpec workflow support)
- **core** - Context7 + Exa only (minimal setup)
- **none** - Skip MCP installation

## Step 4: Default Agent

Ask: "Should GoopSpec be set as your default agent?"

Use the question tool:
- **yes** - GoopSpec orchestrator will be the default for new sessions
- **no** - Keep current default agent

## Step 5: Model Configuration

This is the key step. Ask: "Would you like to configure models for each agent?"

Use the question tool:
- **Quick setup** - Use recommended defaults for all agents
- **Custom setup** - Choose models for each agent individually

### If Quick Setup
Use the defaults from agent files (user can change later):
- goop-debugger: openai/gpt-5.2-codex
- goop-designer: anthropic/claude-opus-4-5
- goop-executor: openai/gpt-5.2-codex
- goop-explorer: google/antigravity-gemini-3-flash
- goop-librarian: openai/gpt-5.2
- goop-orchestrator: anthropic/claude-opus-4-5
- goop-planner: anthropic/claude-opus-4-5
- goop-researcher: openai/gpt-5.2
- goop-tester: opencode/kimi-k2.5-free
- goop-verifier: openai/gpt-5.2-codex
- goop-writer: google/antigravity-gemini-3-pro-high

### If Custom Setup
For EACH agent, present a model picker using the question tool. Include a "Custom model" option that allows free text entry.

#### Agent Model Options

**goop-debugger** (Systematic debugging with hypothesis testing):
1. openai/gpt-5.2-codex
2. anthropic/claude-opus-4-5
3. opencode/kimi-k2.5-free
- Custom model...

**goop-designer** (Visual design planning and UI/UX reasoning):
1. anthropic/claude-opus-4-5
2. opencode/kimi-k2.5-free
3. google/antigravity-gemini-3-pro-high
- Custom model...

**goop-executor** (Task execution with checkpoints and verification):
1. openai/gpt-5.2-codex
2. anthropic/claude-opus-4-5
3. anthropic/claude-sonnet-4-5
4. opencode/kimi-k2.5-free
5. google/antigravity-gemini-3-pro-high
6. opencode/glm-4.7-free
- Custom model...

**goop-explorer** (Fast codebase exploration and pattern extraction):
1. google/antigravity-gemini-3-flash
2. anthropic/claude-haiku-4-5
3. opencode/minimax-m2.1-free
- Custom model...

**goop-librarian** (Codebase search and documentation retrieval):
1. openai/gpt-5.2
2. google/antigravity-gemini-3-flash
3. anthropic/claude-sonnet-4-5
- Custom model...

**goop-orchestrator** (Primary orchestrator - spec clarity and wave execution):
1. anthropic/claude-opus-4-5
2. openai/gpt-5.2-codex
3. opencode/kimi-k2.5-free
4. anthropic/claude-sonnet-4-5
- Custom model...

**goop-planner** (Detailed execution plans with architectural precision):
1. anthropic/claude-opus-4-5
2. openai/gpt-5.2-codex
3. opencode/kimi-k2.5-free
4. anthropic/claude-sonnet-4-5
- Custom model...

**goop-researcher** (Comprehensive ecosystem research):
1. openai/gpt-5.2
2. anthropic/claude-sonnet-4-5
3. opencode/kimi-k2.5-free
4. opencode/glm-4.7-free
- Custom model...

**goop-tester** (Web frontend testing with Playwright):
1. opencode/kimi-k2.5-free
2. anthropic/claude-sonnet-4-5
3. google/antigravity-gemini-3-flash
- Custom model...

**goop-verifier** (Post-execution verification with security focus):
1. openai/gpt-5.2-codex
2. anthropic/claude-opus-4-5
- Custom model...

**goop-writer** (Comprehensive documentation generation):
1. google/antigravity-gemini-3-pro-high
2. opencode/kimi-k2.5-free
3. anthropic/claude-sonnet-4-5
- Custom model...

## Step 6: Preview the Plan

After collecting all answers, call `goop_setup` with `action: "plan"` and the user's choices:

```
goop_setup(
  action: "plan",
  scope: "<user_choice>",
  mcpPreset: "<user_choice>",
  enableOrchestrator: <true/false>,
  agentModels: {
    "goop-orchestrator": "<model>",
    "goop-planner": "<model>",
    "goop-executor": "<model>",
    // ... other agents
  }
)
```

Show the user a summary including:
- Configuration scope
- MCPs to install
- Agent model assignments (in a table format)

Ask for confirmation before proceeding.

## Step 7: Apply Configuration

If the user confirms, call `goop_setup` with `action: "apply"` and the same parameters.

## Step 8: Verify and Complete

After applying, summarize what was done:
- List all agents and their assigned models
- List MCPs installed
- Show any warnings or notes

Suggest next steps:
- Run `/goop-status` to verify configuration
- Start a new conversation to use GoopSpec
- Try `/goop-discuss` to start your first spec-driven project

## Tips for the Model Picker

1. **Be conversational** - Don't just list options, explain the trade-offs
2. **Group similar agents** - You can ask about related agents together (e.g., "orchestrator + planner" or "explorer + librarian")
3. **Explain costs** - Opus models are more capable but expensive; free models (opencode/*) are great for budget-conscious users
4. **Allow skipping** - If a user says "use defaults for the rest", accept that
5. **Support bulk selection** - If a user says "use Claude Sonnet for everything", honor that

## Available Models

All models listed in the suggestions:
- openai/gpt-5.2-codex
- openai/gpt-5.2
- anthropic/claude-opus-4-5
- anthropic/claude-sonnet-4-5
- anthropic/claude-haiku-4-5
- google/antigravity-gemini-3-pro-high
- google/antigravity-gemini-3-flash
- opencode/kimi-k2.5-free
- opencode/glm-4.7-free
- opencode/minimax-m2.1-free

Users can also enter any custom model name supported by their OpenCode installation.
