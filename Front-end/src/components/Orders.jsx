import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(null); // Added state for loading order details

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/orders");
      console.log("📦 Orders Data:", response.data);
      setOrders(response.data);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = async (orderId) => {
    setLoadingOrder(orderId);
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
      setViewingOrder(response.data);
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
      setViewingOrder(null);
    } finally {
      setLoadingOrder(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      alert("Failed to delete order. Try again later.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Shopify Orders</h2>
        <button
          onClick={() => navigate("/create-order")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Create Order
        </button>
      </div>

      {loading ? (
        <p className="text-center text-lg font-semibold">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-red-500 font-semibold">{error}</p>
      ) : (
        <table className="w-full mt-4 border-collapse bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Created At</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Payment Status</th>
              <th className="p-3 border">Delivery No.</th>
              <th className="p-3 border">Order Status</th>
              <th className="p-3 border">Items</th>
              <th className="p-3 border w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.orderId} className="border hover:bg-gray-50">
                  <td className="p-3 border">{order.orderId}</td>
                  <td className="p-3 border">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 border">{order.email || "N/A"}</td>
                  <td className="p-3 border font-semibold text-blue-600">
                    ₹{parseFloat(order.totalPrice || 0).toFixed(2)} {order.currency}
                  </td>
                  <td className="p-3 border">{order.paymentStatus || "N/A"}</td>
                  <td className="p-3 border">{order.deliveryNumber || "N/A"}</td>
                  <td className="p-3 border">{order.orderStatus || "N/A"}</td>
                  <td className="p-3 border">
                    {order.lineItems && order.lineItems.length > 0 ? (
                      <ul>
                        {order.lineItems.map((item, index) => (
                          <li key={index} className="text-sm">
                            {item.title} (x{item.quantity})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No items"
                    )}
                  </td>
                  <td className="p-3 border">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleViewClick(order.orderId)}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={loadingOrder === order.orderId}
                      >
                        {loadingOrder === order.orderId ? "⌛" : <FaEye />}
                      </button>
                      <button
                        onClick={() => navigate(`/edit-order/${order.orderId}`)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;
