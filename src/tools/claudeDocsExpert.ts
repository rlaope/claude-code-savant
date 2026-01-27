import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getPersona, PersonaType } from "../personas/index.js";
import { formatOutput } from "../utils/outputFormatter.js";

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
    .describe(
      "The persona to use for analysis: 'shakespeare' for narrative/flowcharts, 'einstein' for first principles/complexity"
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

        // Get the appropriate persona
        const persona = getPersona(personaType as PersonaType);

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
