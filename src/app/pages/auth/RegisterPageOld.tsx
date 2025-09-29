// src/app/pages/auth/RegisterPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner, Container, Row, Col } from "react-bootstrap";
import { APP_CONFIG } from "../../constants";
import "../../styles/ugflix-theme.css";

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
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError("");
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

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
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
    setErrors({}); // Clear any previous errors
    setServerError(""); // Clear server error

    try {
      // Simplified for testing - just show success
      console.log('Registration attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Registration successful (test mode)');
      navigate("/");
    } catch (error: any) {
      // Handle any unexpected errors
      const errorMessage = error?.message || "Registration failed. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ugflix-auth-page">
      {/* Cinematic Background */}
      <div className="ugflix-auth-background">
        <div className="ugflix-auth-overlay"></div>
      </div>
      
      <div className="container-fluid h-100">
        <div className="row h-100 align-items-center justify-content-center">
          {/* UgFlix Branding */}
          <div className="col-12 text-center mb-4 ugflix-brand-header">
            <h1 className="ugflix-logo">UgFlix</h1>
            <p className="ugflix-tagline">Join the Ultimate Streaming Experience</p>
          </div>
          
          {/* Registration Form */}
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="ugflix-auth-card">
              <div className="ugflix-card-content">
                <div className="text-center mb-4">
                  <h2 className="ugflix-card-title">Create Your Account</h2>
                  <p className="ugflix-card-subtitle">Start your streaming journey today</p>
                </div>

                {serverError && (
                  <Alert variant="danger" className="mb-4 ugflix-alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {serverError}
                  </Alert>
                )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            isInvalid={!!errors.firstName}
            placeholder="Enter your first name"
            autoComplete="given-name"
          />
          <Form.Control.Feedback type="invalid">
            {errors.firstName}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            isInvalid={!!errors.lastName}
            placeholder="Enter your last name"
            autoComplete="family-name"
          />
          <Form.Control.Feedback type="invalid">
            {errors.lastName}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            isInvalid={!!errors.email}
            placeholder="Enter your email"
            autoComplete="email"
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            isInvalid={!!errors.password}
            placeholder="Create a strong password"
            autoComplete="new-password"
          />
          <Form.Control.Feedback type="invalid">
            {errors.password}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            Must be at least 4 characters
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            isInvalid={!!errors.confirmPassword}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
          <Form.Control.Feedback type="invalid">
            {errors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            isInvalid={!!errors.agreeToTerms}
            label={
              <>
                I agree to the{" "}
                <Link to="/terms" className="text-decoration-none">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-decoration-none">
                  Privacy Policy
                </Link>
              </>
            }
          />
          <Form.Control.Feedback type="invalid">
            {errors.agreeToTerms}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            name="marketingConsent"
            checked={formData.marketingConsent}
            onChange={handleInputChange}
            label="Subscribe to our newsletter for updates and offers"
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-100 mb-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="text-center">
          <span className="text-muted">Already have an account? </span>
          <Link to="/auth/login" className="text-decoration-none fw-semibold">
            Sign in
          </Link>
        </div>
 
      </Form>
    </div>
  );
};

export default RegisterPage;
