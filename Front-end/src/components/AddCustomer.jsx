import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TagModal from "./TagModal";
import AddressModal from "./AddressModal";


const AddCustomer = () => {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState([]); // Selected tags
  const [showTagModal, setShowTagModal] = useState(false); // Modal state

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    language: "English [Default]",
    email: "",
    phone: "",
    notes: "",
    tags: "",
    address: "",
    taxSettings: "Collect tax",
  });
   
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [address, setAddress] = useState({
    country: "India",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
  });
  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const countryNames = response.data.map((country) => country.name.common).sort();
        setCountries(countryNames);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!address.country) return;
    
    const fetchStates = async () => {
      try {
        const response = await axios.post("https://countriesnow.space/api/v0.1/countries/states", {
          country: address.country,
        });
        setStates(response.data.data.states.map((state) => state.name));
        setCities([]); // Reset cities when country changes
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, [address.country]);

  useEffect(() => {
    if (!address.state) return;

    const fetchCities = async () => {
      try {
        const response = await axios.post("https://countriesnow.space/api/v0.1/countries/state/cities", {
          country: address.country,
          state: address.state,
        });
        setCities(response.data.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, [address.state]);



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  }; 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newCustomer = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
    };
  
    console.log("📤 Sending request:", newCustomer);
  
    try {
      const response = await axios.post("http://localhost:5000/api/customers", newCustomer, {
        headers: { "Content-Type": "application/json" },
      });
  
      console.log("✅ Customer added:", response.data);
  
      // Extract the full Shopify customer ID
      const fullCustomerId = response.data.customer?.id; // e.g., gid://shopify/Customer/123456789
      if (!fullCustomerId) {
        console.error("❌ Error: Customer ID is missing from API response");
        return;
      }
  
      // Extract the numeric ID (last part of the Shopify Global ID)
      const extractCustomerId = (globalId) => globalId.split("/").pop();
      const customerId = extractCustomerId(fullCustomerId);
  
      console.log("✅ Extracted Customer ID:", customerId); // Debug log
  
      // Redirect to the Customer Details page
      navigate(`/customers/${customerId}`); // Use numeric ID in the URL
  
    } catch (error) {
      console.error("❌ Error adding customer:", error.response?.data || error.message);
    }
  };
  
  
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">New Customer</h2>
        <div>
          <button onClick={() => navigate("/customers")} className="bg-gray-300 px-4 py-2 rounded mr-2">
            Discard
          </button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="col-span-2 space-y-4">
          {/* Customer Overview */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Customer Overview</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select name="language" value={formData.language} onChange={handleChange} className="w-full border p-2 rounded mt-1">
                <option>English [Default]</option>
              </select>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
            </div>
          </div>

          {/* Default Address */}
          <div className="bg-white p-4 rounded-lg shadow">
  <h3 className="text-lg font-semibold mb-3">Default Address</h3>

  {formData.address && formData.address.address ? (
    <div className="border p-3 rounded-lg">
      <p><strong>{formData.address.firstName} {formData.address.lastName}</strong></p>
      <p>{formData.address.company}</p>
      <p>{formData.address.address}, {formData.address.apartment}</p>
      <p>{formData.address.city}, {formData.address.state} - {formData.address.pincode}</p>
      <p>{formData.address.country}</p>
      <p><strong>Phone:</strong> {formData.address.phone}</p>

      <button
        onClick={() => setShowAddressModal(true)}
        className="mt-2 text-blue-600 hover:underline"
      >
        Edit Address
      </button>
    </div>
  ) : (
    <button
      onClick={() => setShowAddressModal(true)}
      className="bg-gray-100 text-gray-700 px-4 py-2 rounded border w-full text-left"
    >
      + Add address
    </button>
  )}
</div>


          {/* Tax Settings */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Tax Settings</h3>
            <label className="block text-sm font-medium text-gray-700">Tax Collection</label>
            <select name="taxSettings" value={formData.taxSettings} onChange={handleChange} className="w-full border p-2 rounded mt-1">
              <option>Collect tax</option>
              <option>Don't collect tax</option>
              <option>Collect tax unless exemptions apply</option>
            </select>
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-4">
          {/* Notes */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Notes</h3>
            <label className="block text-sm font-medium text-gray-700">Customer Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full border p-2 rounded h-24 mt-1" placeholder="Notes are private and won’t be shared with the customer."></textarea>
          </div>

          {/* Tags */}
          <label className="block text-sm font-medium text-gray-700">Tags</label>
      <div className="flex items-center border p-2 rounded mt-1">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <span key={tag} className="bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2">
              {tag}
            </span>
          ))
        ) : (
          <span className="text-gray-500">No tags added</span>
        )}

        {/* Edit Button */}
        <button
          onClick={() => setShowTagModal(true)}
          className="ml-2 text-blue-500 hover:underline"
        >
          Edit
        </button>
      </div>
        </div>
      </div>
       {/* Tag Modal (Reused Component) */}
       {showTagModal && (
        <TagModal
          isOpen={showTagModal}
          onClose={() => setShowTagModal(false)}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
      )}
      
      <AddressModal
  isOpen={showAddressModal}
  onClose={() => setShowAddressModal(false)}
  onSave={(updatedAddress) => {
    setFormData({ ...formData, address: updatedAddress });
    setShowAddressModal(false);
  }}
  initialAddress={address}
/>

    </div>
  );
};

export default AddCustomer;
