import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { createGoopDelegateTool } from "./index.js";
import {
  createMockPluginContext,
  createMockToolContext,
  createMockResource,
  setupTestEnvironment,
  type PluginContext,
} from "../../test-utils.js";

function extractDelegationPayload(result: string): Record<string, unknown> {
  const match = result.match(/<goop_delegation>\n([\s\S]*?)\n<\/goop_delegation>/);
  expect(match).toBeTruthy();
  return JSON.parse(match?.[1] ?? "{}");
}

describe("goop_delegate search provider substitution", () => {
  let cleanup: () => void;
  let toolContext: ReturnType<typeof createMockToolContext>;
  let testDir: string;

  beforeEach(() => {
    const env = setupTestEnvironment("goop-delegate-test");
    testDir = env.testDir;
    cleanup = env.cleanup;
    toolContext = createMockToolContext({ directory: testDir, worktree: testDir });
  });

  afterEach(() => {
    cleanup();
  });

  function createContext(searchProvider?: "exa" | "brave"): PluginContext {
    return createMockPluginContext({
      testDir,
      config: {
        mcp: searchProvider ? { searchProvider } : undefined,
      },
      resources: [
        createMockResource({
          name: "goop-researcher",
          type: "agent",
          frontmatter: {
            name: "goop-researcher",
            description: "Research specialist",
            model: "anthropic/claude-sonnet-4-5",
            tools: ["read", "web_search_exa", "company_research_exa", "get_code_context_exa"],
            skills: [],
            references: [],
          },
          body: [
            "Use web_search_exa for discovery.",
            "Use company_research_exa for company research.",
            "Use get_code_context_exa for code examples.",
            "Prioritize Exa for broad web scans.",
          ].join("\n"),
        }),
      ],
    });
  }

  it("keeps Exa defaults when provider is unset", async () => {
    const ctx = createContext(undefined);
    const tool = createGoopDelegateTool(ctx);

    const result = await tool.execute(
      {
        agent: "goop-researcher",
        prompt: "Investigate test topic",
      },
      toolContext
    );

    const payload = extractDelegationPayload(result);
    const composedPrompt = String(payload.composedPrompt ?? "");
    const agentPromptSection = composedPrompt.split("## Planning Files")[0] ?? "";

    expect(agentPromptSection).toContain("web_search_exa");
    expect(agentPromptSection).toContain("company_research_exa");
    expect(agentPromptSection).toContain("get_code_context_exa");
    expect(agentPromptSection).toContain("Exa");
    expect(agentPromptSection).not.toContain("brave_web_search");
    expect(agentPromptSection).not.toContain("Brave Search");
  });

  it("substitutes Exa search references for Brave", async () => {
    const ctx = createContext("brave");
    const tool = createGoopDelegateTool(ctx);

    const result = await tool.execute(
      {
        agent: "goop-researcher",
        prompt: "Investigate test topic",
      },
      toolContext
    );

    const payload = extractDelegationPayload(result);
    const composedPrompt = String(payload.composedPrompt ?? "");
    const agentPromptSection = composedPrompt.split("## Planning Files")[0] ?? "";

    expect(agentPromptSection).toContain("brave_web_search");
    expect(agentPromptSection).toContain("Brave Search");
    expect(agentPromptSection).not.toContain("web_search_exa");
    expect(agentPromptSection).not.toContain("company_research_exa");
    expect(agentPromptSection).not.toContain("get_code_context_exa");
    expect(agentPromptSection).not.toContain(" Exa ");
  });
});
