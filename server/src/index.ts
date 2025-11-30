import authRoutes from "@/routes/auth.js";
import endpointRoutes from "@/routes/endpoints.js";
import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import { startMonitoring } from "./jobs/monitor.js";
import alertRoutes from "./routes/alerts.js";
import logRoutes from "./routes/logs.js";

const app = express();
const PORT = process.env["PORT"] || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("API Monitoring Backend is running");
});
app.use("/endpoints", endpointRoutes);
app.use("/logs", logRoutes);
app.use("/alerts", alertRoutes);
app.use("/auth", authRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  startMonitoring(); // Start the monitoring loop
});
