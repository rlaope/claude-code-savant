import fs from "fs";
import path from "path";
import { PersonaInfo, PersonaMeta } from "./types.js";

export const DEV_META: Record<string, PersonaMeta> = {
  einstein:    { name: "Einstein",    nameKo: "아인슈타인", title: "The Professor",  titleKo: "개념 정리 에이전트",     initial: "E", color: "#6C5CE7" },
  shakespeare: { name: "Shakespeare", nameKo: "셰익스피어", title: "The Bard",       titleKo: "코드 분석 에이전트",     initial: "S", color: "#E17055" },
  socrates:    { name: "Socrates",    nameKo: "소크라테스",  title: "The Debugger",   titleKo: "디버깅 에이전트",        initial: "So", color: "#00B894" },
  stevejobs:   { name: "Steve Jobs",  nameKo: "스티브 잡스", title: "The Visionary",  titleKo: "방향 제시 에이전트",     initial: "J", color: "#0984E3" },
  "jvm-developer":    { name: "JVM Developer",    nameKo: "JVM 개발자",      title: "JVM Performance Expert",    titleKo: "JVM 최적화 에이전트",       initial: "Jv", color: "#D63031" },
  "python-developer": { name: "Python Developer", nameKo: "Python 개발자",   title: "Python Performance Expert", titleKo: "Python 최적화 에이전트",    initial: "Py", color: "#3776AB" },
  "go-developer":     { name: "Go Developer",     nameKo: "Go 개발자",       title: "Go Performance Expert",     titleKo: "Go 최적화 에이전트",        initial: "Go", color: "#00ADD8" },
  "rust-developer":   { name: "Rust Developer",   nameKo: "Rust 개발자",     title: "Rust Performance Expert",   titleKo: "Rust 최적화 에이전트",      initial: "Rs", color: "#E84118" },
  "node-developer":   { name: "Node.js Developer", nameKo: "Node.js 개발자", title: "Node.js Performance Expert", titleKo: "Node.js 최적화 에이전트",  initial: "Nd", color: "#55EFC4" },
  "swift-developer":  { name: "Swift Developer",  nameKo: "Swift 개발자",    title: "Swift Performance Expert",  titleKo: "Swift 최적화 에이전트",     initial: "Sw", color: "#F05138" },
  "cpp-developer":    { name: "C/C++ Developer",  nameKo: "C/C++ 개발자",    title: "C/C++ Performance Expert",  titleKo: "C/C++ 최적화 에이전트",     initial: "Cp", color: "#659AD2" },
  "aws-architect":    { name: "AWS Architect",    nameKo: "AWS 아키텍트",    title: "AWS Cloud Expert",          titleKo: "AWS 클라우드 에이전트",     initial: "Aw", color: "#FF9900" },
  "k8s-developer":    { name: "K8s Developer",    nameKo: "K8s 개발자",      title: "Kubernetes Expert",         titleKo: "K8s 오케스트레이션 에이전트", initial: "K8", color: "#326CE5" },
  "iac-developer":    { name: "IaC Developer",    nameKo: "IaC 개발자",      title: "Infrastructure as Code Expert", titleKo: "IaC 에이전트",          initial: "Ia", color: "#7B42BC" },
  "observability-developer": { name: "Observability Engineer", nameKo: "옵저버빌리티 엔지니어", title: "Observability Expert", titleKo: "옵저버빌리티 에이전트", initial: "Ob", color: "#E6522C" },
  "cicd-developer":   { name: "CI/CD Engineer",   nameKo: "CI/CD 엔지니어",  title: "CI/CD Pipeline Expert",     titleKo: "CI/CD 에이전트",            initial: "CI", color: "#2088FF" },
  "docker-developer": { name: "Docker Developer", nameKo: "Docker 개발자",   title: "Container Expert",          titleKo: "컨테이너 에이전트",         initial: "Dk", color: "#2496ED" },
  "system-designer":  { name: "System Designer",  nameKo: "시스템 디자이너",  title: "Large-Scale System Design Expert", titleKo: "시스템 설계 에이전트",  initial: "Sd", color: "#1ABC9C" },
  "performance-detective": { name: "Performance Detective", nameKo: "성능 탐정", title: "Performance Detection Expert", titleKo: "성능 탐지 에이전트",   initial: "Pd", color: "#E74C3C" },
  "sre-engineer":     { name: "SRE Engineer",     nameKo: "SRE 엔지니어",    title: "Site Reliability Expert",   titleKo: "SRE 안정성 에이전트",       initial: "Sr", color: "#2ECC71" },
};

