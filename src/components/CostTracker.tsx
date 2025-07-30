import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export interface Cost {
  id: string;
  name: string;
  amount: number;
  category: 'Variable Costs' | 'Fixed Costs';
}

interface CostTrackerProps {
  costs: Cost[];
  onUpdateCosts: (costs: Cost[]) => void;
}

export const CostTracker = ({ costs, onUpdateCosts }: CostTrackerProps) => {
  const [newCost, setNewCost] = useState<{ name: string; amount: number; category: 'Variable Costs' | 'Fixed Costs' }>({ 
    name: '', 
    amount: 0, 
    category: 'Variable Costs' 
  });

  const addCost = () => {
    if (newCost.name && newCost.amount > 0) {
      const cost: Cost = {
        id: Date.now().toString(),
        ...newCost
      };
      onUpdateCosts([...costs, cost]);
      setNewCost({ name: '', amount: 0, category: 'Variable Costs' });
    }
  };

  const deleteCost = (id: string) => {
    onUpdateCosts(costs.filter(cost => cost.id !== id));
  };

  const variableCosts = costs.filter(cost => cost.category === 'Variable Costs');
  const fixedCosts = costs.filter(cost => cost.category === 'Fixed Costs');
  
  const variableTotal = variableCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const fixedTotal = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalCosts = variableTotal + fixedTotal;

  const CostCategory = ({ title, costs: categoryCosts, total, icon }: {
    title: string;
    costs: Cost[];
    total: number;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const Icon = icon;
    
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Icon className="w-5 h-5 mr-2 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>
            Total: <Badge variant="outline">${total.toLocaleString()}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryCosts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No costs added yet</p>
          ) : (
            categoryCosts.map((cost) => (
              <div key={cost.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">{cost.name}</p>
                  <p className="text-sm text-muted-foreground">${cost.amount.toLocaleString()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCost(cost.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add New Cost */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Plus className="w-5 h-5 mr-2 text-primary" />
            Add New Cost
          </CardTitle>
          <CardDescription>Track your business expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost-name">Cost Name</Label>
              <Input
                id="cost-name"
                placeholder="e.g., AI Platform Subscription"
                value={newCost.name}
                onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-amount">Amount ($)</Label>
              <Input
                id="cost-amount"
                type="number"
                placeholder="0"
                value={newCost.amount || ''}
                onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) || 0 })}
                className="bg-input border-border"
                min="0"
                step="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-category">Category</Label>
              <Select 
                value={newCost.category} 
                onValueChange={(value) => 
                  setNewCost({ ...newCost, category: value as 'Variable Costs' | 'Fixed Costs' })
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Variable Costs">Variable Costs</SelectItem>
                  <SelectItem value="Fixed Costs">Fixed Costs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addCost} className="w-full bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Cost
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <DollarSign className="w-5 h-5 mr-2 text-primary" />
            Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-medium text-muted-foreground">Variable Costs</p>
              <p className="text-2xl font-bold text-destructive">${variableTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{variableCosts.length} items</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-medium text-muted-foreground">Fixed Costs</p>
              <p className="text-2xl font-bold text-destructive">${fixedTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{fixedCosts.length} items</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary">Total Costs</p>
              <p className="text-2xl font-bold text-primary">${totalCosts.toLocaleString()}</p>
              <p className="text-xs text-primary/70">{costs.length} total items</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostCategory 
          title="Variable Costs" 
          costs={variableCosts} 
          total={variableTotal}
          icon={TrendingUp}
        />
        <CostCategory 
          title="Fixed Costs" 
          costs={fixedCosts} 
          total={fixedTotal}
          icon={TrendingDown}
        />
      </div>
    </div>
  );
};