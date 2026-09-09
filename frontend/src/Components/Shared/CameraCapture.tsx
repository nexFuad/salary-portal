"use client";

import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CameraCaptureProps = {
  onCapture: (file: Blob, previewUrl: string) => void;
  compact?: boolean;
  className?: string;
};

export default function CameraCapture({
  onCapture,
  compact = false,
  className = "",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        if (active)
          setCameraError("Camera permission is required to continue.");
      });
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas
      .getContext("2d")
      ?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        onCapture(blob, URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <div className={className}>
      <div
        className={`overflow-hidden rounded-xl bg-slate-900 ${compact ? "h-28" : ""}`}
      >
        {cameraError ? (
          <div
            className={`flex items-center justify-center px-4 text-center text-sm text-white ${compact ? "h-full" : "min-h-56"}`}
          >
            {cameraError}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`${compact ? "h-full" : "min-h-56"} w-full object-cover`}
          />
        )}
      </div>
      {!cameraError && (
        <button
          type="button"
          onClick={capturePhoto}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17665c] px-4 text-sm font-semibold text-white hover:bg-[#105348] ${compact ? "mt-2 py-2" : "mt-4 py-3"}`}
        >
          <Camera className="size-4" /> Take photo
        </button>
      )}
    </div>
  );
}
