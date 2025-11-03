import type { Request, Response } from "express";
import express from "express";
import { startMonitoring } from "./jobs/monitor.js";

const app = express();
const PORT = process.env["PORT"] || 5000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("API Monitoring Backend is running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  startMonitoring(); // Start the monitoring loop
});
