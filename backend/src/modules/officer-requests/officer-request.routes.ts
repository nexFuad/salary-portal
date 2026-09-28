import { Hono, type Context } from "hono";
import {
  RequestStatus,
  LeaveRequestStatus,
  DocumentStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import type { AppEnv } from "../auth/auth.types.js";
import { refreshLoanRepaymentProgress } from "../loans/loan.service.js";
import { getOfficerDashboard } from "../officer-dashboard/officer-dashboard.service.js";

const routes = new Hono<AppEnv>();
routes.use("*", requireAuth, requireRole("OFFICER"));
const company = (c: Context<AppEnv>) => c.get("authUser").company;
function pagination(c: Context<AppEnv>) {
  const page = Number(c.req.query("page") ?? 1);
  const pageSize = Number(c.req.query("pageSize") ?? 10);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    (page - 1) * pageSize > 2_147_483_647
  ) return null;
  return { page, pageSize, skip: (page - 1) * pageSize };
}
const user = {
  select: {
    name: true,
    employeeId: true,
    department: true,
    profilePic: true,
    workStartTime: true,
    workEndTime: true,
  },
};
routes.get("/dashboard", async (c) =>
  c.json({ dashboard: await getOfficerDashboard(c.get("authUser").company) }),
);
routes.get("/leave", async (c) => {
  const paging = pagination(c);
  if (!paging) return c.json({ message: "Choose a valid page and pageSize (1–100)." }, 400);
  const where = { user: { company: company(c) } };
  const [requests, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      include: { user },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: paging.skip,
      take: paging.pageSize,
    }),
    prisma.leaveRequest.count({ where }),
  ]);
  return c.json({ requests, total, page: paging.page, pageSize: paging.pageSize });
});
routes.get("/salary-advances", async (c) => {
  const paging = pagination(c);
  if (!paging) return c.json({ message: "Choose a valid page and pageSize (1–100)." }, 400);
  const where = { user: { company: company(c) } };
  const [requests, total] = await Promise.all([
    prisma.salaryAdvanceRequest.findMany({
      where,
      include: { user },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: paging.skip,
      take: paging.pageSize,
    }),
    prisma.salaryAdvanceRequest.count({ where }),
  ]);
  return c.json({ requests, total, page: paging.page, pageSize: paging.pageSize });
});
routes.get("/loans", async (c) => {
  const paging = pagination(c);
  if (!paging) return c.json({ message: "Choose a valid page and pageSize (1–100)." }, 400);
  await refreshLoanRepaymentProgress();
  const where = { user: { company: company(c) } };
  const [requests, total] = await Promise.all([
    prisma.loanRequest.findMany({
      where,
      include: { user },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: paging.skip,
      take: paging.pageSize,
    }),
    prisma.loanRequest.count({ where }),
  ]);
  return c.json({ requests, total, page: paging.page, pageSize: paging.pageSize });
});
routes.get("/attendance", async (c) => {
  const paging = pagination(c);
  if (!paging) return c.json({ message: "Choose a valid page and pageSize (1–100)." }, 400);
  const where = { user: { company: company(c) } };
  const [records, total] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where,
      include: { user },
      orderBy: [{ workDate: "desc" }, { id: "desc" }],
      skip: paging.skip,
      take: paging.pageSize,
    }),
    prisma.attendanceRecord.count({ where }),
  ]);
  return c.json({ records, total, page: paging.page, pageSize: paging.pageSize });
});
routes.delete("/attendance/:id", async (c) => {
  const result = await prisma.attendanceRecord.deleteMany({
    where: { id: c.req.param("id"), user: { company: company(c) } },
  });
  return result.count
    ? c.json({ message: "Attendance deleted" })
    : c.json({ message: "Attendance not found" }, 404);
});
routes.get("/documents", async (c) => {
  const paging = pagination(c);
  if (!paging) return c.json({ message: "Choose a valid page and pageSize (1–100)." }, 400);
  const search = c.req.query("search")?.trim();
  const where: Prisma.UserDocumentWhereInput = {
    user: { company: company(c) },
    ...(search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { documentType: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { employeeId: { contains: search, mode: "insensitive" } } },
      ],
    } : {}),
  };
  const [documents, total] = await Promise.all([
    prisma.userDocument.findMany({
      where,
      include: { user },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: paging.skip,
      take: paging.pageSize,
    }),
    prisma.userDocument.count({ where }),
  ]);
  return c.json({ documents, total, page: paging.page, pageSize: paging.pageSize });
});
routes.post("/documents", async (c) => {
  const b = (await c.req.json().catch(() => null)) as Record<string, unknown> | null;
  if (
    !b ||
    typeof b.title !== "string" || !b.title.trim() ||
    typeof b.documentType !== "string" || !b.documentType.trim() ||
    typeof b.fileUrl !== "string" || !b.fileUrl.startsWith("https://") ||
    !["application/pdf", "image/jpeg", "image/png"].includes(String(b.mimeType)) ||
    !Number.isInteger(b.fileSize) || Number(b.fileSize) < 1 || Number(b.fileSize) > 10 * 1024 * 1024
  )
    return c.json(
      { message: "Complete document information is required." },
      400,
    );
  const document = await prisma.userDocument.create({
    data: {
      userId: c.get("authUser").sub,
      title: b.title.trim(),
      documentType: b.documentType.trim(),
      description: typeof b.description === "string" ? b.description.trim() || null : null,
      fileUrl: b.fileUrl,
      fileName: typeof b.fileName === "string" && b.fileName.trim() ? b.fileName.trim() : b.title.trim(),
      mimeType: String(b.mimeType),
      fileSize: Number(b.fileSize),
    },
  });
  return c.json({ document }, 201);
});
routes.delete("/documents/:id", async (c) => {
  const result = await prisma.userDocument.deleteMany({
    where: { id: c.req.param("id"), user: { company: company(c) } },
  });
  return result.count
    ? c.json({ message: "Document deleted" })
    : c.json({ message: "Document not found" }, 404);
});
routes.patch("/documents/:id/status", async (c) => {
  const status = ((await c.req.json().catch(() => null)) as any)?.status;
  const map: any = {
    APPROVED: DocumentStatus.VERIFIED,
    REJECTED: DocumentStatus.REJECTED,
  };
  if (!map[status]) return c.json({ message: "Invalid document status" }, 400);
  const result = await prisma.userDocument.updateMany({
    where: { id: c.req.param("id"), status: DocumentStatus.PENDING, user: { company: company(c) } },
    data: { status: map[status] },
  });
  return result.count
    ? c.json({ message: "Document status updated" })
    : c.json({ message: "Document not found" }, 404);
});
routes.patch("/leave/:id/status", async (c) => {
  const status = (await c.req.json()).status;
  if (!["APPROVED", "REJECTED"].includes(status))
    return c.json({ message: "Invalid status" }, 400);
  const r = await prisma.leaveRequest.updateMany({
    where: { id: c.req.param("id"), status: LeaveRequestStatus.PENDING, user: { company: company(c) } },
    data: { status },
  });
  return r.count
    ? c.json({ message: "Leave request updated" })
    : c.json({ message: "Request not found or already reviewed" }, 404);
});
routes.patch("/salary-advances/:id/status", async (c) => {
  const status = (await c.req.json()).status;
  if (!["APPROVED", "REJECTED"].includes(status))
    return c.json({ message: "Invalid status" }, 400);
  const r = await prisma.salaryAdvanceRequest.updateMany({
    where: {
      id: c.req.param("id"),
      status: RequestStatus.PENDING,
      user: { company: company(c) },
    },
    data: { status },
  });
  return r.count
    ? c.json({ message: "Salary advance updated" })
    : c.json({ message: "Request not found or already reviewed" }, 404);
});
routes.patch("/loans/:id/status", async (c) => {
  const status = (await c.req.json()).status;
  if (!["APPROVED", "REJECTED"].includes(status))
    return c.json({ message: "Invalid status" }, 400);
  const r = await prisma.loanRequest.updateMany({
    where: {
      id: c.req.param("id"),
      status: RequestStatus.PENDING,
      user: { company: company(c) },
    },
    data: { status },
  });
  return r.count
    ? c.json({ message: "Loan updated" })
    : c.json({ message: "Request not found or already reviewed" }, 404);
});
export default routes;
