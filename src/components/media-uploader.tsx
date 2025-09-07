// src/components/media-uploader.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { getApp } from "firebase/app";
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
        const app = getApp();
        const db = getFirestore(app);
        const storage = getStorage(app);

        await Promise.all(
          acceptedFiles.map(async (file) => {
            // 1) upload u Storage
            const path = `brands/${brandId}/${currentUser.uid}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);

            // 2) download URL
            const url = await getDownloadURL(storageRef);

            // 3) upis u Firestore
            await addDoc(collection(db, "mediaAssets"), {
              brandId,
              userId: currentUser.uid,
              fileName: file.name,
              contentType: file.type || "application/octet-stream",
              url,
              storagePath: path,
              createdAt: serverTimestamp(),
              uploadedAt: serverTimestamp(),
            });
          })
        );

        onUploaded?.();
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