import React from "react";

const Registration = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl w-full flex">
        {/* Left Section - Form */}
        <div className="w-1/2 p-6">
          <h2 className="text-2xl font-bold mb-4">Create your account</h2>
          <p className="text-gray-600 mb-6">
            Sign up to get started with our platform
          </p>
          <button className="w-full py-2 border rounded-md flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 mb-4">
            <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
            Sign up with Google
          </button>
          <div className="text-center text-gray-400 mb-4">or</div>
          <form>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2 mb-4 border rounded-md"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-2 mb-4 border rounded-md"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-4 border rounded-md"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 mb-4 border rounded-md"
            />
            <button className="w-full bg-black text-white py-2 rounded-md">
              Sign Up
            </button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <a href="#" className="text-black font-semibold">
              Login Here
            </a>
          </p>
        </div>

        {/* Right Section - Illustration */}
        <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-purple-400 to-blue-400 rounded-r-2xl p-6">
          <div className="text-center text-white">
            <h3 className="text-xl font-bold">Join Us Today!</h3>
            <p className="text-sm text-gray-200">
              Start managing your business efficiently
            </p>
            <div className="flex justify-center mt-4">
              <div className="w-8 h-16 bg-yellow-300 mx-1"></div>
              <div className="w-8 h-24 bg-blue-300 mx-1"></div>
              <div className="w-8 h-12 bg-white mx-1"></div>
            </div>
            <p className="mt-6 text-sm text-gray-200">
              “Experience the best tools for business growth.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
