import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { authTokens } = useContext(AuthContext);

    // If no access token exists, redirect to the login page
    if (!authTokens) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, render the requested component
    return children;
};

export default ProtectedRoute;