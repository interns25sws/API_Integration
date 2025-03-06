import React, { useState } from "react";

export default function VariantModal({ onClose, setVariants }) {
  const [options, setOptions] = useState([{ name: "", values: [""] }]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].name = value;
    setOptions(newOptions);
  };

  const handleValueChange = (optIndex, valIndex, value) => {
    const newOptions = [...options];
    newOptions[optIndex].values[valIndex] = value;
    setOptions(newOptions);
  };

  const addValue = (optIndex) => {
    const newOptions = [...options];
    newOptions[optIndex].values.push("");
    setOptions(newOptions);
  };

  const removeValue = (optIndex, valIndex) => {
    const newOptions = [...options];
    newOptions[optIndex].values.splice(valIndex, 1);
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { name: "", values: [""] }]);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Filter out empty options and values
    const validOptions = options
      .map(opt => ({
        name: opt.name.trim(),
        values: opt.values.filter(val => val.trim())
      }))
      .filter(opt => opt.name && opt.values.length > 0);

    setVariants(validOptions); // Update parent state
    onClose(); // Close modal
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Manage Variants</h2>

        {options.map((option, optIndex) => (
          <div key={optIndex} className="border border-gray-300 p-4 mb-4 rounded-lg relative bg-gray-50">
            {/* Option Name Input */}
            <div className="relative">
              <input
                type="text"
                className={`w-full p-2 pr-10 border ${
                  !option.name ? "border-red-500 bg-red-50" : "border-gray-300"
                } rounded-lg outline-none focus:ring-2 focus:ring-blue-400`}
                placeholder="Option name (e.g., Size, Color)"
                value={option.name}
                onChange={(e) => handleOptionChange(optIndex, e.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:bg-red-100 rounded-full p-1 transition duration-200"
                onClick={() => removeOption(optIndex)}
              >
                ❌
              </button>
            </div>

            {!option.name && <p className="text-red-500 text-sm mt-1">Option name is required.</p>}

            {/* Option Values */}
            <div className="mt-3">
              {option.values.map((value, valIndex) => (
                <div key={valIndex} className="relative flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    className="w-full p-2 pr-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Option value (e.g., Small, Red)"
                    value={value}
                    onChange={(e) => handleValueChange(optIndex, valIndex, e.target.value)}
                  />
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:bg-red-100 rounded-full p-1 transition duration-200"
                    onClick={() => removeValue(optIndex, valIndex)}
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>

            {/* Add Another Value Button */}
            <button
              className="text-blue-600 text-sm font-medium hover:underline mt-2"
              onClick={() => addValue(optIndex)}
            >
              + Add another value
            </button>
          </div>
        ))}

        {/* Add Another Option Button */}
        <button className="text-blue-600 font-medium text-sm hover:underline mb-4" onClick={addOption}>
          + Add another option
        </button>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
