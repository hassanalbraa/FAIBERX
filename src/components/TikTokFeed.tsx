import Image from 'next/image';
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images';
import { PlayCircle } from 'lucide-react';

export function TikTokFeed() {
  const tiktokPlaceholders = placeholderImages.filter(p => p.id.startsWith('tiktok-'));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
      {tiktokPlaceholders.map((video) => (
        <Link 
          href={video.url || '#'} 
          key={video.id}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-[9/16] overflow-hidden rounded-lg"
        >
          <Image
            src={video.imageUrl}
            alt={video.description}
            fill
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <PlayCircle className="h-12 w-12 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
             <p className="text-white text-xs font-semibold truncate">{video.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
