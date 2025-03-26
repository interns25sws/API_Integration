import React, { useState } from "react";

const TagSection = ({ tags, setTags, applyTagDiscount }) => {
  const [tagInput, setTagInput] = useState(""); // Local state for the input field

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput(""); // Clear input after adding

      // ✅ Apply discount for the newly added tag
      applyTagDiscount(newTag);
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Tags</h3>
      <div className="flex">
        <input
          type="text"
          placeholder="Add a tag..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          onClick={handleAddTag}
          className="bg-blue-500 text-white px-4 py-2 ml-2 rounded"
        >
          Add Tag
        </button>
      </div>
      <div className="mt-2 flex flex-wrap">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center mr-1 bg-blue-200 p-1 rounded-md">
            <span>{tag}</span>
            <button onClick={() => handleRemoveTag(tag)} className="text-red-500 hover:text-red-700">✖</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagSection;
