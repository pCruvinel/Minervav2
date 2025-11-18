import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface OSCreationOption {
  label: string;
  route: string;
}

interface OSCreationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  options: OSCreationOption[];
  iconColor?: 'primary' | 'secondary';
  onNavigate: (route: string) => void;
}

export function OSCreationCard({
  icon: Icon,
  title,
  description,
  options,
  iconColor = 'primary',
  onNavigate
}: OSCreationCardProps) {
  const iconColorClass = iconColor === 'primary' ? 'text-primary' : 'text-secondary';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg bg-neutral-100 ${iconColorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          {options.map((option, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5"
              onClick={() => onNavigate(option.route)}
            >
              <span>{option.label}</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
