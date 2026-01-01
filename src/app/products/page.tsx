import React from 'react';
import { ProductsList } from '@/components/ProductsList'; // استيراد المكون الذكي

export default function ProductsPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category || null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        المنتجات: {category === 'all' || !category ? 'الكل' : category}
      </h1>
      
      {/* استدعاء المكون الذي يتصل بـ Firebase فعلياً */}
      <ProductsList category={category === 'all' ? null : category} />
    </div>
  );
}
