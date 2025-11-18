
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface RewardTransaction {
  id: string;
  employee_id: string;
  amount: number;
  reason: string;
  awarded_by_id: string;
  awarded_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWithBucks {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  job_title: string;
  role: string;
  profile_picture_url: string | null;
  mcloones_bucks: number;
}

export function useRewards() {
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [topEmployees, setTopEmployees] = useState<EmployeeWithBucks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rewards_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('mcloones_bucks', { ascending: false })
        .limit(5);

      if (error) throw error;

      setTopEmployees(data || []);
    } catch (err) {
      console.error('Error fetching top employees:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchTopEmployees();

    // Subscribe to real-time updates
    const transactionsSubscription = supabase
      .channel('rewards_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rewards_transactions',
        },
        () => {
          fetchTransactions();
          fetchTopEmployees();
        }
      )
      .subscribe();

    const profilesSubscription = supabase
      .channel('profiles_bucks_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchTopEmployees();
        }
      )
      .subscribe();

    return () => {
      transactionsSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
    };
  }, []);

  const awardBucks = async (
    employeeId: string,
    amount: number,
    reason: string,
    awardedById: string,
    awardedByName: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase
        .from('rewards_transactions')
        .insert({
          employee_id: employeeId,
          amount: amount,
          reason: reason,
          awarded_by_id: awardedById,
          awarded_by_name: awardedByName,
        });

      if (error) {
        console.error('Award bucks error:', error);
        return { success: false, message: error.message };
      }

      await fetchTransactions();
      await fetchTopEmployees();
      return { success: true, message: 'McLoone\'s Bucks awarded successfully!' };
    } catch (err) {
      console.error('Award bucks exception:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to award bucks',
      };
    }
  };

  const getEmployeeTransactions = (employeeId: string) => {
    return transactions.filter(t => t.employee_id === employeeId);
  };

  const getEmployeeTotalBucks = async (employeeId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('mcloones_bucks')
        .eq('id', employeeId)
        .single();

      if (error) throw error;

      return data?.mcloones_bucks || 0;
    } catch (err) {
      console.error('Error fetching employee bucks:', err);
      return 0;
    }
  };

  return {
    transactions,
    topEmployees,
    loading,
    error,
    fetchTransactions,
    fetchTopEmployees,
    awardBucks,
    getEmployeeTransactions,
    getEmployeeTotalBucks,
  };
}
