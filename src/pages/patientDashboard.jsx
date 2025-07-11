// src/pages/PatientDashboard.jsx
import React, { useEffect, useState } from 'react';
import API from '../api';

const PatientDashboard = () => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    API.get('/dashboard/patient')
      .then((res) => setInfo(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!info) return <p>Loading...</p>;

  return (
    <div>
      <h2>Your Scheduled Surgeries</h2>
      {info.schedules.map(s => (
        <div key={s._id}>
          <p>{s.surgery} in {s.ot.name}</p>
        </div>
      ))}

      <h2>Your Queue Token</h2>
      {info.myToken ? <p>Token #{info.myToken.token}</p> : <p>No current token</p>}
    </div>
  );
};

export default PatientDashboard;
