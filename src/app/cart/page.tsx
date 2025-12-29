"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Your Shopping Cart</h1>
        <p className="text-muted-foreground mt-2">{cartCount} items in your cart</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="mt-6">
              <Link href="/products">Start Shopping</Link>
            </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <Card key={item.product.id} className="overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-24 h-32 relative rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="100px"
                      data-ai-hint={item.product.imageHint}
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.product.id}`} className="font-semibold hover:underline">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                    </div>
                     <div className="flex items-center border rounded-md w-fit mt-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                     <p className="font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
                     <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive">
                       <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="font-semibold">Free</span>
                    </div>
                     <div className="flex justify-between text-lg font-bold border-t pt-4">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button asChild size="lg" className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
