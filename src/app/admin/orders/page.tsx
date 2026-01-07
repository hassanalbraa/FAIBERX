'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy } from 'firebase/firestore';

import { useUser, useFirestore, useCollection } from '@/firebase';
import type { Order } from '@/lib/orders';

import {
  Loader2,
  ShoppingCart,
  AlertCircle,
  Eye,
  Package
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ADMIN_UID = '5Kp5lbgb8fOJSr0OS5p1J4MMg2q1';

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // ===== تحقق الأدمن =====
  const isAdmin = useMemo(() => {
    return !isUserLoading && user?.uid === ADMIN_UID;
  }, [user, isUserLoading]);

  // ===== استعلام الطلبات (Firebase v9) =====
  const ordersQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;

    return query(
      collection(firestore, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, isAdmin]);

  const { data: orders, isLoading, error } =
    useCollection<Order>(ordersQuery);

  // ===== تحميل المستخدم =====
  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">
          جاري التحقق من الصلاحيات...
        </p>
      </div>
    );
  }

  // ===== ليس أدمن =====
  if (!isAdmin) {
    return (
      <div className="container max-w-md mx-auto mt-20 p-6 text-center border rounded-xl">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">
          وصول مرفوض
        </h2>
        <p className="text-muted-foreground mb-6">
          الحساب دا ما عنده صلاحيات أدمن
        </p>
        <Button onClick={() => router.push('/')} className="w-full">
          الرجوع
        </Button>
      </div>
    );
  }

  // ===== الصفحة =====
  return (
    <div className="container mx-auto px-4 py-10" dir="rtl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart /> إدارة الطلبات
        </h1>
        <span className="text-sm font-medium">
          عدد الطلبات: {orders?.length || 0}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الطلبات</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-10 text-center text-destructive">
              خطأ: {error.message}
            </div>
          ) : orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم</TableHead>
                  <TableHead className="text-right">الزبون</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-left">المبلغ</TableHead>
                  <TableHead className="text-center">تفاصيل</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      #{order.id?.slice(0, 8)}
                    </TableCell>

                    <TableCell>
                      {order.shippingAddress?.name || 'غير معروف'}
                    </TableCell>

                    <TableCell>
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString('ar')
                        : '—'}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'completed'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {order.status || 'pending'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-left font-bold">
                      {(order.total || 0).toLocaleString()} SDG
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          router.push(`/admin/orders/${order.id}`)
                        }
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-20 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              لا توجد طلبات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
