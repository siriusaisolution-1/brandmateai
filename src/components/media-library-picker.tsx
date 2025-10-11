// src/components/media-library-picker.tsx
"use client";

import Image from "next/image";
import type { MediaAsset } from "@/types/firestore";

interface Props {
  assets: MediaAsset[];
  onSelect?: (asset: MediaAsset) => void;
}

export default function MediaLibraryPicker({ assets, onSelect }: Props) {
  const safeAssets = (assets ?? []).filter((a) => !!a.url);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {safeAssets.map((asset) => (
        <button
          key={asset.id ?? asset.url}
          onClick={() => onSelect?.(asset)}
          className="border border-border rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition relative h-40 w-full"
        >
          <Image
            src={asset.url!}
            alt={asset.fileName ?? "media"}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </button>
      ))}
    </div>
  );
}