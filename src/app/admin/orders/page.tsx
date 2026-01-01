'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useUser,
  useFirestore,
  updateDocumentNonBlocking,
  useCollection,
  useMemoFirebase
} from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ShoppingCart,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';

import {
  doc,
  query,
  orderBy,
  collectionGroup
} from 'firebase/firestore';

import type { Order, OrderStatus } from '@/lib/orders';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAIL = 'admin@example.com';

/* =========================
   Admin Orders Content
========================= */
function AdminOrdersContent() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const isAdmin =
    !isUserLoading &&
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  /* 🟢 لا ننشئ Query إلا بعد التأكد من الأدمن */
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading || !isAdmin) return null;

    return query(
      collectionGroup(firestore, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, isAdmin, isUserLoading]);

  const {
    data: orders,
    isLoading: isOrdersLoading,
    error
  } = useCollection<Order>(ordersQuery);

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (!firestore) return;

    const orderRef = doc(
      firestore,
      'users',
      order.userId,
      'orders',
      order.id
    );

    updateDocumentNonBlocking(orderRef, { status: newStatus });

    toast({
      title: 'تم التحديث',
      description: `حالة الطلب الآن: ${newStatus}`
    });
  };

  /* ⏳ انتظار تحميل المستخدم */
  if (isUserLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  /* ❌ غير أدمن */
  if (!isAdmin) {
    return (
      <div className="p-10 text-center border-2 border-dashed rounded-xl">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-600">وصول مرفوض</h2>
        <p className="text-muted-foreground">
          هذا الحساب لا يملك صلاحيات الأدمن
        </p>
      </div>
    );
  }

  /* ⏳ تحميل الطلبات */
  if (isOrdersLoading) {
    return (
      <div className="flex h-64 items-center justify-center flex-col gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>جاري جلب الطلبات...</p>
      </div>
    );
  }

  /* ❌ خطأ */
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
          {orders && orders.length > 0
            ? `إجمالي الطلبات: ${orders.length}`
            : 'لا توجد طلبات حالياً'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {orders && orders.length > 0 ? (
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
                  <TableCell className="font-medium">
                    #{order.id.slice(0, 7).toUpperCase()}
                  </TableCell>

                  <TableCell>
                    {order.shippingAddress?.name || 'مجهول'}
                  </TableCell>

                  <TableCell>
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleDateString('ar-EG')
                      : 'بدون تاريخ'}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{order.status}</Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {order.total} SDG
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order, 'Delivered')
                          }
                        >
                          تم التوصيل
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order, 'Cancelled')
                          }
                        >
                          إلغاء
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            لا توجد طلبات لعرضها
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================
   Page
========================= */
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
