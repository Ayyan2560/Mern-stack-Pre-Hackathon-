import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/layout/AuthShell.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, PasswordInput, TextInput } from '../../components/ui/Field.jsx';
import { clearAuthError, loginUser } from '../../features/auth/authSlice.mjs';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { loginSchema } from '../../schemas/index.js';

export default function Login() {
  useDocumentTitle('Sign in');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = async (values) => {
    setServerError('');

    try {
      await dispatch(loginUser(values)).unwrap();
      toast.success('Welcome back to Aurel.');
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (message) {
      setServerError(typeof message === 'string' ? message : 'Sign in failed.');
    }
  };

  const loading = status === 'loading';

  return (
    <AuthShell>
      <header className="auth-card__head">
        <p className="eyebrow">Members’ entrance</p>
        <h1>
          Welcome <em>back.</em>
        </h1>
        <p className="auth-card__intro">
          Sign in to continue reading and writing in the atelier.
        </p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email address" htmlFor="login-email" error={errors.email?.message}>
          <TextInput
            id="login-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            icon={<Mail size={16} aria-hidden="true" />}
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field label="Password" htmlFor="login-password" error={errors.password?.message}>
          <PasswordInput
            id="login-password"
            placeholder="Your password"
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </Field>

        <div className="auth-form__row">
          <span className="auth-form__secure">Secure token session</span>
          <Link to="/forgot-password" className="text-link">
            Forgot password?
          </Link>
        </div>

        {serverError || error ? (
          <p className="form-alert" role="alert">
            {serverError || error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          trailingIcon={<ArrowRight size={17} aria-hidden="true" />}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="auth-card__foot">
        New to Aurel? <Link to="/signup">Create an account</Link>
      </p>
    </AuthShell>
  );
}
