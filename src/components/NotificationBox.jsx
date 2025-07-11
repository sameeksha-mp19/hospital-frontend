// src/components/NotificationBox.jsx
import { useEffect, useState } from "react";

export default function NotificationBox() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate polling API every 5 seconds
    const interval = setInterval(() => {
      // Dummy: randomly add a notification for demo
      const newNotification = Math.random() < 0.3
        ? `Your token number ${Math.floor(Math.random() * 20) + 1} is called!`
        : null;

      if (newNotification) {
        setNotifications((prev) => [newNotification, ...prev].slice(0, 5));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border p-4 rounded-lg shadow max-w-md mx-auto mt-6">
      <h3 className="text-lg font-semibold mb-3">🔔 Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-600">No new notifications</p>
      ) : (
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {notifications.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
