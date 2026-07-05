import { useState } from 'react';
import Layout from '../components/Layout';
import { addPatientFootfall } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';

export default function Registration() {
  const { role } = useAuth();
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleCheckIn = async () => {
    if (!patientName) return alert("Patient name is required");

    await addPatientFootfall("center1", 1); // Increment footfall

    setMessage(`Patient ${patientName} checked in successfully!`);
    setPatientName('');
    setPhone('');

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <Layout title="Patient Registration">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-6">New Patient Check-in</h2>

        <input 
          type="text" 
          placeholder="Patient Name" 
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="w-full p-4 border rounded-lg mb-4 text-lg"
        />

        <input 
          type="tel" 
          placeholder="Phone Number (Optional)" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-4 border rounded-lg mb-6 text-lg"
        />

        <button 
          onClick={handleCheckIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-xl text-xl font-medium"
        >
          Check-in Patient
        </button>

        {message && (
          <p className="mt-6 text-center text-green-600 font-medium text-lg">
            {message}
          </p>
        )}
      </div>
    </Layout>
  );
}