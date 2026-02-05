export type {
  AgentRegistration,
  AgentRegistry,
  RegistryOperationResult,
} from "./types.js";

export {
  deregisterAgent,
  getActiveAgents,
  getAgentsByType,
  getRegistry,
  isFileClaimed,
  registerAgent,
} from "./registry.js";

export {
  DEFAULT_SHORT_ID_LENGTH,
  extractAgentId,
  findAgentFiles,
  generateAgentFilePath,
  getCanonicalPath,
} from "./file-patterns.js";

export type { MergeOptions, MergeResult } from "./merge.js";
export { mergeAgentOutputs } from "./merge.js";
