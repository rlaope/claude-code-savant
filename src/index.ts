#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerClaudeDocsExpertTool } from "./tools/claudeDocsExpert.js";
import { registerConsensusTool } from "./tools/consensusTool.js";

const SERVER_NAME = "claude-code-savant";
const SERVER_VERSION = "1.0.0";

/**
 * Main entry point for the MCP server
 */
async function main(): Promise<void> {
  console.error(`[${SERVER_NAME}] Starting server v${SERVER_VERSION}...`);

  // Create MCP server instance
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register tools
  registerClaudeDocsExpertTool(server);
  console.error(`[${SERVER_NAME}] Registered tool: claude_docs_expert`);

  registerConsensusTool(server);
  console.error(`[${SERVER_NAME}] Registered tool: savant_consensus`);

  // Connect via STDIO transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`[${SERVER_NAME}] Server connected and ready`);
}

// Run the server
main().catch((error) => {
  console.error(`[${SERVER_NAME}] Fatal error:`, error);
  process.exit(1);
});
