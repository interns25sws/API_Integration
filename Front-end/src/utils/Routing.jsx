import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login";
import Registration from "../components/Registration";
import Dashboard from "../components/dashboard/Dashboard";
import Products from "../components/Products"; // ✅ Import Products Component
import Layout from "../components/Layout"; // ✅ Import Layout
import Orders from "../components/Orders";
import Customers from "../components/Customers";
import CreateOrder from "../components/CreateOrder";

const Routing = () => {
  return (
    <Routes>
      {/* ✅ Public Routes (No Navbar) */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />

      {/* ✅ Protected Routes (With Navbar) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />  {/* ✅ Updated */}
        <Route path="/orders" element={<Orders/>} />
        <Route path="/create-order" element={<CreateOrder/>} />
        <Route path="/customers" element={<Customers/>} />
      </Route>
    </Routes>
  );
};

export default Routing;
