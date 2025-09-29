// src/app/pages/FAQPage.tsx
import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Accordion, Badge, Button } from "react-bootstrap";
import { Search, HelpCircle, MessageCircle, Mail, Phone } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  popular: boolean;
}

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'My Orders' section. You'll find your tracking number and a link to track your package with the shipping carrier.",
      category: "orders",
      popular: true
    },
    {
      id: "2",
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Items must be unused, in original packaging, and returned within 30 days of delivery. Some items like personalized products may not be eligible for return.",
      category: "returns",
      popular: true
    },
    {
      id: "3",
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-7 business days. Express shipping takes 1-3 business days. International shipping may take 7-14 business days depending on the destination.",
      category: "shipping",
      popular: true
    },
    {
      id: "4",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and shop now, pay later options like Klarna.",
      category: "payment",
      popular: false
    },
    {
      id: "5",
      question: "How do I cancel my order?",
      answer: "Orders can be cancelled within 1 hour of placing them. After that, if the order hasn't shipped, you may contact customer service to request cancellation.",
      category: "orders",
      popular: false
    },
    {
      id: "6",
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 100 countries worldwide. International shipping costs and delivery times vary by location. Additional customs fees may apply.",
      category: "shipping",
      popular: false
    },
    {
      id: "7",
      question: "How do I use a discount code?",
      answer: "Enter your discount code in the 'Promo Code' field during checkout. The discount will be applied to your order total before payment.",
      category: "payment",
      popular: false
    },
    {
      id: "8",
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the top right corner of the website. Fill in your details and verify your email address to complete the registration process.",
      category: "account",
      popular: false
    },
    {
      id: "9",
      question: "What if I receive a damaged item?",
      answer: "If you receive a damaged item, please contact us immediately with photos of the damage. We'll arrange for a replacement or full refund at no cost to you.",
      category: "returns",
      popular: true
    },
    {
      id: "10",
      question: "How do I change my shipping address?",
      answer: "You can update your shipping address in your account settings. For orders already placed, contact customer service within 1 hour to change the address.",
      category: "account",
      popular: false
    }
  ];

  const categories = [
    { value: "all", label: "All Categories", count: faqs.length },
    { value: "orders", label: "Orders & Tracking", count: faqs.filter(f => f.category === "orders").length },
    { value: "shipping", label: "Shipping & Delivery", count: faqs.filter(f => f.category === "shipping").length },
    { value: "returns", label: "Returns & Refunds", count: faqs.filter(f => f.category === "returns").length },
    { value: "payment", label: "Payment & Billing", count: faqs.filter(f => f.category === "payment").length },
    { value: "account", label: "Account & Profile", count: faqs.filter(f => f.category === "account").length }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFAQs = faqs.filter(faq => faq.popular);

  return (
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-5">
        <Col className="text-center">
          <div className="mb-4">
            <HelpCircle size={64} className="text-primary mb-3" />
            <h1 className="display-5 fw-bold mb-3">Frequently Asked Questions</h1>
            <p className="lead text-muted">
              Find answers to common questions about shopping, orders, and returns
            </p>
          </div>

          {/* Search */}
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <div className="position-relative mb-4">
                <Form.Control
                  type="text"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control-lg ps-5"
                />
                <Search 
                  size={20} 
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        {/* Categories Sidebar */}
        <Col lg={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom-0 py-3">
              <h5 className="mb-0">Categories</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    className={`list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center ${
                      selectedCategory === category.value ? 'active' : ''
                    }`}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    <span>{category.label}</span>
                    <Badge bg="secondary" className="rounded-pill">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Contact Support */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Still Need Help?</h6>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-muted small mb-3">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm">
                  <MessageCircle size={16} className="me-2" />
                  Live Chat
                </Button>
                <Button variant="outline-primary" size="sm">
                  <Mail size={16} className="me-2" />
                  Email Support
                </Button>
                <Button variant="outline-primary" size="sm">
                  <Phone size={16} className="me-2" />
                  Call Us
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* FAQ Content */}
        <Col lg={9}>
          {/* Popular FAQs */}
          {searchTerm === "" && selectedCategory === "all" && (
            <div className="mb-5">
              <h3 className="h4 mb-4 d-flex align-items-center">
                <span className="badge bg-warning text-dark rounded-pill me-2">Popular</span>
                Most Asked Questions
              </h3>
              <Accordion defaultActiveKey="0">
                {popularFAQs.map((faq, index) => (
                  <Accordion.Item key={faq.id} eventKey={index.toString()}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center">
                        <Badge bg="success" className="rounded-pill me-2">
                          Popular
                        </Badge>
                        {faq.question}
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <p className="mb-0">{faq.answer}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          )}

          {/* All FAQs */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h4 mb-0">
                {selectedCategory === "all" ? "All Questions" : categories.find(c => c.value === selectedCategory)?.label}
              </h3>
              <span className="text-muted">
                {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filteredFAQs.length === 0 ? (
              <Card className="border-0 shadow-sm text-center py-5">
                <Card.Body>
                  <HelpCircle size={48} className="text-muted mb-3" />
                  <h5>No results found</h5>
                  <p className="text-muted mb-4">
                    Try adjusting your search or browse different categories.
                  </p>
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <Accordion>
                {filteredFAQs.map((faq, index) => (
                  <Accordion.Item key={faq.id} eventKey={index.toString()}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center w-100">
                        {faq.popular && (
                          <Badge bg="success" className="rounded-pill me-2">
                            Popular
                          </Badge>
                        )}
                        <span className="flex-grow-1">{faq.question}</span>
                        <Badge 
                          bg="secondary" 
                          className="rounded-pill ms-2 text-capitalize"
                        >
                          {faq.category}
                        </Badge>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <p className="mb-0">{faq.answer}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </div>
        </Col>
      </Row>

      {/* Bottom CTA */}
      <Row className="mt-5 pt-5 border-top">
        <Col className="text-center">
          <h4 className="mb-3">Didn't find what you were looking for?</h4>
          <p className="text-muted mb-4">
            Our customer support team is available 24/7 to help you with any questions.
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Button variant="primary" size="lg">
              <MessageCircle size={20} className="me-2" />
              Contact Support
            </Button>
            <Button variant="outline-primary" size="lg">
              <Mail size={20} className="me-2" />
              Send Email
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FAQPage;
