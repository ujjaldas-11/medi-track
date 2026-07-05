import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { addStock, getStockByCenter, updateStock } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';

export default function Stock() {
  const { canEditStock } = useAuth();
  const [stockList, setStockList] = useState<any[]>([]);
  const [newMedicine, setNewMedicine] = useState('');
  const [newStock, setNewStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const centerId = "center1";

  const loadStock = async () => {
    setLoading(true);
    const data = await getStockByCenter(centerId);
    setStockList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStock();
  }, []);

  // CREATE
  const handleAdd = async () => {
    if (!canEditStock) return alert("No permission");
    if (!newMedicine) return alert("Enter medicine name");

    await addStock({
      centerId,
      medicineName: newMedicine,
      currentStock: newStock || 10
    });

    setNewMedicine('');
    setNewStock(0);
    loadStock();
  };

  // UPDATE
  const handleUpdate = async (id: string, currentStock: number, change: number) => {
    if (!canEditStock) return alert("No permission");
    const newValue = currentStock + change;
    if (newValue < 0) return;
    await updateStock(id, newValue);
    loadStock();
  };

  // DELETE (Add this function in firestore.ts if needed)
  // For now using update to zero as soft delete

  return (
    <Layout title="Stock Management">
      {/* CREATE */}
      {canEditStock && (
        <div className="bg-white p-5 rounded shadow mb-6">
          <h3 className="mb-3 font-semibold">Add New Medicine</h3>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Medicine Name" 
              value={newMedicine}
              onChange={(e) => setNewMedicine(e.target.value)}
              className="flex-1 p-3 border rounded"
            />
            <input 
              type="number" 
              placeholder="Initial Stock" 
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="w-32 p-3 border rounded"
            />
            <button onClick={handleAdd} className="bg-green-600 text-white px-8 rounded">
              Add
            </button>
          </div>
        </div>
      )}

      {/* READ + UPDATE */}
      <table className="w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Medicine</th>
            <th className="p-3 text-center">Stock</th>
            {canEditStock && <th className="p-3 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {stockList.map(item => (
            <tr key={item.id} className="border-t">
              <td className="p-3">{item.medicineName}</td>
              <td className="p-3 text-center font-bold">{item.currentStock}</td>
              {canEditStock && (
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => handleUpdate(item.id, item.currentStock, -5)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                    -5
                  </button>
                  <button onClick={() => handleUpdate(item.id, item.currentStock, 5)} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                    +5
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}