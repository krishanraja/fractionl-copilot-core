import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TalentContact = Database['public']['Tables']['talent_contacts']['Row'];
type TalentContactInsert = Database['public']['Tables']['talent_contacts']['Insert'];
type TalentContactUpdate = Database['public']['Tables']['talent_contacts']['Update'];
type Skill = Database['public']['Tables']['skills']['Row'];
type TalentSkill = Database['public']['Tables']['talent_skills']['Row'];

export interface TalentContactWithSkills extends TalentContact {
  skills: Skill[];
}

export const useTalentContacts = (skillFilter?: string | null) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<TalentContactWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contacts with their skills
  const fetchContacts = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Base query
      let query = supabase
        .from('talent_contacts')
        .select(`
          *,
          talent_skills (
            skill:skills (*)
          )
        `)
        .eq('user_id', user.id)
        .order('name');

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform the data to include skills array
      const contactsWithSkills: TalentContactWithSkills[] = (data || []).map((contact: any) => ({
        ...contact,
        skills: contact.talent_skills?.map((ts: any) => ts.skill).filter(Boolean) || []
      }));

      // Filter by skill if provided
      let filteredContacts = contactsWithSkills;
      if (skillFilter) {
        filteredContacts = contactsWithSkills.filter(contact =>
          contact.skills.some(skill => skill.id === skillFilter)
        );
      }

      setContacts(filteredContacts);
    } catch (err: any) {
      console.error('Error fetching talent contacts:', err);
      setError(err.message);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [user?.id, skillFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Create a new contact
  const createContact = useCallback(async (
    contact: TalentContactInsert,
    skillIds: string[]
  ) => {
    if (!user?.id) return;

    try {
      // Insert the contact
      const { data: newContact, error: insertError } = await supabase
        .from('talent_contacts')
        .insert({ ...contact, user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert skills if provided
      if (skillIds.length > 0) {
        const talentSkills = skillIds.map(skillId => ({
          talent_contact_id: newContact.id,
          skill_id: skillId
        }));

        const { error: skillsError } = await supabase
          .from('talent_skills')
          .insert(talentSkills);

        if (skillsError) throw skillsError;
      }

      toast.success('Contact added successfully');
      await fetchContacts();
      return newContact;
    } catch (err: any) {
      console.error('Error creating contact:', err);
      toast.error('Failed to create contact');
      throw err;
    }
  }, [user?.id, fetchContacts]);

  // Update a contact
  const updateContact = useCallback(async (
    id: string,
    updates: TalentContactUpdate,
    skillIds?: string[]
  ) => {
    if (!user?.id) return;

    try {
      // Update the contact
      const { data: updatedContact, error: updateError } = await supabase
        .from('talent_contacts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update skills if provided
      if (skillIds !== undefined) {
        // Remove existing skills
        await supabase
          .from('talent_skills')
          .delete()
          .eq('talent_contact_id', id);

        // Add new skills
        if (skillIds.length > 0) {
          const talentSkills = skillIds.map(skillId => ({
            talent_contact_id: id,
            skill_id: skillId
          }));

          const { error: skillsError } = await supabase
            .from('talent_skills')
            .insert(talentSkills);

          if (skillsError) throw skillsError;
        }
      }

      toast.success('Contact updated successfully');
      await fetchContacts();
      return updatedContact;
    } catch (err: any) {
      console.error('Error updating contact:', err);
      toast.error('Failed to update contact');
      throw err;
    }
  }, [user?.id, fetchContacts]);

  // Delete a contact
  const deleteContact = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const { error: deleteError } = await supabase
        .from('talent_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      toast.success('Contact deleted successfully');
      await fetchContacts();
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      toast.error('Failed to delete contact');
      throw err;
    }
  }, [user?.id, fetchContacts]);

  // Get a single contact by ID
  const getContact = useCallback(async (id: string): Promise<TalentContactWithSkills | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('talent_contacts')
        .select(`
          *,
          talent_skills (
            skill:skills (*)
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        ...data,
        skills: data.talent_skills?.map((ts: any) => ts.skill).filter(Boolean) || []
      } as TalentContactWithSkills;
    } catch (err: any) {
      console.error('Error fetching contact:', err);
      return null;
    }
  }, [user?.id]);

  return {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    getContact,
    refetch: fetchContacts
  };
};
