
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Image, Switch } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/app/integrations/supabase/client';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function EmployeeProfileScreen() {
  const { user, updateProfile, changePassword, refreshProfile } = useAuth();
  const { unreadCount, refreshInbox } = useMessages();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  
  const [formData, setFormData] = useState({
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    email: user?.email || '',
    tagline: user?.tagline || '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(
    user?.push_notifications_enabled ?? true
  );

  // Refresh unread count when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        refreshInbox();
      }
    }, [user?.id, refreshInbox])
  );

  useEffect(() => {
    if (user) {
      setFormData({
        phone_number: user.phone_number || '',
        address: user.address || '',
        email: user.email,
        tagline: user.tagline || '',
      });
      setPushNotificationsEnabled(user.push_notifications_enabled ?? true);
    }
  }, [user]);

  useEffect(() => {
    if (passwordChanged) {
      const timer = setTimeout(() => {
        setPasswordChanged(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [passwordChanged]);

  const handleSave = async () => {
    if (!formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.tagline && formData.tagline.length > 25) {
      Alert.alert('Error', 'Tagline must be 25 characters or less');
      return;
    }

    const result = await updateProfile({
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
      setPasswordChanged(true);
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

  const handleTogglePushNotifications = async (value: boolean) => {
    setPushNotificationsEnabled(value);
    
    const result = await updateProfile({
      push_notifications_enabled: value,
    });

    if (result.success) {
      Alert.alert(
        'Success',
        value
          ? 'Push notifications enabled. You will receive notifications for new messages.'
          : 'Push notifications disabled. You will not receive notifications for new messages.'
      );
    } else {
      // Revert on error
      setPushNotificationsEnabled(!value);
      Alert.alert('Error', result.message);
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
            backgroundColor: colors.employeeAccent,
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
            colors={[colors.employeeAccent, colors.employeePrimary]}
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
                  color={colors.employeeAccent} 
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
              {user.tagline && (
                <Text style={styles.profileTagline}>&quot;{user.tagline}&quot;</Text>
              )}
            </View>
          </LinearGradient>

          {/* Messages Card - Added here */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <MaterialIcons 
                    name="inbox" 
                    color={colors.employeeAccent} 
                    size={28} 
                  />
                  <Text style={styles.cardTitle}>Messages</Text>
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Pressable
                style={styles.messagesButton}
                onPress={() => router.push('/employee/inbox' as any)}
              >
                <MaterialIcons 
                  name="inbox" 
                  size={24} 
                  color={unreadCount > 0 ? colors.employeeAccent : colors.textSecondary} 
                />
                <View style={styles.messagesButtonContent}>
                  {unreadCount > 0 ? (
                    <>
                      <Text style={styles.messagesButtonTitle}>
                        {unreadCount} New Message{unreadCount !== 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.messagesButtonSubtitle}>
                        Tap to view your inbox
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.messagesButtonTitle}>No New Messages</Text>
                      <Text style={styles.messagesButtonSubtitle}>
                        Your inbox is all caught up
                      </Text>
                    </>
                  )}
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Profile Info Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <IconSymbol 
                    ios_icon_name="person.circle.fill" 
                    android_material_icon_name="account_circle" 
                    color={colors.employeeAccent} 
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
                      color={colors.employeeAccent} 
                      size={22} 
                    />
                  </Pressable>
                )}
              </View>

              {isEditing ? (
                <>
                  <View style={styles.readOnlyNotice}>
                    <IconSymbol 
                      ios_icon_name="info.circle.fill" 
                      android_material_icon_name="info" 
                      color={colors.employeeAccent} 
                      size={20} 
                    />
                    <Text style={styles.readOnlyText}>
                      Name, Username, and Job Title can only be changed by managers
                    </Text>
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
                        color={colors.employeeAccent} 
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
                        color={colors.employeeAccent} 
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
                        color={colors.employeeAccent} 
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
                        color={colors.employeeAccent} 
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
                          color={colors.employeeAccent} 
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
                          color={colors.employeeAccent} 
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

            {/* Notification Preferences Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <IconSymbol 
                    ios_icon_name="bell.fill" 
                    android_material_icon_name="notifications" 
                    color={colors.employeeAccent} 
                    size={28} 
                  />
                  <Text style={styles.cardTitle}>Notifications</Text>
                </View>
              </View>

              <View style={styles.notificationRow}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Push Notifications</Text>
                  <Text style={styles.notificationDescription}>
                    Receive notifications when you get new messages
                  </Text>
                </View>
                <Switch
                  value={pushNotificationsEnabled}
                  onValueChange={handleTogglePushNotifications}
                  trackColor={{ false: colors.border, true: colors.employeeAccent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Change Password Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <IconSymbol 
                    ios_icon_name="lock.fill" 
                    android_material_icon_name="lock" 
                    color={colors.employeeAccent} 
                    size={28} 
                  />
                  <Text style={styles.cardTitle}>Security</Text>
                  {passwordChanged && (
                    <View style={styles.successIndicator}>
                      <Text style={styles.successText}>Password Changed</Text>
                      <IconSymbol 
                        ios_icon_name="checkmark.circle.fill" 
                        android_material_icon_name="check_circle" 
                        color={colors.success} 
                        size={20} 
                      />
                    </View>
                  )}
                </View>
              </View>

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
    color: colors.employeeAccent,
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
    marginBottom: 8,
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
    borderBottomColor: colors.employeeAccent + '20',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.employeeAccent,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  messagesButtonContent: {
    flex: 1,
  },
  messagesButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  messagesButtonSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  successIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  editIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.employeeAccent + '15',
  },
  readOnlyNotice: {
    flexDirection: 'row',
    backgroundColor: colors.employeeAccent + '15',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    gap: 10,
  },
  readOnlyText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
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
    backgroundColor: colors.employeeAccent + '15',
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
    backgroundColor: colors.employeeAccent,
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
    backgroundColor: colors.employeeAccent,
    borderRadius: 12,
    gap: 10,
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