export const BIZ_META: Record<string, PersonaMeta> = {
  sayno:     { name: "SayNo",            nameKo: "세이노",       title: "The Strategist",  titleKo: "사업/수익화 에이전트",  initial: "₩", color: "#F39C12" },
  finance:   { name: "Finance PM",       nameKo: "파이낸스 PM",  title: "Investment & Finance", titleKo: "재무/투자 에이전트", initial: "F", color: "#8E44AD" },
  growth:    { name: "Growth PM",        nameKo: "그로스 PM",    title: "Marketing & Growth",   titleKo: "마케팅/그로스 에이전트", initial: "G", color: "#27AE60" },
  legal:     { name: "Legal Advisor",    nameKo: "법률 어드바이저", title: "Business Law",     titleKo: "법률/규제 에이전트",  initial: "L", color: "#2C3E50" },
  fashion:   { name: "Fashion PM",       nameKo: "패션 PM",      title: "Fashion & Retail",     titleKo: "패션 사업 에이전트", initial: "Fa", color: "#E91E63" },
  logistics: { name: "Logistics Manager", nameKo: "물류 매니저",  title: "Supply Chain & Ops",   titleKo: "물류/SCM 에이전트",  initial: "Lo", color: "#795548" },
  fnb:       { name: "F&B PM",           nameKo: "F&B PM",       title: "Food & Beverage",      titleKo: "요식업 에이전트",    initial: "Fb", color: "#FF5722" },
  saas:      { name: "SaaS PM",          nameKo: "SaaS PM",      title: "Software Business",    titleKo: "SaaS/플랫폼 에이전트", initial: "Sa", color: "#3F51B5" },
  ecommerce: { name: "E-commerce PM",   nameKo: "이커머스 PM",  title: "Online Retail",        titleKo: "이커머스 에이전트",   initial: "Ec", color: "#FF9800" },
  realestate:{ name: "Real Estate PM",  nameKo: "부동산 PM",    title: "Property & PropTech",   titleKo: "부동산 에이전트",     initial: "Re", color: "#607D8B" },
  healthcare:{ name: "Healthcare PM",   nameKo: "헬스케어 PM",  title: "HealthTech",           titleKo: "헬스케어 에이전트",   initial: "He", color: "#4CAF50" },
  content:   { name: "Content PM",      nameKo: "콘텐츠 PM",    title: "Media & Creator",      titleKo: "콘텐츠/미디어 에이전트", initial: "Co", color: "#9C27B0" },
  hr:        { name: "HR PM",           nameKo: "HR PM",        title: "People & HRTech",      titleKo: "인사/채용 에이전트",  initial: "Hr", color: "#009688" },
  education: { name: "Education PM",    nameKo: "교육 PM",      title: "EdTech & Learning",    titleKo: "교육/에듀테크 에이전트", initial: "Ed", color: "#673AB7" },
  travel:    { name: "Travel PM",       nameKo: "여행 PM",      title: "Tourism & Hospitality", titleKo: "여행/관광 에이전트",  initial: "Tr", color: "#00BCD4" },
};

function loadPersonaFromFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  return content.replace(/^---[\s\S]*?---\n*/, "");
}

function loadPersonaFromDir(dirOrFile: string): string | null {
  if (fs.existsSync(dirOrFile) && fs.statSync(dirOrFile).isFile()) {
    return loadPersonaFromFile(dirOrFile);
  }
  if (fs.existsSync(dirOrFile) && fs.statSync(dirOrFile).isDirectory()) {
    const order = ["persona.md", "templates.md", "examples.md", "benchmarks.md"];
    const parts: string[] = [];
    for (const filename of order) {
      const filePath = path.join(dirOrFile, filename);
      const content = loadPersonaFromFile(filePath);
      if (content) parts.push(content);
    }
    return parts.length > 0 ? parts.join("\n\n---\n\n") : null;
  }
  return null;
}

function loadPersonaLightweight(dirOrFile: string): string | null {
  if (fs.existsSync(dirOrFile) && fs.statSync(dirOrFile).isFile()) {
    return loadPersonaFromFile(dirOrFile);
  }
  if (fs.existsSync(dirOrFile) && fs.statSync(dirOrFile).isDirectory()) {
    const personaPath = path.join(dirOrFile, "persona.md");
    return loadPersonaFromFile(personaPath);
  }
  return null;
}

export function loadMetaOverrides(metaOverridesPath: string): Record<string, Partial<PersonaMeta>> {
  try {
    if (fs.existsSync(metaOverridesPath)) {
      return JSON.parse(fs.readFileSync(metaOverridesPath, "utf-8"));
    }
  } catch { /* ignore */ }
  return {};
}

export function saveMetaOverrides(metaOverridesPath: string, overrides: Record<string, Partial<PersonaMeta>>): void {
  fs.writeFileSync(metaOverridesPath, JSON.stringify(overrides, null, 2), "utf-8");
}

export function applyOverrides(id: string, meta: PersonaMeta, metaOverrides: Record<string, Partial<PersonaMeta>>): PersonaMeta {
  const override = metaOverrides[id];
  if (!override) return meta;
  return { ...meta, ...override };
}

export function loadPersonas(personasDir: string, metaOverrides: Record<string, Partial<PersonaMeta>>): Map<string, PersonaInfo> {
  const result = new Map<string, PersonaInfo>();

  for (const [id, info] of Object.entries(DEV_META)) {
    const devDir = path.join(personasDir, "dev", id);
    const prompt = loadPersonaFromDir(devDir);
    const lightPrompt = loadPersonaLightweight(devDir);
    const meta = applyOverrides(id, info, metaOverrides);
    if (prompt) result.set(id, { id, ...meta, category: "dev", systemPrompt: prompt, lightSystemPrompt: lightPrompt || prompt });
  }

  for (const [id, info] of Object.entries(BIZ_META)) {
    const dirPath = id === "sayno"
      ? path.join(personasDir, "dev", id)
      : path.join(personasDir, "biz", id);
    const prompt = loadPersonaFromDir(dirPath);
    const lightPrompt = loadPersonaLightweight(dirPath);
    const meta = applyOverrides(id, info, metaOverrides);
    if (prompt) result.set(id, { id, ...meta, category: "biz", systemPrompt: prompt, lightSystemPrompt: lightPrompt || prompt });
  }

  return result;
}
