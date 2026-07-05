import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { addDoctor, toggleDoctorAttendance } from '../lib/firestore';
import { useAuth } from '../hooks/useAuth';

export default function Doctors() {
  const { canManageDoctors } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real Firestore query later
      // For now using sample data
      const sampleData = [
        { id: "d1", name: "Dr. Sharma", specialty: "Medical Officer", isPresent: true },
        { id: "d2", name: "Nurse Priya", specialty: "Nurse", isPresent: false }
      ];
      setDoctors(sampleData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!newName) return alert("Name is required");
    if (!canManageDoctors) return alert("No permission");

    await addDoctor({
      centerId: "center1",
      name: newName,
      specialty: newSpecialty || "General",
      isPresent: true
    });

    setNewName('');
    setNewSpecialty('');
    loadDoctors(); // Refresh
  };

  const toggleAttendance = async (id: string, currentStatus: boolean) => {
    if (!canManageDoctors) return alert("No permission");

    await toggleDoctorAttendance(id, !currentStatus);
    loadDoctors(); // This should refresh the list
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  return (
    <Layout title="Doctor & Staff Attendance">
      {canManageDoctors && (
        <div className="bg-white p-5 rounded shadow mb-6">
          <h3 className="mb-3">Add New Staff</h3>
          <div className="flex gap-3">
            <input type="text" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 p-3 border rounded" />
            <input type="text" placeholder="Specialty" value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} className="flex-1 p-3 border rounded" />
            <button onClick={handleAddDoctor} className="bg-green-600 text-white px-6 py-3 rounded">Add</button>
          </div>
        </div>
      )}

      <table className="w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Name</th>
            <th className="p-3">Specialty</th>
            <th className="p-3">Status</th>
            {canManageDoctors && <th className="p-3">Action</th>}
          </tr>
        </thead>
        <tbody>
          {doctors.map(d => (
            <tr key={d.id}>
              <td className="p-3">{d.name}</td>
              <td className="p-3">{d.specialty}</td>
              <td className={`p-3 font-bold ${d.isPresent ? 'text-green-600' : 'text-red-600'}`}>
                {d.isPresent ? 'Present' : 'Absent'}
              </td>
              {canManageDoctors && (
                <td className="p-3">
                  <button 
                    onClick={() => toggleAttendance(d.id, d.isPresent)}
                    className="bg-blue-600 text-white px-5 py-2 rounded text-sm"
                  >
                    Toggle
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