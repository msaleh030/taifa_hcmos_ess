import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import type { Permission } from "@hcmos/shared";
import { verifyAccess } from "../lib/jwt.js";

export interface RequestAuth {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: Set<Permission>;
  /** True when the token is an MFA-setup token (no data access). */
  mfaPending: boolean;
}

declare module "fastify" {
  interface FastifyRequest {
    auth?: RequestAuth;
  }
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requirePermission: (
      perm: Permission,
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authPlugin = fp(async function authPlugin(app: FastifyInstance) {
  app.decorate("authenticate", async function authenticate(req: FastifyRequest, reply: FastifyReply) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      await reply.code(401).send({ error: "unauthorized", message: "Missing bearer token" });
      return;
    }
    try {
      const claims = verifyAccess(header.slice(7));
      req.auth = {
        userId: claims.sub,
        tenantId: claims.tid,
        roles: claims.roles,
        permissions: new Set(claims.perms as Permission[]),
        mfaPending: claims.mfaPending === true,
      };
    } catch {
      await reply.code(401).send({ error: "unauthorized", message: "Invalid or expired token" });
    }
  });

  app.decorate("requirePermission", function requirePermission(perm: Permission) {
    return async function guard(req: FastifyRequest, reply: FastifyReply) {
      if (!req.auth) {
        await reply.code(401).send({ error: "unauthorized", message: "Not authenticated" });
        return;
      }
      if (!req.auth.permissions.has(perm)) {
        await reply
          .code(403)
          .send({ error: "forbidden", message: `Missing permission: ${perm}` });
      }
    };
  });
});
