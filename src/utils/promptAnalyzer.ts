import { PersonaType } from "../personas/index.js";

/**
 * Keywords that suggest Einstein persona (performance/complexity focus)
 */
const EINSTEIN_KEYWORDS = [
  // English
  "performance",
  "complexity",
  "optimize",
  "optimization",
  "big-o",
  "big o",
  "time complexity",
  "space complexity",
  "efficient",
  "efficiency",
  "algorithm",
  "runtime",
  "memory",
  "benchmark",
  "bottleneck",
  "scalability",
  "scale",
  // Korean
  "성능",
  "복잡도",
  "최적화",
  "효율",
  "알고리즘",
  "메모리",
  "속도",
  "빠르게",
  "느린",
];

/**
 * Keywords that suggest Shakespeare persona (narrative/flow focus)
 */
const SHAKESPEARE_KEYWORDS = [
  // English
  "flow",
  "structure",
  "explain",
  "understand",
  "how does",
  "what does",
  "walk through",
  "walkthrough",
  "narrative",
  "story",
  "diagram",
  "flowchart",
  "visualize",
  "overview",
  "architecture",
  "design",
  "pattern",
  // Korean
  "흐름",
  "구조",
  "설명",
  "이해",
  "어떻게",
  "무엇",
  "다이어그램",
  "플로우",
  "아키텍처",
  "설계",
  "패턴",
];

/**
 * Analyzes the instruction text to determine the most appropriate persona
 *
 * @param instruction - The user's instruction or question about the code
 * @returns The recommended persona type based on keyword analysis
 */
export function analyzePromptForPersona(instruction: string): PersonaType {
  const lowerInstruction = instruction.toLowerCase();

  let einsteinScore = 0;
  let shakespeareScore = 0;

  // Count Einstein keyword matches
  for (const keyword of EINSTEIN_KEYWORDS) {
    if (lowerInstruction.includes(keyword.toLowerCase())) {
      einsteinScore++;
    }
  }

  // Count Shakespeare keyword matches
  for (const keyword of SHAKESPEARE_KEYWORDS) {
    if (lowerInstruction.includes(keyword.toLowerCase())) {
      shakespeareScore++;
    }
  }

  console.error(
    `[promptAnalyzer] Scores - Einstein: ${einsteinScore}, Shakespeare: ${shakespeareScore}`
  );

  // Return the persona with higher score, default to shakespeare for ties or no matches
  if (einsteinScore > shakespeareScore) {
    console.error(`[promptAnalyzer] Auto-selected: einstein`);
    return "einstein";
  }

  console.error(`[promptAnalyzer] Auto-selected: shakespeare`);
  return "shakespeare";
}
