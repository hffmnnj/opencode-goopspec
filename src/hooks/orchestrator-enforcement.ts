/**
 * Orchestrator Enforcement Hooks
 * Enforces GoopSpec workflow rules for the orchestrator agent
 * 
 * Enforcement Mechanisms:
 * - permission.ask: Deny file modifications for orchestrator on code files
 * - tool.execute.after: Inject delegation instructions after goop_delegate
 * 
 * @module hooks/orchestrator-enforcement
 */

import type { PluginContext } from "../core/types.js";
import { log } from "../shared/logger.js";

// ============================================================================
// Types
// ============================================================================

interface PermissionInput {
  tool: string;
  sessionID: string;
  path?: string;
  paths?: string[];
  agent?: string;
}

interface PermissionOutput {
  status: "ask" | "deny" | "allow";
}

interface ToolExecuteAfterInput {
  tool: string;
  sessionID: string;
  callID: string;
}

interface ToolExecuteAfterOutput {
  title: string;
  output: string;
  metadata: unknown;
}

interface EnforcementConfig {
  /** Enable code blocking for orchestrator */
  codeBlockingEnabled: boolean;
  /** Enable delegation enforcement */
  delegationEnforcementEnabled: boolean;
  /** Enable research tool blocking */
  researchBlockingEnabled: boolean;
  /** Enable exploration nudges (non-blocking) */
  explorationNudgesEnabled: boolean;
  /** Paths that orchestrator CAN edit (e.g., planning files) */
  allowedPaths: string[];
  /** File extensions that are considered "code" */
  codeExtensions: string[];
  /** Implementation directories to protect */
  protectedDirs: string[];
}

interface DelegationState {
  pending: boolean;
  agent: string;
  prompt: string;
  callId: string;
  timestamp: number;
}

export type BlockedToolCategory = "research" | "exploration";

export interface DelegationMapping {
  category: BlockedToolCategory;
  agent: string;
  guidance: string;
}

// Track blocked operations to inject guidance
interface BlockedOperation {
  tool: string;
  filePath: string;
  timestamp: number;
  sessionID: string;
}

