import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { getStockByCenter, listenToStock } from '../lib/firestore';

export default function CommandCentre() {
  const { role } = useAuth();
  const [totalCentres] = useState(42);
  const [totalFootfall] = useState(1248);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [flaggedCentres] = useState(7);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    // Simulate fetching district-wide stock alerts
    const unsubscribe = listenToStock("center1", (data) => {
      const lowStock = data.filter(item => item.currentStock < item.minStock || 20);
      setLowStockCount(lowStock.length);
    });

    // Mock AI Recommendations
    setRecommendations([
      {
        id: 1,
        text: "Move 500 Paracetamol from PHC-Rajpura to CHC-Main",
        reason: "High demand forecast in CHC-Main"
      },
      {
        id: 2,
        text: "Urgent insulin supply needed for PHC-Sector 5",
        reason: "Stock below critical threshold"
      }
    ]);

    return () => unsubscribe();
  }, []);

  return (
    <Layout title="Command Centre - District Overview">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Centres</p>
          <p className="text-5xl font-bold mt-2">{totalCentres}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Today's Footfall</p>
          <p className="text-5xl font-bold mt-2 text-blue-600">{totalFootfall}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Low Stock Alerts</p>
          <p className="text-5xl font-bold mt-2 text-red-600">{lowStockCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Flagged Centres</p>
          <p className="text-5xl font-bold mt-2 text-orange-600">{flaggedCentres}</p>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">AI Smart Recommendations</h3>
        <div className="space-y-4">
          {recommendations.map(rec => (
            <div key={rec.id} className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
              <div>
                <p className="font-medium">{rec.text}</p>
                <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
              </div>
              <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Approve
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Flagged Centres */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Underperforming Centres (Needs Immediate Attention)</h3>
        <div className="bg-white p-6 rounded-xl shadow">
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>PHC-Sector 12</span>
              <span className="text-red-600">Low Stock + High Absenteeism</span>
            </li>
            <li className="flex justify-between">
              <span>CHC-Village Area</span>
              <span className="text-red-600">Zero Test Availability</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}