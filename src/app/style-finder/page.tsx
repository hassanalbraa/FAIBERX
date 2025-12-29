"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getOutfitSuggestions } from './actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Camera, Loader2, Sparkles } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';
import { products, type Product } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export default function StyleFinderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  
  const styleFinderPlaceholder = placeholderImages.find(p => p.id === 'style-finder-placeholder');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !preview) {
      toast({
        title: 'لم يتم تحديد صورة',
        description: 'يرجى تحميل صورة للحصول على اقتراحات أسلوب.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSuggestedProducts([]);
    try {
      const result = await getOutfitSuggestions(preview);
      if (result.suggestions && result.suggestions.length > 0) {
        toast({
          title: 'الاقتراحات جاهزة!',
          description: "إليك بعض القطع التي نعتقد أنك ستحبها.",
        });

        // Match suggestions with products
        const matchedProducts: Product[] = [];
        result.suggestions.forEach(suggestion => {
            products.forEach(product => {
                if (product.name.toLowerCase().includes(suggestion.toLowerCase()) || product.description.toLowerCase().includes(suggestion.toLowerCase())) {
                    if (!matchedProducts.find(p => p.id === product.id)) {
                        matchedProducts.push(product);
                    }
                }
            });
        });
        setSuggestedProducts(matchedProducts);

      } else {
        toast({
          title: 'لم يتم العثور على اقتراحات',
          description: 'لم نتمكن من إنشاء اقتراحات لهذه الصورة. يرجى تجربة صورة أخرى.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'حدث خطأ',
        description: 'فشل في الحصول على اقتراحات الأسلوب. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">مكتشف الأسلوب بالذكاء الاصطناعي</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          أطلق العنان لأسلوبك الشخصي. حمّل صورة لنفسك، وسيقوم الذكاء الاصطناعي لدينا بتنسيق مجموعة خاصة بك.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card>
          <CardHeader>
            <CardTitle>تحميل صورتك</CardTitle>
            <CardDescription>للحصول على أفضل النتائج، استخدم صورة واضحة لكامل الجسم.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="aspect-video relative border-2 border-dashed rounded-lg flex items-center justify-center bg-secondary/30">
                {preview ? (
                  <Image src={preview} alt="Preview" fill className="object-contain" />
                ) : styleFinderPlaceholder && (
                  <Image src={styleFinderPlaceholder.imageUrl} alt="Placeholder" fill className="object-cover opacity-30" data-ai-hint={styleFinderPlaceholder.imageHint} />
                )}
                <div className="absolute z-10 text-center p-4">
                  {!preview && <Camera className="h-12 w-12 text-muted-foreground mx-auto" />}
                </div>
              </div>
              <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
              <Button type="submit" disabled={isLoading || !file} className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />جاري تحليل الأسلوب...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />احصل على اقتراحات</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div>
          <h2 className="font-headline text-3xl font-bold mb-4">توصيات أسلوبك</h2>
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                    </div>
                ))}
             </div>
          ) : suggestedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">ستظهر منتجاتك المقترحة هنا.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
