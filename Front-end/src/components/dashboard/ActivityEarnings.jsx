import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ActivityEarnings = () => {
  const [activityData, setActivityData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/analytics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
  
        console.log("Full API Response:", response.data); // Log full response
  
        const data = response.data.analytics;
        if (!data || !data.activity || !data.earnings) {
          console.error("Missing analytics data from API", data);
          setLoading(false);
          return;
        }
  
        setTotalOrders(data.totalOrders || 0);
        setTotalRevenue(data.totalRevenue || 0);
  
        setActivityData({
          labels: data.activity.labels || [],
          datasets: [
            {
              label: "Hours Spent",
              data: data.activity.hoursSpent || [],
              backgroundColor: "rgba(153, 102, 255, 0.6)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        });
  
        setEarningsData({
          labels: data.earnings.labels || [],
          datasets: [
            {
              label: "Revenue ($)",
              data: data.earnings.revenue || [],
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
            {
              label: "Profit ($)",
              data: data.earnings.profit || [],
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
  
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setLoading(false);
      }
    };
  
    fetchAnalytics();
  }, []);
  

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true },
    },
  };

  return (
    <div className="col-span-1 bg-white ml-8 p-4 rounded-lg shadow">
      <div className="flex justify-between">
        <h2 className="text-3xl font-semibold">Activity & Earnings</h2>
        <button className="bg-white font-normal w-32 rounded-lg flex items-center justify-center space-x-2">
          <img src="calendar.png" alt="calendar icon" className="h-5 w-5" />
          <span>Last 7 days</span>
        </button>
      </div>

      <p className="text-3xl font-bold mt-6 flex">
        <span>{loading ? "Loading..." : totalOrders}</span>
        <span className="flex flex-col items-start text-sm font-normal">
          <span>Total</span>
          <span>Orders</span>
        </span>
      </p>

      {/* Activity Chart */}
      <div className="mt-6 h-65">
        {loading ? <p>Loading...</p> : activityData && <Bar data={activityData} options={options} />}
      </div>

      <h2 className="text-4xl font-semibold mt-12 flex items-center justify-between">
        <span>Earnings</span>
        <span className="text-4xl">...</span>
      </h2>

      <div className="flex justify-between">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-blue-600 rounded-full mr-2"></div>
              <div>
                <p className="mt-8 text-3xl text-blue-600">Revenue</p>
                <p className="font-bold text-xl">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Earnings Chart */}
      <div className="mt-6 h-65">
        {loading ? <p>Loading...</p> : earningsData && <Bar data={earningsData} options={options} />}
      </div>
    </div>
  );
};

export default ActivityEarnings;
