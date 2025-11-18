
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/app/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type ProfileInsert = TablesInsert<'profiles'>;
type ProfileUpdate = TablesUpdate<'profiles'>;

export function useEmployees() {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;

      setEmployees(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const createEmployee = async (
    employeeData: {
      username: string;
      full_name: string;
      email: string;
      phone_number?: string;
      job_title: string;
      role: 'owner_manager' | 'manager' | 'employee';
    }
  ): Promise<{ success: boolean; message: string; userId?: string }> => {
    try {
      console.log('Creating employee with data:', employeeData);

      // Create auth user with auto-confirmed email using admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: employeeData.email,
        password: 'mcloonesapp1',
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          username: employeeData.username,
          full_name: employeeData.full_name,
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        return { success: false, message: authError.message };
      }

      if (!authData.user) {
        return { success: false, message: 'Failed to create user' };
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: employeeData.username,
          full_name: employeeData.full_name,
          email: employeeData.email,
          phone_number: employeeData.phone_number || null,
          job_title: employeeData.job_title,
          role: employeeData.role,
          must_change_password: true,
          is_active: true,
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        // Try to delete the auth user if profile creation fails
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Failed to cleanup auth user:', deleteError);
        }
        return { success: false, message: profileError.message };
      }

      console.log('Profile created successfully');
      await fetchEmployees();
      return { 
        success: true, 
        message: 'Employee created successfully. They can now log in immediately with their credentials.',
        userId: authData.user.id 
      };
    } catch (err) {
      console.error('Create employee exception:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to create employee' 
      };
    }
  };

  const updateEmployee = async (
    id: string,
    updates: ProfileUpdate
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Update error:', error);
        return { success: false, message: error.message };
      }

      await fetchEmployees();
      return { success: true, message: 'Employee updated successfully' };
    } catch (err) {
      console.error('Update employee exception:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to update employee' 
      };
    }
  };

  const deleteEmployee = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, message: error.message };
      }

      await fetchEmployees();
      return { success: true, message: 'Employee deactivated successfully' };
    } catch (err) {
      console.error('Delete employee exception:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to delete employee' 
      };
    }
  };

  const resetPassword = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Get employee email
      const employee = employees.find(e => e.id === id);
      if (!employee) {
        return { success: false, message: 'Employee not found' };
      }

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(employee.email, {
        redirectTo: 'https://natively.dev/email-confirmed'
      });

      if (error) {
        console.error('Reset password error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Password reset email sent' };
    } catch (err) {
      console.error('Reset password exception:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to reset password' 
      };
    }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    resetPassword,
  };
}
