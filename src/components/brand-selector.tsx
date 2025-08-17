'use client';

import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire';
import { collection, query, where } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brand } from '@/types/firestore';

interface BrandSelectorProps {
  onBrandSelected: (brandId: string) => void;
  disabled?: boolean;
}

export function BrandSelector({ onBrandSelected, disabled }: BrandSelectorProps) {
  const { data: user } = useUser();
  const firestore = useFirestore();

  const brandsCollection = collection(firestore, 'brands');
  // In a multi-tenant app, this would be: collection(firestore, 'users', user.uid, 'brands')
  const brandsQuery = query(brandsCollection, where('ownerId', '==', user?.uid || ''));

  const { status, data: brands } = useFirestoreCollectionData(brandsQuery, {
    idField: 'id',
  });

  if (status === 'loading') {
    return <div className="w-full h-10 bg-gray-700 rounded-md animate-pulse" />;
  }
  
  if (brands?.length === 0) {
      return <p className='text-sm text-copy-secondary'>No brands found. Please create one first.</p>
  }

  return (
    <Select onValueChange={onBrandSelected} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a brand..." />
      </SelectTrigger>
      <SelectContent>
        {(brands as Brand[]).map((brand) => (
          <SelectItem key={brand.id} value={brand.id}>
            {brand.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
