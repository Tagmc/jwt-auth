import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "~/pages/Login";
import Dashboard from "~/pages/Dashboard";

/**
 * Giải pháp clean code trong việc xác định các route nào cần đăng nhập tài khoản xong thì mới cho truy cập
 * Sử dụng Outlet của react-router-dom để hiển thị các Child Route
 * @returns
 */

const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  if (!user) return <Navigate to={"/"} replace={true} />;
  return <Outlet />;
};

const UnAuthorizedRoutes = () => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  if (user) return <Navigate to={"/dashboard"} replace={true} />;
  return <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace={true} />} />

      <Route element={<UnAuthorizedRoutes />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
