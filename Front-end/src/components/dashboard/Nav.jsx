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
        <img src="https://res.cloudinary.com/perfume/image/upload/v1741592046/star_cyprif.png" alt="Shopify Logo" className="w-15 h-15" />
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