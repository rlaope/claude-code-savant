import { describe, it, expect } from "vitest";
import { ShakespearePersona } from "../src/personas/shakespeare.js";
import { EinsteinPersona } from "../src/personas/einstein.js";
import { getPersona, getAvailablePersonas } from "../src/personas/index.js";

describe("ShakespearePersona", () => {
  const persona = new ShakespearePersona();

  it("should have correct name and displayName", () => {
    expect(persona.name).toBe("shakespeare");
    expect(persona.displayName).toBe("The Bard");
  });

  it("should analyze code with loops", () => {
    const code = `
      for (let i = 0; i < 10; i++) {
        console.log(i);
      }
    `;
    const result = persona.analyze("Explain this loop", code);

    expect(result.summary).toContain("cyclical endeavors");
    expect(result.mainContent).toContain("Eternal Dance");
    expect(result.diagram).toContain("flowchart TD");
    expect(result.terminology.length).toBeGreaterThan(0);
  });

  it("should analyze code with conditionals", () => {
    const code = `
      if (x > 0) {
        return "positive";
      } else {
        return "non-positive";
      }
    `;
    const result = persona.analyze("Explain this condition", code);

    expect(result.summary).toContain("fateful decisions");
    expect(result.mainContent).toContain("Crossroads of Fate");
  });

  it("should generate mermaid diagram", () => {
    const code = `function test() { return 1; }`;
    const result = persona.analyze("Explain", code);

    expect(result.diagram).toBeDefined();
    expect(result.diagram).toContain("flowchart TD");
    expect(result.diagram).toContain("Prologue");
    expect(result.diagram).toContain("Epilogue");
  });
});

describe("EinsteinPersona", () => {
  const persona = new EinsteinPersona();

  it("should have correct name and displayName", () => {
    expect(persona.name).toBe("einstein");
    expect(persona.displayName).toBe("The Professor");
  });

  it("should analyze code with nested loops", () => {
    const code = `
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          result += arr[i][j];
        }
      }
    `;
    const result = persona.analyze("Analyze complexity", code);

    expect(result.complexityAnalysis).toContain("O(n²)");
    expect(result.mainContent).toContain("Nested Iteration");
  });

  it("should analyze async code", () => {
    const code = `
      async function fetchData() {
        const response = await fetch(url);
        return response.json();
      }
    `;
    const result = persona.analyze("Explain async", code);

    expect(result.mainContent).toContain("Asynchronous");
  });

  it("should provide complexity analysis", () => {
    const code = `
      function linear(arr) {
        for (const item of arr) {
          process(item);
        }
      }
    `;
    const result = persona.analyze("Analyze", code);

    expect(result.complexityAnalysis).toBeDefined();
    expect(result.complexityAnalysis).toContain("Time Complexity");
    expect(result.complexityAnalysis).toContain("Space Complexity");
  });
});

describe("Persona Factory", () => {
  it("should return shakespeare persona", () => {
    const persona = getPersona("shakespeare");
    expect(persona.name).toBe("shakespeare");
  });

  it("should return einstein persona", () => {
    const persona = getPersona("einstein");
    expect(persona.name).toBe("einstein");
  });

  it("should throw for unknown persona", () => {
    expect(() => getPersona("unknown" as any)).toThrow("Unknown persona type");
  });

  it("should list available personas", () => {
    const personas = getAvailablePersonas();
    expect(personas).toContain("shakespeare");
    expect(personas).toContain("einstein");
    expect(personas).toContain("stevejobs");
    expect(personas).toContain("socrates");
    expect(personas.length).toBe(4);
  });

  it("should return stevejobs persona", () => {
    const persona = getPersona("stevejobs");
    expect(persona.name).toBe("stevejobs");
  });

  it("should return socrates persona", () => {
    const persona = getPersona("socrates");
    expect(persona.name).toBe("socrates");
  });
});
