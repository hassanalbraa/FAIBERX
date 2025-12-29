'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart } from 'lucide-react';
import { mockOrders } from '@/lib/orders';

export default function AdminOrdersPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const isAdmin = user?.email === 'admin@example.com';

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.replace('/admin/login');
      } else if (!isAdmin) {
        router.replace('/account');
      }
    }
  }, [user, isUserLoading, isAdmin, router]);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">جاري التحقق من صلاحيات الأدمن...</p>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Shipped':
      case 'Out for Delivery':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold flex items-center gap-4">
          <ShoppingCart className="h-10 w-10" />
          طلبات الزبائن
        </h1>
        <p className="text-muted-foreground mt-2">عرض وإدارة جميع الطلبات الواردة.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>جميع الطلبات</CardTitle>
            <CardDescription>
                {mockOrders.length > 0
                ? `لديك ${mockOrders.length} طلبات إجمالاً.`
                : 'لا توجد طلبات لعرضها حاليًا.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {mockOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>الزبون</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.shippingAddress.name}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.total.toFixed(2)} SDG</TableCell>
                    <TableCell className="text-right">
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
                <p className="mt-2 text-muted-foreground">لم يتم استلام أي طلبات بعد.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
