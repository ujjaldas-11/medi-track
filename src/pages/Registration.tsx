import Layout from '../components/Layout';

export default function Registration() {
  return (
    <Layout title="Patient Registration">
      <div className="max-w-md">
        <input type="text" placeholder="Patient Name" className="w-full p-3 border rounded mb-4" />
        <input type="text" placeholder="Phone Number" className="w-full p-3 border rounded mb-4" />
        
        <button className="w-full bg-blue-600 text-white py-4 rounded text-lg">
          Check-in Patient
        </button>
      </div>
    </Layout>
  );
}