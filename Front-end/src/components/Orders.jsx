// // filepath: /c:/Users/jishan/Documents/GitHub/API_Integration/Front-end/src/components/Orders.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editOrderData, setEditOrderData] = useState({});

//   useEffect(() => {
//     // Fetch orders from API
//     const fetchOrders = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/orders");
//         setOrders(response.data);
//       } catch (error) {
//         console.error("❌ Error fetching orders:", error);
//       }
//     };

//     fetchOrders();
//   }, []);

//   // Handle View Order
//   const handleView = (order) => {
//     setSelectedOrder(order);
//     setIsViewModalOpen(true);
//   };

//   // Handle Edit Order
//   const handleEdit = (order) => {
//     setEditOrderData(order);
//     setIsEditModalOpen(true);
//   };

//   // Handle Delete Order
//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this order?")) {
//       try {
//         await axios.delete(`http://localhost:5000/api/orders/${id}`);
//         setOrders(orders.filter((order) => order._id !== id));
//       } catch (error) {
//         console.error("❌ Error deleting order:", error);
//       }
//     }
//   };

//   // Handle Edit Order Input Change
//   const handleEditInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditOrderData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Handle Save Edit Order
//   const handleSaveEdit = async () => {
//     try {
//       const response = await axios.put(`http://localhost:5000/api/orders/${editOrderData._id}`, editOrderData);
//       setOrders(orders.map((order) => (order._id === editOrderData._id ? response.data : order)));
//       setIsEditModalOpen(false);
//     } catch (error) {
//       console.error("❌ Error saving order:", error);
//     }
//   };

