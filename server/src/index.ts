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

// CORS Configuration
const ALLOWED_SPECIFIC_ORIGINS = [
  "http://localhost:3000",
  "https://api-monitoring-dashboard-frontend.vercel.app",
];

// Regex to match Vercel preview deployment URLs
const VERCEL_PREVIEW_REGEX =
  /^https:\/\/(?:[a-zA-Z0-9-]+\.)*api-monitoring-dashboard-frontend\.vercel\.app$/i;

// CORS options
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (ALLOWED_SPECIFIC_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    if (VERCEL_PREVIEW_REGEX.test(origin)) {
      return callback(null, true);
    }

    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },

  // Allowed HTTP methods and headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("API Monitoring Backend is running");
});
app.use("/endpoints", endpointRoutes);
app.use("/logs", logRoutes);
app.use("/alerts", alertRoutes);
app.use("/auth", authRoutes);

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  startMonitoring(); // Start the monitoring loop
});
