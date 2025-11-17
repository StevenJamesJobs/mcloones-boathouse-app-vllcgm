
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Alert } from 'react-native';

export interface Employee {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  job_title: string;
  role: 'owner_manager' | 'manager' | 'employee';
  profile_picture_url: string | null;
  tagline: string | null;
  must_change_password: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  employee: Employee | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateEmployee: (updates: Partial<Employee>) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
  refreshEmployee: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a stored session
    checkStoredSession();
  }, []);

  const checkStoredSession = async () => {
    try {
      const storedEmployeeId = await getStoredEmployeeId();
      if (storedEmployeeId) {
        await refreshEmployee(storedEmployeeId);
      }
    } catch (error) {
      console.error('Error checking stored session:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStoredEmployeeId = async (): Promise<string | null> => {
    // In a real app, use AsyncStorage or SecureStore
    // For now, we'll use a simple in-memory storage
    return null;
  };

  const storeEmployeeId = async (employeeId: string) => {
    // In a real app, store in AsyncStorage or SecureStore
    console.log('Storing employee ID:', employeeId);
  };

  const clearStoredEmployeeId = async () => {
    // In a real app, clear from AsyncStorage or SecureStore
    console.log('Clearing stored employee ID');
  };

  const refreshEmployee = async (employeeId?: string) => {
    try {
      const id = employeeId || employee?.id;
      if (!id) return;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (data) {
        setEmployee(data as Employee);
      }
    } catch (error) {
      console.error('Error refreshing employee:', error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Call the login edge function
      const { data, error } = await supabase.functions.invoke('employee-login', {
        body: { username, password }
      });

      if (error) {
        console.error('Login error:', error);
        Alert.alert('Login Failed', error.message || 'Invalid username or password');
        return false;
      }

      if (data?.employee) {
        setEmployee(data.employee as Employee);
        await storeEmployeeId(data.employee.id);
        
        // Check if password change is required
        if (data.employee.must_change_password) {
          Alert.alert(
            'Password Change Required',
            'You must change your password before continuing.',
            [{ text: 'OK' }]
          );
        }
        
        return true;
      }

      Alert.alert('Login Failed', 'Invalid username or password');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An error occurred during login');
      return false;
    }
  };

  const logout = async () => {
    setEmployee(null);
    await clearStoredEmployeeId();
  };

  const updateEmployee = async (updates: Partial<Employee>): Promise<boolean> => {
    if (!employee) return false;

    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', employee.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEmployee(data as Employee);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating employee:', error);
      Alert.alert('Update Failed', 'Could not update profile');
      return false;
    }
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    if (!employee) return false;

    try {
      const { data, error } = await supabase.functions.invoke('change-password', {
        body: { 
          employeeId: employee.id,
          newPassword 
        }
      });

      if (error) throw error;

      if (data?.success) {
        // Update must_change_password flag
        await updateEmployee({ must_change_password: false });
        Alert.alert('Success', 'Password changed successfully');
        return true;
      }

      Alert.alert('Error', 'Could not change password');
      return false;
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Could not change password');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      employee, 
      isAuthenticated: !!employee, 
      login, 
      logout,
      updateEmployee,
      changePassword,
      refreshEmployee: () => refreshEmployee()
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
