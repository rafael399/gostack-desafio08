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
      const storedProducts = await AsyncStorage.getItem(
        ASYNC_STORAGE_KEY,
      );

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  async function saveToStorage(productArray: Product[]): Promise<void> {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEY, JSON.stringify(productArray)
    );
    console.log('acabou');
  }

  const addToCart = useCallback(async product => {
    const itemInCart = products.find(item => item.id === product.id);

    if (!!itemInCart) {
      increment(product.id);
    } else {
      const newProducts = [...products, { ...product, quantity: 1 }];

      setProducts(newProducts);
      // await AsyncStorage.setItem(
      //   ASYNC_STORAGE_KEY, JSON.stringify(newProducts)
      // );
      saveToStorage(newProducts);
    }
      // setProducts(state => [...state, product]);
  }, [products]);

  const increment = useCallback(async id => {
    const newProducts = [...products];
    const addProductIndex = newProducts.findIndex(item => item.id === id);

    newProducts[addProductIndex].quantity++;

    setProducts(newProducts);
    // await AsyncStorage.setItem(
    //   ASYNC_STORAGE_KEY, JSON.stringify(newProducts)
    // );
    saveToStorage(newProducts);
  }, [products]);

  const decrement = useCallback(async id => {
    const newProducts = [...products];
    const removeProductIndex = newProducts.findIndex(item => item.id === id);

    if (newProducts[removeProductIndex].quantity <= 1) {
      newProducts.splice(removeProductIndex, 1);
    } else {
      newProducts[removeProductIndex].quantity--;
    }

    // await AsyncStorage.setItem(
    //   ASYNC_STORAGE_KEY, JSON.stringify(newProducts)
    // );
    setProducts(newProducts);
    saveToStorage(newProducts);
  }, [products]);

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
