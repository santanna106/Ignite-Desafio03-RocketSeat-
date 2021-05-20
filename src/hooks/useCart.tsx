import { createContext, ReactNode, useContext, useState,useEffect } from 'react';
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
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
     const storagedCart = localStorage.getItem('@RocketShoes:cart');

     //console.log('storagedCart: ', storagedCart);

     if (storagedCart) {
       let storage : Product[] = [];
       storage = storage.concat(JSON.parse(storagedCart));
       return storage;
     }

    return [];
  });

  useEffect(() => {
     function reloadCarg(){
        const storagedCart  = localStorage.getItem('@RocketShoes:cart');
        if(storagedCart){
          let storage : Product[] = [];
          storage = storage.concat(JSON.parse(storagedCart));
          setCart(storage);
        }
        
     }
     reloadCarg();
  },[localStorage])


  const createProduct = async (productId: Number) => {
    try {
      const response = await api.get(`http://localhost:3333/products/${productId}`);
      const newProduct : Product = response.data;
      if(newProduct){
        let cartAux : Product[] = cart;
        cartAux = [...cart , {
                  id: newProduct.id,
                  title: newProduct.title,
                  price: newProduct.price,
                  image: newProduct.image,
                  amount: 1,
                }]
        setCart(prev =>  [...prev,{
                                  id: newProduct.id,
                                  title: newProduct.title,
                                  price: newProduct.price,
                                  image: newProduct.image,
                                  amount: 1,
                                }]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartAux));
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  function VerifyExistsProduct(productId:number){
    const productCart = cart.find((product) => product.id === productId );
    if(productCart){
      return true;
    }
    return false;
  }

  const getCountStokProduct = async (productId:number) => {
    const response = await api.get(`http://localhost:3333/stock/${productId}`);
    const stok : Stock = response.data;

    return stok.amount;
  }

  const ValidateOperationStock = async ({productId,amount} : UpdateProductAmount) => {
    const response = await api.get(`http://localhost:3333/stock/${productId}`);
    const stok : Stock = response.data;
    
    if(stok){
      if(stok.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return false; 
      } 

      if( amount < 1) {
        toast.error('Quantidade solicitada fora de estoque');
        return false; 
      }

      return true;
    } 

    return false;
  }

  const addProduct = async (productId: number) => {
    try {
          
          if(!VerifyExistsProduct(productId)){
            createProduct(productId);
          } else {

            
            let amountUpdate = await getCountStokProduct(productId);
            let ret = true;
            const newCart =  cart.map((product) => {
              if(product.id === productId){
                if(amountUpdate >= (product.amount + 1) )
                  product.amount += 1;
                else 
                  amountUpdate += 1;
              }
      
              return product;
            });

            ret = await ValidateOperationStock({productId:productId,amount:amountUpdate})
            

            if(ret){
              setCart(newCart);
              localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
            }

          }
    } catch (e){
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {

      const existProduct  =  cart.filter((product) => product.id === productId).length;
      
      if( existProduct && existProduct > 0) {
        const newCart = cart.filter((product) => product.id !== productId);
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        throw "Erro na remoção do produto";
      }
      
    } catch (e) {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      let amountUpdate = await getCountStokProduct(productId);
      console.log('amount: ',amount);
      let ret = true;
      ret = await ValidateOperationStock({productId:productId,amount:amount})
      if(ret){
          if(amount > 0){
        
            const newCart = cart.map((product) => {
              if(product.id === productId){
                if(amountUpdate >= ( amount))
                    if(amount > 0){
                      product.amount = amount;
                    }
                      
                else 
                  amountUpdate += amount;
              }

              return product;
            });
            
            if(ret){
              setCart(newCart);
              localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
            }
            
          }

        } 
    } catch (e) {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
