import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Mail, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/layout/AuthShell.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, TextInput } from '../../components/ui/Field.jsx';
import { requestPasswordReset } from '../../features/auth/authSlice.mjs';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { forgotPasswordSchema } from '../../schemas/index.js';

export default function ForgotPassword() {
  useDocumentTitle('Forgot password');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sentTo, setSentTo] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    setLoading(true);

    try {
      await dispatch(requestPasswordReset({ email: values.email.trim() })).unwrap();
      setSentTo(values.email.trim());
    } catch (message) {
      setServerError(typeof message === 'string' ? message : 'Could not send the reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <header className="auth-card__head">
        <p className="eyebrow">Account recovery</p>
        <h1>
          Find your way <em>back.</em>
        </h1>
        <p className="auth-card__intro">
          Enter your email and we’ll send a 6-digit code to reset your password.
        </p>
      </header>

      {sentTo ? (
        <div className="auth-success">
          <span className="auth-success__icon" aria-hidden="true">
            <MailCheck size={22} />
          </span>
          <h2>Check your inbox</h2>
          <p>
            If an account exists for <strong>{sentTo}</strong>, a reset code is on its way. It
            expires in 10 minutes.
          </p>
          <Button
            size="lg"
            fullWidth
            onClick={() => navigate('/reset-password', { state: { email: sentTo } })}
            trailingIcon={<ArrowRight size={16} aria-hidden="true" />}
          >
            Enter reset code
          </Button>
          <button
            type="button"
            className="auth-success__again"
            onClick={() => setSentTo('')}
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Email address" htmlFor="forgot-email" error={errors.email?.message}>
            <TextInput
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail size={16} aria-hidden="true" />}
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>

          {serverError ? (
            <p className="form-alert" role="alert">
              {serverError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            trailingIcon={<ArrowRight size={17} aria-hidden="true" />}
          >
            {loading ? 'Sending code…' : 'Send reset code'}
          </Button>

          <p className="auth-form__legal">
            For your privacy, we show the same message whether or not an account exists.
          </p>
        </form>
      )}

      <p className="auth-card__foot">
        <Link to="/login" className="auth-back-link">
          <ArrowLeft size={14} aria-hidden="true" />
          Back to sign in
        </Link>
        {!sentTo && getValues('email') ? null : null}
      </p>
    </AuthShell>
  );
}
