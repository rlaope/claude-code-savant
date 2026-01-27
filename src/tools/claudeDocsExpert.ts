import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getPersona, PersonaType } from "../personas/index.js";
import { formatOutput } from "../utils/outputFormatter.js";
import { analyzePromptForPersona } from "../utils/promptAnalyzer.js";

/**
 * Input schema for the claude_docs_expert tool
 */
const inputSchema = z.object({
  instruction: z
    .string()
    .min(1)
    .describe("The instruction or question about the code"),
  code: z.string().min(1).describe("The code to analyze"),
  persona: z
    .enum(["shakespeare", "einstein"])
    .optional()
    .describe(
      "The persona to use for analysis. If omitted, automatically selected based on instruction: 'shakespeare' for narrative/flowcharts, 'einstein' for performance/complexity"
    ),
});

/**
 * Register the claude_docs_expert tool with the MCP server
 */
export function registerClaudeDocsExpertTool(server: McpServer): void {
  server.tool(
    "claude_docs_expert",
    "Analyzes code and provides expert explanations through distinctive personas. Shakespeare offers dramatic narrative with flowcharts, while Einstein provides first principles analysis with complexity metrics.",
    inputSchema.shape,
    async (args) => {
      try {
        const { instruction, code, persona: personaType } = args as z.infer<
          typeof inputSchema
        >;

        // Auto-select persona if not provided
        const selectedPersonaType: PersonaType =
          personaType ?? analyzePromptForPersona(instruction);

        console.error(
          `[claude_docs_expert] Using persona: ${selectedPersonaType}${!personaType ? " (auto-selected)" : ""}`
        );

        // Get the appropriate persona
        const persona = getPersona(selectedPersonaType);

        // Analyze the code
        const result = persona.analyze(instruction, code);

        // Format the output
        const output = formatOutput(result, persona.displayName);

        return {
          content: [
            {
              type: "text" as const,
              text: output,
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error(`[claude_docs_expert] Error: ${errorMessage}`);

        return {
          content: [
            {
              type: "text" as const,
              text: `Error analyzing code: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
