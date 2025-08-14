import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, DollarSign, Users, Megaphone, Presentation } from 'lucide-react';
import { Opportunity, MonthlyGoals } from '@/types/tracking';

interface PipelineProgressProps {
  opportunities: Opportunity[];
  monthlyGoals: MonthlyGoals | null;
  selectedMonth: string;
}

const OPPORTUNITY_TYPES = [
  { value: 'workshop', label: 'Workshops', icon: Users, target: 'workshops_target' },
  { value: 'advisory', label: 'Advisory', icon: Target, target: 'advisory_target' },
  { value: 'lecture', label: 'Lectures', icon: Presentation, target: 'lectures_target' },
  { value: 'pr', label: 'PR/Content', icon: Megaphone, target: 'pr_target' },
];

export const PipelineProgress = ({ opportunities, monthlyGoals, selectedMonth }: PipelineProgressProps) => {
  const formatMonth = (month: string): string => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const calculateProgress = (type: string) => {
    const typeOpportunities = opportunities.filter(opp => opp.type === type);
    const wonOpportunities = typeOpportunities.filter(opp => opp.stage === 'won');
    const pipelineOpportunities = typeOpportunities.filter(opp => 
      ['lead', 'qualified', 'proposal', 'negotiation'].includes(opp.stage)
    );
    
    const targetKey = OPPORTUNITY_TYPES.find(t => t.value === type)?.target as keyof MonthlyGoals;
    const target = monthlyGoals ? (monthlyGoals[targetKey] as number) || 0 : 0;
    
    const progress = target > 0 ? (wonOpportunities.length / target) * 100 : 0;
    const pipelineValue = pipelineOpportunities.reduce((sum, opp) => sum + opp.estimated_value, 0);
    const pipelineWeightedValue = pipelineOpportunities.reduce((sum, opp) => 
      sum + (opp.estimated_value * opp.probability / 100), 0
    );

    return {
      achieved: wonOpportunities.length,
      target,
      progress: Math.min(progress, 100),
      inPipeline: pipelineOpportunities.length,
      pipelineValue,
      pipelineWeightedValue,
      status: progress >= 100 ? 'achieved' : progress >= 75 ? 'on-track' : progress >= 50 ? 'behind' : 'critical'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-green-500';
      case 'on-track': return 'bg-blue-500';
      case 'behind': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'achieved': return 'Target Achieved';
      case 'on-track': return 'On Track';
      case 'behind': return 'Behind Target';
      case 'critical': return 'Critical';
      default: return 'Not Started';
    }
  };

  // Calculate overall revenue progress
  const totalRevenue = opportunities
    .filter(opp => opp.stage === 'won')
    .reduce((sum, opp) => sum + opp.estimated_value, 0);
  const revenueTarget = monthlyGoals?.revenue_forecast || 0;
  const revenueProgress = revenueTarget > 0 ? (totalRevenue / revenueTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Progress - {formatMonth(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Revenue Target</span>
              <span className="text-sm text-muted-foreground">
                ${totalRevenue.toLocaleString()} / ${revenueTarget.toLocaleString()}
              </span>
            </div>
            <Progress value={Math.min(revenueProgress, 100)} className="h-2" />
            <div className="flex justify-between items-center">
              <Badge className={getStatusColor(revenueProgress >= 100 ? 'achieved' : revenueProgress >= 75 ? 'on-track' : 'behind')}>
                {revenueProgress.toFixed(1)}% Complete
              </Badge>
              <span className="text-xs text-muted-foreground">
                {revenueProgress >= 100 ? 'Target Exceeded!' : `$${(revenueTarget - totalRevenue).toLocaleString()} remaining`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OPPORTUNITY_TYPES.map(type => {
          const progress = calculateProgress(type.value);
          const TypeIcon = type.icon;

          return (
            <Card key={type.value}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TypeIcon className="h-4 w-4" />
                  {type.label}
                </CardTitle>
                <CardDescription>
                  {progress.achieved} / {progress.target} achieved
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Target Progress</span>
                    <Badge className={getStatusColor(progress.status)}>
                      {getStatusLabel(progress.status)}
                    </Badge>
                  </div>
                  <Progress value={progress.progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {progress.progress.toFixed(1)}% complete
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">In Pipeline</div>
                    <div className="font-medium">{progress.inPipeline} opportunities</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Pipeline Value</div>
                    <div className="font-medium">${progress.pipelineValue.toLocaleString()}</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">Weighted Pipeline Value</div>
                  <div className="text-sm font-medium">${progress.pipelineWeightedValue.toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};