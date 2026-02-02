"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { authAPI } from "@/lib/api";

const Login = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isChecking, setIsChecking] = useState(true);

  // Check if already logged in
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token && user) {
        const userData = JSON.parse(user);
        if (userData.role === "admin") {
          router.replace("/dashboard/admin/dashboard");
          return;
        } else {
          router.replace("/dashboard/student");
          return;
        }
      }
    } catch (e) {
      // Clear corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("adminAuth");
    }
    setIsChecking(false);
  }, []);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (response?.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Store adminAuth for admin users
        if (response.data.user.role === "admin") {
          localStorage.setItem(
            "adminAuth",
            JSON.stringify({
              email: response.data.user.email,
              name: response.data.user.name,
              role: response.data.user.role,
              token: response.data.token,
              isAdmin: true,
            })
          );
        }

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Redirect based on role
        if (response.data.user.role === "admin") {
          router.push("/dashboard/admin/dashboard");
        } else {
          // Both 'user' and 'student' roles go to student dashboard
          router.push("/dashboard/student");
        }
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Logo className="mx-auto" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-md overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left Image */}
          <div className="hidden lg:flex items-center justify-center bg-cyan-600 p-10">
            <div className="text-center text-white">
              <div className="bg-white/10 rounded-md p-6 mb-6">
                <Image
                  src="/images/Login Image.png"
                  alt="Login"
                  width={280}
                  height={240}
                  className="object-contain mx-auto"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome Back</h2>
              <p className="text-cyan-100 text-sm">
                Login to access your IELTS exam portal
              </p>
            </div>
          </div>

          {/* Right Form */}
          <div className="p-8 lg:p-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">Sign In</h3>
            <p className="text-gray-500 text-sm mb-6">
              Enter your credentials to continue
            </p>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <FiAlertCircle className="text-red-500" size={16} />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-md text-sm bg-gray-50 focus:bg-white outline-none transition-colors ${validationErrors.email
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-cyan-500"
                      }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-red-500 text-xs">{validationErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-md text-sm bg-gray-50 focus:bg-white outline-none transition-colors ${validationErrors.password
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-cyan-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <MdOutlineVisibilityOff size={18} />
                    ) : (
                      <MdOutlineRemoveRedEye size={18} />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-red-500 text-xs">{validationErrors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-cyan-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md bg-cyan-600 text-white font-medium text-sm hover:bg-cyan-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-3 bg-gray-50 border border-gray-100 rounded-md">
              <p className="text-xs text-gray-500 text-center">
                <span className="font-medium text-gray-700">Students:</span> Use your email and phone number as password.
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-cyan-600">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
