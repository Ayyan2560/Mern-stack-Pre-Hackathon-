import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Mail, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import AvatarEditor from '../components/profile/AvatarEditor.jsx';
import Button from '../components/ui/Button.jsx';
import { Field, TextInput } from '../components/ui/Field.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { setUser } from '../features/auth/authSlice.mjs';
import {
  fetchMyProfile,
  updateMyProfile,
} from '../features/profile/profileSlice.mjs';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { profileSchema } from '../schemas/index.js';

export default function EditProfile() {
  useDocumentTitle('Edit profile');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.profile);
  const [serverError, setServerError] = useState('');
  const requested = useRef(false);

  const me = { ...authUser, ...(profile.me || {}) };

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: me.name || '' },
  });

  useEffect(() => {
    if (profile.me || requested.current) return;
    requested.current = true;
    dispatch(fetchMyProfile());
  }, [dispatch, profile.me]);

  useEffect(() => {
    if (me.name) reset({ name: me.name });
    // Only reset when the canonical name changes, not on every keystroke.
  }, [me.name, reset]);

  const onSubmit = async (values) => {
    setServerError('');

    try {
      const result = await dispatch(updateMyProfile({ name: values.name.trim() })).unwrap();
      dispatch(setUser({ ...authUser, ...result.user }));
      toast.success(result.message || 'Profile updated.');
      navigate('/profile');
    } catch (message) {
      setServerError(typeof message === 'string' ? message : 'Could not save your profile.');
    }
  };

  const saving = profile.saveStatus === 'loading';

  return (
    <div className="settings-page">
      <Link to="/profile" className="back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to your profile
      </Link>

      <PageHeader
        eyebrow="Account"
        title={
          <>
            Edit your <em>profile.</em>
          </>
        }
        description="Your name and portrait are how you appear across the journal."
      />

      <div className="settings-layout">
        <form className="settings-card" onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className="settings-section">
            <div className="settings-section__head">
              <h2>Portrait</h2>
              <p>A clear, well-lit photo works best.</p>
            </div>
            <AvatarEditor size="xl" />
          </section>

          <div className="settings-divider" />

          <section className="settings-section">
            <div className="settings-section__head">
              <h2>Details</h2>
              <p>This is the name other members will see.</p>
            </div>

            <Field label="Full name" htmlFor="profile-name" error={errors.name?.message}>
              <TextInput
                id="profile-name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                icon={<UserRound size={16} aria-hidden="true" />}
                invalid={Boolean(errors.name)}
                {...register('name')}
              />
            </Field>

            <Field
              label="Email address"
              htmlFor="profile-email"
              hint="Email changes are not supported by the current API."
            >
              <div className="input-shell input-shell--readonly">
                <span className="input-shell__icon">
                  <Mail size={16} aria-hidden="true" />
                </span>
                <input
                  id="profile-email"
                  className="input-shell__input"
                  type="email"
                  value={me.email || ''}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </Field>

            {serverError || (profile.saveStatus === 'failed' && profile.saveError) ? (
              <p className="form-alert" role="alert">
                {serverError || profile.saveError}
              </p>
            ) : null}

            <div className="settings-actions">
              <Link to="/profile" className="btn btn--ghost btn--md">
                Cancel
              </Link>
              <Button
                type="submit"
                loading={saving}
                disabled={!isDirty && getValues('name') === me.name}
                leadingIcon={<Check size={15} aria-hidden="true" />}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </section>
        </form>

        <aside className="settings-aside">
          <div className="rail-card">
            <p className="eyebrow">A small reminder</p>
            <p className="rail-card__copy">
              Your portrait is uploaded to the backend’s Cloudinary storage. Replacing it removes
              the previous image from the server.
            </p>
          </div>
          <div className="rail-card rail-card--quiet">
            <p>
              Looking to change your password instead?{' '}
              <Link to="/profile/change-password" className="text-link">
                Open security settings
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
