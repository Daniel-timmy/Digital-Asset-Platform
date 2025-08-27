import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../utils/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER } from "../../src/utils/constants";
import { useEffect, useState } from "react";

const ProtectedAdminRoutes = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      const res = await api.post("/auth/refresh", {
        refresh: refreshToken,
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      // console.log(error);
      setIsAuthorized(false);
    }
  };

  //   const isAdmin = async () =>

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      return <Navigate to="/login" />;
      // await refreshToken();
    }
    const user = JSON.parse(localStorage.getItem(USER));
    if (!user) {
      return <Navigate to="/login" />;
    }
    if (user.role !== "admin") {
      return <Navigate to="/login" />;
    }
    setIsAuthorized(true);
  };

  if (isAuthorized === null) {
    return <div>...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

export default ProtectedAdminRoutes;
