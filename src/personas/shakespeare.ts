import { Persona, AnalysisResult, TermEntry } from "./types.js";

/**
 * Shakespeare persona - analyzes code as dramatic narrative with flowcharts
 */
export class ShakespearePersona implements Persona {
  name = "shakespeare";
  displayName = "The Bard";

  analyze(instruction: string, code: string): AnalysisResult {
    const lines = code.split("\n").filter((line) => line.trim());
    const hasLoop = /for|while|do\s*\{/.test(code);
    const hasCondition = /if|else|switch|case/.test(code);
    const hasFunction =
      /function|=>|def |fn |func |public |private |protected /.test(code);
    const hasClass = /class |struct |interface /.test(code);
    const hasAsync = /async|await|Promise|Future/.test(code);
    const hasError = /try|catch|throw|error|Error|exception|Exception/.test(
      code
    );

    const summary = this.generateSummary(instruction, {
      hasLoop,
      hasCondition,
      hasFunction,
      hasClass,
      hasAsync,
      hasError,
      lineCount: lines.length,
    });

    const mainContent = this.generateNarrative(instruction, code, {
      hasLoop,
      hasCondition,
      hasFunction,
      hasClass,
      hasAsync,
      hasError,
    });

    const diagram = this.generateFlowchart(code, {
      hasLoop,
      hasCondition,
      hasFunction,
      hasAsync,
      hasError,
    });

    const terminology = this.generateTerminology({
      hasLoop,
      hasCondition,
      hasFunction,
      hasClass,
      hasAsync,
      hasError,
    });

    return {
      summary,
      mainContent,
      diagram,
      terminology,
    };
  }

  private generateSummary(
    instruction: string,
    features: {
      hasLoop: boolean;
      hasCondition: boolean;
      hasFunction: boolean;
      hasClass: boolean;
      hasAsync: boolean;
      hasError: boolean;
      lineCount: number;
    }
  ): string {
    const elements: string[] = [];

    if (features.hasClass) elements.push("noble classes");
    if (features.hasFunction) elements.push("dutiful functions");
    if (features.hasLoop) elements.push("cyclical endeavors");
    if (features.hasCondition) elements.push("fateful decisions");
    if (features.hasAsync) elements.push("promises yet unfulfilled");
    if (features.hasError) elements.push("guardians against misfortune");

    const elementList =
      elements.length > 0
        ? elements.join(", ")
        : "simple declarations of intent";

    return `Hark! A tale of ${elementList} unfolds before us in ${features.lineCount} verses of code. The instruction bids us: "${instruction}"`;
  }

  private generateNarrative(
    instruction: string,
    code: string,
    features: {
      hasLoop: boolean;
      hasCondition: boolean;
      hasFunction: boolean;
      hasClass: boolean;
      hasAsync: boolean;
      hasError: boolean;
    }
  ): string {
    const acts: string[] = [];

    acts.push(
      `**Act I: The Prologue**\nOur story begins as the programmer's quill inscribes their intent: "${instruction}". Let us witness how this drama unfolds within the silicon stage.`
    );

    if (features.hasClass) {
      acts.push(
        `**Act II: The Noble Houses**\nBehold! Classes emerge as great houses, each with their own domains and duties. Like the Montagues and Capulets, they hold their properties close and their methods closer still.`
      );
    }

    if (features.hasFunction) {
      acts.push(
        `**Act III: The Players Take Their Marks**\nFunctions, those faithful servants of logic, stand ready to perform their appointed tasks. Each accepts its arguments as an actor accepts direction, and returns its result as applause to the caller.`
      );
    }

    if (features.hasCondition) {
      acts.push(
        `**Act IV: The Crossroads of Fate**\n"To execute, or not to execute?" - such is the question posed by conditional statements. The code must choose its path, guided by boolean stars.`
      );
    }

    if (features.hasLoop) {
      acts.push(
        `**Act V: The Eternal Dance**\nRound and round the loops do spin, like dancers at a masquerade. Each iteration brings us closer to the grand finale, until the exit condition calls the final curtain.`
      );
    }

    if (features.hasAsync) {
      acts.push(
        `**Act VI: Promises Upon the Wind**\nAsync operations venture forth into uncertain futures, carrying promises of data yet to arrive. The await keyword stands patient as Juliet at her window, watching for the return of that which was sent away.`
      );
    }

    if (features.hasError) {
      acts.push(
        `**Act VII: The Watchful Guards**\nTry-catch blocks stand as vigilant sentinels, ready to intercept misfortune before it can poison the entire play. Should an error arise, they catch it gracefully, preventing tragedy from befalling our program.`
      );
    }

    acts.push(
      `**Epilogue**\nAnd so concludes our examination of this digital drama. May your debugging be swift and your deployments ever successful!`
    );

    return acts.join("\n\n");
  }

  private generateFlowchart(
    code: string,
    features: {
      hasLoop: boolean;
      hasCondition: boolean;
      hasFunction: boolean;
      hasAsync: boolean;
      hasError: boolean;
    }
  ): string {
    const nodes: string[] = ["flowchart TD"];
    nodes.push('    A["🎭 Prologue: Code Begins"]');

    let currentNode = "A";
    let nodeIndex = 1;

    const getNextNode = () => String.fromCharCode(65 + nodeIndex++);

    if (features.hasFunction) {
      const node = getNextNode();
      nodes.push(`    ${node}["📜 Functions Declared"]`);
      nodes.push(`    ${currentNode} --> ${node}`);
      currentNode = node;
    }

    if (features.hasCondition) {
      const decisionNode = getNextNode();
      const yesNode = getNextNode();
      const noNode = getNextNode();
      const mergeNode = getNextNode();

      nodes.push(`    ${decisionNode}{"⚖️ Fate's Decision"}`);
      nodes.push(`    ${yesNode}["✓ Path of Truth"]`);
      nodes.push(`    ${noNode}["✗ Path of Falsehood"]`);
      nodes.push(`    ${mergeNode}["🔀 Paths Converge"]`);

      nodes.push(`    ${currentNode} --> ${decisionNode}`);
      nodes.push(`    ${decisionNode} -->|"Aye"| ${yesNode}`);
      nodes.push(`    ${decisionNode} -->|"Nay"| ${noNode}`);
      nodes.push(`    ${yesNode} --> ${mergeNode}`);
      nodes.push(`    ${noNode} --> ${mergeNode}`);
      currentNode = mergeNode;
    }

    if (features.hasLoop) {
      const loopStart = getNextNode();
      const loopBody = getNextNode();
      const loopEnd = getNextNode();

      nodes.push(`    ${loopStart}{"🔄 The Dance Begins"}`);
      nodes.push(`    ${loopBody}["💃 Dance Step"]`);
      nodes.push(`    ${loopEnd}["🎵 Dance Concludes"]`);

      nodes.push(`    ${currentNode} --> ${loopStart}`);
      nodes.push(`    ${loopStart} -->|"Continue"| ${loopBody}`);
      nodes.push(`    ${loopBody} --> ${loopStart}`);
      nodes.push(`    ${loopStart} -->|"Exit"| ${loopEnd}`);
      currentNode = loopEnd;
    }

    if (features.hasAsync) {
      const promiseNode = getNextNode();
      const awaitNode = getNextNode();

      nodes.push(`    ${promiseNode}["🕊️ Promise Takes Flight"]`);
      nodes.push(`    ${awaitNode}["⏳ Await Return"]`);

      nodes.push(`    ${currentNode} --> ${promiseNode}`);
      nodes.push(`    ${promiseNode} -.->|"async"| ${awaitNode}`);
      currentNode = awaitNode;
    }

    if (features.hasError) {
      const tryNode = getNextNode();
      const catchNode = getNextNode();

      nodes.push(`    ${tryNode}["🛡️ Try: Venture Forth"]`);
      nodes.push(`    ${catchNode}["🚨 Catch: Guard Against Peril"]`);

      nodes.push(`    ${currentNode} --> ${tryNode}`);
      nodes.push(`    ${tryNode} -.->|"error"| ${catchNode}`);
      currentNode = tryNode;
    }

    const finalNode = getNextNode();
    nodes.push(`    ${finalNode}["🎭 Epilogue: Curtain Falls"]`);
    nodes.push(`    ${currentNode} --> ${finalNode}`);

    return nodes.join("\n");
  }

  private generateTerminology(features: {
    hasLoop: boolean;
    hasCondition: boolean;
    hasFunction: boolean;
    hasClass: boolean;
    hasAsync: boolean;
    hasError: boolean;
  }): TermEntry[] {
    const terms: TermEntry[] = [];

    if (features.hasFunction) {
      terms.push({
        term: "Function (The Player)",
        definition:
          "A named performer that executes a specific role in our code drama, accepting arguments as direction and returning results as applause",
      });
    }

    if (features.hasClass) {
      terms.push({
        term: "Class (The Noble House)",
        definition:
          "A blueprint for creating objects, like a great family with its own properties and inherited behaviors",
      });
    }

    if (features.hasCondition) {
      terms.push({
        term: "Conditional (Fate's Crossroad)",
        definition:
          "A branching point where the code must choose its path based on boolean truth",
      });
    }

    if (features.hasLoop) {
      terms.push({
        term: "Loop (The Eternal Dance)",
        definition:
          "A repetitive construct that continues its performance until the exit condition rings the final bell",
      });
    }

    if (features.hasAsync) {
      terms.push({
        term: "Promise (Oath Upon the Wind)",
        definition:
          "A pledge of future value, carrying hope of data yet to arrive from distant async shores",
      });
    }

    if (features.hasError) {
      terms.push({
        term: "Try-Catch (The Vigilant Guard)",
        definition:
          "A protective construct that catches errors before they can bring tragedy to our program",
      });
    }

    if (terms.length === 0) {
      terms.push({
        term: "Variable (The Vessel)",
        definition:
          "A named container holding values, like a chalice holding wine at the feast",
      });
    }

    return terms;
  }
}
