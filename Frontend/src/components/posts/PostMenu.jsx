import { Copy, FileText, MoreHorizontal, Pencil, QrCode, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { deletePost } from '../../features/posts/postsSlice.mjs';
import { userIdOf } from '../../utils/format.js';
import { copyToClipboard, postUrl } from '../../utils/share.js';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import IconButton from '../ui/IconButton.jsx';

export default function PostMenu({ post, onDeleted, onOpenQr, detailed = false }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = userIdOf(post.user) && userIdOf(post.user) === userIdOf(user);

  const handleCopy = async () => {
    const copied = await copyToClipboard(postUrl(post._id));
    if (copied) toast.success('Post link copied.');
    else toast.error('Could not copy the link.');
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);

    try {
      const result = await dispatch(deletePost(post._id)).unwrap();
      setConfirmOpen(false);
      toast.success(result.message || 'Post deleted.');
      if (onDeleted) onDeleted();
      else navigate('/');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Could not delete this post.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dropdown
        renderTrigger={({ open, toggle, menuId }) => (
          <IconButton
            label="Post options"
            className="post-menu__trigger"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={toggle}
          >
            <MoreHorizontal size={19} />
          </IconButton>
        )}
      >
        {(close) => (
          <>
            <button
              type="button"
              className="dropdown__item"
              role="menuitem"
              onClick={() => {
                close();
                handleCopy();
              }}
            >
              <Copy size={16} aria-hidden="true" />
              <span>Copy link</span>
            </button>

            {!detailed ? (
              <Link
                to={`/posts/${post._id}`}
                className="dropdown__item"
                role="menuitem"
                onClick={close}
              >
                <FileText size={16} aria-hidden="true" />
                <span>Open post</span>
              </Link>
            ) : onOpenQr ? (
              <button
                type="button"
                className="dropdown__item"
                role="menuitem"
                onClick={() => {
                  close();
                  onOpenQr();
                }}
              >
                <QrCode size={16} aria-hidden="true" />
                <span>View QR code</span>
              </button>
            ) : null}

            {isOwner ? (
              <>
                <div className="dropdown__divider" role="separator" />
                <Link
                  to={`/posts/${post._id}/edit`}
                  className="dropdown__item"
                  role="menuitem"
                  onClick={close}
                >
                  <Pencil size={16} aria-hidden="true" />
                  <span>Edit post</span>
                </Link>
                <button
                  type="button"
                  className="dropdown__item dropdown__item--danger"
                  role="menuitem"
                  onClick={() => {
                    close();
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  <span>Delete post</span>
                </button>
              </>
            ) : null}
          </>
        )}
      </Dropdown>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this post?"
        description="The post and its images will be permanently removed. This cannot be undone."
        confirmLabel="Delete post"
      />
    </>
  );
}
