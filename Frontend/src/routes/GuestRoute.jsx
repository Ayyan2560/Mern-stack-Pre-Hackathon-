import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import FullPageLoader from '../components/ui/FullPageLoader.jsx';

export default function GuestRoute() {
  const { user, token, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return <FullPageLoader label="Preparing your space" />;
  }

  if (user && token) {
    const destination = location.state?.from?.pathname || '/';
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
