
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../features/auth/authService.mjs";

export default function Signup() {
  const navigate = useNavigate();
  const submitting = useRef(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (submitting.current) return;

    if (form.name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    submitting.current = true;
    setLoading(true);
    setError("");

    try {
      console.time("Signup API");

      const result = await authService.signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      console.timeEnd("Signup API");

      toast.success(
        result.message ||
          "Account created. Please check your email to verify your account."
      );

      navigate("/login", { replace: true });
    } catch (err) {
      console.timeEnd("Signup API");

      const message =
        err.response?.data?.message ||
        "Signup failed. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          Connect<span>Hub.</span>
        </div>

        <p className="auth-eyebrow">JOIN THE COMMUNITY</p>

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Connect with people and share your moments.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Full name</label>

          <div className="auth-input-wrap">
            <UserRound size={18} />

            <input
              id="signup-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              minLength={2}
              required
            />
          </div>

          <label htmlFor="signup-email">Email address</label>

          <div className="auth-input-wrap">
            <Mail size={18} />

            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="signup-password">Password</label>

          <div className="auth-input-wrap">
            <LockKeyhole size={18} />

            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit signup-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}

            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
