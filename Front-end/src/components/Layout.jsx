import { Outlet } from "react-router-dom";
import Nav from "./dashboard/Nav";

const Layout = () => {
  return (
    <>
      <Nav />
      <Outlet />  {/* ✅ This will render Dashboard and other nested components */}
    </>
  );
};

export default Layout;
