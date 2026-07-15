import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { loadEnv, corsOrigins } from "./env.js";
import { authPlugin } from "./plugins/auth.js";
import { authRoutes } from "./routes/auth.js";
import { employeeRoutes } from "./routes/employees.js";
import { payrollRoutes } from "./routes/payroll.js";
import { labourRoutes } from "./routes/labour.js";
import { auditRoutes } from "./routes/audit.js";
import { integrationRoutes } from "./routes/integrations.js";

export async function buildApp(): Promise<FastifyInstance> {
  const env = loadEnv();
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
    trustProxy: true, // behind nginx on the VPS
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: corsOrigins(env), credentials: true });
  await app.register(rateLimit, {
    max: env.NODE_ENV === "test" ? 1_000_000 : 300,
    timeWindow: "1 minute",
  });
  await app.register(authPlugin);

  app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

  await app.register(
    async (api) => {
      await authRoutes(api);
      await employeeRoutes(api);
      await payrollRoutes(api);
      await labourRoutes(api);
      await auditRoutes(api);
      await integrationRoutes(api);
    },
    { prefix: "/api" },
  );

  return app;
}
