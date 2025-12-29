import Link from 'next/link';
import { Shirt, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from './ui/button';

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shirt className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl font-semibold tracking-wider">Threads of Couture</span>
            </Link>
            <p className="text-sm text-muted-foreground">High-end fashion for the modern individual.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">All Products</Link></li>
              <li><Link href="/products?category=Tops" className="text-sm text-muted-foreground hover:text-foreground">Tops</Link></li>
              <li><Link href="/products?category=Dresses" className="text-sm text-muted-foreground hover:text-foreground">Dresses</Link></li>
              <li><Link href="/products?category=Outerwear" className="text-sm text-muted-foreground hover:text-foreground">Outerwear</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">My Account</Link></li>
              <li><Link href="/orders/track" className="text-sm text-muted-foreground hover:text-foreground">Order Tracking</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Threads of Couture. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
