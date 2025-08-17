import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { 
  CustomerToolSession, 
  LeadScoring, 
  ToolPerformanceMetrics, 
  CustomerJourneyTracking,
  ToolAnalytics,
  LeadInsight 
} from '@/types/customerTracking';
import { toast } from 'sonner';

export const useCustomerAnalytics = (selectedMonth: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toolSessions, setToolSessions] = useState<CustomerToolSession[]>([]);
  const [leadScoring, setLeadScoring] = useState<LeadScoring[]>([]);
  const [toolMetrics, setToolMetrics] = useState<ToolPerformanceMetrics[]>([]);
  const [customerJourneys, setCustomerJourneys] = useState<CustomerJourneyTracking[]>([]);

  const loadCustomerAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startDate = `${selectedMonth}-01`;
      const endDate = new Date(new Date(`${selectedMonth}-01`).getFullYear(), 
                               new Date(`${selectedMonth}-01`).getMonth() + 1, 0).toISOString().split('T')[0];

      // Load tool sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('customer_tool_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (sessionsError) throw sessionsError;

      // Load lead scoring
      const { data: leads, error: leadsError } = await supabase
        .from('lead_scoring')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (leadsError) throw leadsError;

      // Load tool metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('tool_performance_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (metricsError) throw metricsError;

      // Load customer journeys
      const { data: journeys, error: journeysError } = await supabase
        .from('customer_journey_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (journeysError) throw journeysError;

      setToolSessions((sessions || []) as CustomerToolSession[]);
      setLeadScoring((leads || []) as LeadScoring[]);
      setToolMetrics((metrics || []) as ToolPerformanceMetrics[]);
      setCustomerJourneys((journeys || []) as CustomerJourneyTracking[]);
    } catch (error) {
      console.error('Error loading customer analytics:', error);
      toast.error('Failed to load customer analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && selectedMonth) {
      loadCustomerAnalytics();
    }
  }, [user, selectedMonth]);

  const toolAnalytics = useMemo<ToolAnalytics[]>(() => {
    const toolNames = {
      'leadership_assessment': 'Leadership AI Literacy',
      'ai_agent_analysis': 'AI Agent Business Analysis',
      'idea_blueprint': 'Idea-to-AI Blueprint',
      'enterprise_assessment': 'Enterprise L&D Assessment'
    };

    return ['leadership_assessment', 'ai_agent_analysis', 'idea_blueprint', 'enterprise_assessment']
      .map(toolType => {
        const sessions = toolSessions.filter(s => s.tool_type === toolType);
        const metrics = toolMetrics.find(m => m.tool_type === toolType);
        const leads = leadScoring.filter(l => l.lead_source === toolType);
        
        return {
          toolType,
          toolName: toolNames[toolType as keyof typeof toolNames],
          sessions: sessions.length,
          uniqueVisitors: metrics?.unique_visitors || 0,
          avgDuration: sessions.reduce((acc, s) => acc + s.session_duration, 0) / sessions.length || 0,
          completionRate: sessions.reduce((acc, s) => acc + s.completion_percentage, 0) / sessions.length || 0,
          leadsGenerated: leads.length,
          conversionRate: metrics?.conversion_rate || 0,
          revenue: metrics?.revenue_attributed || 0,
          cac: metrics?.customer_acquisition_cost || 0
        };
      });
  }, [toolSessions, toolMetrics, leadScoring]);

  const leadInsights = useMemo<LeadInsight>(() => {
    const hotLeads = leadScoring.filter(l => l.lead_temperature === 'hot').length;
    const warmLeads = leadScoring.filter(l => l.lead_temperature === 'warm').length;
    const coldLeads = leadScoring.filter(l => l.lead_temperature === 'cold').length;
    
    return {
      totalLeads: leadScoring.length,
      hotLeads,
      warmLeads,
      coldLeads,
      avgEngagementScore: leadScoring.reduce((acc, l) => acc + l.engagement_score, 0) / leadScoring.length || 0,
      avgConversionProbability: leadScoring.reduce((acc, l) => acc + l.conversion_probability, 0) / leadScoring.length || 0,
      consultationBookings: leadScoring.filter(l => l.consultation_booked).length,
      convertedToRevenue: leadScoring.reduce((acc, l) => acc + l.actual_value, 0)
    };
  }, [leadScoring]);

  const createLeadScore = async (leadData: Omit<LeadScoring, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lead_scoring')
        .insert([{ ...leadData, user_id: user.id }]);

      if (error) throw error;
      
      await loadCustomerAnalytics();
      toast.success('Lead score created successfully');
    } catch (error) {
      console.error('Error creating lead score:', error);
      toast.error('Failed to create lead score');
    }
  };

  const updateLeadScore = async (id: string, updates: Partial<LeadScoring>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lead_scoring')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadCustomerAnalytics();
      toast.success('Lead score updated successfully');
    } catch (error) {
      console.error('Error updating lead score:', error);
      toast.error('Failed to update lead score');
    }
  };

  return {
    loading,
    toolSessions,
    leadScoring,
    toolMetrics,
    customerJourneys,
    toolAnalytics,
    leadInsights,
    createLeadScore,
    updateLeadScore,
    loadCustomerAnalytics
  };
};