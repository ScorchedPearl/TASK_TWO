import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SpendingCardProps {
  title: string;
  value: string;
  subtitle: string;
  progress?: number;
  progressLabel?: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  className?: string;
}

export const SpendingCard = ({ 
  title, 
  value, 
  subtitle, 
  progress, 
  progressLabel,
  icon: Icon, 
  trend, 
  trendValue,
  className = ""
}: SpendingCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-[#15825d] dark:text-[#34d399]';
      case 'down': return 'text-red-500 dark:text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  return (
    <Card className={`bg-white dark:bg-[#0f1311] border border-gray-200 dark:border-[#1f2937] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#15825d]/10 dark:bg-[#34d399]/20 rounded-lg">
                <Icon className="h-4 w-4 text-[#15825d] dark:text-[#34d399]" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {title}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-[#0a0e1a] dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{progressLabel}</span>
              <span className="font-medium text-[#0a0e1a] dark:text-white">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-gray-200 dark:bg-[#1f2937]" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
