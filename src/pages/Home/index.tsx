import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
   const { addProduct,createProduct, cart } = useCart();


  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = product.amount;

  return sumAmount
 }, {} as CartItemsAmount) 

   /* Método Alternativo
   const cartItemsAmount = cart.reduce((sumAmount, product) => {
      sumAmount.splice(product.id,0,{id:product.id,amount:product.amount});
    return sumAmount
   }, [{
     id:0,
     amount:0
   }] 
     
   )*/

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get('http://localhost:3333/products');
      setProducts(response.data);
    }

    loadProducts();
  }, []);

  function getFindProductToCreate(id:number){
    const product = products.find((product) => product.id === id );
    if(product){
      const productCart = {
        id:product.id ,
        title: product.title,
        price: product.price ,
        image: product.image,
        amount: 1 ,
      
      }
      return productCart;
    }

    return product;
  }

  function VerifyExistsProduct(id:number){
    const productCart = cart.find((product) => product.id === id );
    if(productCart){
      return true;
    }
    return false;
  }

  async function handleAddProduct(id: number) {
      console.log(cartItemsAmount);
      if(!VerifyExistsProduct(id)){
        const productCart =  getFindProductToCreate(id);
        if(productCart){
          await createProduct(productCart);
        }
      } else {
        addProduct(id);
      }
  }

  return (
    <ProductList>
      {
        products.map((product) => { 
          
          return (

          <li key={product.id}>
            <img src={product.image} alt={product.title} />
            <strong>{product.title}</strong>
            <span>{product.price}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[product.id] || 0 } 
              </div>
    
              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>

        )
      })
    }
     
    </ProductList>
  );
};

export default Home;
