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
  console.log('############### CartProvider #############');

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@MarketPlace:products',
      );
      if (productsStorage) setProducts(JSON.parse(productsStorage));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let productsData: Product[] = [];
      console.log('products Initr', products);

      const productExist = products.find(item => item.id === product.id);
      console.log('productExist', productExist);

      if (productExist) {
        productExist.quantity += 1;
        productsData = [...products];
      } else {
        productsData = [...products, { ...product, quantity: 1 }];
      }
      console.log('productsData', productsData);

      await AsyncStorage.setItem(
        '@MarketPlace:products',
        JSON.stringify(productsData),
      );

      setProducts([...productsData]);
    },
    [products],
  );

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

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
