'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, MoreHorizontal, CheckCircle, Truck, XCircle, PauseCircle } from 'lucide-react';
import { mockOrders as initialOrders, Order, OrderStatus } from '@/lib/orders';
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

export default function AdminOrdersPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>(initialOrders);

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

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
    toast({
        title: "تم تحديث حالة الطلب",
        description: `تم تغيير حالة الطلب #${orderId} إلى "${newStatus}".`,
    });
  }

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
      case 'Cancelled':
      case 'Suspended':
        return 'destructive';
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
                {orders.length > 0
                ? `لديك ${orders.length} طلبات إجمالاً.`
                : 'لا توجد طلبات لعرضها حاليًا.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
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
                        <Link href={`/orders/${order.id}`} className="hover:underline">#{order.id}</Link>
                    </TableCell>
                    <TableCell>{order.shippingAddress.name}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('ar-EG')}</TableCell>
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
                                <DropdownMenuItem asChild><Link href={`/orders/${order.id}`}>عرض التفاصيل</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><a href={`mailto:${order.shippingAddress.email}`}>تواصل مع الزبون</a></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                 <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>تغيير الحالة</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Processing')}>
                                            <CheckCircle className="ml-2 h-4 w-4" />
                                            قيد المعالجة
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Shipped')}>
                                            <Truck className="ml-2 h-4 w-4" />
                                            تم الشحن
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Out for Delivery')}>
                                            <Truck className="ml-2 h-4 w-4" />
                                            قيد التوصيل
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-amber-600 focus:text-amber-700" onClick={() => handleStatusChange(order.id, 'Suspended')}>
                                    <PauseCircle className="ml-2 h-4 w-4" />
                                    تعليق الطلب
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleStatusChange(order.id, 'Cancelled')}>
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
    </div>
  );
}
