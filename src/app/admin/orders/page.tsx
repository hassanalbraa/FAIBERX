'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { Loader2, ShoppingCart, MoreHorizontal, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/orders';

const ADMIN_UID = "5Kp5lbgb8fOJSr0OS5p1J4MMg2q1";

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const isAdmin = !isUserLoading && user?.uid === ADMIN_UID;

  const ordersQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    return firestore.collection('orders').orderBy('createdAt', 'desc'); // أو استخدم useCollection
  }, [firestore, isAdmin]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  if (isUserLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;

  if (!isAdmin) {
    return (
      <div className="text-center mt-20 p-10 border-2 border-dashed rounded-xl">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-600">وصول مرفوض</h2>
        <p>هذا الحساب لا يملك صلاحيات الأدمن</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart /> إدارة الطلبات
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طلبات الزبائن</CardTitle>
          <CardDescription>
            {orders?.length > 0 ? `إجمالي الطلبات: ${orders.length}` : 'لا توجد طلبات حالياً'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <Loader2 className="animate-spin h-8 w-8 mx-auto" />
          ) : orders?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>الزبون</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-center">تفاصيل</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.slice(0,7).toUpperCase()}</TableCell>
                    <TableCell>{order.shippingAddress?.name || 'مجهول'}</TableCell>
                    <TableCell>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('ar-EG') : 'بدون تاريخ'}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell className="text-right">{order.total} SDG</TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                        التفاصيل...
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-20 text-muted-foreground">لا توجد طلبات لعرضها</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
