import { TermEntry } from "../personas/types.js";

/**
 * Individual persona's analysis in a consensus discussion
 */
export interface PersonaOpinion {
  personaName: string;
  displayName: string;
  summary: string;
  keyInsights: string[];
  recommendation: string;
}

/**
 * Synthesized consensus from all personas
 */
export interface ConsensusResult {
  question: string;
  opinions: PersonaOpinion[];
  synthesis: ConsensusSynthesis;
  terminology: TermEntry[];
}

/**
 * The final synthesized consensus
 */
export interface ConsensusSynthesis {
  agreement: string;
  keyPoints: string[];
  actionItems: string[];
  dissent?: string;
}
