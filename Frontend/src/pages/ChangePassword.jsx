import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { Field, PasswordInput } from '../components/ui/Field.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { logoutUser } from '../features/auth/authSlice.mjs';
import { changeMyPassword } from '../features/profile/profileSlice.mjs';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { changePasswordSchema } from '../schemas/index.js';

export default function ChangePassword() {
  useDocumentTitle('Change password');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const passwordStatus = useSelector((state) => state.profile.passwordStatus);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');

    try {
      const result = await dispatch(
        changeMyPassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      ).unwrap();

      toast.success(result.message || 'Password changed. Please sign in again.');
      await dispatch(logoutUser());
      navigate('/login', { replace: true });
    } catch (message) {
      setServerError(typeof message === 'string' ? message : 'Could not change your password.');
    }
  };

  const saving = passwordStatus === 'loading';

  return (
    <div className="settings-page">
      <Link to="/profile" className="back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to your profile
      </Link>

      <PageHeader
        eyebrow="Security"
        title={
          <>
            Change your <em>key.</em>
          </>
        }
        description="Choose a password that is long, memorable and unique to Aurel. You’ll be signed out after the change."
      />

      <div className="settings-layout">
        <form className="settings-card" onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className="settings-section">
            <div className="settings-section__head">
              <h2>Password</h2>
              <p>At least 8 characters. Longer is always better.</p>
            </div>

            <Field
              label="Current password"
              htmlFor="current-password"
              error={errors.currentPassword?.message}
            >
              <PasswordInput
                id="current-password"
                autoComplete="current-password"
                placeholder="Your current password"
                invalid={Boolean(errors.currentPassword)}
                {...register('currentPassword')}
              />
            </Field>

            <div className="form-grid">
              <Field
                label="New password"
                htmlFor="new-password"
                error={errors.newPassword?.message}
                hint="Use at least 8 characters."
              >
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  placeholder="New password"
                  invalid={Boolean(errors.newPassword)}
                  {...register('newPassword')}
                />
              </Field>

              <Field
                label="Confirm new password"
                htmlFor="confirm-new-password"
                error={errors.confirmPassword?.message}
              >
                <PasswordInput
                  id="confirm-new-password"
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

            <div className="settings-actions">
              <Link to="/profile" className="btn btn--ghost btn--md">
                Cancel
              </Link>
              <Button
                type="submit"
                loading={saving}
                leadingIcon={<KeyRound size={15} aria-hidden="true" />}
              >
                {saving ? 'Changing…' : 'Change password'}
              </Button>
            </div>
          </section>
        </form>

        <aside className="settings-aside">
          <div className="rail-card">
            <p className="eyebrow">Good practice</p>
            <ul className="security-list">
              <li>
                <LockKeyhole size={15} aria-hidden="true" />
                <span>Avoid reusing passwords from other sites.</span>
              </li>
              <li>
                <ShieldCheck size={15} aria-hidden="true" />
                <span>Use a password manager to keep it unique.</span>
              </li>
              <li>
                <KeyRound size={15} aria-hidden="true" />
                <span>You will be asked to sign in again after saving.</span>
              </li>
            </ul>
          </div>
          <div className="rail-card rail-card--quiet">
            <p>
              Forgotten your current password?{' '}
              <Link to="/forgot-password" className="text-link">
                Request a reset code
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
