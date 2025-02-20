import React from "react";
import ActivityEarnings from "./ActivityEarnings";
import Orders from "./Orders";
import CustomerRating from "./CustomerRating";
import TopProducts from "./TopProducts";


function Dashboard() {
 
  const ratingTrendData = [
    { month: "Jan", rating: 3.5 },
    { month: "Feb", rating: 3.8 },
    { month: "Mar", rating: 4.0 },
    { month: "Apr", rating: 3.9 },
    { month: "May", rating: 3.7 },
    { month: "Jun", rating: 3.5 },
    { month: "Jul", rating: 3.0 },
    { month: "Aug", rating: 2.9 },
    { month: "Sep", rating: 3.2 },
    { month: "Oct", rating: 3.5 },
    { month: "Nov", rating: 3.0 },
    { month: "Dec", rating: 3.3 },
  ];
  return (
    <div className="w-auto flex flex-col  bg-zinc-200">
      
      <main className="grid grid-cols-3 h-full gap-4 mt-2 p-4"> {/* Main content area */}
      <ActivityEarnings />
      <div className="col-span-2 grid grid-cols-2 gap-8">
          <Orders />
          <CustomerRating
            rating={3.0}
            totalReviews={318}
            growth={35}
            trendData={ratingTrendData}
          />
       
            <TopProducts />
        
        </div>
      </main>
      </div>
 
  );
}

export default Dashboard;
