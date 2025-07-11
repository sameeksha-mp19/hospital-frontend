import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const initialRoles = [
  { id: 1, name: "Admin", permissions: { manageUsers: true, viewStats: true, editProtocols: true } },
  { id: 2, name: "Doctor", permissions: { manageUsers: false, viewStats: true, editProtocols: false } },
  { id: 3, name: "Pharmacy", permissions: { manageUsers: false, viewStats: false, editProtocols: false } },
  { id: 4, name: "OT Staff", permissions: { manageUsers: false, viewStats: false, editProtocols: false } },
];

export default function AccessControl() {
  const [roles, setRoles] = useState(initialRoles);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/audit-logs", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch audit logs.");
        setAuditLogs(await res.json());
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchAuditLogs();
  }, []);

  // ✅ THIS FUNCTION WAS MISSING AND IS NOW RESTORED
  const togglePermission = (roleId, permKey) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [permKey]: !role.permissions[permKey],
              },
            }
          : role
      )
    );
    toast.info("Permission toggled (UI only).");
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-2xl font-bold mb-6">Access Control</h2>
      
      {/* Role Permissions Table */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Role-Based Permissions</h3>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Role</th>
              <th className="border border-gray-300 p-2 text-center">Manage Users</th>
              <th className="border border-gray-300 p-2 text-center">View Stats</th>
              <th className="border border-gray-300 p-2 text-center">Edit Protocols</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{role.name}</td>
                {Object.keys(role.permissions).map((permKey) => (
                  <td key={permKey} className="border border-gray-300 p-2 text-center">
                    <input
                      type="checkbox"
                      checked={role.permissions[permKey]}
                      onChange={() => togglePermission(role.id, permKey)} // This now calls the restored function
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Audit Logs */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Audit Logs</h3>
        <ul className="max-h-48 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
          {auditLogs.map((log) => (
            <li key={log._id} className="border-b border-gray-200 py-1 text-sm">
              <span className="font-medium">{new Date(log.timestamp).toLocaleString()}: </span>
              <span className="font-bold text-indigo-700">{log.actor}</span> {log.action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}