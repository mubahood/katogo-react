// src/app/pages/ApiTestPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  useGetProductsQuery,
  useGetCategoriesQuery,
  useGetVendorsQuery,
  useSearchProductsQuery,
  useGetProductByIdQuery
} from '../services/realProductsApi';
import ProductModel from '../models/ProductModel';
import CategoryModel from '../models/CategoryModel';
import ApiService from '../services/ApiService';
import CartService from '../services/CartService';
import ToastService from '../services/ToastService';
import CachePilotDemo from '../components/CachePilotDemo';

const ApiTestPage: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<number>(134);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  // RTK Query hooks
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts
  } = useGetProductsQuery({ page: 1, limit: 5 });

  // Categories are now cached in ManifestService and don't need RTK Query
  const [categories, setCategories] = React.useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(false);
  const [categoriesError, setCategoriesError] = React.useState<any>(null);

  const { 
    data: vendors, 
    isLoading: vendorsLoading, 
    error: vendorsError 
  } = useGetVendorsQuery();

  const {
    data: singleProduct,
    isLoading: singleProductLoading,
    error: singleProductError
  } = useGetProductByIdQuery(selectedProductId, {
    skip: !selectedProductId
  });

  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError
  } = useSearchProductsQuery(
    { query: searchTerm, page: 1 },
    { skip: !searchTerm || searchTerm.length < 2 }
  );

  // Update cart item count
  useEffect(() => {
    const updateCartCount = () => {
      setCartItemCount(CartService.getCartItemCount());
    };
    
    updateCartCount();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const handleAddToCart = async (product: ProductModel) => {
    const success = CartService.addToCart(
      product.id,
      1,
      {},
      { name: product.name, price: product.price_1 }
    );
    
    if (success) {
      setCartItemCount(CartService.getCartItemCount());
    }
  };

  const testApiMethods = async () => {
    try {
      ToastService.info("Testing API methods...");
      
      // Test ApiService methods
      await ApiService.getCategories();
      await ApiService.getVendors();
      await ApiService.getProducts({ page: 1, limit: 3 });
      
      ToastService.success("API methods tested successfully!");
    } catch (error) {
      ToastService.error("API test failed: " + error);
      console.error('API Test Error:', error);
    }
  };

  const testCartFunctions = async () => {
    try {
      ToastService.info("Testing cart functions...");
      
      // Add some test items to cart
      CartService.addToCart(1, 2, { color: 'red' }, { name: 'Test Product 1', price: '100000' });
      CartService.addToCart(2, 1, { size: 'large' }, { name: 'Test Product 2', price: '200000' });
      
      const itemCount = CartService.getCartItemCount();
      const total = await CartService.getCartTotal();
      const formattedTotal = await CartService.getFormattedCartTotal();
      
      setCartItemCount(itemCount);
      ToastService.success(`Cart functions tested! Items: ${itemCount}, Total: ${formattedTotal}`);
    } catch (error) {
      ToastService.error("Cart test failed: " + error);
      console.error('Cart Test Error:', error);
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>API Integration Test Page</h1>
          <p className="text-muted">
            Testing real Laravel API endpoints, cache functionality, and cart integration.
          </p>
        </Col>
      </Row>

      <Tabs defaultActiveKey="cache-pilot" id="api-test-tabs" className="mb-3">
        <Tab eventKey="cache-pilot" title="🚀 Cache Pilot Demo">
          <CachePilotDemo />
        </Tab>
        
        <Tab eventKey="api-tests" title="🔧 API Tests">
          <Container fluid>
            <Row className="mb-4">
              <Col>
                <div className="d-flex gap-2 mb-3">
                  <Button variant="primary" onClick={testApiMethods}>
                    Test API Methods
                  </Button>
                  <Button variant="success" onClick={testCartFunctions}>
                    Test Cart Functions
                  </Button>
                  <Button variant="info" onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                  <span className="ms-auto badge bg-secondary fs-6">
                    Cart Items: {cartItemCount}
                  </span>
                </div>
              </Col>
            </Row>

      {/* Categories Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4>Categories ({categories?.length || 0})</h4>
            </Card.Header>
            <Card.Body>
              {categoriesLoading && <Spinner animation="border" />}
              {categoriesError && (
                <Alert variant="danger">
                  Error loading categories: {JSON.stringify(categoriesError)}
                </Alert>
              )}
              {categories && (
                <Row>
                  {categories.slice(0, 6).map((category: CategoryModel) => (
                    <Col md={4} key={category.id} className="mb-3">
                      <Card>
                        <Card.Body>
                          <h6>{category.category}</h6>
                          <p className="small text-muted">
                            ID: {category.id} | Products: {category.category_text}
                            {category.isShownInBanner() && <span className="badge bg-warning ms-2">Banner</span>}
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline-primary"
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            Filter Products
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Products Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Products ({productsData?.total || 0})</h4>
              <div className="d-flex gap-2">
                {selectedCategory && (
                  <Button 
                    size="sm" 
                    variant="outline-secondary"
                    onClick={() => setSelectedCategory(undefined)}
                  >
                    Clear Filter
                  </Button>
                )}
                <Button size="sm" variant="outline-primary" onClick={() => refetchProducts()}>
                  Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {productsLoading && <Spinner animation="border" />}
              {productsError && (
                <Alert variant="danger">
                  Error loading products: {JSON.stringify(productsError)}
                </Alert>
              )}
              {productsData && (
                <Row>
                  {productsData.data.map((product: ProductModel) => (
                    <Col md={6} lg={4} key={product.id} className="mb-3">
                      <Card>
                        <Card.Img 
                          variant="top" 
                          src={product.getMainImage()} 
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <Card.Body>
                          <h6>{product.name}</h6>
                          <p className="text-success fw-bold">{product.getFormattedPrice()}</p>
                          <p className="small text-muted">
                            Category: {product.category_text} | 
                            Colors: {product.hasColors() ? product.getColors().join(', ') : 'None'} |
                            Stock: {product.isInStock() ? 'Yes' : 'No'}
                          </p>
                          <div className="d-flex gap-1">
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => handleAddToCart(product)}
                            >
                              Add to Cart
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-info"
                              onClick={() => setSelectedProductId(product.id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4>Search Products</h4>
            </Card.Header>
            <Card.Body>
              <Form.Control
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
              {searchLoading && <Spinner animation="border" />}
              {searchError && (
                <Alert variant="danger">
                  Search error: {JSON.stringify(searchError)}
                </Alert>
              )}
              {searchResults && searchTerm && (
                <div>
                  <p className="text-muted">Found {searchResults.total} results for "{searchTerm}"</p>
                  <Row>
                    {searchResults.data.slice(0, 3).map((product: ProductModel) => (
                      <Col md={4} key={product.id} className="mb-3">
                        <Card>
                          <Card.Body>
                            <h6>{product.name}</h6>
                            <p className="text-success">{product.getFormattedPrice()}</p>
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => handleAddToCart(product)}
                            >
                              Add to Cart
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Single Product Details */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4>Single Product Details (ID: {selectedProductId})</h4>
            </Card.Header>
            <Card.Body>
              {singleProductLoading && <Spinner animation="border" />}
              {singleProductError && (
                <Alert variant="danger">
                  Error loading product: {JSON.stringify(singleProductError)}
                </Alert>
              )}
              {singleProduct && (
                <Row>
                  <Col md={4}>
                    <img 
                      src={singleProduct.getMainImage()} 
                      alt={singleProduct.name}
                      className="img-fluid rounded"
                    />
                  </Col>
                  <Col md={8}>
                    <h3>{singleProduct.name}</h3>
                    <p className="text-success h4">{singleProduct.getFormattedPrice()}</p>
                    <p>{singleProduct.description || 'No description available'}</p>
                    <div className="row mb-3">
                      <div className="col-sm-4"><strong>Category:</strong></div>
                      <div className="col-sm-8">{singleProduct.category_text}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-sm-4"><strong>Stock:</strong></div>
                      <div className="col-sm-8">{singleProduct.isInStock() ? 'In Stock' : 'Out of Stock'}</div>
                    </div>
                    {singleProduct.hasColors() && (
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Colors:</strong></div>
                        <div className="col-sm-8">{singleProduct.getColors().join(', ')}</div>
                      </div>
                    )}
                    {singleProduct.hasSizes() && (
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Sizes:</strong></div>
                        <div className="col-sm-8">{singleProduct.getSizes().join(', ')}</div>
                      </div>
                    )}
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={() => handleAddToCart(singleProduct)}
                    >
                      Add to Cart
                    </Button>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Vendors Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4>Vendors ({vendors?.length || 0})</h4>
            </Card.Header>
            <Card.Body>
              {vendorsLoading && <Spinner animation="border" />}
              {vendorsError && (
                <Alert variant="danger">
                  Error loading vendors: {JSON.stringify(vendorsError)}
                </Alert>
              )}
              {vendors && (
                <Row>
                  {vendors.slice(0, 4).map((vendor: any) => (
                    <Col md={6} key={vendor.id} className="mb-3">
                      <Card>
                        <Card.Body>
                          <h6>{vendor.name || `${vendor.first_name} ${vendor.last_name}`}</h6>
                          <p className="small text-muted">
                            Business: {vendor.business_name || 'N/A'} | 
                            Status: {vendor.status} |
                            Email: {vendor.email || 'N/A'}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navigation Links */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Navigation</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/" className="btn btn-outline-primary">
                  Home
                </Link>
                <Link to="/products" className="btn btn-outline-primary">
                  Products Page
                </Link>
                <Link to="/categories" className="btn btn-outline-primary">
                  Categories Page
                </Link>
                <Link to="/cart" className="btn btn-outline-primary">
                  Cart ({cartItemCount})
                </Link>
                <Link to="/account" className="btn btn-outline-primary">
                  Account
                </Link>
                <Link to="/toast-demo" className="btn btn-outline-secondary">
                  Toast Demo
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
          </Container>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ApiTestPage;
