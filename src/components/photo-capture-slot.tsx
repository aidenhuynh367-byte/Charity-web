"use client";

import { useEffect, useRef, useState } from "react";

function setInputFile(input: HTMLInputElement | null, file: File | null) {
  if (!input) return;
  const dt = new DataTransfer();
  if (file) dt.items.add(file);
  input.files = dt.files;
}

type PhotoCaptureSlotProps = {
  id: string;
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Overlay z-index for camera/confirm dialogs (raise when nested in another modal). */
  overlayClassName?: string;
};

export function PhotoCaptureSlot({
  id,
  label,
  file,
  onFileChange,
  overlayClassName = "z-50",
}: PhotoCaptureSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [mode, setMode] = useState<"idle" | "live" | "confirm">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function detectCamera() {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        if (!cancelled) setCameraAvailable(false);
        return;
      }
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideo = devices.some((d) => d.kind === "videoinput");
        if (!cancelled) setCameraAvailable(hasVideo || devices.length === 0);
      } catch {
        if (!cancelled) setCameraAvailable(false);
      }
    }
    void detectCamera();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!file) {
      setSelectedUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSelectedUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== "live" || !streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => {});
  }, [mode]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function clearPendingPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  }

  async function startLiveCamera() {
    setCameraError(null);
    clearPendingPreview();
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setMode("live");
      setCameraAvailable(true);
    } catch {
      setMode("idle");
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && cameraInputRef.current) {
        cameraInputRef.current.value = "";
        cameraInputRef.current.click();
        return;
      }
      setCameraAvailable(false);
      setCameraError("Camera is not available on this device.");
    }
  }

  function captureFromVideo() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const captured = new File([blob], `${id}-photo.jpg`, {
          type: "image/jpeg",
        });
        stopCamera();
        const url = URL.createObjectURL(captured);
        setPendingFile(captured);
        setPreviewUrl(url);
        setMode("confirm");
      },
      "image/jpeg",
      0.92,
    );
  }

  function openPendingConfirm(next: File) {
    clearPendingPreview();
    const url = URL.createObjectURL(next);
    setPendingFile(next);
    setPreviewUrl(url);
    setMode("confirm");
  }

  function handleCameraFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0];
    if (!next) return;
    openPendingConfirm(next);
  }

  function handleUploadFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    onFileChange(next);
    setInputFile(fileInputRef.current, next);
  }

  function confirmPending() {
    if (!pendingFile) return;
    onFileChange(pendingFile);
    setInputFile(fileInputRef.current, pendingFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    setMode("idle");
  }

  function cancelPending() {
    clearPendingPreview();
    stopCamera();
    setMode("idle");
  }

  function takeAnother() {
    clearPendingPreview();
    void startLiveCamera();
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void startLiveCamera()}
          disabled={!cameraAvailable}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          Take Photo
        </button>
        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
              fileInputRef.current.click();
            }
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Upload Photo
        </button>
      </div>
      {file ? (
        <div className="mt-1 space-y-1">
          <p className="text-xs text-slate-500">Selected: {file.name}</p>
          {selectedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img
              src={selectedUrl}
              alt={`${label} preview`}
              className="max-h-48 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
            />
          ) : null}
        </div>
      ) : null}
      {cameraError ? (
        <p className="text-xs text-red-700">{cameraError}</p>
      ) : null}

      <input
        ref={fileInputRef}
        id={id}
        name={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={handleUploadFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={handleCameraFileChange}
      />

      {mode === "live" ? (
        <div
          className={`fixed inset-0 ${overlayClassName} flex items-center justify-center bg-black/50 p-4`}
        >
          <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-4 shadow-lg">
            <h3 className="text-lg font-medium text-slate-900">Take a photo</h3>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="mt-3 aspect-[4/3] w-full rounded-lg bg-black object-cover"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={cancelPending}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureFromVideo}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "confirm" && previewUrl ? (
        <div
          className={`fixed inset-0 ${overlayClassName} flex items-center justify-center bg-black/50 p-4`}
        >
          <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-4 shadow-lg">
            <h3 className="text-lg font-medium text-slate-900">Confirm photo</h3>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
            <img
              src={previewUrl}
              alt="Photo preview"
              className="mt-3 max-h-96 w-full rounded-lg object-contain"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={cancelPending}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={takeAnother}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Take Another
              </button>
              <button
                type="button"
                onClick={confirmPending}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Use This Photo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
