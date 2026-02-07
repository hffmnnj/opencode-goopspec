import type { McpConfig } from "../../core/types.js";

export const MCP_CATEGORIES = {
  search: "Search providers used for web and code lookup.",
  documentation: "Documentation and API reference retrieval tools.",
  memory: "Memory provider selections surfaced in MCP UI.",
  automation: "Browser automation and end-to-end interaction tools.",
  data: "Data access and repository integration tools.",
} as const;

export type McpCategory = keyof typeof MCP_CATEGORIES;

export type McpExclusionGroup = "search-provider" | "memory-provider";

export type McpConfigKey = keyof McpConfig | "searchProvider" | "memoryProvider";

export type McpServerInfo = {
  name: string;
  displayName: string;
  description: string;
  category: McpCategory;
  configKey: McpConfigKey;
  exclusionGroup?: McpExclusionGroup;
  note?: string;
};

export const MCP_SERVER_REGISTRY: readonly McpServerInfo[] = [
  {
    name: "brave",
    displayName: "Brave Search",
    description: "Search provider option used instead of Exa.",
    category: "search",
    configKey: "searchProvider",
    exclusionGroup: "search-provider",
    note: "Special-cased: active when searchProvider is 'brave' and mcp.exa is false.",
  },
  {
    name: "exa",
    displayName: "Exa",
    description: "Semantic web and code search provider.",
    category: "search",
    configKey: "exa",
    exclusionGroup: "search-provider",
    note: "Provider switching should also keep searchProvider aligned to 'exa'.",
  },
  {
    name: "context7",
    displayName: "Context7",
    description: "Library documentation resolver and query tools.",
    category: "documentation",
    configKey: "context7",
  },
  {
    name: "memory-local",
    displayName: "Memory (Local)",
    description: "Local embedding provider for memory retrieval.",
    category: "memory",
    configKey: "memoryProvider",
    exclusionGroup: "memory-provider",
    note: "Provider selection only; not a standalone MCP server toggle.",
  },
  {
    name: "memory-openai",
    displayName: "Memory (OpenAI)",
    description: "OpenAI embedding provider for memory retrieval.",
    category: "memory",
    configKey: "memoryProvider",
    exclusionGroup: "memory-provider",
    note: "Provider selection only; not a standalone MCP server toggle.",
  },
  {
    name: "memory-ollama",
    displayName: "Memory (Ollama)",
    description: "Ollama embedding provider for memory retrieval.",
    category: "memory",
    configKey: "memoryProvider",
    exclusionGroup: "memory-provider",
    note: "Provider selection only; not a standalone MCP server toggle.",
  },
  {
    name: "playwright",
    displayName: "Playwright",
    description: "Browser automation and interaction tooling.",
    category: "automation",
    configKey: "playwright",
  },
  {
    name: "github",
    displayName: "GitHub",
    description: "Repository APIs for issues, pull requests, and metadata.",
    category: "data",
    configKey: "github",
  },
  {
    name: "sqlite",
    displayName: "SQLite",
    description: "Local SQLite data access utilities.",
    category: "data",
    configKey: "sqlite",
  },
  {
    name: "memory",
    displayName: "Memory MCP",
    description: "Persistent memory storage and retrieval tools.",
    category: "memory",
    configKey: "memory",
    note: "This toggle controls MCP memory server availability.",
  },
] as const;

export async function runMcp(): Promise<void> {
  return;
}
