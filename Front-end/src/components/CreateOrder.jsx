import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [markets, setMarkets] = useState(["India (INR ₹)", "USA (USD $)", "Europe (EUR €)"]);
  const [selectedMarket, setSelectedMarket] = useState("India (INR ₹)");
  const [isMarketEditing, setIsMarketEditing] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  useEffect(() => {
    const calculatedSubtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
    setSubtotal(calculatedSubtotal);
    setTotal(calculatedSubtotal - discount + shipping);
  }, [selectedProducts, discount, shipping]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products");
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get("/api/customers");
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProducts([...selectedProducts, product]);
  };

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        line_items: selectedProducts.map((p) => ({ product_id: p.id, quantity: 1 })),
        customer: selectedCustomer ? { id: selectedCustomer.id } : null,
        note: notes,
        tags: tags,
      };
      await axios.post("/api/orders", orderData);
      alert("Order created successfully!");
      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Create Order</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Products</h3>
          <input type="text" placeholder="Search products" className="border p-2 w-full mb-2" />
          <button 
            className="bg-gray-200 px-3 py-1 rounded mr-2"
            onClick={() => setIsProductModalOpen(true)}
          >
            Browse
          </button>
          <button className="bg-gray-200 px-3 py-1 rounded">Add custom item</button>
          <div className="mt-4">
            {selectedProducts.length > 0 ? (
              selectedProducts.map((p, index) => (
                <p key={index} className="text-sm">{p.title} - ₹{p.price}</p>
              ))
            ) : (
              <p className="text-gray-500">Add a product to calculate total</p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <textarea className="border p-2 w-full" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Payment</h3>
          <p className="text-sm">Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p className="text-sm">Discount: ₹{discount.toFixed(2)}</p>
          <p className="text-sm">Shipping: ₹{shipping.toFixed(2)}</p>
          <h4 className="text-lg font-semibold mt-2">Total: ₹{total.toFixed(2)}</h4>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Customer</h3>
          <input type="text" placeholder="Search or create a customer" className="border p-2 w-full" />
        </div>

        <div className="bg-white p-4 rounded-lg shadow relative">
          <h3 className="text-lg font-semibold mb-2">Market</h3>
          {!isMarketEditing ? (
            <div className="flex justify-between items-center">
              <p className="text-sm">{selectedMarket}</p>
              <button onClick={() => setIsMarketEditing(true)} className="text-blue-500 text-sm">Edit</button>
            </div>
          ) : (
            <select className="border p-2 w-full" value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)} onBlur={() => setIsMarketEditing(false)}>
              {markets.map((market, index) => (
                <option key={index} value={market}>{market}</option>
              ))}
            </select>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tags</h3>
          <input type="text" placeholder="Tags" className="border p-2 w-full" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleCreateOrder} className="bg-green-500 text-white px-6 py-2 rounded-lg">Create Order</button>
      </div>

      {/* Product Browse Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h3 className="text-lg font-semibold mb-4">Select Products</h3>
            <div className="max-h-60 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="flex justify-between items-center border-b p-2">
                  <span>{product.title} - ₹{product.price}</span>
                  <button 
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => handleProductSelect(product)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsProductModalOpen(false)} className="mt-4 bg-gray-300 px-4 py-2 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
