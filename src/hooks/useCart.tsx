import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  createProduct: (product: Product) =>  Promise<void>;
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
     const storagedCart = localStorage.getItem('@RocketShoes:cart');

     console.log('CART HOOK',storagedCart);

     if (storagedCart) {
       return JSON.parse(storagedCart);
     }

    return [];
  });

  const createProduct = async (product: Product) => {
    try {
     setCart(prev => [...prev,product]);
      //console.log('CART INTERNO : ',[...cart,product]);
      await localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
    } catch {
      // TODO
    }
  };

  const addProduct = async (productId: number) => {
    try {
     
      const newCart = cart.map((product) => {
        if(product.id === productId){
          product.amount += 1;
          product.price  +=product.price;
        }

        return product;
      });

      setCart(newCart);
      await localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart,createProduct, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
