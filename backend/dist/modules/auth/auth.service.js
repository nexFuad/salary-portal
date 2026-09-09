import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
const refreshTokenLifetimeInMilliseconds = 1000 * 60 * 60 * 24 * 30;
function createRefreshToken() {
    return randomBytes(48).toString("base64url");
}
function hashRefreshToken(token) {
    return createHash("sha256").update(token).digest("hex");
}
export function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
        employeeId: user.employeeId,
        company: user.company,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
    };
}
export async function authenticateUser(employeeId, company, password) {
    const user = await prisma.user.findUnique({
        where: { employeeId_company: { employeeId, company } },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return null;
    }
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });
    return updatedUser;
}
export async function findPublicUserById(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toPublicUser(user) : null;
}
export async function createRefreshSession(userId, persistent) {
    const refreshToken = createRefreshToken();
    const expiresAt = new Date(Date.now() + refreshTokenLifetimeInMilliseconds);
    await prisma.refreshSession.create({
        data: {
            userId,
            persistent,
            tokenHash: hashRefreshToken(refreshToken),
            expiresAt,
        },
    });
    return refreshToken;
}
export async function rotateRefreshSession(token) {
    const refreshSession = await prisma.refreshSession.findUnique({
        where: { tokenHash: hashRefreshToken(token) },
        include: { user: true },
    });
    if (!refreshSession || refreshSession.expiresAt <= new Date()) {
        if (refreshSession) {
            await prisma.refreshSession.delete({ where: { id: refreshSession.id } });
        }
        return null;
    }
    const refreshToken = createRefreshToken();
    await prisma.refreshSession.update({
        where: { id: refreshSession.id },
        data: {
            tokenHash: hashRefreshToken(refreshToken),
            expiresAt: new Date(Date.now() + refreshTokenLifetimeInMilliseconds),
        },
    });
    return {
        user: refreshSession.user,
        refreshToken,
        persistent: refreshSession.persistent,
    };
}
export async function revokeRefreshSession(token) {
    await prisma.refreshSession.deleteMany({
        where: { tokenHash: hashRefreshToken(token) },
    });
}
