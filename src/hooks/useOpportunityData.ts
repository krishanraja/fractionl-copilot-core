import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/types/tracking';
import { useAuth } from './useAuth';

export interface OpportunityOperationResult {
  success: boolean;
  error?: string;
  data?: Opportunity;
}

export const useOpportunityData = (selectedMonth: string) => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const loadOpportunities = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setLastError(null);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('month', selectedMonth)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading opportunities:', error);
        setLastError(error.message);
      } else {
        setOpportunities((data || []) as Opportunity[]);
      }
    } catch (error: any) {
      console.error('Error loading opportunities:', error);
      setLastError('Failed to load opportunity data');
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth]);

  const createOpportunity = useCallback(async (opportunityData: Partial<Opportunity>): Promise<OpportunityOperationResult> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      if (!opportunityData.title || !opportunityData.type) {
        return { success: false, error: 'Title and type are required' };
      }
      
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          ...opportunityData,
          user_id: user.id,
          month: selectedMonth,
          title: opportunityData.title,
          type: opportunityData.type
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating opportunity:', error);
        return { success: false, error: error.message };
      }
      
      setOpportunities(prev => [data as Opportunity, ...prev]);
      return { success: true, data: data as Opportunity };
    } catch (error: any) {
      console.error('Error creating opportunity:', error);
      return { success: false, error: 'Failed to create opportunity' };
    }
  }, [user, selectedMonth]);

  const updateOpportunity = useCallback(async (id: string, updates: Partial<Opportunity>): Promise<OpportunityOperationResult> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating opportunity:', error);
        return { success: false, error: error.message };
      }
      
      setOpportunities(prev => 
        prev.map(opp => opp.id === id ? data as Opportunity : opp)
      );
      return { success: true, data: data as Opportunity };
    } catch (error: any) {
      console.error('Error updating opportunity:', error);
      return { success: false, error: 'Failed to update opportunity' };
    }
  }, [user]);

  const deleteOpportunity = useCallback(async (id: string): Promise<OpportunityOperationResult> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting opportunity:', error);
        return { success: false, error: error.message };
      }
      
      setOpportunities(prev => prev.filter(opp => opp.id !== id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting opportunity:', error);
      return { success: false, error: 'Failed to delete opportunity' };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadOpportunities();
    }
  }, [loadOpportunities]);

  return {
    opportunities,
    loading,
    lastError,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    loadOpportunities
  };
};
