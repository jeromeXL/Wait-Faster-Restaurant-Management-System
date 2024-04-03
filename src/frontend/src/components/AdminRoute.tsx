import { Navigate } from "react-router-dom";
import { UserRole, useAuth } from "../utils/user";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = useAuth()?.isRole(UserRole.USER_ADMIN) ?? false;

    return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
