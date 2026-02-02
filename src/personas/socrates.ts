import { Persona, AnalysisResult, TermEntry } from "./types.js";

/**
 * Socrates persona - debugs errors through systematic questioning
 */
export class SocratesPersona implements Persona {
  name = "socrates";
  displayName = "The Debugger";

  analyze(instruction: string, code: string): AnalysisResult {
    const errorInfo = this.parseErrorInfo(instruction, code);
    const codePatterns = this.analyzeCodePatterns(code);

    const summary = this.generateSummary(instruction, errorInfo);
    const mainContent = this.generateAnalysis(instruction, code, errorInfo, codePatterns);
    const terminology = this.generateTerminology(errorInfo, codePatterns);

    return {
      summary,
      mainContent,
      terminology,
    };
  }

  private parseErrorInfo(instruction: string, code: string): {
    hasNullError: boolean;
    hasTypeError: boolean;
    hasReferenceError: boolean;
    hasIndexError: boolean;
    hasAsyncError: boolean;
    errorLine: number | null;
    errorType: string;
  } {
    const combined = instruction + " " + code;

    const lineMatch = combined.match(/line\s*(\d+)|:(\d+):/i);
    const errorLine = lineMatch ? parseInt(lineMatch[1] || lineMatch[2]) : null;

    return {
      hasNullError: /null|undefined|None|nil/i.test(combined) && /error|exception/i.test(combined),
      hasTypeError: /TypeError|type\s*error|cannot read property/i.test(combined),
      hasReferenceError: /ReferenceError|not defined|undefined variable/i.test(combined),
      hasIndexError: /IndexError|out of bounds|index|ArrayIndexOutOfBounds/i.test(combined),
      hasAsyncError: /Promise|async|await|unhandled|rejection/i.test(combined),
      errorLine,
      errorType: this.detectErrorType(combined),
    };
  }

  private detectErrorType(text: string): string {
    if (/NullPointerException|null|undefined is not/i.test(text)) return "Null Reference";
    if (/TypeError/i.test(text)) return "Type Error";
    if (/ReferenceError/i.test(text)) return "Reference Error";
    if (/IndexError|out of bounds/i.test(text)) return "Index Error";
    if (/SyntaxError/i.test(text)) return "Syntax Error";
    if (/Promise|rejection/i.test(text)) return "Async Error";
    return "Runtime Error";
  }

