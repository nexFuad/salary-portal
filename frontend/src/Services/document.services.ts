import { createAuthenticatedApi } from "@/Services/authenticated-api";
import { apiBaseUrl } from "@/Services/api-base-url";
import { uploadDocument } from "@/Services/upload.services";
import type { OfficerDocument, OfficerDocumentInput, OfficerPage } from "@/Types/officer-requests";
import type { UserDocument } from "@/Types/om";
import type { PageFilters, PageResult } from "@/Types/pagination";

type DocumentDetails = {
  title: string;
  documentType: string;
  description: string;
};

type UploadedDocumentFile = Pick<
  OfficerDocumentInput,
  "fileUrl" | "fileName" | "mimeType" | "fileSize"
>;

const allowedDocumentTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxDocumentSize = 10 * 1024 * 1024;

const employeeDocumentsApi = createAuthenticatedApi({
  baseURL: `${apiBaseUrl}/api/documents`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const officerDocumentsApi = createAuthenticatedApi({
  baseURL: `${apiBaseUrl}/api/officer-requests/documents`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function validateDocumentFile(file: File) {
  if (!allowedDocumentTypes.includes(file.type) || file.size > maxDocumentSize) {
    throw new Error("Only PDF, JPG, and PNG files up to 10 MB are allowed.");
  }
}

async function uploadDocumentDetails(file: File): Promise<UploadedDocumentFile> {
  validateDocumentFile(file);
  return {
    fileUrl: await uploadDocument(file),
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  };
}

export const documentService = {
  list: async (filters: PageFilters): Promise<PageResult<UserDocument>> => {
    const { data } = await employeeDocumentsApi.get<{ documents: UserDocument[]; total: number; page: number; pageSize: number }>("/list", { params: filters });
    return { items: data.documents, total: data.total, page: data.page, pageSize: data.pageSize };
  },
  listAll: async () =>
    (await employeeDocumentsApi.get<{ documents: UserDocument[] }>("/list")).data.documents,
  upload: async (details: DocumentDetails, file: File) => {
    const uploadedFile = await uploadDocumentDetails(file);
    return (
      await employeeDocumentsApi.post<{ document: UserDocument }>("/create", {
        ...details,
        ...uploadedFile,
      })
    ).data.document;
  },
  remove: async (id: string) => employeeDocumentsApi.delete(`/${id}`),
};

export const officerDocumentService = {
  list: async (filters: { search?: string; page: number; pageSize: number }): Promise<OfficerPage<OfficerDocument>> => {
    const { data } = await officerDocumentsApi.get<{ documents: OfficerDocument[]; total: number; page: number; pageSize: number }>("", {
        params: filters,
      });
    return { items: data.documents, total: data.total, page: data.page, pageSize: data.pageSize };
  },
  upload: async (details: DocumentDetails, file: File) => {
    const uploadedFile = await uploadDocumentDetails(file);
    return (
      await officerDocumentsApi.post<{ document: OfficerDocument }>("", {
        ...details,
        ...uploadedFile,
      })
    ).data.document;
  },
  remove: async (id: string) => officerDocumentsApi.delete(`/${id}`),
  setStatus: async (id: string, status: "APPROVED" | "REJECTED") =>
    officerDocumentsApi.patch(`/${id}/status`, { status }),
};
