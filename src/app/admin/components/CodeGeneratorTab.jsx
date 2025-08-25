"use client";
import React from "react";

export default function CodeGeneratorTab({ codeSubject, setCodeSubject, customCode, setCustomCode, generateCode, codeAlert }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Generate Unlock Codes
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <select
            value={codeSubject}
            onChange={(e) => setCodeSubject(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Assignment Solution">
              Assignment Solution
            </option>
            <option value="Maths Basic">Maths Basic</option>
            <option value="all">Master Code (All Subjects)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Code (optional)
          </label>
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="Leave empty for random code"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={generateCode}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Generate Code
      </button>

      {codeAlert && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            codeAlert.includes("Error")
              ? "bg-red-100 text-red-800 border border-red-200"
              : "bg-green-100 text-green-800 border border-green-200"
          }`}
        >
          {codeAlert}
        </div>
      )}
    </div>
  );
}
