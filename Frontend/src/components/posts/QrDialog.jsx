import { Copy, Download, Info } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import postsService from '../../services/posts.service.mjs';
import { getErrorMessage, isCanceled } from '../../utils/errors.js';
import { copyToClipboard } from '../../utils/share.js';
import Button from '../ui/Button.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import LoadingRow from '../ui/LoadingRow.jsx';
import Modal from '../ui/Modal.jsx';

/**
 * The body is mounted only while the dialog is open, so closing the dialog
 * discards the previous request instead of resetting state from an effect.
 */
function QrBody({ postId }) {
  const [state, setState] = useState({
    status: 'loading',
    data: null,
    error: null,
  });

  const request = useCallback(
    (signal) => {
      postsService
        .getPostQr(postId, { signal })
        .then((data) => {
          setState({ status: 'succeeded', data, error: null });
        })
        .catch((error) => {
          if (isCanceled(error)) return;
          setState({
            status: 'failed',
            data: null,
            error: getErrorMessage(error, 'Could not generate a QR code.'),
          });
        });
    },
    [postId]
  );

  useEffect(() => {
    const controller = new AbortController();
    request(controller.signal);
    return () => controller.abort();
  }, [request]);

  const handleRetry = () => {
    setState({ status: 'loading', data: null, error: null });
    request();
  };

  const handleCopy = async () => {
    if (!state.data?.postURL) return;
    const copied = await copyToClipboard(state.data.postURL);
    if (copied) toast.success('QR link copied.');
    else toast.error('Could not copy the link.');
  };

  const handleDownload = () => {
    if (!state.data?.qrCode) return;
    const link = document.createElement('a');
    link.href = state.data.qrCode;
    link.download = `aurel-post-${postId}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (state.status === 'loading') {
    return <LoadingRow label="Generating QR code" />;
  }

  if (state.status === 'failed') {
    return (
      <ErrorState
        compact
        title="QR code unavailable"
        message={state.error}
        onRetry={handleRetry}
      />
    );
  }

  if (!state.data) return null;

  return (
    <div className="qr">
      <div className="qr__frame">
        <img src={state.data.qrCode} alt="QR code for this post" />
      </div>

      <p className="qr__url" title={state.data.postURL}>
        {state.data.postURL}
      </p>

      <div className="qr__actions">
        <Button
          size="sm"
          variant="outline"
          leadingIcon={<Copy size={14} aria-hidden="true" />}
          onClick={handleCopy}
        >
          Copy link
        </Button>
        <Button
          size="sm"
          variant="primary"
          leadingIcon={<Download size={14} aria-hidden="true" />}
          onClick={handleDownload}
        >
          Download
        </Button>
      </div>

      <p className="qr__note">
        <Info size={14} aria-hidden="true" />
        <span>
          The backend encodes this link. It points to the API until
          <code> FRONTEND_URL </code>
          is configured on the server.
        </span>
      </p>
    </div>
  );
}

export default function QrDialog({ open, onClose, postId, postTitle }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Portable edition"
      title="Post QR code"
      description={postTitle ? `Scan to open “${postTitle}”.` : 'Scan to open this post.'}
      size="sm"
    >
      <QrBody postId={postId} />
    </Modal>
  );
}
