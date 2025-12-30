
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, ListOrdered } from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/orders';

function UserOrdersContent() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user?.uid]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(userOrdersQuery);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped': case 'Out for Delivery': return 'secondary';
      case 'Cancelled': case 'Suspended': return 'destructive';
      default: return 'outline';
    }
  };
  
  if (isOrdersLoading) {
      return (
          <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>تاريخ الطلبات</CardTitle>
            <CardDescription>
                {orders && orders.length > 0
                ? `لديك ${orders.length} طلبات.`
                : 'لم تقم بأي طلبات بعد.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="w-[100px] text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                        <Link href={`/orders/${order.id}`} className="hover:underline">#{order.id.slice(0, 7).toUpperCase()}</Link>
                    </TableCell>
                    <TableCell>{order.createdAt?.toDate().toLocaleDateString('ar-EG') || 'غير متوفر'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.total.toFixed(2)} SDG</TableCell>
                    <TableCell className="text-center">
                       <Button asChild variant="outline" size="sm">
                           <Link href={`/orders/${order.id}`}>عرض التفاصيل</Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-xl font-semibold">لا توجد طلبات</h2>
                <p className="mt-2 text-muted-foreground">عندما تقوم بطلب، سيظهر هنا.</p>
                <Button asChild className="mt-6">
                    <Link href="/products">ابدأ التسوق</Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
  );
}


export default function UserOrdersPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login?redirect=/account/orders');
    }
  }, [user, isUserLoading, router]);


  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold flex items-center gap-4">
          <ListOrdered className="h-10 w-10" />
          طلباتي
        </h1>
        <p className="text-muted-foreground mt-2">عرض سجل جميع طلباتك السابقة.</p>
      </div>
      <UserOrdersContent />
    </div>
  );
}
