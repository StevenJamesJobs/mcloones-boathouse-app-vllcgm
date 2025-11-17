
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Image } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth, Employee } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import * as ImagePicker from 'expo-image-picker';

export default function EmployeesScreen() {
  const { employee: currentEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<'employee' | 'manager' | 'owner_manager'>('employee');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setEmployees(data as Employee[]);
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Could not load employees');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setUsername('');
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setAddress('');
    setJobTitle('');
    setRole('employee');
    setProfilePictureUrl('');
    setModalVisible(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setUsername(emp.username);
    setFullName(emp.full_name);
    setEmail(emp.email);
    setPhoneNumber(emp.phone_number || '');
    setAddress(emp.address || '');
    setJobTitle(emp.job_title);
    setRole(emp.role);
    setProfilePictureUrl(emp.profile_picture_url || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!username || !fullName || !email || !jobTitle) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingEmployee) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update({
            username,
            full_name: fullName,
            email,
            phone_number: phoneNumber,
            address,
            job_title: jobTitle,
            role,
            profile_picture_url: profilePictureUrl,
          })
          .eq('id', editingEmployee.id);

        if (error) throw error;
        Alert.alert('Success', 'Employee updated successfully');
      } else {
        // Create new employee with default password
        const { error } = await supabase.functions.invoke('create-employee', {
          body: {
            username,
            full_name: fullName,
            email,
            phone_number: phoneNumber,
            address,
            job_title: jobTitle,
            role,
            profile_picture_url: profilePictureUrl,
          }
        });

        if (error) throw error;
        Alert.alert(
          'Success', 
          `Employee created successfully.\n\nUsername: ${username}\nDefault Password: mcloones1\n\nThe employee will be prompted to change their password on first login.`
        );
      }

      setModalVisible(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      Alert.alert('Error', 'Could not save employee');
    }
  };

  const handleDelete = (emp: Employee) => {
    if (emp.role === 'owner_manager') {
      Alert.alert('Error', 'Cannot delete Owner/Manager account');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${emp.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('employees')
                .delete()
                .eq('id', emp.id);

              if (error) throw error;
              Alert.alert('Success', 'Employee deleted successfully');
              fetchEmployees();
            } catch (error) {
              console.error('Error deleting employee:', error);
              Alert.alert('Error', 'Could not delete employee');
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = (emp: Employee) => {
    Alert.alert(
      'Reset Password',
      `Reset password for ${emp.full_name} to the default password "mcloones1"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              const { error } = await supabase.functions.invoke('reset-employee-password', {
                body: { employeeId: emp.id }
              });

              if (error) throw error;
              Alert.alert('Success', 'Password reset successfully. The employee will be prompted to change it on next login.');
            } catch (error) {
              console.error('Error resetting password:', error);
              Alert.alert('Error', 'Could not reset password');
            }
          },
        },
      ]
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employees')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('employees')
        .getPublicUrl(filePath);

      setProfilePictureUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Could not upload image');
    } finally {
      setUploading(false);
    }
  };

  const getRoleBadgeColor = (empRole: string) => {
    switch (empRole) {
      case 'owner_manager':
        return colors.error;
      case 'manager':
        return colors.managerAccent;
      case 'employee':
        return colors.employeeAccent;
      default:
        return colors.textSecondary;
    }
  };

  const getRoleLabel = (empRole: string) => {
    switch (empRole) {
      case 'owner_manager':
        return 'Owner/Manager';
      case 'manager':
        return 'Manager';
      case 'employee':
        return 'Employee';
      default:
        return empRole;
    }
  };

  const isOwnerManager = currentEmployee?.role === 'owner_manager';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Employees',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <Pressable onPress={openAddModal} style={styles.addButton}>
              <IconSymbol 
                ios_icon_name="plus.circle.fill" 
                android_material_icon_name="add_circle" 
                color="#FFFFFF" 
                size={28} 
              />
            </Pressable>
          ),
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.managerAccent} />
            <Text style={styles.loadingText}>Loading employees...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {employees.map((emp) => (
              <View key={emp.id} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <View style={styles.employeeInfo}>
                    {emp.profile_picture_url ? (
                      <Image source={{ uri: emp.profile_picture_url }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <IconSymbol 
                          ios_icon_name="person.fill" 
                          android_material_icon_name="person" 
                          color={colors.textSecondary} 
                          size={24} 
                        />
                      </View>
                    )}
                    <View style={styles.employeeDetails}>
                      <Text style={styles.employeeName}>{emp.full_name}</Text>
                      <Text style={styles.employeeJob}>{emp.job_title}</Text>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(emp.role) }]}>
                        <Text style={styles.roleText}>{getRoleLabel(emp.role)}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.employeeActions}>
                    <Pressable onPress={() => openEditModal(emp)} style={styles.actionButton}>
                      <IconSymbol 
                        ios_icon_name="pencil.circle.fill" 
                        android_material_icon_name="edit" 
                        color={colors.managerAccent} 
                        size={24} 
                      />
                    </Pressable>
                    {emp.role !== 'owner_manager' && (
                      <Pressable onPress={() => handleDelete(emp)} style={styles.actionButton}>
                        <IconSymbol 
                          ios_icon_name="trash.circle.fill" 
                          android_material_icon_name="delete" 
                          color={colors.error} 
                          size={24} 
                        />
                      </Pressable>
                    )}
                  </View>
                </View>

                <View style={styles.employeeContactInfo}>
                  <View style={styles.contactRow}>
                    <IconSymbol 
                      ios_icon_name="person.text.rectangle" 
                      android_material_icon_name="badge" 
                      color={colors.textSecondary} 
                      size={16} 
                    />
                    <Text style={styles.contactText}>Username: {emp.username}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <IconSymbol 
                      ios_icon_name="envelope.fill" 
                      android_material_icon_name="email" 
                      color={colors.textSecondary} 
                      size={16} 
                    />
                    <Text style={styles.contactText}>{emp.email}</Text>
                  </View>
                  {emp.phone_number && (
                    <View style={styles.contactRow}>
                      <IconSymbol 
                        ios_icon_name="phone.fill" 
                        android_material_icon_name="phone" 
                        color={colors.textSecondary} 
                        size={16} 
                      />
                      <Text style={styles.contactText}>{emp.phone_number}</Text>
                    </View>
                  )}
                </View>

                <Pressable 
                  style={styles.resetPasswordButton} 
                  onPress={() => handleResetPassword(emp)}
                >
                  <IconSymbol 
                    ios_icon_name="lock.rotation" 
                    android_material_icon_name="lock_reset" 
                    color={colors.managerAccent} 
                    size={16} 
                  />
                  <Text style={styles.resetPasswordText}>Reset Password</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Add/Edit Employee Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <IconSymbol 
                    ios_icon_name="xmark.circle.fill" 
                    android_material_icon_name="cancel" 
                    color={colors.textSecondary} 
                    size={28} 
                  />
                </Pressable>
              </View>

              {/* Profile Picture */}
              <View style={styles.profilePictureSection}>
                <View style={styles.profilePictureContainer}>
                  {profilePictureUrl ? (
                    <Image source={{ uri: profilePictureUrl }} style={styles.profilePicture} />
                  ) : (
                    <View style={styles.profilePicturePlaceholder}>
                      <IconSymbol 
                        ios_icon_name="person.fill" 
                        android_material_icon_name="person" 
                        color={colors.textSecondary} 
                        size={40} 
                      />
                    </View>
                  )}
                  {uploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Pressable style={styles.changePhotoButton} onPress={handlePickImage}>
                  <IconSymbol 
                    ios_icon_name="camera.fill" 
                    android_material_icon_name="photo_camera" 
                    color={colors.managerAccent} 
                    size={16} 
                  />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username *</Text>
                <TextInput
                  style={[styles.input, editingEmployee && styles.inputDisabled]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  autoCapitalize="none"
                  editable={!editingEmployee}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="(123) 456-7890"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="123 Main St, City, State ZIP"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Title *</Text>
                <TextInput
                  style={styles.input}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  placeholder="e.g., Server, Bartender, Manager"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role *</Text>
                <View style={styles.roleSelector}>
                  <Pressable
                    style={[
                      styles.roleOption,
                      role === 'employee' && styles.roleOptionSelected,
                    ]}
                    onPress={() => setRole('employee')}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      role === 'employee' && styles.roleOptionTextSelected,
                    ]}>
                      Employee
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.roleOption,
                      role === 'manager' && styles.roleOptionSelected,
                    ]}
                    onPress={() => setRole('manager')}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      role === 'manager' && styles.roleOptionTextSelected,
                    ]}>
                      Manager
                    </Text>
                  </Pressable>
                  {isOwnerManager && (
                    <Pressable
                      style={[
                        styles.roleOption,
                        role === 'owner_manager' && styles.roleOptionSelected,
                      ]}
                      onPress={() => setRole('owner_manager')}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        role === 'owner_manager' && styles.roleOptionTextSelected,
                      ]}>
                        Owner/Manager
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {!editingEmployee && (
                <Text style={styles.helpText}>
                  Default password will be set to: mcloones1{'\n'}
                  Employee will be prompted to change it on first login.
                </Text>
              )}

              <View style={styles.buttonRow}>
                <Pressable 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>
                    {editingEmployee ? 'Update' : 'Create'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  addButton: {
    padding: 8,
    marginRight: 8,
  },
  employeeCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  employeeInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  employeeJob: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  employeeContactInfo: {
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
  },
  resetPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.managerAccent,
  },
  resetPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
  },
  profilePicturePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.employeeCard,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputDisabled: {
    backgroundColor: colors.border,
    color: colors.textSecondary,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: colors.managerAccent,
    borderColor: colors.managerAccent,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  roleOptionTextSelected: {
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.managerAccent,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
