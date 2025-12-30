'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, LogOut, ShoppingCart, Users, CheckCheck } from 'lucide-react';
import AddProductForm from '@/components/admin/AddProductForm';
import { ProductList } from '@/components/admin/ProductList';
import type { Product } from '@/lib/products';
import type { Order } from '@/lib/orders';
import { getAuth, signOut } from 'firebase/auth';
import Link from 'next/link';
import { collection, query } from 'firebase/firestore';

type UserProfile = {
    id: string;
    email: string;
    createdAt: any;
    accountNumber?: string;
    isBanned?: boolean;
}

const mockUsers: UserProfile[] = [
    { id: '1', email: 'user1@example.com', createdAt: new Date(), accountNumber: '123456', isBanned: false },
    { id: '2', email: 'user2@example.com', createdAt: new Date(), accountNumber: '789012', isBanned: true },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Firestore fetching for products
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);
  
  // Firestore fetching for orders to calculate stats
  const ordersQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'orders'));
  }, [firestore]);
  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  // Using mock data for users section
  const usersLoading = false;
  const users = mockUsers;

  const completedOrdersCount = useMemo(() => {
    if (!orders) return 0;
    return orders.filter(order => order.status === 'Delivered').length;
  }, [orders]);


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

  const handleLogout = async () => {
    try {
        const auth = getAuth();
        await signOut(auth);
        router.push('/admin/login');
    } catch(error) {
        console.error("Logout failed:", error);
    }
  };

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">جاري التحقق من صلاحيات الأدمن...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="font-headline text-4xl font-bold">لوحة تحكم المشرف</h1>
            <p className="text-muted-foreground">مرحبًا, {user.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle />
                        إضافة منتج جديد
                    </CardTitle>
                    <CardDescription>املأ النموذج لإضافة منتج إلى متجرك.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddProductForm />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart />
                        طلبات الزبائن
                    </CardTitle>
                     <CardDescription>
                        {ordersLoading ? "جاري تحميل الطلبات..." : `لديك ${orders?.length || 0} طلب إجمالاً.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/admin/orders">عرض الطلبات</Link>
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCheck />
                        الطلبات المكتملة
                    </CardTitle>
                     <CardDescription>
                        {ordersLoading ? "جاري الحساب..." : `تم توصيل ${completedOrdersCount} طلب بنجاح.`}
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users />
                        إدارة المستخدمين
                    </CardTitle>
                    <CardDescription>
                        {usersLoading ? "جاري تحميل عدد المستخدمين..." : `لديك ${users?.length || 0} مستخدم مسجل.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/admin/users">عرض المستخدمين</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
                <CardTitle>قائمة المنتجات</CardTitle>
                <CardDescription>عرض وإدارة منتجاتك الحالية.</CardDescription>
            </CardHeader>
            <CardContent>
                {productsLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <ProductList products={products || []} />
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
