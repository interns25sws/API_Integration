import { useState, useEffect } from "react";
import axios from "axios";
import OrderFilters from "./OrderFilters";
import OrderTable from "./OrderTable";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders");
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const filterOrders = (status) => {
    setSelectedStatus(status);
    setFilteredOrders(status === "All" ? orders : orders.filter(order => order.orderStatus === status));
  };

  return (
    <>
     
      <OrderFilters selectedStatus={selectedStatus} filterOrders={filterOrders} />
      <OrderTable orders={filteredOrders} />
   </>
  );
};

export default Orders;
