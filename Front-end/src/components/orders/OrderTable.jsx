import OrderRow from "./OrderRow";

const OrderTable = ({ orders }) => {
  return (
   <div className="bg-white mt-5 w-[95%] mx-auto rounded-lg">
    <h2 className="m- font-semibold ">All Order list</h2>
    <table className="w-[95%] mx-auto mt-3 bg-white shadow-md rounded-lg">
     
      <thead className="bg-white ">
        <tr>
          <th className="p-3">Order ID</th>
          <th className="p-3">Created At</th>
          <th className="p-3">Customer</th>
          <th className="p-3">Total</th>
          <th className="p-3">Payment Status</th>
          <th className="p-3">Order Status</th>
          <th className="p-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <OrderRow key={order.id} order={order} />
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default OrderTable;
