'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

/* =======================
   TYPES
   ======================= */

export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
};

export type CartItem = {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  size?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  cartTotal: number;
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
};

/* =======================
   CONTEXT
   ======================= */

const CartContext = createContext<CartContextType | undefined>(undefined);

/* =======================
   PROVIDER
   ======================= */

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /* 🔁 Load from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  /* 💾 Save to localStorage */
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /* ➕ ADD TO CART */
  const addToCart = (product: Product, size?: string) => {
    setCartItems(prev => {
      const existing = prev.find(
        item =>
          item.product.id === product.id &&
          item.size === size
      );

      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image:
              product.image ||
              product.images?.[0] ||
              '/placeholder.png',
          },
          quantity: 1,
          size,
        },
      ];
    });
  };

  /* ➖ REMOVE ITEM */
  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev =>
      prev.filter(item => item.id !== cartItemId)
    );
  };

  /* 🧹 CLEAR CART */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  /* 💰 TOTAL */
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =======================
   HOOK
   ======================= */

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
