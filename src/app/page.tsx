'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { InstagramFeed } from '@/components/InstagramFeed';
import { ArrowLeft } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';
import { useCollection } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/products';

export default function Home() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'products'), limit(4)) : null
  , [firestore]);

  const { data: featuredProducts, isLoading } = useCollection<Product>(productsQuery);

  const heroImage = placeholderImages.find(p => p.id === 'hero');

  return (
    <div className="space-y-16 md:space-y-24">
      <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white">
        {heroImage && (
           <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover object-center"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4 max-w-3xl">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            مع فايبركس اطبع افكارك
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            اكتشف مجموعتنا الجديدة، حيث يلتقي الأسلوب الخالد مع التصميم المعاصر.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold group">
            <Link href="/products">
              تسوق الآن <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">منتجات مميزة</h2>
          <p className="text-muted-foreground mt-2">مختارة بعناية للخبراء العصريين</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading && [...Array(4)].map((_, i) => <ProductCard.Skeleton key={i} />)}
          {featuredProducts?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
         <div className="text-center mt-12">
          <Button asChild variant="outline">
            <Link href="/products">عرض كل المنتجات</Link>
          </Button>
        </div>
      </section>

      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">ابحث عن أسلوبك الخاص</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              حمّل صورة ودع خبير الأزياء الذكي يقترح عليك القطع المثالية التي تكمل إطلالتك.
            </p>
            <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold group">
              <Link href="/style-finder">
                جرّب خبير الأزياء الذكي <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Button>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">#فايبركس</h2>
          <p className="text-muted-foreground mt-2">تابع رحلتنا وشاركنا أسلوبك على إنستغرام</p>
        </div>
        <InstagramFeed />
      </section>
    </div>
  );
}
