'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { Loader2, ShoppingCart, MoreHorizontal, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Order, OrderStatus } from '@/lib/orders';

const ADMIN_EMAIL = 'admin@example.com';

// كل الحالات الممكنة للطلبات
const ORDER_STATUSES: OrderStatus[] = ['قيد المعالجة', 'قيد الشحن', 'تم الشحن', 'تم التوصيل', 'ملغي'];

function AdminOrdersContent() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const isAdmin =
    !isUserLoading &&
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // ===== Query مباشرة من orders على الجذر =====
  const ordersQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    return query(
      collection(firestore, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, isAdmin]);

  const { data: orders, isLoading, error } = useCollection<Order>(ordersQuery);

  // تحديث مزدوج: نسخة الأدمن ونسخة الزبون
  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    if (!firestore || !order.id || !order.userId) return;

    try {
      // نسخة الأدمن
      const adminOrderRef = doc(firestore, 'orders', order.id);
      await updateDocumentNonBlocking(adminOrderRef, { status: newStatus });

      // نسخة المستخدم
      const userOrderRef = doc(firestore, 'users', order.userId, 'orders', order.id);
      await updateDocumentNonBlocking(userOrderRef, { status: newStatus });

      toast({
        title: 'تم التحديث',
        description: `حالة الطلب الآن: ${newStatus}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل تحديث حالة الطلب. حاول مرة أخرى.',
      });
      console.error(error);
    }
  };

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex h-64 items-center justify-center">
        {isUserLoading ? <Loader2 className="animate-spin" /> : (
          <div className="p-10 text-center border-2 border-dashed rounded-xl">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-red-600">وصول مرفوض</h2>
            <p className="text-muted-foreground">هذا الحساب لا يملك صلاحيات الأدمن</p>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center flex-col gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>جاري جلب الطلبات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        حدث خطأ أثناء جلب البيانات: {error.message}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>طلبات الزبائن</CardTitle>
        <CardDescription>
          {orders?.length > 0 ? `إجمالي الطلبات: ${orders.length}` : 'لا توجد طلبات حالياً'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {orders?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>الزبون</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-center">إجراء</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(0, 7).toUpperCase()}</TableCell>
                  <TableCell>{order.shippingAddress?.name || 'مجهول'}</TableCell>
                  <TableCell>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('ar-EG') : 'بدون تاريخ'}</TableCell>
                  <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
                  <TableCell className="text-right">{order.total} SDG</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost"><MoreHorizontal /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {ORDER_STATUSES.map(status => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(order, status)}
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
  );
}

export default function AdminOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart /> إدارة الطلبات
        </h1>
      </div>
      <AdminOrdersContent />
    </div>
  );
}
