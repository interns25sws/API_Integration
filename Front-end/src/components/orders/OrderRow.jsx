import OrderActions from "./OrderActions";

const OrderRow = ({ order }) => {
  return (
    <tr className="border-b hover:bg-gray-100">
      <td className="p-3">#{order.id}</td>
      <td className="p-3">{order.createdAt}</td>
      <td className="p-3">{order.customer}</td>
      <td className="p-3">${order.total}</td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded ${order.paymentStatus === "Paid" ? "bg-green-200" : "bg-red-200"}`}>
          {order.paymentStatus}
        </span>
      </td>
      <td className="p-3">{order.orderStatus}</td>
      <td className="p-3 text-center">
        <OrderActions order={order} />
      </td>
    </tr>
  );
};

export default OrderRow;
