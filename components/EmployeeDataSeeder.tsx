
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput } from 'react-native';
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
  const [isResetting, setIsResetting] = useState(false);
  const [testUsername, setTestUsername] = useState('1');
  const [testPassword, setTestPassword] = useState('mcloonesapp1');
  const [existingEmployees, setExistingEmployees] = useState<number>(0);

  // Check if employees already exist
  React.useEffect(() => {
    checkExistingEmployees();
  }, []);

  const checkExistingEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      if (!error && data !== null) {
        setExistingEmployees(data.length || 0);
      }
    } catch (error) {
      console.error('Error checking existing employees:', error);
    }
  };

  const seedEmployees = async () => {
    setIsSeeding(true);
    setSeedStatus([]);
    const status: string[] = [];

    try {
      status.push('Starting employee seeding process...');
      status.push('Note: If employees already exist, they will be skipped.');
      setSeedStatus([...status]);

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const employee of INITIAL_EMPLOYEES) {
        try {
          status.push(`\nCreating ${employee.full_name} (Username: ${employee.username})...`);
          setSeedStatus([...status]);

          // Check if employee already exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', employee.username)
            .maybeSingle();

          if (existingProfile) {
            status.push(`⏭️ Skipped: Employee already exists`);
            skipCount++;
            setSeedStatus([...status]);
            continue;
          }

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
            errorCount++;
          } else if (data?.error) {
            // Check if it's a duplicate user error
            if (data.error.includes('already exists') || data.error.includes('duplicate')) {
              status.push(`⏭️ Skipped: Employee already exists`);
              skipCount++;
            } else {
              status.push(`❌ Failed: ${data.error}`);
              console.error(`Failed to create ${employee.full_name}:`, data.error);
              errorCount++;
            }
          } else if (data?.success) {
            status.push(`✅ Success! User ID: ${data.user_id}`);
            successCount++;
          } else {
            status.push(`⚠️ Unknown response`);
            console.log('Response:', data);
            errorCount++;
          }
          setSeedStatus([...status]);
        } catch (err: any) {
          status.push(`❌ Error: ${err?.message || err}`);
          console.error(`Error creating ${employee.full_name}:`, err);
          errorCount++;
          setSeedStatus([...status]);
        }
      }

      status.push('\n=== Seeding Summary ===');
      status.push(`✅ Created: ${successCount}`);
      status.push(`⏭️ Skipped: ${skipCount}`);
      status.push(`❌ Errors: ${errorCount}`);
      status.push('\nAll accounts use password: mcloonesapp1');
      status.push('Users should change their password on first login.');
      setSeedStatus([...status]);

      await checkExistingEmployees();

      Alert.alert(
        'Seeding Complete',
        `Created: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}\n\nEmployees can now login with their username and the password "mcloonesapp1".`,
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

  const testLogin = async () => {
    setIsResetting(true);
    const status: string[] = [...seedStatus];
    
    try {
      status.push('\n=== Testing Login ===');
      status.push(`Username: ${testUsername}`);
      status.push(`Password: ${testPassword}`);
      setSeedStatus([...status]);

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', testUsername)
        .maybeSingle();

      if (profileError) {
        status.push(`❌ Profile lookup error: ${profileError.message}`);
        setSeedStatus([...status]);
        setIsResetting(false);
        return;
      }

      if (!profileData) {
        status.push(`❌ No profile found for username: ${testUsername}`);
        setSeedStatus([...status]);
        setIsResetting(false);
        return;
      }

      status.push(`✅ Profile found: ${profileData.email}`);
      status.push(`   Role: ${profileData.role}`);
      status.push(`   Active: ${profileData.is_active}`);
      setSeedStatus([...status]);

      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: testPassword,
      });

      if (signInError) {
        status.push(`❌ Sign in error: ${signInError.message}`);
        status.push(`   Error code: ${signInError.status}`);
        setSeedStatus([...status]);
        
        // Sign out if partially logged in
        await supabase.auth.signOut();
        
        Alert.alert('Login Test Failed', signInError.message);
      } else {
        status.push(`✅ Sign in successful!`);
        status.push(`   User ID: ${signInData.user?.id}`);
        status.push(`   Email: ${signInData.user?.email}`);
        setSeedStatus([...status]);
        
        // Sign out after test
        await supabase.auth.signOut();
        status.push(`✅ Signed out successfully`);
        setSeedStatus([...status]);
        
        Alert.alert('Success', 'Login test passed! You can now use these credentials to log in from the main screen.');
      }
    } catch (error: any) {
      status.push(`❌ Test error: ${error?.message || error}`);
      setSeedStatus([...status]);
      Alert.alert('Error', `Test failed: ${error?.message || error}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Data Seeder</Text>
      <Text style={styles.description}>
        This will create {INITIAL_EMPLOYEES.length} initial employee accounts with the generic password "mcloonesapp1".
      </Text>
      
      {existingEmployees > 0 && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ {existingEmployees} employee(s) already exist in the database.
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.button, isSeeding && styles.buttonDisabled]}
        onPress={seedEmployees}
        disabled={isSeeding}
      >
        <Text style={styles.buttonText}>
          {isSeeding ? 'Seeding...' : existingEmployees > 0 ? 'Re-run Seeder' : 'Seed Employee Data'}
        </Text>
      </TouchableOpacity>

      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>Test Login</Text>
        <Text style={styles.sectionDescription}>
          Test if login works with the seeded credentials
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Username:</Text>
          <TextInput
            style={styles.input}
            value={testUsername}
            onChangeText={setTestUsername}
            placeholder="Enter username"
            editable={!isResetting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password:</Text>
          <TextInput
            style={styles.input}
            value={testPassword}
            onChangeText={setTestPassword}
            placeholder="Enter password"
            secureTextEntry
            editable={!isResetting}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.testButton, isResetting && styles.buttonDisabled]}
          onPress={testLogin}
          disabled={isResetting}
        >
          <Text style={styles.buttonText}>
            {isResetting ? 'Testing...' : 'Test Login'}
          </Text>
        </TouchableOpacity>
      </View>

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
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
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
  testSection: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: colors.text,
  },
  testButton: {
    backgroundColor: colors.accent,
    marginTop: 5,
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
