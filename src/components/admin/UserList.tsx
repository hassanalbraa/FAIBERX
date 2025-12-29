'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Ban, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type UserProfile = {
  id: string;
  email: string;
  createdAt: any;
  accountNumber?: string;
  isBanned?: boolean;
}

interface UserListProps {
  users: UserProfile[];
  onToggleBan: (userId: string, currentStatus: boolean) => void;
}

export function UserList({ users, onToggleBan }: UserListProps) {
  if (users.length === 0) {
    return <p className="text-muted-foreground text-center py-10">لم يتم العثور على مستخدمين مطابقين لمعايير البحث.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>المستخدم</TableHead>
          <TableHead>رقم الحساب</TableHead>
          <TableHead className="hidden md:table-cell">تاريخ التسجيل</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>
            <span className="sr-only">الإجراءات</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className={user.isBanned ? 'bg-destructive/10' : ''}>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`} />
                        <AvatarFallback>{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.email}</div>
                </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="font-mono">{user.accountNumber || 'N/A'}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {user.createdAt?.toDate().toLocaleDateString('ar-EG') || 'غير معروف'}
            </TableCell>
            <TableCell>
              {user.isBanned ? (
                <Badge variant="destructive">محظور</Badge>
              ) : (
                <Badge variant="outline">نشط</Badge>
              )}
            </TableCell>
            <TableCell>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">قائمة الإجراءات</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                    {user.isBanned ? (
                       <DropdownMenuItem onClick={() => onToggleBan(user.id, user.isBanned || false)}>
                            <CheckCircle className="h-4 w-4 ml-2" />
                            رفع الحظر
                       </DropdownMenuItem>
                    ) : (
                       <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onToggleBan(user.id, user.isBanned || false)}>
                            <Ban className="h-4 w-4 ml-2" />
                            حظر المستخدم
                       </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
