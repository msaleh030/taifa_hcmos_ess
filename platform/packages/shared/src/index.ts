export * from "./roles.js";
export * from "./employee.js";
export * from "./auth.js";

/** Illustrative Tanzania location codes used by the seed and employee numbering. */
export const LOCATIONS = [
  { code: "MWD", name: "Mwadui" },
  { code: "DAR", name: "Dar es Salaam Yard" },
  { code: "GEI", name: "Geita" },
  { code: "SHY", name: "Shinyanga" },
  { code: "ARU", name: "Arusha" },
] as const;

export const CURRENCY = "TZS" as const;

/** Standard envelope for API errors. */
export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
