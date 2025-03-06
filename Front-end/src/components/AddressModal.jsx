import React, { useEffect, useState } from "react";
import axios from "axios";

const AddressModal = ({ isOpen, onClose, onSave, initialAddress }) => {
  const [address, setAddress] = useState(initialAddress);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodeError, setPincodeError] = useState("");
  const [isPincodeValid, setIsPincodeValid] = useState(true); // Track validity

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

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const validatePincode = async () => {
    if (!address.country || !address.city || !address.pincode) {
      setPincodeError("Please enter a valid country, city, and pincode.");
      setIsPincodeValid(false);
      return false;
    }
  
    try {
      let response;
      let matchedCity = false;
  
      // 🇮🇳 **India: Use India Post API**
      if (address.country === "India") {
        response = await axios.get(`https://api.postalpincode.in/pincode/${address.pincode}`);
        if (response.data[0]?.Status === "Success") {
          const postOffices = response.data[0]?.PostOffice || [];
          matchedCity = postOffices.some(
            (office) => office.District.toLowerCase() === address.city.toLowerCase()
          );
        }
      }
      
      // 🌍 **For Other Countries: Use Zippopotam.us**
      if (!matchedCity && address.country !== "India") {
        const countryCode = address.countryCode || address.country; // Country codes are needed for Zippopotam
        response = await axios.get(`https://api.zippopotam.us/${countryCode}/${address.pincode}`);
        if (response.data?.places) {
          matchedCity = response.data.places.some(
            (place) => place["place name"].toLowerCase() === address.city.toLowerCase()
          );
        }
      }
  
      // 🌎 **Universal Fallback: Geonames API**
      if (!matchedCity) {
        response = await axios.get(
          `http://api.geonames.org/postalCodeSearchJSON?postalcode=${address.pincode}&placename=${address.city}&maxRows=10&username=demo`
        );
        if (response.data.postalCodes.length > 0) {
          matchedCity = true;
        }
      }
  
      if (matchedCity) {
        setPincodeError(""); // ✅ No errors
        setIsPincodeValid(true);
        return true;
      } else {
        setPincodeError("Pincode does not match the selected city.");
        setIsPincodeValid(false);
        return false;
      }
    } catch (error) {
      console.error("Pincode validation error:", error);
      setPincodeError("Could not validate the pincode. Please check manually.");
      setIsPincodeValid(true); // ⚠️ Allow saving but show a warning
      return true;
    }
  };
  
  
  const handleSave = async () => {
    const isValid = await validatePincode();  // Wait for validation
  
    console.log("Validation Result:", isValid);  // Debugging log
  
    if (!isValid) {
      alert("Please fix the errors before saving.");
      return;
    }
  
    console.log("Saving Address:", address);  // Debugging log
  
    onSave(address);
  };
  
  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
          <h2 className="text-xl font-semibold mb-4">Add Default Address</h2>

          {/* Country */}
          <label className="block text-sm font-medium text-gray-700">Country/Region</label>
          <select
            name="country"
            value={address.country}
            onChange={handleAddressChange}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="">Select a country</option>
            {countries.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </select>

          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input name="firstName" value={address.firstName} onChange={handleAddressChange} className="w-full border p-2 rounded mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input name="lastName" value={address.lastName} onChange={handleAddressChange} className="w-full border p-2 rounded mt-1" />
            </div>
          </div>

          {/* Address Fields */}
          <label className="block text-sm font-medium text-gray-700 mt-3">Company</label>
          <input name="company" value={address.company} onChange={handleAddressChange} className="w-full border p-2 rounded mt-1" />

          <label className="block text-sm font-medium text-gray-700 mt-3">Apartment, Suite, etc.</label>
          <input name="address" value={address.address} onChange={handleAddressChange} className="w-full border p-2 rounded mt-1" />

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <select name="city" value={address.city} onChange={handleAddressChange} className="w-full border p-2 rounded mt-1" disabled={!address.state}>
                <option value="">Select a city</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <select name="state" value={address.state} onChange={handleAddressChange} className="w-full border p-2 rounded mt-1" disabled={!address.country}>
                <option value="">Select a state</option>
                {states.map((state, index) => (
                  <option key={index} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pincode */}
          <label className="block text-sm font-medium text-gray-700 mt-3">Pincode</label>
          <input
            name="pincode"
            value={address.pincode || ""}
            onChange={handleAddressChange}
            onBlur={validatePincode}
            className="w-full border p-2 rounded mt-1"
          />
          {pincodeError && <p className="text-red-500 text-sm mt-1">{pincodeError}</p>}

          {/* Phone */}
          <label className="block text-sm font-medium text-gray-700 mt-3">Phone</label>
          <input name="phone" value={address.phone || ""} onChange={handleAddressChange} className="w-full border p-2 rounded mt-1" />

          {/* Footer Buttons */}
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded mr-2">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded ${pincodeError || !isPincodeValid ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-700"}`}
              disabled={pincodeError || !isPincodeValid}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default AddressModal;
