import React from 'react';
import { useState } from 'react';
import SignUp from "./Authentication/Signup";
import SignIn from "./Authentication/Signin";

const Home = () => {
  const[signup, setSignup] = useState(false)
  return (
    <div data-theme="halloween" className="min-h-screen flex flex-col justify-center items-center">
      <div className="bg-transparent shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-lime-400 mb-6">
          {signup ? "Sign Up" : "Sign In"}
        </h2>
        <div className="flex justify-center mb-4">
          <label className="flex items-center space-x-2 text-gray-600">
            <input
              type="checkbox"
              name="check-signup"
              className="form-checkbox h-5 w-5 text-indigo-600"
              onChange={() => setSignup(!signup)}
            />
            <span className="text-sm text-indigo-200">
              {signup ? null : "Don't have an account?"}
            </span>
          </label>
        </div>
        {signup ? <SignUp /> : <SignIn />}
      </div>
    </div>
  );
};

export default Home;