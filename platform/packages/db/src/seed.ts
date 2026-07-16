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
  const emps = await prisma.employee.findMany({ where: { tenantId: tenant.id } });
  const byName = (f: string) => emps.find((e) => e.firstName === f);
  const joseph = byName("Joseph");
  const grace = byName("Grace");
  if (joseph) {
    await prisma.user.update({
      where: { tenantId_email: { tenantId: tenant.id, email: "employee@taifamining.tz" } },
      data: { employeeId: joseph.id },
    });
  }

  // ── Illustrative operational data so every module renders populated ────────
  const hrUser = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email: "hrhead@taifamining.tz" } } });
  const empUser = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email: "employee@taifamining.tz" } } });
  const D = (s: string) => new Date(s);

  // Department head + codes.
  if (grace) {
    const ops = await prisma.department.findFirst({ where: { tenantId: tenant.id, name: "Operations" } });
    if (ops) await prisma.department.update({ where: { id: ops.id }, data: { managerId: grace.id, code: "OPS" } });
  }
  for (const [name, code] of [["Human Resources", "HR"], ["Finance", "FIN"], ["SHEQ", "SHEQ"]] as const) {
    const d = await prisma.department.findFirst({ where: { tenantId: tenant.id, name } });
    if (d && !d.code) await prisma.department.update({ where: { id: d.id }, data: { code } });
  }

  // PPE + medicals for the whole workforce (drives HSEQ compliance KPIs).
  if ((await prisma.ppeIssue.count({ where: { tenantId: tenant.id } })) === 0) {
    for (const e of emps) {
      await prisma.ppeIssue.create({ data: { tenantId: tenant.id, employeeId: e.id, item: "helmet", issuedOn: D("2026-01-15"), expiresOn: D("2027-01-15") } });
      await prisma.medicalRecord.create({ data: { tenantId: tenant.id, employeeId: e.id, type: "osha", validFrom: D("2026-01-10"), validTo: D("2026-12-31") } });
    }
  }

  // One-time operational rows (idempotent guard).
  if ((await prisma.leaveRequest.count({ where: { tenantId: tenant.id } })) === 0) {
    if (joseph && empUser && hrUser) {
      await prisma.leaveRequest.create({ data: { tenantId: tenant.id, employeeId: joseph.id, type: "annual", startDate: D("2026-07-06"), endDate: D("2026-07-10"), days: 5, status: "approved", requestedBy: empUser.id, decidedBy: hrUser.id, decidedAt: D("2026-07-02") } });
      await prisma.leaveRequest.create({ data: { tenantId: tenant.id, employeeId: joseph.id, type: "sick", startDate: D("2026-07-20"), endDate: D("2026-07-21"), days: 2, status: "pending", requestedBy: empUser.id } });
      for (const day of ["2026-07-13", "2026-07-14", "2026-07-15"]) {
        await prisma.attendanceRecord.create({ data: { tenantId: tenant.id, employeeId: joseph.id, workDate: D(day), clockIn: D(`${day}T07:00:00Z`), clockOut: D(`${day}T16:30:00Z`), minutes: 570, source: "biometric" } });
      }
      await prisma.performanceReview.create({ data: { tenantId: tenant.id, employeeId: joseph.id, cycle: "2026-Q2", reviewerId: hrUser.id, rating: 4, strengths: "Reliable operator, strong safety record", improvements: "Take on mentoring", status: "submitted", submittedAt: D("2026-07-01") } });
    }
    if (grace && hrUser) {
      await prisma.performanceReview.create({ data: { tenantId: tenant.id, employeeId: grace.id, cycle: "2026-Q2", reviewerId: hrUser.id, rating: 5, strengths: "Excellent team leadership", status: "acknowledged", submittedAt: D("2026-06-28"), acknowledgedAt: D("2026-06-30") } });
    }
    // Training records (drive training compliance + KPI).
    if (joseph && grace) {
      await prisma.trainingRecord.create({ data: { tenantId: tenant.id, employeeId: joseph.id, course: "Working at Heights", provider: "OSHA", status: "completed", completedOn: D("2026-02-10"), expiresOn: D("2027-02-10") } });
      await prisma.trainingRecord.create({ data: { tenantId: tenant.id, employeeId: joseph.id, course: "Defensive Driving", provider: "NIT", status: "planned" } });
      await prisma.trainingRecord.create({ data: { tenantId: tenant.id, employeeId: grace.id, course: "First Aid Level 2", provider: "Red Cross", status: "completed", completedOn: D("2026-03-05"), expiresOn: D("2026-09-05") } });
    }
    if (hrUser) {
      await prisma.hseqIncident.create({ data: { tenantId: tenant.id, locationCode: "DAR", category: "injury", severity: "lti", description: "Hand laceration at Dar yard", occurredOn: D("2026-06-19"), status: "closed", reportedBy: hrUser.id } });
      await prisma.hseqIncident.create({ data: { tenantId: tenant.id, locationCode: "MWD", category: "near_miss", severity: "medium", description: "Vehicle reversing near pedestrians", occurredOn: D("2026-07-11"), status: "investigating", reportedBy: hrUser.id } });
      await prisma.hseqIncident.create({ data: { tenantId: tenant.id, locationCode: "MWD", category: "environmental", severity: "low", description: "Minor hydraulic spill contained", occurredOn: D("2026-07-14"), status: "open", reportedBy: hrUser.id } });
    }
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
