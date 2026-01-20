"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";
import { RiFacebookFill } from "react-icons/ri";
import { FaGoogle } from "react-icons/fa";

import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password }),
      });

      const data = await res.json();
      console.log("Login Response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data?.data?.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        console.log("Token saved:", localStorage.getItem("token"));

        // Redirect based on role
        if (data.data.user.role === "admin") {
          router.push("/dashboard/admin");
        } else {
          // If student, we also need to set the examSession for compatibility
          // But since the student record is linked by email, we might need to fetch it
          // For now, just redirect to student dashboard
          router.push("/dashboard/student");
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Login Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-24">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="mx-auto" />
        </div>



        <div className="max-w-5xl mx-auto mt-8 bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left Image */}
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#f0fafa] to-[#e6eded] p-8">
            <Image
              src="/images/Login Image.png"
              alt="Login illustration"
              width={520}
              height={420}
              className="object-contain"
            />
          </div>

          {/* Right Form */}
          <div className="p-8 sm:p-12">
            <h3 className="text-2xl font-semibold text-gray-800">
              Sign in to your account
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              New student?{" "}
              <Link href="/register">
                <span className="text-[#41bfb8] font-semibold cursor-pointer hover:underline">
                  Accounts are created by admin
                </span>
              </Link>
            </p>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#41bfb8] outline-none"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-600">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#41bfb8] outline-none"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-11 text-gray-400 cursor-pointer"
                >
                  {showPassword ? (
                    <MdOutlineVisibilityOff size={20} />
                  ) : (
                    <MdOutlineRemoveRedEye size={20} />
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-[#41bfb8]" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password">
                  <span className="text-sm text-[#41bfb8] cursor-pointer">
                    Forgot password?
                  </span>
                </Link>
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <button
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#41bfb8] text-white font-semibold hover:bg-[#38a8a1] transition-colors disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Social Login */}
            <div className="flex items-center gap-4 justify-center text-sm text-gray-500 mt-5">
              <hr className="w-20" />
              <span>or continue with</span>
              <hr className="w-20" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <button className="flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 hover:shadow-sm">
                <RiFacebookFill className="text-[#41bfb8]" size={18} />
                Facebook
              </button>
              <button className="flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 hover:shadow-sm">
                <FaGoogle className="text-[#41bfb8]" size={18} />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
