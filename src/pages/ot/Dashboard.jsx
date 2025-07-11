import { useState, useEffect, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";

export default function OTDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("calendar");
  const [loading, setLoading] = useState(true);

  // Data from backend
  const [otSlots, setOtSlots] = useState([]);
  const [doctorRequests, setDoctorRequests] = useState([]);
  const [availableSlotsForRequest, setAvailableSlotsForRequest] = useState({});
  
  // State for forms
  const [emergencyForm, setEmergencyForm] = useState({ patientName: "", reason: "", date: "", startTime: "09:00", room: "OT-1" });
  const [newSlotForm, setNewSlotForm] = useState({ date: '', startTime: '09:00', endTime: '11:00', room: 'OT-1' });

  const availableRooms = ["OT-1", "OT-2", "OT-3", "OT-4", "OT-5"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [requestsRes, schedulesRes] = await Promise.all([
        fetch('http://localhost:5000/api/ot-staff/requests', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/ot-staff/schedules', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (!requestsRes.ok) throw new Error("Failed to fetch OT requests.");
      if (!schedulesRes.ok) throw new Error("Failed to fetch OT schedules.");
      const requestsData = await requestsRes.json();
      const schedulesData = await schedulesRes.json();
      setDoctorRequests(requestsData);
      setOtSlots(schedulesData);
    } catch (error) { toast.error(error.message); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFindSlots = async (request, room) => {
    try {
        const token = localStorage.getItem("token");
        const dateISO = new Date(request.date).toISOString().split('T')[0];
        const res = await fetch(`http://localhost:5000/api/ot-staff/find-slots?date=${dateISO}&room=${room}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Could not find slots for this request.");
        const slots = await res.json();
        setAvailableSlotsForRequest(prev => ({ ...prev, [`${request._id}-${room}`]: slots }));
        if (slots.length === 0) toast.warn(`No available slots found for ${room} on ${new Date(request.date).toLocaleDateString()}.`);
    } catch (error) { toast.error(error.message); }
  };

  const handleAssignRequest = async (requestId, scheduleId) => {
    if (!scheduleId) return;
    try {
        const token = localStorage.getItem("token");
        await fetch('http://localhost:5000/api/ot-staff/assign-request', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ requestId, scheduleId })
        });
        toast.success("Doctor's request has been scheduled!");
        fetchData();
    } catch (error) { toast.error(error.message); }
  };

  const handleStatusChange = async (slotId, newStatus) => {
    try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5000/api/ot-staff/schedules/${slotId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });
        toast.info("OT status updated.");
        fetchData();
    } catch (error) { toast.error(error.message); }
  };

  const handleEmergencyChange = (e) => {
    setEmergencyForm({ ...emergencyForm, [e.target.name]: e.target.value });
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    const startTimeHour = parseInt(emergencyForm.startTime.split(':')[0]);
    const endTime = `${String(startTimeHour + 2).padStart(2, '0')}:00`;
    const bookingData = { ...emergencyForm, endTime };
    try {
        const token = localStorage.getItem("token");
        await fetch('http://localhost:5000/api/ot-staff/emergency-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(bookingData)
        });
        toast.success("Emergency OT slot reserved!");
        setEmergencyForm({ patientName: "", reason: "", date: "", startTime: "09:00", room: "OT-1" });
        fetchData();
    } catch (error) { toast.error(error.message); }
  };

  const handleNewSlotChange = (e) => {
    setNewSlotForm({ ...newSlotForm, [e.target.name]: e.target.value });
  };

  const handleCreateSlotSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("token");
        const res = await fetch('http://localhost:5000/api/ot-staff/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(newSlotForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create slot.");
        toast.success("New available slot created!");
        fetchData();
    } catch (error) { toast.error(error.message); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-700 border-green-200";
      case "Occupied": return "bg-red-100 text-red-700 border-red-200";
      case "Booked": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <div className="mb-8 p-4"><h1 className="text-2xl font-bold text-indigo-700">🏥 OT Staff Portal</h1><p className="text-gray-600 text-sm">Welcome back, OT Staff</p></div>
        <nav className="flex-1 space-y-2">
          <NavLink to="#" onClick={() => setActiveTab("requests")} className={() => `flex items-center p-3 rounded-lg transition ${activeTab === "requests" ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-indigo-50'}`}><span className="mr-3">📥</span> OT Requests {doctorRequests.length > 0 && (<span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{doctorRequests.length}</span>)}</NavLink>
          <NavLink to="#" onClick={() => setActiveTab("calendar")} className={() => `flex items-center p-3 rounded-lg transition ${activeTab === "calendar" ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-indigo-50'}`}><span className="mr-3">📅</span> OT Calendar</NavLink>
          <NavLink to="#" onClick={() => setActiveTab("emergency")} className={() => `flex items-center p-3 rounded-lg transition ${activeTab === "emergency" ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-indigo-50'}`}><span className="mr-3">🚨</span> Emergency Booking</NavLink>
        </nav>
        <button onClick={handleLogout} className="mt-auto p-3 text-left rounded-lg hover:bg-red-50 transition flex items-center text-red-600"><span className="mr-3">🚪</span> Logout</button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? <div className="text-center p-10">Loading OT Dashboard...</div> : (
          <>
            {activeTab === 'requests' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-indigo-700">📥 Pending OT Requests</h2>
                {doctorRequests.length === 0 ? <p className="text-gray-500">No new OT requests.</p> : (<div className="space-y-4">{doctorRequests.map((req) => (
                  <div key={req._id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div><p className="font-semibold">Patient:</p><p>{req.patientName}</p></div>
                      <div><p className="font-semibold">Operation:</p><p>{req.operationType}</p></div>
                      <div><p className="font-semibold">Requested Date:</p><p>{new Date(req.date).toLocaleDateString()}</p></div>
                      <div><p className="font-semibold">Requested By:</p><p>{req.doctorId?.name} ({req.doctorId?.department})</p></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200"><p className="font-semibold text-sm mb-2">Find & Assign Slot:</p><div className="flex flex-wrap gap-2">{availableRooms.map(room => (<div key={room}><button onClick={() => handleFindSlots(req, room)} className="bg-indigo-600 text-white px-3 py-1 text-xs rounded-md hover:bg-indigo-700">Find for {room}</button>{availableSlotsForRequest[`${req._id}-${room}`] && (<select onChange={(e) => handleAssignRequest(req._id, e.target.value)} className="mt-1 p-1 border border-gray-300 rounded-md text-xs" defaultValue=""><option value="" disabled>Assign Time...</option>{availableSlotsForRequest[`${req._id}-${room}`].map(slot => (<option key={slot._id} value={slot._id}>{slot.startTime} - {slot.endTime}</option>))}</select>)}</div>))}</div></div>
                  </div>
                ))}</div>)}
              </div>
            )}
            {activeTab === 'calendar' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-indigo-700">📅 OT Calendar Management</h2>
                <div className="mb-8 p-4 border rounded-lg bg-gray-50"><h3 className="text-lg font-semibold mb-3">Add New Available Slot</h3><form onSubmit={handleCreateSlotSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end"><div><label className="text-sm font-medium">Date</label><input type="date" name="date" value={newSlotForm.date} onChange={handleNewSlotChange} className="w-full p-2 border rounded-md" required/></div><div><label className="text-sm font-medium">Start Time</label><input type="time" name="startTime" value={newSlotForm.startTime} onChange={handleNewSlotChange} className="w-full p-2 border rounded-md" required/></div><div><label className="text-sm font-medium">End Time</label><input type="time" name="endTime" value={newSlotForm.endTime} onChange={handleNewSlotChange} className="w-full p-2 border rounded-md" required/></div><div><label className="text-sm font-medium">Room</label><select name="room" value={newSlotForm.room} onChange={handleNewSlotChange} className="w-full p-2 border rounded-md">{availableRooms.map(r => <option key={r} value={r}>{r}</option>)}</select></div><button type="submit" className="col-span-2 md:col-span-4 bg-green-600 text-white p-2 rounded-md hover:bg-green-700">Add Slot to Calendar</button></form></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{otSlots.map((slot) => (<div key={slot._id} className={`p-4 rounded-lg border ${getStatusColor(slot.status)}`}><div className="mb-2"><p className="font-semibold">Room:</p><p className="font-bold">{slot.room}</p></div><div className="mb-2"><p className="font-semibold">Date:</p><p>{new Date(slot.date).toLocaleDateString()}</p></div><div className="mb-2"><p className="font-semibold">Time:</p><p>{slot.startTime} - {slot.endTime}</p></div>{slot.patientName && (<div className="mt-3 p-2 bg-gray-50 rounded"><p className="font-semibold">Patient:</p><p>{slot.patientName}</p>{slot.operationType && (<><p className="font-semibold mt-1">Procedure:</p><p>{slot.operationType}</p></>)}{slot.isEmergency && (<span className="inline-block mt-1 px-2 py-1 bg-red-200 text-red-800 text-xs rounded">EMERGENCY</span>)}</div>)}
                  {/* ✅ THE ONCHANGE HANDLER IS NOW CORRECTLY WIRED */}
                  <select value={slot.status} onChange={(e) => handleStatusChange(slot._id, e.target.value)} className={`mt-3 w-full p-1 border rounded-md ${getStatusColor(slot.status)}`}><option value="Available">Available</option><option value="Occupied">Occupied</option><option value="Booked">Booked</option><option value="Unavailable">Unavailable</option></select>
                </div>))}</div>
              </div>
            )}
            {activeTab === 'emergency' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-indigo-700">🚨 Emergency OT Booking</h2>
                <form onSubmit={handleEmergencySubmit} className="space-y-4 max-w-2xl"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block mb-1 font-medium">Patient Name</label><input type="text" name="patientName" placeholder="Patient Name" value={emergencyForm.patientName} onChange={handleEmergencyChange} className="w-full p-2 border rounded-md" required/></div><div><label className="block mb-1 font-medium">Surgery Reason</label><input type="text" name="reason" placeholder="Surgery Reason" value={emergencyForm.reason} onChange={handleEmergencyChange} className="w-full p-2 border rounded-md" required/></div><div><label className="block mb-1 font-medium">Date</label><input type="date" name="date" value={emergencyForm.date} onChange={handleEmergencyChange} className="w-full p-2 border rounded-md" required/></div><div><label className="block mb-1 font-medium">Start Time</label><input type="time" name="startTime" value={emergencyForm.startTime} onChange={handleEmergencyChange} className="w-full p-2 border rounded-md" required/></div><div><label className="block mb-1 font-medium">OT Room</label><select name="room" value={emergencyForm.room} onChange={handleEmergencyChange} className="w-full p-2 border rounded-md" required>{availableRooms.map(room => (<option key={room} value={room}>{room}</option>))}</select></div></div><button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Reserve Emergency OT</button></form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}