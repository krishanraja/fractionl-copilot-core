import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, TrendingUp, Zap, Target } from 'lucide-react';
import { DailyActuals, MonthlyGoals } from '@/types/dashboard';

interface DailyTrackerProps {
  currentGoals: MonthlyGoals;
  dailyActuals: DailyActuals | null;
  onUpdateDaily: (actuals: DailyActuals) => void;
}

export const DailyTracker = ({ currentGoals, dailyActuals, onUpdateDaily }: DailyTrackerProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<DailyActuals>(
    dailyActuals || {
      date: today,
      month: currentGoals.month,
      grossRevenue: 0,
      totalCosts: 0,
      siteVisits: 0,
      socialFollowers: 0,
      prArticles: 0,
      workshopCustomers: 0,
      advisoryCustomers: 0,
    }
  );

  const trackingFields = [
    { key: 'grossRevenue' as const, label: 'Revenue Today', icon: TrendingUp, prefix: '$' },
    { key: 'totalCosts' as const, label: 'Costs Today', icon: Target, prefix: '$' },
    { key: 'siteVisits' as const, label: 'Site Visits', icon: Target, prefix: '' },
    { key: 'socialFollowers' as const, label: 'New Followers', icon: Target, prefix: '' },
    { key: 'prArticles' as const, label: 'Articles Published', icon: Target, prefix: '' },
    { key: 'workshopCustomers' as const, label: 'Workshop Customers', icon: Target, prefix: '' },
    { key: 'advisoryCustomers' as const, label: 'Advisory Customers', icon: Target, prefix: '' },
  ];

  const handleInputChange = (field: keyof DailyActuals, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = () => {
    onUpdateDaily(formData);
  };

  const isToday = dailyActuals?.date === today;
  const hasData = dailyActuals && Object.values(dailyActuals).some(val => typeof val === 'number' && val > 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle className="text-card-foreground">Daily Progress Tracker</CardTitle>
            {hasData && isToday && (
              <Badge className="bg-success text-success-foreground">
                <CheckCircle className="w-3 h-3 mr-1" />
                Updated Today
              </Badge>
            )}
          </div>
          <Badge variant="outline">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Badge>
        </div>
        <CardDescription>
          Enter today's actual results to track your progress against monthly goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {trackingFields.map(({ key, label, icon: Icon, prefix }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center text-sm font-medium">
                <Icon className="w-4 h-4 mr-2 text-primary" />
                {label}
              </Label>
              <div className="relative">
                {prefix && (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {prefix}
                  </span>
                )}
                <Input
                  id={key}
                  type="number"
                  min="0"
                  step={key.includes('Revenue') || key.includes('Costs') ? "0.01" : "1"}
                  value={formData[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className={`${prefix ? 'pl-8' : ''} bg-input border-border focus:ring-primary`}
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Track your daily actuals to see real-time progress against monthly targets
          </div>
          <Button 
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Zap className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};