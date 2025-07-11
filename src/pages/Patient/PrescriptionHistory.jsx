import { useEffect, useState, useCallback } from "react"; // 1. Import useCallback
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PrescriptionHistory() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Wrap the function in useCallback
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    toast.info("You have been logged out.");
    navigate("/login");
  }, [navigate]); // 3. Add its dependencies (navigate)

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authorization token found, please log in again.");
        }

        const response = await fetch("http://localhost:5000/api/patient/prescriptions", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch prescriptions");
        }
        
        const data = await response.json();
        
        const formattedData = data.map(p => ({
            id: p._id,
            doctor: p.doctorId ? p.doctorId.name : 'Unknown Doctor',
            department: p.appointmentId ? p.appointmentId.department : 'N/A',
            date: new Date(p.date).toLocaleDateString(),
            diagnosis: p.diagnosis,
            medicines: p.medicines
        }));

        setPrescriptions(formattedData);
      } catch (err) {
        toast.error(err.message);
        // Using includes is a bit fragile, but works for this case.
        // A better way would be to check response status code (e.g., 401)
        if (err.message.includes("auth") || err.message.includes("token")) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, [handleLogout]); // 4. Add the stable handleLogout function to the dependency array

  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-md p-4 h-screen flex flex-col">
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
          className="mt-auto w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">📁 Prescription History</h2>
        <div className="bg-white shadow rounded p-4">
          {loading ? (
            <p className="text-gray-600 p-4">Loading prescriptions...</p>
          ) : prescriptions.length === 0 ? (
            <p className="text-gray-600 p-4">No prescriptions found.</p>
          ) : (
            <ul className="space-y-4">
              {prescriptions.map((item) => (
                <li
                  key={item.id}
                  className="border p-4 rounded"
                >
                  <div>
                    <div className="flex gap-4 text-sm text-gray-500 mb-1">
                      <span>{item.date}</span>
                      <span>{item.department}</span>
                    </div>
                    <div className="font-medium">
                      {item.doctor}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Diagnosis:</strong> {item.diagnosis}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Medicines:</strong> {item.medicines.join(", ")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}