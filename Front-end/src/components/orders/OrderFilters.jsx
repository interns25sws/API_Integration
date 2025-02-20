const OrderFilters = ({ selectedStatus, filterOrders }) => {
  const filters = [
    { title: "Payment Refund", count: 490, icon: "💰", filter: "Refunded" },
    { title: "Order Cancelled", count: 490, icon: "❌", filter: "Cancelled" },
    { title: "Order Shipped", count: 490, icon: "📦", filter: "Shipped" },
    { title: "Order Delivering", count: 490, icon: "🚚", filter: "Delivering" },
    { title: "Pending Review", count: 490, icon: "📝", filter: "Pending Review" },
    { title: "Pending Payment", count: 490, icon: "⏳", filter: "Pending Payment" },
    { title: "Delivered", count: 490, icon: "✅", filter: "Completed" },
    { title: "In Progress", count: 490, icon: "🛠️", filter: "In Progress" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 w-[95%] mx-auto mt-3">
      {filters.map((f, index) => (
        <button
          key={index}
          className={`p-4 rounded-lg shadow-md flex items-center transition ${
            selectedStatus === f.filter
              ? "bg-blue-500 text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
          onClick={() => filterOrders(f.filter)}
        >
          
          <div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
          
            <p className="text-gray-500">{f.count}</p>
          </div>
          <span className="text-3xl">{f.icon}</span>
        </button>
      ))}
    </div>
  );
};

export default OrderFilters;
