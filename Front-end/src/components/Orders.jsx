// // // filepath: /c:/Users/jishan/Documents/GitHub/API_Integration/Front-end/src/components/Orders.jsx
// import { useEffect, useState } from "react";
// import axios from "axios";

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchOrders = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/orders"); // Fetch from MongoDB backend

//       console.log("📦 Orders from MongoDB:", response.data);
//       setOrders(response.data);
//     } catch (error) {
//       console.error("❌ Error fetching orders:", error);
//       setError("Failed to fetch orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Shopify Orders (Stored in MongoDB)</h2>

//       {loading ? (
//         <p>Loading orders...</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : (
//         <table className="w-full border border-gray-300 bg-white">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 border">Order ID</th>
//               <th className="p-2 border">Created At</th>
//               <th className="p-2 border">Customer</th>
//               <th className="p-2 border">Total</th>
//               <th className="p-2 border">Payment Status</th>
//               <th className="p-2 border">Items</th>
//               <th className="p-2 border">Delivery Number</th>
//               <th className="p-2 border">Order Status</th>
//               <th className="p-2 border">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr key={order.orderId} className="border">
//                 <td className="p-2 border">{order.name}</td>
//                 <td className="p-2 border">{new Date(order.createdAt).toLocaleDateString()}</td>
//                 <td className="p-2 border">{order.email || "N/A"}</td>
//                 <td className="p-2 border">
//                     ${order.totalPrice ? parseFloat(order.totalPrice).toFixed(2) : "N/A"} {order.currency}
//           </td>

//                 <td className="p-2 border">{order.paymentStatus || "N/A"}</td>
//                 <td className="p-2 border">
//                   <ul>
//                     {order.lineItems.map((item, index) => (
//                       <li key={index}>
//                         {item.title} (x{item.quantity})
//                       </li>
//                     ))}
//                   </ul>
//                 </td>
//                 <td className="p-2 border">{order.deliveryNumber || "Not Shipped Yet"}</td>
//                 <td className="p-2 border">
//                   {order.orderStatus === "UNFULFILLED" ? "Pending Shipment" : order.orderStatus}
//                 </td>
//                 <td className="p-2 border">
//                   <button className="bg-blue-500 text-white p-1 rounded">Edit</button>
//                   <button className="bg-red-500 text-white p-1 rounded ml-2">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Orders;


import { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [updatedOrder, setUpdatedOrder] = useState({});
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/orders");
      console.log("📦 Orders Data:", response.data);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setUpdatedOrder({ ...order });
  };

  const handleViewClick = (order) => {
    setViewingOrder(order);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOrder((prev) => ({ ...prev, [name]: value }));
  };
  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...updatedOrder.lineItems];
    newLineItems[index][field] = value;
    setUpdatedOrder({ ...updatedOrder, lineItems: newLineItems });
  };
  const handleUpdateOrder = async (order) => {
    if (!order || !order.orderId) {
      console.error("❌ Error: Order object or orderId is missing!", order);
      return;
    }
  
    const payload = {
      orderStatus: order.orderStatus,
      deliveryNumber: order.deliveryNumber,
      email: order.email,
      totalPrice: order.totalPrice,
      currency: order.currency,
      paymentStatus: order.paymentStatus,
      lineItems: order.lineItems,
    };
  
    console.log("📤 Sending Update Payload:", payload);
  
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${order.orderId}`, 
        payload
      );
  
      console.log("✅ Order updated:", response.data);
      setEditingOrder(null); // Close modal after saving
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error("❌ Error updating order:", error.response?.data || error.message);
    }
  };
  
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Shopify Orders</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="w-full border border-gray-300 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Payment Status</th>
              <th className="p-2 border">Delivery Number</th>
              <th className="p-2 border">Order Status</th>
              <th className="p-2 border">Items</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className="border">
                <td className="p-2 border">{order.orderId}</td>
                <td className="p-2 border">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-2 border">{order.email || "N/A"}</td>
                <td className="p-2 border">
                  ₹{parseFloat(order.totalPrice || 0).toFixed(2)} {order.currency}
                </td>
                <td className="p-2 border">{order.paymentStatus || "N/A"}</td>
                <td className="p-2 border">{order.deliveryNumber || "N/A"}</td>
                <td className="p-2 border">{order.orderStatus || "N/A"}</td>
                <td className="p-2 border">
                  {order.lineItems && order.lineItems.length > 0 ? (
                    <ul>
                      {order.lineItems.map((item, index) => (
                        <li key={index}>
                          {item.title} (x{item.quantity})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No items"
                  )}
                </td>
                <td className="p-2 border flex gap-2">
                  <button onClick={() => handleViewClick(order)} className="bg-gray-500 text-white p-1 rounded">
                    View
                  </button>
                  <button onClick={() => handleEditClick(order)} className="bg-blue-500 text-white p-1 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteOrder(order.orderId)} className="bg-red-500 text-white p-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-bold">Order Details</h3>
            <p>Order ID: {viewingOrder.orderId}</p>
            <p>Customer: {viewingOrder.email || "N/A"}</p>
            <p>Total: ₹{viewingOrder.totalPrice} {viewingOrder.currency}</p>
            <p>Payment Status: {viewingOrder.paymentStatus}</p>
            <p>Order Status: {viewingOrder.orderStatus}</p>
            <p>Delivery Number: {viewingOrder.deliveryNumber}</p>
            <h4 className="font-bold mt-2">Items:</h4>
            <ul>
              {viewingOrder.lineItems.map((item, index) => (
                <li key={index}>{item.title} (x{item.quantity})</li>
              ))}
            </ul>
            <button onClick={() => setViewingOrder(null)} className="mt-4 bg-gray-500 text-white p-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold">Edit Order</h3>

            <label className="block">
              Customer Email:
              <input type="email" name="email" value={updatedOrder.email} onChange={handleInputChange} className="border p-2 w-full" />
            </label>

            <label className="block mt-2">
              Total Price:
              <input type="number" name="totalPrice" value={updatedOrder.totalPrice} onChange={handleInputChange} className="border p-2 w-full" />
            </label>

            <label className="block mt-2">
              Currency:
              <input type="text" name="currency" value={updatedOrder.currency} onChange={handleInputChange} className="border p-2 w-full" />
            </label>

            <label className="block mt-2">
              Payment Status:
              <input type="text" name="paymentStatus" value={updatedOrder.paymentStatus} onChange={handleInputChange} className="border p-2 w-full" />
            </label>

            <label className="block mt-2">
              Order Status:
              <input type="text" name="orderStatus" value={updatedOrder.orderStatus} onChange={handleInputChange} className="border p-2 w-full" />
            </label>

            <label className="block mt-2">
              Delivery Number:
              <input type="text" name="deliveryNumber" value={updatedOrder.deliveryNumber} onChange={handleInputChange} className="border p-2 w-full" />
            </label>

            <h4 className="mt-4 font-bold">Order Items:</h4>
            {updatedOrder.lineItems.map((item, index) => (
              <div key={index} className="mt-2">
                <input type="text" value={item.title} onChange={(e) => handleLineItemChange(index, "title", e.target.value)} className="border p-2 w-full" />
                <input type="number" value={item.quantity} onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)} className="border p-2 w-full mt-1" />
              </div>
            ))}

            <div className="flex gap-2 mt-4">
            <button onClick={() => handleUpdateOrder(updatedOrder)} className="bg-blue-500 text-white p-2 rounded w-full">
            Save
              </button>
              <button onClick={() => setEditingOrder(null)} className="bg-gray-500 text-white p-2 rounded w-full">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
