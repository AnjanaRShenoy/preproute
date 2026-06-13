"use client";

import React from 'react';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/dist/client/components/navigation';

export default function Login() {

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // 👑 Clear any previous errors on a fresh attempt

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token || data.data?.token;

        if (token) {
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
          console.log("Cookie successfully set!");
        }

        router.push("/");
        router.refresh();
      } else {
        // 👑 THE FIX: Set the error state instead of using alert()
        setError(data.message || "Access denied. Invalid credentials.");
      }

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] h-[90vh] flex">

        {/* Left Side: Illustration Area */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="w-4/5 max-w-[450px] relative aspect-square flex justify-center items-center">
            <Image
              src="/login/group.png"
              alt="Login illustration"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Right Side: Login Card Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white w-full max-w-[520px] h-full border border-slate-200 rounded-xl px-8 py-12 md:px-12 md:py-14 flex flex-col justify-start shadow-sm">

            {/* Brand Logo */}
            <div className="relative w-40 h-10">
              <Image src="\prepRoute\logo.svg" alt="PrepRoute Logo" fill priority className="object-contain object-left" />
            </div>
            {/* Form Header */}
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Login</h2>
            <p className="text-xs text-slate-500 mb-9">Use your company provided Login credentials</p>

            {/* Inline Error Notification Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2 mb-6">
                <label htmlFor="userId" className="text-sm font-medium text-slate-700">User ID</label>
                <input
                  type="text"
                  id="userId"
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-md text-sm text-slate-700 bg-white placeholder-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-md text-sm text-slate-700 bg-white placeholder-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="mb-8">
                <a href="#" className="text-xs text-blue-500 hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5383ec] hover:bg-[#4272df] text-white py-3.5 rounded-md text-sm font-medium transition-colors cursor-pointer mt-auto md:mt-0"
              >
                Login
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}