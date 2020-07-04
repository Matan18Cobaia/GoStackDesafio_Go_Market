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
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prods = await AsyncStorage.getItem('@GoMarket:prods');
      prods ? setProducts(JSON.parse(prods)) : null;
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const index = products.findIndex(item => item.id === product.id);
      if (index < 0) {
        const prod = { ...product, quantity: 1 };
        const list = [...products, prod];
        setProducts(list);
        await AsyncStorage.setItem('@GoMarket:prod', JSON.stringify(list));
      } else {
        const list = products;
        const [prod] = list.splice(index, 1);
        // eslint-disable-next-line no-plusplus
        prod.quantity++;
        setProducts([...list, prod]);
        await AsyncStorage.setItem(
          '@GoMarket:prod',
          JSON.stringify([...list, prod]),
        );
      }
    },
    [products],
  );
  const increment = useCallback(
    async id => {
      const index = products.findIndex(item => item.id === id);
      if (index >= 0) {
        const list = products;
        const [prod] = list.splice(index, 1);
        // eslint-disable-next-line no-plusplus
        prod.quantity++;
        setProducts([...list, prod]);
        await AsyncStorage.setItem(
          '@GoMarket:prod',
          JSON.stringify([...list, prod]),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(item => item.id === id);
      if (index >= 0) {
        const list = products;
        const [prod] = list.splice(index, 1);
        // eslint-disable-next-line no-plusplus
        prod.quantity--;
        if (prod.quantity === 0) {
          setProducts([...list]);
          await AsyncStorage.setItem('@GoMarket:prod', JSON.stringify([list]));
        } else {
          setProducts([...list, prod]);
          await AsyncStorage.setItem(
            '@GoMarket:prod',
            JSON.stringify([...list, prod]),
          );
        }
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
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
