import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductSelector from "../components/ProductSelector"; // Product Selector Component
import CustomItemModal from "../components/CustomItemModal"; // Custom Item Modal Component
import ProductList from "../components/ProductList"; // New ProductList Component
import PaymentSummary from "../components/PaymentSummary"; // New PaymentSummary Component
import CustomerSection from "../components/CustomerSection"; // New CustomerSection Component
import TagSection from "../components/TagSection"; // New TagSection Component

const API_URL = "http://localhost:5000/api/shopify/graphql";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId"); // Get customerId from URL
  // const [tax, setTax] = useState(0);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("India (INR ₹)");
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // ✅ Ensure isLocked is defined
  const [bulkDiscount, setBulkDiscount] = useState(0);


  useEffect(() => {
    if (isProductModalOpen) {
      fetchProducts();
    }
  }, [isProductModalOpen]);

  // useEffect(() => {
  //   fetchOrders();
  // }, []);
  useEffect(() => {
    const totalQuantity = selectedProducts.reduce((sum, product) => sum + (product.quantity || 1), 0);
  
    if (totalQuantity >= 5) { // Fetch discount only if 5+ products
      fetchBulkDiscount(totalQuantity);
    } else {
      setBulkDiscount(0); // Reset if below threshold
    }
  }, [selectedProducts]);
  
  const fetchBulkDiscount = async (quantity) => {
    try {
      const response = await fetch(`http://localhost:5000/api/discounts/discounts-by-quantity?quantity=${quantity}`);
      const data = await response.json();
      setBulkDiscount(data.discountPercent || 0);
    } catch (error) {
      console.error("❌ Error fetching bulk discount:", error);
    }
  };
 // Calculate subtotal
 useEffect(() => {
  if (!selectedProducts.length) {
    setSubtotal(0);
    // setTax(0);
    setTotal(0);
    return;
  }

  let sum = selectedProducts.reduce((acc, product) => {
    return acc + (parseFloat(product.price) || 0) * (product.quantity || 1);
  }, 0);

  setSubtotal(sum);
}, [selectedProducts]);

