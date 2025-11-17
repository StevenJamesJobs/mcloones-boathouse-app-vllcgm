
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/app/integrations/supabase/client';

export default function ManagerProfileScreen() {
  const { employee, updateEmployee, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(employee?.full_name || '');
  const [jobTitle, setJobTitle] = useState(employee?.job_title || '');
  const [tagline, setTagline] = useState(employee?.tagline || '');
  const [phoneNumber, setPhoneNumber] = useState(employee?.phone_number || '');
  const [address, setAddress] = useState(employee?.address || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(employee?.profile_picture_url || '');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isOwnerManager = employee?.role === 'owner_manager';

  const handleSave = async () => {
    if (tagline.length > 25) {
      Alert.alert('Error', 'Tagline must be 25 characters or less');
      return;
    }

    const updates: any = {
      tagline,
      phone_number: phoneNumber,
      address,
      email,
      profile_picture_url: profilePictureUrl,
    };

    // Only owner_manager can update name and job title
    if (isOwnerManager) {
      updates.full_name = fullName;
      updates.job_title = jobTitle;
    }

    const success = await updateEmployee(updates);

    if (success) {
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile picture');
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
      const fileName = `${employee?.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employees')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('employees')
        .getPublicUrl(filePath);

      setProfilePictureUrl(publicUrl);
      
      // Auto-save the profile picture
      await updateEmployee({ profile_picture_url: publicUrl });
      
      Alert.alert('Success', 'Profile picture updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Could not upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    const success = await changePassword(newPassword);
    
    if (success) {
      setChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (!employee) {
    return (
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <Text style={styles.errorText}>Not logged in</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Profile',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
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
                    size={60} 
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
                size={20} 
              />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          {/* Basic Info */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              {!editing && (
                <Pressable onPress={() => setEditing(true)}>
                  <IconSymbol 
                    ios_icon_name="pencil.circle.fill" 
                    android_material_icon_name="edit" 
                    color={colors.managerAccent} 
                    size={24} 
                  />
                </Pressable>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name {!isOwnerManager && '(Read-only)'}</Text>
              <TextInput
                style={[styles.input, (!editing || !isOwnerManager) && styles.inputDisabled]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                editable={editing && isOwnerManager}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username (Read-only)</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={employee.username}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Job Title {!isOwnerManager && '(Read-only)'}</Text>
              <TextInput
                style={[styles.input, (!editing || !isOwnerManager) && styles.inputDisabled]}
                value={jobTitle}
                onChangeText={setJobTitle}
                placeholder="Job Title"
                editable={editing && isOwnerManager}
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>
                {employee.role === 'owner_manager' ? 'Owner/Manager' : 'Manager'}
              </Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={commonStyles.employeeCard}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tagline (25 characters max)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={tagline}
                onChangeText={setTagline}
                placeholder="Add a tagline..."
                maxLength={25}
                editable={editing}
              />
              <Text style={styles.characterCount}>{tagline.length}/25</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={editing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="(123) 456-7890"
                keyboardType="phone-pad"
                editable={editing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea, !editing && styles.inputDisabled]}
                value={address}
                onChangeText={setAddress}
                placeholder="123 Main St, City, State ZIP"
                multiline
                numberOfLines={3}
                editable={editing}
              />
            </View>

            {editing && (
              <View style={styles.buttonRow}>
                <Pressable 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => {
                    setEditing(false);
                    setFullName(employee.full_name || '');
                    setJobTitle(employee.job_title || '');
                    setTagline(employee.tagline || '');
                    setPhoneNumber(employee.phone_number || '');
                    setAddress(employee.address || '');
                    setEmail(employee.email || '');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Password Change Section */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            {!changingPassword ? (
              <Pressable 
                style={styles.changePasswordButton} 
                onPress={() => setChangingPassword(true)}
              >
                <IconSymbol 
                  ios_icon_name="lock.fill" 
                  android_material_icon_name="lock" 
                  color={colors.managerAccent} 
                  size={20} 
                />
                <Text style={styles.changePasswordButtonText}>Change Password</Text>
              </Pressable>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    secureTextEntry
                  />
                </View>

                <View style={styles.buttonRow}>
                  <Pressable 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={() => {
                      setChangingPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.button, styles.saveButton]} 
                    onPress={handleChangePassword}
                  >
                    <Text style={styles.saveButtonText}>Update Password</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
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
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 20,
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.employeeCard,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    color: colors.text,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
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
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.employeeCard,
    borderWidth: 1,
    borderColor: colors.managerAccent,
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.managerAccent,
  },
});
