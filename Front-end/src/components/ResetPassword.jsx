import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Get token from URL
  const navigate = useNavigate(); // For redirection
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false); // To track success or error

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      setIsError(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsError(false);

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setMessage(data.message || "Something went wrong. Try again.");
        setIsError(true);
      }
    } catch (error) {
      setMessage("Something went wrong. Try again.");
      setIsError(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Reset Your Password</h2>
        
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleReset}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Reset Password
        </button>

        {message && (
          <p className={`text-center mt-3 font-medium ${isError ? "text-red-500" : "text-green-500"}`}>
            {message}
          </p>
        )}

        {/* Show login link if password reset is successful */}
        {!isError && message.includes("successful") && (
          <p className="text-center mt-3 text-blue-600">
            Redirecting to <a href="/login" className="underline font-medium">Login</a>...
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
