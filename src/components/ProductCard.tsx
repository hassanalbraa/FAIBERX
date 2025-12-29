"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

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
    <div className="group relative overflow-hidden rounded-lg border shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={800}
            className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-2 transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0">
          <Button 
            className="w-full"
            onClick={() => addToCart(product, 1)} 
            aria-label={`أضف ${product.name} إلى السلة`}
          >
            <ShoppingCart className="ml-2 h-4 w-4" />
            أضف إلى السلة
          </Button>
        </div>
      </div>
      <div className="p-4 bg-card">
        <p className="text-sm text-muted-foreground">{getCategoryArabicName(product.category)}</p>
        <h3 className="font-semibold text-base truncate mt-1">
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="font-bold text-lg mt-2">{product.price.toFixed(2)} SDG</p>
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
