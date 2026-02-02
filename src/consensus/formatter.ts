import { ConsensusResult, PersonaOpinion } from "./types.js";
import { TermEntry } from "../personas/types.js";

/**
 * Format a single persona's opinion
 */
function formatOpinion(opinion: PersonaOpinion): string {
  const lines: string[] = [];

  lines.push(`### ${opinion.displayName}`);
  lines.push('');
  lines.push(`> ${opinion.summary}`);
  lines.push('');

  if (opinion.keyInsights.length > 0) {
    lines.push('**Key Insights:**');
    for (const insight of opinion.keyInsights) {
      lines.push(`- ${insight}`);
    }
    lines.push('');
  }

  lines.push(`**Recommendation:** ${opinion.recommendation}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Format terminology as Markdown table
 */
function formatTerminology(terms: TermEntry[]): string {
  if (terms.length === 0) {
    return "";
  }

  const lines: string[] = [
    "## Terminology\n",
    "| **Term** | **Definition** |",
    "|----------|----------------|",
  ];

  for (const entry of terms) {
    const escapedDef = entry.definition.replace(/\|/g, "\\|");
    lines.push(`| **${entry.term}** | ${escapedDef} |`);
  }

  return lines.join("\n") + "\n";
}

/**
 * Format consensus result as Markdown
 */
export function formatConsensusOutput(result: ConsensusResult): string {
  const sections: string[] = [];

  // Header
  sections.push('# 🎭 Team Consensus Analysis\n');
  sections.push(`**Question:** ${result.question}\n`);
  sections.push('---\n');

  // Individual Opinions
  sections.push('## Individual Perspectives\n');
  for (const opinion of result.opinions) {
    sections.push(formatOpinion(opinion));
  }

  // Synthesis
  sections.push('---\n');
  sections.push('## 🤝 Consensus Synthesis\n');

  // Agreement
  sections.push('### Points of Agreement\n');
  sections.push(`${result.synthesis.agreement}\n`);

  // Key Points
  sections.push('### Key Points from Each Perspective\n');
  for (const point of result.synthesis.keyPoints) {
    sections.push(`- ${point}`);
  }
  sections.push('');

  // Action Items
  sections.push('### Recommended Actions\n');
  for (const action of result.synthesis.actionItems) {
    sections.push(`- ${action}`);
  }
  sections.push('');

  // Dissent (if any)
  if (result.synthesis.dissent) {
    sections.push('### Note on Differing Views\n');
    sections.push(`⚠️ ${result.synthesis.dissent}\n`);
  }

  // Terminology
  if (result.terminology.length > 0) {
    sections.push('---\n');
    sections.push(formatTerminology(result.terminology));
  }

  return sections.join('\n');
}
