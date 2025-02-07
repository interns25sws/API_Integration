import React from "react";
import { useForm } from "react-hook-form";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Login Data:", data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl w-full flex">
        {/* Left Section - Login Form */}
        <div className="w-1/2 p-6">
          <h2 className="text-2xl font-bold mb-4">Keep your online business organized</h2>
          <p className="text-gray-600 mb-6">Sign in to continue</p>
          <button className="w-full py-2 border rounded-md flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 mb-4">
            <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
          <div className="text-center text-gray-400 mb-4">or</div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 mb-2 border rounded-md"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <input
              {...register("password", { required: "Password is required" })}
              type="password"
              placeholder="Enter your password"
              className="w-full p-2 mb-2 border rounded-md"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

            <button type="submit" className="w-full bg-black text-white py-2 rounded-md">Login</button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            Don't have an account? <a href="#" className="text-black font-semibold">Sign Up Here</a>
          </p>
        </div>

        {/* Right Section - Illustration */}
        <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-purple-400 to-blue-400 rounded-r-2xl p-6">
          <div className="text-center text-white">
            <h3 className="text-xl font-bold">$527.8K</h3>
            <p className="text-sm text-gray-200">Total sales last month</p>
            <div className="flex justify-center mt-4">
              <div className="w-8 h-16 bg-yellow-300 mx-1"></div>
              <div className="w-8 h-24 bg-blue-300 mx-1"></div>
              <div className="w-8 h-12 bg-white mx-1"></div>
            </div>
            <p className="mt-6 text-sm text-gray-200">“Basement is surprisingly handy for keeping all my business organized.”</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
