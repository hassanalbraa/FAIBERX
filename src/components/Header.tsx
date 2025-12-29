"use client";

import Link from 'next/link';
import { ShoppingCart, User, Menu, Shirt } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react';

const navLinks = [
  { href: '/products', label: 'جميع المنتجات' },
  { href: '/products?category=Tops', label: 'بلوزات' },
  { href: '/products?category=Dresses', label: 'فساتين' },
  { href: '/products?category=Outerwear', label: 'ملابس خارجية' },
  { href: '/style-finder', label: 'خبير الأزياء الذكي' },
];

export function Header() {
  const { cartCount } = useCart();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const NavLinkItems = () => (
    <>
      {navLinks.map((link) => (
        <Button key={link.href} asChild variant="ghost">
          <Link href={link.href} onClick={() => setIsSheetOpen(false)}>{link.label}</Link>
        </Button>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Shirt className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-semibold tracking-wider">خيوط الأناقة</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <NavLinkItems />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/account">
              <User className="h-5 w-5" />
              <span className="sr-only">الحساب</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">سلة التسوق</span>
            </Link>
          </Button>

          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">فتح القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="p-6">
                  <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setIsSheetOpen(false)}>
                     <Shirt className="h-6 w-6 text-primary" />
                     <span className="font-headline text-xl font-semibold tracking-wider">خيوط الأनाقة</span>
                  </Link>
                  <nav className="flex flex-col gap-4">
                    <NavLinkItems />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
