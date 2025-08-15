import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sheet, 
  Download, 
  Upload, 
  ExternalLink, 
  Settings, 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Clock, 
  Calendar,
  BarChart3,
  Target,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Info
} from 'lucide-react';

interface SheetsIntegration {
  id: string;
  google_sheet_id: string | null;
  sheet_name: string | null;
  sync_enabled: boolean;
  sync_status: string;
  last_sync_at: string | null;
}

interface GoogleSheetsIntegrationProps {
  selectedMonth: string;
}

export const GoogleSheetsIntegration = ({ selectedMonth }: GoogleSheetsIntegrationProps) => {
  const [integration, setIntegration] = useState<SheetsIntegration | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingType, setExportingType] = useState<string>('');
  const { toast } = useToast();

  // Helper function to get current step
  const getCurrentStep = () => {
    if (!integration) return 0;
    if (integration.sync_status !== 'success') return 1;
    if (!integration.google_sheet_id) return 2;
    return 3;
  };

  // Steps configuration
  const steps = [
    { id: 0, title: "Connect", description: "Authenticate with Google" },
    { id: 1, title: "Verified", description: "Google account connected" },
    { id: 2, title: "Create", description: "Set up your spreadsheet" },
    { id: 3, title: "Export", description: "Ready to sync data" }
  ];

  useEffect(() => {
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      const { data, error } = await supabase
        .from('sheets_integrations')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIntegration(data);
    } catch (error: any) {
      console.error('Error fetching integration:', error);
    }
  };

  const handleAuthenticate = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Test the dedicated secret test endpoint (no auth required)
      console.log('Testing Google OAuth secret...');
      const testResponse = await fetch(
        `https://ksyuwacuigshvcyptlhe.supabase.co/functions/v1/test-google-secret`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const testData = await testResponse.json();
      console.log('Secret test result:', testData);
      
      if (!testData.hasSecret) {
        throw new Error('Google OAuth credentials are not configured in Supabase. Please add them in the Edge Functions secrets.');
      }
      
      if (!testData.isValidJson) {
        throw new Error(`Google OAuth credentials are invalid JSON: ${testData.parseError}`);
      }
      
      if (!testData.credentialStructure?.hasWeb) {
        throw new Error('Google OAuth credentials are missing the "web" configuration object.');
      }
      
      if (!testData.credentialStructure?.hasClientId || !testData.credentialStructure?.hasClientSecret) {
        throw new Error('Google OAuth credentials are missing client_id or client_secret.');
      }

      // Get auth URL from backend
      const authResponse = await fetch(
        `https://ksyuwacuigshvcyptlhe.supabase.co/functions/v1/google-sheets-integration?action=auth_url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          }
        }
      );

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(errorData.error || 'Failed to get auth URL');
      }

      const { authUrl } = await authResponse.json();
      
      // Open the auth URL in a popup window
      const popup = window.open(authUrl, 'google-oauth', 'width=600,height=600');
      
      // Listen for OAuth completion messages
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'oauth_success') {
          window.removeEventListener('message', handleMessage);
          popup?.close();
          toast({
            title: 'Success',
            description: event.data.message,
          });
          fetchIntegration(); // Refresh integration status
        } else if (event.data.type === 'oauth_error') {
          window.removeEventListener('message', handleMessage);
          popup?.close();
          toast({
            title: 'Authentication Failed',
            description: event.data.error || 'Authentication failed',
            variant: 'destructive',
          });
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Clean up if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Authentication Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleCreateSheet = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://ksyuwacuigshvcyptlhe.supabase.co/functions/v1/google-sheets-integration?action=create_sheet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ 
            title: `Business Tracker - ${new Date().getFullYear()}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sheet creation failed');
      }

      toast({
        title: 'Spreadsheet Created',
        description: 'Your business tracking spreadsheet is ready!',
      });

      fetchIntegration();
    } catch (error: any) {
      toast({
        title: 'Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (dataType: string) => {
    setExporting(true);
    setExportingType(dataType);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://ksyuwacuigshvcyptlhe.supabase.co/functions/v1/google-sheets-integration?action=export_data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ 
            dataType,
            month: selectedMonth,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      toast({
        title: 'Export Successful',
        description: `${dataType.replace('_', ' ')} data exported to Google Sheets.`,
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
      setExportingType('');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      pending: 'secondary',
      error: 'destructive',
      syncing: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const currentStep = getCurrentStep();
  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Google Sheets Integration
          </CardTitle>
          <CardDescription>
            Export your business data to Google Sheets for analysis and sharing.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step Progress Indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Setup Progress</span>
              <span className="text-muted-foreground">{currentStep + 1} of {steps.length}</span>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center space-y-1">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                    ${index <= currentStep 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-muted-foreground border-muted-foreground'
                    }
                  `}>
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : index === currentStep ? (
                      <Circle className="h-4 w-4 fill-current" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-medium ${
                      index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Main Content Based on Current Step */}
          {currentStep === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <Sheet className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect to Google Sheets</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Authenticate with your Google account to start exporting your business tracking data automatically.
              </p>
              <Button onClick={handleAuthenticate} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Circle className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Sheet className="h-4 w-4 mr-2" />
                    Connect Google Account
                  </>
                )}
              </Button>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    We'll only access your Google Sheets to create and update spreadsheets with your business data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Google Account Connected!</h3>
              <p className="text-muted-foreground mb-6">
                Successfully authenticated with Google. Now let's create your business tracking spreadsheet.
              </p>
              <Button onClick={handleCreateSheet} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Circle className="h-4 w-4 mr-2 animate-spin" />
                    Creating Spreadsheet...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Create Business Tracker Spreadsheet
                  </>
                )}
              </Button>
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-800">
                  This will create a new Google Sheet titled "Business Tracker - {new Date().getFullYear()}" in your Google Drive.
                </p>
              </div>
            </div>
          )}

          {currentStep >= 2 && integration?.google_sheet_id && (
            <div className="space-y-6">
              {/* Status and Quick Actions */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-green-900">Ready to Export!</h3>
                    <p className="text-sm text-green-700">
                      {integration.sheet_name || `Business Tracker - ${new Date().getFullYear()}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${integration.google_sheet_id}`, '_blank')}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Sheet
                  </Button>
                </div>
              </div>

              {/* Last Sync Info */}
              {integration.last_sync_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last synced: {new Date(integration.last_sync_at).toLocaleDateString()} at {new Date(integration.last_sync_at).toLocaleTimeString()}
                </div>
              )}

              {/* Export Options */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Data for {selectedMonth}
                </h4>
                
                <div className="grid gap-3">
                  {/* Monthly Goals Export */}
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium">Monthly Goals & Targets</h5>
                          <p className="text-sm text-muted-foreground">
                            Revenue goals, business targets, and monthly objectives
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportData('monthly_goals')}
                        disabled={exporting}
                      >
                        {exporting && exportingType === 'monthly_goals' ? (
                          <>
                            <Circle className="h-4 w-4 mr-2 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Daily Progress Export */}
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium">Daily Progress & Metrics</h5>
                          <p className="text-sm text-muted-foreground">
                            Daily tracking data, progress updates, and performance metrics
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportData('daily_progress')}
                        disabled={exporting}
                      >
                        {exporting && exportingType === 'daily_progress' ? (
                          <>
                            <Circle className="h-4 w-4 mr-2 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Export All */}
                  <div className="pt-2">
                    <Button 
                      onClick={async () => {
                        await handleExportData('monthly_goals');
                        await handleExportData('daily_progress');
                      }}
                      disabled={exporting}
                      className="w-full"
                      size="lg"
                    >
                      {exporting ? (
                        <>
                          <Circle className="h-4 w-4 mr-2 animate-spin" />
                          Exporting All Data...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Export All Data for {selectedMonth}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status indicator for authenticated but no sheet */}
          {currentStep === 2 && integration && !integration.google_sheet_id && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Your Spreadsheet</h3>
              <p className="text-muted-foreground mb-6">
                You're connected! Now let's create your business tracking spreadsheet.
              </p>
              <Button onClick={handleCreateSheet} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Circle className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Create Spreadsheet
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};