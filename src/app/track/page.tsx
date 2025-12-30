
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast({
        variant: 'destructive',
        title: 'حقل فارغ',
        description: 'يرجى إدخال رقم الطلب.',
      });
      return;
    }
    // Note: This redirects to a user-specific page.
    // For a public tracking page, you might need a different URL structure like /track/[id]
    // and adjust security rules accordingly.
    // The current implementation redirects to the user's private order page.
    router.push(`/account/orders/${orderId.trim()}`);
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
          <p className="text-xs text-muted-foreground mt-4 text-center">
            يمكنك العثور على رقم طلبك في رسالة تأكيد الطلب الإلكترونية أو في <a href="/account/orders" className="underline">سجل طلباتك</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
