import { Persona, AnalysisResult, TermEntry } from "./types.js";

/**
 * Steve Jobs persona - provides visionary direction and bold ideas
 */
export class SteveJobsPersona implements Persona {
  name = "stevejobs";
  displayName = "The Visionary";

  analyze(instruction: string, code: string): AnalysisResult {
    const lines = code.split("\n").filter((line) => line.trim());
    const hasComplexity = lines.length > 50;
    const hasTooManyFeatures = this.detectFeatureOverload(code);
    const hasBoilerplate = this.detectBoilerplate(code);
    const hasPoorNaming = this.detectPoorNaming(code);

    const summary = this.generateSummary(instruction, {
      lineCount: lines.length,
      hasComplexity,
      hasTooManyFeatures,
    });

    const mainContent = this.generateAnalysis(instruction, code, {
      hasComplexity,
      hasTooManyFeatures,
      hasBoilerplate,
      hasPoorNaming,
      lineCount: lines.length,
    });

    const terminology = this.generateTerminology();

    return {
      summary,
      mainContent,
      terminology,
    };
  }

  private detectFeatureOverload(code: string): boolean {
    const functionCount = (code.match(/function|=>\s*{|def |fn |func /g) || []).length;
    return functionCount > 10;
  }

  private detectBoilerplate(code: string): boolean {
    const boilerplatePatterns = [
      /\/\/ TODO/gi,
      /\/\/ FIXME/gi,
      /console\.log/g,
      /print\(/g,
    ];
    return boilerplatePatterns.some((pattern) => pattern.test(code));
  }

  private detectPoorNaming(code: string): boolean {
    const poorNames = /\b(temp|tmp|data|info|item|thing|stuff|foo|bar|baz|x|y|z)\b/gi;
    const matches = code.match(poorNames) || [];
    return matches.length > 3;
  }

  private generateSummary(
    instruction: string,
    features: {
      lineCount: number;
      hasComplexity: boolean;
      hasTooManyFeatures: boolean;
    }
  ): string {
    if (features.hasTooManyFeatures) {
      return `Here's the thing about this code: it's trying to do too much. "${instruction}" should be simple. Let's talk about what really matters.`;
    }
    if (features.hasComplexity) {
      return `${features.lineCount} lines for "${instruction}"? That's not engineering, that's archaeology. Let's find the essence.`;
    }
    return `Looking at "${instruction}" - there's potential here, but potential isn't a product. Let me show you how to make this insanely great.`;
  }

  private generateAnalysis(
    instruction: string,
    code: string,
    features: {
      hasComplexity: boolean;
      hasTooManyFeatures: boolean;
      hasBoilerplate: boolean;
      hasPoorNaming: boolean;
      lineCount: number;
    }
  ): string {
    const sections: string[] = [];

    sections.push(
      `## Let's Be Honest\n\nThis code does what it says. But doing what you say isn't the same as being great. Here's what I see:`
    );

    if (features.hasComplexity) {
      sections.push(
        `**The Complexity Problem**\n\nSimplicity is the ultimate sophistication. This code has ${features.lineCount} lines when it could probably have 30. Every line you don't write is a line that can't have bugs, can't confuse the next developer, can't slow down your build.\n\nAsk yourself: what can be removed?`
      );
    }

    if (features.hasTooManyFeatures) {
      sections.push(
        `**Feature Overload**\n\nYou're trying to be everything to everyone. That's a recipe for being nothing special to anyone. Pick the ONE thing this code should do brilliantly, and cut everything else.\n\nFocus is about saying no.`
      );
    }

    if (features.hasBoilerplate) {
      sections.push(
        `**The Noise**\n\nI see debug statements, TODOs, temporary fixes. These are symptoms of uncertainty. Ship or don't ship. There's no "almost ready." Clean this up - every line should earn its place.`
      );
    }

    if (features.hasPoorNaming) {
      sections.push(
        `**Names Matter**\n\nI see generic names like 'data', 'temp', 'item'. Names are the user interface for developers. If you can't name it clearly, you don't understand it clearly. Great code reads like well-written prose.`
      );
    }

    sections.push(
      `## The Vision\n\nHere's what this code could be:\n\n1. **One Purpose**: This should do one thing so well that users can't imagine doing it any other way\n2. **Obvious**: The next developer should understand it in 30 seconds\n3. **Delightful**: Even the implementation should feel elegant\n\nDon't ship a product. Ship a statement.`
    );

    sections.push(
      `## The One Thing\n\nIf you could only keep one function, one feature, one idea from this code - what would it be? That's your answer. Build that. Make it perfect. Then, maybe, add one more thing.\n\nOne more thing at a time.`
    );

    return sections.join("\n\n");
  }

  private generateTerminology(): TermEntry[] {
    return [
      {
        term: "Simplicity",
        definition: "The ultimate sophistication - removing everything that isn't essential",
      },
      {
        term: "Focus",
        definition: "Saying no to a hundred good ideas to say yes to the great one",
      },
      {
        term: "User Experience",
        definition: "The feeling someone has when using your product - it should be magical",
      },
      {
        term: "Ship",
        definition: "Real artists ship. Perfect is the enemy of done.",
      },
      {
        term: "Intersection",
        definition: "Where technology meets liberal arts - where great products are born",
      },
    ];
  }
}
