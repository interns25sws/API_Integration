import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Get stored email if 'Remember Me' was selected
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setValue("email", savedEmail); // Prefill email field
      setRememberMe(true);
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      console.log("✅ Login Response:", result);
  
      if (!response.ok) throw new Error(result.message || "Invalid credentials");
  
      // Store user details including role
      const userData = { ...result.user, token: result.token };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", result.user.role); // Store role separately
  
      // Handle 'Remember Me'
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", data.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
  
      // ✅ Redirect based on role
      navigate("/dashboard"); // Redirect to the common dashboard
      
    } catch (err) {
      console.error("❌ Login Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl w-full flex flex-col md:flex-row">
        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-gray-600 mb-6">Sign in to continue</p>
          
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
                })}
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <input
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                type="password"
                placeholder="Enter your password"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">Remember Me</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Navigate to Register */}
          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{" "}
            <button onClick={() => navigate("/register")} className="text-black font-semibold underline ml-1">
              Sign Up Here
            </button>
          </p>
        </div>

        {/* Right Section - Stats */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-r from-purple-400 to-blue-400 rounded-r-2xl p-6">
          <div className="text-center text-white">
            <h3 className="text-xl font-bold">$527.8K</h3>
            <p className="text-sm text-gray-200">Total sales last month</p>
            <div className="flex justify-center mt-4">
              <div className="w-8 h-16 bg-yellow-300 mx-1"></div>
              <div className="w-8 h-24 bg-blue-200 mx-1"></div>
              <div className="w-8 h-12 bg-white mx-1"></div>
            </div>
            <p className="mt-6 text-sm text-gray-200">“Basement is surprisingly handy for keeping all my business organized.”</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
