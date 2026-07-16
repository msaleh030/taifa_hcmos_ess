import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withTenant } from "@hcmos/db";
import { audit } from "../lib/audit.js";
import type { RequestAuth } from "../plugins/auth.js";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  code: z.string().max(20).optional(),
  parentId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
});
const updateSchema = createSchema.partial();

/**
 * Organization structure: departments as a tree, each optionally headed by an
 * employee. Anyone with employee:read can view the org; org:manage edits it.
 */
export async function orgRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/org/departments",
    { preHandler: [app.authenticate, app.requirePermission("employee:read")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const data = await withTenant(auth.tenantId, async (tx) => {
        const depts = await tx.department.findMany({
          where: { tenantId: auth.tenantId },
          include: { _count: { select: { employees: true } }, manager: { select: { firstName: true, lastName: true } } },
          orderBy: { name: "asc" },
        });
        return depts.map((d) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          parentId: d.parentId,
          managerId: d.managerId,
          managerName: d.manager ? `${d.manager.firstName} ${d.manager.lastName}` : null,
          headcount: d._count.employees,
        }));
      });
      return reply.send({ data });
    },
  );

  app.post(
    "/org/departments",
    { preHandler: [app.authenticate, app.requirePermission("org:manage")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid department", details: parsed.error.issues });
      const created = await withTenant(auth.tenantId, async (tx) => {
        const dept = await tx.department.create({
          data: {
            tenantId: auth.tenantId,
            name: parsed.data.name,
            code: parsed.data.code ?? null,
            parentId: parsed.data.parentId ?? null,
            managerId: parsed.data.managerId ?? null,
          },
        });
        await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "org.dept.create", entity: "department", entityId: dept.id, data: { name: dept.name } });
        return dept;
      });
      return reply.code(201).send({ data: created });
    },
  );

  app.patch(
    "/org/departments/:id",
    { preHandler: [app.authenticate, app.requirePermission("org:manage")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) return reply.code(400).send({ error: "bad_request", message: "Invalid update" });
      const outcome = await withTenant(auth.tenantId, async (tx) => {
        const existing = await tx.department.findUnique({ where: { id } });
        if (!existing || existing.tenantId !== auth.tenantId) return { code: 404 as const };
        if (parsed.data.parentId === id) return { code: 400 as const, message: "A department cannot be its own parent" };
        const updated = await tx.department.update({
          where: { id },
          data: {
            name: parsed.data.name,
            code: parsed.data.code,
            parentId: parsed.data.parentId,
            managerId: parsed.data.managerId,
          },
        });
        await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "org.dept.update", entity: "department", entityId: id });
        return { code: 200 as const, updated };
      });
      if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Department not found" });
      if (outcome.code === 400) return reply.code(400).send({ error: "bad_request", message: outcome.message });
      return reply.send({ data: outcome.updated });
    },
  );

  app.delete(
    "/org/departments/:id",
    { preHandler: [app.authenticate, app.requirePermission("org:manage")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const outcome = await withTenant(auth.tenantId, async (tx) => {
        const dept = await tx.department.findUnique({
          where: { id },
          include: { _count: { select: { employees: true, children: true } } },
        });
        if (!dept || dept.tenantId !== auth.tenantId) return { code: 404 as const };
        if (dept._count.employees > 0 || dept._count.children > 0) {
          return { code: 409 as const, message: "Reassign employees and sub-departments first" };
        }
        await tx.department.delete({ where: { id } });
        await audit(tx, auth.tenantId, { actorUserId: auth.userId, action: "org.dept.delete", entity: "department", entityId: id });
        return { code: 204 as const };
      });
      if (outcome.code === 404) return reply.code(404).send({ error: "not_found", message: "Department not found" });
      if (outcome.code === 409) return reply.code(409).send({ error: "conflict", message: outcome.message });
      return reply.code(204).send();
    },
  );
}
