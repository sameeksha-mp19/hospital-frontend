import React from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";

// Import all the components that will be displayed in the content area
import UserManagement from "./UserManagement";
import HospitalStats from "./HospitalStats";
import AccessControl from "./AccessControl";
import EmergencyProtocols from "./EmergencyProtocols";
import GlobalNotifications from "./GlobalNotifications";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      {/* The single, constant sidebar */}
      <div className="w-64 bg-white shadow-md p-4 space-y-4 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6 text-indigo-700">Admin Panel</h1>
          <nav className="space-y-2 text-sm">
            <NavLink to="/admin/users" className={({ isActive }) => `block px-4 py-2 rounded ${isActive ? "bg-indigo-500 text-white" : "hover:bg-indigo-100"}`}>
              👥 User Management
            </NavLink>
            <NavLink to="/admin/stats" className={({ isActive }) => `block px-4 py-2 rounded ${isActive ? "bg-indigo-500 text-white" : "hover:bg-indigo-100"}`}>
              📊 Hospital Stats
            </NavLink>
            <NavLink to="/admin/access" className={({ isActive }) => `block px-4 py-2 rounded ${isActive ? "bg-indigo-500 text-white" : "hover:bg-indigo-100"}`}>
              🔐 Access Control
            </NavLink>
            <NavLink to="/admin/emergency" className={({ isActive }) => `block px-4 py-2 rounded ${isActive ? "bg-indigo-500 text-white" : "hover:bg-indigo-100"}`}>
              🚨 Emergency Protocols
            </NavLink>
            <NavLink to="/admin/notifications" className={({ isActive }) => `block px-4 py-2 rounded ${isActive ? "bg-indigo-500 text-white" : "hover:bg-indigo-100"}`}>
              📢 Global Notifications
            </NavLink>
          </nav>
        </div>
        <button onClick={handleLogout} className="w-full px-4 py-2 mt-4 bg-red-500 text-white rounded hover:bg-red-600">
          🚪 Logout
        </button>
      </div>

      {/* The content area where child routes will render */}
      <div className="flex-1 p-6">
        <Routes>
          <Route path="users" element={<UserManagement />} />
          <Route path="stats" element={<HospitalStats />} />
          <Route path="access" element={<AccessControl />} />
          <Route path="emergency" element={<EmergencyProtocols />} />
          <Route path="notifications" element={<GlobalNotifications />} />
          <Route index element={<div className="text-lg text-gray-600">Select an option from the sidebar to get started.</div>} />
        </Routes>
      </div>
    </div>
  );
}