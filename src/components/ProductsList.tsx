'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export function ProductsList({ category }: { category: string | null }) {
  const firestore = useFirestore();

  // Fetch products from Firestore, filtering by category if provided
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const productsCollection = collection(firestore, 'products');
    if (category) {
      return query(productsCollection, where('category', '==', category));
    }
    return query(productsCollection);
  }, [firestore, category]);

  const { data: filteredProducts, isLoading } = useCollection<Product>(productsQuery);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <ProductCard.Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredProducts && filteredProducts.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <p className="text-muted-foreground text-lg">لم يتم العثور على منتجات في هذه الفئة.</p>
    </div>
  );
}
