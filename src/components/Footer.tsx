import Link from 'next/link';
import { Shirt, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from './ui/button';
import { ShareButton } from './ShareButton';

export function Footer() {
  const mockOrderId = "TOC12345"; // Example order ID

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shirt className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl font-semibold tracking-wider">FiberX</span>
            </Link>
            <p className="text-sm text-muted-foreground">مع فايبركس اطبع افكارك.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">تسوق</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">جميع المنتجات</Link></li>
              <li><Link href="/style-finder" className="text-sm text-muted-foreground hover:text-foreground">خبير الأزياء الذكي</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">خدمة العملاء</h3>
            <ul className="space-y-2">
              <li><Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">حسابي</Link></li>
              <li><Link href={`/orders/${mockOrderId}`} className="text-sm text-muted-foreground hover:text-foreground">تتبع الطلب</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">اتصل بنا</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">الأسئلة الشائعة</Link></li>
              <li><ShareButton variant="link" className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto" /></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">تابعنا</h3>
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
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FiberX. جميع الحقوق محفوظة.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">شروط الخدمة</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">سياسة الخصوصية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