//   return (
//     <div className="w-[95%] mx-auto mt-4 p-6 rounded-lg shadow-md bg-gray-100 min-h-screen">
//       {/* ✅ Order Summary Cards */}
//       <div className="grid grid-cols-4 gap-4 mb-6">
//         {[
//           { title: "Payment Refund", count: 490, icon: "💰",filter: "Refunded"},
//           { title: "Order Cancelled", count: 490, icon: "❌" },
//           { title: "Order Shipped", count: 490, icon: "📦" },
//           { title: "Order Delivering", count: 490, icon: "🚚" },
//           { title: "Pending Review", count: 490, icon: "📝" },
//           { title: "Pending Payment", count: 490, icon: "⏳" },
//           { title: "Delivered", count: 490, icon: "✅" },
//           { title: "In Progress", count: 490, icon: "🛠️" },
//         ].map((card, index) => (
//           <div key={index} className="bg-white p-4 rounded-lg shadow-md flex items-center">
//             <span className="text-3xl mr-3">{card.icon}</span>
//             <div>
//               <h3 className="text-lg font-semibold">{card.title}</h3>
//               <p className="text-gray-500">{card.count}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ✅ Orders Table */}
//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <h2 className="text-xl font-semibold text-gray-700 mb-4">📋 All Orders</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse border border-gray-200">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="p-3 text-left border">Order ID</th>
//                 <th className="p-3 text-left border">Created At</th>
//                 <th className="p-3 text-left border">Customer</th>
//                 <th className="p-3 text-left border">Total</th>
//                 <th className="p-3 text-left border">Payment Status</th>
//                 <th className="p-3 text-left border">Items</th>
//                 <th className="p-3 text-left border">Delivery No.</th>
//                 <th className="p-3 text-left border">Order Status</th>
//                 <th className="p-3 text-center border">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <tr key={order._id} className="border-b hover:bg-gray-100">
//                   <td className="p-3 border">#{order._id}</td>
//                   <td className="p-3 border">{order.createdAt}</td>
//                   <td className="p-3 border">{order.customer}</td>
//                   <td className="p-3 border">${order.total}</td>
//                   <td className="p-3 border">
//                     <span
//                       className={`px-2 py-1 rounded ${
//                         order.paymentStatus === "Paid"
//                           ? "bg-green-500 text-white"
//                           : "bg-red-500 text-white"
//                       }`}
//                     >
//                       {order.paymentStatus}
//                     </span>
//                   </td>
//                   <td className="p-3 border">{order.items}</td>
//                   <td className="p-3 border">{order.deliveryNo}</td>
//                   <td className="p-3 border">
//                     <span
//                       className={`px-2 py-1 rounded ${
//                         order.orderStatus === "Completed"
//                           ? "bg-green-500 text-white"
//                           : order.orderStatus === "Cancelled"
//                           ? "bg-red-500 text-white"
//                           : "bg-gray-400 text-white"
//                       }`}
//                     >
//                       {order.orderStatus}
//                     </span>
//                   </td>
//                   <td className="p-3 text-center border">
//                     <button onClick={() => handleView(order)} className="text-blue-500 hover:text-blue-700 mx-2">
//                       <FaEye />
//                     </button>
//                     <button onClick={() => handleEdit(order)} className="text-green-500 hover:text-green-700 mx-2">
//                       <FaEdit />
//                     </button>
//                     <button onClick={() => handleDelete(order._id)} className="text-red-500 hover:text-red-700 mx-2">
//                       <FaTrash />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* View Order Modal */}
//       {isViewModalOpen && selectedOrder && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
//             <h2 className="text-lg font-semibold mb-4">Order Details</h2>
//             <p><strong>Order ID:</strong> #{selectedOrder._id}</p>
//             <p><strong>Created At:</strong> {selectedOrder.createdAt}</p>
//             <p><strong>Customer:</strong> {selectedOrder.customer}</p>
//             <p><strong>Total:</strong> ${selectedOrder.total}</p>
//             <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
//             <p><strong>Items:</strong> {selectedOrder.items}</p>
//             <p><strong>Delivery No.:</strong> {selectedOrder.deliveryNo}</p>
//             <p><strong>Order Status:</strong> {selectedOrder.orderStatus}</p>
//             <button
//               className="bg-gray-400 text-white px-4 py-2 rounded-md mt-4"
//               onClick={() => setIsViewModalOpen(false)}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Edit Order Modal */}
//       {isEditModalOpen && editOrderData && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
//             <h2 className="text-lg font-semibold mb-4">Edit Order</h2>
//             <input
//               type="text"
//               name="customer"
//               value={editOrderData.customer}
//               onChange={handleEditInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Customer"
//             />
//             <input
//               type="text"
//               name="total"
//               value={editOrderData.total}
//               onChange={handleEditInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Total"
//             />
//             <input
//               type="text"
//               name="paymentStatus"
//               value={editOrderData.paymentStatus}
//               onChange={handleEditInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Payment Status"
//             />
//             <input
//               type="text"
//               name="items"
//               value={editOrderData.items}
//               onChange={handleEditInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Items"
//             />
//             <input
//               type="text"
//               name="deliveryNo"
//               value={editOrderData.deliveryNo}
//               onChange={handleEditInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Delivery No."
//             />
//             <input
//               type="text"
//               name="orderStatus"
//               value={editOrderData.orderStatus}
//               onChange={handleEditInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Order Status"
//             />
//             <button
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
//               onClick={handleSaveEdit}
//             >
//               Save Changes
//             </button>
//             <button
//               className="bg-gray-400 text-white px-4 py-2 rounded-md mt-2 ml-2"
//               onClick={() => setIsEditModalOpen(false)}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Orders;

import { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/shopify/graphql", {
        query: `{
          orders(first: 5) {
            edges {
              node {
                id
                name
                email
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                lineItems(first: 3) {
                  edges {
                    node {
                      title
                      quantity
                    }
                  }
                }
              }
            }
          }
        }`
      });
  
      console.log("Shopify Orders API Response:", response.data); // ✅ Debugging response
  
      if (!response.data?.data?.orders) {
        console.error("❌ Invalid API response:", response.data);
        throw new Error("Invalid API response: Orders data missing");
      }
  
      setOrders(response.data.data.orders.edges || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  
  
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Shopify Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map(({ node }) => (
  <div key={node.id} className="order-card">
    <h3>Order: {node.name}</h3>
    <p>Email: {node.email || "N/A"}</p>

    <p>
      <strong>Total Price:</strong> $
      {node.totalPriceSet?.shopMoney?.amount
        ? node.totalPriceSet.shopMoney.amount
        : "N/A"}
    </p>

    <h4>Items:</h4>
    <ul>
      {node.lineItems.edges.map(({ node }) => (
        <li key={node.title}>
          {node.title} (x{node.quantity})
        </li>
      ))}
    </ul>
  </div>
))}
      </div>
    </div>
  );
};

export default Orders;
