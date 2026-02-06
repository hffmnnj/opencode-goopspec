/**
 * Agent Model Suggestions
 * Shared between CLI and plugin - single source of truth
 *
 * @module features/setup/model-suggestions
 */

export interface AgentModelSuggestion {
  suggestions: string[];
  description: string;
}

export const AGENT_MODEL_SUGGESTIONS: Record<string, AgentModelSuggestion> = {
  "goop-debugger": {
    suggestions: [
      "openai/gpt-5.3-codex",
      "anthropic/claude-opus-4-6",
      "kimi-for-coding/k2p5",
    ],
    description: "Systematic debugging with hypothesis testing",
  },
  "goop-designer": {
    suggestions: [
      "anthropic/claude-opus-4-6",
      "kimi-for-coding/k2p5",
      "google/antigravity-gemini-3-pro-high",
    ],
    description: "Visual design planning and UI/UX reasoning",
  },
  "goop-executor": {
    suggestions: [
      "openai/gpt-5.3-codex",
      "anthropic/claude-opus-4-6",
      "anthropic/claude-sonnet-4-5",
      "kimi-for-coding/k2p5",
      "google/antigravity-gemini-3-pro-high",
      "opencode/glm-4.7-free",
    ],
    description: "Task execution with checkpoints and verification",
  },
  "goop-explorer": {
    suggestions: [
      "google/antigravity-gemini-3-flash",
      "anthropic/claude-haiku-4-5",
      "opencode/minimax-m2.1-free",
    ],
    description: "Fast codebase exploration and pattern extraction",
  },
  "goop-librarian": {
    suggestions: [
      "openai/gpt-5.2",
      "google/antigravity-gemini-3-flash",
      "anthropic/claude-sonnet-4-5",
    ],
    description: "Codebase search and documentation retrieval",
  },
  "goop-orchestrator": {
    suggestions: [
      "openai/gpt-5.3-codex",
      "anthropic/claude-opus-4-6",
      "kimi-for-coding/k2p5",
      "anthropic/claude-sonnet-4-5",
    ],
    description: "Primary orchestrator - spec clarity and wave execution",
  },
  "goop-planner": {
    suggestions: [
      "openai/gpt-5.3-codex",
      "anthropic/claude-opus-4-6",
      "kimi-for-coding/k2p5",
      "anthropic/claude-sonnet-4-5",
    ],
    description: "Detailed execution plans with architectural precision",
  },
  "goop-researcher": {
    suggestions: [
      "openai/gpt-5.2",
      "anthropic/claude-sonnet-4-5",
      "kimi-for-coding/k2p5",
      "opencode/glm-4.7-free",
    ],
    description: "Comprehensive ecosystem research",
  },
  "goop-tester": {
    suggestions: [
      "anthropic/claude-sonnet-4-5",
      "kimi-for-coding/k2p5",
      "google/antigravity-gemini-3-flash",
    ],
    description: "Web frontend testing with Playwright",
  },
  "goop-verifier": {
    suggestions: [
      "openai/gpt-5.3-codex",
      "anthropic/claude-opus-4-6",
    ],
    description: "Post-execution verification with security focus",
  },
  "goop-writer": {
    suggestions: [
      "google/antigravity-gemini-3-pro-high",
      "kimi-for-coding/k2p5",
      "anthropic/claude-sonnet-4-5",
    ],
    description: "Comprehensive documentation generation",
  },
};

export const ALL_AGENTS = Object.keys(AGENT_MODEL_SUGGESTIONS);
