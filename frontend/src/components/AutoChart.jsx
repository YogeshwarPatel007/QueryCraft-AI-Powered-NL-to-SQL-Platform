import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AutoChart({ chartConfig, data }) {
  if (!chartConfig || chartConfig.type === 'none' || !data || data.length === 0) return null;

  const { type, xAxis, yAxis } = chartConfig;

  // Format data if needed (e.g. converting string numbers to floats)
  const chartData = data.map(item => ({
    ...item,
    [yAxis]: Number(item[yAxis]) || item[yAxis]
  }));

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yAxis} stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxis} fill="#82ca9d" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={chartData}
              dataKey={yAxis}
              nameKey={xAxis}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-96 mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-slate-800 capitalize">
        Visualized: {yAxis} by {xAxis}
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
