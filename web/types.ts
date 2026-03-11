export type Provider = "local" | "anthropic" | "openai" | "gemini";

export type PersonaCategory = "dev" | "biz";

export interface PersonaInfo {
  id: string;
  name: string;
  nameKo: string;
  title: string;
  titleKo: string;
  initial: string;
  color: string;
  category: PersonaCategory;
  systemPrompt: string;
  lightSystemPrompt: string;
}

export type PersonaMeta = {
  name: string;
  nameKo: string;
  title: string;
  titleKo: string;
  initial: string;
  color: string;
};
