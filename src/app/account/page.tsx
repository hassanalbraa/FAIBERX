import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ListOrdered, MapPin, User, LogOut } from "lucide-react"

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">My Account</h1>
            <p className="text-muted-foreground mt-2">Welcome back, Fashionista!</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                 <Card>
                    <CardContent className="p-4">
                        <nav className="flex flex-col space-y-1">
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/account"><User className="mr-2 h-4 w-4" />Profile</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start bg-secondary" asChild>
                                <Link href="/orders/track"><ListOrdered className="mr-2 h-4 w-4" />Order History</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="#"><MapPin className="mr-2 h-4 w-4" />Saved Addresses</Link>
                            </Button>
                             <Separator className="my-2" />
                             <Button variant="ghost" className="justify-start text-destructive hover:text-destructive" asChild>
                                <Link href="/"><LogOut className="mr-2 h-4 w-4" />Logout</Link>
                            </Button>
                        </nav>
                    </CardContent>
                 </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>View your past and current orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                            <div className="p-4 flex justify-between items-center hover:bg-secondary/50">
                                <div>
                                    <p className="font-semibold">Order #TOC12345</p>
                                    <p className="text-sm text-muted-foreground">Placed on: May 20, 2024</p>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/orders/TOC12345">Track Order</Link>
                                </Button>
                            </div>
                            <Separator />
                            <div className="p-4 flex justify-between items-center hover:bg-secondary/50">
                                <div>
                                    <p className="font-semibold">Order #TOC67890</p>
                                    <p className="text-sm text-muted-foreground">Placed on: April 15, 2024</p>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/orders/TOC67890">View Details</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
