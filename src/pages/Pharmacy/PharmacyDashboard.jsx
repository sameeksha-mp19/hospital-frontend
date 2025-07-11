import React, { useEffect, useState, useCallback, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PharmacyDashboard() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorder, setReorder] = useState({ drugId: "", quantity: 10, notes: "" });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [invRes, preRes] = await Promise.all([
        fetch('http://localhost:5000/api/pharmacy/inventory', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/pharmacy/prescriptions', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (!invRes.ok) throw new Error("Failed to fetch inventory.");
      if (!preRes.ok) throw new Error("Failed to fetch prescriptions.");
      const invData = await invRes.json();
      const preData = await preRes.json();
      setInventory(invData);
      setPrescriptions(preData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const lowStockDrugs = useMemo(() => 
    inventory.filter((item) => item.stock <= item.lowStockThreshold),
    [inventory]
  );

  useEffect(() => {
    if (lowStockDrugs.length > 0 && !reorder.drugId) {
      const firstDrug = lowStockDrugs[0];
      setReorder({ drugId: firstDrug._id, quantity: 10, notes: `Auto-reorder for low stock (${firstDrug.stock})` });
    } else if (lowStockDrugs.length === 0) {
      setReorder({ drugId: "", quantity: 10, notes: "" });
    }
  }, [lowStockDrugs, reorder.drugId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleRestock = async (drugId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/pharmacy/inventory/${drugId}/restock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity: 10 })
      });
      toast.success("Restocked +10 units!");
      fetchData();
    } catch (error) { toast.error("Failed to restock."); }
  };
  
  const handleReorderChange = (e) => {
    setReorder({ ...reorder, [e.target.name]: e.target.value });
  };
  
  const handleReorderSubmit = (e) => {
    e.preventDefault();
    const drug = inventory.find(item => item._id === reorder.drugId);
    toast.info(`Reorder request for ${drug?.name} submitted (Demo).`);
  };

  const handleMarkDispensed = async (prescriptionId) => {
    if (!window.confirm("Confirm: Mark as dispensed? This will update inventory.")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/pharmacy/prescriptions/${prescriptionId}/dispense`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success("Prescription dispensed!");
      fetchData();
    } catch (error) { toast.error("Failed to dispense."); }
  };

  // ✅ THIS IS THE CORRECTED FUNCTION
  // It now correctly filters the flat array of prescriptions.
  const getPendingPrescriptionsCount = (drugName) => {
    return prescriptions.filter(p => p.drugName === drugName && p.status === "Pending").length;
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-white shadow-md p-4 h-screen flex flex-col">
        <div>
          <h1 className="text-2xl font-bold mb-6 text-indigo-700">Pharmacy Portal</h1>
          <nav className="space-y-2 text-sm">
            <NavLink to="/pharmacy/dashboard" className="block px-4 py-2 rounded bg-indigo-500 text-white">
              🏠 Dashboard
            </NavLink>
          </nav>
        </div>
        <button onClick={handleLogout} className="mt-auto w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          🚪 Logout
        </button>
      </div>

      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Pharmacy Dashboard</h2>
        {loading ? <div className="text-center p-10">Loading pharmacy data...</div> : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Inventory Tracker */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4">Inventory Tracker</h3>
              <table className="w-full text-sm">
                <thead className="text-left border-b"><tr><th className="py-2 pr-4">Drug</th><th className="py-2 pr-4">Current Stock</th><th className="py-2 pr-4">Pending</th><th className="py-2 pr-4">Expiry</th><th className="py-2">Actions</th></tr></thead>
                <tbody>
                  {inventory.map((drug) => {
                    const isLow = drug.stock <= drug.lowStockThreshold;
                    const pendingCount = getPendingPrescriptionsCount(drug.name);
                    return (
                      <tr key={drug._id} className={`border-b ${isLow ? "bg-red-50 text-red-700" : ""}`}>
                        <td className="py-2 pr-4">{drug.name}{isLow && <span className="ml-2 text-xs bg-red-100 px-2 py-0.5 rounded-full">⚠ Low Stock</span>}</td>
                        <td className="py-2 pr-4">{drug.stock}</td>
                        <td className="py-2 pr-4">{pendingCount > 0 ? <span className="text-orange-600 font-bold">{pendingCount}</span> : "None"}</td>
                        <td className="py-2 pr-4">{new Date(drug.expiryDate).toLocaleDateString()}</td>
                        <td className="py-2"><button onClick={() => handleRestock(drug._id)} className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded">Restock (+10)</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Reorder Requests */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Reorder Requests (Demo)</h3>
              {lowStockDrugs.length === 0 ? <p className="text-gray-500">No low-stock drugs to reorder.</p> : (<form onSubmit={handleReorderSubmit} className="space-y-3 text-sm"><select name="drugId" value={reorder.drugId} onChange={handleReorderChange} required className="w-full p-2 border rounded"><option value="">Select Drug</option>{lowStockDrugs.map((drug) => (<option key={drug._id} value={drug._id}>{drug.name} (Qty: {drug.stock})</option>))}</select><input type="number" name="quantity" value={reorder.quantity} onChange={handleReorderChange} className="w-full p-2 border rounded" required min="1"/><textarea name="notes" value={reorder.notes} onChange={handleReorderChange} rows={3} className="w-full p-2 border rounded" placeholder="Optional notes..."></textarea><button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">Submit Reorder</button></form>)}
            </div>

            {/* Prescription Queue */}
            <div className="md:col-span-3 bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Prescription Queue</h3>
              {prescriptions.length === 0 ? <p className="text-gray-500">No prescriptions at the moment.</p> : (
                <table className="w-full text-sm">
                  <thead className="text-left border-b"><tr><th className="py-2 pr-4">Patient</th><th className="py-2 pr-4">Medicine</th><th className="py-2 pr-4">Quantity</th><th className="py-2 pr-4">Status</th><th className="py-2">Actions</th></tr></thead>
                  <tbody>
                    {prescriptions.map((p) => {
                      const drugInInventory = inventory.find(item => item.name === p.drugName);
                      const canDispense = drugInInventory && drugInInventory.stock >= p.quantity;
                      return (
                        <tr key={p._id} className="border-b">
                          <td className="py-2 pr-4">{p.patientId?.name || "N/A"}</td>
                          <td className="py-2 pr-4">{p.drugName}</td>
                          <td className="py-2 pr-4">{p.quantity}</td>
                          <td className="py-2 pr-4">
                            <span className="font-medium">{p.status}</span>
                            {p.status === "Pending" && !canDispense && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Insufficient Stock</span>}
                          </td>
                          <td className="py-2">
                            {p.status === "Pending" ? (
                              <button onClick={() => handleMarkDispensed(p._id)} disabled={!canDispense} className={`px-3 py-1 text-sm ${canDispense ? "bg-indigo-500 hover:bg-indigo-600" : "bg-gray-300 cursor-not-allowed"} text-white rounded`}>
                                {canDispense ? "Mark as Dispensed" : "Cannot Dispense"}
                              </button>
                            ) : (<span className="text-green-600 font-medium">✓ Dispensed</span>)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}