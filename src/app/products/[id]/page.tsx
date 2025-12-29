"use client";

import { useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { products, type Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Plus, Minus } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p: Product) => p.id === params.id);

  if (!product) {
    notFound();
  }
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
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
            data-ai-hint={product.imageHint}
          />
        </div>
        <div>
          <span className="text-sm text-muted-foreground font-semibold tracking-widest uppercase">{product.category}</span>
          <h1 className="font-headline text-3xl md:text-5xl font-bold mt-2">{product.name}</h1>
          <p className="text-3xl font-bold mt-4">${product.price.toFixed(2)}</p>
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
          
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
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
