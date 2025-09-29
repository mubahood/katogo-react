// src/app/pages/account/AccountOrders.tsx
import React, { useState } from "react";
import { Container, Row, Col, Card, Badge, Button, Form, Nav, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Package, Eye, Download, Truck, CheckCircle, Clock, Filter } from "lucide-react";

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  shippingAddress: string;
  trackingNumber?: string;
}

const AccountOrders: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Mock orders data
  const orders: Order[] = [
    {
      id: "ORD-2024-001",
      date: "2024-01-15",
      status: "delivered",
      total: 89.99,
      trackingNumber: "1Z999AA1234567890",
      items: [
        {
          id: "1",
          name: "Wireless Bluetooth Headphones",
          quantity: 1,
          price: 59.99,
          image: "/api/placeholder/60/60"
        },
        {
          id: "2",
          name: "Phone Case",
          quantity: 1,
          price: 29.99,
          image: "/api/placeholder/60/60"
        }
      ],
      shippingAddress: "123 Main St, New York, NY 10001"
    },
    {
      id: "ORD-2024-002",
      date: "2024-01-10",
      status: "shipped",
      total: 159.99,
      trackingNumber: "1Z999AA1234567891",
      items: [
        {
          id: "3",
          name: "Gaming Mouse",
          quantity: 1,
          price: 79.99,
          image: "/api/placeholder/60/60"
        },
        {
          id: "4",
          name: "Mouse Pad",
          quantity: 1,
          price: 19.99,
          image: "/api/placeholder/60/60"
        }
      ],
      shippingAddress: "123 Main St, New York, NY 10001"
    },
    {
      id: "ORD-2024-003",
      date: "2024-01-05",
      status: "processing",
      total: 299.99,
      items: [
        {
          id: "5",
          name: "Mechanical Keyboard",
          quantity: 1,
          price: 149.99,
          image: "/api/placeholder/60/60"
        },
        {
          id: "6",
          name: "USB-C Hub",
          quantity: 1,
          price: 89.99,
          image: "/api/placeholder/60/60"
        }
      ],
      shippingAddress: "123 Main St, New York, NY 10001"
    },
    {
      id: "ORD-2023-045",
      date: "2023-12-20",
      status: "delivered",
      total: 45.99,
      items: [
        {
          id: "7",
          name: "Desk Lamp",
          quantity: 1,
          price: 45.99,
          image: "/api/placeholder/60/60"
        }
      ],
      shippingAddress: "123 Main St, New York, NY 10001"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'processing':
        return <Package size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
        return <CheckCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">My Orders</h1>
            <div className="d-flex align-items-center gap-3">
              <Filter size={16} className="text-muted" />
              <Form.Select 
                size="sm" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: "auto" }}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </div>
          </div>
        </Col>
      </Row>

      {/* Orders List */}
      <Row>
        <Col>
          {filteredOrders.length === 0 ? (
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <Package size={48} className="text-muted mb-3" />
                <h3 className="h5">No orders found</h3>
                <p className="text-muted mb-4">
                  {filterStatus === "all" 
                    ? "You haven't placed any orders yet." 
                    : `No orders with status "${filterStatus}".`
                  }
                </p>
                <Link to="/products" className="btn btn-primary">
                  Start Shopping
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <Row className="align-items-center">
                      <Col md={6} lg={3} className="mb-3 mb-lg-0">
                        <div className="d-flex align-items-center">
                          <div className="text-primary me-3">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <h6 className="mb-1">{order.id}</h6>
                            <small className="text-muted">{order.date}</small>
                          </div>
                        </div>
                      </Col>
                      
                      <Col md={6} lg={3} className="mb-3 mb-lg-0">
                        <Badge 
                          bg={getStatusVariant(order.status)} 
                          className="d-inline-flex align-items-center gap-1"
                        >
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </Col>
                      
                      <Col md={6} lg={2} className="mb-3 mb-lg-0">
                        <div className="text-muted small">{order.items.length} items</div>
                        <div className="fw-semibold">${order.total.toFixed(2)}</div>
                      </Col>
                      
                      <Col md={6} lg={4} className="text-lg-end">
                        <div className="d-flex gap-2 justify-content-lg-end">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye size={14} className="me-1" />
                            View
                          </Button>
                          {order.status === 'shipped' || order.status === 'delivered' ? (
                            <Button variant="outline-secondary" size="sm">
                              <Truck size={14} className="me-1" />
                              Track
                            </Button>
                          ) : null}
                          {order.status === 'delivered' && (
                            <Button variant="outline-secondary" size="sm">
                              <Download size={14} className="me-1" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details - {selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Order Information</h6>
                  <p className="mb-1"><strong>Order Date:</strong> {selectedOrder.date}</p>
                  <p className="mb-1"><strong>Status:</strong> 
                    <Badge 
                      bg={getStatusVariant(selectedOrder.status)} 
                      className="ms-2"
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </p>
                  {selectedOrder.trackingNumber && (
                    <p className="mb-1"><strong>Tracking:</strong> {selectedOrder.trackingNumber}</p>
                  )}
                </Col>
                <Col md={6}>
                  <h6>Shipping Address</h6>
                  <p>{selectedOrder.shippingAddress}</p>
                </Col>
              </Row>

              <h6>Order Items</h6>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="d-flex align-items-center border rounded p-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="rounded me-3"
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="text-muted mb-0">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold">${item.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-top pt-3 mt-3">
                <div className="d-flex justify-content-between">
                  <strong>Total: ${selectedOrder.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Navigation Tabs for Mobile */}
      <Row className="d-lg-none mt-4">
        <Col>
          <Nav variant="pills" className="justify-content-center">
            <Nav.Item>
              <Nav.Link as={Link} to="/account">Dashboard</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/account/orders" active>Orders</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/account/profile">Profile</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/account/settings">Settings</Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountOrders;
