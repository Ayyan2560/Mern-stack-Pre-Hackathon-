
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { loginUser } from "../../features/auth/authSlice.mjs";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      loginUser({ email, password })
    );

    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">connect<span>.</span></div>

        <p className="auth-eyebrow">WELCOME BACK</p>
        <h1>Sign in to your account</h1>
        <p className="auth-subtitle">
          Your community is waiting for you.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <div className="auth-input-wrap">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <LockKeyhole size={18} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="auth-options">
            <span>Secure sign in</span>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create account</Link>
        </p>
      </section>
    </main>
  );
}
