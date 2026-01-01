'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductsList } from '@/components/ProductsList';
import { ProductCard } from '@/components/ProductCard';


function ProductsPageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || null;

  const getCategoryArabicName = (cat: string | null) => {
    switch (cat) {
      case 'T-shirts': return 'تشيرتات';
      case 'Hoodies': return 'هودي';
      default: return 'كل المنتجات';
    }
  }

  const title = getCategoryArabicName(category);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {category 
            ? `استكشف مجموعتنا المختارة من ${getCategoryArabicName(category)?.toLowerCase()}.`
            : 'اكتشف البراعة والأناقة المنسوجة في كل قطعة من مجموعتنا.'}
        </p>
      </div>

      <ProductsList category={category} />
    </div>
  );
}


export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 md:py-12">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <ProductCard.Skeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}
