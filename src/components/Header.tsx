"use client";

import Link from 'next/link';
import { ShoppingCart, User, Menu, Shirt, LogIn, UserPlus, ListOrdered } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/firebase';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react';
import { ShareButton } from './ShareButton';
import { Separator } from './ui/separator';

const navLinks = [
  { href: '/products', label: 'جميع المنتجات' },
  { href: '/style-finder', label: 'خبير الأزياء الذكي' },
];

export function Header() {
  const { cartCount } = useCart();
  const { user } = useUser();
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
            <span className="font-headline text-xl font-semibold tracking-wider">FiberX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <NavLinkItems />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ShareButton />
          {user ? (
            <Button asChild variant="ghost" size="icon">
              <Link href="/account">
                <User className="h-5 w-5" />
                <span className="sr-only">الحساب</span>
              </Link>
            </Button>
          ) : (
            <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost">
                    <Link href="/login"><LogIn className="ml-2 h-4 w-4" />تسجيل الدخول</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup"><UserPlus className="ml-2 h-4 w-4" />إنشاء حساب</Link>
                </Button>
            </div>
          )}
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
              <SheetContent side="right" className="p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="sr-only">القائمة</SheetTitle>
                    <SheetDescription className="sr-only">روابط التنقل الرئيسية في الموقع.</SheetDescription>
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                       <Shirt className="h-6 w-6 text-primary" />
                       <span className="font-headline text-xl font-semibold tracking-wider">FiberX</span>
                    </Link>
                </SheetHeader>
                <div className="p-6 flex flex-col h-full">
                  <nav className="flex flex-col gap-4">
                    <NavLinkItems />
                     {user && (
                       <>
                        <Separator />
                         <Button asChild variant="ghost" className="justify-start">
                           <Link href="/account" onClick={() => setIsSheetOpen(false)}>
                             <User className="ml-2 h-4 w-4" />
                             حسابي
                           </Link>
                         </Button>
                         <Button asChild variant="ghost" className="justify-start">
                           <Link href="/account/orders" onClick={() => setIsSheetOpen(false)}>
                             <ListOrdered className="ml-2 h-4 w-4" />
                             سجل الطلبات
                           </Link>
                         </Button>
                       </>
                     )}
                  </nav>
                   <div className="mt-auto pt-4 border-t">
                    {!user && (
                        <div className="flex flex-col gap-2">
                            <Button asChild variant="default" className='w-full' onClick={() => setIsSheetOpen(false)}>
                                <Link href="/login"><LogIn className="ml-2 h-4 w-4" />تسجيل الدخول</Link>
                            </Button>
                            <Button asChild variant="outline" className='w-full' onClick={() => setIsSheetOpen(false)}>
                                <Link href="/signup"><UserPlus className="ml-2 h-4 w-4" />إنشاء حساب</Link>
                            </Button>
                        </div>
                    )}
                   </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
