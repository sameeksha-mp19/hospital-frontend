import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';

export default function HospitalStats() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          // ✅ FIX: Use backticks
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Could not fetch stats.");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  
  return (
    // ... JSX is unchanged ...
    <div className="flex-1 p-6">
      <h2 className="text-2xl font-bold mb-6">Hospital Stats</h2>
      {loading ? <p>Loading stats...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded p-4"><h3 className="text-lg font-semibold">Doctors On Duty</h3><p className="text-3xl font-bold">{stats.doctorsOnDuty ?? 'N/A'}</p></div>
          <div className="bg-white shadow rounded p-4"><h3 className="text-lg font-semibold">Patients Admitted Today</h3><p className="text-3xl font-bold">{stats.patientsAdmitted ?? 'N/A'}</p></div>
          <div className="bg-white shadow rounded p-4"><h3 className="text-lg font-semibold">Pharmacy Orders Today</h3><p className="text-3xl font-bold">{stats.pharmacyOrders ?? 'N/A'}</p></div>
          <div className="bg-white shadow rounded p-4"><h3 className="text-lg font-semibold">Emergencies Today</h3><p className="text-3xl font-bold text-red-600">{stats.emergenciesToday ?? 'N/A'}</p></div>
        </div>
      )}
    </div>
  );
}