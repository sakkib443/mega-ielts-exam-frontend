"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";
import { RiFacebookFill } from "react-icons/ri";
import { FaGoogle } from "react-icons/fa";

import { useRouter } from "next/navigation";

const Register = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gmail: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 🔹 Input Handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Password strength
  useEffect(() => {
    const p = formData.password || "";
    let score = 0;
    if (p.length >= 8) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setPasswordStrength(score);
  }, [formData.password]);

  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/user/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          gmail: formData.gmail,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: "student",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // ✅ Success → Login page
      router.push("/dashboard/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create an Account</h1>
          <p className="text-gray-500 mt-2">Join Bdcalling Academy — get access to courses and dashboard</p>
        </div>

        <div className="max-w-5xl mx-auto mt-8 bg-white rounded-2xl shadow-lg grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          {/* Image */}
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#f7fdfc] to-[#e8f7f6] p-8">
            <Image
              src="/images/Register Image.png"
              alt="Register"
              width={520}
              height={420}
            />
          </div>

          {/* Form */}
          <div className="p-8 sm:p-12">
            <h3 className="text-2xl font-semibold text-gray-800">
              Sign up for free
            </h3>

            <form className="space-y-5 mt-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="firstName"
                  placeholder="First name"
                  onChange={handleChange}
                  required
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#41bfb8] outline-none"
                />
                <input
                  name="lastName"
                  placeholder="Last name"
                  onChange={handleChange}
                  required
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#41bfb8] outline-none"
                />
              </div>

              <input
                name="gmail"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                required
                className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#41bfb8] outline-none"
              />

              <input
                name="phoneNumber"
                placeholder="Phone (optional)"
                onChange={handleChange}
                className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#41bfb8] outline-none"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    onChange={handleChange}
                    required
                    className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#41bfb8] outline-none"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 cursor-pointer text-gray-400"
                    aria-hidden
                  >
                    {showPassword ? (
                      <MdOutlineVisibilityOff />
                    ) : (
                      <MdOutlineRemoveRedEye />
                    )}
                  </span>

                  {/* Password strength */}
                  <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength === 0
                            ? "w-0 bg-red-400"
                            : passwordStrength === 1
                              ? "w-1/3 bg-red-400"
                              : passwordStrength === 2
                                ? "w-2/3 bg-yellow-400"
                                : "w-full bg-green-400"
                          }`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {passwordStrength === 0 && "Too weak"}
                      {passwordStrength === 1 && "Weak"}
                      {passwordStrength === 2 && "Medium"}
                      {passwordStrength === 3 && "Strong"}
                    </p>
                  </div>
                </div>

                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  onChange={handleChange}
                  required
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#41bfb8] outline-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 accent-[#41bfb8]"
                />
                <span className="text-sm text-gray-600">
                  I agree to the <Link href="/terms"><span className="text-[#41bfb8] font-medium">Terms & Conditions</span></Link> and <Link href="/privacy"><span className="text-[#41bfb8] font-medium">Privacy Policy</span></Link>.
                </span>
              </label>

              <button
                disabled={loading || !termsAccepted}
                className={`w-full py-3 rounded-lg text-white font-semibold ${loading || !termsAccepted ? "bg-gray-300 cursor-not-allowed" : "bg-[#41bfb8] hover:bg-[#38a8a1]"
                  }`}
              >
                {loading ? "Creating..." : "Create account"}
              </button>

              {/* Social buttons */}
              <div className="mt-4">
                <div className="flex items-center gap-4 justify-center text-sm text-gray-500">
                  <hr className="w-20" />
                  <span>or sign up with</span>
                  <hr className="w-20" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button type="button" className="flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 hover:shadow-sm">
                    <RiFacebookFill className="text-[#41bfb8]" size={18} />
                    Facebook
                  </button>
                  <button type="button" className="flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 hover:shadow-sm">
                    <FaGoogle className="text-[#41bfb8]" size={18} />
                    Google
                  </button>
                </div>
              </div>
            </form>

            <p className="text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#41bfb8] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
