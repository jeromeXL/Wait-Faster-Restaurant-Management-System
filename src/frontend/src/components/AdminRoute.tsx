import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../utils/api';

const useAuth = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  try {
    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
    return decodedToken.subject.role === 1;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuth();

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;