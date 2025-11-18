
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal, Image } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useEmployees } from '@/hooks/useEmployees';
import { Tables } from '@/app/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type CategoryType = 'ALL' | 'A-E' | 'F-I' | 'J-R' | 'S-Z' | 'Deactivated';

export default function EmployeesManagementScreen() {
  const { employees, loading, createEmployee, updateEmployee, deleteEmployee, resetPassword } = useEmployees();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    job_title: '',
    role: 'employee' as 'manager' | 'employee',
  });

  const resetForm = () => {
    setFormData({
      username: '',
      full_name: '',
      email: '',
      phone_number: '',
      job_title: '',
      role: 'employee',
    });
    setEditingEmployee(null);
  };

  const handleAddEmployee = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleEditEmployee = (employee: Profile) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.username,
      full_name: employee.full_name,
      email: employee.email,
      phone_number: employee.phone_number || '',
      job_title: employee.job_title,
      role: employee.role === 'owner_manager' ? 'manager' : employee.role,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.username || !formData.full_name || !formData.email || !formData.job_title) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (editingEmployee) {
      // Update existing employee
      const result = await updateEmployee(editingEmployee.id, {
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number || null,
        job_title: formData.job_title,
        role: formData.role,
      });

      if (result.success) {
        Alert.alert('Success', result.message);
        setModalVisible(false);
        resetForm();
      } else {
        Alert.alert('Error', result.message);
      }
    } else {
      // Create new employee
      const result = await createEmployee(formData);

      if (result.success) {
        Alert.alert(
          'Success', 
          `Employee created successfully!\n\nUsername: ${formData.username}\nPassword: mcloonesapp1\n\nThe employee will be prompted to change their password on first login.`
        );
        setModalVisible(false);
        resetForm();
      } else {
        Alert.alert('Error', result.message);
      }
    }
  };

  const handleDelete = (employee: Profile) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to deactivate ${employee.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteEmployee(employee.id);
            if (result.success) {
              Alert.alert('Success', result.message);
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = (employee: Profile) => {
    Alert.alert(
      'Reset Password',
      `Send password reset email to ${employee.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            const result = await resetPassword(employee.id);
            if (result.success) {
              Alert.alert('Success', result.message);
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'owner_manager':
        return 'Owner/Manager';
      case 'manager':
        return 'Manager';
      case 'employee':
        return 'Employee';
      default:
        return role;
    }
  };

  // Filter and categorize employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.full_name.toLowerCase().includes(query) ||
        emp.username.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.job_title.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory === 'Deactivated') {
      filtered = filtered.filter(emp => !emp.is_active);
    } else if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(emp => {
        if (!emp.is_active) return false;
        const firstLetter = emp.full_name.charAt(0).toUpperCase();
        switch (selectedCategory) {
          case 'A-E':
            return firstLetter >= 'A' && firstLetter <= 'E';
          case 'F-I':
            return firstLetter >= 'F' && firstLetter <= 'I';
          case 'J-R':
            return firstLetter >= 'J' && firstLetter <= 'R';
          case 'S-Z':
            return firstLetter >= 'S' && firstLetter <= 'Z';
          default:
            return true;
        }
      });
    } else {
      // For ALL, exclude deactivated
      filtered = filtered.filter(emp => emp.is_active);
    }

    // Sort alphabetically by first name
    return filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [employees, searchQuery, selectedCategory]);

  const categories: CategoryType[] = ['ALL', 'A-E', 'F-I', 'J-R', 'S-Z', 'Deactivated'];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Employee Management',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol 
            ios_icon_name="magnifyingglass" 
            android_material_icon_name="search" 
            color={colors.textSecondary} 
            size={20} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol 
                ios_icon_name="xmark.circle.fill" 
                android_material_icon_name="cancel" 
                color={colors.textSecondary} 
                size={20} 
              />
            </Pressable>
          )}
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContentContainer}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryTab,
                  isSelected && styles.categoryTabSelected,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryTabText,
                  isSelected && styles.categoryTabTextSelected,
                ]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Add Employee Button */}
          <Pressable style={styles.addButton} onPress={handleAddEmployee}>
            <IconSymbol 
              ios_icon_name="plus.circle.fill" 
              android_material_icon_name="add_circle" 
              color="#FFFFFF" 
              size={24} 
            />
            <Text style={styles.addButtonText}>Add New Employee</Text>
          </Pressable>

          {/* Employee List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading employees...</Text>
            </View>
          ) : filteredEmployees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol 
                ios_icon_name="person.2.fill" 
                android_material_icon_name="people" 
                color={colors.textSecondary} 
                size={64} 
              />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No employees found' : 'No employees in this category'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Tap the button above to add your first employee'}
              </Text>
            </View>
          ) : (
            filteredEmployees.map((employee) => (
              <View 
                key={employee.id} 
                style={[
                  styles.employeeCard,
                  !employee.is_active && styles.inactiveCard
                ]}
              >
                <View style={styles.employeeHeader}>
                  <View style={styles.employeeInfo}>
                    {employee.profile_picture_url ? (
                      <Image 
                        source={{ uri: employee.profile_picture_url }} 
                        style={styles.profilePicture}
                      />
                    ) : (
                      <View style={styles.profilePicturePlaceholder}>
                        <IconSymbol 
                          ios_icon_name="person.fill" 
                          android_material_icon_name="person" 
                          color={colors.textSecondary} 
                          size={32} 
                        />
                      </View>
                    )}
                    <View style={styles.employeeDetails}>
                      <Text style={styles.employeeName}>{employee.full_name}</Text>
                      <Text style={styles.employeeJobTitle}>{employee.job_title}</Text>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(employee.role) }]}>
                        <Text style={styles.roleBadgeText}>{getRoleDisplayName(employee.role)}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.employeeInfoSection}>
                  <View style={styles.infoRow}>
                    <IconSymbol 
                      ios_icon_name="number" 
                      android_material_icon_name="tag" 
                      color={colors.textSecondary} 
                      size={16} 
                    />
                    <Text style={styles.infoLabel}>Username:</Text>
                    <Text style={styles.infoValue}>{employee.username}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <IconSymbol 
                      ios_icon_name="envelope.fill" 
                      android_material_icon_name="email" 
                      color={colors.textSecondary} 
                      size={16} 
                    />
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{employee.email}</Text>
                  </View>
                  {employee.phone_number && (
                    <View style={styles.infoRow}>
                      <IconSymbol 
                        ios_icon_name="phone.fill" 
                        android_material_icon_name="phone" 
                        color={colors.textSecondary} 
                        size={16} 
                      />
                      <Text style={styles.infoLabel}>Phone:</Text>
                      <Text style={styles.infoValue}>{employee.phone_number}</Text>
                    </View>
                  )}
                  {!employee.is_active && (
                    <View style={styles.inactiveNotice}>
                      <Text style={styles.inactiveText}>⚠️ Account Inactive</Text>
                    </View>
                  )}
                </View>

                <View style={styles.employeeActions}>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => handleEditEmployee(employee)}
                  >
                    <IconSymbol 
                      ios_icon_name="pencil" 
                      android_material_icon_name="edit" 
                      color={colors.managerAccent} 
                      size={20} 
                    />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => handleResetPassword(employee)}
                  >
                    <IconSymbol 
                      ios_icon_name="key.fill" 
                      android_material_icon_name="vpn_key" 
                      color={colors.warning} 
                      size={20} 
                    />
                    <Text style={styles.actionButtonText}>Reset PW</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => handleDelete(employee)}
                  >
                    <IconSymbol 
                      ios_icon_name="trash.fill" 
                      android_material_icon_name="delete" 
                      color={colors.error} 
                      size={20} 
                    />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Add/Edit Employee Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </Text>
              <Pressable onPress={() => {
                setModalVisible(false);
                resetForm();
              }}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  color={colors.textSecondary} 
                  size={28} 
                />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>Username *</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                placeholder="Enter username (e.g., 251)"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                placeholder="Enter full name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email address"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone_number}
                onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Job Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.job_title}
                onChangeText={(text) => setFormData({ ...formData, job_title: text })}
                placeholder="Enter job title"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Role *</Text>
              <View style={styles.roleSelector}>
                {(['employee', 'manager'] as const).map((role) => (
                  <Pressable
                    key={role}
                    style={[
                      styles.roleOption,
                      formData.role === role && styles.roleOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, role })}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      formData.role === role && styles.roleOptionTextSelected,
                    ]}>
                      {getRoleDisplayName(role)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {!editingEmployee && (
                <View style={styles.passwordNotice}>
                  <IconSymbol 
                    ios_icon_name="info.circle.fill" 
                    android_material_icon_name="info" 
                    color={colors.managerAccent} 
                    size={20} 
                  />
                  <Text style={styles.passwordNoticeText}>
                    Default password: mcloonesapp1{'\n'}
                    Employee will be prompted to change it on first login.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editingEmployee ? 'Update' : 'Create'}
                </Text>
              </Pressable>
            </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.employeeCard,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  categoryContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  categoryContentContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.employeeCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabSelected: {
    backgroundColor: colors.managerAccent,
    borderColor: colors.managerAccent,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryTabTextSelected: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 100,
  },
  addButton: {
    backgroundColor: colors.managerAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  employeeCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  employeeHeader: {
    marginBottom: 12,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profilePicturePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  employeeJobTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeeInfoSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  inactiveNotice: {
    backgroundColor: colors.warning + '20',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  inactiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
    textAlign: 'center',
  },
  employeeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
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
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.employeeCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: colors.managerAccent,
    backgroundColor: colors.managerAccent + '20',
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleOptionTextSelected: {
    color: colors.managerAccent,
  },
  passwordNotice: {
    flexDirection: 'row',
    backgroundColor: colors.managerAccent + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  passwordNoticeText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
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
