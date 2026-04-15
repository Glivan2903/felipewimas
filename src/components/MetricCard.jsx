import React from 'react';
import { formatCurrency } from '../utils/formatters';

const MetricCard = ({ title, value, icon, type = 'neutral' }) => {
  const isNegative = value < 0;
  
  let colors = { bg: 'bg-white', text: 'text-gray-900', iconBg: 'bg-gray-100', iconColor: 'text-gray-500' };
  
  if (type === 'entrada') colors = { bg: 'bg-white', text: 'text-gray-900', iconBg: 'bg-green-100', iconColor: 'text-green-600' };
  if (type === 'saida') colors = { bg: 'bg-white', text: 'text-gray-900', iconBg: 'bg-red-100', iconColor: 'text-red-500' };
  if (type === 'diario') colors = { bg: 'bg-white', text: 'text-gray-900', iconBg: 'bg-amber-100', iconColor: 'text-amber-500' };
  if (type === 'saldo') {
    colors = isNegative 
      ? { bg: 'bg-red-50', text: 'text-red-700', iconBg: 'bg-red-200', iconColor: 'text-red-700' }
      : { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-200', iconColor: 'text-green-700' };
    if(value === 0) {
       colors = { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-200', iconColor: 'text-blue-700' };
    }
  }

  return (
    <div className={`p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col ${colors.bg}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`p-2 rounded-lg ${colors.iconBg} ${colors.iconColor}`}>
          {icon}
        </div>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${colors.text}`}>
         {formatCurrency(value)}
      </div>
    </div>
  );
};

export default MetricCard;
