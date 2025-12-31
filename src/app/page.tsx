// app/products/page.js

import React from 'react';
import { ProductCard } from '@/components/ProductCard';
import { placeholderImages } from '@/lib/placeholder-images';
import type { Product } from '@/lib/products';

// صفحة Server Component
export default function ProductsPage({ searchParams }: { searchParams: { [key: string]: string } }) {
  // استخرج القيمة من الـ searchParams بدل useSearchParams
  const category = searchParams.category || 'all';

  // هنا ممكن تجيب المنتجات من Firebase أو أي مصدر بيانات
  const products: Product[] = [
    {
      id: '1',
      name: 'منتج تجريبي 1',
      price: 100,
      image: placeholderImages[0],
    },
    {
      id: '2',
      name: 'منتج تجريبي 2',
      price: 200,
      image: placeholderImages[1],
    },
  ];

  // لو عايز، ممكن تصفي المنتجات حسب الـ category
  const filteredProducts = category === 'all'
    ? products
    : products.filter(p => p.name.toLowerCase().includes(category.toLowerCase()));

  return (
    <div>
      <h1>المنتجات للـ category: {category}</h1>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
