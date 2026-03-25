import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const accessToken = useAppStore((s) => s.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
