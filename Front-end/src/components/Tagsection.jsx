import React, { useState } from "react";

const TagSection = ({ tags, setTags, setSelectedTag }) => {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      setSelectedTag(updatedTags); // ✅ trigger discount recalculation
      setTagInput(""); // clear input
    }
  };

  const handleRemoveTag = (tag) => {
    const updatedTags = tags.filter(t => t !== tag);
    setTags(updatedTags);
    setSelectedTag(updatedTags); // ✅ update selectedTag for discount useEffect
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
          <div
            key={index}
            className="flex items-center mr-2 mb-2 bg-blue-100 text-sm px-2 py-1 rounded"
          >
            <span className="mr-1">{tag}</span>
            <button
              onClick={() => handleRemoveTag(tag)}
              className="text-red-600 font-bold"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagSection;
