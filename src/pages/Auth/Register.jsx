import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient", // default role
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("userData", JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      }));

      toast.success(`Welcome, ${data.name}!`);

      // Navigate to dashboard based on role
      if (form.role.toLowerCase() === "patient") {
        navigate("/patient/dashboard");
      } else if (form.role.toLowerCase() === "doctor") {
        navigate("/doctor/dashboard");
      } else if (form.role.toLowerCase() === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100">
      <h2 className="text-4xl font-bold mb-6 text-green-700 dark:text-green-300">
        Register Account
      </h2>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          minLength="6"
          className="w-full p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={handleChange}
          required
        />

        {/* Role Dropdown */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="Patient">Patient</option>
          {/* <option value="Doctor">Doctor</option>
          <option value="Admin">Admin</option> */}
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-green-600 hover:underline dark:text-green-400">
          Login
        </Link>
      </p>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mt-6 text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded transition"
      >
        {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
      </button>
    </div>
  );
}
