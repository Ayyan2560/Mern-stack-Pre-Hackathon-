import { Bell, CheckCheck, Heart, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../features/notifications/notificationsSlice.mjs';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { displayName, formatFullDate, timeAgo } from '../utils/format.js';

function NotificationSkeleton() {
  return (
    <div className="notification notification--skeleton" aria-hidden="true">
      <Skeleton className="skeleton--avatar" />
      <div className="skeleton-stack">
        <Skeleton width="70%" height="12px" />
        <Skeleton width="45%" height="11px" />
      </div>
    </div>
  );
}

export default function Notifications() {
  useDocumentTitle('Notifications');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, error, unreadCount, markingAll } = useSelector(
    (state) => state.notifications
  );
  const [openingId, setOpeningId] = useState(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  };

  const handleOpen = async (notification) => {
    if (openingId) return;
    setOpeningId(notification._id);

    try {
      await dispatch(markNotificationRead(notification)).unwrap();
    } catch (message) {
      toast.error(
        typeof message === 'string' ? message : 'Could not mark this notification as read.'
      );
    } finally {
      setOpeningId(null);
    }

    if (notification.post?._id) {
      navigate(`/posts/${notification.post._id}`);
    }
  };

  const handleMarkAll = async () => {
    try {
      const result = await dispatch(markAllNotificationsRead()).unwrap();
      toast.success(result.message || 'All notifications marked as read.');
    } catch (message) {
      toast.error(typeof message === 'string' ? message : 'Could not mark notifications as read.');
    }
  };

  return (
    <div className="page-narrow">
      <PageHeader
        eyebrow="Activity"
        title={
          <>
            Quiet <em>notices.</em>
          </>
        }
        description={
          unreadCount > 0
            ? `${unreadCount} unread ${unreadCount === 1 ? 'notice' : 'notices'} from your atelier.`
            : 'Likes and comments on your stories will appear here.'
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            loading={markingAll}
            disabled={unreadCount === 0}
            leadingIcon={<CheckCheck size={15} aria-hidden="true" />}
          >
            Mark all read
          </Button>
        }
      />

      {status === 'loading' && !items.length ? (
        <div className="notifications" aria-label="Loading notifications" role="status">
          {Array.from({ length: 4 }, (_, index) => (
            <NotificationSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {status === 'failed' && !items.length ? (
        <ErrorState
          title="Could not load your notices"
          message={error}
          onRetry={refresh}
        />
      ) : null}

      {status === 'succeeded' && !items.length ? (
        <EmptyState
          icon={Bell}
          title="All quiet for now"
          description="When someone likes or comments on your work, you’ll find it here."
        />
      ) : null}

      {items.length ? (
        <>
          <div className="notifications__summary">
            <span>{items.length} recent</span>
            {unreadCount > 0 ? <span className="notifications__unread-pill">{unreadCount} unread</span> : null}
          </div>

          <ul className="notifications">
            {items.map((notification) => {
              const senderName = displayName(notification.sender);
              const Icon = notification.type === 'comment' ? MessageCircle : Heart;
              const isOpening = openingId === notification._id;
              const postTitle = notification.post?.title;

              return (
                <li key={notification._id}>
                  <button
                    type="button"
                    className={`notification ${notification.isRead ? '' : 'is-unread'} ${
                      isOpening ? 'is-opening' : ''
                    }`.trim()}
                    onClick={() => handleOpen(notification)}
                    aria-label={`${senderName} ${notification.message}${
                      postTitle ? `: ${postTitle}` : ''
                    }`}
                  >
                    <span className="notification__avatar">
                      <Avatar user={notification.sender} size="md" />
                      <span className={`notification__type notification__type--${notification.type}`}>
                        <Icon size={11} fill={notification.type === 'like' ? 'currentColor' : 'none'} />
                      </span>
                    </span>

                    <span className="notification__copy">
                      <span className="notification__line">
                        <strong>{senderName}</strong>{' '}
                        <span>{notification.message}</span>
                      </span>
                      {postTitle ? (
                        <span className="notification__post">“{postTitle}”</span>
                      ) : (
                        <span className="notification__post notification__post--muted">
                          The post is no longer available.
                        </span>
                      )}
                      <span className="notification__time" title={formatFullDate(notification.createdAt)}>
                        {timeAgo(notification.createdAt)}
                      </span>
                    </span>

                    {!notification.isRead ? (
                      <span className="notification__dot" aria-label="Unread" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}
