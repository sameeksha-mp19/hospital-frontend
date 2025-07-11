import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Patient",
  });

  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try{
    const endpoint = "http://localhost:5000/api/auth/login";
    
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token and user details to localStorage
      localStorage.setItem("token", data.token);
     localStorage.setItem("userData", JSON.stringify({
    _id: data._id,
    name: data.name,
    email: data.email,
    role: data.role // <-- get role from response
}));

toast.success(`Welcome back, ${data.name || "User"}!`);

      // Navigate based on role
      switch (data.role) {
        case "Patient":
          navigate("/patient/dashboard");
          break;
        case "Doctor":
          navigate("/doctor/dashboard");
          break;
        case "OT":
          navigate("/ot/dashboard");
          break;
        case "Pharmacy":
          navigate("/pharmacy/dashboard");
          break;
        case "Admin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100">
      <h2 className="text-4xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="Admin">Admin</option>
          <option value="Doctor">Doctor</option>
          <option value="OT">OT</option>
          <option value="Pharmacy">Pharmacy</option>
          <option value="Patient">Patient</option>
        </select>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        New Patient?{" "}
        <Link to="/register" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Register here
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
