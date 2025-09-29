import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import AuthGuard from '../../components/Auth/AuthGuard';
import { APP_CONFIG } from '../../constants';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  preferredGenres: string[];
  agreeToTerms: boolean;
  marketingConsent: boolean;
}

interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    preferredGenres: [],
    agreeToTerms: false,
    marketingConsent: true,
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const movieGenres = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance',
    'Thriller', 'Adventure', 'Animation', 'Documentary', 'Family',
    'Fantasy', 'Music', 'Mystery', 'War', 'Western', 'Crime'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setServerError("");

    try {
      const response = await authService.register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        // Success - redirect to home page or show verification message
        console.log('Registration successful:', response.data.user);
        navigate("/", { replace: true });
      } else {
        setServerError(response.message || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setServerError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove body padding for auth pages
  useEffect(() => {
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = 'calc(56px + 35px + 0px)';
    };
  }, []);

  return (
    <AuthGuard requireAuth={false}>
      <div className="ugflix-auth-page">
        <Container fluid className="h-100">
          <Row className="h-100 align-items-center justify-content-center">
            {/* Back to Home Link */}
            <div className="position-absolute" style={{ top: '2rem', left: '2rem', zIndex: 100 }}>
              <Link 
                to="/" 
                className="ugflix-btn ugflix-btn-ghost"
                style={{
                  padding: 'var(--ugflix-space-2) var(--ugflix-space-3)',
                  fontSize: 'var(--ugflix-text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ugflix-space-2)'
                }}
              >
                <i className="bi bi-arrow-left"></i>
                Back to Home
              </Link>
            </div>

            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              {/* UgFlix Branding */}
              <div className="text-center mb-4">
                <img 
                  src={APP_CONFIG.LOGO}
                  alt={APP_CONFIG.NAME}
                  style={{ 
                    height: '60px',
                    marginBottom: 'var(--ugflix-space-4)'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                    if (textLogo) textLogo.style.display = 'block';
                  }}
                />
                <h1 
                  className="ugflix-text-gradient"
                  style={{
                    display: 'none',
                    fontSize: 'var(--ugflix-text-3xl)',
                    fontWeight: 'var(--ugflix-font-bold)',
                    marginBottom: 'var(--ugflix-space-4)'
                  }}
                >
                  {APP_CONFIG.NAME}
                </h1>
                <p style={{
                  color: 'var(--ugflix-text-secondary)',
                  fontSize: 'var(--ugflix-text-lg)',
                  marginBottom: 0
                }}>
                  Join the ultimate streaming experience
                </p>
              </div>
              
              {/* Registration Form */}
              <div className="ugflix-card">
                <div className="text-center mb-4">
                  <h2 style={{
                    fontSize: 'var(--ugflix-text-2xl)',
                    fontWeight: 'var(--ugflix-font-semibold)',
                    color: 'var(--ugflix-text-primary)',
                    marginBottom: 'var(--ugflix-space-2)'
                  }}>
                    Create Your Account
                  </h2>
                  <p style={{
                    color: 'var(--ugflix-text-secondary)',
                    fontSize: 'var(--ugflix-text-base)',
                    margin: 0
                  }}>
                    Start your streaming journey today
                  </p>
                </div>

                {serverError && (
                  <Alert 
                    variant="danger" 
                    className="ugflix-alert"
                    style={{ marginBottom: 'var(--ugflix-space-4)' }}
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {serverError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    {/* Personal Information */}
                    <Col md={6}>
                      <Form.Group style={{ marginBottom: 'var(--ugflix-space-4)' }}>
                        <Form.Label className="ugflix-form-label">
                          <i className="bi bi-person-fill" style={{ marginRight: 'var(--ugflix-space-2)' }}></i>
                          First Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          isInvalid={!!errors.firstName}
                          className="ugflix-form-input"
                          placeholder="Enter first name"
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="ugflix-form-label">
                          <i className="bi bi-person-fill me-2"></i>
                          Last Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          isInvalid={!!errors.lastName}
                          className="ugflix-form-input"
                          placeholder="Enter last name"
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="ugflix-form-label">
                      <i className="bi bi-envelope-fill me-2"></i>
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      isInvalid={!!errors.email}
                      className="ugflix-form-input"
                      placeholder="Enter your email"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="ugflix-form-label">
                      <i className="bi bi-phone-fill me-2"></i>
                      Phone Number
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      isInvalid={!!errors.phoneNumber}
                      className="ugflix-form-input"
                      placeholder="Enter phone number"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phoneNumber}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Password Fields */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="ugflix-form-label">
                          <i className="bi bi-lock-fill me-2"></i>
                          Password
                        </Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            isInvalid={!!errors.password}
                            className="ugflix-form-input"
                            placeholder="Create password"
                            required
                          />
                          <button
                            type="button"
                            className="ugflix-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="ugflix-form-label">
                          <i className="bi bi-lock-fill me-2"></i>
                          Confirm Password
                        </Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            isInvalid={!!errors.confirmPassword}
                            className="ugflix-form-input"
                            placeholder="Confirm password"
                            required
                          />
                          <button
                            type="button"
                            className="ugflix-password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            tabIndex={-1}
                          >
                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Genre Preferences */}
                  <Form.Group className="mb-4">
                    <Form.Label className="ugflix-form-label">
                      <i className="bi bi-film me-2"></i>
                      Favorite Genres (Optional)
                    </Form.Label>
                    <div className="ugflix-genre-selection">
                      {movieGenres.map((genre) => (
                        <Form.Check
                          key={genre}
                          type="checkbox"
                          id={`genre-${genre}`}
                          className="ugflix-genre-checkbox"
                          label={genre}
                          checked={formData.preferredGenres.includes(genre)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              preferredGenres: isChecked 
                                ? [...prev.preferredGenres, genre]
                                : prev.preferredGenres.filter(g => g !== genre)
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </Form.Group>

                  {/* Terms and Conditions */}
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      isInvalid={!!errors.agreeToTerms}
                      className="ugflix-checkbox"
                      required
                      label={
                        <span className="ugflix-checkbox-label">
                          I agree to the{" "}
                          <Link to="/terms" className="ugflix-link">
                            Terms of Service
                          </Link>
                          {" "}and{" "}
                          <Link to="/privacy" className="ugflix-link">
                            Privacy Policy
                          </Link>
                        </span>
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.agreeToTerms}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      id="marketingConsent"
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleInputChange}
                      className="ugflix-checkbox"
                      label={
                        <span className="ugflix-checkbox-label">
                          <i className="bi bi-bell-fill me-2"></i>
                          Get updates about new movies, shows, and exclusive content
                        </span>
                      }
                    />
                  </Form.Group>

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      className="ugflix-btn-primary ugflix-btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus-fill me-2"></i>
                          Create My UgFlix Account
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Login Link */}
                {/* Login Link */}
                <div className="text-center" style={{ marginTop: 'var(--ugflix-space-4)' }}>
                  <p style={{
                    color: 'var(--ugflix-text-secondary)',
                    fontSize: 'var(--ugflix-text-sm)',
                    marginBottom: 0
                  }}>
                    Already have an account?{" "}
                    <Link 
                      to="/auth/login" 
                      className="ugflix-link"
                      style={{
                        color: 'var(--ugflix-primary)',
                        textDecoration: 'none',
                        fontWeight: 'var(--ugflix-font-semibold)'
                      }}
                    >
                      <i className="bi bi-box-arrow-in-right" style={{ marginRight: 'var(--ugflix-space-1)' }}></i>
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </AuthGuard>
  );
};

export default RegisterPage;