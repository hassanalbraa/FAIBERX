"use client";

import { useState, use } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Loader2 } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const SIZES: Product['sizes'] = ["L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"];

export default function ProductDetailPage({ params: paramsProp }: { params: { id: string } }) {
  const params = use(paramsProp);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  // Fetch the specific product from Firestore
  const productRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'products', params.id);
  }, [firestore, params.id]);

  const { data: product, isLoading } = useDoc<Product>(productRef);


  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    notFound();
  }
  
  const handleAddToCart = () => {
    // Use selected size or default to "L" if none is selected
    const sizeToAdd = selectedSize || 'افتراضي';
    addToCart(product, quantity, sizeToAdd);
  };

  const getCategoryArabicName = (category: string | undefined) => {
    switch (category) {
      case 'T-shirts': return 'تشيرتات';
      case 'Hoodies': return 'هودي';
      default: return 'منتجات';
    }
  }

  const availableSizes = product.sizes || SIZES;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">المنتجات</BreadcrumbLink>
          </BreadcrumbItem>
           <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div>
          <span className="text-sm text-muted-foreground font-semibold tracking-widest uppercase">{getCategoryArabicName(product.category)}</span>
          <h1 className="font-headline text-3xl md:text-5xl font-bold mt-2">{product.name}</h1>
          <p className="text-3xl font-bold mt-4">{product.price.toFixed(2)} SDG</p>
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
          
          <div className='mt-8'>
            <Label className='text-base font-semibold'>اختر المقاس (اختياري)</Label>
            <div className="flex flex-wrap gap-2 mt-4" role="radiogroup" aria-label="Product sizes">
                 {availableSizes.map(size => (
                    <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        onClick={() => setSelectedSize(size)}
                        className="w-14 h-14 text-base font-bold"
                    >
                        {size}
                    </Button>
                ))}
                 <Button
                    variant={selectedSize === null ? "default" : "outline"}
                    onClick={() => setSelectedSize(null)}
                >
                    مقاس افتراضي
                </Button>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" onClick={handleAddToCart} className="flex-grow bg-primary text-primary-foreground hover:bg-primary/90">
              أضف إلى السلة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-pulse">
      <div className="h-6 bg-muted rounded w-1/3 mb-8"></div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="aspect-[3/4] bg-muted rounded-lg"></div>
        <div>
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-12 w-32 bg-muted rounded-md"></div>
            <div className="h-12 flex-grow bg-muted rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
