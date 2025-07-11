import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NotificationBox from "../../components/NotificationBox";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [queueData, setQueueData] = useState({
    department: "",
    yourToken: null,
    currentServing: null,
    positionInQueue: null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch patient and queue data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = JSON.parse(localStorage.getItem("userData"));
        if (!storedData) throw new Error("No user data found");
        setPatientData(storedData);

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/patient/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch queue status");
        const queueStatus = await response.json();
        
        setQueueData({
          department: queueStatus.department || "Not assigned",
          yourToken: queueStatus.yourToken,
          currentServing: queueStatus.currentServing,
          positionInQueue: queueStatus.positionInQueue,
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white shadow-md"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  const progress = queueData.positionInQueue === "Served" 
    ? 100 
    : Math.min((queueData.positionInQueue || 0) * 10, 100);

  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-md p-4 h-screen flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6 text-indigo-700">Patient Portal</h1>
          <nav className="space-y-2 text-sm">
            <NavLink
              to="/patient/dashboard"
              className={({ isActive }) =>
                `block px-4 py-2 rounded ${isActive ? "bg-indigo-500 text-white" : "hover:bg-indigo-100"}`
              }
            >
              🏠 Dashboard
            </NavLink>
            <NavLink
              to="/patient/book-token"
              className={({ isActive }) =>
                `block px-4 py-2 rounded ${isActive ? "bg-indigo-500 text-white" : "hover:bg-indigo-100"}`
              }
            >
              🎫 Book Token
            </NavLink>
            <NavLink
              to="/patient/prescriptions"
              className={({ isActive }) =>
                `block px-4 py-2 rounded ${isActive ? "bg-indigo-500 text-white" : "hover:bg-indigo-100"}`
              }
            >
              💊 Prescriptions
            </NavLink>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        {/* <h2 className="text-2xl font-bold mb-4">Patient Dashboard</h2> */}
        
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Welcome <span className="text-indigo-600">{patientData?.name}</span>
          </h2>
          <p className="text-gray-600">Your current queue status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Department</p>
            <h3 className="text-lg font-bold">{queueData.department}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Your Token</p>
            <h3 className="text-lg font-bold">{queueData.yourToken ?? "Not issued"}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Now Serving</p>
            <h3 className="text-lg font-bold">{queueData.currentServing ?? "N/A"}</h3>
          </div>
        </div>

        {/* Queue Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Queue Status</h3>
          <div className="w-full bg-gray-200 h-4 rounded-full mb-2">
            <motion.div
              className={`h-full ${
                queueData.positionInQueue === "Served" ? "bg-green-500" : "bg-blue-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2 }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {queueData.positionInQueue === "Served" ? (
              <span className="text-green-600">✔️ Your turn has been served!</span>
            ) : queueData.positionInQueue > 0 ? (
              <>You are <strong>{queueData.positionInQueue}</strong> positions away</>
            ) : (
              "Waiting for queue assignment..."
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Link
            to="/patient/book-token"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Book New Token
          </Link>
          <Link
            to="/patient/prescriptions"
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            View Prescriptions
          </Link>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <NotificationBox />
        </div>
      </div>
    </div>
  );
}