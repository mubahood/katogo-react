// src/app/pages/WishlistPage.tsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Heart, ShoppingCart, Trash2, Eye, Package, Star, ArrowRight } from "lucide-react";
import { removeFromWishlistAPI } from "../store/slices/wishlistSlice";
import { addToCart } from "../store/slices/cartSlice";
import { AppDispatch } from "../store/store";
import { useManifest } from "../hooks/useManifest";
import ApiService from "../services/ApiService";
import ToastService from "../services/ToastService";
import { ProductModel } from "../models/ProductModel";

interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  product_price: string;
  product_sale_price?: string;
  product_photo?: string;
  created_at: string;
  updated_at: string;
}

// Inline styles for enhanced wishlist design
const wishlistStyles = `
  .wishlist-page-wrapper {
    background: var(--bg-light);
    min-height: 100vh;
    padding: 2rem 0;
  }

  .wishlist-header {
    background: var(--white);
    border-radius: var(--border-radius);
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-light);
  }

  .wishlist-title {
    color: var(--text-color-dark);
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .wishlist-subtitle {
    color: var(--text-color-medium);
    font-size: 1rem;
    margin-bottom: 0;
  }

  .wishlist-card {
    transition: all 0.3s ease;
    border: none !important;
    background: var(--white);
    border-radius: var(--border-radius);
    overflow: hidden;
    height: 100%;
    position: relative;
  }

  .wishlist-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .wishlist-image-container {
    position: relative;
    overflow: hidden;
    height: 250px;
    background: var(--bg-light);
  }

  .wishlist-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .wishlist-card:hover .wishlist-image {
    transform: scale(1.05);
  }

  .wishlist-remove-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 2;
  }

  .wishlist-remove-btn:hover {
    background: var(--white);
    transform: scale(1.1);
  }

  .wishlist-card-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .wishlist-product-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: 0.75rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .wishlist-price-container {
    margin-bottom: 1rem;
  }

  .wishlist-price-current {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-right: 0.5rem;
  }

  .wishlist-price-original {
    font-size: 0.9rem;
    color: var(--text-color-muted);
    text-decoration: line-through;
  }

  .wishlist-discount-badge {
    background: var(--accent-color);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    margin-left: 0.5rem;
  }

  .wishlist-buttons {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .wishlist-add-to-cart-btn {
    background: var(--primary-color);
    border: none;
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius);
    font-weight: 600;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .wishlist-add-to-cart-btn:hover {
    background: var(--primary-color-dark);
    transform: translateY(-1px);
  }

  .wishlist-view-btn {
    border: 2px solid var(--border-color);
    background: transparent;
    color: var(--text-color-dark);
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius);
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
  }

  .wishlist-view-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-color-light);
  }

  .wishlist-empty-state {
    background: var(--white);
    border-radius: var(--border-radius);
    padding: 4rem 2rem;
    text-align: center;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-light);
  }

  .wishlist-empty-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 2rem;
    color: var(--text-color-light);
  }

  .wishlist-empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: 1rem;
  }

  .wishlist-empty-text {
    color: var(--text-color-medium);
    margin-bottom: 2rem;
    font-size: 1rem;
  }

  .wishlist-stats {
    background: var(--white);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-light);
  }

  .wishlist-clear-btn {
    background: transparent;
    border: 2px solid var(--danger-color);
    color: var(--danger-color);
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .wishlist-clear-btn:hover {
    background: var(--danger-color);
    color: white;
  }

  .wishlist-categories {
    background: var(--white);
    border-radius: var(--border-radius);
    padding: 2rem;
    margin-top: 3rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-light);
  }

  .wishlist-category-btn {
    background: var(--bg-light);
    border: 1px solid var(--border-color);
    color: var(--text-color-dark);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-block;
    margin: 0.25rem;
  }

  .wishlist-category-btn:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  @media (max-width: 767.98px) {
    .wishlist-page-wrapper {
      padding: 1rem 0;
    }

    .wishlist-header {
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .wishlist-title {
      font-size: 1.5rem;
    }

    .wishlist-image-container {
      height: 200px;
    }

    .wishlist-card-body {
      padding: 1rem;
    }

    .wishlist-buttons {
      flex-direction: column;
    }
  }
`;

const WishlistPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { manifest, isLoading } = useManifest();
  const wishlistItems = manifest?.wishlist || [];
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);

  // Calculate total value and discount
  const totalValue = wishlistItems.reduce((total, item) => {
    return total + parseFloat(item.product_sale_price || item.product_price);
  }, 0);

  const totalOriginalValue = wishlistItems.reduce((total, item) => {
    return total + parseFloat(item.product_price);
  }, 0);

  const totalSavings = totalOriginalValue - totalValue;

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      setIsRemoving(productId);
      await dispatch(removeFromWishlistAPI(productId)).unwrap();
      ToastService.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      ToastService.error('Failed to remove from wishlist');
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      setIsAddingToCart(item.product_id);
      
      // Create a ProductModel instance for the cart
      const productModel = new ProductModel();
      productModel.id = item.product_id;
      productModel.name = item.product_name;
      productModel.price_1 = item.product_sale_price || item.product_price;
      productModel.price_2 = item.product_price;
      productModel.feature_photo = item.product_photo || '';

      // Add to cart
      dispatch(addToCart({
        product: productModel,
        quantity: 1,
        variant: {}
      }));

      ToastService.success(`${item.product_name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      ToastService.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(null);
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        // Remove all items from wishlist
        const promises = wishlistItems.map(item => 
          dispatch(removeFromWishlistAPI(item.product_id)).unwrap()
        );
        await Promise.all(promises);
        ToastService.success('Wishlist cleared successfully');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        ToastService.error('Failed to clear wishlist');
      }
    }
  };

  const handleAddAllToCart = async () => {
    if (window.confirm('Add all wishlist items to cart?')) {
      try {
        const promises = wishlistItems.map(item => handleAddToCart(item));
        await Promise.all(promises);
        ToastService.success('All items added to cart');
      } catch (error) {
        console.error('Error adding all to cart:', error);
        ToastService.error('Failed to add all items to cart');
      }
    }
  };

  const calculateDiscount = (originalPrice: string, salePrice?: string) => {
    if (!salePrice || salePrice === originalPrice) return 0;
    const original = parseFloat(originalPrice);
    const sale = parseFloat(salePrice);
    return Math.round(((original - sale) / original) * 100);
  };

  if (isLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: wishlistStyles }} />
        <div className="wishlist-page-wrapper">
          <Container>
            <Row className="justify-content-center">
              <Col md={6} className="text-center">
                <div className="wishlist-empty-state">
                  <Spinner animation="border" variant="primary" className="mb-3" />
                  <h3>Loading your wishlist...</h3>
                  <p>Please wait while we fetch your saved items.</p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: wishlistStyles }} />
      <div className="wishlist-page-wrapper">
        <Container>
          {/* Wishlist Header */}
          <div className="wishlist-header">
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex align-items-center mb-3 mb-md-0">
                  <Heart className="text-primary me-3" size={32} />
                  <div>
                    <h1 className="wishlist-title">My Wishlist</h1>
                    <p className="wishlist-subtitle">
                      {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                {wishlistItems.length > 0 && (
                  <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      onClick={handleAddAllToCart}
                      disabled={isAddingToCart !== null}
                    >
                      <ShoppingCart size={16} className="me-2" />
                      Add All to Cart
                    </Button>
                    <Button 
                      className="wishlist-clear-btn"
                      size="sm"
                      onClick={handleClearWishlist}
                      disabled={isRemoving !== null}
                    >
                      <Trash2 size={16} className="me-2" />
                      Clear All
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          </div>

          {/* Stats Section */}
          {wishlistItems.length > 0 && (
            <div className="wishlist-stats">
              <Row>
                <Col md={4} className="text-center mb-3 mb-md-0">
                  <h4 className="text-primary mb-1">{wishlistItems.length}</h4>
                  <p className="mb-0 text-muted">Items in Wishlist</p>
                </Col>
                <Col md={4} className="text-center mb-3 mb-md-0">
                  <h4 className="text-success mb-1">UGX {totalValue.toLocaleString()}</h4>
                  <p className="mb-0 text-muted">Total Value</p>
                </Col>
                <Col md={4} className="text-center">
                  <h4 className="text-warning mb-1">UGX {totalSavings.toLocaleString()}</h4>
                  <p className="mb-0 text-muted">Total Savings</p>
                </Col>
              </Row>
            </div>
          )}

          {/* Wishlist Content */}
          {wishlistItems.length === 0 ? (
            <Row className="justify-content-center">
              <Col lg={6}>
                <div className="wishlist-empty-state">
                  <Heart className="wishlist-empty-icon" />
                  <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
                  <p className="wishlist-empty-text">
                    Discover amazing products and save your favorites for later! 
                    Start browsing our collection to build your perfect wishlist.
                  </p>
                  <Link to="/products">
                    <Button variant="primary" size="lg">
                      <Package size={20} className="me-2" />
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              </Col>
            </Row>
          ) : (
            <Row>
              {wishlistItems.map((item) => {
                const discount = calculateDiscount(item.product_price, item.product_sale_price);
                
                return (
                  <Col lg={3} md={4} sm={6} key={item.id} className="mb-4">
                    <Card className="wishlist-card">
                      <div className="wishlist-image-container">
                        <img
                          src={item.product_photo ? `http://127.0.0.1:8888/images/${item.product_photo}` : '/media/misc/image.png'}
                          alt={item.product_name}
                          className="wishlist-image"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/media/misc/image.png';
                          }}
                        />
                        
                        {discount > 0 && (
                          <Badge className="wishlist-discount-badge position-absolute" style={{ top: '12px', left: '12px' }}>
                            -{discount}%
                          </Badge>
                        )}
                        
                        <Button
                          className="wishlist-remove-btn"
                          onClick={() => handleRemoveFromWishlist(item.product_id)}
                          disabled={isRemoving === item.product_id}
                        >
                          {isRemoving === item.product_id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <Trash2 size={16} className="text-danger" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="wishlist-card-body">
                        <h6 className="wishlist-product-title">{item.product_name}</h6>
                        
                        <div className="wishlist-price-container">
                          <span className="wishlist-price-current">
                            UGX {parseFloat(item.product_sale_price || item.product_price).toLocaleString()}
                          </span>
                          {item.product_sale_price && 
                           parseFloat(item.product_sale_price) < parseFloat(item.product_price) && (
                            <span className="wishlist-price-original">
                              UGX {parseFloat(item.product_price).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="wishlist-buttons">
                          <Button 
                            className="wishlist-add-to-cart-btn"
                            onClick={() => handleAddToCart(item)}
                            disabled={isAddingToCart === item.product_id}
                          >
                            {isAddingToCart === item.product_id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <ShoppingCart size={16} />
                            )}
                            {isAddingToCart === item.product_id ? 'Adding...' : 'Add to Cart'}
                          </Button>
                          
                          <Link to={`/product/${item.product_id}`} className="wishlist-view-btn">
                            <Eye size={16} />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}

          {/* Categories Section */}
          {wishlistItems.length > 0 && (
            <div className="wishlist-categories">
              <h4 className="mb-3 d-flex align-items-center">
                <Package className="me-2" size={24} />
                Continue Shopping
              </h4>
              <p className="text-muted mb-3">Discover more products in these popular categories</p>
              <div className="d-flex flex-wrap">
                {["Electronics", "Fashion", "Home & Garden", "Sports & Fitness", "Beauty & Health", "Books & Media"].map((category) => (
                  <Link
                    key={category}
                    to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="wishlist-category-btn"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default WishlistPage;
