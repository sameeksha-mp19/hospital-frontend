import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-md">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
          🏥 Central Hospital
        </h1>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="#home" className="hover:text-indigo-700 dark:hover:text-indigo-300">Home</a>
          <a href="#about" className="hover:text-indigo-700 dark:hover:text-indigo-300">About</a>
          <Link to="/login" className="hover:text-indigo-700 dark:hover:text-indigo-300">Login</Link>
          <Link to="/register" className="hover:text-indigo-700 dark:hover:text-indigo-300">Register</Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-4 text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded transition"
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="flex flex-col items-center justify-center text-center px-4 py-20">
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold text-indigo-800 dark:text-indigo-300 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Centralized Hospital Management System
        </motion.h2>
        <motion.p
          className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Streamline patient care, staff coordination, and resource management seamlessly — all in one platform.
        </motion.p>

        <motion.div
          className="mt-8 flex gap-4 flex-wrap justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <Link
            to="/register"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </Link>
        </motion.div>
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-white dark:bg-gray-800 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">About Us</h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            Our Centralized Hospital Management System simplifies the way hospitals operate. From handling patient records and staff scheduling to pharmacy coordination and OT management, our platform ensures seamless communication, efficient workflows, and better patient outcomes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        © 2025 Central Hospital Management. All rights reserved.
      </footer>
    </div>
  );
}
