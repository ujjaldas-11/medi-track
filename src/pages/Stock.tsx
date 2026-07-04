import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getStockByCenter, updateStock } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';

export default function Stock() {
  const { user } = useAuth();
  const [stockList, setStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const centerId = "center1"; // Change this dynamically later

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    setLoading(true);
    const data = await getStockByCenter(centerId);
    setStockList(data);
    setLoading(false);
  };

  const handleUpdateStock = async (stockId: string, newStock: number) => {
    await updateStock(stockId, newStock);
    loadStock(); // Refresh list
  };

  return (
    <Layout title="Stock Management">
      <div className="mb-4">
        <button 
          onClick={loadStock}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading stock...</p>
      ) : (
        <table className="w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Medicine</th>
              <th className="p-3">Current Stock</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {stockList.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.medicineName}</td>
                <td className="p-3 text-center font-bold">{item.currentStock}</td>
                <td className="p-3">
                  <button 
                    onClick={() => handleUpdateStock(item.id, item.currentStock - 5)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
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