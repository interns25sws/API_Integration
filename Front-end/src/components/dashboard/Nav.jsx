import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Bell, User } from "lucide-react";
import { FaUser, FaLock, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";


function Nav() {

  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    <nav className="w-[95%] mx-auto mt-4 bg-white shadow-md rounded-2xl px-6 py-4 flex items-center justify-between">
      {/* Left Section: Logo */}
      <div className="flex items-center gap-2">
        <img src="data:image/png;base64,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" alt="Shopify Logo" className="w-8 h-8" />
        <span className="text-lg font-semibold">Shopify</span>
      </div>

      {/* Middle Section: Nav Links */}
      <div className="flex gap-8 bg-gray-100 px-4 py-2 rounded-xl">
      <NavLink
           to="/dashboard"
           className={({ isActive }) =>
                  [
                   "font-medium px-3 py-1 rounded-lg transition",
                    isActive ? "text-black font-bold" : "text-gray-600 hover:text-black",
                  ].join(" ")
                    }
                    >
                    Dashboard
        </NavLink>
        <NavLink
           to="/products"
           className={({ isActive }) =>
                  [
                   "font-medium px-3 py-1 rounded-lg transition",
                    isActive ? "text-black font-bold" : "text-gray-600 hover:text-black",
                  ].join(" ")
                    }
                    >
                    Products
        </NavLink>
        <NavLink
           to="/orders"
           className={({ isActive }) =>
                  [
                   "font-medium px-3 py-1 rounded-lg transition",
                    isActive ? "text-black font-bold" : "text-gray-600 hover:text-black",
                  ].join(" ")
                    }
                    >
                    Orders
        </NavLink>
        <NavLink
           to="/customers"
           className={({ isActive }) =>
                  [
                   "font-medium px-3 py-1 rounded-lg transition",
                    isActive ? "text-black font-bold" : "text-gray-600 hover:text-black",
                  ].join(" ")
                    }
                    >
                    Customers
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
               [
                 "font-medium px-3 py-1 rounded-lg transition",
                  isActive ? "text-black font-bold" : "text-gray-600 hover:text-black",
               ].join(" ")
                 }
                 >
               {user?.role === "super-admin" && "Users"}
        </NavLink>


      </div>

      {/* Right Section: Icons */}
      <div className="flex items-center gap-4 relative">
        <Search className="w-6 h-6 text-gray-500 cursor-pointer hover:text-black" />
        <Bell className="w-6 h-6 text-gray-500 cursor-pointer hover:text-black" />
        <div
          className="w-9 h-9 flex items-center justify-center text-black font-bold bg-white rounded-full cursor-pointer"
          onClick={toggleDropdown}
        >
          {userInitial ? userInitial : <FaUser className="w-6 h-6 text-gray-500 cursor-pointer hover:text-black" />}
          </div>
        {isDropdownOpen && (
          <div ref={dropdownRef} className="absolute right-0 mt-20 w-48 bg-white border rounded-lg shadow-lg">
            <ul className="py-1">
              <li className="px-4 py-2 text-gray-700 pointer-events-none">
                Welcome, {user?.fullName}
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
      </div>
    </nav>
  );
}


export default Nav;  