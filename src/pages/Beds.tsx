import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { updateBeds } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';

export default function Beds() {
  const { user } = useAuth();
  const [beds, setBeds] = useState({ totalBeds: 50, occupiedBeds: 0 });
  const centerId = "center1";

  const loadBeds = async () => {
    // For simplicity, we'll simulate fetch (you can expand later)
    setBeds({ totalBeds: 50, occupiedBeds: 32 });
  };

  const updateBedStatus = async (occupied: number) => {
    await updateBeds(centerId, beds.totalBeds, occupied);
    setBeds({ ...beds, occupiedBeds: occupied });
  };

  useEffect(() => {
    loadBeds();
  }, []);

  const freeBeds = beds.totalBeds - beds.occupiedBeds;

  return (
    <Layout title="Bed Availability">
      <div className="bg-white p-8 rounded shadow max-w-md">
        <div className="text-center mb-6">
          <p className="text-6xl font-bold text-green-600">{freeBeds}</p>
          <p className="text-gray-500">Beds Available</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => updateBedStatus(beds.occupiedBeds + 1)}
            className="bg-red-500 text-white py-4 rounded font-medium"
          >
            +1 Occupied
          </button>
          <button 
            onClick={() => updateBedStatus(Math.max(0, beds.occupiedBeds - 1))}
            className="bg-green-500 text-white py-4 rounded font-medium"
          >
            +1 Free
          </button>
        </div>
      </div>
    </Layout>
  );
}