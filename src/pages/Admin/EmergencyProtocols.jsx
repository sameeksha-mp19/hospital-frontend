import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';

export default function EmergencyProtocols() {
  const [protocols, setProtocols] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });

  const fetchProtocols = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/protocols", {
        // ✅ FIX: Use backticks
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch protocols.");
      setProtocols(await res.json());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => { fetchProtocols(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/protocols", {
        method: "POST",
        // ✅ FIX: Use backticks
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to add protocol.");
      toast.success("Protocol added successfully!");
      setForm({ name: "", description: "" });
      fetchProtocols();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleActive = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/protocols/${id}`, {
        method: 'PUT',
        // ✅ FIX: Use backticks
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to update status.");
      toast.info("Protocol status updated.");
      fetchProtocols();
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    // ... JSX is unchanged ...
    <div className="flex-1 p-6">
      <h2 className="text-2xl font-bold mb-6">Emergency Protocols</h2>
      <form onSubmit={handleAdd} className="mb-6 space-y-4 max-w-md">
        <input type="text" placeholder="Protocol Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded" required/>
        <textarea placeholder="Protocol Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded" rows={3} required/>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add Protocol</button>
      </form>
      <div>
        <h3 className="text-xl font-semibold mb-4">Existing Protocols</h3>
        <ul className="space-y-3 max-w-md">
          {protocols.map((p) => (
            <li key={p._id} className="border p-4 rounded flex justify-between items-center bg-white shadow">
              <div><h4 className="font-semibold">{p.name}</h4><p className="text-sm text-gray-600">{p.description}</p></div>
              <button onClick={() => toggleActive(p._id)} className={`px-3 py-1 rounded text-white ${p.active ? "bg-red-500" : "bg-blue-600"}`}>{p.active ? "Deactivate" : "Activate"}</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}