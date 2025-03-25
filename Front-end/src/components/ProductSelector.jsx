import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/shopify/graphql"; // Backend URL
const ACCESS_TOKEN = "your-access-token"; // ✅ Replace with your actual Shopify access token

const ProductSelector = ({ onSelect, buttonType }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(API_URL, {
        query: `{
          products(first: 20) {
            edges {
              node {
                id
                title
                totalInventory
                images(first: 1) { edges { node { originalSrc } } }
                variants(first: 1) { 
                  edges { 
                    node { 
                      id  # ✅ Corrected: Removed inline comment
                      price 
                    } 
                  } 
                }
              }
            }
          }
        }`,
      });

      const fetchedProducts =
        response.data?.data?.products?.edges.map(({ node }) => ({
          id: node.id, // Product ID
          title: node.title,
          stock: node.totalInventory,
          image: node.images.edges[0]?.node.originalSrc || "",
          price: parseFloat(node.variants.edges[0]?.node.price) || 0,
          variant_id: node.variants.edges[0]?.node.id || "", // ✅ This comment is outside GraphQL
          quantity: 1, // Default quantity
        })) || [];

      setProducts(fetchedProducts);
      setShowProducts(true);
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
    }
    setLoading(false);
  };

  // Update the parent component when selectedProducts changes
 useEffect(() => {
  if (onSelect) {
    onSelect(selectedProducts); // ✅ Only runs when `selectedProducts` changes
  }
}, [selectedProducts]); // ❌ Removed `onSelect` from dependencies


  // Handle product selection toggle
  const toggleSelectProduct = (product) => {
    setSelectedProducts((prevProducts) => {
      const isSelected = prevProducts.some((p) => p.id === product.id);
      if (isSelected) {
        return prevProducts.filter((p) => p.id !== product.id);
      } else {
        return [...prevProducts, { ...product, quantity: 1 }];
      }
    });
  };

  // Update quantity of selected products
  const updateQuantity = (id, newQuantity) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === id ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-4">
      {/* Browse Button */}
      {buttonType === "browse" && (
        <button
          onClick={fetchProducts}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Browse Products
        </button>
      )}

      {buttonType === "add" && (
        <button
          onClick={fetchProducts}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Products
        </button>
      )}
      {/* Product Modal */}
      {showProducts && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowProducts(false)} // Close modal on background click
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-3xl relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <h3 className="text-lg font-semibold mb-2">Select Products</h3>

            {/* Close Button */}
            <button
              onClick={() => setShowProducts(false)}
              className="absolute top-3 right-4 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-4 border rounded-md"
            />

            {/* Loading & Error Messages */}
            {loading && <p>Loading products...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {/* Product List */}
            <div className="overflow-y-auto max-h-80">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4">Select</th>
                    <th className="py-2 px-4">Image</th>
                    <th className="py-2 px-4">Title</th>
                    <th className="py-2 px-4">Stock</th>
                    <th className="py-2 px-4">Price</th>
                    <th className="py-2 px-4">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="py-2 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.some(
                            (p) => p.id === product.id
                          )}
                          onChange={() => toggleSelectProduct(product)}
                        />
                      </td>
                      <td className="py-2 px-4">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="py-2 px-4">{product.title}</td>
                      <td className="py-2 px-4">{product.stock}</td>
                      <td className="py-2 px-4 font-bold text-green-600">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          min="1"
                          value={
                            selectedProducts.find((p) => p.id === product.id)
                              ?.quantity || 1
                          }
                          onChange={(e) =>
                            updateQuantity(product.id, Number(e.target.value))
                          }
                          className="border px-2 py-1 w-16 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2"
                onClick={() => setShowProducts(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={() => setShowProducts(false)}
              >
                Add Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;
