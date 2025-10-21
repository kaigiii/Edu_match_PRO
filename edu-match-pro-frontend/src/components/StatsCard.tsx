/**
 * 統計卡片組件
 * 統一處理統計數據的顯示
 */

import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber, formatCurrency, calculatePercentage } from '../utils/stats';

interface StatsCardProps {
  title: string;
  value: number;
  unit?: string;
  isCurrency?: boolean;
  percentage?: number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  unit = '',
  isCurrency = false,
  percentage,
  icon,
  color,
  trend,
  trendValue
}) => {
  const formatValue = () => {
    if (isCurrency) {
      return formatCurrency(value);
    }
    return formatNumber(value) + unit;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue()}</p>
          {percentage !== undefined && (
            <p className="text-sm text-gray-500">
              佔比: {percentage.toFixed(1)}%
            </p>
          )}
          {trend && trendValue !== undefined && (
            <div className={`flex items-center text-sm ${getTrendColor()}`}>
              <span className="mr-1">{getTrendIcon()}</span>
              <span>{trendValue > 0 ? '+' : ''}{trendValue}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
