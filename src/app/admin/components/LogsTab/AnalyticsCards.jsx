"use client";
import React from "react";
import { Users, Activity, Key, UserCheck, Clock } from "lucide-react";
import { formatTime } from "../../utils/formatters";

const Card = ({ title, value, icon, gradient, subValue }) => (
    <div className={`${gradient} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium uppercase tracking-wide">{title}</p>
                <p className="text-3xl font-bold mt-2">{value}</p>
                {subValue && <p className="text-xs mt-1">{subValue}</p>}
            </div>
            <div className="bg-white/20 p-3 rounded-full">
                {icon}
            </div>
        </div>
    </div>
);


export default function AnalyticsCards({ analytics }) {
    const usageRate = analytics.totalCodes > 0
        ? Math.round((analytics.usedCodes / analytics.totalCodes) * 100)
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card
                title="Total Users"
                value={analytics.totalUsers}
                icon={<Users className="w-8 h-8" />}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600 text-blue-100"
            />
            <Card
                title="Active Users"
                value={analytics.activeUsers}
                subValue="Last 24 hours"
                icon={<Activity className="w-8 h-8" />}
                gradient="bg-gradient-to-br from-green-500 to-green-600 text-green-100"
            />
            <Card
                title="Total Codes"
                value={analytics.totalCodes}
                icon={<Key className="w-8 h-8" />}
                gradient="bg-gradient-to-br from-purple-500 to-purple-600 text-purple-100"
            />
            <Card
                title="Used Codes"
                value={analytics.usedCodes}
                subValue={`${usageRate}% usage rate`}
                icon={<UserCheck className="w-8 h-8" />}
                gradient="bg-gradient-to-br from-red-500 to-red-600 text-red-100"
            />
            <Card
                title="Study Time"
                value={formatTime(analytics.totalStudyTime)}
                subValue="Combined total"
                icon={<Clock className="w-8 h-8" />}
                gradient="bg-gradient-to-br from-orange-500 to-orange-600 text-orange-100"
            />
        </div>
    );
}
