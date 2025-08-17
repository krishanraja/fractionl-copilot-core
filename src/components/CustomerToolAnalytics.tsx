import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, TrendingUp, DollarSign, Target, Clock, UserCheck, Zap } from "lucide-react";
import { ToolAnalytics, LeadInsight } from "@/types/customerTracking";

interface CustomerToolAnalyticsProps {
  toolAnalytics: ToolAnalytics[];
  leadInsights: LeadInsight;
  loading: boolean;
}

export const CustomerToolAnalytics = ({ toolAnalytics, leadInsights, loading }: CustomerToolAnalyticsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getLeadTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-orange-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lead Temperature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadInsights.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              All customer tool interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{leadInsights.hotLeads}</div>
            <p className="text-xs text-muted-foreground">
              Ready for immediate follow-up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{leadInsights.consultationBookings}</div>
            <p className="text-xs text-muted-foreground">
              Consultation bookings secured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(leadInsights.convertedToRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From converted leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Temperature Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lead Temperature Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Hot Leads</span>
              </div>
              <div className="flex items-center gap-4">
                <Progress 
                  value={(leadInsights.hotLeads / leadInsights.totalLeads) * 100} 
                  className="w-24" 
                />
                <span className="text-sm font-medium">{leadInsights.hotLeads}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm">Warm Leads</span>
              </div>
              <div className="flex items-center gap-4">
                <Progress 
                  value={(leadInsights.warmLeads / leadInsights.totalLeads) * 100} 
                  className="w-24" 
                />
                <span className="text-sm font-medium">{leadInsights.warmLeads}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Cold Leads</span>
              </div>
              <div className="flex items-center gap-4">
                <Progress 
                  value={(leadInsights.coldLeads / leadInsights.totalLeads) * 100} 
                  className="w-24" 
                />
                <span className="text-sm font-medium">{leadInsights.coldLeads}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Customer Tool Performance
          </CardTitle>
          <CardDescription>
            Comparative analysis of your 4 customer-facing AI tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {toolAnalytics.map((tool) => (
                  <Card key={tool.toolType}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{tool.toolName}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sessions:</span>
                        <span className="font-medium">{tool.sessions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Visitors:</span>
                        <span className="font-medium">{tool.uniqueVisitors}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Leads:</span>
                        <span className="font-medium">{tool.leadsGenerated}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Revenue:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(tool.revenue)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4">
              {toolAnalytics.map((tool) => (
                <div key={tool.toolType} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{tool.toolName}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Avg: {formatDuration(tool.avgDuration)}
                      </span>
                      <span>Completion: {tool.completionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{tool.sessions}</div>
                    <div className="text-sm text-muted-foreground">sessions</div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="conversion" className="space-y-4">
              {toolAnalytics.map((tool) => (
                <div key={tool.toolType} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{tool.toolName}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={tool.conversionRate > 10 ? "default" : "secondary"}>
                        {tool.conversionRate.toFixed(1)}% conversion
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{tool.leadsGenerated}</div>
                    <div className="text-sm text-muted-foreground">leads generated</div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              {toolAnalytics.map((tool) => (
                <div key={tool.toolType} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{tool.toolName}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>CAC: {formatCurrency(tool.cac)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(tool.revenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">revenue attributed</div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};