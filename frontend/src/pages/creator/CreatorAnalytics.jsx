import React, { useState, useEffect } from "react";
import {
    CurrencyDollarIcon,
    ShoppingCartIcon,
    CubeIcon,
    UserGroupIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

const CreatorAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/analytics/dashboard");
            setDashboardData(res.data);
        } catch (err) {
            console.error("Error fetching analytics:", err);
            setError("Failed to load analytics data.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingIndicator />;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const stats = dashboardData?.stats || {};
    const chartData = dashboardData?.chartData || [];
    const recentSales = dashboardData?.recentSales || [];

    const kpiCards = [
        {
            title: "Total Revenue",
            value: `$${parseFloat(stats.totalRevenue || 0).toFixed(2)}`,
            icon: CurrencyDollarIcon,
            color: "from-emerald-500 to-emerald-600",
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            title: "Total Sales",
            value: stats.totalSales || 0,
            icon: ShoppingCartIcon,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Active Products",
            value: stats.totalProducts || 0,
            icon: CubeIcon,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
        },
        {
            title: "Active Customers",
            value: stats.activeCustomers || 0,
            icon: UserGroupIcon,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            iconColor: "text-orange-600",
        },
    ];

    // Calculate max revenue for chart scaling
    const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-1">Track your performance and sales</p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-gray-400" />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                            </div>
                            <div className={`p-3 ${card.bgColor} rounded-xl`}>
                                <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend (Last 30 Days)</h2>
                {chartData.length > 0 ? (
                    <div className="space-y-2">
                        {chartData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-20">
                                    {new Date(item.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full flex items-center px-3"
                                        style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                                    >
                                        <span className="text-xs text-white font-semibold">
                                            ${item.revenue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No revenue data available</p>
                )}
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Sales</h2>
                {recentSales.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Product
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Buyer
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Price
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.map((sale) => (
                                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">{sale.assetName}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{sale.buyer}</td>
                                        <td className="py-3 px-4 text-sm font-semibold text-emerald-600">
                                            ${sale.price.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(sale.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No recent sales</p>
                )}
            </div>
        </div>
    );
};

export default CreatorAnalytics;
