import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import { InstagramFeed } from '@/components/InstagramFeed';
import { ArrowRight } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

export default function Home() {
  const featuredProducts = products.slice(0, 4);
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
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4 max-w-3xl">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Elegance Redefined
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Discover our new collection, where timeless style meets contemporary design.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold group">
            <Link href="/products">
              Shop Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured Products</h2>
          <p className="text-muted-foreground mt-2">Handpicked for the modern connoisseur</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
         <div className="text-center mt-12">
          <Button asChild variant="outline">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </section>

      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Find Your Signature Style</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Upload a photo and let our AI stylist recommend the perfect pieces to complement your look.
            </p>
            <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold group">
              <Link href="/style-finder">
                Try The AI Stylist <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">#ThreadsOfCouture</h2>
          <p className="text-muted-foreground mt-2">Follow our journey and share your style on Instagram</p>
        </div>
        <InstagramFeed />
      </section>
    </div>
  );
}
