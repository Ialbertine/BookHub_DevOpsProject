import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-amber-600 mb-8">Welcome to BookHub</h1>
      <div className="flex gap-4">
        <Link
          to="/register"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition duration-200"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition duration-200"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;