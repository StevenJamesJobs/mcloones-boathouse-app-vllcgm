
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Image, Animated } from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { LinearGradient } from 'expo-linear-gradient';

export default function ManagerProfileScreen() {
  const { user, updateProfile, changePassword, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successAnimation] = useState(new Animated.Value(0));
  
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

  useEffect(() => {
    if (showSuccessMessage) {
      // Animate in
      Animated.spring(successAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        Animated.timing(successAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccessMessage(false);
        });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

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
      console.log('Password change successful, showing success message');
      // Show success message inline
      setShowSuccessMessage(true);
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

  const successScale = successAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const successOpacity = successAnimation;

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
          {/* Profile Header with Gradient */}
          <LinearGradient
            colors={[colors.managerPrimary, colors.managerAccent]}
            style={styles.profileHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
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
                    color="#FFFFFF" 
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
                  color={colors.managerPrimary} 
                  size={18} 
                />
                <Text style={styles.changePhotoText}>
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </Text>
              </Pressable>
            </View>
            
            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileName}>{user.full_name}</Text>
              <Text style={styles.profileUsername}>@{user.username}</Text>
              <View style={styles.roleBadge}>
                <IconSymbol 
                  ios_icon_name="star.fill" 
                  android_material_icon_name="star" 
                  color="#FFD700" 
                  size={16} 
                />
                <Text style={styles.roleBadgeText}>
                  {user.role === 'owner_manager' ? 'Owner/Manager' : 'Manager'}
                </Text>
              </View>
              {user.tagline && (
                <Text style={styles.profileTagline}>&quot;{user.tagline}&quot;</Text>
              )}
            </View>
          </LinearGradient>

          {/* Profile Info Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <IconSymbol 
                    ios_icon_name="person.circle.fill" 
                    android_material_icon_name="account_circle" 
                    color={colors.managerAccent} 
                    size={28} 
                  />
                  <Text style={styles.cardTitle}>Profile Information</Text>
                </View>
                {!isEditing && (
                  <Pressable 
                    style={styles.editIconButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <IconSymbol 
                      ios_icon_name="pencil" 
                      android_material_icon_name="edit" 
                      color={colors.managerAccent} 
                      size={22} 
                    />
                  </Pressable>
                )}
              </View>

              {isEditing ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.full_name}
                      onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                      placeholder="Enter full name"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Job Title *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.job_title}
                      onChangeText={(text) => setFormData({ ...formData, job_title: text })}
                      placeholder="Enter job title"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
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
                  </View>

                  <View style={styles.inputGroup}>
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
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.phone_number}
                      onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                      placeholder="Enter phone number"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
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
                  </View>

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
                      <IconSymbol 
                        ios_icon_name="checkmark" 
                        android_material_icon_name="check" 
                        color="#FFFFFF" 
                        size={20} 
                      />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <IconSymbol 
                        ios_icon_name="person.fill" 
                        android_material_icon_name="person" 
                        color={colors.managerAccent} 
                        size={20} 
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Username</Text>
                      <Text style={styles.infoValue}>{user.username}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <IconSymbol 
                        ios_icon_name="person.2.fill" 
                        android_material_icon_name="group" 
                        color={colors.managerAccent} 
                        size={20} 
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Full Name</Text>
                      <Text style={styles.infoValue}>{user.full_name}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <IconSymbol 
                        ios_icon_name="briefcase.fill" 
                        android_material_icon_name="work" 
                        color={colors.managerAccent} 
                        size={20} 
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Job Title</Text>
                      <Text style={styles.infoValue}>{user.job_title}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <IconSymbol 
                        ios_icon_name="envelope.fill" 
                        android_material_icon_name="mail" 
                        color={colors.managerAccent} 
                        size={20} 
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{user.email}</Text>
                    </View>
                  </View>
                  
                  {user.phone_number && (
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <IconSymbol 
                          ios_icon_name="phone.fill" 
                          android_material_icon_name="phone" 
                          color={colors.managerAccent} 
                          size={20} 
                        />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{user.phone_number}</Text>
                      </View>
                    </View>
                  )}
                  
                  {user.address && (
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <IconSymbol 
                          ios_icon_name="location.fill" 
                          android_material_icon_name="location_on" 
                          color={colors.managerAccent} 
                          size={20} 
                        />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <Text style={styles.infoValue}>{user.address}</Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Change Password Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <IconSymbol 
                    ios_icon_name="lock.fill" 
                    android_material_icon_name="lock" 
                    color={colors.managerAccent} 
                    size={28} 
                  />
                  <Text style={styles.cardTitle}>Security</Text>
                </View>
              </View>

              {/* Success Message - Inline within Security Section */}
              {showSuccessMessage && (
                <Animated.View 
                  style={[
                    styles.inlineSuccessMessage,
                    {
                      opacity: successOpacity,
                      transform: [{ scale: successScale }],
                    }
                  ]}
                >
                  <View style={styles.successIconContainer}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      color="#FFFFFF" 
                      size={32} 
                    />
                  </View>
                  <View style={styles.successTextContainer}>
                    <Text style={styles.successMessageTitle}>Password Updated!</Text>
                    <Text style={styles.successMessageText}>Your password has been changed successfully</Text>
                  </View>
                </Animated.View>
              )}

              {isChangingPassword ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>New Password *</Text>
                    <TextInput
                      style={styles.input}
                      value={passwordData.newPassword}
                      onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                      placeholder="Enter new password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password *</Text>
                    <TextInput
                      style={styles.input}
                      value={passwordData.confirmPassword}
                      onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                    />
                  </View>

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
                      <IconSymbol 
                        ios_icon_name="checkmark" 
                        android_material_icon_name="check" 
                        color="#FFFFFF" 
                        size={20} 
                      />
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
                    color="#FFFFFF" 
                    size={22} 
                  />
                  <Text style={styles.changePasswordText}>Change Password</Text>
                </Pressable>
              )}
            </View>
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
    paddingBottom: 100,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
  profileHeader: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  changePhotoText: {
    color: colors.managerPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  profileHeaderInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileTagline: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },
  cardContainer: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.managerAccent + '20',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  editIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.managerAccent + '15',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.managerAccent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.employeeBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 6,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.border + '60',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: colors.managerAccent,
    borderRadius: 12,
    gap: 10,
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inlineSuccessMessage: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 14,
    marginBottom: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  successIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextContainer: {
    flex: 1,
  },
  successMessageTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  successMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
