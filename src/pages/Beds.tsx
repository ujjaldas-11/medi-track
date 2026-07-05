import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { updateBeds } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';

export default function Beds() {
  const { canManageBeds } = useAuth();
  const [totalBeds, setTotalBeds] = useState(50);
  const [occupiedBeds, setOccupiedBeds] = useState(28);
  const centerId = "center1";

  const saveBedData = async () => {
    if (!canManageBeds) {
      alert("You don't have permission to manage beds.");
      return;
    }
    await updateBeds(centerId, totalBeds, occupiedBeds);
    alert("Bed data saved successfully!");
  };

  return (
    <Layout title="Bed Management">
      <div className="bg-white p-8 rounded shadow max-w-lg">
        <div className="mb-6">
          <label className="block text-sm mb-2">Total Beds</label>
          <input 
            type="number" 
            value={totalBeds}
            onChange={(e) => setTotalBeds(Number(e.target.value))}
            className="w-full p-4 border rounded text-3xl"
            disabled={!canManageBeds}
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm mb-2">Occupied Beds</label>
          <input 
            type="number" 
            value={occupiedBeds}
            onChange={(e) => setOccupiedBeds(Number(e.target.value))}
            className="w-full p-4 border rounded text-3xl"
            disabled={!canManageBeds}
          />
        </div>

        <div className="text-6xl font-bold text-center text-green-600 mb-8">
          {totalBeds - occupiedBeds} Free
        </div>

        {canManageBeds && (
          <button 
            onClick={saveBedData}
            className="w-full bg-blue-600 text-white py-4 rounded text-lg font-medium"
          >
            Save Bed Status
          </button>
        )}
      </div>
    </Layout>
  );
}