import { API_URL } from "@/app/dashboard/page";
import axios from "axios";
import { useState } from "react";

const AddEndpointModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    interval: 1,
    thresholdMs: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${API_URL}/endpoints`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onSuccess();
    } catch (err) {
      let errorMessage = "Failed to create endpoint";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl max-w-md w-full p-8 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-extrabold bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Add New Endpoint
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-xl"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              placeholder="Production API"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 transition"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              required
              placeholder="https://api.example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 transition"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
            />
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Check Interval
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 transition"
              value={formData.interval}
              onChange={(e) =>
                setFormData({ ...formData, interval: Number(e.target.value) })
              }
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
          </div>

          {/* Threshold */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Threshold (ms)
            </label>
            <input
              type="number"
              required
              min={100}
              placeholder="2000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 transition"
              value={formData.thresholdMs}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  thresholdMs: Number(e.target.value),
                })
              }
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition font-semibold"
            >
              {loading ? "Adding..." : "Add Endpoint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEndpointModal;
