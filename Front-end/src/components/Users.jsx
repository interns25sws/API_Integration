import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null); // For edit modal
  const [updatedUser, setUpdatedUser] = useState({ name: "", email: "", role: "" });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "admin", tags: [] });
  const [tagInput, setTagInput] = useState("");

  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/users");
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
  

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/update/${editUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) throw new Error("Failed to update user");

      setUsers(users.map((user) => (user._id === editUser._id ? { ...user, ...updatedUser } : user)));
      setEditUser(null);
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password, // Make sure this field is included
          role: newUser.role,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to add user");
  
      const data = await response.json();
      setUsers([...users, data.user]);
      setShowAddUserModal(false);
      alert("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
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
              <option value="sales rep">Sales Rep</option>
            </select>
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

      <label className="block font-semibold">Name:</label>
      <input
        type="text"
        value={newUser.name}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        className="border p-2 w-full mb-2"
      />

      <label className="block font-semibold">Email:</label>
      <input
        type="email"
        value={newUser.email}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        className="border p-2 w-full mb-2"
      />

      <label className="block font-semibold">Password:</label>
      <input
        type="password"
        value={newUser.password}
        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        className="border p-2 w-full mb-2"
      />

      <label className="block font-semibold">Role:</label>
      <select
        value={newUser.role}
        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        className="border p-2 w-full mb-2"
      >
        <option value="admin">Admin</option>
        <option value="sales-rep">Sales Rep</option>
      </select>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setShowAddUserModal(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button onClick={handleAddUser} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add User
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Users;
