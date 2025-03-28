import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const CustomerSection = ({
  searchTerm,
  setSearchTerm,
  showDropdown,
  setShowDropdown,
  handleSelectCustomer,
  selectedCustomer,
  isLocked,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [customers, setCustomers] = useState([]); // Store all customers
  const [filteredCustomers, setFilteredCustomers] = useState([]); // Store filtered results
  const [loading, setLoading] = useState(false);

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

  // ✅ Fetch all customers from Shopify on mount (only once)
  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No Token Found in Local Storage!");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/customers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const customerList = response.data.customers || [];
        setCustomers(customerList);
        setFilteredCustomers(customerList); // Show all customers initially
      } catch (error) {
        console.error(
          "❌ Error fetching customers:",
          error.response?.data || error.message
        );
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCustomers();
  }, []);

  // ✅ Filter customers on typing (without API calls)
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers(customers); // Show all customers when empty
    } else {
      const filtered = customers.filter((customer) =>
        `${customer.firstName} ${customer.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  // ✅ Auto-Select Customer if URL has `customerId`
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const customerId = params.get("customerId");

    if (customerId) {
      fetchCustomerById(customerId);
    }
  }, [location.search]);

  const fetchCustomerById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/customers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        handleSelectCustomer(response.data);
        setSearchTerm(`${response.data.firstName} ${response.data.lastName}`);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };
  useEffect(() => {
    console.log("Selected Customer in CreateOrder (before passing to CustomerSection):", selectedCustomer);
  }, [selectedCustomer]);
  
  useEffect(() => {
    console.log("Selected Customer in CustomerSection (received):", selectedCustomer);
  }, [selectedCustomer]);
  
  return (
    <div className="relative bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Customers</h3>

      <div className="relative">
        <input
          type="text"
          placeholder="Search or select a customer"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            setShowDropdown(true); // Show dropdown when clicking input
            setFilteredCustomers(customers); // Reset to full list
          }}
          disabled={isLocked}
          className={`w-full px-3 py-2 border rounded-md ${
            isLocked ? "bg-gray-200 cursor-not-allowed" : ""
          }`}
        />

        {loading && (
          <div className="absolute top-2 right-3 text-gray-500 animate-spin">
            ⏳
          </div>
        )}
      </div>

      {!isLocked && showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute w-full bg-white shadow-lg p-2 rounded-md mt-1 border max-h-40 overflow-y-auto"
        >
          <div
            onClick={() => navigate("/add-customer?redirectTo=create-order")}
            className="p-2 hover:bg-blue-100 cursor-pointer text-blue-600 font-medium"
          >
            ➕ Create a new customer
          </div>

          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
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
