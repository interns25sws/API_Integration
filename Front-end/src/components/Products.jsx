import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";


const API_URL = "http://localhost:5000/api/shopify/graphql"; // Backend URL

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [nextCursor, setNextCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Set page size

  useEffect(() => {
    fetchProducts(null);
  }, []);

  const fetchProducts = async (cursor) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/products/fetch", {
        limit,
        cursor,
      });
  
      const { products, nextCursor, hasNextPage } = response.data;
  
      setProducts(products);
      setNextCursor(nextCursor);
      setHasNextPage(hasNextPage);
  
      if (cursor) {
        setCursorHistory((prev) => [...prev, cursor]);
      }
  
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  const extractShopifyId = (shopifyId) => shopifyId.replace("gid://shopify/Product/", "");

 // ✅ Delete Product
 const handleDelete = async (productId) => {
  if (!productId) {
    console.error("❌ Invalid product ID received in handleDelete:", productId);
    alert("Invalid product ID!");
    return;
  }

  if (!window.confirm("Are you sure you want to delete this product?")) return;

  console.log("🛠️ Deleting Product ID:", productId);
  
  const shopifyProductId = extractShopifyId(productId);
  if (!shopifyProductId) {
    alert("❌ Invalid Shopify product ID!");
    return;
  }

  try {
    const response = await axios.delete(`http://localhost:5000/api/products/${shopifyProductId}`);

    if (response.data.success) {
      setProducts(products.filter(product => extractShopifyId(product.shopifyId) !== shopifyProductId));
      alert("✅ Product deleted successfully!");
    } else {
      alert(response.data.error || "Failed to delete product.");
    }
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    alert("Failed to delete product. Try again later.");
  }
};


// ✅ Handle Edit Input Change
const handleEditChange = (e) => {
  setEditProduct((prevEdit) => ({
    ...prevEdit,
    [e.target.name]: e.target.value,
  }));
};

// ✅ Save Edited Product
const saveEditProduct = async () => {
  if (!editProduct || !editProduct.id) {
    console.error("❌ No product selected for update");
    return;
  }

  const productId = editProduct.id.split("/").pop(); // Extract numeric Shopify ID

  try {
    const response = await axios.put(
      `http://localhost:5000/api/products/update/${productId}`,
      {
        title: editProduct.title,
        description: editProduct.description,
      }
    );

    if (response.data.success) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === editProduct.id ? response.data.updatedProduct : product
        )
      );

      console.log(`✅ Product with ID ${productId} updated successfully`);
      setEditProduct(null);
    } else {
      console.error("❌ Error updating product:", response.data.errors);
      alert("Failed to update product. Please check input values.");
    }
  } catch (err) {
    console.error("❌ Error updating product:", err.response?.data || err.message);
    alert("An error occurred while updating the product.");
  }
};

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const goToPage = (page, cursor) => {
    setCurrentPage(page);
    fetchProducts(cursor);
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error fetching products: {error}</p>;

  return (
    <div className="w-full mx-auto p-6">
<div className="flex justify-between items-center w-[95%] mx-auto mb-4">
        <h2 className="text-2xl font-bold">Shopify products</h2>
        <button
          onClick={() => navigate("/add-products")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Products
        </button>
      </div>
      <table className="w-[95%] mx-auto mt-4 rounded-lg h-3/4 bg-white border">
        <thead>
          <tr className="bg-white border border-black">
            <th className="border px-4 py-2">Image</th>
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="border px-4 py-2">
                <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded" />
              </td>
              <td className="border py-2 px-4">{product.title}</td>
              <td className="border py-2 px-4">
                {expandedDescriptions[product.id]
                  ? product.description
                  : `${product.description.substring(0, 50)}...`}
                {product.description.length > 50 && (
                  <button
                    onClick={() => toggleDescription(product.id)}
                    className="text-blue-500 ml-2 hover:underline"
                  >
                    {expandedDescriptions[product.id] ? "Show Less" : "View More"}
                  </button>
                )}
              </td>
              <td className="border py-2 px-4 font-bold text-green-600">${product.price}</td>
              <td className="p-2 flex justify-center mt-5 space-x-2">
                <button onClick={() => setSelectedProduct(product)} className="text-gray-500 hover:text-gray-700">
                  <FaEye />
                </button>
                <button onClick={() => setEditProduct(product)} className="text-blue-500 hover:text-blue-700">
                  <FaEdit />
                </button>
                <button
  onClick={() => {
    console.log("🛠️ Clicked Product ID:", product.shopifyId);
    handleDelete(product.shopifyId);
  }}
  className="text-red-500 hover:text-red-700"
>
  <FaTrash />
</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center items-center gap-4 mt-4">
        {/* First Page Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => goToPage(1, null)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          First Page
        </button>

        {/* Previous Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1, cursorHistory[cursorHistory.length - 2] || null)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>Page {currentPage}</span>

        {/* Next Button */}
        <button
          disabled={!hasNextPage}
          onClick={() => goToPage(currentPage + 1, nextCursor)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">{selectedProduct.title}</h2>
            <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-55 object-cover rounded mb-3" />
            <p className="text-gray-700">{selectedProduct.description}</p>
            <p className="text-green-600 font-bold mt-2">Price: ${selectedProduct.price}</p>
            <p className="text-gray-600">Stock: {selectedProduct.stock}</p>
            <p className="text-gray-500">Created: {selectedProduct.createdAt}</p>
            <button
              onClick={() => setSelectedProduct(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {editProduct && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Edit Product</h2>
      <input
        type="text"
        name="title"
        value={editProduct.title}
        onChange={handleEditChange}
        className="w-full p-2 border rounded mb-2"
        placeholder="Product Title"
      />
      <textarea
        name="description"
        value={editProduct.description}
        onChange={handleEditChange}
        className="w-full p-2 border rounded mb-2"
        placeholder="Product Description"
      />
      <button
        onClick={saveEditProduct}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
      >
        Save
      </button>
      <button
        onClick={() => setEditProduct(null)}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Cancel
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default Products;
