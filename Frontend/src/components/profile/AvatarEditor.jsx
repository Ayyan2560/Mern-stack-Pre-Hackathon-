import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../features/auth/authSlice.mjs';
import {
  removeMyAvatar,
  uploadMyAvatar,
} from '../../features/profile/profileSlice.mjs';
import { MAX_IMAGE_BYTES } from '../../utils/constants.js';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';

export default function AvatarEditor({ size = 'xl', compact = false }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const status = useSelector((state) => state.profile.avatarStatus);
  const fileInputRef = useRef(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const uploading = status === 'loading';
  const hasPhoto = Boolean(user?.profilePicture?.url);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file.');
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('That image is larger than 5 MB.');
      return;
    }

    try {
      const result = await dispatch(uploadMyAvatar(file)).unwrap();
      dispatch(
        setUser({
          ...user,
          profilePicture: result.profilePicture,
        })
      );
      toast.success('Profile photo updated.');
    } catch (message) {
      toast.error(typeof message === 'string' ? message : 'Could not upload that photo.');
    }
  };

  const handleRemove = async () => {
    try {
      await dispatch(removeMyAvatar()).unwrap();
      dispatch(
        setUser({
          ...user,
          profilePicture: { url: '', publicId: '' },
        })
      );
      setConfirmRemove(false);
      toast.success('Profile photo removed.');
    } catch (message) {
      toast.error(typeof message === 'string' ? message : 'Could not remove that photo.');
    }
  };

  return (
    <div className={`avatar-editor ${compact ? 'avatar-editor--compact' : ''}`.trim()}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Choose a profile photo"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      <div className={`avatar-editor__frame ${uploading ? 'is-uploading' : ''}`.trim()}>
        <Avatar user={user} size={size} ring />

        {uploading ? (
          <span className="avatar-editor__loading" role="status" aria-label="Uploading photo">
            <Loader2 className="spin" size={22} />
          </span>
        ) : null}

        {compact ? (
          <>
            <button
              type="button"
              className="avatar-editor__overlay avatar-editor__overlay--edit"
              disabled={uploading}
              aria-label={hasPhoto ? 'Change profile photo' : 'Add profile photo'}
              title={hasPhoto ? 'Change photo' : 'Add photo'}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={15} aria-hidden="true" />
            </button>

            {hasPhoto ? (
              <button
                type="button"
                className="avatar-editor__overlay avatar-editor__overlay--remove"
                disabled={uploading}
                aria-label="Remove profile photo"
                title="Remove photo"
                onClick={() => setConfirmRemove(true)}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      {!compact ? (
        <>
          <div className="avatar-editor__actions">
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              leadingIcon={<Camera size={14} aria-hidden="true" />}
              onClick={() => fileInputRef.current?.click()}
            >
              {hasPhoto ? 'Change photo' : 'Add photo'}
            </Button>

            {hasPhoto ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={uploading}
                leadingIcon={<Trash2 size={14} aria-hidden="true" />}
                onClick={() => setConfirmRemove(true)}
              >
                Remove
              </Button>
            ) : null}
          </div>

          <p className="avatar-editor__hint">JPG, PNG or WebP · 5 MB maximum</p>
        </>
      ) : null}

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleRemove}
        loading={uploading}
        title="Remove your profile photo?"
        description="Your initials will be shown instead. You can upload a new photo at any time."
        confirmLabel="Remove photo"
      />
    </div>
  );
}
