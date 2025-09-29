// src/app/pages/ProductDetailPage/sections/ProductHeroSection.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Row,
  Col,
  Spinner,
  Button,
  Form,
  Card,
  Badge,
  Carousel,
  Tab,
  Nav,
  OverlayTrigger,
  Tooltip,
  Modal,
  Breadcrumb,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetProductByIdQuery } from '../../../services/productsApi';
import { addToCart } from '../../../store/slices/cartSlice';
import { showNotification } from '../../../store/slices/notificationSlice';
import OptimizedLazyImage from '../../../components/shared/OptimizedLazyImage';

const ProductHeroSection: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const productId = useMemo(() => parseInt(id || '0', 10), [id]);
  const { data: p, isLoading, isError } = useGetProductByIdQuery(productId, { skip: !productId });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mainImg, setMainImg] = useState('');
  const [qty, setQty] = useState(1);
  const [variants, setVariants] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);

  // Reset component state when productId changes (before new product loads)
  useEffect(() => {
    // Reset all local state to prevent showing old product data
    setMainImg('');
    setQty(1);
    setVariants({});
    setShowModal(false);
    
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  useEffect(() => {
    if (!p) return;
    setMainImg(p.feature_photo);
    const init: Record<string, string> = {};
    Object.entries(p.variants || {}).forEach(([k, opts]) => {
      if (opts.length) init[k] = opts[0];
    });
    setVariants(init);
  }, [p]);

  if (isLoading)
    return (
      <div className="text-center py-5">
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  if (isError)
    return (
      <div className="text-center py-5">
        <h4 className="text-danger">Failed to load product.</h4>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  if (!p)
    return (
      <div className="text-center py-5">
        <h4>Product not found.</h4>
        <Button onClick={() => navigate('/')}>Back Home</Button>
      </div>
    );

  // pricing + stock
  // Memoized expensive calculations for performance
  const productData = useMemo(() => {
    if (!p) return null;
    
    const price1 = +p.price_1;
    const price2 = +p.price_2;
    const discount = price2 > price1 ? Math.round(((price2 - price1) / price2) * 100) : 0;
    const sold = p.stock?.items_sold || 0;
    const total = p.stock?.total_items || 0;
    const remain = total - sold;
    const soldPct = total ? (sold / total) * 100 : 0;
    const outOfStock = total > 0 && remain <= 0;
    const gallery = [p.feature_photo, ...(p.images || [])];
    
    return {
      price1,
      price2,
      discount,
      sold,
      total,
      remain,
      soldPct,
      outOfStock,
      gallery
    };
  }, [p]);

  if (!productData) return null;
  
  const { price1, price2, discount, sold, total, remain, soldPct, outOfStock, gallery } = productData;

  // handlers
  const changeQty = (delta: number) => setQty(q => Math.min(Math.max(1, q + delta), remain));
  const onQtyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10) || 1;
    setQty(Math.min(Math.max(1, v), remain));
  };
  const addToCartHandler = () => {
    if (outOfStock) return dispatch(showNotification({ message: 'Out of stock', type: 'error' }));
    dispatch(addToCart({ product: p, quantity: qty, variant: variants }));
    dispatch(showNotification({ message: `${qty}× ${p.name} added`, type: 'success' }));
    setQty(1);
  };
  const buyNow = () => {
    if (outOfStock) return dispatch(showNotification({ message: 'Out of stock', type: 'error' }));
    dispatch(showNotification({ message: 'Proceeding to checkout…', type: 'info' }));
  };

  const renderStars = (r: number) => {
    const full = Math.floor(r),
      half = r % 1 >= 0.5,
      empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {[...Array(full)].map((_, i) => (
          <i key={i} className="bi bi-star-fill text-warning me-1" />
        ))}
        {half && <i className="bi bi-star-half text-warning me-1" />}
        {[...Array(empty)].map((_, i) => (
          <i key={i} className="bi bi-star text-warning me-1" />
        ))}
      </>
    );
  };

  // ETA helper
  const eta = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item onClick={() => navigate('/')}>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>{p.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        {/* Left: Carousel */}
        <Col lg={5} md={12} className="mb-4">
          <Card className="border-0">
            <Carousel
              indicators={false}
              interval={null}
              className="product-carousel"
              onSelect={idx => setMainImg(gallery[idx])}
            >
              {gallery.map((url, idx) => (
                <Carousel.Item key={idx}>
                  <OptimizedLazyImage
                    src={url}
                    alt={`${p.name} - Image ${idx + 1}`}
                    className="d-block w-100 product-main-image"
                    onClick={() => setShowModal(true)}
                    options={{
                      width: 500,
                      height: 500,
                      loading: 'eager' // Main product images should load immediately
                    }}
                    onError={e => (e.currentTarget.src = '/placeholder.png')}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
            <div className="d-flex justify-content-center mt-2 gap-2 overflow-auto">
              {gallery.map((url, idx) => (
                <OverlayTrigger
                  key={idx}
                  placement="top"
                  overlay={<Tooltip>View image {idx + 1}</Tooltip>}
                >
                  <OptimizedLazyImage
                    src={url}
                    alt={`${p.name} - Thumbnail ${idx + 1}`}
                    className={`thumbnail ${mainImg === url ? 'selected' : ''}`}
                    onClick={() => setMainImg(url)}
                    options={{
                      width: 80,
                      height: 80,
                      loading: 'lazy'
                    }}
                  />
                </OverlayTrigger>
              ))}
            </div>
          </Card>
        </Col>

        {/* Center: Summary */}
        <Col lg={5} md={12} className="mb-4">
          <Card className="h-100 border-0">
            <Card.Body className="p-0 ps-lg-3">
              <div className="text-uppercase text-muted fs-6 mb-1">{p.category_text || 'Brand'}</div>
              <Card.Title as="h1" className="fs-2 fw-bold mb-3">
                {p.name}
              </Card.Title>

              <div className="d-flex align-items-baseline mb-3">
                <span className="fs-3 text-primary fw-bold">UGX {price1.toLocaleString()}</span>
                {discount > 0 && (
                  <>
                    <Badge bg="success" className="ms-3">
                      –{discount}%
                    </Badge>
                    <span className="text-decoration-line-through text-muted ms-2">
                      UGX {price2.toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              <div className="d-flex align-items-center mb-3">
                {renderStars(p.rating)}
                <a href="#reviews" className="ms-3 small text-decoration-none">
                  {p.rating.toFixed(1)} ({p.reviewsCount}) reviews
                </a>
              </div>

              <div className="mb-4">
                <span className={`badge ${outOfStock ? 'bg-danger' : 'bg-success'}`}>
                  {outOfStock ? 'Out of stock' : `In stock (${remain} left)`}
                </span>
                <span className="ms-3 text-muted small">Imported from USA</span>
              </div>

              {p.variants.colors?.length > 0 && (
                <div className="mb-4">
                  <div className="fw-semibold mb-2">Color: {variants.colors}</div>
                  <div className="d-flex gap-2">
                    {p.variants.colors.map(col => (
                      <div
                        key={col}
                        className={`swatch ${variants.colors === col ? 'active' : ''}`}
                        onClick={() => setVariants(v => ({ ...v, colors: col }))}
                      >
                        {col}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Sticky Sidebar */}
        <Col lg={2} md={12}>
          <Card className="sidebar-card mb-4">
            <Card.Body>
              <div className="fs-5 fw-bold mb-1">UGX {price1.toLocaleString()}</div>
              <div className="text-success small mb-3">Get it by ~{eta}</div>

              <Form.Group className="mb-3">
                <Form.Label className="small">Quantity</Form.Label>
                <div className="d-flex align-items-center gap-1">
                  <Button size="sm" onClick={() => changeQty(-1)} disabled={qty <= 1 || outOfStock}>
                    –
                  </Button>
                  <Form.Control
                    type="number"
                    value={qty}
                    onChange={onQtyInput}
                    min={1}
                    max={remain}
                    size="sm"
                    className="text-center"
                  />
                  <Button size="sm" onClick={() => changeQty(1)} disabled={qty >= remain || outOfStock}>
                    +
                  </Button>
                </div>
              </Form.Group>

              <Button className="w-100 mb-2" onClick={addToCartHandler} disabled={outOfStock}>
                <i className="bi bi-cart-plus me-2" /> Add to Cart
              </Button>
              <Button variant="warning" className="w-100 mb-3" onClick={buyNow} disabled={outOfStock}>
                Buy Now
              </Button>

              <div className="text-center small text-muted mb-2">
                <i className="bi bi-lock-fill me-1" /> Secured
              </div>
              <div className="d-flex justify-content-center gap-2 mb-1">
                <span className="badge bg-light text-dark me-2">📦 FedEx</span>
                <span className="badge bg-light text-dark">🚚 DHL</span>
              </div>
              <div className="text-primary small text-center">Fastest cross-border</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Details Tabs */}
      <Tab.Container defaultActiveKey="description">
        <Nav variant="pills" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="description">Description</Nav.Link>
          </Nav.Item>
          {p.specifications.length > 0 && (
            <Nav.Item>
              <Nav.Link eventKey="specs">Specifications</Nav.Link>
            </Nav.Item>
          )}
          <Nav.Item>
            <Nav.Link eventKey="reviews" id="reviews">
              Reviews ({p.reviewsCount})
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="description">
            <p className="text-muted">{p.description || 'No description.'}</p>
          </Tab.Pane>
          {p.specifications.length > 0 && (
            <Tab.Pane eventKey="specs">
              <table className="table">
                <tbody>
                  {p.specifications.map((s, i) => (
                    <tr key={i}>
                      <th className="text-capitalize">{s.label}</th>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Tab.Pane>
          )}
          <Tab.Pane eventKey="reviews">
            {p.reviewsCount > 0 ? (
              <p className="text-muted">Customer reviews will appear here.</p>
            ) : (
              <p className="text-muted">No reviews yet.</p>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Lightbox */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{p.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <OptimizedLazyImage
            src={mainImg}
            alt={p.name}
            className="img-fluid"
            options={{
              width: 800,
              height: 800,
              loading: 'eager'
            }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductHeroSection;