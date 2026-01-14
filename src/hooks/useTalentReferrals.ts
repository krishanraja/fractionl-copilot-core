import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TalentReferral = Database['public']['Tables']['talent_referrals']['Row'];
type TalentReferralInsert = Database['public']['Tables']['talent_referrals']['Insert'];
type TalentReferralUpdate = Database['public']['Tables']['talent_referrals']['Update'];
type TalentContact = Database['public']['Tables']['talent_contacts']['Row'];

export interface TalentReferralWithContact extends TalentReferral {
  talent_contact: TalentContact | null;
}

export const useTalentReferrals = (talentContactId?: string) => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<TalentReferralWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch referrals
  const fetchReferrals = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('talent_referrals')
        .select(`
          *,
          talent_contact:talent_contacts (*)
        `)
        .eq('user_id', user.id)
        .order('referred_date', { ascending: false });

      // Filter by talent contact if provided
      if (talentContactId) {
        query = query.eq('talent_contact_id', talentContactId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setReferrals(data as TalentReferralWithContact[] || []);
    } catch (err: any) {
      console.error('Error fetching referrals:', err);
      setError(err.message);
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  }, [user?.id, talentContactId]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // Create a new referral
  const createReferral = useCallback(async (referral: TalentReferralInsert) => {
    if (!user?.id) return;

    try {
      const { data: newReferral, error: insertError } = await supabase
        .from('talent_referrals')
        .insert({ ...referral, user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Referral logged successfully');
      await fetchReferrals();
      return newReferral;
    } catch (err: any) {
      console.error('Error creating referral:', err);
      toast.error('Failed to log referral');
      throw err;
    }
  }, [user?.id, fetchReferrals]);

  // Update a referral
  const updateReferral = useCallback(async (
    id: string,
    updates: TalentReferralUpdate
  ) => {
    if (!user?.id) return;

    try {
      const { data: updatedReferral, error: updateError } = await supabase
        .from('talent_referrals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Referral updated successfully');
      await fetchReferrals();
      return updatedReferral;
    } catch (err: any) {
      console.error('Error updating referral:', err);
      toast.error('Failed to update referral');
      throw err;
    }
  }, [user?.id, fetchReferrals]);

  // Delete a referral
  const deleteReferral = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const { error: deleteError } = await supabase
        .from('talent_referrals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      toast.success('Referral deleted successfully');
      await fetchReferrals();
    } catch (err: any) {
      console.error('Error deleting referral:', err);
      toast.error('Failed to delete referral');
      throw err;
    }
  }, [user?.id, fetchReferrals]);

  // Mark referral as delivered/completed
  const markAsDelivered = useCallback(async (
    id: string,
    delivered: boolean,
    outcomeNotes?: string
  ) => {
    return updateReferral(id, {
      outcome_delivered: delivered,
      outcome_notes: outcomeNotes
    });
  }, [updateReferral]);

  // Get referral stats for a contact
  const getReferralStats = useCallback((contactId: string) => {
    const contactReferrals = referrals.filter(r => r.talent_contact_id === contactId);
    const totalReferrals = contactReferrals.length;
    const successfulReferrals = contactReferrals.filter(r => r.outcome_delivered === true).length;
    const totalValue = contactReferrals.reduce((sum, r) => sum + (r.estimated_value || 0), 0);
    const totalCommission = contactReferrals.reduce((sum, r) => sum + (r.commission_fee || 0), 0);
    const pendingFollowUps = contactReferrals.filter(r =>
      r.follow_up_date && new Date(r.follow_up_date) >= new Date() && r.outcome_delivered === null
    ).length;

    return {
      totalReferrals,
      successfulReferrals,
      successRate: totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0,
      totalValue,
      totalCommission,
      pendingFollowUps
    };
  }, [referrals]);

  // Get upcoming follow-ups
  const getUpcomingFollowUps = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return referrals
      .filter(r =>
        r.follow_up_date &&
        new Date(r.follow_up_date) >= today &&
        r.outcome_delivered === null
      )
      .sort((a, b) =>
        new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime()
      );
  }, [referrals]);

  return {
    referrals,
    loading,
    error,
    createReferral,
    updateReferral,
    deleteReferral,
    markAsDelivered,
    getReferralStats,
    getUpcomingFollowUps,
    refetch: fetchReferrals
  };
};
