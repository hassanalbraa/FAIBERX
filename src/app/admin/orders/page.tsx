'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { Loader2, ShoppingCart, AlertCircle, Eye, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/orders';

const ADMIN_UID = "5Kp5lbgb8fOJSr0OS5p1J4MMg2q1";

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // التحقق من الأدمن بشكل آمن
  const isAdmin = useMemo(() => {
    return !isUserLoading && user?.uid === ADMIN_UID;
  }, [user, isUserLoading]);

  // بناء الاستعلام بشكل آمن
  const ordersQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    try {
      return firestore.collection('orders').orderBy('createdAt', 'desc');
    } catch (err) {
      console.error("Firestore Query Error:", err);
      return null;
    }
  }, [firestore, isAdmin]);

  const { data: orders, isLoading, error } = useCollection<Order>(ordersQuery);

  // 1. حالة تحميل المستخدم
  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground animate-pulse">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  // 2. حالة عدم وجود صلاحيات
  if (!isAdmin) {
    return (
      <div className="container max-w-md mx-auto mt-20 p-6 text-center border rounded-xl shadow-sm bg-card">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">وصول مرفوض</h2>
        <p className="text-muted-foreground mb-6">هذا الحساب لا يملك صلاحيات الإدارة المطلوبة.</p>
        <Button onClick={() => router.push('/')} className="w-full">العودة للرئيسية</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10" dir="rtl">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="text-primary" /> إدارة الطلبات
          </h1>
          <p className="text-muted-foreground mt-1">عرض وإدارة جميع طلبات العملاء</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">إجمالي الطلبات: {orders?.length || 0}</span>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-xl">سجل العمليات</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-destructive">
              <AlertCircle className="mx-auto mb-2" />
              <p>حدث خطأ أثناء جلب البيانات: {error.message}</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">الزبون</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                    <TableHead className="text-center">إجراء</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-mono font-bold text-xs">
                        #{order.id?.slice(0, 8).toUpperCase() || 'N/A'}
                      </TableCell>
                      
                      <TableCell className="font-medium">
                        {order.shippingAddress?.name || 'مستخدم غير معروف'}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {order.createdAt?.toDate 
                          ? order.createdAt.toDate().toLocaleDateString('ar-EG', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            }) 
                          : '—'}
                      </TableCell>

                      <TableCell>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status || 'معلق'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-left font-bold text-primary">
                        {(order.total || 0).toLocaleString()} SDG
                      </TableCell>

                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="hover:text-primary"
                        >
                          <Eye className="h-4 w-4 ml-1" /> تفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-24">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">لا توجد طلبات</h3>
              <p className="text-muted-foreground">ستظهر الطلبات الجديدة هنا فور وصولها.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
