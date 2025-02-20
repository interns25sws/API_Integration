import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { useState } from "react";

const OrderActions = ({ order }) => {
  const [orders, setOrders] = useState([])
  const[selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editOrderData, setEditOrderData] = useState({});

  const handleView = () => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  }

  const handleEdit = () => {
    setEditOrderData(order);
    setIsEditModalOpen(true)
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${id}`);
        setOrders(orders.filter((order) => order._id !== id));
      } catch (error) {
        console.error("❌ Error deleting order:", error);
      }
    }
  };

  const handleEditInputChange = (e) =>{
    const {name,value} = e.target;
    setEditOrderData((prev) => ({ ...prev,[name]: value }));
  }

  const handleSaveEdit = async() =>{
    try{
      const response = await axios.put(`http://localhost:5000/api/orders/${editOrderData._id}`, editOrderData);
      setOrders(orders.map((order) => (order._id === editOrderData._id ? response.data : order)));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("❌ Error saving order:", error);
    }
  }

  return (
    <div className="p-3 text-center ">
      <button onClick={() => handleView(order)} className="text-blue-500 hover:text-blue-700 mx-2">
        <FaEye />
      </button>
      <button onClick={() => handleEdit(order)} className="text-green-500 hover:text-green-700 mx-2">
        <FaEdit />
      </button>
      <button onClick={() => handleDelete(order._id)} className="text-red-500 hover:text-red-700 mx-2">
        <FaTrash />
      </button>
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            <p><strong>Order ID:</strong> #{selectedOrder._id}</p>
            <p><strong>Created At:</strong> {selectedOrder.createdAt}</p>
            <p><strong>Customer:</strong> {selectedOrder.customer}</p>
            <p><strong>Total:</strong> ${selectedOrder.total}</p>
            <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
            <p><strong>Items:</strong> {selectedOrder.items}</p>
            <p><strong>Delivery No.:</strong> {selectedOrder.deliveryNo}</p>
            <p><strong>Order Status:</strong> {selectedOrder.orderStatus}</p>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded-md mt-4"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

{isEditModalOpen && editOrderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-semibold mb-4">Edit Order</h2>
            <input
              type="text"
              name="customer"
              value={editOrderData.customer}
              onChange={handleEditInputChange}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="Customer"
            />
            <input
              type="text"
              name="total"
              value={editOrderData.total}
              onChange={handleEditInputChange}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="Total"
            />
            <input
              type="text"
              name="paymentStatus"
              value={editOrderData.paymentStatus}
              onChange={handleEditInputChange}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="Payment Status"
            />
            <input
              type="text"
              name="items"
              value={editOrderData.items}
              onChange={handleEditInputChange}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="Items"
            />
            <input
              type="text"
              name="deliveryNo"
              value={editOrderData.deliveryNo}
              onChange={handleEditInputChange}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="Delivery No."
            />
            <input
              type="text"
              name="orderStatus"
              value={editOrderData.orderStatus}
              onChange={handleEditInputChange}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="Order Status"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
              onClick={handleSaveEdit}
            >
              Save Changes
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded-md mt-2 ml-2"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default OrderActions;