  private analyzeCodePatterns(code: string): {
    hasNullCheck: boolean;
    hasOptionalChaining: boolean;
    hasTryCatch: boolean;
    hasAsyncAwait: boolean;
    hasTypeAnnotations: boolean;
  } {
    return {
      hasNullCheck: /!==?\s*null|!==?\s*undefined|\?\?|if\s*\([^)]*null/i.test(code),
      hasOptionalChaining: /\?\./i.test(code),
      hasTryCatch: /try\s*{|catch\s*\(/i.test(code),
      hasAsyncAwait: /async|await/i.test(code),
      hasTypeAnnotations: /:\s*(string|number|boolean|any|void)|\<[A-Z]\w*\>/i.test(code),
    };
  }

  private generateSummary(
    instruction: string,
    errorInfo: { errorType: string; errorLine: number | null }
  ): string {
    const location = errorInfo.errorLine ? ` at line ${errorInfo.errorLine}` : "";
    return `A ${errorInfo.errorType}${location}. But this is merely where the error surfaced, not where it was born. Let us trace back to the root cause through systematic inquiry.`;
  }

  private generateAnalysis(
    instruction: string,
    code: string,
    errorInfo: {
      hasNullError: boolean;
      hasTypeError: boolean;
      hasReferenceError: boolean;
      hasIndexError: boolean;
      hasAsyncError: boolean;
      errorLine: number | null;
      errorType: string;
    },
    codePatterns: {
      hasNullCheck: boolean;
      hasOptionalChaining: boolean;
      hasTryCatch: boolean;
      hasAsyncAwait: boolean;
      hasTypeAnnotations: boolean;
    }
  ): string {
    const sections: string[] = [];

    sections.push(
      `## The Evidence\n\nThe error message tells us: "${instruction}"\n\nBut as I always say, the unexamined error is not worth fixing. Let us question everything.`
    );

    sections.push(
      `## The Questions We Must Ask\n\n1. **What state did we expect?** Before the error, what should have been true?\n2. **What state did we have?** What was actually present when the error occurred?\n3. **Where did our assumption fail?** At what point did reality diverge from expectation?`
    );

    if (errorInfo.hasNullError) {
      sections.push(
        `## Following the Null\n\n**The Pattern**: Something was assumed to exist, but didn't.\n\n**Questions to ask**:\n- Where did this value originate?\n- What function returned it?\n- Under what conditions can that function return null/undefined?\n- Did we check the return value before using it?\n\n**The likely cause**: A function that can return null was called, but the code assumed it would always return a valid value.`
      );

      if (!codePatterns.hasNullCheck && !codePatterns.hasOptionalChaining) {
        sections.push(
          `**Observation**: I see no null checks or optional chaining (\`?.\`) in this code. This is the absence of defensive programming.`
        );
      }
    }

    if (errorInfo.hasTypeError) {
      sections.push(
        `## The Type Mismatch\n\n**The Pattern**: An operation was attempted on a value of the wrong type.\n\n**Questions to ask**:\n- What type did we expect?\n- What type did we receive?\n- Where did the wrong type enter our system?\n- Is there implicit type coercion happening?`
      );
    }

    if (errorInfo.hasAsyncError) {
      sections.push(
        `## The Async Trap\n\n**The Pattern**: Asynchronous operations require special handling.\n\n**Questions to ask**:\n- Are all Promises being awaited?\n- Is there a try/catch around async operations?\n- Could a Promise be rejecting silently?\n- Is there a race condition?`
      );

      if (!codePatterns.hasTryCatch) {
        sections.push(
          `**Observation**: No try/catch blocks detected. Async errors may be escaping unhandled.`
        );
      }
    }

    sections.push(
      `## Edge Cases to Consider\n\n| Scenario | Could This Cause the Error? |\n|----------|-----------------------------|\n| Empty input | Values might be undefined |\n| Concurrent access | Race conditions |\n| Network failure | Null responses |\n| Invalid user input | Unexpected types |\n| Cache miss | Missing data |`
    );

    sections.push(
      `## The Path to Truth\n\n1. **Add logging** before the error line to see actual values\n2. **Trace backwards** from the error to find where the bad value entered\n3. **Question assumptions** - every place you assumed something, verify it\n4. **Fix at the source** - don't just patch the symptom\n\nThe goal is not merely to silence the error, but to understand why our model of the program diverged from reality.`
    );

    sections.push(
      `## Prevention\n\nOnce we fix this error, we must ask: how do we prevent its siblings?\n\n- Add type checking at system boundaries\n- Use defensive programming (null checks, optional chaining)\n- Write tests for edge cases\n- Consider using stricter type systems\n\nAn error fixed is good. An error prevented is better.`
    );

    return sections.join("\n\n");
  }

  private generateTerminology(
    errorInfo: { hasNullError: boolean; hasAsyncError: boolean },
    codePatterns: { hasOptionalChaining: boolean; hasTryCatch: boolean }
  ): TermEntry[] {
    const terms: TermEntry[] = [
      {
        term: "Root Cause",
        definition: "The fundamental reason why an error occurs, not just where it manifests",
      },
      {
        term: "Defensive Programming",
        definition: "Writing code that anticipates and handles potential errors before they occur",
      },
    ];

    if (errorInfo.hasNullError) {
      terms.push({
        term: "Null Safety",
        definition: "Techniques to prevent null/undefined reference errors, such as optional chaining (?.) and nullish coalescing (??)",
      });
    }

    if (errorInfo.hasAsyncError) {
      terms.push({
        term: "Unhandled Rejection",
        definition: "A Promise that rejects without a catch handler, causing errors to be silently swallowed or crash the program",
      });
    }

    terms.push({
      term: "Edge Case",
      definition: "An unusual or extreme condition that occurs at the boundaries of normal operation",
    });

    return terms;
  }
}
