import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { loginSuccess, restoreAuthState } from "../../store/slices/authSlice";
import AuthGuard from "../../components/Auth/AuthGuard";
import { APP_CONFIG, COMPANY_INFO } from "../../constants";
import { authService } from "../../services/auth.service";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
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

const GOOGLE_OAUTH_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

interface GoogleActionButtonProps {
  googleEnabled: boolean;
  disabled: boolean;
  onError: (message: string) => void;
  onProcessing: (value: boolean) => void;
  onSuccess: () => void;
  label: string;
}

const GoogleActionButton: React.FC<GoogleActionButtonProps> = ({
  googleEnabled,
  disabled,
  onError,
  onProcessing,
  onSuccess,
  label,
}) => {
  const dispatch = useDispatch();

  const handleGoogleCredential = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      onError("Google login response was invalid.");
      return;
    }

    onProcessing(true);
    onError("");
    try {
      const response = await authService.loginWithGoogle(idToken);

      // Validate response structure (matches mobile: check code, data, user, user.id)
      if (!response.success || !response.data?.user) {
        onError(response.message || "Google authentication failed.");
        return;
      }

      // Sync Redux store with the auth data
      const token = response.data.user.token || response.data.user.remember_token;
      if (token && response.data.user) {
        dispatch(loginSuccess({ user: response.data.user, token }));
      } else {
        dispatch(restoreAuthState());
      }
      onSuccess();
    } catch (error: any) {
      onError(error.message || "Google authentication failed. Please try again.");
    } finally {
      onProcessing(false);
    }
  };

  if (!googleEnabled) {
    return (
      <button
        type="button"
        className="auth-google-btn"
        disabled={disabled}
        onClick={() => onError("Google sign-up is not configured on this build.")}
      >
        <i className="bi bi-google" aria-hidden="true" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className="auth-google-native-btn" aria-label={label}>
      <GoogleLogin
        onSuccess={handleGoogleCredential}
        onError={() => onError("Google authentication cancelled or failed.")}
        text="continue_with"
        shape="pill"
        size="large"
        theme="outline"
        width="100%"
        logo_alignment="left"
        itp_support
        cancel_on_tap_outside={false}
      />
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    marketingConsent: true,
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    document.body.style.paddingTop = "0";
    return () => {
      document.body.style.paddingTop = "";
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors: RegisterFormErrors = {};

    if (!formData.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) nextErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      nextErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError("");

    try {
      const registerResponse = await authService.register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
      });

      if (!registerResponse.success || registerResponse.code !== 1) {
        setServerError(registerResponse.message || "Registration failed. Please try again.");
        return;
      }

      const loginResponse = await authService.login({
        email: formData.email,
        password: formData.password,
        remember: false,
      });

      if (loginResponse.success && loginResponse.code === 1) {
        // Sync Redux store after registration + auto-login
        dispatch(restoreAuthState());
        navigate("/", { replace: true });
      } else {
        setServerError("Registration completed. Please sign in manually.");
      }
    } catch (error: any) {
      setServerError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="auth-shell">
        <div className="auth-gradient" />
        <div className="auth-grid-lines" />

        <main className="auth-card auth-card-register" role="main" aria-label="Register page">
          <Link to="/landing" className="auth-brand" aria-label="Go to landing page">
            <img
              src={APP_CONFIG.LOGO}
              alt={APP_CONFIG.NAME}
              className="auth-brand-logo"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (sibling) sibling.style.display = "block";
              }}
            />
            <span className="auth-brand-text" style={{ display: "none" }}>
              {APP_CONFIG.NAME}
            </span>
          </Link>

          <header className="auth-header">
            <h1>Create account</h1>
            <p>Start watching in minutes.</p>
          </header>

          {serverError ? (
            <div className="auth-alert auth-alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          ) : null}

          <GoogleActionButton
            googleEnabled={GOOGLE_OAUTH_ENABLED}
            disabled={isLoading}
            label="Proceed with Google"
            onError={setServerError}
            onProcessing={setIsLoading}
            onSuccess={() => navigate("/", { replace: true })}
          />

          <div className="auth-small-separator">or</div>

          <button
            type="button"
            className="auth-text-toggle"
            onClick={() => setShowEmailForm((prev) => !prev)}
          >
            {showEmailForm ? "Hide email and password" : "Register using email and password"}
          </button>

          {showEmailForm ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-two-col">
                <div className="auth-field">
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    className={`auth-input${errors.firstName ? ' is-invalid' : ''}`}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    required
                  />
                  {errors.firstName && <div className="auth-feedback">{errors.firstName}</div>}
                </div>

                <div className="auth-field">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    className={`auth-input${errors.lastName ? ' is-invalid' : ''}`}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    required
                  />
                  {errors.lastName && <div className="auth-feedback">{errors.lastName}</div>}
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={`auth-input${errors.email ? ' is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                {errors.email && <div className="auth-feedback">{errors.email}</div>}
              </div>

              <div className="auth-field">
                <label htmlFor="phoneNumber">Phone number (optional)</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  className="auth-input"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                />
              </div>

              <div className="auth-two-col">
                <div className="auth-field">
                  <label htmlFor="password">Password</label>
                  <div className="auth-password-wrap">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`auth-input${errors.password ? ' is-invalid' : ''}`}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                  {errors.password && <div className="auth-feedback">{errors.password}</div>}
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <div className="auth-password-wrap">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className={`auth-input${errors.confirmPassword ? ' is-invalid' : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="auth-feedback">{errors.confirmPassword}</div>}
                </div>
              </div>

              <div className="auth-checks">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                  />
                  <span>I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link></span>
                </label>
                {errors.agreeToTerms ? <div className="auth-check-error">{errors.agreeToTerms}</div> : null}

                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                  />
                  <span>Get updates about new releases</span>
                </label>
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="auth-spinner" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus-fill" aria-hidden="true" />
                    <span>Create account</span>
                  </>
                )}
              </button>
            </form>
          ) : null}

          <footer className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/auth/login">Sign in</Link>
          </footer>
        </main>

        <a
          href={`https://wa.me/${COMPANY_INFO.WHATSAPP.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="auth-help"
          title="Need help? Chat with us on WhatsApp"
        >
          <i className="bi bi-whatsapp" aria-hidden="true" />
          <span>Help</span>
        </a>

        <style>{`
          .auth-shell {
            position: relative;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            background: #0a0e16;
            overflow: hidden;
          }

          .auth-gradient,
          .auth-grid-lines {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }

          .auth-gradient {
            background:
              radial-gradient(circle at 12% 16%, rgba(232, 93, 4, 0.22), transparent 36%),
              radial-gradient(circle at 88% 78%, rgba(16, 185, 129, 0.16), transparent 30%),
              linear-gradient(155deg, #080b12 0%, #101827 45%, #151515 100%);
          }

          .auth-grid-lines {
            background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 24px 24px;
            mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
          }

          .auth-card {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 34rem;
            border-radius: 1.05rem;
            padding: 1.25rem;
            background: rgba(8, 12, 20, 0.82);
            border: 1px solid rgba(255,255,255,0.14);
            backdrop-filter: blur(14px);
            box-shadow: 0 18px 60px rgba(0,0,0,0.45);
          }

          .auth-brand {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            margin-bottom: 1rem;
          }

          .auth-brand-logo {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.6rem;
            object-fit: contain;
          }

          .auth-brand-text {
            color: #f6f7fb;
            font-weight: 700;
            font-size: 1.1rem;
          }

          .auth-header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 1.5rem;
            letter-spacing: -0.02em;
          }

          .auth-header p {
            margin: 0.35rem 0 1rem;
            color: rgba(240, 245, 255, 0.72);
            font-size: 0.92rem;
          }

          .auth-alert {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.72rem 0.85rem;
            margin-bottom: 1rem;
            border-radius: 0.5rem;
          }

          .auth-alert-danger {
            background: rgba(220, 53, 69, 0.15);
            border: 1px solid rgba(220, 53, 69, 0.3);
            color: #ffb4b4;
            font-size: 0.85rem;
          }

          .auth-muted {
            margin: 0 0 0.75rem;
            font-size: 0.85rem;
            color: rgba(245, 245, 245, 0.72);
            text-align: center;
          }

          .auth-google-btn,
          .auth-submit {
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid rgba(255,255,255,0.2);
            min-height: 2.95rem;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: 0.6rem;
            font-weight: 600;
            transition: transform 0.18s ease, opacity 0.18s ease;
          }

          .auth-google-btn {
            background: #ffffff;
            color: #101827;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
          }

          .auth-google-native-btn {
            width: 100%;
            min-height: 2.95rem;
            border-radius: 0.95rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.7);
            background: linear-gradient(135deg, #ffffff 0%, #f3f6fb 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow:
              0 14px 36px rgba(8, 12, 20, 0.34),
              0 6px 14px rgba(8, 12, 20, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.45) inset;
            animation: googleFloat 4.5s ease-in-out infinite;
            position: relative;
          }

          .auth-google-native-btn::after {
            content: "";
            position: absolute;
            inset: -6px;
            border-radius: 1.1rem;
            background: radial-gradient(circle at center, rgba(255,255,255,0.35), transparent 70%);
            opacity: 0.35;
            z-index: 0;
            pointer-events: none;
          }

          .auth-google-native-btn::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.72) 50%, transparent 80%);
            transform: translateX(-120%);
            animation: googleShimmer 3.2s ease-in-out infinite;
            pointer-events: none;
          }

          .auth-google-native-btn > div {
            width: 100%;
            position: relative;
            z-index: 1;
          }

          .auth-google-native-btn:hover {
            transform: translateY(-2px);
            box-shadow:
              0 20px 44px rgba(8, 12, 20, 0.46),
              0 10px 20px rgba(8, 12, 20, 0.28),
              0 0 0 1px rgba(255, 255, 255, 0.55) inset;
          }

          .auth-google-btn:hover:not(:disabled),
          .auth-submit:hover:not(:disabled) {
            transform: translateY(-1px);
            opacity: 0.96;
          }

          .auth-google-btn:disabled,
          .auth-submit:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .auth-small-separator {
            text-align: center;
            margin: 0.95rem 0 0.4rem;
            color: rgba(240, 245, 255, 0.5);
            font-size: 0.78rem;
            text-transform: lowercase;
          }

          .auth-text-toggle {
            display: block;
            width: 100%;
            border: 0;
            background: transparent;
            color: #84c5ff;
            font-size: 0.82rem;
            font-weight: 500;
            padding: 0.4rem 0 0.8rem;
            text-align: center;
          }

          .auth-form {
            border-top: 1px solid rgba(255,255,255,0.12);
            margin-top: 0.35rem;
            padding-top: 0.9rem;
          }

          .auth-two-col {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.8rem;
          }

          .auth-field {
            margin-bottom: 0.9rem;
          }

          .auth-field label {
            color: rgba(255,255,255,0.9);
            font-size: 0.85rem;
            margin-bottom: 0.4rem;
          }

          .auth-field .auth-input {
            display: block;
            width: 100%;
            border-radius: 0.7rem;
            min-height: 2.85rem;
            border: 1px solid rgba(255,255,255,0.22);
            background: rgba(255,255,255,0.06);
            color: #fff;
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          .auth-field .auth-input::placeholder {
            color: rgba(255,255,255,0.54);
          }

          .auth-field .auth-input:focus {
            background: rgba(255,255,255,0.08);
            border-color: #ff8c39;
            box-shadow: 0 0 0 0.2rem rgba(255, 140, 57, 0.2);
            color: #fff;
          }

          .auth-field .auth-input.is-invalid {
            border-color: #dc3545;
          }

          .auth-feedback {
            color: #ffb4b4;
            font-size: 0.79rem;
            margin-top: 0.3rem;
          }

          .auth-checkbox {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            cursor: pointer;
            font-size: 0.83rem;
          }

          .auth-checkbox input[type="checkbox"] {
            accent-color: #ff8c39;
            width: 1rem;
            height: 1rem;
          }

          .auth-checkbox a {
            color: #84c5ff;
            text-decoration: none;
          }

          .auth-spinner {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: authSpin 0.6s linear infinite;
          }

          @keyframes authSpin {
            to { transform: rotate(360deg); }
          }

          .auth-password-wrap {
            position: relative;
          }

          .auth-password-toggle {
            position: absolute;
            top: 50%;
            right: 0.7rem;
            transform: translateY(-50%);
            border: 0;
            background: transparent;
            color: rgba(255,255,255,0.74);
          }

          .auth-checks {
            display: grid;
            gap: 0.7rem;
            margin: 0.15rem 0 1rem;
            color: rgba(255,255,255,0.86);
            font-size: 0.83rem;
          }

          .auth-check a {
            color: #84c5ff;
            text-decoration: none;
          }

          .auth-check-error {
            color: #ffb4b4;
            font-size: 0.79rem;
            margin-top: -0.35rem;
          }

          .auth-submit {
            background: linear-gradient(120deg, #e85d04, #ff7b00);
            border-color: transparent;
            color: #fff;
            margin-bottom: 0.8rem;
          }

          .auth-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.45rem;
            color: rgba(255,255,255,0.76);
            font-size: 0.84rem;
            flex-wrap: wrap;
          }

          .auth-footer a {
            color: #84c5ff;
            text-decoration: none;
            font-weight: 600;
          }

          .auth-help {
            position: fixed;
            right: 0.9rem;
            bottom: 0.9rem;
            z-index: 2;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            text-decoration: none;
            color: #fff;
            background: rgba(18, 163, 93, 0.95);
            border: 1px solid rgba(255,255,255,0.25);
            border-radius: 999px;
            padding: 0.5rem 0.8rem;
            font-size: 0.82rem;
            box-shadow: 0 10px 24px rgba(0,0,0,0.32);
          }

          @media (min-width: 640px) {
            .auth-shell {
              padding: 1.6rem;
            }

            .auth-card {
              padding: 1.65rem;
            }

            .auth-header h1 {
              font-size: 1.72rem;
            }

            .auth-two-col {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @keyframes googleFloat {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-2px);
            }
          }

          @keyframes googleShimmer {
            0% {
              transform: translateX(-120%);
            }
            100% {
              transform: translateX(120%);
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
};

export default RegisterPage;
