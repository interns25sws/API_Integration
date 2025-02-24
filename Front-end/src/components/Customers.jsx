import { useEffect, useState } from "react";
import axios from "axios";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Shopify Customers</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Location</th>
            <th className="border border-gray-300 px-4 py-2">Orders</th>
            <th className="border border-gray-300 px-4 py-2">Amount Spent</th>
            <th className="border border-gray-300 px-4 py-2">Tags</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.shopifyId} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{customer.firstName} {customer.lastName}</td>
              <td className="border border-gray-300 px-4 py-2">{customer.email}</td>
              <td className="border border-gray-300 px-4 py-2">{customer.location}</td>
              <td className="border border-gray-300 px-4 py-2">{customer.orders}</td>
              <td className="border border-gray-300 px-4 py-2">
                {customer.amountSpent} {customer.amountSpent.currency}
              </td>
              <td className="border border-gray-300 px-4 py-2">{customer.tags?.join(", ")}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button className="bg-blue-500 text-white px-2 py-1 rounded">View</button>
                <button className="bg-green-500 text-white px-2 py-1 rounded mx-2">Edit</button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => deleteCustomer(customer.customerId)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const deleteCustomer = async (customerId) => {
  if (!window.confirm("Are you sure you want to delete this customer?")) return;
  try {
    await axios.delete(`http://localhost:5000/api/customers/${customerId}`);
    alert("Customer deleted successfully!");
    window.location.reload();
  } catch (error) {
    console.error("Error deleting customer:", error);
  }
};

export default Customers;
