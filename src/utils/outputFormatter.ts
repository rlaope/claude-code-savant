import { AnalysisResult, TermEntry } from "../personas/types.js";

/**
 * Format analysis result as Markdown output
 */
export function formatOutput(
  result: AnalysisResult,
  displayName: string
): string {
  const sections: string[] = [];

  // Header
  sections.push(`# Code Analysis by ${displayName}\n`);

  // Summary
  sections.push(`## Summary\n\n${result.summary}\n`);

  // Main Analysis
  sections.push(`## Analysis\n\n${result.mainContent}\n`);

  // Flow Diagram (Shakespeare) or Complexity Analysis (Einstein)
  if (result.diagram) {
    sections.push(`## Flow Diagram\n\n\`\`\`mermaid\n${result.diagram}\n\`\`\`\n`);
  }

  if (result.complexityAnalysis) {
    sections.push(`## Complexity Analysis\n\n${result.complexityAnalysis}\n`);
  }

  // Terminology
  sections.push(formatTerminology(result.terminology));

  return sections.join("\n");
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
    // Escape pipe characters in definitions
    const escapedDef = entry.definition.replace(/\|/g, "\\|");
    lines.push(`| **${entry.term}** | ${escapedDef} |`);
  }

  return lines.join("\n") + "\n";
}
