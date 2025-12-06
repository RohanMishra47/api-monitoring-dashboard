"use client";

import { API_URL } from "@/app/dashboard/page";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  DotItemDotProps,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Log = {
  id: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
  error: string | null;
};

type Props = {
  endpointId: string;
  endpointName: string;
  onClose: () => void;
};

const EndpointChart = ({ endpointId, endpointName, onClose }: Props) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(24);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/endpoints/${endpointId}/logs`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { hours: timeRange, limit: 100 },
          }
        );
        setLogs(response.data.logs || []);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error("Failed to fetch logs:", err.response?.data?.error);
        } else {
          console.error("Unexpected error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [endpointId, timeRange]);

  const chartData = logs.map((log) => ({
    time: new Date(log.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    responseTime: log.latencyMs,
    isDown: log.error || log.statusCode === 0 || log.statusCode >= 500,
  }));

  const avgResponse =
    logs.length > 0
      ? Math.round(logs.reduce((a, b) => a + b.latencyMs, 0) / logs.length)
      : 0;

  const minResponse =
    logs.length > 0 ? Math.min(...logs.map((l) => l.latencyMs)) : 0;

  const maxResponse =
    logs.length > 0 ? Math.max(...logs.map((l) => l.latencyMs)) : 0;

  const uptime =
    logs.length > 0
      ? Math.round(
          (logs.filter(
            (log) => !log.error && log.statusCode >= 200 && log.statusCode < 300
          ).length /
            logs.length) *
            100
        )
      : 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {endpointName}
            </h2>
            <p className="text-sm text-gray-500">Response time analysis</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl transition"
          >
            ✕
          </button>
        </div>

        {/* TIME RANGE BUTTONS */}
        <div className="flex gap-3 mb-8">
          {[1, 6, 12, 24].map((h) => (
            <button
              key={h}
              onClick={() => setTimeRange(h)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm ${
                timeRange === h
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>

        {/* LOADING OR EMPTY */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 text-lg">Loading chart...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p className="font-medium">No data available</p>
              <p className="text-sm">
                This endpoint has no checks in the last {timeRange} hours.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-4 gap-4 mb-10">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs uppercase text-indigo-600 font-medium">
                  Average
                </p>
                <p className="text-2xl font-extrabold text-indigo-900">
                  {avgResponse}ms
                </p>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs uppercase text-green-600 font-medium">
                  Min
                </p>
                <p className="text-2xl font-extrabold text-green-900">
                  {minResponse}ms
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs uppercase text-orange-600 font-medium">
                  Max
                </p>
                <p className="text-2xl font-extrabold text-orange-900">
                  {maxResponse}ms
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-xs uppercase text-purple-600 font-medium">
                  Uptime
                </p>
                <p className="text-2xl font-extrabold text-purple-900">
                  {uptime}%
                </p>
              </div>
            </div>

            {/* CHART */}
            <div className="bg-white border border-gray-200 rounded-xl shadow p-6 mb-8">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e4e4e4" />

                  <XAxis dataKey="time" stroke="#555" tick={{ fontSize: 12 }} />

                  <YAxis
                    stroke="#555"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "ms",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#555" },
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      padding: "10px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={(props: DotItemDotProps) => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill={payload.isDown ? "#dc2626" : "#4f46e5"}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* RECENT CHECKS */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Recent Checks
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {logs
                  .slice(-10)
                  .reverse()
                  .map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            log.error ||
                            log.statusCode === 0 ||
                            log.statusCode >= 500
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        />
                        <span className="text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-700">
                          {log.latencyMs}ms
                        </span>

                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            log.error ||
                            log.statusCode === 0 ||
                            log.statusCode >= 500
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-green-100 text-green-800 border border-green-200"
                          }`}
                        >
                          {log.error ? "Error" : log.statusCode}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EndpointChart;
