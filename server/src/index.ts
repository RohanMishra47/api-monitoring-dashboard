import endpointRoutes from "@/routes/endpoints.js";
import type { Request, Response } from "express";
import express from "express";
import { startMonitoring } from "./jobs/monitor.js";
import alertRoutes from "./routes/alerts.js";
import logRoutes from "./routes/logs.js";

const app = express();
const PORT = process.env["PORT"] || 5000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("API Monitoring Backend is running");
});
app.use("/endpoints", endpointRoutes);
app.use("/logs", logRoutes);
app.use("/alerts", alertRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  startMonitoring(); // Start the monitoring loop
});
