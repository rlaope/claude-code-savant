import { describe, it, expect } from "vitest";
import { formatOutput } from "../src/utils/outputFormatter.js";
import { AnalysisResult } from "../src/personas/types.js";

describe("formatOutput", () => {
  it("should format basic analysis result", () => {
    const result: AnalysisResult = {
      summary: "Test summary",
      mainContent: "Test content",
      terminology: [
        { term: "Test Term", definition: "Test definition" },
      ],
    };

    const output = formatOutput(result, "Test Persona");

    expect(output).toContain("# Code Analysis by Test Persona");
    expect(output).toContain("## Summary");
    expect(output).toContain("Test summary");
    expect(output).toContain("## Analysis");
    expect(output).toContain("Test content");
    expect(output).toContain("## Terminology");
    expect(output).toContain("| **Test Term** | Test definition |");
  });

  it("should include diagram for Shakespeare", () => {
    const result: AnalysisResult = {
      summary: "Summary",
      mainContent: "Content",
      diagram: "flowchart TD\n    A --> B",
      terminology: [],
    };

    const output = formatOutput(result, "The Bard");

    expect(output).toContain("## Flow Diagram");
    expect(output).toContain("```mermaid");
    expect(output).toContain("flowchart TD");
  });

  it("should include complexity analysis for Einstein", () => {
    const result: AnalysisResult = {
      summary: "Summary",
      mainContent: "Content",
      complexityAnalysis: "**Time Complexity**: O(n)",
      terminology: [],
    };

    const output = formatOutput(result, "The Professor");

    expect(output).toContain("## Complexity Analysis");
    expect(output).toContain("**Time Complexity**: O(n)");
  });

  it("should escape pipe characters in terminology", () => {
    const result: AnalysisResult = {
      summary: "Summary",
      mainContent: "Content",
      terminology: [
        { term: "Pipe", definition: "A | B | C" },
      ],
    };

    const output = formatOutput(result, "Test");

    expect(output).toContain("A \\| B \\| C");
  });

  it("should handle empty terminology", () => {
    const result: AnalysisResult = {
      summary: "Summary",
      mainContent: "Content",
      terminology: [],
    };

    const output = formatOutput(result, "Test");

    expect(output).toContain("## Summary");
    expect(output).toContain("## Analysis");
  });
});
