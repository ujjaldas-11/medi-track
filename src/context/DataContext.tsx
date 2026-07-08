import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

export interface HealthCenter {
  id: string;
  name: string;
  type: 'PHC' | 'CHC';
  address: string;
  lat: number;
  lng: number;
  healthScore?: number;
  createdAt?: any;
}

export interface StockItem {
  id: string;
  centerId: string;
  medicineName: string;
  currentStock: number;
  minStock: number;
  reorderThreshold: number;
  usedToday: number;
  lastUpdated: any;
}

export interface Doctor {
  id: string;
  centerId: string;
  name: string;
  specialty: string;
  isPresent: boolean;
  isLate?: boolean;
  consecutiveAbsences: number;
  lastUpdated: any;
}

export interface BedStatus {
  id: string;
  centerId: string;
  generalTotal: number;
  generalOccupied: number;
  icuTotal: number;
  icuOccupied: number;
  lastUpdated: any;
}

export interface TestStatus {
  id: string;
  centerId: string;
  bloodTest: boolean;
  ecg: boolean;
  xray: boolean;
  ultrasound: boolean;
  oxygen: boolean;
  ambulance: boolean;
  lastUpdated: any;
}

export interface Patient {
  id: string;
  centerId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  visitReason: string;
  type: 'OPD' | 'Emergency';
  registeredAt: any;
  registeredBy: string;
}

export interface RedistributionRequest {
  id: string;
  fromCenterId: string;
  toCenterId: string;
  resourceType: 'medicine' | 'bed' | 'doctor' | 'other';
  resourceName: string;
  quantity: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string;
  createdAt: any;
}

export interface PatientFootfall {
  id: string;
  centerId: string;
  date: string;
  opdCount: number;
  emergencyCount: number;
}

interface DataContextType {
  centers: HealthCenter[];
  stock: StockItem[];
  doctors: Doctor[];
  beds: BedStatus[];
  tests: TestStatus[];
  patients: Patient[];
  requests: RedistributionRequest[];
  footfall: PatientFootfall[];
  loading: boolean;

  // CRUD helpers
  addCenter: (data: Omit<HealthCenter, 'id'>) => Promise<string>;
  updateCenter: (id: string, data: Partial<HealthCenter>) => Promise<void>;
  deleteCenter: (id: string) => Promise<void>;
  
