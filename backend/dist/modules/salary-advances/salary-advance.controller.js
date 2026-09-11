import { RequestStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
const valid = (v) => {
    const x = v;
    return (x &&
        Number(x.requestedAmount) > 0 &&
        typeof x.reason === "string" &&
        x.reason.trim() &&
        Number.isInteger(Number(x.repaymentMonths)) &&
        Number(x.repaymentMonths) > 0 &&
        Number(x.repaymentMonths) <= 36);
};
function requestData(body) {
    return {
        requestedAmount: String(body.requestedAmount),
        reason: String(body.reason).trim(),
        repaymentMonths: Number(body.repaymentMonths),
        note: typeof body.note === "string" ? body.note.trim() || null : null,
        requestDate: typeof body.requestDate === "string" &&
            !Number.isNaN(new Date(body.requestDate).getTime())
            ? new Date(body.requestDate)
            : new Date(),
    };
}
export async function getSalaryAdvances(c) {
    const search = c.req.query("search")?.trim();
    const requests = await prisma.salaryAdvanceRequest.findMany({
        where: search
            ? { userId: c.get("authUser").sub, OR: [{ reason: { contains: search, mode: "insensitive" } }, { note: { contains: search, mode: "insensitive" } }] }
            : { userId: c.get("authUser").sub },
        orderBy: { createdAt: "desc" },
    });
    return c.json({ requests });
}
export async function createSalaryAdvance(c) {
    const body = await c.req.json().catch(() => null);
    if (!valid(body))
        return c.json({
            message: "Amount, reason, and a repayment period from 1 to 36 months are required",
        }, 400);
    const x = requestData(body);
    const request = await prisma.salaryAdvanceRequest.create({
        data: {
            userId: c.get("authUser").sub,
            requestedAmount: x.requestedAmount,
            reason: x.reason,
            repaymentMonths: x.repaymentMonths,
            note: x.note,
            requestDate: x.requestDate,
        },
    });
    return c.json({ request }, 201);
}
export async function updateSalaryAdvance(c) {
    const body = await c.req.json().catch(() => null);
    if (!valid(body)) {
        return c.json({ message: "Please provide a valid salary advance request" }, 400);
    }
    const result = await prisma.salaryAdvanceRequest.updateMany({
        where: {
            id: c.req.param("id"),
            userId: c.get("authUser").sub,
            status: RequestStatus.PENDING,
        },
        data: requestData(body),
    });
    if (!result.count) {
        return c.json({ message: "Only your pending salary advance request can be updated" }, 404);
    }
    const request = await prisma.salaryAdvanceRequest.findUnique({
        where: { id: c.req.param("id") },
    });
    return c.json({ request });
}
export async function cancelSalaryAdvance(c) {
    const result = await prisma.salaryAdvanceRequest.updateMany({
        where: {
            id: c.req.param("id"),
            userId: c.get("authUser").sub,
            status: RequestStatus.PENDING,
        },
        data: { status: RequestStatus.CANCELLED },
    });
    if (!result.count)
        return c.json({ message: "Only your pending salary advance request can be cancelled" }, 404);
    return c.json({ message: "Salary advance request cancelled" });
}
export async function deleteSalaryAdvance(c) {
    const result = await prisma.salaryAdvanceRequest.deleteMany({
        where: {
            id: c.req.param("id"),
            userId: c.get("authUser").sub,
            status: RequestStatus.PENDING,
        },
    });
    if (!result.count) {
        return c.json({ message: "Only your pending salary advance request can be deleted" }, 404);
    }
    return c.json({ message: "Salary advance request deleted" });
}
