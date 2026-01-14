"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Eye, Target, Send, TrendingUp, TrendingDown, Globe, Monitor } from 'lucide-react';

export default function AnalyticsDashboard({ data }: { data: any[] }) {
  // 1. Aggregate Data
  const totalViews = data.filter(d => d.event_type === 'view').length
  const completions = data.filter(d => d.event_type === 'finish').length
  const completionRate = totalViews > 0 ? Math.round((completions / totalViews) * 100) : 0
  const uniqueUsers = new Set(data.map(d => d.user_id || d.country + d.browser)).size

  // Aggregate for Charts
  const countryData = Object.entries(data.reduce((acc: any, curr) => {
    acc[curr.country] = (acc[curr.country] || 0) + 1; return acc;
  }, {}))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 5);

  // Calculate total for percentages
  const totalCountryEvents = countryData.reduce((sum, item) => sum + (item.value as number), 0);
  const countryDataWithPercentages = countryData.map(item => ({
    ...item,
    percentage: Math.round(((item.value as number) / totalCountryEvents) * 100)
  }));

  // Device data (mock data since we don't have device info in analytics)
  const deviceData = [
    { name: 'Desktop', value: 82, color: '#4F46E5' },
    { name: 'Tablet', value: 12, color: '#A5B4FC' },
    { name: 'Mobile', value: 6, color: '#C7D2FE' }
  ];

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workspace Analytics</h1>
          <p className="text-gray-500 mt-1">Track performance across all your guides</p>
        </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={<Eye size={20} />}
          trend={12.5}
          trendUp={true}
        />
        <StatCard
          title="Unique Users"
          value={uniqueUsers.toLocaleString()}
          icon={<Users size={20} />}
          trend={8.2}
          trendUp={true}
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<Target size={20} />}
          trend={2.1}
          trendUp={false}
        />
        <StatCard
          title="Leads Generated"
          value="142"
          icon={<Send size={20} />}
          trend={18.4}
          trendUp={true}
        />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Top Locations</h3>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Report
            </button>
          </div>
          <div className="space-y-4">
            {countryDataWithPercentages.map((country, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">{country.name}</span>
                  <span className="text-gray-900 font-semibold">{country.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${country.percentage}%`,
                      backgroundColor: index === 0 ? '#3B82F6' : index === 1 ? '#60A5FA' : index === 2 ? '#93C5FD' : index === 3 ? '#BFDBFE' : '#DBEAFE'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Usage Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Monitor size={20} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Device Usage</h3>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-4xl font-bold text-gray-900">{deviceData[0].value}%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Desktop</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {deviceData.map((device, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: device.color }}
                />
                <div className="text-sm">
                  <span className="text-gray-700 font-medium">{device.name}</span>
                  <span className="text-gray-900 font-semibold ml-1">{device.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <div className="p-2 bg-gray-50 rounded-lg text-gray-600">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{trend}%</span>
        </div>
      )}
    </div>
  )
}