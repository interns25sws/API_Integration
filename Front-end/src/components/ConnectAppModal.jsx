import { useState } from "react";

const ConnectAppModal = ({ onClose, onSave }) => {
  const [appName, setAppName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!appName || !apiKey || !apiSecret) {
      alert("All fields are required!");
      return;
    }
    onSave({ appName, apiKey, apiSecret });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Connect a New App</h2>
        <form onSubmit={handleSubmit}>
          <label className="block font-semibold">App Name:</label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="border p-2 w-full mb-2"
            required
          />

          <label className="block font-semibold">API Key:</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="border p-2 w-full mb-2"
            required
          />

          <label className="block font-semibold">API Secret:</label>
          <input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            className="border p-2 w-full mb-2"
            required
          />

          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectAppModal;
