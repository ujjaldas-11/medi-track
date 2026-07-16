import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query,
  where ,
  onSnapshot
} from 'firebase/firestore';

// ==================== CENTERS ====================
export const addCenter = async (data: any) => {
  return await addDoc(collection(db, "centers"), {
    ...data,
    createdAt: new Date()
  });
};

// ==================== STOCK ====================
export const addStock = async (data: any) => {
  return await addDoc(collection(db, "stock"), {
    centerId: data.centerId,
    medicineName: data.medicineName,
    currentStock: data.currentStock,
    minStock: data.minStock || 20,
    usedToday: data.usedToday || 0,
    lastUpdated: new Date()
  });
};

export const getStockByCenter = async (centerId: string) => {
  const q = query(collection(db, "stock"), where("centerId", "==", centerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateStock = async (stockId: string, newStock: number) => {
  const stockRef = doc(db, "stock", stockId);
  return await updateDoc(stockRef, {
    currentStock: newStock,
    lastUpdated: new Date()
  });
};

// ==================== BEDS ====================
export const updateBeds = async (centerId: string, total: number, occupied: number) => {
  const q = query(collection(db, "beds"), where("centerId", "==", centerId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return await addDoc(collection(db, "beds"), {
      centerId,
      totalBeds: total,
      occupiedBeds: occupied,
      lastUpdated: new Date()
    });
  } else {
    const bedRef = doc(db, "beds", snapshot.docs[0].id);
    return await updateDoc(bedRef, {
      totalBeds: total,
      occupiedBeds: occupied,
      lastUpdated: new Date()
    });
  }
};

// ==================== DOCTORS ====================
export const addDoctor = async (data: any) => {
  return await addDoc(collection(db, "doctors"), {
    centerId: data.centerId,
    name: data.name,
    specialty: data.specialty,
    isPresent: data.isPresent || true,
    lastUpdated: new Date()
  });
};

export const toggleDoctorAttendance = async (doctorId: string, isPresent: boolean) => {
  const doctorRef = doc(db, "doctors", doctorId);
  return await updateDoc(doctorRef, { 
    isPresent, 
    lastUpdated: new Date() 
  });
};

// ==================== TESTS ====================
export const updateTestAvailability = async (testId: string, available: boolean) => {
  const testRef = doc(db, "tests", testId);
  return await updateDoc(testRef, { 
    available, 
    lastUpdated: new Date() 
  });
};

// ==================== PATIENT FOOTFALL ====================
export const addPatientFootfall = async (centerId: string, count: number) => {
  return await addDoc(collection(db, "patientFootfall"), {
    centerId,
    date: new Date().toISOString().split('T')[0],
    count,
    createdAt: new Date()
  });
};



export const listenToStock = (centerId: string, callback: (data: any[]) => void) => {
  const q = query(collection(db, "stock"), where("centerId", "==", centerId));
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};