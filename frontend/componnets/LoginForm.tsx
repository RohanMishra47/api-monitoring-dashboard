"use client";

import { API_URL } from "@/utils/api";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Automatically fill credentials if demo mode is active
  useEffect(() => {
    const isDemo = searchParams.get("demo");
    if (isDemo === "true") {
      setFormData({
        email: "rohan@example.com",
        password: "muin006j",
      });
    }
  }, [searchParams]);

  const handleAutoFill = () => {
    setFormData({
      email: "rohan@example.com",
      password: "muin006j",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData);
      const data = res.data;

      if (res.status !== 200) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl p-10">
        {searchParams.get("demo") === "true" && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-3 rounded-lg mb-4 text-sm shadow-sm text-center">
            Demo account credentials pre-filled. Click Login to explore!
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-center mb-6 bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Welcome Back
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 shadow-sm transition"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 shadow-sm transition"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-md shadow-md hover:bg-indigo-700 transition disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-gray-200"></div>
            <span className="shrink mx-4 text-gray-400 text-xs uppercase tracking-widest">
              Or
            </span>
            <div className="grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleAutoFill}
            className="block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all duration-500
                       bg-linear-to-r from-indigo-600 via-indigo-500 to-indigo-500
                       bg-200% bg-right hover:bg-left shadow-md"
          >
            🚀 Explore with Demo Account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
