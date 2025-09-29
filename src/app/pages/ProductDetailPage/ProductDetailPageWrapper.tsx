// src/app/pages/ProductDetailPage/ProductDetailPageWrapper.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ProductDetailPage from './ProductDetailPage';

/**
 * Wrapper component that forces ProductDetailPage to remount when ID changes
 * This ensures complete state reset and prevents stale data issues
 */
const ProductDetailPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Use the ID as a key to force complete component remount when it changes
  return <ProductDetailPage key={id} />;
};

export default ProductDetailPageWrapper;