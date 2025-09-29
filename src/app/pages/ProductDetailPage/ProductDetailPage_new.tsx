// src/app/pages/ProductDetailPage/ProductDetailPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  ProgressBar,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useGetProductByIdQuery, useGetProductsQuery } from "../../services/realProductsApi";
import { ProductModel } from "../../models/ProductModel";
import { useDispatch } from "react-redux";
import { useCart } from "../../hooks/useCart";
import { showNotification } from "../../store/slices/notificationSlice";
import ProductCard2 from "../../components/shared/ProductCard2";

interface RouteParams {
  id?: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToCart: addToCartHook } = useCart();

  const productId = useMemo(() => parseInt(id || "0", 10), [id]);

  const {
    data: product,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  // Fetch related products
  const {
    data: relatedProductsData,
  } = useGetProductsQuery({ 
    page: 1, 
    limit: 5,
    category: product?.category || undefined 
  }, {
    skip: !product?.category
  });

  const relatedProducts = relatedProductsData?.data || [];

  // Local UI state - ALL hooks must be called before any conditional returns
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageErrored, setImageErrored] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [variantsSelection, setVariantsSelection] = useState<
    Record<string, string>
  >({});
  const [showModal, setShowModal] = useState(false);

  // Reset component state when productId changes (before new product loads)
  useEffect(() => {
    // Reset all local state to prevent showing old product data
    setSelectedImage("");
    setImageErrored(false);
    setQuantity(1);
    setVariantsSelection({});
    setShowModal(false);
    
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Initialize image & variants when product loads
  useEffect(() => {
    if (!product) return;

    setSelectedImage(product.getMainImage());
    setImageErrored(false);

    const initial: Record<string, string> = {};
    Object.entries(product.variants || {}).forEach(([type, opts]) => {
      if (opts.length) initial[type] = opts[0];
    });
    setVariantsSelection(initial);
  }, [product]);

  // Derived stock/pricing data - computed before conditional returns
  const price1 = product ? Number(product.price_1) : 0;
  const price2 = product ? Number(product.price_2) : 0;
  const discount = product && price2 > price1 ? Math.round(((price2 - price1) / price2) * 100) : 0;

  const sold = product?.stock?.items_sold ?? 0;
  const total = product?.stock?.total_items ?? 0;
  const remaining = total - sold;
  const soldPct = total ? (sold / total) * 100 : 0;
  const outOfStock = total > 0 && remaining <= 0;

  // Handlers - defined before conditional returns
  const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return setQuantity(1);
    if (val < 1) return setQuantity(1);
    if (val > remaining) {
      dispatch(
        showNotification({
          message: `Only ${remaining} available`,
          type: "warning",
        })
      );
      return setQuantity(remaining);
    }
    setQuantity(val);
  };

  const onVariantSelect = (type: string, option: string) =>
    setVariantsSelection((prev) => ({ ...prev, [type]: option }));

  const onAddToCart = async () => {
    try {
      if (outOfStock || quantity < 1) {
        dispatch(
          showNotification({
            message: "Cannot add to cart – out of stock or invalid quantity.",
            type: "error",
          })
        );
        return;
      }

      // Convert variantsSelection to CartVariant format
      const variant = {
        color: variantsSelection.Color || variantsSelection.color || '',
        size: variantsSelection.Size || variantsSelection.size || '',
        ...variantsSelection
      };

      if (product) {
        const success = await addToCartHook(product, quantity, variant);
        
        if (success) {
          setQuantity(1);
          // Don't clear variants selection as user might want to add more
        }
      }
    } catch (error) {
      console.error('Error in onAddToCart:', error);
      dispatch(
        showNotification({
          message: "Failed to add item to cart",
          type: "error",
        })
      );
    }
  };

  const onBuyNow = async () => {
    if (outOfStock || quantity < 1) {
      dispatch(
        showNotification({
          message: "Cannot proceed – out of stock or invalid quantity.",
          type: "error",
        })
      );
      return;
    }

    // Convert variantsSelection to CartVariant format
    const variant = {
      color: variantsSelection.Color || variantsSelection.color || '',
      size: variantsSelection.Size || variantsSelection.size || '',
      ...variantsSelection
    };

    if (product) {
      const success = await addToCartHook(product, quantity, variant);
      
      if (success) {
        // Navigate to checkout page
        // TODO: Add navigation to checkout
        dispatch(
          showNotification({
            message: `Proceeding to checkout with ${quantity} × ${product.name}.`,
            type: "info",
          })
        );
      }
    }
  };

  const renderStars = (rate: number) => {
    const full = Math.floor(rate);
    const half = rate % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {Array(full)
          .fill(0)
          .map((_, i) => (
            <i key={`f${i}`} className="bi bi-star-fill text-warning" />
          ))}
        {half && <i className="bi bi-star-half text-warning" />}
        {Array(empty)
          .fill(0)
          .map((_, i) => (
            <i key={`e${i}`} className="bi bi-star text-warning" />
          ))}
      </>
    );
  };

  // Loading
  if (isLoading || isFetching) {
    return (
      <Container className="pdp-loading-container text-center my-5">
        <Spinner animation="border" role="status" variant="primary" />
        <h4 className="mt-3">Loading product details…</h4>
      </Container>
    );
  }

  // Error
  if (isError) {
    return (
      <Container className="pdp-error-container text-center my-5">
        <h4 className="text-danger mb-3">Could not load product.</h4>
        <p>{(error as any)?.data || "Unexpected error occurred."}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Container>
    );
  }

  // Not found
  if (!product) {
    return (
      <Container className="pdp-not-found-container text-center my-5">
        <h4>Product not found.</h4>
        <Button variant="outline-primary" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const gallery = [product.getMainImage(), ...(product.getAllImages() || [])];

  return (
    <Container className="my-4">
      <Row>
        {/* Main Content Area - Left Side (8 columns) */}
        <Col lg={8} md={7}>
          {/* Product Images and Basic Info */}
          <div 
            className="card border shadow-sm mb-4" 
            style={{
              borderRadius: 'var(--border-radius)',
              background: 'var(--white)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div className="card-body p-4">
              <Row>
                {/* Product Images */}
                <Col md={6} className="mb-4">
                  <div className="product-image-gallery d-flex flex-column align-items-center">
                    <div
                      className="main-image-wrapper position-relative mb-3"
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        background: "var(--background-light)",
                        borderRadius: 'var(--border-radius)',
                        boxShadow: "var(--shadow-sm)",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 320,
                        cursor: "pointer",
                        border: "2px solid var(--border-color)",
                        transition: "all var(--transition-speed) var(--transition-timing-function)"
                      }}
                      onClick={() => setShowModal(true)}
                    >
                      <img
                        src={
                          imageErrored
                            ? "/media/svg/files/blank-image.svg"
                            : selectedImage
                        }
                        alt={product.name}
                        className="img-fluid"
                        style={{
                          maxHeight: 380,
                          maxWidth: "100%",
                          objectFit: "contain",
                          transition: "all var(--transition-speed) var(--transition-timing-function)"
                        }}
                        onError={() => setImageErrored(true)}
                        draggable={false}
                      />
                      {discount > 0 && (
                        <span
                          className="badge position-absolute"
                          style={{
                            top: 15,
                            right: 15,
                            fontSize: "1rem",
                            padding: "0.5em 1em",
                            borderRadius: 'var(--border-radius)',
                            background: "var(--primary-color)",
                            color: "var(--white)",
                            fontWeight: "700",
                            boxShadow: "var(--shadow-sm)",
                            border: "none"
                          }}
                        >
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Thumbnails */}
                    <div
                      className="thumbnail-row d-flex flex-row flex-nowrap justify-content-start gap-2"
                      style={{
                        width: "100%",
                        overflowX: "auto",
                        overflowY: "hidden",
                        height: 70,
                        maxHeight: 70,
                        paddingBottom: 4,
                        scrollbarWidth: "thin"
                      }}
                    >
                      {gallery.map((url, idx) => (
                        <div
                          key={idx}
                          className={`thumb-wrapper position-relative ${
                            url === selectedImage ? "selected-thumb" : ""
                          }`}
                          style={{
                            border:
                              url === selectedImage
                                ? "2px solid var(--primary-color)"
                                : "1px solid var(--border-color)",
                            borderRadius: 'var(--border-radius)',
                            overflow: "hidden",
                            width: 65,
                            height: 65,
                            background: "var(--white)",
                            cursor: "pointer",
                            boxShadow:
                              url === selectedImage
                                ? "var(--shadow-md)"
                                : "var(--shadow-sm)",
                            transition: "all var(--transition-speed) var(--transition-timing-function)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: "0 0 auto"
                          }}
                          onClick={() => {
                            setSelectedImage(url);
                            setImageErrored(false);
                          }}
                        >
                          <img
                            src={url}
                            alt={`Thumb ${idx + 1}`}
                            className="img-fluid"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              background: "transparent",
                              borderRadius: 'var(--border-radius)',
                              pointerEvents: "none",
                              userSelect: "none"
                            }}
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>

                {/* Basic Product Info */}
                <Col md={6} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span
                      className="badge"
                      style={{ 
                        fontSize: "0.9rem", 
                        padding: "0.5em 1em",
                        background: "var(--primary-color)",
                        color: "var(--white)",
                        borderRadius: "var(--border-radius)",
                        fontWeight: "600",
                        border: "none"
                      }}
                    >
                      {product.category_text || "Uncategorized"}
                    </span>

                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="p-0 m-0"
                      title="Add to Wishlist"
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--border-radius)"
                      }}
                    >
                      <i className="bi bi-heart" style={{ fontSize: "1rem" }} />
                    </Button>
                  </div>

                  <h1 
                    className="mb-3 mt-0 p-0" 
                    style={{
                      fontSize: "2rem",
                      fontWeight: "800",
                      color: "var(--text-color-dark)",
                      lineHeight: "1.2"
                    }}
                  >
                    {product.name}
                  </h1>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div 
                      className="d-flex align-items-center gap-3 mb-4 p-3" 
                      style={{
                        background: "var(--background-light)",
                        borderRadius: "var(--border-radius)",
                        border: "1px solid var(--border-color)"
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5 fw-semibold">
                          {renderStars(product.rating)}
                        </span>
                        <span 
                          className="ms-1 fw-bold" 
                          style={{ 
                            fontSize: "1.1rem",
                            color: "var(--text-color-dark)"
                          }}
                        >
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                      <span
                        className="text-muted"
                        style={{ 
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          color: "var(--text-color-medium)"
                        }}
                      >
                        ({product.reviewsCount} review
                        {product.reviewsCount !== 1 ? "s" : ""})
                      </span>
                    </div>
                  )}

                  {/* Share Buttons */}
                  <div className="d-flex flex-row gap-2 justify-content-start align-items-center">
                    <span className="fw-semibold me-2" style={{ fontSize: "0.93em" }}>
                      Share:
                    </span>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                      title="Share on Facebook"
                    >
                      <i className="bi bi-facebook" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-info btn-sm"
                      title="Share on Twitter"
                    >
                      <i className="bi bi-twitter-x" />
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(product.name + " " + window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-success btn-sm"
                      title="Share on WhatsApp"
                    >
                      <i className="bi bi-whatsapp" />
                    </a>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div 
              className="card border shadow-sm mb-4" 
              style={{
                borderRadius: 'var(--border-radius)',
                background: 'var(--white)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="card-body p-4">
                <h3 className="mb-3">Product Description</h3>
                <div 
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  style={{ lineHeight: "1.6", color: "var(--text-color-medium)" }}
                />
              </div>
            </div>
          )}
        </Col>

        {/* Right Sidebar (4 columns) */}
        <Col lg={4} md={5}>
          <div 
            className="card border shadow-sm position-sticky" 
            style={{
              borderRadius: 'var(--border-radius)',
              background: 'var(--white)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
              top: '20px'
            }}
          >
            <div className="card-body p-4">
              {/* Pricing */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h2 
                    className="mb-0 text-primary fw-bold" 
                    style={{ fontSize: "2rem" }}
                  >
                    UGX {price1.toLocaleString()}
                  </h2>
                  {price2 > price1 && (
                    <span 
                      className="text-muted text-decoration-line-through" 
                      style={{ fontSize: "1.2rem" }}
                    >
                      UGX {price2.toLocaleString()}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <span 
                    className="badge bg-success" 
                    style={{ fontSize: "0.9rem" }}
                  >
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Stock Info */}
              <div 
                className="border rounded p-3 mb-4" 
                style={{
                  background: outOfStock 
                    ? "linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)" 
                    : "linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)",
                  borderColor: outOfStock ? "#feb2b2" : "#9ae6b4",
                  borderWidth: "2px"
                }}
              >
                <div
                  className="fw-semibold mb-2 d-flex align-items-center gap-2"
                  style={{ 
                    fontSize: "1.1rem",
                    color: outOfStock ? "#c53030" : "#2f855a"
                  }}
                >
                  <i 
                    className={`bi ${outOfStock ? 'bi-exclamation-triangle' : 'bi-check-circle'}`} 
                  />
                  {outOfStock ? "Out of Stock" : "In Stock"}
                </div>
                {!outOfStock && (
                  <div className="mb-2">
                    <span className="fw-semibold" style={{ color: "#2f855a" }}>
                      {remaining} units available
                    </span>
                  </div>
                )}
                {total > 0 && (
                  <ProgressBar 
                    now={soldPct} 
                    style={{ height: "8px" }}
                    variant={soldPct > 80 ? "danger" : soldPct > 50 ? "warning" : "success"}
                  />
                )}
              </div>

              {/* Variants Selection */}
              {product.variants && Object.keys(product.variants).length > 0 && (
                <div className="mb-4">
                  {Object.entries(product.variants).map(([type, options]) => (
                    <div key={type} className="mb-3">
                      <label className="form-label fw-semibold">{type}:</label>
                      <div className="d-flex flex-wrap gap-2">
                        {options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`btn ${
                              variantsSelection[type] === option
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            style={{ fontSize: "0.85rem" }}
                            onClick={() => onVariantSelect(type, option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Quantity:</label>
                <Form.Control
                  type="number"
                  min="1"
                  max={remaining}
                  value={quantity}
                  onChange={onQuantityChange}
                  disabled={outOfStock}
                  style={{ width: "100px" }}
                />
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onAddToCart}
                  disabled={outOfStock}
                  style={{
                    fontWeight: "600",
                    borderRadius: "var(--border-radius)",
                    padding: "12px 24px"
                  }}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Add to Cart
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  onClick={onBuyNow}
                  disabled={outOfStock}
                  style={{
                    fontWeight: "600",
                    borderRadius: "var(--border-radius)",
                    padding: "12px 24px"
                  }}
                >
                  <i className="bi bi-lightning me-2"></i>
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <Row className="mt-5">
          <Col xs={12}>
            <div 
              className="card border shadow-sm" 
              style={{
                borderRadius: 'var(--border-radius)',
                background: 'var(--white)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="card-body p-4">
                <h3 className="mb-4">Related Products</h3>
                <Row>
                  {relatedProducts.slice(0, 4).map((relatedProduct) => (
                    <Col key={relatedProduct.id} lg={3} md={6} className="mb-3">
                      <ProductCard2 product={relatedProduct} />
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Image Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{product.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={selectedImage}
            alt={product.name}
            className="img-fluid"
            style={{ maxHeight: "600px", objectFit: "contain" }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage;
