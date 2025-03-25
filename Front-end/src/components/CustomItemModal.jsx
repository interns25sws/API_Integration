import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/shopify/graphql"; // Update with your backend URL

const CustomItemModal = ({ onClose, onAddItem }) => {
  const [itemName, setItemName] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isTaxable, setIsTaxable] = useState(true);
  const [isPhysical, setIsPhysical] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (itemName.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchProducts = async () => {
      if (itemName.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          "http://localhost:5000/api/shopify/graphql", // ✅ Fix: Use Backend Proxy Route
          {
            query: `
              {
                products(first: 10, query: "title:${itemName}") { 
                  edges { 
                    node { 
                      id 
                      title 
                      variants(first: 1) { 
                        edges { 
                          node { 
                            id   # ❌ Remove this comment in actual code
                            price
                          } 
                        } 
                      }
                    } 
                  } 
                }
              }
            `,
          }
        );

        console.log("✅ Shopify Response:", response.data);

        if (
          !response.data ||
          !response.data.data ||
          !response.data.data.products
        ) {
          throw new Error("Invalid Shopify response");
        }

        const products =
          response.data?.data?.products?.edges.map(({ node }) => ({
            id: node.id,
            title: node.title,
            variant_id: node.variants.edges[0]?.node.id || "", // ✅ Ensure `variant_id` exists
            price: parseFloat(node.variants.edges[0]?.node.price || "0.00"),
          })) || [];

        setSuggestions(products);
      } catch (err) {
        setError("Error fetching product suggestions. Try again.");
        console.error("❌ API Error:", err);
      }

      setLoading(false);
    };

    const debounceTimeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimeout);
  }, [itemName]);

  const handleSelectItem = (product) => {
    setItemName(product.title);
    setBasePrice(product.price);
    setPrice(product.price * quantity);
    setSuggestions([]);
  };

  const handleQuantityChange = (e) => {
    const newQuantity = Number(e.target.value);
    if (newQuantity < 1) return;

    setQuantity(newQuantity);
    setPrice(Number(basePrice) * Number(newQuantity));
  };

  const handleSubmit = () => {
    if (!itemName.trim()) {
      alert("Item name is required!");
      return;
    }

    const customItem = {
      id: Date.now(),
      title: itemName,
      price: Number(price) || 0, // Ensure price is never NaN

      quantity: Number(quantity),
      taxable: isTaxable,
      physical: isPhysical,
    };

    onAddItem(customItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Add Custom Item</h2>
        <label className="block mb-2">Item Name</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Search or enter item name..."
        />
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {suggestions.length > 0 && (
          <ul className="border mt-2 bg-white max-h-40 overflow-auto rounded-lg shadow-md">
            {suggestions.map((product) => (
              <li
                key={product.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectItem(product)}
              >
                {product.title} - ₹{product.price}
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 mt-2">
          <div className="flex-1">
            <label className="block">Price</label>
            <input
              type="number"
              className="border p-2 w-full bg-gray-100 cursor-not-allowed"
              value={price}
              readOnly
            />
          </div>
          <div className="flex-1">
            <label className="block">Quantity</label>
            <input
              type="number"
              className="border p-2 w-full"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isTaxable}
              onChange={(e) => setIsTaxable(e.target.checked)}
              className="mr-2"
            />
            Item is taxable
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPhysical}
              onChange={(e) => setIsPhysical(e.target.checked)}
              className="mr-2"
            />
            Item is a physical product
          </label>
        </div>
        <div className="mt-4 flex justify-between">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomItemModal;
