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
      const productsStorage = await AsyncStorage.getItem(
        '@MarketPlace:products',
      );
      if (productsStorage) setProducts([...JSON.parse(productsStorage)]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {

      console.log('passou', product);

      let productsData: Product[] = [];
      const productExist = products.find(item => item.id === product.id);

      if (productExist) {
        productExist.quantity += 1;
        productsData = [...products];
      } else {
        productsData = [...products, { ...product, quantity: 1 }];
      }

      await AsyncStorage.setItem(
        '@MarketPlace:products',
        JSON.stringify(productsData),
      );

      setProducts([...productsData]);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productExist = products.find(item => item.id === id);
      if (!productExist) return;
      productExist.quantity += 1;

      await AsyncStorage.setItem(
        '@MarketPlace:products',
        JSON.stringify(products),
      );

      setProducts([...products]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(item => item.id === id);
      if (index === undefined) return;

      products[index].quantity -= 1;

      if (!products[index].quantity) {
        products.splice(index, 1);
      }
      await AsyncStorage.setItem(
        '@MarketPlace:products',
        JSON.stringify(products),
      );

      setProducts([...products]);
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
