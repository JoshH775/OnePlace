import { useAuth } from '../components/AuthProvider'
import { Navigate } from 'react-router-dom';

type Props = {
    element: React.ReactNode;
}

const ProtectedRoute = ({ element }: Props) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null // or a loading spinner component
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;