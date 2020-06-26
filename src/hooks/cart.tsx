import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
  clearCart(): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('@GoMarketPlace');

      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);
      const product = products[index];

      if (product) {
        product.quantity += 1;
        products[index] = product;

        setProducts([...products]);
        await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);
      const product = products[index];

      if (product) {
        if (product.quantity === 1) {
          products.splice(index, 1);
        } else {
          product.quantity -= 1;
          products[index] = product;
        }

        setProducts([...products]);
        await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productOnList = products.find(({ id }) => id === product.id);

      if (productOnList) {
        increment(product.id);
      } else {
        setProducts([
          ...products,
          {
            id: product.id,
            title: product.title,
            image_url: product.image_url,
            price: product.price,
            quantity: 1,
          },
        ]);

        await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
      }
    },
    [products, increment],
  );

  const clearCart = useCallback(() => {
    setProducts([]);
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, clearCart, products }),
    [products, addToCart, increment, decrement, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
