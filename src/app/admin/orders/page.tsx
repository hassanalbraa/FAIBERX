'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, updateDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, MoreHorizontal, CheckCircle, Truck, XCircle, PauseCircle, Mail, MessageSquare } from 'lucide-react';
import { doc, collection, query, orderBy, collectionGroup } from 'firebase/firestore';
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

// إيميل الأدمن الموحد - يفضل وضعه في متغير ثابت لتجنب أخطاء الكتابة
const ADMIN_EMAIL = 'admin@example.com';

function AdminOrdersContent() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();
  
  // التحقق من الأدمن هنا أيضاً لضمان عدم تنفيذ الاستعلام إلا للشخص المصرح له
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const allOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collectionGroup(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore, isAdmin]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(allOrdersQuery);

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (!firestore) {
        toast({ 
            title: "خطأ في قاعدة البيانات",
            description: "لا يمكن تحديث الطلب حاليًا.",
            variant: "destructive"
        });
        return;
    };
    const orderRef = doc(firestore, 'users', order.userId, 'orders', order.id);
    updateDocumentNonBlocking(orderRef, { status: newStatus });
    toast({
        title: "تم تحديث حالة الطلب",
        description: `تم تغيير حالة الطلب #${order.id.slice(0,7).toUpperCase()} إلى "${newStatus}".`,
    });
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped':
      case 'Out for Delivery': return 'secondary';
      case 'Cancelled':
      case 'Suspended': return 'destructive';
      default: return 'outline';
    }
  };
  
  if (isOrdersLoading) {
      return (
          <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
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
                : 'لا توجد طلبات لعرضها حاليًا.'}
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
                    <TableCell className="font-medium">
                        <Link href={`/orders/${order.id}?userId=${order.userId}`} className="hover:underline">#{order.id.slice(0, 7).toUpperCase()}</Link>
                    </TableCell>
                    <TableCell>{order.shippingAddress.name}</TableCell>
                    <TableCell>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('ar-EG') : 'غير متوفر'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.total.toFixed(2)} SDG</TableCell>
                    <TableCell className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">قائمة الإجراءات</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                                <DropdownMenuItem asChild><Link href={`/orders/${order.id}?userId=${order.userId}`}>عرض التفاصيل</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>تواصل مع الزبون</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <a href={`mailto:${order.shippingAddress.email}`}>
                                    <Mail className="ml-2 h-4 w-4"/>
                                    عبر البريد الإلكتروني
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={`https://wa.me/${order.shippingAddress.whatsappNumber?.replace(/\s/g, '').replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                                    <MessageSquare className="ml-2 h-4 w-4" />
                                    عبر واتساب
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                 <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>تغيير الحالة</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order, 'Processing')}>
                                            <CheckCircle className="ml-2 h-4 w-4" />
                                            قيد المعالجة
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order, 'Shipped')}>
                                            <Truck className="ml-2 h-4 w-4" />
                                            تم الشحن
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order, 'Out for Delivery')}>
                                            <Truck className="ml-2 h-4 w-4" />
                                            قيد التوصيل
                                        </DropdownMenuItem>
                                         <DropdownMenuItem onClick={() => handleStatusChange(order, 'Delivered')}>
                                            <CheckCircle className="ml-2 h-4 w-4" />
                                            تم التوصيل
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-amber-600 focus:text-amber-700" onClick={() => handleStatusChange(order, 'Suspended')}>
                                    <PauseCircle className="ml-2 h-4 w-4" />
                                    تعليق الطلب
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleStatusChange(order, 'Cancelled')}>
                                    <XCircle className="ml-2 h-4 w-4" />
                                    رفض الطلب
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
  );
}

export default function AdminOrdersPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  // التحقق من الأدمن مع تحويل الأحرف لصغيرة لتجنب أخطاء المطابقة
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  useEffect(() => {
    // التعديل الجوهري: لا نتخذ أي قرار إلا بعد انتهاء التحميل بالكامل
    if (!isUserLoading) {
      if (!user) {
        // إذا انتهى التحميل ولم نجد مستخدماً، نذهب لصفحة الدخول
        router.replace('/admin/login');
      } else if (!isAdmin) {
        // إذا وجدنا مستخدماً ولكن الإيميل غير مطابق، نذهب لصفحة الحساب
        // نصيحة: يمكنك تعطيل هذا السطر مؤقتاً بوضع // قبله إذا أردت التأكد
        router.replace('/account');
      }
    }
  }, [user, isUserLoading, isAdmin, router]);

  // حالة الانتظار الأولي لضمان عدم ظهور "ومضة" البيانات
  if (isUserLoading || (user && !isAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">جاري التحقق من صلاحيات الأدمن...</p>
      </div>
    );
  }

  // إذا لم يكن هناك يوزر ولا يزال يحمل، نظهر أيضاً صفحة التحميل
  if (!user && !isUserLoading) return null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold flex items-center gap-4">
          <ShoppingCart className="h-10 w-10" />
          طلبات الزبائن
        </h1>
        <p className="text-muted-foreground mt-2">عرض وإدارة جميع الطلبات الواردة.</p>
      </div>
      <AdminOrdersContent />
    </div>
  );
}
