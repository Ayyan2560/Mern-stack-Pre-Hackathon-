import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, KeyRound, Mail } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/layout/AuthShell.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, PasswordInput, TextInput } from '../../components/ui/Field.jsx';
import OtpInput from '../../components/ui/OtpInput.jsx';
import { resetPasswordWithOtp } from '../../features/auth/authSlice.mjs';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { resetPasswordSchema } from '../../schemas/index.js';

export default function ResetPassword() {
  useDocumentTitle('Reset password');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: location.state?.email || '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    setLoading(true);

    try {
      const result = await dispatch(
        resetPasswordWithOtp({
          email: values.email.trim(),
          otp: values.otp,
          password: values.password,
        })
      ).unwrap();

      toast.success(result.message || 'Password reset successfully.');
      navigate('/login', { replace: true, state: { email: values.email.trim() } });
    } catch (message) {
      setServerError(typeof message === 'string' ? message : 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <header className="auth-card__head">
        <p className="eyebrow">Account recovery</p>
        <h1>
          Set a new <em>key.</em>
        </h1>
        <p className="auth-card__intro">
          Enter the reset code from your inbox and choose a new password.
        </p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email address" htmlFor="reset-email" error={errors.email?.message}>
          <TextInput
            id="reset-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<Mail size={16} aria-hidden="true" />}
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field label="Reset code" htmlFor="reset-otp" error={errors.otp?.message}>
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <OtpInput value={field.value} onChange={field.onChange} disabled={loading} />
            )}
          />
        </Field>

        <div className="form-grid">
          <Field
            label="New password"
            htmlFor="reset-password"
            error={errors.password?.message}
            hint="At least 8 characters."
          >
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              placeholder="New password"
              invalid={Boolean(errors.password)}
              {...register('password')}
            />
          </Field>

          <Field
            label="Confirm"
            htmlFor="reset-confirm"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="reset-confirm"
              autoComplete="new-password"
              placeholder="Repeat new password"
              invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
          </Field>
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
          leadingIcon={<KeyRound size={16} aria-hidden="true" />}
          trailingIcon={<ArrowRight size={16} aria-hidden="true" />}
        >
          {loading ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>

      <p className="auth-card__foot">
        <Link to="/forgot-password" className="auth-back-link">
          <ArrowLeft size={14} aria-hidden="true" />
          Request another code
        </Link>
      </p>
    </AuthShell>
  );
}
