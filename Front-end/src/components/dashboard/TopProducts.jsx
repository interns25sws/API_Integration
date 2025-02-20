import React from "react";

// Sample product data
const products = [
  {
    id: 1,
    name: "Lipstick",
    stock: "Out of stock",
    price: "$10.5",
    image: "/images/lipstick.png",
    stockClass: "text-red-500",
  },
  {
    id: 2,
    name: "Lipstick",
    stock: "In stock",
    price: "$10.5",
    image: "/images/lipstick.png",
    stockClass: "text-green-500",
  },
  {
    id: 3,
    name: "Lipstick",
    stock: "In stock",
    price: "$10.5",
    image: "/images/lipstick.png",
    stockClass: "text-green-500",
  },
  {
    id: 4,
    name: "Lipstick",
    stock: "In stock",
    price: "$10.5",
    image: "/images/lipstick.png",
    stockClass: "text-green-500",
  },
];

const TopProducts = () => {
  return (
    <div className="bg-white col-span-2 p-6 rounded-lg shadow-md">
      {/* Section Title */}
      <h2 className="text-2xl font-semibold mb-4">Top Products</h2>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="p-2">Photo</th>
              <th className="p-2">Name</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Price</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-200">
                <td className="p-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-md"
                  />
                </td>
                <td className="p-2">{product.name}</td>
                <td className={`p-2 font-semibold ${product.stockClass}`}>
                  {product.stock}
                </td>
                <td className="p-2">{product.price}</td>
                <td className="p-2">
                  <button className="text-gray-500 text-xl">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;
