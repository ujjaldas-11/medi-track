import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { role } = useAuth();

  return (
    <Layout title={`${role?.toUpperCase()} Dashboard`}>
      <p>Welcome to your {role} dashboard.</p>
      {/* Add role-specific content here later */}
    </Layout>
  );
}