// import { useState } from "react";
// import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

// const Products = () => {
//   const [products, setProducts] = useState([
//     {
//       _id: 1,
//       name: "Black T-shirt",
//       price: "80",
//       stock: "456",
//       category: "Fashion",
//       rating: "4.4",
//       reviews: "55",
//       image: "https://via.placeholder.com/50",
//     },
//     {
//       _id: 2,
//       name: "Blue Jeans",
//       price: "120",
//       stock: "120",
//       category: "Fashion",
//       rating: "4.6",
//       reviews: "30",
//       image: "https://via.placeholder.com/50",
//     },
//     {
//       _id: 3,
//       name: "Sneakers",
//       price: "150",
//       stock: "89",
//       category: "Footwear",
//       rating: "4.7",
//       reviews: "40",
//       image: "https://via.placeholder.com/50",
//     },
//   ]);

//   // State for selected product IDs
//   const [selectedProducts, setSelectedProducts] = useState([]);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editProductData, setEditProductData] = useState({});
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [newProductData, setNewProductData] = useState({
//     name: "",
//     price: "",
//     stock: "",
//     category: "",
//     image: null,
//   });

//   // Handle checkbox selection
//   const toggleSelectProduct = (productId) => {
//     setSelectedProducts((prevSelected) =>
//       prevSelected.includes(productId)
//         ? prevSelected.filter((id) => id !== productId)
//         : [...prevSelected, productId]
//     );
//   };

//   // Handle delete action
//   const handleDelete = (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this product?");
//     if (confirmDelete) {
//       setProducts(products.filter((product) => product._id !== id));
//     }
//   };

//   // Handle edit action
//   const handleEdit = (product) => {
//     setEditProductData(product);
//     setIsEditModalOpen(true);
//   };

//   // Handle view action
//   const handleView = (product) => {
//     setSelectedProduct(product);
//     setIsViewModalOpen(true);
//   };

//   // Handle form input changes in edit modal
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditProductData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Save edited product
//   const handleSaveEdit = () => {
//     setProducts((prevProducts) =>
//       prevProducts.map((prod) =>
//         prod._id === editProductData._id ? editProductData : prod
//       )
//     );
//     setIsEditModalOpen(false);
//   };

//   // Handle form input changes in add modal
//   const handleAddInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewProductData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Handle image input change
//   const handleImageChange = (e) => {
//     setNewProductData((prev) => ({ ...prev, image: e.target.files[0] }));
//   };

//   // Save new product
//   const handleSaveAdd = () => {
//     const newProduct = {
//       ...newProductData,
//       _id: products.length + 1, // Generate a new ID
//       image: newProductData.image ? URL.createObjectURL(newProductData.image) : "https://via.placeholder.com/50", // Use the uploaded image or a placeholder
//     };
//     setProducts((prevProducts) => [...prevProducts, newProduct]);
//     setIsModalOpen(false);
//     setNewProductData({
//       name: "",
//       price: "",
//       stock: "",
//       category: "",
//       image: null,
//     });
//   };

//   return (
//     <div className="w-[95%] mx-auto mt-4 bg-gray-100 p-6 rounded-lg shadow-md">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold text-gray-700">📦 All Products</h2>
        
//         {/* Buttons */}
//         <div className="flex gap-3">
//           {/* Add Product Button */}
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
//           >
//             ➕ Add Product
//           </button>

//           {/* "This Month" Dropdown */}
//           <select className="border px-4 py-2 rounded-md">
//             <option>This Month</option>
//             <option>Last Month</option>
//             <option>Last 3 Months</option>
//           </select>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white rounded-lg shadow-md">
//           <thead>
//             <tr className="bg-gray-200 text-gray-700">
//               <th className="p-3 text-left">
//                 <input
//                   type="checkbox"
//                   onChange={(e) => setSelectedProducts(e.target.checked ? products.map((p) => p._id) : [])}
//                   checked={selectedProducts.length === products.length}
//                 />
//               </th>
//               <th className="p-3 text-left">Product</th>
//               <th className="p-3 text-left">Price</th>
//               <th className="p-3 text-left">Stock</th>
//               <th className="p-3 text-left">Category</th>
//               <th className="p-3 text-left">Rating</th>
//               <th className="p-3 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((product) => (
//               <tr key={product._id} className="border-b hover:bg-gray-100">
//                 <td className="p-3">
//                   <input
//                     type="checkbox"
//                     checked={selectedProducts.includes(product._id)}
//                     onChange={() => toggleSelectProduct(product._id)}
//                   />
//                 </td>
//                 <td className="p-3 flex items-center">
//                   <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md mr-3" />
//                   <span>{product.name}</span>
//                 </td>
//                 <td className="p-3">${product.price}</td>
//                 <td className="p-3">{product.stock} left</td>
//                 <td className="p-3">{product.category}</td>
//                 <td className="p-3">{product.rating} ⭐ ({product.reviews} reviews)</td>
//                 <td className="p-3 text-center">
//                   <button className="text-blue-500 hover:text-blue-700 mx-2" onClick={() => handleView(product)}>
//                     <FaEye />
//                   </button>
//                   <button className="text-green-500 hover:text-green-700 mx-2" onClick={() => handleEdit(product)}>
//                     <FaEdit />
//                   </button>
//                   <button className="text-red-500 hover:text-red-700 mx-2" onClick={() => handleDelete(product._id)}>
//                     <FaTrash />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* View Product Modal */}
//       {isViewModalOpen && selectedProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
//             <h2 className="text-lg font-semibold mb-4">{selectedProduct.name}</h2>
//             <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-40 object-cover mb-4 rounded-lg" />
//             <p><strong>Price:</strong> ${selectedProduct.price}</p>
//             <p><strong>Stock:</strong> {selectedProduct.stock} left</p>
//             <p><strong>Category:</strong> {selectedProduct.category}</p>
//             <p><strong>Rating:</strong> {selectedProduct.rating} ⭐ ({selectedProduct.reviews} reviews)</p>
//             <button
//               className="bg-gray-400 text-white px-4 py-2 rounded-md mt-4"
//               onClick={() => setIsViewModalOpen(false)}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Edit Product Modal */}
//       {isEditModalOpen && editProductData && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
//             <h2 className="text-lg font-semibold mb-4">Edit Product</h2>
//             <input
//               type="text"
//               name="name"
//               value={editProductData.name}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Product Name"
//             />
//             <input
//               type="text"
//               name="price"
//               value={editProductData.price}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Price"
//             />
//             <input
//               type="text"
//               name="stock"
//               value={editProductData.stock}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Stock"
//             />
//             <input
//               type="text"
//               name="category"
//               value={editProductData.category}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Category"
//             />
//             <button
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
//               onClick={handleSaveEdit}
//             >
//               Save Changes
//             </button>
//             <button
//               className="bg-gray-400 text-white px-4 py-2 rounded-md mt-2 ml-2"
//               onClick={() => setIsEditModalOpen(false)}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Add Product Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
//             <h2 className="text-lg font-semibold mb-4">Add Product</h2>
//             <input
//               type="text"
//               name="name"
//               value={newProductData.name}
//               onChange={handleAddInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Product Name"
//             />
//             <input
//               type="text"
//               name="price"
//               value={newProductData.price}
//               onChange={handleAddInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Price"
//             />
//             <input
//               type="text"
//               name="stock"
//               value={newProductData.stock}
//               onChange={handleAddInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Stock"
//             />
//             <input
//               type="text"
//               name="category"
//               value={newProductData.category}
//               onChange={handleAddInputChange}
//               className="w-full p-2 border rounded-md mb-2"
//               placeholder="Category"
//             />
//             <input
//               type="file"
//               name="image"
//               onChange={handleImageChange}
//               className="w-full p-2 border rounded-md mb-2"
//             />
//             <button
//               className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
//               onClick={handleSaveAdd}
//             >
//               Add Product
//             </button>
//             <button
//               className="bg-gray-400 text-white px-4 py-2 rounded-md mt-2 ml-2"
//               onClick={() => setIsModalOpen(false)}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Products;
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/shopify/graphql"; // Backend URL

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.post(
          API_URL,
          {
            query: `
              {
                products(first: 10) {
                  edges {
                    node {
                      id
                      title
                      description
                      images(first: 1) {
                        edges {
                          node {
                            originalSrc
                          }
                        }
                      }
                      variants(first: 1) {
                        edges {
                          node {
                            price
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
          },
          { withCredentials: true } // Ensures cookies & authentication are sent
        );

        setProducts(response.data.data.products.edges);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error fetching products: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Shopify Products</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(({ node }) => (
          <div 
            key={node.id} 
            className="bg-white shadow-md rounded-lg p-4 transition-transform transform hover:scale-105"
          >
            <img
              src={node.images.edges[0]?.node.originalSrc || "https://via.placeholder.com/150"}
              alt={node.title}
              className="w-full h-40 object-cover rounded-lg"
            />
            <h3 className="text-lg font-semibold mt-3">{node.title}</h3>
            <p className="text-gray-600 text-sm truncate">{node.description}</p>
            <p className="mt-2 font-bold text-green-600">${node.variants.edges[0]?.node.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}  

export default Products;
