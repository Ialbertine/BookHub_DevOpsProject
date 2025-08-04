import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-amber-600 mb-8">Welcome to BookHub</h1>

      <p className="text-lg text-gray-700 text-center max-w-2xl mb-8 px-4 leading-relaxed">
        BookHub is a library management system for cataloging books, managing the books, and user accounts.
        Perfect for librarians managing collections and readers discovering new books. 
      </p>

      <div className="flex gap-4">
        <Link
          to="/register"
          className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition duration-200"
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