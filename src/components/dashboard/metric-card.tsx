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
  modalVariant?: 'compact' | 'highlight' | 'minimal';
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
  modalVariant,
  onClick,
  to,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      bg: 'bg-background',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    primary: {
      bg: 'bg-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    success: {
      bg: 'bg-success/5',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    warning: {
      bg: 'bg-warning/5',
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
    },
    danger: {
      bg: 'bg-destructive/5',
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
  };

  const style = variantStyles[variant];

  // Estilos específicos para variantes de modal
  const getModalStyles = () => {
    if (!modalVariant) return null;

    const modalStyles = {
      compact: {
        cardClass: 'p-4 shadow-sm',
        iconSize: 'w-8 h-8',
        innerIconSize: 'w-6 h-6',
        titleSize: 'text-xs',
        valueSize: 'text-xl',
        spacing: 'mb-2'
      },
      highlight: {
        cardClass: 'p-5 bg-gradient-to-br from-white to-neutral-50 border-2 border-primary/20 shadow-lg',
        iconSize: 'w-10 h-10',
        innerIconSize: 'w-8 h-8',
        titleSize: 'text-sm font-medium',
        valueSize: 'text-2xl',
        spacing: 'mb-3'
      },
      minimal: {
        cardClass: 'p-3 bg-transparent border-none shadow-none',
        iconSize: 'w-6 h-6',
        innerIconSize: 'w-5 h-5',
        titleSize: 'text-xs text-muted-foreground',
        valueSize: 'text-lg',
        spacing: 'mb-1'
      }
    };

    return modalStyles[modalVariant];
  };

  const modalStyles = getModalStyles();

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
      return 'text-success bg-success/5 border-success/20';
    } else if (trend.direction === 'down') {
      return 'text-destructive bg-destructive/5 border-destructive/20';
    } else {
      return 'text-muted-foreground bg-background border-border';
    }
  };

  const cardContent = (
    <Card
      className={`
        transition-all
        ${modalStyles ? modalStyles.cardClass : 'hover:shadow-md p-6'}
        ${(onClick || to) ? 'cursor-pointer hover:border-primary' : ''}
        ${!modalVariant ? 'hover:shadow-md' : ''}
      `}
      onClick={onClick}
    >
      <CardContent className={modalStyles ? modalStyles.cardClass : "p-6"}>
        <div className={`flex items-start justify-between ${modalStyles?.spacing || 'mb-4'}`}>
          <div className={`${modalStyles?.iconSize || 'w-12 h-12'} rounded-lg ${style.bg} flex items-center justify-center`}>
            <div className={`${modalStyles?.innerIconSize || 'w-10 h-10'} rounded-lg ${style.iconBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${style.iconColor}`} />
            </div>
          </div>

          {trend && modalVariant !== 'minimal' && (
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
          <p className={`${modalStyles?.titleSize || 'text-sm'} text-muted-foreground mb-1`}>{title}</p>
          <p className={`${modalStyles?.valueSize || 'text-3xl'} font-semibold mb-2`}>{value}</p>

          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {trend && modalVariant !== 'minimal' && (
            <p className="text-xs text-muted-foreground mt-2">
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
