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
import { doc, query, orderBy, collectionGroup, collection } from 'firebase/firestore';
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

// تأكد أن هذا الإيميل مطابق تماماً لما في Firebase
const ADMIN_EMAIL = 'admin@example.com';

function AdminOrdersContent() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const allOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    
    // الحل: سنقوم بجلب الطلبات من الـ collectionGroup 
    // إذا لم تظهر البيانات، فالمشكلة غالباً في حقل createdAt
    try {
      return query(
        collectionGroup(firestore, 'orders'), 
        orderBy('createdAt', 'desc')
      );
    } catch (e) {
      console.error("خطأ في الاستعلام:", e);
      return null;
    }
  }, [firestore, isAdmin]);

  const { data: orders, isLoading: isOrdersLoading, error } = useCollection<Order>(allOrdersQuery);

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (!firestore) return;
    // تحديث المسار ليشمل معرف المستخدم والطلب
    const orderRef = doc(firestore, 'users', order.userId, 'orders', order.id);
    updateDocumentNonBlocking(orderRef, { status: newStatus });
    toast({ title: "تم التحديث", description: `حالة الطلب الآن: ${newStatus}` });
  }

  if (isOrdersLoading) {
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
          {orders && orders.length > 0 ? `إجمالي الطلبات: ${orders.length}` : 'لم يتم العثور على طلبات في نظام المجموعات الفرعية.'}
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
                  <TableCell className="font-medium">#{order.id.slice(0, 7).toUpperCase()}</TableCell>
                  <TableCell>{order.shippingAddress?.name || 'مجهول'}</TableCell>
                  <TableCell>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('ar-EG') : 'بدون تاريخ'}</TableCell>
                  <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
                  <TableCell className="text-right">{order.total} SDG</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange(order, 'Delivered')}>تم التوصيل</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order, 'Cancelled')}>إلغاء</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">لا توجد طلبات لعرضها حالياً.</p>
            <p className="text-xs text-muted-foreground mt-2">تأكد من أن حقل "createdAt" موجود في كل طلب داخل Firestore.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminOrdersPage() {
  const { user, isUserLoading } = useUser();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (isUserLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart /> إدارة الطلبات
        </h1>
        <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
          الأدمن: {user?.email}
        </div>
      </div>
      
      {isAdmin ? <AdminOrdersContent /> : (
        <div className="p-10 text-center border-2 border-dashed rounded-xl">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-red-600">وصول مرفوض</h2>
          <p className="text-muted-foreground">هذا الحساب لا يملك صلاحيات الأدمن.</p>
        </div>
      )}
    </div>
  );
}
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
