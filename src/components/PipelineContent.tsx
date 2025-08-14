import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OpportunityPipeline } from './OpportunityPipeline';
import { PipelineProgress } from './PipelineProgress';
import { useOpportunityData } from '@/hooks/useOpportunityData';
import { MonthlyGoals } from '@/types/tracking';

interface PipelineContentProps {
  selectedMonth: string;
  monthlyGoals: MonthlyGoals | null;
}

export const PipelineContent = ({ selectedMonth, monthlyGoals }: PipelineContentProps) => {
  const {
    opportunities,
    loading,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
  } = useOpportunityData(selectedMonth);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">Loading pipeline data...</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="progress" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="progress">Progress Overview</TabsTrigger>
        <TabsTrigger value="pipeline">Manage Pipeline</TabsTrigger>
      </TabsList>

      <TabsContent value="progress">
        <PipelineProgress
          opportunities={opportunities}
          monthlyGoals={monthlyGoals}
          selectedMonth={selectedMonth}
        />
      </TabsContent>

      <TabsContent value="pipeline">
        <OpportunityPipeline
          opportunities={opportunities}
          selectedMonth={selectedMonth}
          onCreateOpportunity={createOpportunity}
          onUpdateOpportunity={updateOpportunity}
          onDeleteOpportunity={deleteOpportunity}
        />
      </TabsContent>
    </Tabs>
  );
};