import { useEffect, useRef, useState } from "react";
import VariantModal from "./VariantModal";
import { useNavigate } from "react-router-dom"; // Import navigation
import axios from "axios";

export default function AddProductPage() {
  const navigate = useNavigate();
  const collectionRef = useRef(null);
  const tagRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showCollections, setShowCollections] = useState(false);
  const availableCollections = ["Home page", "Monsoon", "Spring", "Summer", "Top-collections", "Winter"];
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [variants, setVariants] = useState([]);
  const [productDetails, setProductDetails] = useState(null); // State to hold the product details
  const [category, setCategory] = useState("");
  const [trackQuantity, setTrackQuantity] = useState(false);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    function handleClickOutside(event) {
      if (collectionRef.current && !collectionRef.current.contains(event.target)) {
        setShowCollections(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCollection = (collection) => {
    setCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((c) => c !== collection)
        : [...prev, collection]
    );
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    const mediaFiles = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
      type: file.type.startsWith("video") ? "video" : "image"
    }));
    setMedia(prev => [...prev, ...mediaFiles]);
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    setFilteredTags(value ? [value] : []);
    setShowTagDropdown(value.length > 0);
  };

  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
    setShowTagDropdown(false);
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleDiscard = () => {
    navigate("/products"); // Redirect to product list page
  };

  const uploadImage = async (file) => {
    try {
      if (!file) {
        console.error("❌ Image Upload Error: No file provided");
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "shopify");

      console.log("🚀 Uploading file to Cloudinary:", file.name);

      const response = await fetch("https://api.cloudinary.com/v1_1/perfume/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Cloudinary Upload Error:", errorData);
        throw new Error(errorData.error?.message || "Image upload failed");
      }

      const data = await response.json();
      console.log("✅ Image Uploaded:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("❌ Image Upload Error:", error);
      return null;
    }
  };

  const updateVariant = (index, key, value) => {
    setVariants((prevVariants) =>
      prevVariants.map((variant, i) =>
        i === index ? { ...variant, [key]: value } : variant
      )
    );
  };

  const saveProduct = async () => {
    try {
      // ✅ Upload Images First
      const uploadedImages = await Promise.all(
        media.map(async (m) => {
          if (m.url.startsWith("blob:") && m.file) {
            return await uploadImage(m.file);
          }
          return m.url;
        })
      );

      const validMedia = uploadedImages.filter((url) => url !== null);

      // ✅ Ensure price values are correctly parsed
      let productPrice = parseFloat(price);
      let productCompareAtPrice = parseFloat(compareAtPrice);

      productPrice = isNaN(productPrice) ? "0.00" : productPrice.toFixed(2);
      productCompareAtPrice = isNaN(productCompareAtPrice) ? null : productCompareAtPrice.toFixed(2);

      // ✅ Ensure variants are formatted correctly
      let formattedVariants = variants.length > 0 ? variants.map((v) => {
        let variantPrice = parseFloat(v.price);
        let variantCompareAtPrice = parseFloat(v.comparePrice);

        return {
          name: v.name || "Default Variant",
          price: isNaN(variantPrice) ? productPrice : variantPrice.toFixed(2),
          compareAtPrice: isNaN(variantCompareAtPrice) ? productCompareAtPrice : variantCompareAtPrice.toFixed(2),
          inventoryManagement: trackQuantity ? "SHOPIFY" : null, // ✅ Track Inventory
          inventoryQuantity: trackQuantity ? parseInt(quantity) || 0 : null, // ✅ Set Initial Stock
        };
      }) : [{
        name: "Default Variant",
        price: productPrice,
        compareAtPrice: productCompareAtPrice,
        inventoryManagement: trackQuantity ? "SHOPIFY" : null,
        inventoryQuantity: trackQuantity ? parseInt(quantity) || 0 : null,
      }];

      console.log("Formatted Variants:", formattedVariants);

      // ✅ Prepare Final Product Data
      const productData = {
        title,
        description,
        category, // ✅ Category (Product Type)
        tags, // ✅ Tags
        trackQuantity, // ✅ Track Quantity
        quantity, // ✅ Initial Quantity
        variants: formattedVariants,
        media: validMedia.map((url) => ({ url })),
      };

      console.log("🚀 Sending Product Data:", productData);

      // ✅ Send Product Data to Backend
      const response = await axios.post("http://localhost:5000/api/products", productData);
      console.log("✅ Product Created:", response.data);

      // Set product details to display
      setProductDetails(response.data.product);
      setTimeout(() => {
        navigate("/products");
      }, 3000);
    } catch (error) {
      console.error("❌ Error Saving Product:", error.response?.data || error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="col-span-2 bg-white p-6 rounded-lg shadow-md">
          {/* Header Buttons */}
          <div className="flex justify-end space-x-4 mb-4">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={handleDiscard}>Discard</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={saveProduct}>Save Product</button>
          </div>
          
          {/* Title & Description */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">Title</label>
            <input type="text" className="w-full p-2 border rounded" value={title}
  onChange={(e) => setTitle(e.target.value)}  placeholder="Enter product title" />
          </div>
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">Description</label>
            <textarea className="w-full p-2 border rounded h-32"
  onChange={(e) => setDescription(e.target.value)} placeholder="Enter product description"></textarea>
          </div>
          
          {/* Media Upload */}
          <div className="mb-6 border p-4 rounded">
            <label className="block text-lg font-semibold mb-2">Media</label>
            <div className="border-dashed border-2 p-6 text-center rounded cursor-pointer">
              <input type="file" className="hidden" id="mediaUpload" multiple accept="image/*,video/*" onChange={handleMediaUpload} />
              <label htmlFor="mediaUpload" className="cursor-pointer">
                <p className="text-gray-500">Click to upload or drag and drop images/videos</p>
              </label>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {media.map((file, index) => (
                <div key={index} className="relative">
                  {file.type === "image" ? (
                    <img src={file.url} alt="Uploaded" className="w-full h-24 object-cover rounded" />
                  ) : (
                    <video src={file.url} controls className="w-full h-24 object-cover rounded"></video>
                  )}
                  <button onClick={() => removeMedia(index)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded">✕</button>
                </div>
              ))}
            </div>
          </div>
         
          {/* Category Dropdown */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">Category</label>
            <select className="w-full p-2 border rounded" onChange={(e) => setCategory(e.target.value)}>
              <option>Select a category</option>
              <option>Clothing</option>
              <option>Electronics</option>
              <option>Home & Kitchen</option>
              <option>Beauty & Personal Care</option>
              <option>Sports & Outdoors</option>
              <option>Toys & Games</option>
              <option>Automotive</option>
              <option>Books</option>
              <option>Health & Wellness</option>
            </select>
          </div>
          
         {/* Pricing Section */}
<div className="mb-6 p-4 border rounded">
  <h3 className="font-semibold text-lg mb-2">Pricing</h3>
  <div className="grid grid-cols-2 gap-4">
    {/* Price Input */}
    <div>
      <label htmlFor="price" className="block font-medium">Price</label>
      <input
        type="number"
        id="price"
        className="w-full p-2 border rounded"
        placeholder="₹0.00"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
    </div>

    {/* Compare-at Price Input */}
    <div>
      <label htmlFor="comparePrice" className="block font-medium">Compare-at Price</label>
      <input
        type="number"
        id="comparePrice"
        className="w-full p-2 border rounded"
        placeholder="₹0.00"
        value={compareAtPrice}
        onChange={(e) => setCompareAtPrice(e.target.value)}
      />
    </div>
  </div>
</div>

           
          {/* Inventory Section */}
       {/* Inventory Section */}
<div className="mb-6 p-4 border rounded">
  <h3 className="font-semibold text-lg mb-2">Inventory</h3>

  {/* Track Quantity Checkbox */}
  <div className="flex items-center mb-4">
    <input 
      type="checkbox" 
      id="trackQuantity" 
      className="mr-2" 
      checked={trackQuantity} 
      onChange={() => setTrackQuantity(!trackQuantity)} 
    />
    <label htmlFor="trackQuantity">Track quantity</label>
  </div>

  {/* Quantity Input */}
  <div>
    <label className="block font-semibold">Quantity</label>
    <input 
      type="number" 
      className="w-full p-2 border rounded" 
      placeholder="0" 
      value={quantity} 
      onChange={(e) => setQuantity(Number(e.target.value))} 
      disabled={!trackQuantity}
    />
  </div>

  {/* Continue Selling Checkbox */}
  <div className="flex items-center mt-4">
    <input type="checkbox" id="continueSelling" className="mr-2" />
    <label htmlFor="continueSelling">Continue selling when out of stock</label>
  </div>

  {/* SKU / Barcode Checkbox */}
  <div className="flex items-center mt-4">
    <input type="checkbox" id="skuBarcode" className="mr-2" />
    <label htmlFor="skuBarcode">This product has a SKU or barcode</label>
  </div>
</div>

          <div className="border p-4 rounded-lg bg-gray-50">
        <label className="block text-gray-700 font-medium mb-2">Variants</label>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          onClick={() => setShowModal(true)}
        >
          Manage Variants
        </button>

        {/* Display Selected Variants */}
        {variants.length > 0 && (
          <div className="mt-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-medium">Selected Variants:</h3>
            {variants.map((variant, index) => (
              <div key={index} className="mb-3">
                <span className="font-semibold text-gray-700">{variant.name}:</span>{" "}
                <span className="text-gray-600">{variant.values.join(", ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>

        
        {/* Right Side */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white p-4 border rounded shadow-md">
            <label className="block text-lg font-semibold mb-2">Status</label>
            <select className="w-full p-2 border rounded">
              <option>Active</option>
              <option>Draft</option>
            </select>
          </div>
          
          {/* Product Organization */}
          <div className="bg-white p-4 border rounded shadow-md">
            <h3 className="font-semibold text-lg mb-2">Product Organization</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label>Type</label>
                <input type="text" className="w-full p-2 border rounded" placeholder="Enter type" />
              </div>
              <div>
                <label>Vendor</label>
                <input type="text" className="w-full p-2 border rounded" placeholder="Enter vendor" />
              </div>
               {/* Collections Section */}
            <div className=" relative" ref={collectionRef}>
              <label className="block font-semibold">Collections</label>
              <div
                className="w-full p-2 border rounded cursor-pointer"
                onClick={() => setShowCollections(!showCollections)}
              >
                {collections.length > 0
                  ? collections.join(", ")
                  : "Select collections"}
              </div>

              {/* Collection Dropdown */}
              {showCollections && (
                <div className="absolute z-10 w-full border mt-1 bg-white shadow-lg rounded max-h-40 overflow-auto">
                  {availableCollections.map((collection, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => toggleCollection(collection)}
                    >
                      <input
                        type="checkbox"
                        checked={collections.includes(collection)}
                        readOnly
                        className="mr-2"
                      />
                      {collection}
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Collections */}
              <div className="flex flex-wrap mt-2 max-h-[100px] overflow-auto  rounded p-2">
                {collections.map((collection, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-sm px-2 py-1 rounded-full mr-2 mb-2 cursor-pointer"
                    onClick={() => toggleCollection(collection)}
                  >
                    {collection} ✕
                  </span>
                ))}
              </div>
            </div>
              {/* Tags Section */}
              <div className="mb-4 relative" ref={tagRef}>
              <label className="block font-semibold">Tags</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Search or add a tag"
                value={tagInput}
                onChange={handleTagInputChange}
                onFocus={() => setShowTagDropdown(true)}
              />
              {showTagDropdown && (
                <div className="absolute z-10 w-full border mt-1 bg-white shadow-lg rounded max-h-40 overflow-auto">
                  {filteredTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => addTag(tag)}
                    >
                      <span>{tag}</span>
                      {tags.includes(tag) && (
                        <button
                          className="text-red-500 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag);
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap mt-2 rounded p-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-sm px-2 py-1 rounded-full mr-2 mb-2 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ✕
                  </span>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
   {/* Product Details Section */}
   {productDetails && (
  <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-4 text-center">
    <h3 className="font-bold">Product Added Successfully!</h3>
    <button onClick={() => setProductDetails(null)} className="mt-2 bg-white text-green-500 px-4 py-2 rounded">
      Close
    </button>
  </div>
)}

      {showModal && <VariantModal onClose={() => setShowModal(false)} setVariants={setVariants} />}
    </div>
  );
}