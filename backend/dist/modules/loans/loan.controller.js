import { RequestStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
const loanTypes = [
    "Personal Loan",
    "Emergency Loan",
    "Medical/Family Support",
    "Other",
];
const valid = (v) => {
    const x = v;
    return (x &&
        loanTypes.includes(String(x.loanType)) &&
        Number(x.requestedAmount) > 0 &&
        typeof x.purpose === "string" &&
        x.purpose.trim() &&
        Number.isInteger(Number(x.repaymentMonths)) &&
        Number(x.repaymentMonths) > 0 &&
        Number(x.repaymentMonths) <= 60 &&
        Number.isInteger(Number(x.installments)) &&
        Number(x.installments) > 0 &&
        typeof x.preferredStartDate === "string" &&
        !Number.isNaN(new Date(x.preferredStartDate).getTime()));
};
function requestData(body) {
    return {
        loanType: String(body.loanType),
        requestedAmount: String(body.requestedAmount),
        purpose: String(body.purpose).trim(),
        repaymentMonths: Number(body.repaymentMonths),
        installments: Number(body.installments),
        preferredStartDate: new Date(String(body.preferredStartDate)),
        note: typeof body.note === "string" ? body.note.trim() || null : null,
        requestDate: typeof body.requestDate === "string" &&
            !Number.isNaN(new Date(body.requestDate).getTime())
            ? new Date(body.requestDate)
            : new Date(),
    };
}
export async function getLoans(c) {
    const requests = await prisma.loanRequest.findMany({
        where: { userId: c.get("authUser").sub },
        orderBy: { createdAt: "desc" },
    });
    return c.json({ requests });
}
export async function getLoan(c) {
    const request = await prisma.loanRequest.findFirst({
        where: { id: c.req.param("id"), userId: c.get("authUser").sub },
    });
    if (!request)
        return c.json({ message: "Loan request not found" }, 404);
    return c.json({ request });
}
export async function createLoan(c) {
    const body = await c.req.json().catch(() => null);
    if (!valid(body))
        return c.json({ message: "Please provide valid loan details" }, 400);
    const x = requestData(body);
    const request = await prisma.loanRequest.create({
        data: {
            userId: c.get("authUser").sub,
            loanType: x.loanType,
            requestedAmount: x.requestedAmount,
            purpose: x.purpose,
            repaymentMonths: x.repaymentMonths,
            installments: x.installments,
            preferredStartDate: x.preferredStartDate,
            note: x.note,
            requestDate: x.requestDate,
        },
    });
    return c.json({ request }, 201);
}
export async function updateLoan(c) {
    const body = await c.req.json().catch(() => null);
    if (!valid(body)) {
        return c.json({ message: "Please provide valid loan details" }, 400);
    }
    const result = await prisma.loanRequest.updateMany({
        where: {
            id: c.req.param("id"),
            userId: c.get("authUser").sub,
            status: RequestStatus.PENDING,
        },
        data: requestData(body),
    });
    if (!result.count) {
        return c.json({ message: "Only your pending loan request can be updated" }, 404);
    }
    const request = await prisma.loanRequest.findUnique({
        where: { id: c.req.param("id") },
    });
    return c.json({ request });
}
export async function deleteLoan(c) {
    const result = await prisma.loanRequest.deleteMany({
        where: {
            id: c.req.param("id"),
            userId: c.get("authUser").sub,
            status: RequestStatus.PENDING,
        },
    });
    if (!result.count) {
        return c.json({ message: "Only your pending loan request can be deleted" }, 404);
    }
    return c.json({ message: "Loan request deleted" });
}
