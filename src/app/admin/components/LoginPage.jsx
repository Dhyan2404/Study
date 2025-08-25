"use client";
import React from "react";
import { Shield } from "lucide-react";

export default function LoginPage({ password, setPassword, login, loginError }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            StudyUnlock Admin
          </h1>
          <p className="text-gray-600">Enter password to access dashboard</p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === "Enter" && login()}
          />

          {loginError && (
            <div className="text-red-600 text-sm text-center">
              {loginError}
            </div>
          )}

          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
