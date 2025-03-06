import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login";
import Registration from "../components/Registration";
import Dashboard from "../components/dashboard/Dashboard";
import Products from "../components/Products"; // ✅ Import Products Component
import Layout from "../components/Layout"; // ✅ Import Layout
import Orders from "../components/Orders";
import Customers from "../components/Customers";
import CreateOrder from "../components/CreateOrder";
import AddCustomer from "../components/AddCustomer";
import CustomerDetails from "../components/CustomerDetails";
import AddProduct from "../components/AddProducts";


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
        <Route path="add-products" element={<AddProduct />} />
        <Route path="/orders" element={<Orders/>} />
        <Route path="/create-order" element={<CreateOrder/>} />
        <Route path="/customers" element={<Customers/>} />
        <Route path="/add-customer" element={<AddCustomer />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
      </Route>
    </Routes>
  );
};

export default Routing;
