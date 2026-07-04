import Layout from '../components/Layout';

export default function CommandCentre() {
  return (
    <Layout title="Command Centre - District Overview">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3>Total Centres</h3>
          <p className="text-4xl font-bold">42</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3>Low Stock Alerts</h3>
          <p className="text-4xl font-bold text-red-600">18</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3>Underperforming Centres</h3>
          <p className="text-4xl font-bold text-orange-600">7</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-4">AI Recommendations</h3>
        <div className="bg-white p-6 rounded shadow">
          Move 500 Paracetamol from PHC-A to CHC-B
          <button className="ml-4 bg-green-600 text-white px-4 py-2 rounded">Approve</button>
        </div>
      </div>
    </Layout>
  );
}