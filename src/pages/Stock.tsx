import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getStockByCenter, updateStock } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';

export default function Stock() {
  const { user } = useAuth();
  const [stockList, setStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const centerId = "center1";   // Make this dynamic later based on user

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await getStockByCenter(centerId);
      setStockList(data);
    } catch (error) {
      console.error("Error loading stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (stockId: string, newStock: number) => {
    if (newStock < 0) return;
    await updateStock(stockId, newStock);
    loadStock(); // Refresh after update
  };

  return (
    <Layout title="Stock Management">
      <div className="mb-4 flex gap-3">
        <button 
          onClick={loadStock}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
        <button 
          onClick={() => {/* Add new medicine logic */}}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          + Add Medicine
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading stock data...</p>
      ) : stockList.length === 0 ? (
        <p>No stock data found. Add some using Seed Data.</p>
      ) : (
        <table className="w-full bg-white border rounded overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Medicine Name</th>
              <th className="p-3 text-center">Current Stock</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {stockList.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{item.medicineName}</td>
                <td className="p-3 text-center font-bold text-lg">
                  {item.currentStock}
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => handleUpdateStock(item.id, item.currentStock - 5)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
                  >
                    Use 5
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}