"use client";
import React from "react";
import { Users, Trash2, Clock, Eye, Calendar, Activity, TrendingUp } from "lucide-react";
import { formatTime, formatLastSeen, getActivityStatus } from "../../utils/formatters";

export default function UserLogsTable({ userLogs, revokeAccess }) {
  if (userLogs.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-xl text-gray-500 font-medium">No users found</p>
        <p className="text-gray-400">Users will appear here once they start using the platform</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Users className="w-7 h-7" />
          <span>User Analytics</span>
        </h3>
        <p className="text-purple-100 mt-2">Detailed insights into user behavior and engagement</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Info</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Study Metrics</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Access Details</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userLogs.map((user) => {
              const activityStatus = getActivityStatus(user.last_activity);
              return (
                <tr key={user.device_id} className="hover:bg-purple-50 transition-colors duration-200">
                  <td className="px-6 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${activityStatus.color} rounded-full border-2 border-white`}></div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{user.name || "Anonymous User"}</div>
                        <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{user.device_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-2">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${activityStatus.status === "online" ? "bg-green-100 text-green-800" : activityStatus.status === "away" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${activityStatus.color}`}></div>
                        {activityStatus.status}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>Last seen: {formatLastSeen(user.last_activity)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-purple-500" /><span className="text-sm font-semibold text-gray-700">Study Time: {formatTime(user.total_study_time || 0)}</span></div>
                      <div className="flex items-center space-x-2"><Activity className="w-4 h-4 text-blue-500" /><span className="text-sm font-semibold text-gray-700">Visits: {user.login_count || 0}</span></div>
                      <div className="flex items-center space-x-2"><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-sm font-semibold text-gray-700">Sessions: {user.session_count || 0}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-700">Unlocked Subjects:</div>
                      {user.unlocked_subjects && user.unlocked_subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.unlocked_subjects.map((subject, index) => (<span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{subject}</span>))}
                        </div>
                      ) : (<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No access</span>)}
                      <div className="text-xs text-gray-500 flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>Joined: {new Date(user.created_at).toLocaleDateString()}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <button onClick={() => revokeAccess(user.device_id)} className="flex items-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 font-medium">
                      <Trash2 className="w-4 h-4" />
                      <span>Revoke Access</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
