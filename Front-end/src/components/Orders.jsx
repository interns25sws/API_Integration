import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [prevCursors, setPrevCursors] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editOrder, setEditOrder] = useState(null);
  const [editModal, setEditModal] = useState(false);

  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    fetchOrdersDirect(null);
  }, []);

  const fetchOrdersDirect = async (cursor = null) => {
    setLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem("token"); // Ensure token is retrieved
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
  
      const response = await axios.get("http://localhost:5000/api/orders/fetch-orders-direct", {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Include token
        params: { limit, cursor },
      });
  
      console.log("📌 API Response:", response.data); // Debugging
  
      const { orders, nextCursor, hasNextPage } = response.data;
  
      setOrders(orders); // ✅ Replace existing orders with new page orders
      setNextCursor(nextCursor);
      setHasNextPage(hasNextPage);
  
      setPrevCursors((prev) => [...prev, cursor].filter(Boolean)); // ✅ Avoid storing null

    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err.message);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateOrder = () => navigate("/create-order");

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
      setOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== orderId));
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      alert("Failed to delete order. Try again later.");
    }
  };

  const handleEditOrder = (order) => {
    console.log("Editing order:", order); // Check if order contains a valid ID
    setEditOrder({
      ...order,
      shopifyId: order.shopifyId || order.id, // Ensure we have the Shopify Order ID
    });
    setEditModal(true);
  };
  
  const handleUpdateOrder = async (e) => {
    e.preventDefault();
  
    console.log("Updating Order ID:", editOrder.orderId);
  
    const orderId = editOrder?.orderId;
    if (!orderId) {
      console.error("❌ Order ID is missing!");
      alert("Order ID is missing.");
      return;
    }
  
    const updateData = {
      email: editOrder.email || undefined,
      note: editOrder.deliveryNumber || undefined,
      tags: editOrder.tags || undefined,
    };
  
    console.log("✅ Sending Update Data:", updateData);
  
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/update-order/${orderId}`,
        updateData
      );
  
      if (response.status === 200) {
        alert("✅ Order updated successfully!");
        setEditModal(false);
        fetchOrdersDirect(null);
      }
    } catch (error) {
      if (error.response?.data?.data?.orderUpdate?.userErrors?.[0]?.message.includes("Too many attempts")) {
        console.warn("⏳ Rate limit hit. Retrying in 10 seconds...");
        setTimeout(() => handleUpdateOrder(e), 10000); // Retry after 10 seconds
      } else {
        console.error("❌ Error updating order:", error.response?.data || error.message);
        alert("Failed to update order.");
      }
    }
  };
  
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };
  

  const goToPage = (page, cursor) => {
    setCurrentPage(page);
    fetchOrdersDirect(cursor);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Shopify Orders</h2>
        <button
          onClick={handleCreateOrder}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          <FaPlus /> Create Order
        </button>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Order ID</th>
                <th className="border p-2">Customer Name</th>
                <th className="border p-2">Created At</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Total Price</th>
                <th className="border p-2">Payment Status</th>
                <th className="border p-2">Delivery Number</th>
                <th className="border p-2">Order Status</th>
                <th className="border p-2">Items</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.orderId} className="border">
                    <td className="border p-2">{order.orderId.replace(/\D/g, "")}</td>
                    <td className="border p-2">{order.customerName || "Guest"}</td>
                    <td className="border p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="border p-2">{order.email}</td>
                    <td className="border p-2">{order.totalPrice} {order.currency}</td>
                    <td className="border p-2">{order.paymentStatus}</td>
                    <td className="border p-2">{order.deliveryNumber || "Not Available"}</td>
                    <td className="border p-2">{order.orderStatus || "Pending"}</td>
                    <td className="border p-2">
                      {order.lineItems?.length > 0
                        ? order.lineItems.map((item) => `${item.title} (x${item.quantity})`).join(", ")
                        : "No Items"}
                    </td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>  handleViewOrder(order)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-green-500 hover:text-green-700"
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
                  <td colSpan="10" className="text-center p-4">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(1, null)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              First Page
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1, prevCursors[prevCursors.length - 2] || null)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              disabled={!hasNextPage}
              onClick={() => goToPage(currentPage + 1, nextCursor)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* View Order Modal */}
      {selectedOrder && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4">Order Details</h2>
      <p><strong>Order ID:</strong> {selectedOrder.name}</p>
      <p><strong>Customer:</strong> {selectedOrder.customerName || "Guest"}</p>
      <p><strong>Email:</strong> {selectedOrder.email}</p>
      <p><strong>Created At:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
      <p><strong>Total Price:</strong> {selectedOrder.totalPrice} {selectedOrder.currency}</p>
      <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
      <p><strong>Order Status:</strong> {selectedOrder.orderStatus}</p>
      <p><strong>Delivery Number:</strong> {selectedOrder.deliveryNumber || "Not Available"}</p>
      <p><strong>Items:</strong> {selectedOrder.lineItems.map((item) => `${item.title} (x${item.quantity})`).join(", ")}</p>
      
      {/* ✅ Show Tags Properly */}
      <p><strong>Tags:</strong></p>
      {selectedOrder.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-1">
          {selectedOrder.tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No Tags</p>
      )}

      <button
        onClick={() => setSelectedOrder(null)}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Close
      </button>
    </div>
  </div>
)}

{/* Edit Order Modal */}
{editModal && editOrder && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4">Edit Order</h2>
      <form onSubmit={handleUpdateOrder}>
        {/* Customer Email */}
        <input 
          type="email" 
          value={editOrder.email || ""} 
          onChange={(e) => setEditOrder({ ...editOrder, email: e.target.value })} 
          className="w-full p-2 border rounded mt-2" 
          placeholder="Customer Email" 
        />

        {/* Delivery Number (stored as Order Note) */}
        <input 
          type="text" 
          value={editOrder.deliveryNumber ?? ""} 
          onChange={(e) => setEditOrder({ ...editOrder, deliveryNumber: e.target.value })} 
          className="w-full p-2 border rounded mt-2" 
          placeholder="Delivery Number (Note)" 
        />

        {/* Tags */}
        <input 
          type="text" 
          value={editOrder.tags || ""} 
          onChange={(e) => setEditOrder({ ...editOrder, tags: e.target.value })} 
          className="w-full p-2 border rounded mt-2" 
          placeholder="Tags (comma-separated)" 
        />

        {/* Buttons */}
        <div className="flex justify-end mt-4">
          <button 
            type="button" 
            onClick={() => setEditModal(false)} 
            className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Update Order
          </button>
        </div>
      </form>
    </div>
  </div>
)}


    </div>
  );
};

export default Orders;
