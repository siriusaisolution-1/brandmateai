'use client';

import { useParams } from 'next/navigation';
import { MediaUploader } from '@/components/media-uploader';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { collection, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { MediaAsset } from '@/types/firestore'; // Assuming you have this type defined

export default function MediaLibraryPage() {
  const params = useParams();
  const brandId = params.brandId as string;
  
  // State to force re-render on upload, since Firestore can take a moment to update
  const [uploadCount, setUploadCount] = useState(0);

  const firestore = useFirestore();
  const mediaAssetsCollection = collection(firestore, 'mediaAssets');
  const mediaAssetsQuery = query(
    mediaAssetsCollection,
    where('brandId', '==', brandId)
  );

  const { status, data: mediaAssets } = useFirestoreCollectionData(
    mediaAssetsQuery,
    {
      idField: 'id', // Attach the document ID to the data
    }
  );

  const handleUploadComplete = (assetId: string) => {
    console.log(`Upload complete for asset ${assetId}, forcing gallery refresh.`);
    setUploadCount(prev => prev + 1);
  };
  
  if (status === 'loading') {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold text-copy-primary mb-4 animate-pulse">
                Media Library
            </h1>
             <div className="w-full h-32 bg-gray-700 rounded-lg animate-pulse mb-8"></div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-700 rounded-lg animate-pulse"></div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-copy-primary mb-4">
        Media Library
      </h1>
      <p className="text-copy-secondary mb-8">
        Managing media for brand: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{brandId}</span>
      </p>

      <MediaUploader brandId={brandId} onUploadComplete={handleUploadComplete} />
      
      <div className="mt-8">
        <h2 className="text-xl font-bold text-copy-primary mb-4">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaAssets && mediaAssets.length > 0 ? (
                (mediaAssets as MediaAsset[]).map((asset) => (
                    <div key={asset.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-700 group">
                        <img
                            src={asset.url}
                            alt={asset.fileName}
                            className="w-full h-full object-cover"
                        />
                         <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-xs text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {asset.fileName}
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full p-8 border-2 border-dashed border-gray-600 rounded-lg text-center bg-gray-900">
                    <p className="text-copy-secondary">
                    No media found for this brand. Drag and drop some files above to get started.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
