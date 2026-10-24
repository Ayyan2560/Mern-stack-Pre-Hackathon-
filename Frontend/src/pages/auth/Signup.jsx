import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/layout/AuthShell.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, PasswordInput, TextInput } from '../../components/ui/Field.jsx';
import { signupUser } from '../../features/auth/authSlice.mjs';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { signupSchema } from '../../schemas/index.js';

export default function Signup() {
  useDocumentTitle('Create account');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const [serverError, setServerError] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');

    try {
      const result = await dispatch(
        signupUser({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        })
      ).unwrap();

      toast.success(result.message || 'Account created. Check your email for the code.');
      navigate('/verify-email', {
        replace: true,
        state: { email: values.email.trim(), justSignedUp: true },
      });
    } catch (message) {
      setServerError(typeof message === 'string' ? message : 'Could not create your account.');
    }
  };

  const loading = status === 'loading';

  return (
    <AuthShell>
      <header className="auth-card__head">
        <p className="eyebrow">Join the atelier</p>
        <h1>
          Begin your <em>edition.</em>
        </h1>
        <p className="auth-card__intro">
          A considered account for sharing stories and keeping the good ones close.
        </p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Full name" htmlFor="signup-name" error={errors.name?.message}>
          <TextInput
            id="signup-name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            icon={<UserRound size={16} aria-hidden="true" />}
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </Field>

        <Field label="Email address" htmlFor="signup-email" error={errors.email?.message}>
          <TextInput
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            icon={<Mail size={16} aria-hidden="true" />}
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <div className="form-grid">
          <Field
            label="Password"
            htmlFor="signup-password"
            error={errors.password?.message}
            hint="At least 8 characters."
          >
            <PasswordInput
              id="signup-password"
              placeholder="Create a password"
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              {...register('password', {
                onChange: (event) => setPasswordValue(event.target.value),
              })}
            />
          </Field>

          <Field
            label="Confirm"
            htmlFor="signup-confirm"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="signup-confirm"
              placeholder="Repeat password"
              autoComplete="new-password"
              invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
          </Field>
        </div>

        <div className="password-meter" aria-hidden="true">
          <span className={passwordValue.length >= 8 ? 'is-met' : ''} />
          <span className={passwordValue.length >= 12 ? 'is-met' : ''} />
          <span className={/[^a-zA-Z0-9]/.test(passwordValue) ? 'is-met' : ''} />
          <p>{passwordValue.length >= 8 ? 'A good start.' : 'Use 8+ characters.'}</p>
        </div>

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
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="auth-form__legal">
          We’ll send a 6-digit code to verify your email. Nothing is posted until you choose to
          share it.
        </p>
      </form>

      <p className="auth-card__foot">
        Already a member? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
