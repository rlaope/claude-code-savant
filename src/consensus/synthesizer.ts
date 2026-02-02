import { AnalysisResult, TermEntry } from "../personas/types.js";
import { PersonaOpinion, ConsensusResult, ConsensusSynthesis } from "./types.js";

/**
 * Extract key insights from analysis content
 */
function extractKeyInsights(content: string): string[] {
  const insights: string[] = [];

  // Look for bullet points or numbered items
  const bulletMatches = content.match(/^[\-\*•]\s+(.+)$/gm);
  if (bulletMatches) {
    insights.push(...bulletMatches.slice(0, 3).map(m => m.replace(/^[\-\*•]\s+/, '')));
  }

  // Look for sentences with key indicator words
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keyIndicators = ['important', 'critical', 'key', 'essential', 'must', 'should', 'recommend', '중요', '핵심', '필수'];

  for (const sentence of sentences) {
    if (keyIndicators.some(ind => sentence.toLowerCase().includes(ind))) {
      if (insights.length < 3) {
        insights.push(sentence.trim());
      }
    }
  }

  // If still not enough, take first few meaningful sentences
  if (insights.length < 2) {
    insights.push(...sentences.slice(0, 2).map(s => s.trim()));
  }

  return insights.slice(0, 3);
}

/**
 * Extract recommendation from analysis
 */
function extractRecommendation(content: string, summary: string): string {
  // Look for recommendation patterns
  const recPatterns = [
    /recommend(?:ation)?[:\s]+([^.!?]+[.!?])/i,
    /suggest(?:ion)?[:\s]+([^.!?]+[.!?])/i,
    /should\s+([^.!?]+[.!?])/i,
    /결론[:\s]+([^.!?]+[.!?])/,
    /추천[:\s]+([^.!?]+[.!?])/,
  ];

  for (const pattern of recPatterns) {
    const match = content.match(pattern) || summary.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Default to summary if no explicit recommendation
  return summary.split(/[.!?]/)[0].trim() + '.';
}

/**
 * Convert raw analysis to persona opinion
 */
export function analysisToOpinion(
  personaName: string,
  displayName: string,
  result: AnalysisResult
): PersonaOpinion {
  return {
    personaName,
    displayName,
    summary: result.summary,
    keyInsights: extractKeyInsights(result.mainContent),
    recommendation: extractRecommendation(result.mainContent, result.summary),
  };
}

/**
 * Find common themes across opinions
 */
function findCommonThemes(opinions: PersonaOpinion[]): string[] {
  const allInsights = opinions.flatMap(o => o.keyInsights.join(' ').toLowerCase());
  const commonWords = new Map<string, number>();

  // Key technical terms to look for
  const technicalTerms = [
    'performance', 'complexity', 'structure', 'pattern', 'error', 'async',
    'function', 'class', 'loop', 'condition', 'refactor', 'simplify',
    'test', 'validate', 'security', 'scale', 'maintain',
    '성능', '복잡도', '구조', '패턴', '에러', '비동기', '함수', '클래스',
    '리팩토링', '단순화', '테스트', '검증', '보안', '확장', '유지보수'
  ];

  const combinedText = allInsights.join(' ');
  for (const term of technicalTerms) {
    if (combinedText.includes(term.toLowerCase())) {
      commonWords.set(term, (commonWords.get(term) || 0) + 1);
    }
  }

  return Array.from(commonWords.entries())
    .filter(([_, count]) => count >= 2)
    .map(([term, _]) => term)
    .slice(0, 5);
}

/**
 * Synthesize consensus from multiple persona opinions
 */
export function synthesizeConsensus(
  question: string,
  opinions: PersonaOpinion[]
): ConsensusSynthesis {
  const commonThemes = findCommonThemes(opinions);

  // Build agreement statement
  const agreementParts: string[] = [];
  if (commonThemes.length > 0) {
    agreementParts.push(`All perspectives agree on the importance of: ${commonThemes.join(', ')}.`);
  }

  // Collect unique recommendations
  const recommendations = opinions.map(o => o.recommendation);
  const uniqueRecs = [...new Set(recommendations)];

  // Build key points from each persona's strongest insight
  const keyPoints = opinions.map(o =>
    `**${o.displayName}**: ${o.keyInsights[0] || o.summary.split('.')[0]}`
  );

  // Build action items from recommendations
  const actionItems = opinions.map(o =>
    `[${o.displayName}] ${o.recommendation}`
  );

  // Check for dissent (if recommendations are very different)
  let dissent: string | undefined;
  if (uniqueRecs.length === opinions.length && opinions.length > 2) {
    dissent = "Each perspective offers a unique approach. Consider the context to choose the most appropriate recommendation.";
  }

  return {
    agreement: agreementParts.length > 0
      ? agreementParts.join(' ')
      : "The perspectives complement each other, each offering unique insights.",
    keyPoints,
    actionItems,
    dissent,
  };
}

/**
 * Merge terminology from all analyses
 */
export function mergeTerminology(allTerms: TermEntry[][]): TermEntry[] {
  const termMap = new Map<string, string>();

  for (const terms of allTerms) {
    for (const entry of terms) {
      if (!termMap.has(entry.term)) {
        termMap.set(entry.term, entry.definition);
      }
    }
  }

  return Array.from(termMap.entries()).map(([term, definition]) => ({
    term,
    definition,
  }));
}

/**
 * Build complete consensus result
 */
export function buildConsensusResult(
  question: string,
  opinions: PersonaOpinion[],
  allTerminology: TermEntry[][]
): ConsensusResult {
  return {
    question,
    opinions,
    synthesis: synthesizeConsensus(question, opinions),
    terminology: mergeTerminology(allTerminology),
  };
}
