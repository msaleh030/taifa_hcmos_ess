import type { FastifyInstance } from "fastify";
import { withTenant } from "@hcmos/db";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  makeEmployeeNumber,
  type EmployeePublic,
  type Permission,
} from "@hcmos/shared";
import { audit } from "../lib/audit.js";
import type { RequestAuth } from "../plugins/auth.js";

type EmployeeRow = {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  locationCode: string;
  departmentId: string | null;
  contractType: string;
  status: string;
  startDate: Date;
  basicSalary: number | null;
  bankAccount: string | null;
  nationalId: string | null;
};

/**
 * Serialize an employee for the wire. Confidential fields are OMITTED entirely
 * (the design rule is "absent, not masked") unless the caller holds
 * employee:read:confidential — so the client cannot even tell a value exists.
 */
function serialize(row: EmployeeRow, perms: Set<Permission>): EmployeePublic {
  const base: EmployeePublic = {
    id: row.id,
    employeeNo: row.employeeNo,
    firstName: row.firstName,
    lastName: row.lastName,
    jobTitle: row.jobTitle,
    locationCode: row.locationCode,
    departmentId: row.departmentId,
    contractType: row.contractType as EmployeePublic["contractType"],
    status: row.status as EmployeePublic["status"],
    startDate: row.startDate.toISOString().slice(0, 10),
  };
  if (perms.has("employee:read:confidential")) {
    if (row.basicSalary !== null) base.basicSalary = row.basicSalary;
    if (row.bankAccount !== null) base.bankAccount = row.bankAccount;
    if (row.nationalId !== null) base.nationalId = row.nationalId;
  }
  return base;
}

async function nextEmployeeNo(
  tx: Parameters<Parameters<typeof withTenant>[1]>[0],
  tenantId: string,
  locationCode: string,
): Promise<string> {
  const rows = await tx.employee.findMany({
    where: { tenantId, locationCode },
    select: { employeeNo: true },
  });
  let max = 1000;
  for (const r of rows) {
    const m = /-(\d+)$/.exec(r.employeeNo);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return makeEmployeeNumber(locationCode, max + 1);
}

export async function employeeRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/employees",
    { preHandler: [app.authenticate, app.requirePermission("employee:read")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const rows = await withTenant(auth.tenantId, (tx) =>
        tx.employee.findMany({ where: { tenantId: auth.tenantId }, orderBy: { employeeNo: "asc" } }),
      );
      return reply.send({ data: rows.map((r) => serialize(r, auth.permissions)) });
    },
  );

  app.get(
    "/employees/:id",
    { preHandler: [app.authenticate, app.requirePermission("employee:read")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const row = await withTenant(auth.tenantId, (tx) => tx.employee.findUnique({ where: { id } }));
      if (!row || row.tenantId !== auth.tenantId) {
        return reply.code(404).send({ error: "not_found", message: "Employee not found" });
      }
      return reply.send({ data: serialize(row, auth.permissions) });
    },
  );

  app.post(
    "/employees",
    { preHandler: [app.authenticate, app.requirePermission("employee:write")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const parsed = employeeCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid employee", details: parsed.error.issues });
      }
      const input = parsed.data;
      const canConfidential = auth.permissions.has("employee:read:confidential");

      const created = await withTenant(auth.tenantId, async (tx) => {
        const employeeNo = await nextEmployeeNo(tx, auth.tenantId, input.locationCode);
        const row = await tx.employee.create({
          data: {
            tenantId: auth.tenantId,
            employeeNo,
            firstName: input.firstName,
            lastName: input.lastName,
            jobTitle: input.jobTitle,
            locationCode: input.locationCode,
            departmentId: input.departmentId ?? null,
            contractType: input.contractType,
            startDate: new Date(input.startDate),
            // Confidential fields only persisted if the caller may see them.
            basicSalary: canConfidential ? input.basicSalary ?? null : null,
            bankAccount: canConfidential ? input.bankAccount ?? null : null,
            nationalId: canConfidential ? input.nationalId ?? null : null,
          },
        });
        await audit(tx, auth.tenantId, {
          actorUserId: auth.userId,
          action: "employee.create",
          entity: "employee",
          entityId: row.id,
          data: { employeeNo: row.employeeNo },
        });
        return row;
      });
      return reply.code(201).send({ data: serialize(created, auth.permissions) });
    },
  );

  app.patch(
    "/employees/:id",
    { preHandler: [app.authenticate, app.requirePermission("employee:write")] },
    async (req, reply) => {
      const auth = req.auth as RequestAuth;
      const { id } = req.params as { id: string };
      const parsed = employeeUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "bad_request", message: "Invalid update", details: parsed.error.issues });
      }
      const input = parsed.data;
      const canConfidential = auth.permissions.has("employee:read:confidential");

      const updated = await withTenant(auth.tenantId, async (tx) => {
        const existing = await tx.employee.findUnique({ where: { id } });
        if (!existing || existing.tenantId !== auth.tenantId) return null;
        const row = await tx.employee.update({
          where: { id },
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            jobTitle: input.jobTitle,
            departmentId: input.departmentId,
            contractType: input.contractType,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            // Confidential edits ignored unless permitted.
            basicSalary: canConfidential ? input.basicSalary : undefined,
            bankAccount: canConfidential ? input.bankAccount : undefined,
            nationalId: canConfidential ? input.nationalId : undefined,
          },
        });
        await audit(tx, auth.tenantId, {
          actorUserId: auth.userId,
          action: "employee.update",
          entity: "employee",
          entityId: row.id,
        });
        return row;
      });
      if (!updated) return reply.code(404).send({ error: "not_found", message: "Employee not found" });
      return reply.send({ data: serialize(updated, auth.permissions) });
    },
  );
}
