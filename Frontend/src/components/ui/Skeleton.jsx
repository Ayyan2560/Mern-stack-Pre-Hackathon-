export function Skeleton({ className = '', width, height, radius }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function PostSkeleton() {
  return (
    <article className="post-card post-card--skeleton" aria-hidden="true">
      <div className="post-card__head">
        <Skeleton className="skeleton--avatar" />
        <div className="skeleton-stack">
          <Skeleton width="140px" height="13px" />
          <Skeleton width="90px" height="11px" />
        </div>
      </div>
      <Skeleton className="skeleton--title" />
      <Skeleton width="100%" height="12px" />
      <Skeleton width="94%" height="12px" />
      <Skeleton width="72%" height="12px" />
      <Skeleton className="skeleton--media" />
    </article>
  );
}

export function PostSkeletonList({ count = 3 }) {
  return (
    <div className="post-list" aria-label="Loading posts" role="status">
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}
