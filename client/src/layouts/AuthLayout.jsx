import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-grayLight via-white to-white">
    <Outlet />
  </div>
);

export default AuthLayout;
