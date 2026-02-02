import { Persona } from "./types.js";
import { ShakespearePersona } from "./shakespeare.js";
import { EinsteinPersona } from "./einstein.js";
import { SteveJobsPersona } from "./stevejobs.js";
import { SocratesPersona } from "./socrates.js";

export type PersonaType = "shakespeare" | "einstein" | "stevejobs" | "socrates";

const personas = new Map<PersonaType, Persona>();
personas.set("shakespeare", new ShakespearePersona());
personas.set("einstein", new EinsteinPersona());
personas.set("stevejobs", new SteveJobsPersona());
personas.set("socrates", new SocratesPersona());

/**
 * Get a persona by type
 * @throws Error if persona type is not found
 */
export function getPersona(type: PersonaType): Persona {
  const persona = personas.get(type);
  if (!persona) {
    throw new Error(`Unknown persona type: ${type}`);
  }
  return persona;
}

/**
 * Get all available persona types
 */
export function getAvailablePersonas(): PersonaType[] {
  return Array.from(personas.keys());
}

export { Persona, AnalysisResult, TermEntry } from "./types.js";
