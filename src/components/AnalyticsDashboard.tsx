"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Eye, CheckCircle, MousePointer } from 'lucide-react';

export default function AnalyticsDashboard({ data }: { data: any[] }) {
  // 1. Aggregate Data
  const totalViews = data.filter(d => d.event_type === 'view').length
  const completions = data.filter(d => d.event_type === 'finish').length
  const completionRate = totalViews > 0 ? Math.round((completions / totalViews) * 100) : 0
  
  // Aggregate for Charts
  const countryData = Object.entries(data.reduce((acc: any, curr) => {
    acc[curr.country] = (acc[curr.country] || 0) + 1; return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const browserData = Object.entries(data.reduce((acc: any, curr) => {
    acc[curr.browser] = (acc[curr.browser] || 0) + 1; return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Workspace Analytics</h2>
      
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Views" value={totalViews} icon={<Eye size={20} />} />
        <StatCard title="Unique Users" value={totalViews} icon={<Users size={20} />} sub="100%" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={<CheckCircle size={20} />} />
        <StatCard title="Leads" value="0" icon={<MousePointer size={20} />} />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Location</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Browsers</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={browserData}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, sub }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-blue-600 mt-2 font-medium">Auto-calculated</div>}
    </div>
  )
}