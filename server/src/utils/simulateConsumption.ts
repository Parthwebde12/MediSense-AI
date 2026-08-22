import MedicineStock from "../models/MedicineStock";

export const startConsumptionSimulation = (intervalMs = 30000) => {
  setInterval(async () => {
    try {
      const allStock = await MedicineStock.find();
      for (const item of allStock) {
        const tickConsumption = Math.max(
          Math.round((item.dailyConsumptionRate / 24) * 1), 
          1
        );
        const newQuantity = Math.max(item.quantity - tickConsumption, 0);
        if (newQuantity !== item.quantity) {
          item.quantity = newQuantity;
          await item.save();
        }
      }
      console.log(`[simulate] Stock levels updated at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error("[simulate] Failed to update stock:", err);
    }
  }, intervalMs);
};