import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TagModal from "./TagModal";
import AddressModal from "./AddressModal";

const AddCustomer = () => {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    language: "English [Default]",
    email: "",
    phone: "",
    notes: "",
    tags: "",
    taxSettings: "Collect tax",
    address: null,
  });

 

  // Handle input change for form fields
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔍 Raw Address Data:", JSON.stringify(formData.address, null, 2));

    const formattedAddress = formData.address
      ? {
          firstName: formData.address.firstName?.trim() || "",
          lastName: formData.address.lastName?.trim() || "",
          company: formData.address.company?.trim() || "",
          address1: formData.address.address?.trim() || "",
          city: formData.address.city?.trim() || "",
          province: formData.address.state?.trim() || "",
          zip: formData.address.pinCode?.trim() || formData.address.pincode?.trim() || "",
          country: formData.address.country?.trim() || "",
          phone: formData.address.phone?.trim() || "",
        }
      : null;

    console.log("📌 Cleaned Address:", JSON.stringify(formattedAddress, null, 2));

    const isValidAddress = formattedAddress && Object.values(formattedAddress).some((value) => value !== "");
    const filteredAddresses = isValidAddress ? [formattedAddress] : [];

    if (filteredAddresses.length === 0) {
      console.warn("⚠️ No valid address found, skipping address field");
    }
    const newCustomer = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      notes: formData.notes.trim(),
      taxSettings: formData.taxSettings,
      tags: selectedTags,
      addresses: filteredAddresses, 
    };

    console.log("📤 Sending request:", JSON.stringify(newCustomer, null, 2));

    try {
      const response = await axios.post("http://localhost:5000/api/customers", newCustomer, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Customer added:", response.data);

      const fullCustomerId = response.data.customer?.id;
      if (!fullCustomerId) {
        console.error("❌ Error: Customer ID is missing from API response");
        return;
      }

      const customerId = fullCustomerId.split("/").pop();
      console.log("✅ Extracted Customer ID:", customerId);

      navigate(`/customers/${customerId}`);
    } catch (error) {
      console.error("❌ Error adding customer:", error.response?.data || error.message);

      if (error.response?.data?.errors) {
        alert(error.response.data.errors.map((err) => `${err.field}: ${err.message}`).join("\n"));
      } else {
        alert("Failed to create customer");
      }
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
  initialAddress={formData.address}
/>

    </div>
  );
};

export default AddCustomer;
