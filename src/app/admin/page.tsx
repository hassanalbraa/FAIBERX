'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, LogOut, ShoppingCart, Users } from 'lucide-react';
import AddProductForm from '@/components/admin/AddProductForm';
import { ProductList } from '@/components/admin/ProductList';
import type { Product } from '@/lib/products';
import type { Order } from '@/lib/orders';
import { getAuth, signOut } from 'firebase/auth';
import { collection, query, collectionGroup } from 'firebase/firestore';

type UserProfile = {
  id: string;
  email: string;
  createdAt: any;
  accountNumber?: string;
  isBanned?: boolean;
}

// UID الأدمن (متطابق مع Firestore Rules)
const ADMIN_UID = "5Kp5lbgb8fOJSr0OS5p1J4MMg2q1";

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // ===== تحقق الأدمن =====
  const isAdmin = useMemo(() => {
    return !isUserLoading && user?.uid === ADMIN_UID;
  }, [user, isUserLoading]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push('/admin/login');
    } catch(error) {
      console.error("Logout failed:", error);
    }
  };

  // ===== Products =====
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  // ===== Orders =====
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collectionGroup(firestore, 'orders'));
  }, [firestore, isAdmin]);
  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  // ===== Users =====
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, isAdmin]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const completedOrdersCount = useMemo(() => {
    if (!orders) return 0;
    return orders.filter(order => order.status === 'Delivered').length;
  }, [orders]);

  // ===== Loading user =====
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

  // ===== Not admin =====
  if (!isAdmin) {
    return (
      <div className="container max-w-md mx-auto mt-20 p-6 text-center border rounded-xl">
        <p className="text-destructive text-lg font-bold mb-4">وصول مرفوض</p>
        <p className="text-muted-foreground mb-6">هذا الحساب لا يملك صلاحيات الأدمن</p>
        <Button onClick={() => router.push('/')} className="w-full">الرجوع للرئيسية</Button>
      </div>
    );
  }

  // ===== Dashboard =====
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          لوحة التحكم
        </h1>

        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 ml-2" />
          تسجيل خروج
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : products?.length ?? 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : orders?.length ?? 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : users?.length ?? 0}
          </CardContent>
        </Card>
      </div>

      {/* Products management */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <PlusCircle className="h-5 w-5" /> إدارة المنتجات
        </h2>
        <AddProductForm />
        <ProductList products={products || []} isLoading={productsLoading} />
      </div>
    </div>
  );
}
