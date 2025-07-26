'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { run } from '@genkit-ai/flow/client';
import { uploadMediaAssetFlow } from '@/ai/flows/manage-brand';
import { useAuth } from 'reactfire';

interface MediaUploaderProps {
  brandId: string;
  onUploadComplete: (assetId: string) => void;
}

// Helper to read file as Base64
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });

export function MediaUploader({ brandId, onUploadComplete }: MediaUploaderProps) {
  const auth = useAuth();
  
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!auth.currentUser) {
        console.error("User is not authenticated. Cannot upload.");
        // Optionally, show a toast notification to the user
        return;
      }

      console.log('Uploading for brand:', brandId);

      for (const file of acceptedFiles) {
        try {
          const fileContentBase64 = await toBase64(file);
          const result = await run(uploadMediaAssetFlow, {
            brandId,
            fileName: file.name,
            fileType: file.type,
            fileContentBase64,
          });
          console.log('Upload successful:', result);
          onUploadComplete(result.assetId);
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          // Optionally, show an error message for the specific file
        }
      }
    },
    [brandId, onUploadComplete, auth.currentUser]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-900/10'
            : 'border-gray-600 bg-gray-900 hover:bg-gray-800'
        }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-indigo-300">Drop the files here ...</p>
      ) : (
        <p className="text-copy-secondary">
          Drag 'n' drop some files here, or click to select files
        </p>
      )}
    </div>
  );
}
