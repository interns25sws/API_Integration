import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomerRating = ({ rating, totalReviews, growth, trendData }) => {
  // Generate star icons dynamically based on rating
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={
          i <= rating ? "text-yellow-500 text-2xl" : "text-gray-400 text-2xl"
        }
      >
        ★
      </span>
    );
  }

  return (
    <div className=" p-6 rounded-lg bg-white shadow-md w-full max-w-xl ">
      <h2 className="text-2xl font-semibold">Customer Rating</h2>

      {/* Star Ratings & Total Reviews */}
      <div className="flex items-center space-x-2 mt-3 h-10">
        {stars}
        <p className="text-xl font-semibold">{rating.toFixed(1)}</p>
        <p className="text-gray-800">({totalReviews})</p>
      </div>

      {/* Growth Indicator */}
      <div className="flex items-center text-green-500 mt-2">
        <span className="text-lg font-medium">↑ +{growth}</span>
        <p className="text-gray-500 ml-2">Point from last month</p>
      </div>

      {/* Line Graph for Rating Trends */}
      <div className="w-full h-32 mt-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis hide={true} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#22c55e"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Download Report Button */}
      <button className="bg-green-500 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium mt-14 w-auto ml-48">
        Download Report
      </button>
    </div>
  );
};

export default CustomerRating;
