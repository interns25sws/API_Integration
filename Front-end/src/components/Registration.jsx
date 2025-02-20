import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Registration = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", data);
      alert(response.data.message);
      navigate("/login"); // Redirect to login page after success
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl w-full flex">
        {/* Left Section - Form */}
        <div className="w-1/2 p-6">
          <h2 className="text-2xl font-bold mb-4">Create your account</h2>
          <p className="text-gray-600 mb-6">Sign up to get started with our platform</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register("fullName", { required: "Full Name is required" })}
              type="text"
              placeholder="Full Name"
              className="w-full p-2 mb-2 border rounded-md"
            />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}

            <input
              {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })}
              type="email"
              placeholder="Email Address"
              className="w-full p-2 mb-2 border rounded-md"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <input
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-2 border rounded-md"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

            <input
              {...register("confirmPassword", { required: "Confirm Password is required" })}
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 mb-2 border rounded-md"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}

            <button type="submit" className="w-full bg-black text-white py-2 rounded-md">Sign Up</button>
          </form>

          {/* Navigate to Login */}
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="text-black font-semibold cursor-pointer">
              Login Here
            </span>
          </p>
        </div>

        {/* Right Section - Illustration */}
        <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-purple-400 to-blue-400 rounded-r-2xl p-6">
          <div className="text-center text-white">
            <h3 className="text-xl font-bold">Join Us Today!</h3>
            <p className="text-sm text-gray-200">Start managing your business efficiently</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
