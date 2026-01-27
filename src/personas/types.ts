/**
 * Terminology entry for the glossary section
 */
export interface TermEntry {
  term: string;
  definition: string;
}

/**
 * Result of code analysis by a persona
 */
export interface AnalysisResult {
  summary: string;
  mainContent: string;
  diagram?: string;
  complexityAnalysis?: string;
  terminology: TermEntry[];
}

/**
 * Persona interface for code analysis
 */
export interface Persona {
  name: string;
  displayName: string;
  analyze(instruction: string, code: string): AnalysisResult;
}
