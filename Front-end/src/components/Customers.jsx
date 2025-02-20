// import React, { useState } from "react";
// import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
// const Customers = () => {
//   const [selectedRows, setSelectedRows] = useState([]);

//   const invoices = [
//     {
//       id: 1,
//       name: "Michael A. Miner",
//       status: "Completed",
//       amount: "$4,521",
//       due: "$8,521",
//       date: "07 Jan, 2024",
//       payment: "Mastercard",
//       image:
//         "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?t=st=1739364320~exp=1739367920~hmac=6a8c7ddde4eb98ba94f507c7d4565a8d10b348f8ef69ce89a6350f7084bb1551&w=740",
//     },
//     {
//       id: 2,
//       name: "Theressa T. Bose",
//       status: "Cancelled",
//       amount: "$4,521",
//       due: "$8,521",
//       date: "07 Jan, 2024",
//       payment: "Mastercard",
//       image:
//         "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?t=st=1739364320~exp=1739367920~hmac=6a8c7ddde4eb98ba94f507c7d4565a8d10b348f8ef69ce89a6350f7084bb1551&w=740",
//     },
//     {
//       id: 3,
//       name: "Theressa T. Bose",
//       status: "Completed",
//       amount: "$4,521",
//       due: "$8,521",
//       date: "07 Jan, 2024",
//       payment: "Mastercard",
//       image:
//         "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?t=st=1739364320~exp=1739367920~hmac=6a8c7ddde4eb98ba94f507c7d4565a8d10b348f8ef69ce89a6350f7084bb1551&w=740",
//     },
//     {
//       id: 4,
//       name: "Michael A. Miner",
//       status: "Cancelled",
//       amount: "$4,521",
//       due: "$8,521",
//       date: "07 Jan, 2024",
//       payment: "Mastercard",
//       image:
//         "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?t=st=1739364320~exp=1739367920~hmac=6a8c7ddde4eb98ba94f507c7d4565a8d10b348f8ef69ce89a6350f7084bb1551&w=740",
//     },
//     {
//       id: 5,
//       name: "Theressa T. Bose",
//       status: "Completed",
//       amount: "$4,521",
//       due: "$8,521",
//       date: "07 Jan, 2024",
//       payment: "Mastercard",
//       image:
//         "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?t=st=1739364320~exp=1739367920~hmac=6a8c7ddde4eb98ba94f507c7d4565a8d10b348f8ef69ce89a6350f7084bb1551&w=740",
//     },
//     {
//       id: 6,
//       name: "Michael A. Miner",
//       status: "Pending",
//       amount: "$4,521",
//       due: "$8,521",
//       date: "07 Jan, 2024",
//       payment: "Mastercard",
//       image:
//         "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?t=st=1739364320~exp=1739367920~hmac=6a8c7ddde4eb98ba94f507c7d4565a8d10b348f8ef69ce89a6350f7084bb1551&w=740",
//     },
//   ];

//   const toggleRowSelection = (id) => {
//     setSelectedRows((prev) =>
//       prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
//     );
//   };

//   const isRowSelected = (id) => selectedRows.includes(id);

//   const getStatusClass = (status) => {
//     switch (status) {
//       case "Completed":
//         return "bg-green-100 text-green-700 border-green-500";
//       case "Cancelled":
//         return "bg-red-100 text-red-700 border-red-500";
//       case "Pending":
//         return "bg-yellow-100 text-yellow-700 border-yellow-500";
//       default:
//         return "bg-gray-100 text-gray-700 border-gray-500";
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       {/* Dashboard Stats */}
//       <div className="grid grid-cols-4 gap-4">
//         {/* Card 1 */}
//         <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
//           <div>
//             <p className="text-gray-600 text-sm">All Customers</p>
//             <p className="text-xl font-semibold">+22.6K</p>
//           </div>
//           <div className="text-3xl text-gray-500">🧑‍🤝‍🧑</div>
//         </div>

//         {/* Card 2 */}
//         <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
//           <div>
//             <p className="text-gray-600 text-sm">Orders</p>
//             <p className="text-xl font-semibold">+4.5K</p>
//           </div>
//           <div className="text-3xl text-gray-500">📦</div>
//         </div>

//         {/* Card 3 */}
//         <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
//           <div>
//             <p className="text-gray-600 text-sm">Service Requests</p>
//             <p className="text-xl font-semibold">+1.03K</p>
//           </div>
//           <div className="text-3xl text-gray-500">🛠️</div>
//         </div>

//         {/* Card 4 */}
//         <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
//           <div>
//             <p className="text-gray-600 text-sm">Invoice & Payment</p>
//             <p className="text-xl font-semibold">$38,900.00</p>
//           </div>
//           <div className="text-3xl text-gray-500">💰</div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white p-6 rounded-lg shadow-lg">
//         <h2 className="text-lg font-semibold mb-4">All Customers List</h2>
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className="text-left bg-gray-100">
//               <th className="p-3">
//                 <input type="checkbox" className="w-4 h-4" />
//               </th>
//               <th className="p-3">Customer</th>
//               <th className="p-3">Invoice ID</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Total Amount</th>
//               <th className="p-3">Amount Due</th>
//               <th className="p-3">Due Date</th>
//               <th className="p-3">Payment Method</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoices.map((invoice) => (
//               <tr key={invoice.id} className="border-b">
//                 <td className="p-3">
//                   <input
//                     type="checkbox"
//                     checked={isRowSelected(invoice.id)}
//                     onChange={() => toggleRowSelection(invoice.id)}
//                     className="w-4 h-4"
//                   />
//                 </td>
//                 <td className="p-3 flex items-center">
//                   <img
//                     src={invoice.image}
//                     alt="profile"
//                     className="w-10 h-10 rounded-full mr-3"
//                   />
//                   {invoice.name}
//                 </td>
//                 <td className="p-3 text-gray-700">#inv2054</td>
//                 <td className="p-3">
//                   <span
//                     className={`px-3 py-1 text-sm font-semibold border rounded-md ${getStatusClass(
//                       invoice.status
//                     )}`}
//                   >
//                     {invoice.status}
//                   </span>
//                 </td>
//                 <td className="p-3">{invoice.amount}</td>
//                 <td className="p-3">{invoice.due}</td>
//                 <td className="p-3">{invoice.date}</td>
//                 <td className="p-3">{invoice.payment}</td>
//                 <td className="p-3 flex space-x-2 text-center">
//                   <button className="text-blue-500 hover:text-blue-700 mx-2">
//                     <FaEye />
//                   </button>
//                   <button className="text-green-500 hover:text-green-700 mx-3">
//                     <FaEdit />
//                   </button>
//                   <button className="text-red-500 hover:text-red-700 mx-2">
//                     <FaTrash />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Customers;

import { useEffect, useState } from "react";
import axios from "axios";

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/shopify/graphql", {
        query: `{
          customers(first: 5) {
            edges {
              node {
                id
                firstName
                lastName
                email
              }
            }
          }
        }`
      }, {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": "YOUR_ACCESS_TOKEN"
        }
      });

      console.log("Shopify Customers API Response:", response.data);

      setCustomers(response.data.data.customers.edges);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Shopify Customers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(({ node }) => (
          <div key={node.id} className="bg-white shadow-lg rounded-xl p-4 border border-gray-200">
            <h3 className="text-lg font-semibold">{node.firstName} {node.lastName}</h3>
            <p className="text-gray-600">{node.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
