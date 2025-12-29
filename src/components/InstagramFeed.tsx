import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { Palette } from 'lucide-react';

export function InstagramFeed() {
  const igImages = placeholderImages.filter(p => p.id.startsWith('instagram-'));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
      {igImages.map((image) => (
        <div 
          key={image.id}
          className="group relative aspect-square overflow-hidden rounded-lg"
        >
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Palette className="h-8 w-8 text-white" />
          </div>
        </div>
      ))}
    </div>
  );
}
