import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Customers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page")) || 1;
  const currentCursor = queryParams.get("cursor") || null;

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const limit = 10; // Set page size


  useEffect(() => {
    fetchCustomers(currentCursor);
  }, [currentCursor]);

  // Fetch customers from MongoDB
  const fetchCustomers = async (cursor = null) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customers?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`
      );
  
      setCustomers(response.data.customers);
      setHasNextPage(response.data.hasNextPage);
      setNextCursor(response.data.nextCursor);
      if (cursor) {
        setCursorHistory((prev) => [...prev, cursor]);
      }
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
    }
  };
  const goToPage = (page, cursor = null) => {
    navigate(`?page=${page}${cursor ? `&cursor=${cursor}` : ""}`);
  };
  
  // Extracts numeric ID from Shopify's GID format
  const extractShopifyId = (shopifyId) => shopifyId.replace("gid://shopify/Customer/", "");

  // Handles customer deletion from both Shopify & MongoDB
  const handleDelete = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      const shopifyCustomerId = extractShopifyId(customerId);
      const response = await axios.delete(`http://localhost:5000/api/customers/${shopifyCustomerId}`);

      if (response.data.success) {
        setCustomers(customers.filter(customer => extractShopifyId(customer.shopifyId) !== shopifyCustomerId));
        alert("✅ Customer deleted successfully!");
      } else {
        alert(response.data.error || "Failed to delete customer.");
      }
    } catch (error) {
      console.error("❌ Error deleting customer:", error);
      alert("Failed to delete customer. Try again later.");
    }
  };

  // Open modal for viewing or editing
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setIsEditing(false);
  };

  const handleEdit = (customer) => {
    const [city, country] = customer.location?.split(", ") || ["", ""];
  
    setSelectedCustomer(customer);
    setFormData({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      city: city.trim(), // ✅ Ensure default value
      country: country.trim(), // ✅ Ensure default value
      orders: customer.orders || 0,
      amountSpent: customer.amountSpent || 0,
      tags: customer.tags ? customer.tags.join(", ") : "",
    });
    setIsEditing(true);
  };
  

  // Handles input changes in the edit form
  const handleChange = (e) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [e.target.name]: e.target.value };
      console.log("Updated formData:", updatedData);
      return updatedData;
    });
  };
  

  // Saves customer edits and updates in Shopify & MongoDB
  const handleSave = async () => {
    if (!selectedCustomer) return;
    setLoading(true);
  
    try {
      const updatedCustomer = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        addressId: selectedCustomer.defaultAddress?.id || null, 
        location: `${formData.city}, ${formData.country}`, // ✅ Ensure location updates
        city: formData.city,
        country: formData.country,
        orders: Number(formData.orders),
        amountSpent: Number(formData.amountSpent),
        tags: formData.tags.split(",").map(tag => tag.trim()),
      };
  
      console.log("Final data sent to backend:", updatedCustomer);
  
      await axios.put(`http://localhost:5000/api/customers/${extractShopifyId(selectedCustomer.shopifyId)}`, updatedCustomer);
  
      // 🔹 Update customers state immediately so table reflects changes
      setCustomers((prevCustomers) =>
        prevCustomers.map((cust) =>
          cust.shopifyId === selectedCustomer.shopifyId
            ? { ...cust, location: updatedCustomer.location } // ✅ Ensure UI updates instantly
            : cust
        )
      );
  
      setSelectedCustomer(null); // Close modal
    } catch (error) {
      console.error("❌ Error updating customer:", error);
      alert("Failed to update customer.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="h-screen p-6">
       <div className="flex justify-between items-center w-[95%] mx-auto mb-4">
        <h2 className="text-2xl font-bold">Shopify Customers</h2>
        <button
          onClick={() => navigate("/add-customer")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Customer
        </button>
      </div>
      <table className="w-[95%] mx-auto mt-4 rounded-lg h-3/4 bg-white border ">
        <thead>
          <tr className="bg-white border border-black">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Location</th>
            <th className="border px-4 py-2">Orders</th>
            <th className="border px-4 py-2">Amount Spent</th>
            <th className="border px-4 py-2">Tags</th>
            <th className=" border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.shopifyId} className="text-center">
              <td className="border px-4 py-2">{customer.firstName} {customer.lastName}</td>
              <td className="border px-4 py-2">{customer.email}</td>
              <td className="border px-4 py-2">{customer.location}</td>
              <td className="border px-4 py-2">{customer.orders}</td>
              <td className="border px-4 py-2">${customer.amountSpent}</td>
              <td className="border px-4 py-2">{customer.tags?.join(", ")}</td>
              <td className="border px-4 py-2">
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => handleView(customer)} className="text-gray-500 hover:text-gray-700">
                     <FaEye />
                </button>
                <button onClick={() => handleEdit(customer)} className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                </button>
                <button onClick={() => handleDelete(customer.shopifyId)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
               </button>
              </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* View/Edit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Customer" : "Customer Details"}</h2>

            {isEditing ? (
              <div className="space-y-3">
                <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" />
                <input
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input name="orders" type="number" placeholder="Orders" value={formData.orders} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="amountSpent" type="number" placeholder="Amount Spent" value={formData.amountSpent} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="tags" placeholder="Tags (comma-separated)" value={formData.tags} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
            ) : (
              <div>
                <p><strong>Name:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                <p><strong>Email:</strong> {selectedCustomer.email}</p>
                <p><strong>Location:</strong> {selectedCustomer.location}</p>
                <p><strong>Orders:</strong> {selectedCustomer.orders}</p>
                <p><strong>Amount Spent:</strong> ${selectedCustomer.amountSpent}</p>
                <p><strong>Tags:</strong> {selectedCustomer.tags?.join(", ")}</p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSelectedCustomer(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Close</button>
              {isEditing && (
                <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">{loading ? "Saving..." : "Save & Close"}</button>
              )}
            </div>
          </div>
        </div>
      )}
      
{/* Pagination Controls */}
<div className="flex justify-center items-center gap-4 mt-4">
        {/* First Page Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => goToPage(1, null)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          First Page
        </button>

        {/* Previous Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => {
            if (currentPage > 1) {
              const prevCursor = cursorHistory[cursorHistory.length - 2] || null;
              goToPage(currentPage - 1, prevCursor);
              setCursorHistory((prev) => prev.slice(0, -1)); // Remove last cursor
            }
          }}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>

        {/* Current Page Number */}
        <span>Page {currentPage}</span>

        {/* Next Button */}
        <button
          disabled={!hasNextPage}
          onClick={() => goToPage(currentPage + 1, nextCursor)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
  
};

export default Customers;