interface BlockedResearchOperation {
  tool: string;
  category: BlockedToolCategory;
  timestamp: number;
  sessionID: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: EnforcementConfig = {
  codeBlockingEnabled: true,
  delegationEnforcementEnabled: true,
  researchBlockingEnabled: true,
  explorationNudgesEnabled: true,
  allowedPaths: [
    ".goopspec/",
    ".goopspec\\",
    "goopspec/",
    "SPEC.md",
    "BLUEPRINT.md",
    "CHRONICLE.md",
    "RESEARCH.md",
    "ADL.md",
    "README.md",
    "AGENTS.md",
    ".md",  // Allow all markdown
    ".json",  // Allow config files
    ".yaml",
    ".yml",
  ],
  codeExtensions: [
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".py", ".pyw",
    ".go",
    ".rs",
    ".java", ".kt", ".scala",
    ".c", ".cpp", ".cc", ".h", ".hpp",
    ".cs",
    ".rb",
    ".php",
    ".swift",
    ".vue", ".svelte",
  ],
  protectedDirs: [
    "src/", "src\\",
    "lib/", "lib\\",
    "app/", "app\\",
    "apps/", "apps\\",
    "packages/", "packages\\",
    "server/", "server\\",
    "client/", "client\\",
  ],
};

// Tools that require file permission
const FILE_TOOLS = ["edit", "mcp_edit", "write", "mcp_write"];

export const RESEARCH_TOOLS = [
  "exa_web_search_exa",
  "exa_company_research_exa",
  "exa_get_code_context_exa",
  "mcp_google_search",
  "google_search",
  "context7_resolve-library-id",
  "context7_query-docs",
  "mcp_context7_resolve-library-id",
  "mcp_context7_query-docs",
  "webfetch",
  "mcp_webfetch",
] as const;

export type ResearchTool = (typeof RESEARCH_TOOLS)[number];

export const EXPLORATION_TOOLS = [
  "mcp_grep",
  "mcp_glob",
  "grep",
  "glob",
] as const;

export type ExplorationTool = (typeof EXPLORATION_TOOLS)[number];

export const DELEGATION_MAPPINGS: Record<BlockedToolCategory, DelegationMapping> = {
  research: {
    category: "research",
    agent: "goop-researcher",
    guidance: "Research tasks should be delegated to goop-researcher",
  },
  exploration: {
    category: "exploration",
    agent: "goop-explorer",
    guidance: "Codebase exploration should be delegated to goop-explorer",
  },
};

// Track pending delegations per session
const pendingDelegations = new Map<string, DelegationState>();

// Track blocked operations per session (for injection)
const blockedOperations = new Map<string, BlockedOperation>();

// Track blocked research operations per session (for guidance injection)
const blockedResearchOperations = new Map<string, BlockedResearchOperation>();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a file path is allowed for orchestrator to edit
 */
function isAllowedPath(filePath: string, config: EnforcementConfig): boolean {
  if (!filePath) return true;
  
  const normalizedPath = filePath.replace(/\\/g, "/").toLowerCase();
  
  // Check if path contains any allowed patterns
  for (const allowed of config.allowedPaths) {
    const normalizedAllowed = allowed.replace(/\\/g, "/").toLowerCase();
    if (normalizedPath.includes(normalizedAllowed)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a file is a code file based on extension
 */
function isCodeFile(filePath: string, config: EnforcementConfig): boolean {
  if (!filePath) return false;
  
  const lowerPath = filePath.toLowerCase();
  return config.codeExtensions.some(ext => lowerPath.endsWith(ext));
}

/**
 * Check if file is in a protected implementation directory
 */
function isInProtectedDir(filePath: string, config: EnforcementConfig): boolean {
  if (!filePath) return false;
  
  const normalizedPath = filePath.replace(/\\/g, "/").toLowerCase();
  return config.protectedDirs.some(dir => {
    const normalizedDir = dir.replace(/\\/g, "/").toLowerCase();
    return normalizedPath.includes(normalizedDir);
  });
}

/**
 * Check if current agent is the GoopSpec orchestrator
 * Exported for use in other hooks and tests
 */
export function isOrchestrator(agentName: string | undefined): boolean {
  if (!agentName) return false;
  
  const lower = agentName.toLowerCase();
  return lower === "goopspec" || 
         lower.includes("orchestrator") ||
         lower === "goop-orchestrator";
}

/**
 * Check if a tool is a blocked research/search tool
 */
export function isBlockedTool(toolName: string): boolean {
  return (RESEARCH_TOOLS as readonly string[]).includes(toolName);
}

/**
 * Get the category of a blocked tool
 */
export function getToolCategory(toolName: string): BlockedToolCategory | null {
  if ((RESEARCH_TOOLS as readonly string[]).includes(toolName)) {
    return "research";
  }
  if ((EXPLORATION_TOOLS as readonly string[]).includes(toolName)) {
    return "exploration";
  }
  return null;
}

/**
 * Generate instructive message for blocked code operations
 */
function generateDelegationGuidance(toolName: string, filePath: string): string {
  return `

---

## 🎭 Orchestrator Reminder: Delegate Code Changes

You attempted to use \`${toolName}\` on \`${filePath}\`.

As the orchestrator, delegate implementation work to **goop-executor**:

\`\`\`
task({
  subagent_type: "goop-executor",
  description: "Implement changes to ${filePath.split("/").pop()}",
  prompt: \`
    Modify file: ${filePath}
    
    Requirements:
    - [Describe the specific changes needed]
    
    Return structured response when complete.
  \`
})
\`\`\`

**Why?** Your context is precious. Subagents have fresh 200k context for implementation.
`;
}

/**
 * Generate guidance for blocked research tool operations
 */
function generateResearchDelegationGuidance(
  toolName: string,
  category: BlockedToolCategory
): string {
  const mapping = DELEGATION_MAPPINGS[category];
  const categoryLabel = category === "research" ? "Research" : "Exploration";
  const description = category === "research" ? "Research task" : "Explore codebase";
  const promptBody = category === "research"
    ? "Research: [Describe what you need to research]\n    \n    Return findings with sources and recommendations."
    : "Explore: [Describe what you're looking for]\n    \n    Return relevant file paths and code locations.";

  return `

---

## 🎭 Orchestrator Reminder: Delegate ${categoryLabel} Tasks

You attempted to use \`${toolName}\` directly.

As the orchestrator, delegate ${category} work to **${mapping.agent}**:

\`\`\`
task({
  subagent_type: "${mapping.agent}",
  description: "${description}",
  prompt: \`
    ${promptBody}
  \`
})
\`\`\`

**Why?** ${mapping.guidance}. Subagents have specialized tools and fresh context.
`;
}

/**
 * Generate guidance for exploration tool delegation (future use)
 */
export function generateExplorationDelegationGuidance(toolName: string): string {
  const mapping = DELEGATION_MAPPINGS.exploration;

  return `

---

## 💡 Suggestion: Consider Delegating Exploration

You're using \`${toolName}\` for exploration.

For extensive codebase exploration, consider delegating to **${mapping.agent}**:

\`\`\`
task({
  subagent_type: "${mapping.agent}",
  description: "Explore codebase",
  prompt: \`
    Find: [What you're looking for]
    
    Return relevant file paths and code locations.
  \`
})
\`\`\`

This is a suggestion, not a block. Continue if this is a quick lookup.
`;
}

/**
 * Parse delegation info from goop_delegate output
 */
function parseDelegationOutput(output: string): DelegationState | null {
  try {
    // Look for <goop_delegation> block
    const match = output.match(/<goop_delegation>\s*([\s\S]*?)\s*<\/goop_delegation>/);
    if (!match) return null;
    
    const json = JSON.parse(match[1]);
    if (json.action !== "delegate_via_task") return null;
    
    return {
      pending: true,
      agent: json.agent || "unknown",
      prompt: json.composedPrompt || "",
      callId: "",
      timestamp: Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Generate mandatory task invocation instruction
 */
function generateTaskInvocation(delegation: DelegationState): string {
  // Truncate prompt to avoid massive output
  const promptPreview = delegation.prompt.slice(0, 500).replace(/`/g, "'");
    
  return `

---

## 🚀 ACTION REQUIRED: Execute Delegation

You called \`goop_delegate\` to delegate to **${delegation.agent}**.

**Now invoke the task tool:**

\`\`\`
task({
  subagent_type: "${delegation.agent}",
  description: "Delegated task",
  prompt: "[Full prompt from composedPrompt above]"
})
\`\`\`

Preview of prompt:
> ${promptPreview}...

**Do not skip this step.** The delegation is not complete until you invoke \`task\`.
`;
}

// ============================================================================
// Hook Factory
// ============================================================================

/**
 * Create orchestrator enforcement hooks
 * 
 * Returns hooks for:
 * - permission.ask: Deny code file permissions for orchestrator
 * - tool.execute.after: Inject delegation instructions
 */
export function createOrchestratorEnforcementHooks(ctx: PluginContext) {
  const config: EnforcementConfig = {
    ...DEFAULT_CONFIG,
    // Could override from ctx.config if we add enforcement config
  };

  return {
    /**
     * permission.ask - Deny file modifications on code files for orchestrator
     * 
     * This hook can modify output.status to "deny" to block operations
     */
    "permission.ask": async (
      input: PermissionInput,
      output: PermissionOutput
    ): Promise<void> => {
      // Only enforce for orchestrator agent
      if (!isOrchestrator(input.agent)) {
        return;
      }

      // === RESEARCH TOOL BLOCKING ===
      if (config.researchBlockingEnabled && isBlockedTool(input.tool)) {
        const category = getToolCategory(input.tool);
        if (!category) {
          return;
        }
        
        log("Blocking research tool for orchestrator", {
          tool: input.tool,
          category,
          sessionID: input.sessionID,
          agent: input.agent,
        });
        
        // Store blocked operation for later guidance injection
        blockedResearchOperations.set(input.sessionID, {
          tool: input.tool,
          category,
          timestamp: Date.now(),
          sessionID: input.sessionID,
        });
        
        // Log to ADL
        ctx.stateManager.appendADL({
          timestamp: new Date().toISOString(),
          type: "deviation",
          description: "Orchestrator research tool blocked",
          action: `Denied ${input.tool}. Should delegate to ${DELEGATION_MAPPINGS[category].agent}.`,
          rule: 4,
          files: [],
        });
        
        // DENY the permission
        output.status = "deny";
        return;
      }

      // === EXISTING CODE FILE BLOCKING ===
      // Only check file modification tools
      if (!config.codeBlockingEnabled || !FILE_TOOLS.includes(input.tool)) {
        return;
      }
      
      // Get file path from input
      const filePath = input.path || input.paths?.[0];
      if (!filePath) {
        return;
      }
      
      // Check if this is a protected code file
      if (isCodeFile(filePath, config) && 
          !isAllowedPath(filePath, config) && 
          isInProtectedDir(filePath, config)) {
        
        log("Blocking code modification for orchestrator", {
          tool: input.tool,
          filePath,
          sessionID: input.sessionID,
          agent: input.agent,
        });
        
        // Store blocked operation for later injection
        blockedOperations.set(input.sessionID, {
          tool: input.tool,
          filePath,
          timestamp: Date.now(),
          sessionID: input.sessionID,
        });
        
        // Log to ADL
        ctx.stateManager.appendADL({
          timestamp: new Date().toISOString(),
          type: "deviation",
          description: "Orchestrator code modification blocked",
          action: `Denied ${input.tool} on ${filePath}. Should delegate to goop-executor.`,
          rule: 4,
          files: [filePath],
        });
        
        // DENY the permission
        output.status = "deny";
      }
    },

    /**
     * tool.execute.after - Inject delegation guidance and task instructions
     */
    "tool.execute.after": async (
      input: ToolExecuteAfterInput,
      output: ToolExecuteAfterOutput
    ): Promise<void> => {
      // === Check for blocked operation and inject guidance ===
      const blocked = blockedOperations.get(input.sessionID);
      if (blocked && Date.now() - blocked.timestamp < 5000) {
        // Recent block - inject delegation guidance
        blockedOperations.delete(input.sessionID);
        
        // Append guidance to output
        output.output = (output.output || "") + generateDelegationGuidance(blocked.tool, blocked.filePath);
        
        log("Injected delegation guidance after blocked operation", {
          tool: blocked.tool,
          sessionID: input.sessionID,
        });
      }

      // === Check for blocked RESEARCH operation and inject guidance ===
      const blockedResearch = blockedResearchOperations.get(input.sessionID);
      if (blockedResearch && Date.now() - blockedResearch.timestamp < 5000) {
        blockedResearchOperations.delete(input.sessionID);

        output.output = (output.output || "") + generateResearchDelegationGuidance(
          blockedResearch.tool,
          blockedResearch.category
        );

        log("Injected research delegation guidance after blocked operation", {
          tool: blockedResearch.tool,
          category: blockedResearch.category,
          sessionID: input.sessionID,
        });
      }
      
      // === DELEGATION ENFORCER ===
      if (config.delegationEnforcementEnabled && input.tool === "goop_delegate") {
        const delegation = parseDelegationOutput(output.output);
        
        if (delegation) {
          delegation.callId = input.callID;
          pendingDelegations.set(input.sessionID, delegation);
          
          log("Delegation detected, injecting task invocation reminder", {
            agent: delegation.agent,
            sessionID: input.sessionID,
          });
          
          // Append task invocation instruction to output
          output.output = output.output + generateTaskInvocation(delegation);
        }
      }
      
      // Clear pending delegation if task was called
      if (input.tool === "task" || input.tool === "mcp_task") {
        if (pendingDelegations.has(input.sessionID)) {
          log("Delegation completed via task tool", {
            sessionID: input.sessionID,
          });
          pendingDelegations.delete(input.sessionID);
        }
      }
    },
  };
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Check if there's a pending delegation that wasn't followed through
 */
export function hasPendingDelegation(sessionId: string): boolean {
  const pending = pendingDelegations.get(sessionId);
  if (!pending) return false;
  
  // Consider stale after 5 minutes
  const staleMs = 5 * 60 * 1000;
  if (Date.now() - pending.timestamp > staleMs) {
    pendingDelegations.delete(sessionId);
    return false;
  }
  
  return pending.pending;
}

/**
 * Get pending delegation details
 */
export function getPendingDelegation(sessionId: string): DelegationState | undefined {
  return pendingDelegations.get(sessionId);
}

/**
 * Clear pending delegation (for testing or manual cleanup)
 */
export function clearPendingDelegation(sessionId: string): void {
  pendingDelegations.delete(sessionId);
}

/**
 * Check if code blocking would apply to a path
 * Exported for testing
 */
export function wouldBlockPath(filePath: string): boolean {
  const config = DEFAULT_CONFIG;
  return isCodeFile(filePath, config) && 
         !isAllowedPath(filePath, config) && 
         isInProtectedDir(filePath, config);
}
