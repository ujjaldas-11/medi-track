import { 
  addStock, 
  addDoctor, 
  addPatientFootfall, 
  updateBeds 
} from '../lib/firestore';

export default function SeedData() {
  const addSampleData = async () => {
    const centerId = "center1"; // You can change this

    try {
      // Add Stock
      await addStock({ centerId, medicineName: "Paracetamol", currentStock: 45 });
      await addStock({ centerId, medicineName: "Amoxicillin", currentStock: 12 });
      await addStock({ centerId, medicineName: "Vitamin D", currentStock: 80 });

      // Add Doctors
      await addDoctor({ centerId, name: "Dr. Sharma", specialty: "General", isPresent: true });
      await addDoctor({ centerId, name: "Dr. Patel", specialty: "Pediatric", isPresent: false });

      // Add Beds
      await updateBeds(centerId, 50, 32);

      // Add Patient Footfall
      await addPatientFootfall(centerId, 245);

      alert("✅ Sample data added successfully!");
    } catch (error) {
      console.error(error);
      alert("Error adding data");
    }
  };

  return (
    <div className="p-6">
      <button 
        onClick={addSampleData}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
      >
        🌱 Add Sample Data (One Click)
      </button>
      <p className="text-sm text-gray-500 mt-2">Click once to populate database</p>
    </div>
  );
}