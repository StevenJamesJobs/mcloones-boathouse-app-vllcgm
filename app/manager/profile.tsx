
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Image } from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';

export default function ManagerProfileScreen() {
  const { user, updateProfile, changePassword, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    job_title: user?.job_title || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    email: user?.email || '',
    tagline: user?.tagline || '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        job_title: user.job_title,
        phone_number: user.phone_number || '',
        address: user.address || '',
        email: user.email,
        tagline: user.tagline || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.full_name || !formData.job_title || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.tagline && formData.tagline.length > 25) {
      Alert.alert('Error', 'Tagline must be 25 characters or less');
      return;
    }

    const result = await updateProfile({
      full_name: formData.full_name,
      job_title: formData.job_title,
      phone_number: formData.phone_number || null,
      address: formData.address || null,
      email: formData.email,
      tagline: formData.tagline || null,
    });

    if (result.success) {
      Alert.alert('Success', result.message);
      setIsEditing(false);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const result = await changePassword(passwordData.newPassword);

    if (result.success) {
      Alert.alert('Success', 'Password updated successfully! Your new password is now active.');
      setIsChangingPassword(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile picture');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;

    try {
      setUploading(true);
      console.log('Starting profile picture upload for URI:', uri);

      // Generate unique filename
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/profile.${fileExt}`;

      console.log('Generated filename:', fileName);

      // Fetch the image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      console.log('Blob created, size:', blob.size, 'type:', blob.type);

      // Convert blob to ArrayBuffer for upload
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert blob to ArrayBuffer'));
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, arrayBuffer, {
          contentType: blob.type || `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, data:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      const result = await updateProfile({
        profile_picture_url: publicUrl,
      });

      if (result.success) {
        Alert.alert('Success', 'Profile picture updated successfully');
        await refreshProfile();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available</Text>
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
            {user.profile_picture_url ? (
              <Image 
                source={{ uri: user.profile_picture_url }} 
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <IconSymbol 
                  ios_icon_name="person.fill" 
                  android_material_icon_name="person" 
                  color={colors.textSecondary} 
                  size={64} 
                />
              </View>
            )}
            <Pressable 
              style={styles.changePhotoButton}
              onPress={handlePickImage}
              disabled={uploading}
            >
              <IconSymbol 
                ios_icon_name="camera.fill" 
                android_material_icon_name="photo_camera" 
                color="#FFFFFF" 
                size={20} 
              />
              <Text style={styles.changePhotoText}>
                {uploading ? 'Uploading...' : 'Change Photo'}
              </Text>
            </Pressable>
          </View>

          {/* Profile Info Card */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Profile Information</Text>
              {!isEditing && (
                <Pressable onPress={() => setIsEditing(true)}>
                  <IconSymbol 
                    ios_icon_name="pencil" 
                    android_material_icon_name="edit" 
                    color={colors.managerAccent} 
                    size={24} 
                  />
                </Pressable>
              )}
            </View>

            {isEditing ? (
              <>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.full_name}
                  onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Job Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.job_title}
                  onChangeText={(text) => setFormData({ ...formData, job_title: text })}
                  placeholder="Enter job title"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Tagline (max 25 characters)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.tagline}
                  onChangeText={(text) => {
                    if (text.length <= 25) {
                      setFormData({ ...formData, tagline: text });
                    }
                  }}
                  placeholder="Enter a short tagline"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={25}
                />
                <Text style={styles.characterCount}>{formData.tagline.length}/25</Text>

                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email"
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

                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Enter address"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.editActions}>
                  <Pressable 
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setIsEditing(false);
                      setFormData({
                        full_name: user.full_name,
                        job_title: user.job_title,
                        phone_number: user.phone_number || '',
                        address: user.address || '',
                        email: user.email,
                        tagline: user.tagline || '',
                      });
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Username:</Text>
                  <Text style={styles.infoValue}>{user.username}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Full Name:</Text>
                  <Text style={styles.infoValue}>{user.full_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Job Title:</Text>
                  <Text style={styles.infoValue}>{user.job_title}</Text>
                </View>
                {user.tagline && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tagline:</Text>
                    <Text style={styles.infoValue}>&quot;{user.tagline}&quot;</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
                {user.phone_number && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.infoValue}>{user.phone_number}</Text>
                  </View>
                )}
                {user.address && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue}>{user.address}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Role:</Text>
                  <Text style={[styles.infoValue, styles.roleText]}>
                    {user.role === 'owner_manager' ? 'Owner/Manager' : 
                     user.role === 'manager' ? 'Manager' : 'Employee'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Change Password Card */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Change Password</Text>
            </View>

            {isChangingPassword ? (
              <>
                <Text style={styles.inputLabel}>New Password *</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />

                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />

                <View style={styles.editActions}>
                  <Pressable 
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ newPassword: '', confirmPassword: '' });
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
            ) : (
              <Pressable 
                style={styles.changePasswordButton}
                onPress={() => setIsChangingPassword(true)}
              >
                <IconSymbol 
                  ios_icon_name="key.fill" 
                  android_material_icon_name="vpn_key" 
                  color={colors.managerAccent} 
                  size={24} 
                />
                <Text style={styles.changePasswordText}>Change Password</Text>
              </Pressable>
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
    marginTop: 40,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.managerAccent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  roleText: {
    fontWeight: '600',
    color: colors.managerAccent,
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
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
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
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.managerAccent + '20',
    borderRadius: 8,
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.managerAccent,
    marginLeft: 8,
  },
});
