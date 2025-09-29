# Developer Quick Reference - Laravel API Integration

## 🚀 **Quick Start**

### Run the Application
```bash
npm install
npm run dev
```
Application runs at: `http://localhost:5173`

### Key Testing URLs
- **Homepage**: `/` - Real API data integration
- **Products**: `/products` - Full product listing with filters
- **API Test**: `/api-test` - Live API endpoint testing
- **Integration Status**: `/integration-status` - Overall system status

## 📚 **API Integration Guide**

### Using Real Products API
```typescript
import { useGetProductsQuery } from '../services/realProductsApi';

const { data, isLoading, error } = useGetProductsQuery({
  page: 1,
  limit: 10,
  category: 5,
  sort_by: 'price_1',
  sort_order: 'asc'
});
```

### Cart Management
```typescript
import { CartService } from '../services/CartService';

// Add item to cart
CartService.addToCart(productId, quantity, variants, productInfo);

// Get cart items
const items = CartService.getCartItems();
const total = CartService.getCartTotal();
```

### Navigation (React Router)
```typescript
import { Link } from 'react-router-dom';

// ✅ Use Link for internal navigation
<Link to="/products">All Products</Link>
<Link to={`/product/${productId}`}>Product Detail</Link>

// ❌ Don't use anchor tags for internal navigation
<a href="/products">Products</a>
```

## 🛠 **API Service Methods**

### Products
- `ApiService.getProducts(filters)` - Get paginated products
- `ApiService.getProduct(id)` - Get single product
- `ApiService.searchProducts(query)` - Search products

### Categories
- `ApiService.getCategories()` - Get all categories
- `CategoryModel.getAll()` - Static method alternative

### Cart
- `CartService.addToCart()` - Add item
- `CartService.updateQuantity()` - Update item quantity
- `CartService.removeFromCart()` - Remove item
- `CartService.clearCart()` - Clear all items

## 🔧 **Component Integration Patterns**

### Product Listing Component
```typescript
const ProductList: React.FC = () => {
  const { data, isLoading, error } = useGetProductsQuery({
    page: 1,
    limit: 20
  });

  if (isLoading) return <Spinner />;
  if (error) return <Alert variant="danger">Error loading products</Alert>;

  return (
    <Row>
      {data?.data.map(product => (
        <Col key={product.id}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};
```

### Cart Integration
```typescript
const AddToCartButton: React.FC<{product: ProductModel}> = ({ product }) => {
  const handleAddToCart = () => {
    CartService.addToCart(
      product.id,
      1,
      selectedVariants,
      { name: product.name, price: product.price_1 }
    );
    ToastService.success('Added to cart!');
  };

  return <Button onClick={handleAddToCart}>Add to Cart</Button>;
};
```

## 📱 **Real-Time Features Working**

### ✅ Implemented Features
- **Real Product Data**: Homepage sections use live API
- **Dynamic Categories**: Navigation updates from API
- **Search & Filtering**: Full-text search and category filters
- **Shopping Cart**: Persistent localStorage cart
- **Product Details**: Individual product pages with related items
- **Error Handling**: User-friendly error messages
- **Loading States**: Professional loading indicators

### 🔧 API Configuration
The app uses RTK Query for API state management. Configuration in:
- `src/app/services/realProductsApi.ts` - Main API configuration
- `src/Constants.ts` - Base URL and settings

### 🎯 Production Readiness Checklist
- ✅ All dummy data replaced with real API calls
- ✅ Error boundaries and fallbacks implemented
- ✅ Loading states for all async operations
- ✅ React Router navigation throughout
- ✅ TypeScript types for all API responses
- ✅ Cart persistence and validation
- ✅ Responsive design maintained
- ✅ SEO-friendly URLs

## 🏠 **Homepage Manifest System**

The homepage now uses a comprehensive manifest system that harmonizes data loading with the Flutter mobile app.

### Using the Manifest Hook
```typescript
import useManifest from '../hooks/useManifest';

const { manifest, error, isLoading, refreshManifest } = useManifest();

// Access manifest data
const banners = manifest.banners;
const categories = manifest.featuredCategories;
const vendors = manifest.vendors;
const topProducts = manifest.topProducts;
```

### Manifest Data Structure
```typescript
interface HomepageManifest {
  banners: BannerModel[];           // For hero carousel
  categories: CategoryModel[];      // All categories
  vendors: VendorModel[];          // Featured vendors
  topProducts: ProductModel[];     // Top selling products
  featuredCategories: CategoryModel[]; // Categories grid
  isLoading: boolean;
  lastUpdated: Date;
}
```

### Banner System
```typescript
// Banners are created from categories with banner images or fallback promotional banners
const banner = new BannerModel({
  id: 1,
  title: "Welcome to BlitXpress",
  subtitle: "Your one-stop shop",
  description: "Discover amazing products",
  image: "banner.jpg",
  action_type: "category", // 'category' | 'product' | 'vendor' | 'url' | 'none'
  action_value: "5",
  is_active: "Yes"
});

// Get banner action URL
const actionUrl = banner.getActionUrl(); // '/products?category=5'
```

### Image Utility (Dart-inspired)
```typescript
import Utils from '../utils/imageUtils';

// Get full image URL for any asset
const imageUrl = Utils.img('product/image.jpg');
// Get full image URL with fallback
const url = Utils.getImageUrl(imagePath, fallbackUrl);
```

## 📦 **Key Files Modified/Created**

### New Services
- `src/app/services/realProductsApi.ts` - RTK Query API
- `src/app/services/CartService.ts` - Cart management
- `src/app/services/ApiService.ts` - API wrapper

### Updated Components
- `src/app/components/HomePage/*` - All sections use real API
- `src/app/components/shared/ProductCard*.tsx` - React Router navigation
- `src/app/pages/ProductDetailPage/*` - Real product data

### New Pages
- `src/app/pages/ProductsPage.tsx` - Product listing with filters
- `src/app/pages/ApiIntegrationStatusPage.tsx` - Integration status

The application is now production-ready with full Laravel API integration!
