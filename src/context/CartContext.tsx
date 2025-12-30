"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { type Product } from '@/lib/products';
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, collection, query, writeBatch } from 'firebase/firestore';

interface CartItem {
  productId: string;
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

const CART_LOCAL_STORAGE_KEY = 'firebase-studio-cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const userRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{cart?: CartItem[]}>(userRef);

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      const storedCart = localStorage.getItem(CART_LOCAL_STORAGE_KEY);
      if (storedCart) {
        setLocalCart(JSON.parse(storedCart));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && userProfile && firestore) {
      let localCartData: CartItem[] = [];
      const storedCart = localStorage.getItem(CART_LOCAL_STORAGE_KEY);
      if (storedCart) {
        localCartData = JSON.parse(storedCart);
      }
      
      const remoteCartData = userProfile.cart || [];

      if (localCartData.length > 0) {
        // Merge local and remote carts
        const mergedCart = [...remoteCartData];
        localCartData.forEach(localItem => {
          const existingItemIndex = mergedCart.findIndex(
            item => item.productId === localItem.productId && item.size === localItem.size
          );
          if (existingItemIndex > -1) {
            mergedCart[existingItemIndex].quantity += localItem.quantity;
          } else {
            mergedCart.push(localItem);
          }
        });
        
        setLocalCart(mergedCart);
        updateDocumentNonBlocking(userRef!, { cart: mergedCart });
        localStorage.removeItem(CART_LOCAL_STORAGE_KEY);
      } else {
        setLocalCart(remoteCartData);
      }
    } else if (!user && !isUserLoading) {
      const storedCart = localStorage.getItem(CART_LOCAL_STORAGE_KEY);
      setLocalCart(storedCart ? JSON.parse(storedCart) : []);
    }
  }, [user, userProfile, isUserLoading, firestore, userRef]);

  const updateCart = useCallback((newCart: CartItem[]) => {
    setLocalCart(newCart);
    if (user && userRef) {
      updateDocumentNonBlocking(userRef, { cart: newCart });
    } else if (typeof window !== 'undefined') {
      localStorage.setItem(CART_LOCAL_STORAGE_KEY, JSON.stringify(newCart));
    }
  }, [user, userRef]);
  
  const addToCart = (product: Product, quantity: number, size: string) => {
    const newCart = [...localCart];
    const existingItemIndex = newCart.findIndex(item => item.productId === product.id && item.size === size);

    if (existingItemIndex > -1) {
      newCart[existingItemIndex].quantity += quantity;
    } else {
      newCart.push({ productId: product.id, quantity, size });
    }
    
    updateCart(newCart);

    toast({
        title: "أضيف إلى السلة",
        description: `${quantity} x ${product.name} (مقاس: ${size})`,
    });
  };

  const removeFromCart = (cartItemId: string) => {
    const [productId, size] = cartItemId.split('-');
    const newCart = localCart.filter(item => !(item.productId === productId && item.size === size));
    updateCart(newCart);
    
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
      const newCart = localCart.map(item =>
          item.productId === productId && item.size === size ? { ...item, quantity } : item
      );
      updateCart(newCart);
    }
  };

  const clearCart = () => {
    updateCart([]);
  };

  const populatedCartItems: PopulatedCartItem[] = useMemo(() => {
    if (!products) return [];
    return localCart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
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
  
  const isCartLoading = isUserLoading || (user && isProfileLoading) || productsLoading;

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
        isCartLoading,
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
