import type { Context } from "hono";
import { prisma } from "../../lib/prisma.js";
import type { AppEnv } from "../auth/auth.types.js";
const types = [
  "Resume/CV",
  "National ID",
  "Passport",
  "Educational Certificate",
  "Employment Document",
  "Contract",
  "Bank Document",
  "Other",
];
const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
export async function getDocuments(c: Context<AppEnv>) {
  const documents = await prisma.userDocument.findMany({
    where: { userId: c.get("authUser").sub },
    orderBy: { createdAt: "desc" },
  });
  return c.json({ documents });
}
export async function createDocument(c: Context<AppEnv>) {
  const body = (await c.req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (
    !body ||
    !types.includes(String(body.documentType)) ||
    typeof body.title !== "string" ||
    !body.title.trim() ||
    typeof body.fileUrl !== "string" ||
    !body.fileUrl.startsWith("https://") ||
    !allowedMimeTypes.includes(String(body.mimeType)) ||
    !Number.isInteger(body.fileSize) ||
    Number(body.fileSize) < 1 ||
    Number(body.fileSize) > 10 * 1024 * 1024
  )
    return c.json(
      {
        message:
          "Provide a valid document. Only PDF, JPG, and PNG files up to 10 MB are allowed.",
      },
      400,
    );
  const document = await prisma.userDocument.create({
    data: {
      userId: c.get("authUser").sub,
      title: body.title.trim(),
      documentType: String(body.documentType),
      description:
        typeof body.description === "string"
          ? body.description.trim() || null
          : null,
      fileUrl: body.fileUrl,
      fileName: String(body.fileName || body.title),
      mimeType: String(body.mimeType),
      fileSize: Number(body.fileSize),
    },
  });
  return c.json({ document }, 201);
}
export async function deleteDocument(c: Context<AppEnv>) {
  const result = await prisma.userDocument.deleteMany({
    where: { id: c.req.param("id")!, userId: c.get("authUser").sub },
  });
  if (!result.count) return c.json({ message: "Document not found" }, 404);
  return c.json({ message: "Document deleted" });
}
