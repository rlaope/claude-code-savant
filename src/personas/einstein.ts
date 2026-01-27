import { Persona, AnalysisResult, TermEntry } from "./types.js";

/**
 * Einstein persona - analyzes code from first principles with complexity analysis
 */
export class EinsteinPersona implements Persona {
  name = "einstein";
  displayName = "The Professor";

  analyze(instruction: string, code: string): AnalysisResult {
    const lines = code.split("\n").filter((line) => line.trim());
    const hasLoop = /for|while|do\s*\{/.test(code);
    const hasNestedLoop =
      /(for|while)[\s\S]*?(for|while)/.test(code) ||
      code.split(/for|while/).length > 2;
    const hasCondition = /if|else|switch|case/.test(code);
    const hasFunction =
      /function|=>|def |fn |func |public |private |protected /.test(code);
    const hasRecursion = this.detectRecursion(code);
    const hasDataStructure =
      /Array|Map|Set|Object|List|Dict|Hash|Tree|Graph|Queue|Stack/.test(code);
    const hasAsync = /async|await|Promise|Future/.test(code);

    const summary = this.generateSummary(instruction, {
      hasLoop,
      hasNestedLoop,
      hasCondition,
      hasFunction,
      hasRecursion,
      hasDataStructure,
      lineCount: lines.length,
    });

    const mainContent = this.generateAnalysis(instruction, code, {
      hasLoop,
      hasNestedLoop,
      hasCondition,
      hasFunction,
      hasRecursion,
      hasDataStructure,
      hasAsync,
    });

    const complexityAnalysis = this.generateComplexityAnalysis({
      hasLoop,
      hasNestedLoop,
      hasRecursion,
      hasDataStructure,
      lineCount: lines.length,
    });

    const terminology = this.generateTerminology({
      hasLoop,
      hasNestedLoop,
      hasCondition,
      hasRecursion,
      hasDataStructure,
      hasAsync,
    });

    return {
      summary,
      mainContent,
      complexityAnalysis,
      terminology,
    };
  }

  private detectRecursion(code: string): boolean {
    const functionMatch = code.match(
      /function\s+(\w+)|(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*:\s*\([^)]*\)\s*=>/
    );
    if (functionMatch) {
      const funcName = functionMatch[1] || functionMatch[2] || functionMatch[3];
      if (funcName && code.includes(funcName + "(")) {
        const regex = new RegExp(`${funcName}\\s*\\(`, "g");
        const matches = code.match(regex);
        return matches !== null && matches.length > 1;
      }
    }
    return false;
  }

  private generateSummary(
    instruction: string,
    features: {
      hasLoop: boolean;
      hasNestedLoop: boolean;
      hasCondition: boolean;
      hasFunction: boolean;
      hasRecursion: boolean;
      hasDataStructure: boolean;
      lineCount: number;
    }
  ): string {
    const patterns: string[] = [];

    if (features.hasRecursion) patterns.push("recursive decomposition");
    if (features.hasNestedLoop) patterns.push("nested iteration");
    else if (features.hasLoop) patterns.push("linear iteration");
    if (features.hasDataStructure) patterns.push("data structure manipulation");
    if (features.hasCondition) patterns.push("conditional branching");
    if (features.hasFunction) patterns.push("functional abstraction");

    const patternList =
      patterns.length > 0
        ? patterns.join(", ")
        : "sequential computation";

    return `This code demonstrates ${patternList} across ${features.lineCount} lines. The objective: "${instruction}". Let us examine the fundamental principles at work.`;
  }

  private generateAnalysis(
    instruction: string,
    code: string,
    features: {
      hasLoop: boolean;
      hasNestedLoop: boolean;
      hasCondition: boolean;
      hasFunction: boolean;
      hasRecursion: boolean;
      hasDataStructure: boolean;
      hasAsync: boolean;
    }
  ): string {
    const sections: string[] = [];

    sections.push(
      `**First Principles Analysis**\n\nTo understand this code, we must reduce it to its fundamental components. As I often say, "Everything should be made as simple as possible, but not simpler." Let us decompose this solution.`
    );

    sections.push(
      `**The Problem Space**\n\nThe instruction "${instruction}" defines our problem domain. The code attempts to bridge the gap between the initial state and the desired outcome through computational transformation.`
    );

    if (features.hasFunction) {
      sections.push(
        `**Functional Decomposition**\n\nThe code employs functions as abstractions - each function represents a reusable unit of computation. This is analogous to how physics uses equations: a complex phenomenon is expressed through composable, well-defined operations. Each function has inputs (parameters), performs a transformation, and produces outputs (return values).`
      );
    }

    if (features.hasRecursion) {
      sections.push(
        `**Recursive Structure**\n\nRecursion is observed - the function calls itself with a reduced problem size. This is elegant: like mathematical induction, we define a base case and show how each step relates to the previous. The call stack acts as implicit memory, storing intermediate states until the base case is reached.`
      );
    }

    if (features.hasNestedLoop) {
      sections.push(
        `**Nested Iteration**\n\nNested loops indicate examination of element pairs or multi-dimensional data traversal. Consider: for n elements, examining all pairs requires n×n operations. This quadratic relationship is fundamental - doubling the input quadruples the work. Understanding this scaling behavior is crucial for predicting system behavior.`
      );
    } else if (features.hasLoop) {
      sections.push(
        `**Iterative Processing**\n\nThe loop construct processes elements sequentially. Each iteration represents one unit of work applied to one element. The elegance lies in the uniform treatment - the same operation applied repeatedly, like waves upon a shore, each following the same physical laws.`
      );
    }

    if (features.hasCondition) {
      sections.push(
        `**Conditional Logic**\n\nBranching statements implement decision logic - the code adapts its behavior based on runtime conditions. This is deterministic: given the same inputs, the same branch will always be taken. Yet it allows the single program to handle multiple scenarios, like a physical law that manifests differently under different conditions.`
      );
    }

    if (features.hasDataStructure) {
      sections.push(
        `**Data Organization**\n\nThe choice of data structure is not arbitrary - it determines the efficiency of operations. An array provides O(1) access by index but O(n) search. A hash map provides O(1) average lookup. The data structure is the "geometry" of our computational space, shaping what operations are efficient.`
      );
    }

    if (features.hasAsync) {
      sections.push(
        `**Asynchronous Computation**\n\nAsync patterns decouple the initiation of an operation from its completion. This is conceptually similar to causality in physics: an event is triggered now, but its effects propagate over time. The Promise represents a future value - a placeholder in our computation that will be resolved when the underlying operation completes.`
      );
    }

    sections.push(
      `**Synthesis**\n\nThese components work together as a unified system. The beauty of well-designed code, like a well-formed theory, lies in how elegantly its parts compose to solve the whole problem.`
    );

    return sections.join("\n\n");
  }

  private generateComplexityAnalysis(features: {
    hasLoop: boolean;
    hasNestedLoop: boolean;
    hasRecursion: boolean;
    hasDataStructure: boolean;
    lineCount: number;
  }): string {
    let timeComplexity: string;
    let timeExplanation: string;
    let spaceComplexity: string;
    let spaceExplanation: string;

    if (features.hasRecursion && features.hasNestedLoop) {
      timeComplexity = "O(n × 2^n) or higher";
      timeExplanation =
        "Recursive branching combined with iteration suggests exponential or factorial growth. Each recursive call may spawn multiple sub-problems.";
    } else if (features.hasRecursion) {
      timeComplexity = "O(2^n) or O(n!)";
      timeExplanation =
        "Recursive calls without memoization often lead to exponential time. The recursion tree branches at each level, potentially doubling work.";
    } else if (features.hasNestedLoop) {
      timeComplexity = "O(n²)";
      timeExplanation =
        "Nested loops typically indicate quadratic complexity. For each element processed by the outer loop, the inner loop processes all elements.";
    } else if (features.hasLoop) {
      timeComplexity = "O(n)";
      timeExplanation =
        "A single loop iterating through n elements yields linear time complexity. Work scales proportionally with input size.";
    } else {
      timeComplexity = "O(1)";
      timeExplanation =
        "No loops or recursion detected. The code performs a constant number of operations regardless of input size.";
    }

    if (features.hasRecursion) {
      spaceComplexity = "O(n) to O(n²)";
      spaceExplanation =
        "Recursive calls consume stack space. Maximum recursion depth determines space usage. Without tail-call optimization, deep recursion risks stack overflow.";
    } else if (features.hasDataStructure) {
      spaceComplexity = "O(n)";
      spaceExplanation =
        "Data structures that grow with input size require linear auxiliary space. This is the cost of organizing data for efficient access.";
    } else {
      spaceComplexity = "O(1)";
      spaceExplanation =
        "No significant auxiliary data structures detected. Memory usage remains constant regardless of input size.";
    }

    return `**Time Complexity**: ${timeComplexity}
${timeExplanation}

**Space Complexity**: ${spaceComplexity}
${spaceExplanation}

**Scalability Implications**:
For input size n = 1,000:
- O(1): ~1 operation
- O(log n): ~10 operations
- O(n): ~1,000 operations
- O(n log n): ~10,000 operations
- O(n²): ~1,000,000 operations
- O(2^n): ~10^301 operations (intractable)

This perspective helps predict how the code will behave as data grows - essential for engineering reliable systems.`;
  }

  private generateTerminology(features: {
    hasLoop: boolean;
    hasNestedLoop: boolean;
    hasCondition: boolean;
    hasRecursion: boolean;
    hasDataStructure: boolean;
    hasAsync: boolean;
  }): TermEntry[] {
    const terms: TermEntry[] = [];

    terms.push({
      term: "Time Complexity",
      definition:
        "A measure of how the runtime of an algorithm grows as the input size increases, expressed in Big-O notation",
    });

    terms.push({
      term: "Space Complexity",
      definition:
        "A measure of the memory required by an algorithm as a function of input size",
    });

    if (features.hasRecursion) {
      terms.push({
        term: "Recursion",
        definition:
          "A technique where a function calls itself with a smaller subproblem, continuing until reaching a base case",
      });
    }

    if (features.hasNestedLoop) {
      terms.push({
        term: "Quadratic Time",
        definition:
          "O(n²) complexity where work grows with the square of input size, common in nested iterations",
      });
    }

    if (features.hasDataStructure) {
      terms.push({
        term: "Data Structure",
        definition:
          "A format for organizing and storing data that enables efficient access and modification operations",
      });
    }

    if (features.hasAsync) {
      terms.push({
        term: "Asynchronous Execution",
        definition:
          "Non-blocking computation where operations can complete independently of the main program flow",
      });
    }

    if (features.hasCondition) {
      terms.push({
        term: "Branch Prediction",
        definition:
          "The process (in CPUs and reasoning) of anticipating which conditional path will be taken",
      });
    }

    return terms;
  }
}
