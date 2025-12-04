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
  const [timeRange, setTimeRange] = useState(24); // default to last 24 hours

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
          console.error(
            "Failed to fetch logs:",
            err.response?.data?.error || err.message
          );
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
    status: log.statusCode,
    isDown: log.error || log.statusCode === 0 || log.statusCode >= 500,
  }));

  const avgResponseTime =
    logs.length > 0
      ? Math.round(
          logs.reduce((sum, log) => sum + log.latencyMs, 0) / logs.length
        )
      : 0;

  const maxResponseTime =
    logs.length > 0 ? Math.max(...logs.map((log) => log.latencyMs)) : 0;

  const minResponseTime =
    logs.length > 0 ? Math.min(...logs.map((log) => log.latencyMs)) : 0;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{endpointName}</h2>
            <p className="text-sm text-gray-500">Response time over time</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {[1, 6, 12, 24].map((hours) => (
            <button
              key={hours}
              onClick={() => setTimeRange(hours)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === hours
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {hours}h
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p className="mb-2">No data available yet</p>
              <p className="text-sm">
                Endpoint hasn&apos;t been checked in the last {timeRange} hours
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 uppercase mb-1">Average</p>
                <p className="text-2xl font-bold text-blue-900">
                  {avgResponseTime}ms
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 uppercase mb-1">Min</p>
                <p className="text-2xl font-bold text-green-900">
                  {minResponseTime}ms
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-xs text-orange-600 uppercase mb-1">Max</p>
                <p className="text-2xl font-bold text-orange-900">
                  {maxResponseTime}ms
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-purple-600 uppercase mb-1">Uptime</p>
                <p className="text-2xl font-bold text-purple-900">{uptime}%</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 12 }} />
                  <YAxis
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Response Time (ms)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "8px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "responseTime")
                        return [`${value}ms`, "Response Time"];
                      return [value, name];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={(props: DotItemDotProps) => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={payload.isDown ? "#ef4444" : "#2563eb"}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Checks */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Recent Checks
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs
                  .slice(-10)
                  .reverse()
                  .map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${
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
                        <span className="text-gray-700">{log.latencyMs}ms</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            log.error ||
                            log.statusCode === 0 ||
                            log.statusCode >= 500
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
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
