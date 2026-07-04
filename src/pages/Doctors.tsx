import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { addDoctor, toggleDoctorAttendance } from '../lib/firestore';

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);

  const loadDoctors = async () => {
    // You can expand this later with proper query
    setDoctors([
      { id: "d1", name: "Dr. Sharma", specialty: "MO", isPresent: true },
      { id: "d2", name: "Dr. Patel", specialty: "Pediatric", isPresent: false }
    ]);
  };

  const toggleAttendance = async (doctorId: string, currentStatus: boolean) => {
    await toggleDoctorAttendance(doctorId, !currentStatus);
    loadDoctors();
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  return (
    <Layout title="Doctor Attendance">
      <table className="w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Doctor Name</th>
            <th className="p-3">Specialty</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc.id} className="border-t">
              <td className="p-3">{doc.name}</td>
              <td className="p-3">{doc.specialty}</td>
              <td className={`p-3 font-medium ${doc.isPresent ? 'text-green-600' : 'text-red-600'}`}>
                {doc.isPresent ? 'Present' : 'Absent'}
              </td>
              <td className="p-3">
                <button 
                  onClick={() => toggleAttendance(doc.id, doc.isPresent)}
                  className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
                >
                  Mark {doc.isPresent ? 'Absent' : 'Present'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}