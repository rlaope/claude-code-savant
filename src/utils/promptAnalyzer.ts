import { PersonaType } from "../personas/index.js";

/**
 * Keywords that suggest Einstein persona (performance/complexity focus)
 */
const EINSTEIN_KEYWORDS = [
  // English
  "performance", "complexity", "optimize", "optimization", "big-o", "big o",
  "time complexity", "space complexity", "efficient", "efficiency", "algorithm",
  "runtime", "memory", "benchmark", "bottleneck", "scalability", "scale",
  "what is", "how does", "why does", "first principles", "concept", "theory",
  // Korean
  "성능", "복잡도", "최적화", "효율", "알고리즘", "메모리", "속도", "빠르게", "느린",
  "개념", "원리", "이론",
];

/**
 * Keywords that suggest Shakespeare persona (narrative/flow focus)
 */
const SHAKESPEARE_KEYWORDS = [
  // English
  "flow", "structure", "explain", "understand", "how does", "what does",
  "walk through", "walkthrough", "narrative", "story", "diagram", "flowchart",
  "visualize", "overview", "architecture", "design", "pattern", "analyze code",
  "code review", "read this",
  // Korean
  "흐름", "구조", "설명", "이해", "어떻게", "무엇", "다이어그램", "플로우",
  "아키텍처", "설계", "패턴", "코드 분석", "코드 리뷰",
];

/**
 * Keywords that suggest Socrates persona (debugging/error focus)
 */
const SOCRATES_KEYWORDS = [
  // English
  "error", "bug", "fix", "debug", "exception", "stack trace", "crash",
  "not working", "broken", "fails", "failure", "null", "undefined", "TypeError",
  "ReferenceError", "why isn't", "why doesn't", "wrong", "issue", "problem",
  // Korean
  "에러", "버그", "수정", "디버그", "오류", "안돼", "안됨", "실패", "고장",
  "왜 안", "문제", "스택트레이스",
];

/**
 * Keywords that suggest Steve Jobs persona (vision/direction focus)
 */
const STEVEJOBS_KEYWORDS = [
  // English
  "vision", "direction", "next feature", "improve", "better", "roadmap",
  "simplify", "user experience", "ux", "what should", "idea", "innovation",
  "kill", "remove", "focus", "product",
  // Korean
  "방향", "비전", "다음", "개선", "더 좋게", "로드맵", "단순화", "사용자 경험",
  "아이디어", "혁신", "제거", "집중", "제품",
];

/**
 * Keywords that suggest SayNo persona (business/monetization focus)
 */
const SAYNO_KEYWORDS = [
  // English
  "monetize", "monetization", "revenue", "pricing", "business model", "profit",
  "cost", "margin", "subscription", "freemium", "saas", "market", "customer",
  "acquisition", "retention", "churn", "ltv", "cac", "unit economics",
  "break even", "p&l", "funding", "valuation", "startup",
  // Korean
  "수익화", "수익", "가격", "비즈니스", "사업", "매출", "이익", "마진",
  "구독", "프리미엄", "시장", "고객", "유치", "이탈", "단위경제", "손익",
  "투자", "밸류에이션", "스타트업", "창업",
];

/**
 * Analyzes the instruction text to determine the most appropriate persona
 *
 * @param instruction - The user's instruction or question about the code
 * @returns The recommended persona type based on keyword analysis
 */
export function analyzePromptForPersona(instruction: string): PersonaType {
  const lowerInstruction = instruction.toLowerCase();

  const scores: Record<PersonaType, number> = {
    einstein: 0,
    shakespeare: 0,
    socrates: 0,
    stevejobs: 0,
    sayno: 0,
  };

  const keywordSets: Record<PersonaType, string[]> = {
    einstein: EINSTEIN_KEYWORDS,
    shakespeare: SHAKESPEARE_KEYWORDS,
    socrates: SOCRATES_KEYWORDS,
    stevejobs: STEVEJOBS_KEYWORDS,
    sayno: SAYNO_KEYWORDS,
  };

  for (const [persona, keywords] of Object.entries(keywordSets)) {
    for (const keyword of keywords) {
      if (lowerInstruction.includes(keyword.toLowerCase())) {
        scores[persona as PersonaType]++;
      }
    }
  }

  console.error(
    `[promptAnalyzer] Scores - Einstein: ${scores.einstein}, Shakespeare: ${scores.shakespeare}, Socrates: ${scores.socrates}, SteveJobs: ${scores.stevejobs}, SayNo: ${scores.sayno}`
  );

  // Find the persona with the highest score
  let bestPersona: PersonaType = "shakespeare";
  let bestScore = 0;

  for (const [persona, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestPersona = persona as PersonaType;
    }
  }

  // Default to shakespeare for ties or no matches
  if (bestScore === 0) {
    bestPersona = "shakespeare";
  }

  console.error(`[promptAnalyzer] Auto-selected: ${bestPersona}`);
  return bestPersona;
}
