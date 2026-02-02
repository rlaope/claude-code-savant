import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getPersona, getAvailablePersonas, PersonaType } from "../personas/index.js";
import { analysisToOpinion, buildConsensusResult, formatConsensusOutput } from "../consensus/index.js";
import { TermEntry } from "../personas/types.js";

/**
 * Input schema for the consensus tool
 */
const inputSchema = z.object({
  question: z
    .string()
    .min(1)
    .describe("The question or decision to analyze (e.g., 'Is this architecture correct?', 'Should we refactor this?')"),
  code: z
    .string()
    .min(1)
    .describe("The code to analyze and discuss"),
});

/**
 * Register the consensus tool with the MCP server
 */
export function registerConsensusTool(server: McpServer): void {
  server.tool(
    "savant_consensus",
    "Initiates a team discussion where all 4 genius personas (Shakespeare, Einstein, Socrates, Steve Jobs) analyze the code simultaneously and synthesize their insights into a unified consensus. Perfect for important architectural decisions, code reviews, and when you need multiple perspectives.",
    inputSchema.shape,
    async (args) => {
      try {
        const { question, code } = args as z.infer<typeof inputSchema>;

        console.error(`[savant_consensus] Starting team consensus for: "${question.slice(0, 50)}..."`);

        // Get all personas
        const personaTypes = getAvailablePersonas();
        console.error(`[savant_consensus] Gathering opinions from ${personaTypes.length} personas...`);

        // Collect opinions from all personas
        const opinions = [];
        const allTerminology: TermEntry[][] = [];

        for (const personaType of personaTypes) {
          const persona = getPersona(personaType);
          console.error(`[savant_consensus] Analyzing with ${persona.displayName}...`);

          const result = persona.analyze(question, code);
          const opinion = analysisToOpinion(personaType, persona.displayName, result);

          opinions.push(opinion);
          allTerminology.push(result.terminology);
        }

        console.error(`[savant_consensus] Synthesizing consensus...`);

        // Build consensus result
        const consensusResult = buildConsensusResult(question, opinions, allTerminology);

        // Format output
        const output = formatConsensusOutput(consensusResult);

        console.error(`[savant_consensus] Team consensus complete`);

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
        console.error(`[savant_consensus] Error: ${errorMessage}`);

        return {
          content: [
            {
              type: "text" as const,
              text: `Error during consensus analysis: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
