import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Plus, Calendar } from 'lucide-react';
import { RevenueEntry } from '@/types/tracking';

interface RevenueTrackerProps {
  selectedMonth: string;
}

export const RevenueTracker = ({ selectedMonth }: RevenueTrackerProps) => {
  const [newEntry, setNewEntry] = useState<Partial<RevenueEntry>>({
    amount: 0,
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleAddEntry = () => {
    // TODO: Implement save to database
    console.log('Adding revenue entry:', newEntry);
    setNewEntry({
      amount: 0,
      source: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <DollarSign className="w-5 h-5 text-primary" />
          Revenue Tracking - {formatMonth(selectedMonth)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Log Revenue Entry
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={newEntry.amount || ''}
                onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source" className="text-sm font-medium text-foreground">
                Revenue Source
              </Label>
              <Select value={newEntry.source} onValueChange={(value) => setNewEntry({ ...newEntry, source: value })}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={newEntry.date || ''}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional description"
                value={newEntry.description || ''}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                className="bg-background border-border resize-none"
                rows={2}
              />
            </div>
          </div>

          <Button 
            onClick={handleAddEntry}
            className="mt-4 w-full md:w-auto"
            disabled={!newEntry.amount || !newEntry.source}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Revenue Entry
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Revenue Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <div className="text-2xl font-bold text-success">$0</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <div className="text-2xl font-bold text-foreground">$0</div>
              <div className="text-sm text-muted-foreground">Last Month</div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-2xl font-bold text-primary">$0</div>
              <div className="text-sm text-muted-foreground">Year to Date</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};