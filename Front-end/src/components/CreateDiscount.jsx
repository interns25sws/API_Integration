import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

const discountTypes = [
  "Tag-Based Discount",
  "Bulk Discount", // ✅ Added Bulk Discount Option
  "Time-Sensitive Discount",
  "Loyalty Discount",
  "First Order Discount",
  "Seasonal Discount",
  "Buy X Get Y Discount",
];

const discountValueTypes = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
];

export default function CreateDiscount() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [selectedType, setSelectedType] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // Default to percentage
  const [savedDiscounts, setSavedDiscounts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Fetch user tags from the backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/user/tags")
      .then((response) => {
        console.log("📥 Tags from Backend:", response.data);
        const tagOptions = response.data.map((tag) => ({
          value: tag,
          label: tag,
        }));
        setTags(tagOptions);
        setLoadingTags(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching tags:", error);
        setLoadingTags(false);
      });
  }, []);

  const onSubmit = async (data) => {
    console.log("🔥 Saving Discount Data:", data); 
    // Ensure selectedTags is always an array
    const selectedTags = Array.isArray(data.selectedTags) ? data.selectedTags : [];
  
    // Validate Tag-Based Discount
    if (selectedType === "Tag-Based Discount" && selectedTags.length === 0) {
      alert("Please select at least one tag.");
      return;
    }
  
    // Validate Bulk Discount
    const minQuantity = Number(data.minQuantity);
    if (selectedType === "Bulk Discount" && (!minQuantity || minQuantity <= 1)) {
      alert("Minimum quantity for bulk discounts must be greater than 1.");
      return;
    }
  
    // Construct request payload dynamically
    const discountPayload = {
      type: selectedType,
      discountType: discountType,
      discountValue: Number(data.discountValue),
      ...(selectedType === "Tag-Based Discount" && { selectedTags }),
      ...(selectedType === "Bulk Discount" && { minQuantity }),
    };
  
    console.log("📤 Sending Payload:", discountPayload); // Debugging Log
  
    try {
      const response = await fetch("http://localhost:5000/api/discounts/save-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discountPayload),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        alert(result.error || "Error saving discount");
        console.error("❌ Backend Error:", result);
        return;
      }
  
      console.log("✅ Server Response:", result);
  
      // Update saved discounts list
      setSavedDiscounts((prevDiscounts) => [
        ...prevDiscounts,
        {
          id: Date.now(),
          type: selectedType,
          discountType: discountType,
          discountValue: data.discountValue,
          tags: selectedType === "Tag-Based Discount" ? selectedTags : undefined,
          minQuantity: selectedType === "Bulk Discount" ? minQuantity : undefined,
        },
      ]);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  
  const handleTagChange = (selectedOptions) => {
    const selectedTags = selectedOptions.map((option) => option.value);
    setValue("selectedTags", selectedTags);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Create Discount</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-lg shadow-md"
      >
        {/* Discount Type Selection */}
        <div>
          <label className="block font-medium mb-1">Discount Type</label>
          <select
            {...register("type")}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Discount Type</option>
            {discountTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Selection (Only for Tag-Based Discount) */}
        {selectedType === "Tag-Based Discount" && (
  <div>
    <label className="block font-medium mb-1">Applicable Tags</label>
    {loadingTags ? (
      <p>Loading tags...</p>
    ) : (
      <CreatableSelect
        isMulti
        options={tags}
        onChange={handleTagChange}
        className="w-full border rounded"
        placeholder="Select or enter new tags"
      />
    )}
  </div>
)}


        {/* Minimum Quantity Input (Only for Bulk Discount) */}
        {selectedType === "Bulk Discount" && (
          <div>
            <label className="block font-medium mb-1">Minimum Quantity for Bulk Discount</label>
            <input
              type="number"
              placeholder="Enter minimum quantity"
              {...register("minQuantity")}
              className="w-full p-2 border rounded"
              min="2" // Ensure it's greater than 1
            />
          </div>
        )}

        {/* Discount Type (Percentage or Fixed) */}
        <div>
          <label className="block font-medium mb-1">Discount Value Type</label>
          <select
            {...register("discountType")}
            onChange={(e) => setDiscountType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {discountValueTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Discount Value Input */}
        <div>
          <label className="block font-medium mb-1">
            {discountType === "percentage" ? "Discount Percentage (%)" : "Fixed Discount Amount"}
          </label>
          <input
            type="number"
            placeholder={discountType === "percentage" ? "Enter % discount" : "Enter fixed amount"}
            {...register("discountValue")}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Save Discount
        </button>
      </form>

      {/* Display Saved Discounts */}
      {savedDiscounts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">Saved Discounts</h2>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Type</th>
                <th className="border p-2">Tags</th>
                <th className="border p-2">Min Qty</th>
                <th className="border p-2">Discount Type</th>
                <th className="border p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {savedDiscounts.map((discount) => (
                <tr key={discount.id} className="border">
                  <td className="border p-2">{discount.type}</td>
                  <td className="border p-2">{discount.tags?.join(", ") || "N/A"}</td>
                  <td className="border p-2">{discount.minQuantity || "-"}</td>
                  <td className="border p-2">{discount.discountType}</td>
                  <td className="border p-2">{discount.discountType === "percentage" ? `${discount.discountValue}%` : `$${discount.discountValue}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
