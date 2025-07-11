import React, { useEffect, useState } from 'react';
import API from '../api';
import socket from '../socket';

const StaffDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/dashboard/staff');
        setDashboard(res.data);
      } catch (error) {
        console.error('Error loading staff dashboard:', error);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    socket.on('alert', (alert) => {
      alert && setRealTimeAlerts((prev) => [alert, ...prev]);
      console.log('🚨 Real-time alert received:', alert);
    });

    return () => socket.off('alert');
  }, []);

  if (!dashboard) return <p>Loading...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>🩺 Staff Dashboard</h1>

      {/* Active Surgeries */}
      <section>
        <h2>🔧 Ongoing Surgeries</h2>
        {dashboard.otSchedules.length === 0 ? (
          <p>No active surgeries</p>
        ) : (
          dashboard.otSchedules.map((s) => (
            <div key={s._id} style={{ marginBottom: '10px', padding: '8px', border: '1px solid #ccc' }}>
              <p><strong>Surgery:</strong> {s.surgery}</p>
              <p><strong>Doctor:</strong> {s.doctor?.name || 'N/A'}</p>
              <p><strong>Start:</strong> {new Date(s.startTime).toLocaleString()}</p>
              <p><strong>Status:</strong> {s.status}</p>
            </div>
          ))
        )}
      </section>

      {/* Emergency Alerts */}
      <section>
        <h2>🚨 Emergency Alerts</h2>
        {realTimeAlerts.map((a, i) => (
          <div key={i} style={{ background: '#fee', padding: '8px', margin: '4px 0', borderLeft: '4px solid red' }}>
            <p><strong>{a.type}</strong> in <strong>{a.department}</strong>: {a.message}</p>
          </div>
        ))}
        {dashboard.activeAlerts.map((a) => (
          <div key={a._id} style={{ padding: '8px', margin: '4px 0', borderLeft: '4px solid red' }}>
            <p><strong>{a.type}</strong> in <strong>{a.department}</strong>: {a.message}</p>
          </div>
        ))}
      </section>

      {/* Low Stock Medicines */}
      <section>
        <h2>💊 Low Stock Medicines</h2>
        {dashboard.lowStockMeds.length === 0 ? (
          <p>All medicines in sufficient stock</p>
        ) : (
          dashboard.lowStockMeds.map((m) => (
            <div key={m._id}>
              <p>{m.name} — <strong>{m.stock}</strong> units left</p>
            </div>
          ))
        )}
      </section>

      {/* Token Queues */}
      <section>
        <h2>🧾 Consultation Queues</h2>
        {dashboard.queues.length === 0 ? (
          <p>No active queues</p>
        ) : (
          dashboard.queues.map((q) => (
            <div key={q._id} style={{ marginBottom: '8px' }}>
              <h4>Dr. {q.doctor.name}</h4>
              {q.tokens.map((t) => (
                <p key={t._id}>Token #{t.token} — {t.patient.name}</p>
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default StaffDashboard;
