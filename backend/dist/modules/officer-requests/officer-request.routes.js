import { Hono } from "hono";
import { RequestStatus, LeaveRequestStatus, DocumentStatus, } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { refreshLoanRepaymentProgress } from "../loans/loan.service.js";
import { getOfficerDashboard } from "../officer-dashboard/officer-dashboard.service.js";
const routes = new Hono();
routes.use("*", requireAuth, requireRole("OFFICER"));
const company = (c) => c.get("authUser").company;
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
routes.get("/dashboard", async (c) => c.json({ dashboard: await getOfficerDashboard(c.get("authUser").company) }));
routes.get("/leave", async (c) => c.json({
    requests: await prisma.leaveRequest.findMany({
        include: { user },
        orderBy: { createdAt: "desc" },
    }),
}));
routes.get("/salary-advances", async (c) => c.json({
    requests: await prisma.salaryAdvanceRequest.findMany({
        include: { user },
        orderBy: { createdAt: "desc" },
    }),
}));
routes.get("/loans", async (c) => {
    await refreshLoanRepaymentProgress();
    return c.json({
        requests: await prisma.loanRequest.findMany({
            include: { user },
            orderBy: { createdAt: "desc" },
        }),
    });
});
routes.get("/attendance", async (c) => c.json({
    records: await prisma.attendanceRecord.findMany({
        include: { user },
        orderBy: { workDate: "desc" },
    }),
}));
routes.delete("/attendance/:id", async (c) => {
    const result = await prisma.attendanceRecord.deleteMany({
        where: { id: c.req.param("id") },
    });
    return result.count
        ? c.json({ message: "Attendance deleted" })
        : c.json({ message: "Attendance not found" }, 404);
});
routes.get("/documents", async (c) => c.json({
    documents: await prisma.userDocument.findMany({
        include: { user },
        orderBy: { createdAt: "desc" },
    }),
}));
routes.post("/documents", async (c) => {
    const b = (await c.req.json().catch(() => null));
    if (!b?.title ||
        !b?.documentType ||
        !b?.fileUrl ||
        !b?.mimeType ||
        !b?.fileSize)
        return c.json({ message: "Complete document information is required." }, 400);
    const document = await prisma.userDocument.create({
        data: {
            userId: c.get("authUser").sub,
            title: String(b.title),
            documentType: String(b.documentType),
            description: b.description ? String(b.description) : null,
            fileUrl: String(b.fileUrl),
            fileName: String(b.fileName || b.title),
            mimeType: String(b.mimeType),
            fileSize: Number(b.fileSize),
        },
    });
    return c.json({ document }, 201);
});
routes.delete("/documents/:id", async (c) => {
    const result = await prisma.userDocument.deleteMany({
        where: { id: c.req.param("id") },
    });
    return result.count
        ? c.json({ message: "Document deleted" })
        : c.json({ message: "Document not found" }, 404);
});
routes.patch("/documents/:id/status", async (c) => {
    const status = (await c.req.json().catch(() => null))?.status;
    const map = {
        APPROVED: DocumentStatus.VERIFIED,
        REJECTED: DocumentStatus.REJECTED,
    };
    if (!map[status])
        return c.json({ message: "Invalid document status" }, 400);
    const result = await prisma.userDocument.updateMany({
        where: { id: c.req.param("id"), status: DocumentStatus.PENDING },
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
        where: { id: c.req.param("id"), status: LeaveRequestStatus.PENDING },
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
        },
        data: { status },
    });
    return r.count
        ? c.json({ message: "Loan updated" })
        : c.json({ message: "Request not found or already reviewed" }, 404);
});
export default routes;
