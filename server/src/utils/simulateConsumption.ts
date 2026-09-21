import MedicineStock from "../models/MedicineStock";

export const startConsumptionSimulation = (intervalMs = 30000) => {
  setInterval(async () => {
    try {
      await MedicineStock.updateMany({ dailyConsumptionRate: { $gt: 0 } }, [
        {
          $set: {
            quantity: {
              $max: [
                0,
                {
                  $subtract: [
                    "$quantity",
                    {
                      $max: [
                        1,
                        {
                          $round: [
                            { $divide: ["$dailyConsumptionRate", 24] },
                            0,
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ]);
      console.log(`[simulate] Stock updated at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error("[simulate] Failed to update stock:", err);
    }
  }, intervalMs);
};