import { useAuthContext } from '../context/AuthContext';
export type { UserRole } from '../context/AuthContext';

export function useAuth() {
  const context = useAuthContext();
  return context;
}
