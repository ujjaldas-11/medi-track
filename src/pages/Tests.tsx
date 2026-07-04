import Layout from '../components/Layout';

export default function Tests() {
  return (
    <Layout title="Test Availability">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded shadow">Blood Test - Available</div>
        <div className="bg-white p-6 rounded shadow">X-Ray - Not Available</div>
      </div>
    </Layout>
  );
}