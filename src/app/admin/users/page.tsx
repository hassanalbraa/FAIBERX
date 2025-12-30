
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Users, Search } from 'lucide-react';
import { doc, collection, query } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { UserList } from '@/components/admin/UserList';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
    id: string;
    email: string;
    createdAt: any;
    accountNumber?: string;
    isBanned?: boolean;
    firstName?: string;
    lastName?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.email === 'admin@example.com';

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, isAdmin]);

  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.replace('/admin/login');
      } else if (!isAdmin) {
        router.replace('/account');
      }
    }
  }, [user, isUserLoading, isAdmin, router]);

  const handleToggleBan = (userId: string, currentStatus: boolean) => {
    if (!firestore) {
        toast({ title: "لا يمكن تحديث المستخدم (قاعدة بيانات غير متاحة)" });
        return;
    }
    const userRef = doc(firestore, 'users', userId);
    const newStatus = !currentStatus;
    updateDocumentNonBlocking(userRef, { isBanned: newStatus });
    toast({
      title: `تم ${newStatus ? 'حظر' : 'رفع الحظر عن'} المستخدم`,
      description: `تم تحديث حالة المستخدم بنجاح.`,
      variant: newStatus ? 'destructive' : 'default',
    });
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => 
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (u.accountNumber && u.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.firstName && u.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.lastName && u.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const isLoading = isUserLoading || !isAdmin;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">جاري التحقق من صلاحيات الأدمن...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold flex items-center gap-4">
            <Users className="h-10 w-10" />
            إدارة المستخدمين
        </h1>
        <p className="text-muted-foreground mt-2">عرض والبحث وإدارة حسابات المستخدمين.</p>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <CardTitle>قائمة المستخدمين</CardTitle>
                    <CardDescription>
                        {usersLoading ? "جاري التحميل..." : `إجمالي ${filteredUsers.length} من ${users?.length || 0} مستخدم.`}
                    </CardDescription>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="ابحث بالاسم، البريد، أو رقم الحساب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {usersLoading ? (
                 <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <UserList users={filteredUsers} onToggleBan={handleToggleBan} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
