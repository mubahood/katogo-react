// Debug component to test image URL generation
import React, { useEffect, useState } from 'react';
import { useGetProductsQuery } from '../../services/realProductsApi';
import ProductModel from '../../models/ProductModel';
import Utils from '../../services/Utils';
import { getProductImage } from '../../utils';
import { API_CONFIG } from '../../constants';

const ImageDebug: React.FC = () => {
  const { data: productsData } = useGetProductsQuery({ page: 1, limit: 3 });
  const products = productsData?.data || [];
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    if (products.length > 0) {
      const product = products[0] as ProductModel;
      
      const info = [
        '=== IMAGE DEBUG ===',
        `Product: ${product.name}`,
        `Raw feature_photo: ${product.feature_photo}`,
        `BASE_URL: ${API_CONFIG.BASE_URL}`,
        `Is ProductModel instance: ${product instanceof ProductModel}`,
        `Has getMainImage method: ${typeof product.getMainImage === 'function'}`,
      ];
      
      if (typeof product.getMainImage === 'function') {
        const mainImageUrl = product.getMainImage();
        info.push(`getMainImage() result: ${mainImageUrl}`);
      }
      
      const utilsImageUrl = Utils.img(product.feature_photo);
      info.push(`Utils.img() result: ${utilsImageUrl}`);
      
      const getProductImageUrl = getProductImage(product);
      info.push(`getProductImage() result: ${getProductImageUrl}`);
      
      info.push('=== END DEBUG ===');
      
      setDebugInfo(info);
       
    }
  }, [products]);

  if (products.length === 0) {
    return <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px' }}>Loading debug info...</div>;
  }

  const product = products[0] as ProductModel;
  const imageUrl = getProductImage(product);

  return (
    <div style={{ padding: '20px', border: '2px solid #ff6b6b', margin: '20px', backgroundColor: '#fff5f5' }}>
      <h3 style={{ color: '#ff6b6b' }}>🐛 Image Debug Panel</h3>
      <div style={{ backgroundColor: '#f8f9fa', padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
        {debugInfo.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h4>Test Image Load:</h4>
        <p><strong>URL being used:</strong> <code>{imageUrl}</code></p>
        <img 
          src={imageUrl} 
          alt={product.name} 
          style={{ maxWidth: '200px', border: '1px solid #ddd' }}
          onLoad={() => { 
          }}
          onError={(e) => { 
            alert('❌ Image failed to load: ' + imageUrl);
          }}
        />
      </div>
    </div>
  );
};

export default ImageDebug;
