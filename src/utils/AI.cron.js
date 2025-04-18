import cron from "node-cron";
import axios from "axios";

// Ping AI model every 6 hours
cron.schedule("0 */6 * * *", async () => {
  try {
    await axios.get("https://3laaSayed-kidneytest2.hf.space");
    console.log("AI model server pinged successfully");
  } catch (error) {
    console.error("Failed to ping AI model server:", error.message);
  }
});
