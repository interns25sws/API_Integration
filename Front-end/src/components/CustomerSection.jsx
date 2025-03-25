import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import axios from "axios";

const CustomerSection = ({
  searchTerm,
  setSearchTerm,
  showDropdown,
  setShowDropdown,
  handleSelectCustomer,
  selectedCustomer,
  isLocked, // Lock customer selection
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const lastQueryRef = useRef(""); // Store last searched term to prevent redundant API calls

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  

  // ✅ Fetch customers from Shopify when searchTerm changes (debounced)
  useEffect(() => {
    const trimmedSearch = (searchTerm || "").trim(); // ✅ Prevents undefined error
  
    if (!trimmedSearch || trimmedSearch.length < 2) {
      setCustomers([]);
      return;
    }
  
    // Prevent fetching the same query multiple times
    if (lastQueryRef.current === trimmedSearch) return;
    lastQueryRef.current = trimmedSearch;
  
    setLoading(true);
  
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/customers`
        );
        
        setCustomers(response.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);
   // ✅ Check if there's a new customer in the URL
   useEffect(() => {
    const params = new URLSearchParams(location.search);
    const customerId = params.get("customerId");

    if (customerId) {
      fetchCustomerById(customerId);
    }
  }, [location.search]);

  const fetchCustomerById = async (id) => {
    try {
      const response = await axios.get(`/api/customers/${id}`);
      if (response.status === 200) {
        handleSelectCustomer(response.data);
        setSearchTerm(`${response.data.firstName} ${response.data.lastName}`);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  

  return (
    <div className="relative bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Customers</h3>

      {/* 🔹 Disable search if customer is locked */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search or create a customer"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            if (typeof setSearchTerm === "function") {
              setSearchTerm(value);
            } else {
              console.error("setSearchTerm is not a function", setSearchTerm);
            }
          }}
          onFocus={() => setShowDropdown(true)}
          disabled={isLocked}
          className={`w-full px-3 py-2 border rounded-md ${
            isLocked ? "bg-gray-200 cursor-not-allowed" : ""
          }`}
        />
        
        {/* ✅ Show a loading spinner inside the input field when fetching customers */}
        {loading && (
          <div className="absolute top-2 right-3 text-gray-500 animate-spin">
            ⏳
          </div>
        )}
      </div>

      {/* 🔹 Show dropdown only if customer is NOT locked */}
      {!isLocked && showDropdown && (
        <div ref={dropdownRef} className="absolute w-full bg-white shadow-lg p-2 rounded-md mt-1 border">
          {/* ✅ Navigate to Add Customer page */}
          <div
  onClick={() => navigate("/add-customer?redirectTo=create-order")}
  className="p-2 hover:bg-blue-100 cursor-pointer text-blue-600 font-medium"
>
  ➕ Create a new customer
</div>


          {/* Show loading state */}
          {loading ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : customers.length > 0 ? (
            customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => {
                  handleSelectCustomer(customer);
                  setSearchTerm(`${customer.firstName} ${customer.lastName}`);
                  setShowDropdown(false);
                }}
                className="p-2 hover:bg-gray-200 cursor-pointer"
              >
                {customer.firstName} {customer.lastName} ({customer.email})
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No customers found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSection;
