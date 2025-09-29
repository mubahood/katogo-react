// src/app/pages/account/AccountWishlist.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { 
  loadWishlistFromAPI, 
  removeFromWishlistAPI,
  selectIsInWishlist,
  selectWishlistLoading
} from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils';
import Utils from '../../services/Utils';
import ToastService from '../../services/ToastService';
import { ProductModel } from '../../models/ProductModel';

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

// Enhanced styles for the account wishlist
const accountWishlistStyles = `
  .account-wishlist-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .wishlist-header-enhanced {
    background: var(--white);
    border-radius: var(--border-radius);
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-light);
  }

  .wishlist-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .wishlist-stat-card {
    background: var(--white);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    text-align: center;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-light);
    transition: transform 0.2s ease;
  }

  .wishlist-stat-card:hover {
    transform: translateY(-2px);
  }

  .wishlist-stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
  }

  .wishlist-stat-label {
    color: var(--text-color-medium);
    font-size: 0.9rem;
    margin: 0;
  }

  .wishlist-item-card {
    background: var(--white);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-light);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .wishlist-item-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .wishlist-item-content {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .wishlist-item-image {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
    border-radius: var(--border-radius);
    overflow: hidden;
    background: var(--bg-light);
    border: 1px solid var(--border-color);
    position: relative;
  }

  .wishlist-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .wishlist-item-card:hover .wishlist-item-image img {
    transform: scale(1.05);
  }

  .wishlist-item-details {
    flex: 1;
    min-width: 0;
  }

  .wishlist-item-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: 0.5rem;
    line-height: 1.4;
    text-decoration: none;
    display: block;
    transition: color 0.2s ease;
  }

  .wishlist-item-title:hover {
    color: var(--primary-color);
  }

  .wishlist-item-meta {
    font-size: 0.85rem;
    color: var(--text-color-medium);
    margin-bottom: 1rem;
  }

  .wishlist-item-price {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .wishlist-price-current {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
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
  }

  .wishlist-item-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .wishlist-btn {
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
  }

  .wishlist-btn-primary {
    background: var(--primary-color);
    color: white;
  }

  .wishlist-btn-primary:hover {
    background: var(--primary-color-dark);
    transform: translateY(-1px);
  }

  .wishlist-btn-outline {
    background: transparent;
    color: var(--text-color-dark);
    border: 2px solid var(--border-color);
  }

  .wishlist-btn-outline:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-color-light);
  }

  .wishlist-remove-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--danger-color);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .wishlist-remove-btn:hover {
    background: var(--danger-color);
    color: white;
    transform: scale(1.1);
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
    font-size: 4rem;
    color: var(--text-color-light);
    margin-bottom: 1.5rem;
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
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .wishlist-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    flex-direction: column;
    gap: 1rem;
  }

  .wishlist-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 767.98px) {
    .wishlist-item-content {
      flex-direction: column;
      gap: 1rem;
    }

    .wishlist-item-image {
      width: 100%;
      height: 200px;
    }

    .wishlist-item-actions {
      justify-content: center;
    }

    .wishlist-header-enhanced {
      padding: 1.5rem;
    }

    .wishlist-stats-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const AccountWishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems, isLoading } = useSelector((state: RootState) => state.wishlist);
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());
  const [imageLoadStates, setImageLoadStates] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    if (user && user.id) {
      dispatch(loadWishlistFromAPI());
    }
  }, [user, dispatch]);

  // Calculate wishlist statistics
  const totalItems = wishlistItems.length;
  const totalValue = wishlistItems.reduce((sum, item) => {
    const price = parseFloat(item.product_sale_price || item.product_price || '0');
    return sum + price;
  }, 0);
  const totalSavings = wishlistItems.reduce((sum, item) => {
    const regularPrice = parseFloat(item.product_price || '0');
    const salePrice = parseFloat(item.product_sale_price || '0');
    if (salePrice > 0 && salePrice < regularPrice) {
      return sum + (regularPrice - salePrice);
    }
    return sum;
  }, 0);

  const handleRemoveFromWishlist = async (productId: number, productName: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    try {
      await dispatch(removeFromWishlistAPI(productId));
      ToastService.success(`${productName} removed from wishlist`);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      ToastService.error('Failed to remove item from wishlist');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    setAddingToCart(prev => new Set(prev).add(item.product_id));
    try {
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
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.product_id);
        return newSet;
      });
    }
  };

  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    
    try {
      const promises = wishlistItems.map(item => handleAddToCart(item));
      await Promise.all(promises);
      ToastService.success('All items added to cart');
    } catch (error) {
      console.error('Error adding all to cart:', error);
      ToastService.error('Failed to add all items to cart');
    }
  };

  const getProductImage = (productPhoto?: string) => {
    if (!productPhoto) {
      return Utils.img(''); // This will return the default image
    }
    return Utils.img(productPhoto);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRefreshWishlist = () => {
    if (user && user.id) {
      dispatch(loadWishlistFromAPI());
    }
  };

  const handleImageLoad = (productId: number) => {
    setImageLoadStates(prev => new Map(prev).set(productId, true));
  };

  const handleImageError = (productId: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoadStates(prev => new Map(prev).set(productId, false));
    const target = e.currentTarget;
    target.src = Utils.img(''); // Set to default image
  };

  const calculateDiscount = (originalPrice: string, salePrice?: string) => {
    if (!salePrice) return 0;
    const original = parseFloat(originalPrice);
    const sale = parseFloat(salePrice);
    if (sale >= original) return 0;
    return Math.round(((original - sale) / original) * 100);
  };

  if (!user || !user.id) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: accountWishlistStyles }} />
        <div className="account-wishlist-container">
          <div className="wishlist-empty-state">
            <i className="bi bi-exclamation-triangle wishlist-empty-icon"></i>
            <h2 className="wishlist-empty-title">Please Log In</h2>
            <p className="wishlist-empty-text">
              You need to be logged in to view your wishlist.
            </p>
            <Link to="/auth/login" className="wishlist-btn wishlist-btn-primary">
              <i className="bi bi-box-arrow-in-right"></i>
              Log In
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: accountWishlistStyles }} />
      <div className="account-wishlist-container">
        {/* Enhanced Header */}
        <div className="wishlist-header-enhanced">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-color-dark)', marginBottom: '0.5rem' }}>
                My Wishlist
              </h1>
              <p style={{ color: 'var(--text-color-medium)', margin: 0 }}>
                {wishlistItems.length > 0 
                  ? `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved for later`
                  : 'Save your favorite products here'
                }
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {wishlistItems.length > 0 && (
                <button 
                  className="wishlist-btn wishlist-btn-primary"
                  onClick={handleAddAllToCart}
                  disabled={addingToCart.size > 0}
                >
                  <i className="bi bi-cart-plus"></i>
                  Add All to Cart
                </button>
              )}
              <button 
                className="wishlist-btn wishlist-btn-outline" 
                onClick={handleRefreshWishlist}
                disabled={isLoading}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {wishlistItems.length > 0 && (
          <div className="wishlist-stats-grid">
            <div className="wishlist-stat-card">
              <div className="wishlist-stat-number">{totalItems}</div>
              <p className="wishlist-stat-label">Items in Wishlist</p>
            </div>
            <div className="wishlist-stat-card">
              <div className="wishlist-stat-number">{formatPrice(totalValue)}</div>
              <p className="wishlist-stat-label">Total Value</p>
            </div>
            <div className="wishlist-stat-card">
              <div className="wishlist-stat-number">{formatPrice(totalSavings)}</div>
              <p className="wishlist-stat-label">Total Savings</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="wishlist-loading">
            <div className="wishlist-spinner"></div>
            <p style={{ color: 'var(--text-color-medium)' }}>Loading your wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="wishlist-empty-state">
            <i className="bi bi-heart wishlist-empty-icon"></i>
            <h2 className="wishlist-empty-title">Your Wishlist is Empty</h2>
            <p className="wishlist-empty-text">
              Start adding products to your wishlist by clicking the heart icon on any product you like.
            </p>
            <Link to="/products" className="wishlist-btn wishlist-btn-primary">
              <i className="bi bi-search"></i>
              Browse Products
            </Link>
          </div>
        ) : (
          <div>
            {wishlistItems.map((item: WishlistItem) => {
              const isRemoving = removingItems.has(item.product_id);
              const isAddingToCartThis = addingToCart.has(item.product_id);
              const productImage = getProductImage(item.product_photo);
              const salePrice = item.product_sale_price ? parseFloat(item.product_sale_price) : null;
              const regularPrice = parseFloat(item.product_price || '0');
              const finalPrice = salePrice && salePrice > 0 ? salePrice : regularPrice;
              const hasDiscount = salePrice && salePrice > 0 && salePrice < regularPrice;
              const discountPercent = calculateDiscount(item.product_price, item.product_sale_price);

              return (
                <div 
                  key={item.id} 
                  className="wishlist-item-card"
                  style={{ opacity: isRemoving ? 0.6 : 1 }}
                >
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => handleRemoveFromWishlist(item.product_id, item.product_name)}
                    disabled={isRemoving}
                    title="Remove from wishlist"
                  >
                    {isRemoving ? (
                      <div className="wishlist-spinner" style={{ width: '16px', height: '16px' }}></div>
                    ) : (
                      <i className="bi bi-heart-fill"></i>
                    )}
                  </button>

                  <div className="wishlist-item-content">
                    <div className="wishlist-item-image">
                      <img
                        src={productImage}
                        alt={item.product_name}
                        onLoad={() => handleImageLoad(item.product_id)}
                        onError={(e) => handleImageError(item.product_id, e)}
                      />
                    </div>

                    <div className="wishlist-item-details">
                      <Link
                        to={`/product/${item.product_id}`}
                        className="wishlist-item-title"
                      >
                        {item.product_name}
                      </Link>
                      
                      <div className="wishlist-item-meta">
                        Added on {formatDate(item.created_at)}
                      </div>

                      <div className="wishlist-item-price">
                        <span className="wishlist-price-current">
                          {formatPrice(finalPrice)}
                        </span>
                        {hasDiscount && (
                          <>
                            <span className="wishlist-price-original">
                              {formatPrice(regularPrice)}
                            </span>
                            {discountPercent > 0 && (
                              <span className="wishlist-discount-badge">
                                -{discountPercent}% OFF
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <div className="wishlist-item-actions">
                        <button
                          className="wishlist-btn wishlist-btn-primary"
                          onClick={() => handleAddToCart(item)}
                          disabled={isAddingToCartThis || isRemoving}
                        >
                          {isAddingToCartThis ? (
                            <>
                              <div className="wishlist-spinner" style={{ width: '16px', height: '16px' }}></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cart-plus"></i>
                              Add to Cart
                            </>
                          )}
                        </button>
                        
                        <Link
                          to={`/product/${item.product_id}`}
                          className="wishlist-btn wishlist-btn-outline"
                        >
                          <i className="bi bi-eye"></i>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions Footer */}
        {wishlistItems.length > 0 && (
          <div style={{
            marginTop: '2rem',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to="/products" className="wishlist-btn wishlist-btn-primary">
              <i className="bi bi-plus-circle"></i>
              Add More Items
            </Link>
            <button className="wishlist-btn wishlist-btn-outline">
              <i className="bi bi-share"></i>
              Share Wishlist
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AccountWishlist;