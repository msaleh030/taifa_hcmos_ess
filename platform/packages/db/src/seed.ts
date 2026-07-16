/**
 * Seeds a demo tenant with illustrative Taifa Mining & Civil data. Runs against
 * DIRECT_DATABASE_URL (the owner role) so it can create rows across tenants —
 * the runtime hcmos_app role could not, by design (RLS).
 *
 *   pnpm --filter @hcmos/db seed
 */
import { PrismaClient } from "../generated/client/index.js";
import { hashPassword } from "@hcmos/shared/password";
import { makeEmployeeNumber, type RoleCode } from "@hcmos/shared";

const url = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url } } });

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "Passw0rd!";

async function main(): Promise<void> {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "taifa" },
    update: {},
    create: { slug: "taifa", name: "Taifa Mining & Civil Ltd" },
  });

  const depts = ["Human Resources", "Finance", "Operations", "SHEQ"];
  const deptIds: Record<string, string> = {};
  for (const name of depts) {
    const existing = await prisma.department.findFirst({ where: { tenantId: tenant.id, name } });
    const d = existing ?? (await prisma.department.create({ data: { tenantId: tenant.id, name } }));
    deptIds[name] = d.id;
  }

  const pw = hashPassword(DEMO_PASSWORD);
  const users: Array<{ email: string; name: string; roles: RoleCode[] }> = [
    { email: "hrhead@taifamining.tz", name: "Omid Karembeck", roles: ["R08"] },
    { email: "hrofficer@taifamining.tz", name: "Ali Mbaruk", roles: ["R06"] },
    { email: "payroll@taifamining.tz", name: "Cecilia Mushi", roles: ["R09"] },
    { email: "finance@taifamining.tz", name: "Omar Said", roles: ["R10"] },
    { email: "sheq@taifamining.tz", name: "Amina Hassan", roles: ["R11"] },
    { email: "it@taifamining.tz", name: "Rajesh Pillai", roles: ["R13"] },
    { email: "employee@taifamining.tz", name: "Joseph Mlimani", roles: ["R01"] },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
      update: { displayName: u.name },
      create: {
        tenantId: tenant.id,
        email: u.email,
        displayName: u.name,
        passwordHash: pw,
      },
    });
    for (const roleCode of u.roles) {
      await prisma.userRole.upsert({
        where: { userId_roleCode: { userId: user.id, roleCode } },
        update: {},
        create: { userId: user.id, tenantId: tenant.id, roleCode },
      });
    }
  }

  const employees = [
    { first: "Joseph", last: "Mlimani", title: "Equipment Operator", dept: "Operations", salary: 620_000 },
    { first: "Grace", last: "Ndaki", title: "Team Leader", dept: "Operations", salary: 810_000 },
    { first: "Amina", last: "Hassan", title: "SHEQ Manager", dept: "SHEQ", salary: 1_450_000 },
    { first: "Cecilia", last: "Mushi", title: "Payroll Officer", dept: "Finance", salary: 1_180_000 },
    { first: "Neema", last: "Joseph", title: "Project HR Officer", dept: "Human Resources", salary: 990_000 },
  ];

  let seq = 1001;
  for (const e of employees) {
    const employeeNo = makeEmployeeNumber("MWD", seq++);
    const emp = await prisma.employee.upsert({
      where: { tenantId_employeeNo: { tenantId: tenant.id, employeeNo } },
      update: {},
      create: {
        tenantId: tenant.id,
        employeeNo,
        firstName: e.first,
        lastName: e.last,
        jobTitle: e.title,
        locationCode: "MWD",
        departmentId: deptIds[e.dept],
        contractType: "permanent",
        status: "active",
        startDate: new Date("2022-01-10"),
        basicSalary: e.salary,
      },
    });
    // Seed a current-cycle leave balance for liability calculations.
    await prisma.leaveBalance.upsert({
      where: { tenantId_employeeId_cycleYear: { tenantId: tenant.id, employeeId: emp.id, cycleYear: 2026 } },
      update: {},
      create: { tenantId: tenant.id, employeeId: emp.id, cycleYear: 2026, entitledDays: 28, takenDays: 6 },
    });
  }

  // Link the ESS demo login to Joseph Mlimani's employee record.
  const joseph = await prisma.employee.findFirst({ where: { tenantId: tenant.id, firstName: "Joseph", lastName: "Mlimani" } });
  if (joseph) {
    await prisma.user.update({
      where: { tenantId_email: { tenantId: tenant.id, email: "employee@taifamining.tz" } },
      data: { employeeId: joseph.id },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded tenant "${tenant.slug}" with ${users.length} users and ${employees.length} employees.`);
  console.log(`Demo password: ${DEMO_PASSWORD}  (login tenant slug: taifa)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
