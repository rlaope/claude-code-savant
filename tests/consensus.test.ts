import { describe, it, expect } from "vitest";
import {
  analysisToOpinion,
  buildConsensusResult,
  synthesizeConsensus,
  mergeTerminology,
} from "../src/consensus/synthesizer.js";
import { formatConsensusOutput } from "../src/consensus/formatter.js";
import { AnalysisResult, TermEntry } from "../src/personas/types.js";
import { PersonaOpinion } from "../src/consensus/types.js";

describe("Consensus Synthesizer", () => {
  const mockAnalysisResult: AnalysisResult = {
    summary: "This code demonstrates important patterns for data processing.",
    mainContent: `
      The code shows a clear structure.
      - It handles errors properly
      - Performance is critical here
      - Should consider edge cases
    `,
    terminology: [
      { term: "Loop", definition: "A repeating construct" },
    ],
  };

  describe("analysisToOpinion", () => {
    it("should convert analysis result to persona opinion", () => {
      const opinion = analysisToOpinion("shakespeare", "The Bard", mockAnalysisResult);

      expect(opinion.personaName).toBe("shakespeare");
      expect(opinion.displayName).toBe("The Bard");
      expect(opinion.summary).toBe(mockAnalysisResult.summary);
      expect(opinion.keyInsights.length).toBeGreaterThan(0);
      expect(opinion.recommendation).toBeDefined();
    });

    it("should extract key insights from bullet points", () => {
      const opinion = analysisToOpinion("einstein", "The Professor", mockAnalysisResult);

      // Should have extracted insights
      expect(opinion.keyInsights.length).toBeLessThanOrEqual(3);
    });
  });

  describe("synthesizeConsensus", () => {
    const mockOpinions: PersonaOpinion[] = [
      {
        personaName: "shakespeare",
        displayName: "The Bard",
        summary: "A dramatic tale of data flow.",
        keyInsights: ["Structure is key", "Performance matters"],
        recommendation: "Refactor for clarity.",
      },
      {
        personaName: "einstein",
        displayName: "The Professor",
        summary: "First principles analysis shows O(n) complexity.",
        keyInsights: ["Complexity is manageable", "Performance is good"],
        recommendation: "Optimize the inner loop.",
      },
      {
        personaName: "socrates",
        displayName: "The Questioner",
        summary: "What happens when input is empty?",
        keyInsights: ["Edge cases need handling", "Error handling is important"],
        recommendation: "Add validation.",
      },
      {
        personaName: "stevejobs",
        displayName: "The Visionary",
        summary: "Simplify. Remove half the code.",
        keyInsights: ["Too complex", "Focus on core"],
        recommendation: "Kill features, ship faster.",
      },
    ];

    it("should synthesize consensus from multiple opinions", () => {
      const synthesis = synthesizeConsensus("Should we refactor?", mockOpinions);

      expect(synthesis.agreement).toBeDefined();
      expect(synthesis.keyPoints.length).toBe(4);
      expect(synthesis.actionItems.length).toBe(4);
    });

    it("should include key points from each persona", () => {
      const synthesis = synthesizeConsensus("Is this good?", mockOpinions);

      expect(synthesis.keyPoints[0]).toContain("The Bard");
      expect(synthesis.keyPoints[1]).toContain("The Professor");
      expect(synthesis.keyPoints[2]).toContain("The Questioner");
      expect(synthesis.keyPoints[3]).toContain("The Visionary");
    });

    it("should note dissent when recommendations differ", () => {
      const synthesis = synthesizeConsensus("What to do?", mockOpinions);

      // All 4 have different recommendations
      expect(synthesis.dissent).toBeDefined();
    });
  });

  describe("mergeTerminology", () => {
    it("should merge terminology from multiple sources", () => {
      const terms1: TermEntry[] = [
        { term: "Loop", definition: "A repeating construct" },
      ];
      const terms2: TermEntry[] = [
        { term: "Function", definition: "A callable block" },
        { term: "Loop", definition: "Different definition" }, // duplicate
      ];

      const merged = mergeTerminology([terms1, terms2]);

      expect(merged.length).toBe(2);
      // First definition should win
      const loopTerm = merged.find(t => t.term === "Loop");
      expect(loopTerm?.definition).toBe("A repeating construct");
    });

    it("should handle empty arrays", () => {
      const merged = mergeTerminology([[], []]);
      expect(merged.length).toBe(0);
    });
  });

  describe("buildConsensusResult", () => {
    const mockOpinions: PersonaOpinion[] = [
      {
        personaName: "shakespeare",
        displayName: "The Bard",
        summary: "A tale of code.",
        keyInsights: ["Insight 1"],
        recommendation: "Rec 1.",
      },
      {
        personaName: "einstein",
        displayName: "The Professor",
        summary: "Analysis complete.",
        keyInsights: ["Insight 2"],
        recommendation: "Rec 2.",
      },
    ];

    it("should build complete consensus result", () => {
      const terms: TermEntry[][] = [
        [{ term: "Test", definition: "Testing" }],
        [],
      ];

      const result = buildConsensusResult("Question?", mockOpinions, terms);

      expect(result.question).toBe("Question?");
      expect(result.opinions.length).toBe(2);
      expect(result.synthesis).toBeDefined();
      expect(result.terminology.length).toBe(1);
    });
  });
});

describe("Consensus Formatter", () => {
  it("should format consensus result as markdown", () => {
    const mockResult = {
      question: "Should we refactor this code?",
      opinions: [
        {
          personaName: "shakespeare",
          displayName: "The Bard",
          summary: "A dramatic journey.",
          keyInsights: ["Key insight 1"],
          recommendation: "Refactor with care.",
        },
        {
          personaName: "einstein",
          displayName: "The Professor",
          summary: "Logically sound.",
          keyInsights: ["Key insight 2"],
          recommendation: "Optimize complexity.",
        },
      ],
      synthesis: {
        agreement: "All agree on importance of structure.",
        keyPoints: [
          "**The Bard**: Key insight 1",
          "**The Professor**: Key insight 2",
        ],
        actionItems: [
          "[The Bard] Refactor with care.",
          "[The Professor] Optimize complexity.",
        ],
      },
      terminology: [
        { term: "Refactor", definition: "Restructure code" },
      ],
    };

    const output = formatConsensusOutput(mockResult);

    expect(output).toContain("# 🎭 Team Consensus Analysis");
    expect(output).toContain("**Question:** Should we refactor this code?");
    expect(output).toContain("## Individual Perspectives");
    expect(output).toContain("### The Bard");
    expect(output).toContain("### The Professor");
    expect(output).toContain("## 🤝 Consensus Synthesis");
    expect(output).toContain("### Points of Agreement");
    expect(output).toContain("### Key Points from Each Perspective");
    expect(output).toContain("### Recommended Actions");
    expect(output).toContain("## Terminology");
  });

  it("should include dissent section when present", () => {
    const mockResult = {
      question: "Test?",
      opinions: [],
      synthesis: {
        agreement: "Some agreement.",
        keyPoints: [],
        actionItems: [],
        dissent: "Views differ significantly.",
      },
      terminology: [],
    };

    const output = formatConsensusOutput(mockResult);

    expect(output).toContain("### Note on Differing Views");
    expect(output).toContain("Views differ significantly.");
  });
});
