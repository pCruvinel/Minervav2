// Card de Métrica - Sistema Minerva ERP
'use client';

import { Link } from '@tanstack/react-router';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  to?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  onClick,
  to,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      bg: 'bg-neutral-50',
      iconBg: 'bg-neutral-100',
      iconColor: 'text-neutral-600',
    },
    primary: {
      bg: 'bg-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    success: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    warning: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    danger: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  };

  const style = variantStyles[variant];

  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.direction === 'up') {
      return <TrendingUp className="w-3 h-3" />;
    } else if (trend.direction === 'down') {
      return <TrendingDown className="w-3 h-3" />;
    } else {
      return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';

    if (trend.direction === 'up') {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (trend.direction === 'down') {
      return 'text-red-600 bg-red-50 border-red-200';
    } else {
      return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const cardContent = (
    <Card
      className={`
        transition-all hover:shadow-md
        ${(onClick || to) ? 'cursor-pointer hover:border-primary' : ''}
      `}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${style.bg} flex items-center justify-center`}>
            <div className={`w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${style.iconColor}`} />
            </div>
          </div>

          {trend && (
            <Badge
              variant="outline"
              className={`${getTrendColor()} flex items-center gap-1 text-xs`}
            >
              {getTrendIcon()}
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </Badge>
          )}
        </div>

        <div>
          <p className="text-sm text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold mb-2">{value}</p>

          {description && (
            <p className="text-xs text-neutral-500">{description}</p>
          )}

          {trend && (
            <p className="text-xs text-neutral-500 mt-2">
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
