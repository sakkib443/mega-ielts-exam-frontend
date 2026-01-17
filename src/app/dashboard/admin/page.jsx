"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaUser, FaShieldAlt } from "react-icons/fa";
import { authAPI } from "@/lib/api";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await authAPI.login(email, password);

            if (response.success && response.data) {
                // Store auth data with token
                localStorage.setItem("adminAuth", JSON.stringify({
                    email: response.data.user.email,
                    name: response.data.user.name,
                    role: response.data.user.role,
                    token: response.data.token,
                    isAdmin: response.data.user.role === "admin"
                }));

                if (response.data.user.role === "admin") {
                    router.push("/dashboard/admin/dashboard");
                } else {
                    setError("You don't have admin access");
                }
            }
        } catch (err) {
            setError(err.message || "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
                        <FaShieldAlt className="text-3xl text-cyan-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                    <p className="text-gray-500 mt-1">IELTS Exam Management System</p>
                </div>

                {/* Login Form */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:border-cyan-600 focus:outline-none"
                                    placeholder="admin@bdcalling.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:border-cyan-600 focus:outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors cursor-pointer disabled:opacity-70"
                        >
                            {isLoading ? "Logging in..." : "Login to Admin Panel"}
                        </button>
                    </form>

                    <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                        <p className="text-cyan-700 text-xs">
                            <strong>Note:</strong> First create an admin account via API, then login here.
                        </p>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-sm mt-6">
                    © 2024 BdCalling Academy
                </p>
            </div>
        </div>
    );
}
