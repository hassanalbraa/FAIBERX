'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, updateDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, MoreHorizontal, CheckCircle, Truck, XCircle, PauseCircle, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { doc, query, orderBy, collectionGroup } from 'firebase/firestore';
import type { Order, OrderStatus } from '@/lib/orders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';

// ⚠️ تأكد من أن هذا هو إيميلك المسجل في Firebase تماماً
const ADMIN_EMAIL = 'admin@example.com';

function AdminOrdersContent() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();
  
  // التحقق من الأدمن (بدون طرد من الصفحة)
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const allOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collectionGroup(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore, isAdmin]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(allOrdersQuery);

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'users', order.userId, 'orders', order.id);
    updateDocumentNonBlocking(orderRef, { status: newStatus });
    toast({
        title: "تم تحديث الحالة",
        description: `تم تغيير حالة الطلب إلى ${newStatus}`,
    });
  }

  if (isOrdersLoading) {
      return (
          <div className="flex h-64 items-center justify-center flex-col gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>جاري سحب الطلبات من قاعدة البيانات...</p>
          </div>
      )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>جميع الطلبات</CardTitle>
            <CardDescription>
                {orders && orders.length > 0
                ? `لديك ${orders.length} طلب إجمالاً.`
                : 'لا توجد طلبات لعرضها حاليًا (تأكد من وجود مجموعة orders في Firestore).'}
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
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="w-[100px] text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(0, 7).toUpperCase()}</TableCell>
                    <TableCell>{order.shippingAddress?.name || 'غير معروف'}</TableCell>
                    <TableCell>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('ar-EG') : 'بلا تاريخ'}</TableCell>
                    <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                    <TableCell className="text-right">{order.total} SDG</TableCell>
                    <TableCell className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStatusChange(order, 'Delivered')}>تم التوصيل</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(order, 'Cancelled')} className="text-destructive">إلغاء</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                <p className="mt-4 text-muted-foreground">الجدول فارغ. تأكد من أن الفهرس (Index) يعمل.</p>
            </div>
          )}
        </CardContent>
      </Card>
  );
}

export default function AdminOrdersPage() {
  const { user, isUserLoading } = useUser();
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        setDebugInfo("❌ لا يوجد مستخدم مسجل دخول حالياً.");
      } else if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setDebugInfo(`⚠️ المستخدم الحالي (${user.email}) ليس هو الأدمن (${ADMIN_EMAIL}).`);
      } else {
        setDebugInfo("✅ أنت مسجل كأدمن. جاري عرض البيانات...");
      }
    }
  }, [user, isUserLoading]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>جاري التحقق من الهوية...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 p-4 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-blue-500" />
        <p className="text-sm font-mono">{debugInfo}</p>
      </div>

      <div className="mb-12">
        <h1 className="text-4xl font-bold flex items-center gap-4">
          <ShoppingCart className="h-10 w-10" />
          إدارة الطلبات
        </h1>
      </div>
      
      {user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? (
        <AdminOrdersContent />
      ) : (
        <div className="p-8 text-center border rounded-lg bg-red-50 text-red-600">
           يجب تسجيل الدخول بحساب الأدمن لتتمكن من رؤية محتوى هذا الجدول.
        </div>
      )}
    </div>
  );
}
