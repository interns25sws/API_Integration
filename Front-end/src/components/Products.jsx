import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/shopify/graphql"; // Backend URL

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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
        { withCredentials: true }
      );

      const fetchedProducts = response.data.data.products.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        description: node.description,
        image: node.images.edges[0]?.node.originalSrc || "https://via.placeholder.com/150",
        price: node.variants.edges[0]?.node.price || "N/A",
      }));

      setProducts(fetchedProducts);
      saveProductsToDB(fetchedProducts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const saveProductsToDB = async (products) => {
    try {
      await axios.post("http://localhost:5000/api/products/save", { products });
      console.log("Products saved to DB successfully!");
    } catch (err) {
      console.error("Error saving products to DB:", err);
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error fetching products: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Shopify Products</h2>

      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left">Image</th>
            <th className="py-2 px-4 text-left">Title</th>
            <th className="py-2 px-4 text-left">Description</th>
            <th className="py-2 px-4 text-left">Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="py-2 px-4">
                <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded" />
              </td>
              <td className="py-2 px-4">{product.title}</td>
              <td className="py-2 px-4">{product.description}</td>
              <td className="py-2 px-4 font-bold text-green-600">${product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;


// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const API_URL = "http://localhost:5000/api/shopify/graphql"; // Backend URL

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await axios.post(
//           API_URL,
//           {
//             query: `
//               {
//                 products(first: 10) {
//                   edges {
//                     node {
//                       id
//                       title
//                       description
//                       images(first: 1) {
//                         edges {
//                           node {
//                             originalSrc
//                           }
//                         }
//                       }
//                       variants(first: 1) {
//                         edges {
//                           node {
//                             price
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             `,
//           },
//           { withCredentials: true } // Ensures cookies & authentication are sent
//         );

//         setProducts(response.data.data.products.edges);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   if (loading) return <p>Loading products...</p>;
//   if (error) return <p>Error fetching products: {error}</p>;

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <h2 className="text-2xl font-semibold mb-6 text-center">Shopify Products</h2>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {products.map(({ node }) => (
//           <div 
//             key={node.id} 
//             className="bg-white shadow-md rounded-lg p-4 transition-transform transform hover:scale-105"
//           >
//             <img
//               src={node.images.edges[0]?.node.originalSrc || "https://via.placeholder.com/150"}
//               alt={node.title}
//               className="w-full h-40 object-cover rounded-lg"
//             />
//             <h3 className="text-lg font-semibold mt-3">{node.title}</h3>
//             <p className="text-gray-600 text-sm truncate">{node.description}</p>
//             <p className="mt-2 font-bold text-green-600">${node.variants.edges[0]?.node.price}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }  

// export default Products;
