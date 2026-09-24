import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from './PageLoader';

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <PageLoader />;
  if (status !== 'authenticated') {
    const cb = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/authentication?callbackUrl=${cb}`} replace />;
  }
  return children;
}
