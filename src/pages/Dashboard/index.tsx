import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

import { useCart } from '../../hooks/cart';
import formatValue from '../../utils/formatValue';
import api from '../../services/api';

import {
  Container,
  ProductContainer,
  ProductImage,
  ProductList,
  Product,
  ProductTitle,
  PriceContainer,
  ProductPrice,
  ProductButton,
} from './styles';
import FloatingCart from '../../components/FloatingCart';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
}

const Dashboard: React.FC = () => {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const { data } = await api.get('/products');
      setProducts(data);
    }

    loadProducts();
  }, [setProducts]);

  function handleAddToCart(item: Product): void {
    addToCart(item);
  }

  return (
    <Container>
      <ProductContainer>
        <ProductList
          data={products}
          keyExtractor={item => item.id}
          ListFooterComponent={<View />}
          ListFooterComponentStyle={{
            height: 80,
          }}
          renderItem={({ item }) => (
            <Product>
              <ProductImage source={{ uri: item.image_url }} />
              <ProductTitle>{item.title}</ProductTitle>
              <PriceContainer>
                <ProductPrice>{formatValue(item.price)}</ProductPrice>
                <ProductButton
                  testID={`add-to-cart-${item.id}`}
                  onPress={() => handleAddToCart(item)}
                >
                  <FeatherIcon size={20} name="plus" color="#C4C4C4" />
                </ProductButton>
              </PriceContainer>
            </Product>
          )}
        />
      </ProductContainer>
      <FloatingCart />
    </Container>
  );
};

export default Dashboard;
