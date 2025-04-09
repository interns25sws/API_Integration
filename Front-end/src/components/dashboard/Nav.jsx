import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Bell, User } from "lucide-react";
import { FaUser, FaLock, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import ConnectAppModal from "../ConnectAppModal";



function Nav() {

  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apps, setApps] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSaveApp = (newApp) => {
    // Save app credentials (later, we will send this to the backend)
    setApps([...apps, newApp]);
    localStorage.setItem("apps", JSON.stringify([...apps, newApp]));
  };

  useEffect(() => {
    // Get user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
   
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get the first letter of the user's name (fallback to "?")
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : null;
  console.log("Rendering User Initial:", userInitial)

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    // Navigate to the login page
    navigate("/login");
    // Clear user state
    setUser(null);
  };

  return (
    <nav className="w-[95%] mx-auto mt-4 bg-white shadow-md rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between">
  {/* Left Section: Logo */}
  <div className="flex items-center gap-3">
    <img
      src="https://res.cloudinary.com/perfume/image/upload/v1741592046/star_cyprif.png"
      alt="Shopify Logo"
      className="w-20 h-20 object-contain"
    />
  </div>

  {/* Middle Section: Navigation Links */}
  <div className="flex flex-wrap items-center gap-4 bg-gray-100 px-4 py-2 rounded-xl">
    {[
      { to: "/dashboard", label: "Dashboard" },
      { to: "/products", label: "Products" },
      { to: "/orders", label: "Orders" },
      { to: "/customers", label: "Customers" },
      { to: "/create-discounts", label: "Discounts" },
    ].map(({ to, label }) => (
      <NavLink
        key={label}
        to={to}
        className={({ isActive }) =>
          [
            "text-sm font-medium px-3 py-2 rounded-md transition",
            isActive
              ? "bg-white text-black font-semibold shadow-sm"
              : "text-gray-600 hover:text-black",
          ].join(" ")
        }
      >
        {label}
      </NavLink>
    ))}

    {/* Show Users link only for certain roles */}
    {(user?.role === "super-admin" || user?.role === "admin") && (
      <NavLink
        to="/users"
        className={({ isActive }) =>
          [
            "text-sm font-medium px-3 py-2 rounded-md transition",
            isActive
              ? "bg-white text-black font-semibold shadow-sm"
              : "text-gray-600 hover:text-black",
          ].join(" ")
        }
      >
        Users
      </NavLink>
    )}

  
  </div>

  {/* Right Section: Icons and User Info */}
  <div className="flex items-center gap-4 relative">
    <Search className="w-5 h-5 text-gray-500 hover:text-black cursor-pointer" />
    <Bell className="w-5 h-5 text-gray-500 hover:text-black cursor-pointer" />

    <div
      className="w-9 h-9 flex items-center justify-center text-white font-bold bg-gray-700 hover:bg-black rounded-full cursor-pointer transition"
      onClick={toggleDropdown}
    >
      {userInitial || <FaUser className="text-gray-300" />}
    </div>

    {/* Role text */}
    {user?.role && (
      <span className="text-l text-gray-500">{user.role}</span>
    )}

    {/* Dropdown */}
    {isDropdownOpen && (
      <div
        ref={dropdownRef}
        className="absolute top-14 right-0 w-52 bg-white border rounded-lg shadow-lg z-50"
      >
        <ul className="py-2">
          <li className="px-4 py-2 text-gray-600 font-medium border-b">
            Welcome, {user?.name || "User"}
          </li>
          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            onClick={() => navigate("/profile")}
          >
            <FaUser className="text-gray-500" />
            Profile
          </li>
          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            onClick={() => navigate("/lockscreen")}
          >
            <FaLock className="text-gray-500" />
            Lock Screen
          </li>
          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            onClick={() => navigate("/faq")}
          >
            <FaQuestionCircle className="text-gray-500" />
            Help
          </li>
          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="text-gray-500" />
            Log Out
          </li>
        </ul>
      </div>
    )}

    {/* Modal for Connect App */}
    {showModal && <ConnectAppModal onClose={() => setShowModal(false)} onSave={handleSaveApp} />}
  </div>
</nav>

  );
}


export default Nav;  