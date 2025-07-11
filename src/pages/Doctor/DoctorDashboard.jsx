import { useState, useEffect, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [queue, setQueue] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState("patients");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  const [otRequestForm, setOtRequestForm] = useState({ date: '', startTime: '', endTime: '' });
  const [isSubmittingOT, setIsSubmittingOT] = useState(false);

  const fetchDoctorState = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");

      const sessionRes = await fetch("http://localhost:5000/api/doctor/current-session", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!sessionRes.ok) throw new Error("Failed to fetch current session.");
      const sessionData = await sessionRes.json();

      if (sessionData) {
        setCurrentPatient(sessionData);
        setActiveTab("current");
      } else {
         // Only fetch queue if there isn't an active session restored
         const queueRes = await fetch("http://localhost:5000/api/doctor/queue", {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (!queueRes.ok) throw new Error("Failed to fetch queue");
         const queueData = await queueRes.json();
         setEmergencies(queueData.emergencies || []);
         setQueue(queueData.queue || []);
      }
    } catch (err) {
      toast.error(err.message);
      if (err.message.includes("token")) navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData || userData.role !== "Doctor") {
      navigate("/login");
    } else {
      setDoctor(userData);
      fetchDoctorState();
    }
  }, [navigate, fetchDoctorState]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:5000/api/pharmacy/search?q=${searchTerm}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) throw new Error("Drug search failed.");
          setSearchResults(await response.json());
        } catch (error) { toast.error(error.message); setSearchResults([]); }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const callNextPatient = async () => {
    const nextPatient = [...emergencies, ...queue][0];
    if (!nextPatient) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/doctor/call-next", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appointmentId: nextPatient._id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setCurrentPatient(data);
      setActiveTab("current");
      toast.success(`Now serving ${data.patientName}.`);
      fetchDoctorState();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmitPrescription = async () => {
    if (!diagnosis || medicines.length === 0) {
      return toast.error("Diagnosis and at least one medicine are required.");
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/doctor/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: currentPatient.patientId,
          appointmentId: currentPatient._id,
          diagnosis,
          medicines
        })
      });
      if (!response.ok) throw new Error("Failed to submit prescription");
      toast.success(`Prescription for ${currentPatient.patientName} submitted.`);
      setCurrentPatient(null);
      setActiveTab("patients");
      setDiagnosis("");
      setMedicines([]);
      setSearchTerm("");
      fetchDoctorState();
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  // ✅ THIS IS THE CORRECTED FUNCTION
  const handleAddMedicine = (drugName) => {
    const alreadyExists = medicines.some(med => med.name === drugName);
    if (drugName && !alreadyExists) {
      setMedicines([...medicines, { name: drugName, quantity: 1 }]);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveMedicine = (medToRemove) => {
    setMedicines(medicines.filter(med => med.name !== medToRemove));
  };

  const handleQuantityChange = (drugName, newQuantity) => {
    const qty = Math.max(1, parseInt(newQuantity) || 1);
    setMedicines(medicines.map(med => med.name === drugName ? { ...med, quantity: qty } : med));
  };
  
  const handleCompleteCurrent = async () => {
    if (!currentPatient) return;
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/doctor/cancel-serving", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appointmentId: currentPatient._id }),
      });
      toast.info("Session cancelled. Patient returned to queue.");
      setCurrentPatient(null);
      setActiveTab("patients");
      fetchDoctorState();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleOtFormChange = (e) => {
    setOtRequestForm({ ...otRequestForm, [e.target.name]: e.target.value });
  };

  const handleOTRequest = async (e) => {
    e.preventDefault();
    setIsSubmittingOT(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/doctor/request-ot", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(otRequestForm)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to request OT slot.");
      }
      toast.success("OT slot requested successfully!");
      setOtRequestForm({ date: '', startTime: '', endTime: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmittingOT(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <div className="mb-8 p-4">
          <h1 className="text-2xl font-bold text-indigo-700">👨‍⚕️ Doctor Portal</h1>
          <p className="text-gray-600 text-sm">Welcome back, {doctor?.name}</p>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLink to="#" onClick={() => setActiveTab("patients")} className={() => `flex items-center p-3 rounded-lg transition ${activeTab === "patients" ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-indigo-50'}`}> <span className="mr-3">👥</span> Patients {emergencies.length > 0 && (<span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{emergencies.length}</span>)}</NavLink>
          <NavLink to="#" onClick={() => currentPatient && setActiveTab("current")} className={() => `flex items-center p-3 rounded-lg transition ${activeTab === "current" ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-indigo-50'} ${!currentPatient ? 'opacity-50 cursor-not-allowed' : ''}`}> <span className="mr-3">📝</span>Current Case</NavLink>
          <NavLink to="#" onClick={() => setActiveTab("ot")} className={() => `flex items-center p-3 rounded-lg transition ${activeTab === "ot" ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-indigo-50'}`}> <span className="mr-3">🏥</span> OT Schedule </NavLink>
        </nav>
        <button onClick={handleLogout} className="mt-auto p-3 text-left rounded-lg hover:bg-red-50 transition flex items-center text-red-600"> <span className="mr-3">🚪</span> Logout</button>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {activeTab === "patients" && (
           <div className="bg-white rounded-xl shadow-md p-6">
             <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-indigo-700">Patient Queue</h2><button onClick={callNextPatient} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400" disabled={([...emergencies, ...queue].length === 0) || !!currentPatient}>Call Next Patient</button></div>
             {emergencies.length > 0 && (<div className="mb-8"><h3 className="text-xl font-semibold mb-3 text-red-600 flex items-center"><span className="mr-2">🚨</span> Emergency Cases ({emergencies.length})</h3><ul className="space-y-3">{emergencies.map(patient => (<li key={patient._id} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500"><div className="flex justify-between items-center"><div><p className="font-semibold">{patient.patientName}</p><p className="text-sm">Token #{patient.tokenNumber}</p><p className="text-sm italic">{patient.reason || "Emergency"}</p></div><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">EMERGENCY</span></div></li>))}</ul></div>)}
             <div><h3 className="text-xl font-semibold mb-3 text-indigo-600">Regular Queue ({queue.length})</h3>{queue.length > 0 ? (<ul className="space-y-3">{queue.map(patient => (<li key={patient._id} className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500 hover:bg-indigo-100"><div className="flex justify-between items-center"><div><p className="font-semibold">{patient.patientName}</p><p className="text-sm">Token #{patient.tokenNumber}</p><p className="text-sm italic">{patient.reason}</p></div><span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">NORMAL</span></div></li>))}</ul>) : emergencies.length === 0 ? (<p className="text-gray-500 italic">The queue is empty.</p>) : <p className="text-gray-500 italic">No patients in regular queue.</p>}</div>
           </div>
        )}
        {activeTab === "current" && currentPatient && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-indigo-700">Current Patient: {currentPatient.patientName}</h2>
              <div><label className="block font-medium mb-2 text-gray-700">Diagnosis</label><textarea className="w-full border border-gray-300 rounded p-2" rows="3" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}/></div>
              <div className="mt-4"><label className="block font-medium mb-2 text-gray-700">Prescribe Medicines</label><div className="relative"><input type="text" placeholder="Type to search for a drug..." className="w-full border border-gray-300 rounded p-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />{searchResults.length > 0 && (<ul className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-40 overflow-y-auto">{searchResults.map((drug) => (<li key={drug._id} onClick={() => handleAddMedicine(drug.name)} className="p-2 hover:bg-indigo-100 cursor-pointer">{drug.name} <span className="text-xs text-gray-500">(Stock: {drug.stock})</span></li>))}</ul>)}</div></div>
              {medicines.length > 0 && (<div className="mt-4"><h4 className="font-semibold text-sm mb-2">Prescribed:</h4><ul className="space-y-2">{medicines.map((med) => (<li key={med.name} className="flex justify-between items-center bg-gray-100 p-2 rounded"><span className="text-gray-800 flex-grow">{med.name}</span><div className="flex items-center"><label className="text-sm mr-2">Qty:</label><input type="number" value={med.quantity} onChange={(e) => handleQuantityChange(med.name, e.target.value)} className="w-20 text-center border rounded-md p-1"/></div><button onClick={() => handleRemoveMedicine(med.name)} className="ml-4 text-red-500 hover:text-red-700 text-xs font-bold">REMOVE</button></li>))}</ul></div>)}
              <div className="flex justify-end space-x-3 mt-6"><button onClick={handleCompleteCurrent} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button><button onClick={handleSubmitPrescription} className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">Submit Prescription</button></div>
            </div>
        )}
        {activeTab === "ot" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">OT Schedule</h2><div className="border-t pt-6"><h3 className="text-xl font-semibold mb-4 text-indigo-600">Request New OT Slot</h3><form onSubmit={handleOTRequest} className="space-y-4 max-w-md"><div><label className="block mb-2 font-medium text-gray-700">Date</label><input type="date" name="date" className="w-full border border-gray-300 rounded p-2" required min={new Date().toISOString().split("T")[0]} value={otRequestForm.date} onChange={handleOtFormChange}/></div><div className="grid grid-cols-2 gap-4"><div><label className="block mb-2 font-medium text-gray-700">Start Time</label><input type="time" name="startTime" className="w-full border border-gray-300 rounded p-2" required value={otRequestForm.startTime} onChange={handleOtFormChange}/></div><div><label className="block mb-2 font-medium text-gray-700">End Time</label><input type="time" name="endTime" className="w-full border border-gray-300 rounded p-2" required value={otRequestForm.endTime} onChange={handleOtFormChange}/></div></div><button type="submit" className="bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 disabled:opacity-50" disabled={isSubmittingOT}>{isSubmittingOT ? 'Requesting...' : 'Request OT Slot'}</button></form></div>
          </div>
        )}
      </div>
    </div>
  );
}