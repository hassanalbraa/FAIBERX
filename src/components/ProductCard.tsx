"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
    
  const getCategoryArabicName = (category: string | undefined) => {
    switch (category) {
      case 'T-shirts': return 'تشيرتات';
      case 'Hoodies': return 'هودي';
      default: return '';
    }
  }

  return (
    <div className="group relative transition-all duration-300 hover:shadow-xl rounded-lg overflow-hidden border">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-[3/4] overflow-hidden">
           <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={800}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={product.imageHint}
          />
        </div>
      </Link>
      <div className="p-4 bg-card">
        <h3 className="font-semibold text-lg truncate">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="text-muted-foreground text-sm">{getCategoryArabicName(product.category)}</p>
        <div className="flex justify-between items-center mt-4">
          <p className="font-bold text-lg">{product.price.toFixed(2)} SDG</p>
          <Button size="icon" variant="outline" onClick={() => addToCart(product, 1)} aria-label={`أضف ${product.name} إلى السلة`}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


ProductCard.Skeleton = function ProductCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[3/4] rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}