  addStockItem: (data: Omit<StockItem, 'id' | 'lastUpdated'>) => Promise<string>;
  updateStockItem: (id: string, data: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;

  addDoctor: (data: Omit<Doctor, 'id' | 'lastUpdated'>) => Promise<string>;
  updateDoctor: (id: string, data: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;

  updateBeds: (centerId: string, data: Omit<BedStatus, 'id' | 'centerId' | 'lastUpdated'>) => Promise<void>;
  updateTests: (centerId: string, data: Omit<TestStatus, 'id' | 'centerId' | 'lastUpdated'>) => Promise<void>;

  registerPatient: (data: Omit<Patient, 'id' | 'registeredAt'>) => Promise<string>;
  logFootfall: (centerId: string, opdCount: number, emergencyCount: number, date?: string) => Promise<void>;

  createRedistributionRequest: (data: Omit<RedistributionRequest, 'id' | 'status' | 'createdAt'>) => Promise<string>;
  updateRequestStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [centers, setCenters] = useState<HealthCenter[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [beds, setBeds] = useState<BedStatus[]>([]);
  const [tests, setTests] = useState<TestStatus[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [requests, setRequests] = useState<RedistributionRequest[]>([]);
  const [footfall, setFootfall] = useState<PatientFootfall[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore setup
  useEffect(() => {
    const unsubCenters = onSnapshot(collection(db, 'centers'), (snapshot) => {
      setCenters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthCenter)));
    });

    const unsubStock = onSnapshot(collection(db, 'stock'), (snapshot) => {
      setStock(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockItem)));
    });

    const unsubDoctors = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));
    });

    const unsubBeds = onSnapshot(collection(db, 'beds'), (snapshot) => {
      setBeds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BedStatus)));
    });

    const unsubTests = onSnapshot(collection(db, 'tests'), (snapshot) => {
      setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestStatus)));
    });

    const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient)));
    });

    const unsubRequests = onSnapshot(collection(db, 'redistributionRequests'), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RedistributionRequest)));
    });

    const unsubFootfall = onSnapshot(collection(db, 'patientFootfall'), (snapshot) => {
      setFootfall(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PatientFootfall)));
      setLoading(false);
    });

    return () => {
      unsubCenters();
      unsubStock();
      unsubDoctors();
      unsubBeds();
      unsubTests();
      unsubPatients();
      unsubRequests();
      unsubFootfall();
    };
  }, []);

  // Compute dynamic health score for each center
  const getComputedCenters = (): HealthCenter[] => {
    return centers.map(center => {
      const centerStock = stock.filter(s => s.centerId === center.id);
      const centerDoctors = doctors.filter(d => d.centerId === center.id);
      const centerBeds = beds.find(b => b.centerId === center.id);
      const centerTests = tests.find(t => t.centerId === center.id);
      const centerFootfall = footfall.filter(f => f.centerId === center.id);

      // 1. Medicine Score (30%)
      let medicineScore = 100;
      if (centerStock.length > 0) {
        const healthyStock = centerStock.filter(s => s.currentStock >= s.minStock).length;
        medicineScore = (healthyStock / centerStock.length) * 100;
      }

      // 2. Bed Score (20%)
      let bedScore = 100;
      if (centerBeds) {
        const total = centerBeds.generalTotal + centerBeds.icuTotal;
        const occupied = centerBeds.generalOccupied + centerBeds.icuOccupied;
        if (total > 0) {
          // Score decreases if occupancy is extremely high (overloaded) or extremely low? 
          // The prompt says "beds available", meaning we want free beds or avoid critical overload.
          // Let's check occupancy: if occupancy > 90%, bed score is low.
          const occupancyRate = occupied / total;
          if (occupancyRate > 1.0) bedScore = 0;
          else if (occupancyRate > 0.9) bedScore = 40;
          else if (occupancyRate > 0.75) bedScore = 70;
          else bedScore = 100;
        }
      }

      // 3. Doctors Score (20%)
      let doctorScore = 100;
      if (centerDoctors.length > 0) {
        const present = centerDoctors.filter(d => d.isPresent).length;
        doctorScore = (present / centerDoctors.length) * 100;
      }

      // 4. Tests Score (15%)
      let testScore = 0;
      if (centerTests) {
        const items = [
          centerTests.bloodTest,
          centerTests.ecg,
          centerTests.xray,
          centerTests.ultrasound,
          centerTests.oxygen,
          centerTests.ambulance
        ];
        const available = items.filter(Boolean).length;
        testScore = (available / 6) * 100;
      } else {
        testScore = 50; // default if not set
      }

      // 5. Patient Load Score (15%)
      // If footfall is extremely high compared to normal (e.g. emergency cases high, or total count > 120), penalty.
      let patientLoadScore = 100;
      const todayStr = new Date().toISOString().split('T')[0];
      const todayFootfall = centerFootfall.find(f => f.date === todayStr);
      if (todayFootfall) {
        const totalDaily = todayFootfall.opdCount + todayFootfall.emergencyCount;
        if (totalDaily > 150) {
          patientLoadScore = 40;
        } else if (totalDaily > 100) {
          patientLoadScore = 70;
        }
      }

      // Computed weighted average: 30% medicine, 20% beds, 20% doctors, 15% tests, 15% patient load
      const healthScore = Math.round(
        (medicineScore * 0.30) +
        (bedScore * 0.20) +
        (doctorScore * 0.20) +
        (testScore * 0.15) +
        (patientLoadScore * 0.15)
      );

      return {
        ...center,
        healthScore
      };
    });
  };

  // CRUD Implementations
  const addCenter = async (data: Omit<HealthCenter, 'id'>) => {
    const docRef = await addDoc(collection(db, 'centers'), {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  };

  const updateCenter = async (id: string, data: Partial<HealthCenter>) => {
    await updateDoc(doc(db, 'centers', id), data);
  };

  const deleteCenter = async (id: string) => {
    await deleteDoc(doc(db, 'centers', id));
  };

  const addStockItem = async (data: Omit<StockItem, 'id' | 'lastUpdated'>) => {
    const docRef = await addDoc(collection(db, 'stock'), {
      ...data,
      lastUpdated: Timestamp.now()
    });
    return docRef.id;
  };

  const updateStockItem = async (id: string, data: Partial<StockItem>) => {
    await updateDoc(doc(db, 'stock', id), {
      ...data,
      lastUpdated: Timestamp.now()
    });
  };

  const deleteStockItem = async (id: string) => {
    await deleteDoc(doc(db, 'stock', id));
  };

  const addDoctor = async (data: Omit<Doctor, 'id' | 'lastUpdated'>) => {
    const docRef = await addDoc(collection(db, 'doctors'), {
      ...data,
      lastUpdated: Timestamp.now()
    });
    return docRef.id;
  };

  const updateDoctor = async (id: string, data: Partial<Doctor>) => {
    await updateDoc(doc(db, 'doctors', id), {
      ...data,
      lastUpdated: Timestamp.now()
    });
  };

  const deleteDoctor = async (id: string) => {
    await deleteDoc(doc(db, 'doctors', id));
  };

  const updateBeds = async (centerId: string, data: Omit<BedStatus, 'id' | 'centerId' | 'lastUpdated'>) => {
    // Find or create beds document for center
    const q = query(collection(db, 'beds'), where('centerId', '==', centerId));
    const snap = await getDocs(q);
    if (snap.empty) {
      await addDoc(collection(db, 'beds'), {
        centerId,
        ...data,
        lastUpdated: Timestamp.now()
      });
    } else {
      await updateDoc(doc(db, 'beds', snap.docs[0].id), {
        ...data,
        lastUpdated: Timestamp.now()
      });
    }
  };

  const updateTests = async (centerId: string, data: Omit<TestStatus, 'id' | 'centerId' | 'lastUpdated'>) => {
    // Find or create tests document for center
    const q = query(collection(db, 'tests'), where('centerId', '==', centerId));
    const snap = await getDocs(q);
    if (snap.empty) {
      await addDoc(collection(db, 'tests'), {
        centerId,
        ...data,
        lastUpdated: Timestamp.now()
      });
    } else {
      await updateDoc(doc(db, 'tests', snap.docs[0].id), {
        ...data,
        lastUpdated: Timestamp.now()
      });
    }
  };

  const registerPatient = async (data: Omit<Patient, 'id' | 'registeredAt'>) => {
    const docRef = await addDoc(collection(db, 'patients'), {
      ...data,
      registeredAt: Timestamp.now()
    });
    
    // Automatically log/increment footfall for the patient
    await logFootfall(data.centerId, data.type === 'OPD' ? 1 : 0, data.type === 'Emergency' ? 1 : 0);

    return docRef.id;
  };

  const logFootfall = async (centerId: string, opdCount: number, emergencyCount: number, date?: string) => {
    const todayStr = date || new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'patientFootfall'), where('centerId', '==', centerId), where('date', '==', todayStr));
    const snap = await getDocs(q);

    if (snap.empty) {
      await addDoc(collection(db, 'patientFootfall'), {
        centerId,
        date: todayStr,
        opdCount,
        emergencyCount
      });
    } else {
      const docId = snap.docs[0].id;
      const existing = snap.docs[0].data();
      await updateDoc(doc(db, 'patientFootfall', docId), {
        opdCount: (existing.opdCount || 0) + opdCount,
        emergencyCount: (existing.emergencyCount || 0) + emergencyCount
      });
    }
  };

  const createRedistributionRequest = async (data: Omit<RedistributionRequest, 'id' | 'status' | 'createdAt'>) => {
    const docRef = await addDoc(collection(db, 'redistributionRequests'), {
      ...data,
      status: 'Pending',
      createdAt: Timestamp.now()
    });
    return docRef.id;
  };

  const updateRequestStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    await updateDoc(doc(db, 'redistributionRequests', id), {
      status
    });
  };

  return (
    <DataContext.Provider value={{
      centers: getComputedCenters(),
      stock,
      doctors,
      beds,
      tests,
      patients,
      requests,
      footfall,
      loading,
      addCenter,
      updateCenter,
      deleteCenter,
      addStockItem,
      updateStockItem,
      deleteStockItem,
      addDoctor,
      updateDoctor,
      deleteDoctor,
      updateBeds,
      updateTests,
      registerPatient,
      logFootfall,
      createRedistributionRequest,
      updateRequestStatus
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
