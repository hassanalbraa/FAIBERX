
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOrderId = orderId.trim();
    if (!trimmedOrderId) {
      toast({
        variant: 'destructive',
        title: 'حقل فارغ',
        description: 'يرجى إدخال رقم الطلب.',
      });
      return;
    }
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'يرجى تسجيل الدخول',
            description: 'يجب تسجيل الدخول لعرض تفاصيل الطلب.',
        });
        router.push(`/login?redirect=/orders/${trimmedOrderId}`);
        return;
    }
    
    // Redirect to the correct user-facing order details page.
    router.push(`/orders/${trimmedOrderId}`);
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Truck className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-headline mt-4">تتبع طلبك</CardTitle>
          <CardDescription>أدخل رقم الطلب الخاص بك أدناه لمعرفة حالته الحالية.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackOrder} className="flex gap-2">
            <Input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="مثال: aBcDeFg1"
              className="flex-grow"
              aria-label="رقم الطلب"
            />
            <Button type="submit">
              <Search className="ml-2 h-4 w-4" />
              تتبع
            </Button>
          </form>
          {user ? (
            <p className="text-xs text-muted-foreground mt-4 text-center">
             يمكنك أيضاً عرض جميع طلباتك في <Link href="/account" className="underline hover:text-primary">صفحة حسابك</Link>.
            </p>
          ) : (
             <p className="text-xs text-muted-foreground mt-4 text-center">
              يمكنك العثور على رقم طلبك في رسالة تأكيد الطلب الإلكترونية.
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
