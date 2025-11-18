
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';

interface Employee {
  username: string;
  email: string;
  full_name: string;
  job_title: string;
  role: 'owner_manager' | 'manager' | 'employee';
  phone_number?: string;
}

// Initial employee data from StaffList.png
const INITIAL_EMPLOYEES: Employee[] = [
  {
    username: '1',
    email: 'owner@mcloones.com',
    full_name: 'Owner/Manager',
    job_title: 'Owner/Manager',
    role: 'owner_manager',
    phone_number: '555-0001'
  },
  {
    username: '2',
    email: 'manager1@mcloones.com',
    full_name: 'Manager One',
    job_title: 'Manager',
    role: 'manager',
    phone_number: '555-0002'
  },
  {
    username: '3',
    email: 'manager2@mcloones.com',
    full_name: 'Manager Two',
    job_title: 'Manager',
    role: 'manager',
    phone_number: '555-0003'
  },
  {
    username: '4',
    email: 'employee1@mcloones.com',
    full_name: 'Employee One',
    job_title: 'Server',
    role: 'employee',
    phone_number: '555-0004'
  },
  {
    username: '5',
    email: 'employee2@mcloones.com',
    full_name: 'Employee Two',
    job_title: 'Server',
    role: 'employee',
    phone_number: '555-0005'
  },
  {
    username: '6',
    email: 'employee3@mcloones.com',
    full_name: 'Employee Three',
    job_title: 'Bartender',
    role: 'employee',
    phone_number: '555-0006'
  },
  {
    username: '7',
    email: 'employee4@mcloones.com',
    full_name: 'Employee Four',
    job_title: 'Host',
    role: 'employee',
    phone_number: '555-0007'
  },
  {
    username: '8',
    email: 'employee5@mcloones.com',
    full_name: 'Employee Five',
    job_title: 'Cook',
    role: 'employee',
    phone_number: '555-0008'
  }
];

export default function EmployeeDataSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string[]>([]);

  const seedEmployees = async () => {
    setIsSeeding(true);
    setSeedStatus([]);
    const status: string[] = [];

    try {
      status.push('Starting employee seeding process...');
      setSeedStatus([...status]);

      for (const employee of INITIAL_EMPLOYEES) {
        try {
          status.push(`\nCreating ${employee.full_name} (Username: ${employee.username})...`);
          setSeedStatus([...status]);

          const { data, error } = await supabase.functions.invoke('create-employee', {
            body: {
              username: employee.username,
              email: employee.email,
              full_name: employee.full_name,
              job_title: employee.job_title,
              role: employee.role,
              phone_number: employee.phone_number,
              password: 'mcloonesapp1'
            }
          });

          if (error) {
            status.push(`❌ Failed: ${error.message}`);
            console.error(`Failed to create ${employee.full_name}:`, error);
          } else if (data?.error) {
            status.push(`❌ Failed: ${data.error}`);
            console.error(`Failed to create ${employee.full_name}:`, data.error);
          } else if (data?.success) {
            status.push(`✅ Success! User ID: ${data.user_id}`);
          } else {
            status.push(`⚠️ Unknown response`);
            console.log('Response:', data);
          }
          setSeedStatus([...status]);
        } catch (err: any) {
          status.push(`❌ Error: ${err?.message || err}`);
          console.error(`Error creating ${employee.full_name}:`, err);
          setSeedStatus([...status]);
        }
      }

      status.push('\n🎉 Seeding complete!');
      status.push('\nAll accounts use password: mcloonesapp1');
      status.push('Users should change their password on first login.');
      setSeedStatus([...status]);

      Alert.alert(
        'Seeding Complete',
        'All employee accounts have been created. They can now login with their username and the password "mcloonesapp1".',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Seeding error:', error);
      status.push(`\n❌ Fatal error: ${error?.message || error}`);
      setSeedStatus([...status]);
      Alert.alert('Error', `Failed to seed employee data: ${error?.message || error}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Data Seeder</Text>
      <Text style={styles.description}>
        This will create {INITIAL_EMPLOYEES.length} initial employee accounts with the generic password "mcloonesapp1".
      </Text>
      
      <TouchableOpacity
        style={[styles.button, isSeeding && styles.buttonDisabled]}
        onPress={seedEmployees}
        disabled={isSeeding}
      >
        <Text style={styles.buttonText}>
          {isSeeding ? 'Seeding...' : 'Seed Employee Data'}
        </Text>
      </TouchableOpacity>

      {seedStatus.length > 0 && (
        <ScrollView style={styles.statusContainer}>
          {seedStatus.map((status, index) => (
            <Text key={index} style={styles.statusText}>
              {status}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    maxHeight: 400,
  },
  statusText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});
