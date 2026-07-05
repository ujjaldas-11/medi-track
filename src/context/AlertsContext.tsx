import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export interface SystemAlert {
  id: string;
  centerId: string;
  centerName: string;
  type: 'low_stock' | 'doctor_absence' | 'overloaded_center' | 'critical_stock';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  isRead: boolean;
  createdAt: any;
}

interface AlertsContextType {
  alerts: SystemAlert[];
  unreadCount: number;
  addAlert: (alert: Omit<SystemAlert, 'id' | 'isRead' | 'createdAt'>) => Promise<string>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const q = query(
      collection(db, 'alerts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAlerts: SystemAlert[] = [];
      
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const alertItem = { id: change.doc.id, ...data } as SystemAlert;
        
        // Only trigger toasts for new alerts added in real-time, not the initial snapshot load
        if (change.type === 'added' && !isFirstMount.current) {
          if (alertItem.severity === 'critical') {
            toast.error(alertItem.message, { position: 'bottom-right' });
          } else if (alertItem.severity === 'warning') {
            toast.warn(alertItem.message, { position: 'bottom-right' });
          } else {
            toast.info(alertItem.message, { position: 'bottom-right' });
          }
        }
      });

      snapshot.docs.forEach(doc => {
        fetchedAlerts.push({ id: doc.id, ...doc.data() } as SystemAlert);
      });

      setAlerts(fetchedAlerts);
      isFirstMount.current = false;
    }, (err) => {
      console.error('Error fetching alerts: ', err);
    });

    return () => unsubscribe();
  }, []);

  const addAlert = async (alert: Omit<SystemAlert, 'id' | 'isRead' | 'createdAt'>) => {
    const docRef = await addDoc(collection(db, 'alerts'), {
      ...alert,
      isRead: false,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  };

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'alerts', id), { isRead: true });
  };

  const markAllAsRead = async () => {
    const unreadAlerts = alerts.filter(a => !a.isRead);
    if (unreadAlerts.length === 0) return;
    
    const batch = writeBatch(db);
    unreadAlerts.forEach(alert => {
      const alertRef = doc(db, 'alerts', alert.id);
      batch.update(alertRef, { isRead: true });
    });
    await batch.commit();
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <AlertsContext.Provider value={{
      alerts,
      unreadCount,
      addAlert,
      markAsRead,
      markAllAsRead
    }}>
      {children}
      <ToastContainer position="bottom-right" autoClose={5000} theme="colored" />
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}
