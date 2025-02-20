import React from "react";

const Orders = () => {
  // Order Data
  const orderData = [
    {
      title: "Total Orders",
      value: "13,647",
      percentage: "+0.56%",
      imgSrc: "https://cdn-icons-png.flaticon.com/128/3045/3045670.png",
    },
    {
      title: "New Leads",
      value: "9,525",
      percentage: "+0.56%",
      imgSrc: "https://cdn-icons-png.flaticon.com/128/18366/18366382.png",
    },
    {
      title: "Deals",
      value: "976",
      percentage: "+0.56%",
      imgSrc: "https://cdn-icons-png.flaticon.com/128/5412/5412794.png",
    },
    {
      title: "Bookings",
      value: "13,647",
      percentage: "+0.56%",
      imgSrc: "https://cdn-icons-png.flaticon.com/128/2907/2907150.png",
    },
  ];

  return (
    <div className="bg-white p-4 ml-5 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold">Orders</h2>
      <div className="grid grid-cols-2 gap-4 mt-4 h-[448px]">
        {orderData.map((order, index) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded-lg flex flex-col justify-center items-center shadow-md"
          >
            {/* Image */}
            <img src={order.imgSrc} alt={order.title} className="w-14 h-14" />

            {/* Title and Value */}
            <p className="text-lg font-bold mt-2">{order.title}</p>
            <p className="text-xl font-semibold">{order.value}</p>

            {/* Percentage Change & Button (One Line, Space Between) */}
            <div className="flex justify-between items-center w-full px-4 py-2 rounded-lg shadow-md mt-3 bg-gray-400">
              <span className="text-sm font-medium">{order.percentage}</span>
              <button className=" text-white px-4 py-2 rounded-lg hover:bg-blue-500 ">
                View More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
