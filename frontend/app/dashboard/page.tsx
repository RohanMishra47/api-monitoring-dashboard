"use client";

import AddEndpointModal from "@/componnets/AddEndpointModal";
import EndpointChart from "@/componnets/EndpointChart";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Endpoint = {
  id: string;
  name: string;
  url: string;
  interval: number;
  thresholdMs: number;
  createdAt: string;
  lastCheckedAt: string | null;
  userId: string | null;
  latestLog?: {
    statusCode: number;
    latencyMs: number;
    timestamp: string;
    error: string | null;
  };
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEndpoints = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/endpoints`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      const endpointsWithLogs = await Promise.all(
        data.endpoints.map(async (ep: Endpoint) => {
          const token = localStorage.getItem("token");

          try {
            const logResponse = await axios.get(
              `${API_URL}/endpoints/${ep.id}/logs`,
              {
                params: { limit: 1 },
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const logData = logResponse.data;

            return {
              ...ep,
              latestLog: logData.logs?.[0] || null,
            };
          } catch {
            return ep;
          }
        })
      );

      console.log("Fetched endpoints:", data);

      setEndpoints(endpointsWithLogs);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        fetchEndpoints();
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
          fetchEndpoints();
        }, 30000);
        return () => clearInterval(interval);
      }
    };

    checkAuth();
  }, [router]);

  const handleDelete = async (endpointId: string) => {
    if (!confirm("Are you sure you want to delete this endpoint?")) return;

    setDeletingId(endpointId);
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/endpoints/${endpointId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEndpoints(endpoints.filter((ep) => ep.id !== endpointId));
    } catch (err) {
      let errorMessage = "Failed to delete endpoint";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || errorMessage;
      }

      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getStatusDisplay = (endpoint: Endpoint) => {
    if (!endpoint.latestLog) {
      return {
        text: "Pending",
        className: "bg-gray-100 text-gray-600",
        icon: "⏳",
      };
    }

    const { statusCode, error } = endpoint.latestLog;

    if (error || statusCode === 0 || statusCode >= 500) {
      return {
        text: "Down",
        className: "bg-red-100 text-red-800",
        icon: "🔴",
      };
    }

    if (statusCode >= 200 && statusCode < 300) {
      return {
        text: "Up",
        className: "bg-green-100 text-green-800",
        icon: "🟢",
      };
    }

    return {
      text: `${statusCode}`,
      className: "bg-yellow-100 text-yellow-800",
      icon: "⚠️",
    };
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getTimeSinceUpdate = () => {
    const now = new Date();
    const diffSeconds = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / 1000
    );
    if (diffSeconds < 10) return "Just now";
    return `${diffSeconds}s ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Endpoint Monitor</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Endpoints</h2>
            <p className="text-sm text-gray-500 mt-1">
              Last updated {getTimeSinceUpdate()} • Auto-refreshes every 30s
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchEndpoints()}
              disabled={loading || isRefreshing}
              className={`px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all`}
            >
              <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Endpoint
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
        )}

        {/* Endpoints Table */}
        {endpoints.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No endpoints yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-blue-600 hover:underline"
            >
              Add your first endpoint
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Checked
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {endpoints.map((endpoint) => {
                  const status = getStatusDisplay(endpoint);
                  return (
                    <tr key={endpoint.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {endpoint.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {endpoint.url}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${status.className}`}
                        >
                          {status.icon} {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {endpoint.latestLog
                          ? `${endpoint.latestLog.latencyMs}ms`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {endpoint.lastCheckedAt
                          ? formatTimestamp(endpoint.lastCheckedAt)
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              setSelectedEndpoint({
                                id: endpoint.id,
                                name: endpoint.name,
                              })
                            }
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            View Chart
                          </button>
                          <button
                            onClick={() => handleDelete(endpoint.id)}
                            disabled={deletingId === endpoint.id}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            {deletingId === endpoint.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddEndpointModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchEndpoints();
          }}
        />
      )}

      {selectedEndpoint && (
        <EndpointChart
          endpointId={selectedEndpoint.id}
          endpointName={selectedEndpoint.name}
          onClose={() => setSelectedEndpoint(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
