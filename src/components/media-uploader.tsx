// src/components/media-uploader.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { useAuth } from "reactfire";

interface Props {
  brandId: string;
  onUploaded?: () => void;
}

export default function MediaUploader({ brandId, onUploaded }: Props) {
  const { currentUser } = useAuth();
  const [busy, setBusy] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!currentUser || acceptedFiles.length === 0) return;
      setBusy(true);

      try {
        const token = await currentUser.getIdToken();

        await Promise.all(
          acceptedFiles.map(async (file) => {
            const detectedType = file.type?.trim();
            if (!detectedType) {
              throw new Error(`Unsupported file type for ${file.name}`);
            }

            const response = await fetch("/api/media/get-upload-url", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                brandId,
                filename: file.name,
                contentType: detectedType,
              }),
            });

            if (!response.ok) {
              const payload = await response.json().catch(() => ({ error: "Failed to request upload URL" }));
              throw new Error(payload.error || "Failed to request upload URL");
            }

            const { uploadUrl, storagePath, expectedContentType, uploadId, downloadToken } = (await response.json()) as {
              uploadUrl: string;
              storagePath: string;
              expectedContentType: string;
              uploadId: string;
              downloadToken: string;
            };

            const uploadResult = await fetch(uploadUrl, {
              method: "PUT",
              headers: {
                "Content-Type": expectedContentType,
                "x-goog-meta-firebaseStorageDownloadTokens": downloadToken,
              },
              body: file,
            });

            if (!uploadResult.ok) {
              throw new Error("Upload failed");
            }

            const registerResponse = await fetch("/api/media/register-upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                brandId,
                storagePath,
                fileName: file.name,
                contentType: expectedContentType,
                size: file.size,
                uploadId,
              }),
            });

            if (!registerResponse.ok) {
              const payload = await registerResponse.json().catch(() => ({ error: "Failed to register upload" }));
              throw new Error(payload.error || "Failed to register upload");
            }
          })
        );

        onUploaded?.();
      } catch (error) {
        console.error("Media upload failed", error);
      } finally {
        setBusy(false);
      }
    },
    [brandId, currentUser, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-md p-6 text-center transition ${
        isDragActive ? "border-primary" : "border-border"
      } ${busy ? "opacity-60 pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />
      <p className="text-sm">
        Drag & drop files here, or click to browse
      </p>
    </div>
  );
}