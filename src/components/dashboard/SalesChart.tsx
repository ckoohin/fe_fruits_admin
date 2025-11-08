'use client';

import React from 'react';

export function SalesChart() {
  const chartData = [
    { label: '01', value: 500000 },
    { label: '02', value: 1200000 },
    { label: '03', value: 2200000 },
    { label: '04', value: 2800000 },
    { label: '05', value: 3500000 },
    { label: '06', value: 4200000 },
    { label: '07', value: 3000000 },
    { label: '08', value: 4700000 },
    { label: '09', value: 5200000 },
    { label: '10', value: 5800000 },
    { label: '11', value: 6000000 },
    { label: '12', value: 5500000 },
  ];

  const height = 200;
  const width = 800;
  const padding = 20;

  const maxValue = 6000000;
  const minValue = 0;
  const range = maxValue - minValue;

  const points = chartData
    .map((item, index) => {
      const x = (index / (chartData.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((item.value - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative h-64 w-full overflow-hidden bg-white p-4 rounded-lg shadow">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {Array.from({ length: 6 }, (_, i) => {
          const y = padding + (i * (height - 2 * padding)) / 5;
          return (
            <line
              key={i}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4"
            />
          );
        })}

        {Array.from({ length: 7 }, (_, i) => {
          const value = maxValue - (i * range) / 6;
          const y = padding + (i * (height - 2 * padding)) / 6;
          return (
            <text
              key={i}
              x={padding - 10}
              y={y + 3}
              textAnchor="end"
              className="text-xs text-gray-500"
            >
              {value.toLocaleString('vi-VN')} ₫
            </text>
          );
        })}

        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />

        {chartData.map((item, index) => {
          const [x, y] = points.split(' ')[index].split(',').map(Number);
          return <circle key={index} cx={x} cy={y} r="3" fill="#3b82f6" />;
        })}

        {chartData.map((item, index) => {
          const x = (index / (chartData.length - 1)) * (width - 2 * padding) + padding;
          return (
            <text
              key={index}
              x={x}
              y={height - padding + 15}
              textAnchor="middle"
              className="text-xs text-gray-500"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}