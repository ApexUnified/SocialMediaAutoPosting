import { Outlet } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useEffect } from "react";

const AuthLayout = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = "/posts";
    }
  }, [loading, user]);

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-grayLight via-white to-white">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
