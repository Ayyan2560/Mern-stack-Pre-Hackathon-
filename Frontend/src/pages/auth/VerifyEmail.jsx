import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/layout/AuthShell.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, TextInput } from '../../components/ui/Field.jsx';
import OtpInput from '../../components/ui/OtpInput.jsx';
import { bootstrapAuth, verifyEmailOtp } from '../../features/auth/authSlice.mjs';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { verifyEmailSchema } from '../../schemas/index.js';

export default function VerifyEmail() {
  useDocumentTitle('Verify email');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailFromState = location.state?.email || user?.email || '';
  const justSignedUp = Boolean(location.state?.justSignedUp);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: emailFromState, otp: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    setLoading(true);

    try {
      const result = await dispatch(
        verifyEmailOtp({ email: values.email.trim(), otp: values.otp })
      ).unwrap();

      toast.success(result.message || 'Email verified.');

      if (user) {
        await dispatch(bootstrapAuth());
        navigate('/', { replace: true });
      } else {
        navigate('/login', {
          replace: true,
          state: { email: values.email.trim(), verified: true },
        });
      }
    } catch (message) {
      setServerError(typeof message === 'string' ? message : 'Could not verify the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <header className="auth-card__head">
        <p className="eyebrow">Email verification</p>
        <h1>
          One last <em>detail.</em>
        </h1>
        <p className="auth-card__intro">
          {justSignedUp
            ? 'Your account is created. Enter the 6-digit code we just sent to your inbox.'
            : 'Enter the 6-digit code sent to your email to complete verification.'}
        </p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          label="Email address"
          htmlFor="verify-email"
          error={errors.email?.message}
          hint="You can verify any Aurel account from here."
        >
          <TextInput
            id="verify-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<Mail size={16} aria-hidden="true" />}
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field label="Six-digit code" htmlFor="verify-otp" error={errors.otp?.message}>
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <OtpInput value={field.value} onChange={field.onChange} disabled={loading} />
            )}
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
          {loading ? 'Verifying…' : 'Verify email'}
        </Button>
      </form>

      <div className="auth-note">
        <ShieldCheck size={17} aria-hidden="true" />
        <p>
          Codes expire after 10 minutes. This backend does not expose a resend endpoint, so if
          your code has expired you can sign in and verify later from your account banner.
        </p>
      </div>

      <p className="auth-card__foot">
        {user ? (
          <Link to="/">Return to the journal</Link>
        ) : (
          <>
            Already verified? <Link to="/login">Sign in</Link>
          </>
        )}
      </p>
    </AuthShell>
  );
}
