"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser, initiateEmailSignIn } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/admin');
        }
    }, [user, isUserLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "تم تسجيل الدخول بنجاح",
                description: "جاري توجيهك إلى لوحة التحكم.",
            });
            router.push('/admin');
        } catch (error: any) {
            console.error("Admin login failed:", error);
            toast({
                variant: "destructive",
                title: "فشل تسجيل الدخول",
                description: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // In a real app, you'd want a better loading state
    if (isUserLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="container mx-auto px-4 py-16 md:py-24 flex items-center justify-center min-h-[70vh]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">دخول المشرف</CardTitle>
                    <CardDescription>
                        استخدم بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                             />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            تسجيل الدخول
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <p className="text-muted-foreground">هذه منطقة محظورة.</p>
                        <Link href="/" className="underline">
                            العودة إلى المتجر
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
import { signInWithEmailAndPassword } from "firebase/auth";
