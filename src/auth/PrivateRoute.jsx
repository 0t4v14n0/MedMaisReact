import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, roles } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!roles.some(role => allowedRoles.includes(role))) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;