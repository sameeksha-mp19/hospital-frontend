import React, { useState } from "react";
import { toast } from "react-toastify";

export default function GlobalNotifications() {
  const [notification, setNotification] = useState({ message: "", target: "All Dashboards" });
  const [sentNotifications, setSentNotifications] = useState([]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!notification.message.trim()) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/admin/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(notification)
        });
        if (!res.ok) throw new Error("Failed to send notification.");

        const newNotification = await res.json();
        setSentNotifications([newNotification, ...sentNotifications]);
        setNotification({ message: "", target: "All Dashboards" });
        toast.success("Notification sent!");
    } catch (error) {
        toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-2xl font-bold mb-6">Global Notification Panel</h2>
      <form onSubmit={handleSend} className="mb-6 space-y-4 max-w-2xl">
        <textarea placeholder="Enter notification message" value={notification.message} onChange={(e) => setNotification({ ...notification, message: e.target.value })} className="w-full p-2 border rounded" rows={3} required/>
        <select value={notification.target} onChange={(e) => setNotification({ ...notification, target: e.target.value })} className="w-full p-2 border rounded">
          <option>All Dashboards</option><option>Doctors Dashboard</option><option>Patients Dashboard</option><option>Pharmacy Dashboard</option><option>OT Staff Dashboard</option><option>Admin Dashboard</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Send Notification</button>
      </form>
      <div className="max-w-2xl">
        <h3 className="text-xl font-semibold mb-4">Sent Notifications</h3>
        {sentNotifications.length === 0 ? (<p className="text-gray-600">No notifications sent yet.</p>) : (<ul className="space-y-3 max-h-64 overflow-y-auto">{sentNotifications.map((n) => (<li key={n._id} className="border p-3 rounded bg-white shadow flex flex-col"><span className="font-semibold">{n.message}</span><span className="text-sm text-gray-500">Target: {n.target} | Sent at: {new Date(n.createdAt).toLocaleString()}</span></li>))}</ul>)}
      </div>
    </div>
  );
}