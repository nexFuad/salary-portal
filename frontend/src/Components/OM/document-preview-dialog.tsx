"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import Modal from "@/Components/Shared/Modal";
import type { UserDocument } from "@/Types/om";

export default function DocumentPreviewDialog({ document, onClose }: { document: UserDocument; onClose: () => void }) {
  return (
    <Modal title={document.title} onClose={onClose}>
      <div className="min-h-[55dvh] overflow-hidden rounded-xl bg-slate-100">
        {document.mimeType === "application/pdf" ? (
          <iframe
            title={document.title}
            src={document.fileUrl}
            className="h-[55dvh] w-full border-0"
          />
        ) : (
          <Image
            src={document.fileUrl}
            alt={document.title}
            width={1000}
            height={700}
            unoptimized
            className="max-h-[55dvh] w-full object-contain"
          />
        )}
      </div>
      <a
        href={document.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#17665c] hover:underline"
      >
        <ExternalLink className="size-4" />
        Open original file
      </a>
    </Modal>
  );
}
