import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";


const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null); // For edit modal
  const [updatedUser, setUpdatedUser] = useState({ name: "", email: "", role: "", tags: [] });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    fetchUsers();
  }, []);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")); // Get logged-in user
      if (!user) {
        console.error("User not found in localStorage");
        return;
      }
  
      const response = await fetch(`http://localhost:5000/api/user/users?role=${user.role}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`, // If using JWT authentication
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  

  const handleView = (user) => {
    setSelectedUser(user);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setUpdatedUser({ name: user.name, email: user.email, role: user.role });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/user/delete/${userId}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((user) => user._id !== userId));
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  
useEffect(() => {
  if (editUser) {
    setUpdatedUser({ 
      ...editUser, 
      tags: Array.isArray(editUser.tags) ? editUser.tags : [] // Ensure tags are an array
    });
  }
}, [editUser]);
useEffect(() => {
  if (showAddUserModal) {
    reset(); // Clears input fields
    setTags([]); // Clears previous tags
    setErrorMessage(""); // Clears errors
  }
}, [showAddUserModal, reset]);

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/update/${editUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setErrorMessage(data.message || "Failed to update user"); // Store error message in state
        return;
      }
  
      setUsers(users.map((user) => (user._id === editUser._id ? { ...user, ...updatedUser } : user)));
      setEditUser(null);
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };
   
  const onSubmit = async (formData) => {
    try {
      setErrorMessage(""); // Clear previous errors
  
      const response = await fetch("http://localhost:5000/api/user/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tags }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to add user");
      }
  
      setUsers([...users, data.user]); // Update user list
      setShowAddUserModal(false); // Close modal
      reset(); // Clear form fields
      setTags([]); // Clear tags
      alert("User added successfully!");
    } catch (error) {
      setErrorMessage(error.message); // Show error message in UI
    }
  };
  
  return (
    <div className="p-6">
 <div className="flex justify-between items-center w-[95%] mx-auto mb-4">
        <h2 className="text-2xl font-bold">Users</h2>
        <button
          onClick={() =>setShowAddUserModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Users
        </button>
      </div>      <div className="bg-white shadow-lg rounded-lg p-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Role</th>
              <th className="border border-gray-300 px-4 py-2">Tags</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>          
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2 capitalize">{user.role}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.tags?.join(", ")}</td>  
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleView(user)} className="text-gray-500 hover:text-gray-700">
                        <FaEye />
                      </button>
                      <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Tags:</strong> {selectedUser.tags?.join(", ")}</p>
            <button onClick={() => setSelectedUser(null)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}

     {/* Edit User Modal */}
     {editUser && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-semibold mb-4">Edit User</h2>

      {/* Show error message if exists */}
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
          {errorMessage}
        </div>
      )}

      <label className="block font-semibold">Name:</label>
      <input
        type="text"
        value={updatedUser.name}
        onChange={(e) => setUpdatedUser({ ...updatedUser, name: e.target.value })}
        className="border p-2 w-full mb-2"
      />

      <label className="block font-semibold">Email:</label>
      <input
        type="email"
        value={updatedUser.email}
        onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
        className="border p-2 w-full mb-2"
      />

      <label className="block font-semibold">Role:</label>
      <select
        value={updatedUser.role}
        onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}
        className="border p-2 w-full mb-2"
      >
        <option value="admin">Admin</option>
        <option value="sales-rep">Sales Rep</option>
      </select>

      {/* Tags Input */}
      <label className="block font-semibold">Tags:</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="border p-2 w-full"
        />
      <button
  type="button"
  className="bg-green-500 text-white px-2 py-1 rounded"
  onClick={() => {
    if (tagInput.trim()) {
      setUpdatedUser((prevUser) => ({
        ...prevUser,
        tags: [...(prevUser.tags || []), tagInput], // Preserve existing tags
      }));
      setTagInput("");
    }
  }}
>
  Add
</button>

      </div>

      {/* Display tags with remove button */}
      <div className="mt-2">
        {updatedUser.tags && updatedUser.tags.map((tag, index) => (
          <span key={index} className="bg-gray-200 px-2 py-1 rounded text-sm mr-2">
            {tag}{" "}
            <button
              type="button"
              className="text-red-500 ml-1"
              onClick={() =>
                setUpdatedUser({
                  ...updatedUser,
                  tags: updatedUser.tags.filter((t) => t !== tag),
                })
              }
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={() => setEditUser(null)} className="bg-gray-400 text-white px-4 py-2 rounded">
          Cancel
        </button>
        <button onClick={handleUpdateUser} className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

{showAddUserModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add User</h2>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="block font-semibold">Name:</label>
              <input
                {...register("name", { required: "Name is required" })}
                className="border p-2 w-full mb-2"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}

              <label className="block font-semibold">Email:</label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email format",
                  },
                })}
                className="border p-2 w-full mb-2"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}

              <label className="block font-semibold">Password:</label>
              <input
                type="password"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                className="border p-2 w-full mb-2"
              />
              {errors.password && <p className="text-red-500">{errors.password.message}</p>}

              <label className="block font-semibold">Role:</label>
<select
  {...register("role", { required: "Role is required" })}
  className="border p-2 w-full mb-2"
>
  {loggedInUser?.role === "super-admin" ? (
    <>
      <option value="admin">Admin</option>
      <option value="sales-rep">Sales Rep</option>
    </>
  ) : (
    <option value="sales-rep">Sales Rep</option> // Admins can only create Sales Reps
  )}
</select>
{errors.role && <p className="text-red-500">{errors.role.message}</p>}


              <label className="block font-semibold">Tags (Super Admin Only):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="border p-2 w-full"
                />
                <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleAddTag}>
                  Add
                </button>
              </div>
              <div className="mt-2">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-gray-200 px-2 py-1 rounded text-sm mr-2">
                    {tag} <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                  </span>
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;
