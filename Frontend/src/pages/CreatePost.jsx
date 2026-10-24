import { ArrowLeft, Image, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostComposer from '../components/posts/PostComposer.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { MAX_GALLERY_IMAGES } from '../utils/constants.js';

export default function CreatePost() {
  useDocumentTitle('Compose');

  return (
    <div className="compose-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to the journal
      </Link>

      <PageHeader
        eyebrow="Compose"
        title={
          <>
            A new <em>entry.</em>
          </>
        }
        description="Write something worth keeping. Add a title, a story and up to five images."
      />

      <div className="compose-layout">
        <div className="compose-card">
          <PostComposer />
        </div>

        <aside className="compose-aside" aria-label="Publishing notes">
          <div className="rail-card">
            <p className="eyebrow">Before you publish</p>
            <ul className="compose-notes">
              <li>
                <span>01</span>
                <p>Keep the title under 200 characters — a line, not a paragraph.</p>
              </li>
              <li>
                <span>02</span>
                <p>Up to {MAX_GALLERY_IMAGES} images, 5 MB each. JPG, PNG or WebP.</p>
              </li>
              <li>
                <span>03</span>
                <p>Text can be edited later; images cannot be changed after publishing.</p>
              </li>
            </ul>
          </div>

          <div className="rail-card rail-card--quiet">
            <ShieldCheck size={19} aria-hidden="true" />
            <p>
              Your post is public to signed-in members of Aurel. Only you can edit or delete
              it.
            </p>
          </div>

          <div className="rail-card rail-card--quiet">
            <Image size={19} aria-hidden="true" />
            <p>
              Images are uploaded to the backend’s Cloudinary account. The first image becomes
              the cover of your entry.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
