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
  quantity?: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const ASYNC_STORAGE_KEY = '@GoMarketplace:products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(async id => {
    const newProducts = [...products];

    const productInCart = newProducts.find(item => item.id === id);
    const productInCartIndex = newProducts.findIndex(item => item.id === id);

    if (productInCart) {
      newProducts.splice(productInCartIndex, 1);
    } else {
      throw new Error('Product not found');
    }

    productInCart.quantity += 1;

    newProducts.push(productInCart);

    setProducts(newProducts);

    await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const decrement = useCallback(async id => {
    const newProducts = [...products];

    const productInCart = newProducts.find(item => item.id === id);
    const productInCartIndex = newProducts.findIndex(item => item.id === id);

    if (productInCart) {
      newProducts.splice(productInCartIndex, 1);
    } else {
      throw new Error('Product not found');
    }

    if (productInCart.quantity <= 1) {
      setProducts(newProducts);
    } else {
      productInCart.quantity -= 1;

      newProducts.push(productInCart);

      setProducts(newProducts);
    }

    await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addToCart = useCallback(async product => {
    const productInCart = products.findIndex(item => item.id === product.id);

    if (productInCart !== -1) {
      increment(product.id);
      return;
    }

    product.quantity = 1;

    products.push(product);
    setProducts([...products]);

    await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(products));
  }, [products, increment]);

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