// Apply discount and calculate total
useEffect(() => {
  if (!subtotal) {
    setTotal(0);
    return;
  }

  let totalAmount = subtotal; // Start with subtotal

  // Apply tag discount
  if (discount && discount > 0) {
    totalAmount -= discount;
  }

  // Apply bulk discount
  if (bulkDiscount > 0) {
    const bulkDiscountAmount = (totalAmount * bulkDiscount) / 100;
    totalAmount -= bulkDiscountAmount;
    console.log(`📢 Bulk Discount Applied: ₹${bulkDiscountAmount} (${bulkDiscount}%)`);
  }

  // Prevent negative values
  totalAmount = Math.max(0, totalAmount);

  // // Recalculate tax (9% on the new total)
  // const taxRate = 0.09;
  // const newTax = totalAmount * taxRate;

  // setTax(newTax);
  setTotal(totalAmount  + shipping);
}, [subtotal, discount, bulkDiscount, shipping]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      if (response.data && response.data.products) {
        const productsList = response.data.products.edges.map((edge) => edge.node);
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  // const fetchOrders = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/api/orders/fetch-orders-direct", {
  //       method: "GET",
  //       headers: {
  //         "Authorization": `Bearer ${localStorage.getItem("token")}`, // Ensure the token is stored in localStorage
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log("✅ Orders fetched:", data);
  //   } catch (error) {
  //     console.error("❌ Error fetching orders:", error.message);
  //   }
  // };

  const handleProductSelect = (newProducts) => {
    setSelectedProducts((prevProducts) => {
      const uniqueProducts = [...prevProducts, ...newProducts].filter(
        (p, index, self) => index === self.findIndex((item) => item.id === p.id)
      );
      return uniqueProducts;
    });
  };

  const handleAddCustomItem = (customItem) => {
    setSelectedProducts((prevProducts) => [...prevProducts, customItem]);
    setIsCustomItemModalOpen(false);
  };

 

  const handleUpdateQuantity = (productId, newQuantity) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: Math.max(1, newQuantity) }
          : product
      )
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
  };

 
  const applyTagDiscount = async (tag, isRemoving = false) => {
    if (isRemoving) {
      setDiscount(0); // ❌ Remove discount when tag is removed
      console.log(`🗑️ Tag "${tag}" removed. Discount reset.`);
      return;
    }
  
    try {
      const url = `http://localhost:5000/api/discounts/discounts-by-tag?tag=${tag}`;
      console.log("🔎 Fetching discount from:", url);
  
      const response = await fetch(url);
      const text = await response.text();
      console.log("📝 Raw API Response:", text);
  
      const data = JSON.parse(text);
      console.log("✅ Parsed Discount Data:", data);
  
      if (data && data.discountPercent !== undefined) {
        const discountPercentage = Number(data.discountPercent);
        const calculatedDiscount = (subtotal * discountPercentage) / 100;
  
        setDiscount(calculatedDiscount);
        console.log(`✅ Discount Applied: ₹${calculatedDiscount} (${discountPercentage}%)`);
      } else {
        console.warn("⚠️ No discount found for this tag");
        setDiscount(0);
      }
    } catch (error) {
      console.error("❌ Error fetching discount:", error);
      setDiscount(0);
    }
  };
  useEffect(() => {
    console.log("🔎 Extracted customerId from URL:", customerId);
    if (customerId && customerId !== "search") {
      fetchCustomer(customerId);
    }
  }, [customerId]);
  
  // Fetch Customer Data when a customerId is provided
  const fetchCustomer = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
      setSelectedCustomer(response.data);
      setSearchTerm(response.data.email); // Autofill email in input
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };
  const fetchCustomers = async (query) => {
    if (!query) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/customers/search?query=${query}`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    fetchCustomers(value);
  };

  const handleSelectCustomer = (customer) => {
    console.log("✅ Customer Selected:", customer);
    setSearchTerm(`${customer.firstName} ${customer.lastName}`);
    setShowDropdown(false);
    setSelectedCustomer(customer); // Make sure selectedCustomer is updated
  };
  
  
  const handleCreateOrder = async () => {
    // Ensure products are selected before proceeding
    if (!selectedProducts.length) {
      alert("Please add at least one product.");
      return;
    }
  
    // Set loading state
    setLoading(true);
  
    try {
      console.log("🔥 Selected Products:", selectedProducts); // Log selected products for debugging
      console.log("🛒 Selected Customer before order:", selectedCustomer);

      // Prepare order data
      const orderData = {
        line_items: selectedProducts.map((p) => ({
          variant_id: p.variant_id || null,
          title: p.title,
          price: parseFloat(p.price) || 0,
          quantity: p.quantity || 1,
        })),
        // Ensure customer is selected and shopifyId is properly extracted
        customer: selectedCustomer?.shopifyId 
        ? { id: selectedCustomer.shopifyId } 
        : selectedCustomer?.id?.startsWith("gid://shopify/Customer/") 
          ? { id: selectedCustomer.id } 
          : null,
      
       // If no customer, set as null
        tags: tags.join(", "), // Join tags into a string if necessary
        total_price: total, // Ensure `total` is calculated correctly
      };
  
      console.log("🚀 Sending Order Data:", orderData); // Log order data for debugging
  
      // Make the request to create the order
      const response = await fetch("http://localhost:5000/api/orders/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
  
      // Parse the response data
      const responseData = await response.json();
  
      // Check for errors
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create order");
      }
  
      alert("🎉 Order created successfully!");
  
      // Reset the form after successful order creation
      setSelectedProducts([]);
      setDiscount(0);
      setNotes("");
      setTags([]);
      setSelectedCustomer(null); // Reset customer after order
      setSearchTerm(""); // Clear search field
      
      navigate("/orders"); // Change this to your actual order page route

    } catch (error) {
      console.error("❌ Error creating order:", error);
      alert("Failed to create order. Check console for details.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="m-5 p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Create Order</h2>
        <div>
          <button onClick={() => navigate("/orders")} className="bg-gray-300 px-4 py-2 rounded mr-2">Discard</button>
          <button onClick={handleCreateOrder} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {/* Left Side: Products & Payment */}
        <div className="col-span-2 space-y-4">
          {/* Products Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Products</h3>
            <ProductSelector
              buttonType="browse"
              onSelect={handleProductSelect}
              isOpen={isProductModalOpen}
              onClose={() => setIsProductModalOpen(false)}
            />
            {loading && <p>Loading products...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            <button onClick={() => setIsCustomItemModalOpen(true)} className="bg-gray-200 px-4 py-2 rounded mt-2">Add Custom Item</button>
            <ProductList selectedProducts={selectedProducts} handleUpdateQuantity={handleUpdateQuantity} handleRemoveProduct={handleRemoveProduct} />
          </div>

          {/* Payment Summary */}

          <PaymentSummary bulkDiscount={bulkDiscount} subtotal={subtotal} discount={discount} shipping={shipping}  total={total} selectedProducts={selectedProducts} />
          
        </div>

        {/* Right Side: Notes, Customers, Market & Tags */}
        <div className="space-y-4">
          {/* Notes Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-900 font-medium">{discount ? `Discount: ₹${discount}` : "No discount code yet"}</h3>
            <textarea className="border p-2 w-full" placeholder="Add any additional notes or instructions." rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

        {/* Customer Selection */}
        <CustomerSection
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}  // ✅ Pass function correctly
  showDropdown={showDropdown}
  setShowDropdown={setShowDropdown} // ✅ Pass function correctly
  handleSelectCustomer={handleSelectCustomer}
  selectedCustomer={selectedCustomer}
  isLocked={isLocked}
/>

{/* Show selected customer */}
{selectedCustomer && (
  <div className="mt-2 p-2 border">
    <p><strong>Selected:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
    <p><strong>Email:</strong> {selectedCustomer.email}</p>
  </div>
)}

          {/* Market Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Market</h3>
            <select className="border p-2 w-full" value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)}>
              <option value="India (INR ₹)">India (INR ₹)</option>
              <option value="USA (USD $)">USA (USD $)</option>
              <option value="UK (GBP £)">UK (GBP £)</option>
              <option value="Europe (EUR €)">Europe (EUR €)</option>
            </select>
          </div>

          {/* Tags Section */}
          <TagSection tags={tags} setTags={setTags} applyTagDiscount={applyTagDiscount} />
        </div>
      </div>
       {/* Custom Item Modal */}
       {isCustomItemModalOpen && (
        <CustomItemModal
          onClose={() => setIsCustomItemModalOpen(false)}
          onAddItem={handleAddCustomItem}
        />
      )}

      
    </div>
  );
};
export default CreateOrder;