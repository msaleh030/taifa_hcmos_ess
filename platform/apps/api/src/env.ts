import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_HOST: z.string().default("0.0.0.0"),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("30d"),
  MFA_ISSUER: z.string().default("HCMOS"),

  EXACT_BASE_URL: z.string().default("https://start.exactonline.nl"),
  EXACT_CLIENT_ID: z.string().default(""),
  EXACT_CLIENT_SECRET: z.string().default(""),
  EXACT_REDIRECT_URI: z.string().default(""),
  EXACT_DIVISION: z.string().default(""),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function corsOrigins(env: Env): string[] {
  return env.WEB_ORIGIN.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
