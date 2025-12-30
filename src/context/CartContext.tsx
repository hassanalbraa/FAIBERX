"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { type Product } from '@/lib/products';
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';

interface CartItem {
  productId: string; // Storing only ID to keep document lighter
  quantity: number;
  size: string;
}

interface PopulatedCartItem {
    product: Product;
    quantity: number;
    size: string;
    id: string; // Unique ID for cart item (product.id + size)
}

interface CartContextType {
  cartItems: PopulatedCartItem[];
  addToCart: (product: Product, quantity: number, size: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  
  // Fetch all products from firestore to populate cart details
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const [isCartLoading, setIsCartLoading] = useState(true);

  const userCartRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{cart?: CartItem[]}>(userCartRef);

  // Effect to sync remote cart to local state when user logs in or cart changes on remote
  useEffect(() => {
    if (!isUserLoading && user && userProfile) {
        setLocalCart(userProfile.cart || []);
        setIsCartLoading(isProfileLoading || productsLoading);
    } else if (!user && !isUserLoading) {
        // Guest user, cart is already in localCart state
        setIsCartLoading(productsLoading);
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, productsLoading]);

  const updateRemoteCart = useCallback((newCart: CartItem[]) => {
      if (user && userCartRef) {
          updateDocumentNonBlocking(userCartRef, { cart: newCart });
      }
  }, [user, userCartRef]);
  
  const addToCart = (product: Product, quantity: number, size: string) => {
    const cartItemId = product.id + '-' + size;
    let newCart: CartItem[] = [];

    setLocalCart(prevCart => {
        const existingItem = prevCart.find(item => item.productId === product.id && item.size === size);
        if (existingItem) {
            newCart = prevCart.map(item =>
                item.productId === product.id && item.size === size
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            newCart = [...prevCart, { productId: product.id, quantity, size }];
        }
        if (user) {
            updateRemoteCart(newCart);
        }
        return newCart;
    });

    toast({
        title: "أضيف إلى السلة",
        description: `${quantity} x ${product.name} (مقاس: ${size})`,
    });
  };

  const removeFromCart = (cartItemId: string) => {
    const [productId, size] = cartItemId.split('-');
    let newCart: CartItem[] = [];

    setLocalCart(prevCart => {
        newCart = prevCart.filter(item => !(item.productId === productId && item.size === size));
        if (user) {
            updateRemoteCart(newCart);
        }
        return newCart;
    });

    toast({
        title: "تمت الإزالة من السلة",
        variant: "destructive",
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      const [productId, size] = cartItemId.split('-');
      let newCart: CartItem[] = [];
      setLocalCart(prevCart => {
          newCart = prevCart.map(item =>
              item.productId === productId && item.size === size ? { ...item, quantity } : item
          );
          if (user) {
              updateRemoteCart(newCart);
          }
          return newCart;
      });
    }
  };

  const clearCart = () => {
    setLocalCart([]);
    if (user) {
        updateRemoteCart([]);
    }
  };

  const populatedCartItems: PopulatedCartItem[] = useMemo(() => {
    if (!products) return [];
    return localCart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null; // or a placeholder
        return {
            product,
            quantity: item.quantity,
            size: item.size,
            id: `${item.productId}-${item.size}`
        };
    }).filter((item): item is PopulatedCartItem => item !== null);
  }, [localCart, products]);

  const cartCount = useMemo(() => {
    return localCart.reduce((count, item) => count + item.quantity, 0);
  }, [localCart]);

  const cartTotal = useMemo(() => {
     return populatedCartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [populatedCartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems: populatedCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartLoading: isCartLoading || (user && isProfileLoading) || productsLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
