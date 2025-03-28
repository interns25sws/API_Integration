import React, { useEffect, useState } from "react";

const TopProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/shopify/top-products");
        const data = await response.json();

        if (data.products) {
          const formattedProducts = data.products.map((product) => ({
            id: product.id,
            name: product.title,
            stock: product.totalInventory > 0 ? "In stock" : "Out of stock",
            price: `$${product.variants.edges[0].node.price}`, // Assuming first variant
            image: product.featuredImage ? product.featuredImage.url : "/images/placeholder.png",
            stockClass: product.totalInventory > 0 ? "text-green-500" : "text-red-500",
          }));

          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error);
      }
    };

    fetchTopProducts();
  }, []);

  return (
    <div className="bg-white col-span-2 p-6 rounded-lg shadow-md">
      {/* Section Title */}
      <h2 className="text-2xl font-semibold mb-4">Top Products</h2>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="p-2">Photo</th>
              <th className="p-2">Name</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Price</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
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
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;
