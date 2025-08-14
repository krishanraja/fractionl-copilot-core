import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { MetricProgress } from '@/types/tracking';

interface ProgressVisualizationProps {
  metrics: MetricProgress[];
  className?: string;
}

export const ProgressVisualization = ({ metrics, className }: ProgressVisualizationProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'bg-success text-success-foreground';
      case 'on-track': return 'bg-warning text-warning-foreground';
      case 'behind': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string, trend: string) => {
    if (status === 'ahead') return <CheckCircle className="w-4 h-4" />;
    if (status === 'behind') return <AlertTriangle className="w-4 h-4" />;
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'bg-success';
      case 'on-track': return 'bg-warning';
      case 'behind': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric) => (
        <Card key={metric.key} className="border-border bg-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className="w-5 h-5 text-primary" />
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {metric.name}
                </CardTitle>
              </div>
              <Badge className={getStatusColor(metric.progress.status)} variant="secondary">
                {getStatusIcon(metric.progress.status, metric.progress.trend)}
                <span className="ml-1 text-xs">
                  {metric.progress.status === 'ahead' ? 'Ahead' : 
                   metric.progress.status === 'on-track' ? 'On Track' : 'Behind'}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Current vs Target */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current:</span>
                <span className="font-semibold text-foreground">
                  {metric.unit === '$' ? '$' : ''}{metric.current.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target:</span>
                <span className="font-medium text-muted-foreground">
                  {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={`font-semibold ${
                    metric.progress.percentage >= 110 ? 'text-success' :
                    metric.progress.percentage >= 90 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {metric.progress.percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(metric.progress.percentage, 100)} 
                  className="h-2"
                />
              </div>

              {/* Status Message */}
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                {metric.progress.message}
              </div>

              {/* Daily Target */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                <span className="flex items-center text-muted-foreground">
                  <Zap className="w-3 h-3 mr-1" />
                  Daily Target:
                </span>
                <span className="font-medium text-foreground">
                  {metric.unit === '$' ? '$' : ''}{metric.dailyTarget.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};