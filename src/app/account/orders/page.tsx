'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ListOrdered, ShoppingBag } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/orders';
import { mockOrders } from '@/lib/orders';

// This component will only be rendered when the user is fully loaded and available.
function OrdersContent({ user }: { user: NonNullable<ReturnType<typeof useUser>['user']> }) {
  // Using mock data instead of Firestore query. We'll show the first 2 mock orders regardless of user ID.
  const userOrders = useMemo(() => mockOrders, []);
  const isOrdersLoading = false; // Mock data is loaded instantly

  // Sort orders on the client-side after fetching
  const sortedOrders = useMemo(() => {
    return [...userOrders].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }, [userOrders]);

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Shipped':
      case 'Out for Delivery':
        return 'secondary';
      case 'Cancelled':
      case 'Suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
      <Card>
        <CardHeader>
            <CardTitle>طلباتك</CardTitle>
            <CardDescription>
                {isOrdersLoading 
                    ? "جاري تحميل طلباتك..."
                    : sortedOrders && sortedOrders.length > 0
                        ? `لديك ${sortedOrders.length} طلبات.`
                        : 'ليس لديك أي طلبات حتى الآن.'
                }
            </CardDescription>
        </CardHeader>
        <CardContent>
          {isOrdersLoading ? (
             <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
          ) : sortedOrders && sortedOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                        <Link href={`/account/orders/${order.id}`} className="hover:underline">#{order.id.slice(0, 7).toUpperCase()}</Link>
                    </TableCell>
                    <TableCell>{new Date(order.date || Date.now()).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.total.toFixed(2)} SDG</TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/account/orders/${order.id}`}>عرض التفاصيل</Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-xl font-semibold">لا توجد طلبات</h2>
                <p className="mt-2 text-muted-foreground">يبدو أنك لم تقم بأي طلبات بعد.</p>
                <Button asChild className="mt-6">
                <Link href="/products">ابدأ التسوق</Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
  )
}


export default function OrderHistoryPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // This effect handles redirection if the user is not logged in after loading.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold flex items-center gap-4">
          <ListOrdered className="h-10 w-10" />
          سجل الطلبات
        </h1>
        <p className="text-muted-foreground mt-2">عرض جميع طلباتك السابقة والحالية.</p>
      </div>
      
      {isUserLoading ? (
        <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : user ? (
        <OrdersContent user={user} />
      ) : (
        <p className="text-center text-muted-foreground">يرجى تسجيل الدخول لعرض سجل طلباتك.</p>
      )}
    </div>
  );
}

    