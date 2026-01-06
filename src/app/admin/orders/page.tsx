'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { Loader2, ShoppingCart, AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // تأكد من تثبيت مكون Badge
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/orders';

const ADMIN_UID = "5Kp5lbgb8fOJSr0OS5p1J4MMg2q1";

// دالة مساعدة لتلوين الحالة
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed': return <Badge className="bg-green-500">مكتمل</Badge>;
    case 'pending': return <Badge variant="outline" className="text-amber-500 border-amber-500">قيد الانتظار</Badge>;
    case 'cancelled': return <Badge variant="destructive">ملغي</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const isAdmin = !isUserLoading && user?.uid === ADMIN_UID;

  const ordersQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    // تأكد من وجود Index في Firestore لهذا الاستعلام
    return firestore.collection('orders').orderBy('createdAt', 'desc');
  }, [firestore, isAdmin]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  if (isUserLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="container max-w-2xl mx-auto mt-20">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold text-destructive mb-2">وصول مرفوض</h2>
            <p className="text-muted-foreground mb-6">عذراً، لا تملك الصلاحيات الكافية لدخول لوحة التحكم.</p>
            <Button onClick={() => router.push('/')}>العودة للرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10" dir="rtl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" /> إدارة الطلبات
          </h1>
          <p className="text-muted-foreground mt-1">مراقبة وتحديث جميع طلبات المتجر</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <CardTitle>سجل الطلبات</CardTitle>
          <CardDescription>
            {isLoading ? 'جاري جلب البيانات...' : `إجمالي العمليات: ${orders?.length || 0}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">رقم الطلب</TableHead>
                    <TableHead>الزبون</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono font-medium text-xs">
                        #{order.id.slice(-7).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.shippingAddress?.name || 'مجهول'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('ar-EG') : '—'}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-left font-bold">
                        {order.total?.toLocaleString()} SDG
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4" /> عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">لا توجد طلبات مسجلة في النظام حالياً.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
