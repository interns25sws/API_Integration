import React, { useState, useEffect } from "react";
import axios from "axios";

const TagModal = ({ isOpen, onClose, selectedTags, setSelectedTags }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/shopify/graphql", {
          query: `
            query {
              customers(first: 50) {
                edges {
                  node {
                    tags
                  }
                }
              }
            }
          `,
        });

        const tags = response.data.data.customers.edges
          .flatMap(edge => edge.node.tags)
          .filter((tag, index, self) => tag && self.indexOf(tag) === index); // Remove duplicates

        setAvailableTags(tags);
      } catch (error) {
        console.error("Error fetching Shopify tags:", error);
      }
    };

    if (isOpen) fetchTags();
  }, [isOpen]);

  // Handle tag selection
  const handleTagSelection = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filter tags based on search input
  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-4 rounded shadow-lg w-96">
          <h2 className="text-lg font-semibold">Add Tags</h2>
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search or create tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border p-2 rounded mt-2"
          />

          {/* Tag List */}
          <div className="max-h-40 overflow-y-auto mt-2">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <div key={tag} className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagSelection(tag)}
                  />
                  <span className="ml-2">{tag}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No tags found.</p>
            )}
          </div>

          {/* Add New Tag */}
          {searchTerm && !availableTags.includes(searchTerm) && (
            <button
              onClick={() => setSelectedTags([...selectedTags, searchTerm])}
              className="mt-2 text-blue-500 hover:underline"
            >
              + Add "{searchTerm}"
            </button>
          )}

          {/* Buttons */}
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded mr-2">
              Cancel
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded">
              Save
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default TagModal;
