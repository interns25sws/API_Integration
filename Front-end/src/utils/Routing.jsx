import {  Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login";
import Registration from "../components/Registration";

const Routing = () => {
  return (
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Registration/>} />
      </Routes>
  );
};

export default Routing;
