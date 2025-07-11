import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function BookToken() {
  const navigate = useNavigate();
  
  // ✅ The warning is fixed here by removing the unused 'setPatientName'
  const [patientName] = useState(JSON.parse(localStorage.getItem("userData"))?.name || "");
  
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const doctorsByDepartment = {
    Cardiology: ["doc1", "Dr. Rao"],
    Orthopedics: ["Dr. Kamath", "Dr. Bhat"],
    ENT: ["Dr. Naik", "Dr. Pinto"],
    Neurology: ["Dr. Shenoy", "Dr. Pai"],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:5000/api/patient/book-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ patientName, department, date, doctorName: doctor }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to book token");
      }

      setBooked(true);
      toast.success(`Token #${data.tokenNumber} booked successfully!`);
      setTimeout(() => navigate('/patient/dashboard'), 3000);

    } catch (err) {
      console.error("❌ Error:", err.message);
      toast.error("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <div className="flex flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 space-y-4 flex flex-col">
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
      <div className="flex-1 p-10">
        <h2 className="text-2xl font-bold mb-6">📝 Book Your Token</h2>

        <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
          {booked ? (
            <div className="p-4 bg-green-100 text-green-700 rounded-lg border border-green-200 text-center">
              <h3 className="font-bold text-lg">✅ Token Successfully Booked!</h3>
              <p>Your appointment is confirmed for the <strong>{department}</strong> department with <strong>{doctor}</strong>.</p>
              <p className="mt-2 text-sm">You will be redirected to the dashboard shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-100"
                  value={patientName}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Department</label>
                <select
                  className="w-full p-2 border rounded"
                  value={department}
                  onChange={(e) => { setDepartment(e.target.value); setDoctor(""); }}
                  required
                >
                  <option value="">-- Choose Department --</option>
                  {Object.keys(doctorsByDepartment).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctorsByDepartment[department].map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Booking...' : 'Book Token'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}