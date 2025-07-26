'use client';

import { useState } from 'react';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { collection, query, where } from 'firebase/firestore';
import { MediaAsset } from '@/types/firestore';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface MediaLibraryPickerProps {
  brandId: string;
  onSelectionChange: (selectedIds: string[]) => void;
}

export function MediaLibraryPicker({ brandId, onSelectionChange }: MediaLibraryPickerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const firestore = useFirestore();
  const mediaAssetsCollection = collection(firestore, 'mediaAssets');
  const mediaAssetsQuery = query(
    mediaAssetsCollection,
    where('brandId', '==', brandId)
  );

  const { status, data: mediaAssets } = useFirestoreCollectionData(
    mediaAssetsQuery, { idField: 'id' }
  );

  const handleSelect = (assetId: string) => {
    const newSelection = selectedIds.includes(assetId)
      ? selectedIds.filter(id => id !== assetId)
      : [...selectedIds, assetId];
    setSelectedIds(newSelection);
    onSelectionChange(newSelection);
  };

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="aspect-square bg-gray-700 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (!mediaAssets || mediaAssets.length === 0) {
    return <p className="text-sm text-copy-secondary">No media found for this brand. Upload some images to the Media Library first.</p>;
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2 bg-gray-900 rounded-md">
      {(mediaAssets as (MediaAsset & { id: string })[]).map((asset) => (
        <div key={asset.id} className="relative aspect-square cursor-pointer group" onClick={() => handleSelect(asset.id)}>
          <Image
            src={asset.url}
            alt={asset.fileName}
            layout="fill"
            objectFit="cover"
            className={`rounded-md transition-opacity ${selectedIds.includes(asset.id) ? 'opacity-50' : 'group-hover:opacity-80'}`}
          />
          {selectedIds.includes(asset.id) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
