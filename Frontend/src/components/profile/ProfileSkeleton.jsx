import { Skeleton } from '../ui/Skeleton.jsx';

export default function ProfileSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="skeleton--cover" />
      <div className="profile-head profile-head--skeleton">
        <Skeleton className="skeleton--avatar-xl" />
        <div className="skeleton-stack">
          <Skeleton width="220px" height="28px" />
          <Skeleton width="160px" height="13px" />
          <Skeleton width="280px" height="12px" />
        </div>
      </div>
    </div>
  );
}
