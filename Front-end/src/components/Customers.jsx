import { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
    }
  };

  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setIsEditing(false);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setIsEditing(true);
  };

  const extractShopifyId = (shopifyId) => {
    return shopifyId.replace("gid://shopify/Customer/", "");
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/customers/${extractShopifyId(customerId)}`);
      setCustomers(customers.filter((customer) => customer.shopifyId !== customerId));
    } catch (error) {
      console.error("❌ Error deleting customer:", error);
      alert("Failed to delete customer. Try again later.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!selectedCustomer) return;
    setLoading(true);

    try {
      await axios.put(
        `http://localhost:5000/api/customers/${extractShopifyId(selectedCustomer.shopifyId)}`,
        formData
      );
      fetchCustomers();
      setSelectedCustomer(null);
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Error updating customer:", error);
      alert("Failed to update customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Shopify Customers</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Location</th>
            <th className="border px-4 py-2">Orders</th>
            <th className="border px-4 py-2">Amount Spent</th>
            <th className="border px-4 py-2">Tags</th>
            <th className="border px-4 py-2">Actions</th>
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
              <td className="border px-4 py-2 flex justify-center gap-2">
                <button onClick={() => handleView(customer)} className="text-gray-500 hover:text-gray-700">
                  <FaEye />
                </button>
                <button onClick={() => handleEdit(customer)} className="text-blue-500 hover:text-blue-700">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(customer.shopifyId)} className="text-red-500 hover:text-red-700">
                  <FaTrash />
                </button>
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
                <input name="firstName" value={formData.firstName || ""} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="lastName" value={formData.lastName || ""} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="email" value={formData.email || ""} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="location" value={formData.location || ""} onChange={handleChange} className="w-full border p-2 rounded" />
                <input name="amountSpent" type="number" value={formData.amountSpent || ""} onChange={handleChange} className="w-full border p-2 rounded" />
                <input 
                  name="tags" 
                  value={formData.tags ? formData.tags.join(", ") : ""} 
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(", ") })} 
                  className="w-full border p-2 rounded" 
                />
                <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded w-full">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
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
              {isEditing && <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
