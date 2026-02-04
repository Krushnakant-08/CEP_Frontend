import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if no token exists
    if(window.location.pathname === '/xerox-dashboard') {
      return <Navigate to="/xerox-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
