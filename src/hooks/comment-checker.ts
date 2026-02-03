/**
 * Comment Checker Hook
 * Analyzes code changes to detect excessive commenting patterns
 * AI code should be indistinguishable from human code
 * 
 * @module hooks/comment-checker
 */

import { log } from "../shared/logger.js";

export interface CommentCheckerConfig {
  enabled: boolean;
  maxCommentRatio: number;  // Max ratio of comment lines to code lines (e.g., 0.3 = 30%)
  warnThreshold: number;    // Ratio at which to warn
  excludePatterns: string[];  // File patterns to exclude
}

const DEFAULT_CONFIG: CommentCheckerConfig = {
  enabled: true,
  maxCommentRatio: 0.3,
  warnThreshold: 0.2,
  excludePatterns: ["*.md", "*.json", "*.yaml", "*.yml", "*.txt"],
};

export interface CommentAnalysis {
  filePath: string;
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  commentRatio: number;
  excessiveComments: boolean;
  suggestions: string[];
}

/**
 * Analyze a code file for comment density
 */
export function analyzeComments(filePath: string, content: string): CommentAnalysis {
  const lines = content.split("\n");
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  let inBlockComment = false;
  
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const commentPatterns = getCommentPatterns(ext);
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === "") {
      blankLines++;
      continue;
    }
    
    // Check for block comment start/end
    if (commentPatterns.blockStart && trimmed.includes(commentPatterns.blockStart)) {
      inBlockComment = true;
    }
    
    if (inBlockComment) {
      commentLines++;
      if (commentPatterns.blockEnd && trimmed.includes(commentPatterns.blockEnd)) {
        inBlockComment = false;
      }
      continue;
    }
    
    // Check for line comments
    if (commentPatterns.line && trimmed.startsWith(commentPatterns.line)) {
      commentLines++;
      continue;
    }
    
    // Check for inline comments (line has both code and comment)
    if (commentPatterns.line && trimmed.includes(commentPatterns.line)) {
      // Has inline comment but also has code
      codeLines++;
      continue;
    }
    
    codeLines++;
  }
  
  const totalLines = lines.length;
  const nonBlankLines = codeLines + commentLines;
  const commentRatio = nonBlankLines > 0 ? commentLines / nonBlankLines : 0;
  
  const suggestions: string[] = [];
  
  if (commentRatio > DEFAULT_CONFIG.maxCommentRatio) {
    suggestions.push("Consider removing obvious comments that duplicate code intent");
    suggestions.push("Focus comments on 'why' rather than 'what'");
    suggestions.push("Remove auto-generated JSDoc comments if not needed");
  }
  
  return {
    filePath,
    totalLines,
    codeLines,
    commentLines,
    blankLines,
    commentRatio,
    excessiveComments: commentRatio > DEFAULT_CONFIG.maxCommentRatio,
    suggestions,
  };
}

/**
 * Get comment patterns for a file extension
 */
function getCommentPatterns(ext: string): {
  line?: string;
  blockStart?: string;
  blockEnd?: string;
} {
  const patterns: Record<string, { line?: string; blockStart?: string; blockEnd?: string }> = {
    ts: { line: "//", blockStart: "/*", blockEnd: "*/" },
    tsx: { line: "//", blockStart: "/*", blockEnd: "*/" },
    js: { line: "//", blockStart: "/*", blockEnd: "*/" },
    jsx: { line: "//", blockStart: "/*", blockEnd: "*/" },
    py: { line: "#", blockStart: '"""', blockEnd: '"""' },
    rb: { line: "#", blockStart: "=begin", blockEnd: "=end" },
    go: { line: "//", blockStart: "/*", blockEnd: "*/" },
    rs: { line: "//", blockStart: "/*", blockEnd: "*/" },
    java: { line: "//", blockStart: "/*", blockEnd: "*/" },
    c: { line: "//", blockStart: "/*", blockEnd: "*/" },
    cpp: { line: "//", blockStart: "/*", blockEnd: "*/" },
    cs: { line: "//", blockStart: "/*", blockEnd: "*/" },
    sh: { line: "#" },
    bash: { line: "#" },
    css: { blockStart: "/*", blockEnd: "*/" },
    scss: { line: "//", blockStart: "/*", blockEnd: "*/" },
    html: { blockStart: "<!--", blockEnd: "-->" },
    xml: { blockStart: "<!--", blockEnd: "-->" },
    sql: { line: "--", blockStart: "/*", blockEnd: "*/" },
  };
  
  return patterns[ext] || { line: "//" };
}

/**
 * Format analysis result for display
 */
export function formatAnalysis(analysis: CommentAnalysis): string {
  const ratioPercent = (analysis.commentRatio * 100).toFixed(1);
  const status = analysis.excessiveComments ? "⚠️ EXCESSIVE" : "✅ OK";
  
  const lines = [
    `## Comment Analysis: ${analysis.filePath}`,
    "",
    `**Status:** ${status}`,
    `**Comment Ratio:** ${ratioPercent}%`,
    `**Lines:** ${analysis.totalLines} total (${analysis.codeLines} code, ${analysis.commentLines} comments, ${analysis.blankLines} blank)`,
  ];
  
  if (analysis.suggestions.length > 0) {
    lines.push("");
    lines.push("### Suggestions");
    for (const suggestion of analysis.suggestions) {
      lines.push(`- ${suggestion}`);
    }
  }
  
  return lines.join("\n");
}

/**
 * Create the comment checker hook
 */
export function createCommentCheckerHook(config: Partial<CommentCheckerConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  return {
    name: "comment-checker",
    
    /**
     * PostToolUse hook - check after write/edit operations
     */
    async postToolUse(params: {
      toolName: string;
      args: Record<string, unknown>;
      result: unknown;
    }): Promise<{ inject?: string } | void> {
      if (!cfg.enabled) {
        return;
      }
      
      // Only check write and edit tools
      if (!["write", "edit"].includes(params.toolName)) {
        return;
      }
      
      const filePath = params.args.filePath as string || params.args.path as string;
      if (!filePath) {
        return;
      }
      
      // Check if file should be excluded
      for (const pattern of cfg.excludePatterns) {
        if (filePath.endsWith(pattern.replace("*", ""))) {
          return;
        }
      }
      
      // Get file content from result or args
      const content = params.args.content as string;
      if (!content) {
        return;
      }
      
      const analysis = analyzeComments(filePath, content);
      
      if (analysis.commentRatio > cfg.warnThreshold) {
        log("High comment density detected", {
          filePath,
          ratio: analysis.commentRatio,
        });
        
        if (analysis.excessiveComments) {
          return {
            inject: `\n\n⚠️ **Comment Check Warning**\n\nThe file \`${filePath}\` has ${(analysis.commentRatio * 100).toFixed(0)}% comments.\nAI-generated code should be clean and self-documenting.\n\nSuggestions:\n${analysis.suggestions.map(s => `- ${s}`).join("\n")}`
          };
        }
      }
    },
  };
}
