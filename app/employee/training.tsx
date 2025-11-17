
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Platform, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useGuides } from '@/hooks/useGuides';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function GuidesTrainingScreen() {
  const { guides, loading, error } = useGuides();

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return { ios: 'doc.fill', android: 'description' };
      case 'jpg':
      case 'jpeg':
      case 'png':
        return { ios: 'photo.fill', android: 'image' };
      case 'xlsx':
      case 'xls':
        return { ios: 'tablecells.fill', android: 'table_chart' };
      case 'doc':
      case 'docx':
        return { ios: 'doc.text.fill', android: 'article' };
      default:
        return { ios: 'doc.fill', android: 'description' };
    }
  };

  const handleDownloadFile = async (fileUrl: string, title: string, fileType: string) => {
    try {
      if (Platform.OS === 'web') {
        // For web, just open in new tab
        window.open(fileUrl, '_blank');
        return;
      }

      // For mobile, download and share
      const fileExtension = fileType.toLowerCase();
      const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}.${fileExtension}`;
      const fileUri = FileSystem.documentDirectory + fileName;

      Alert.alert('Downloading', 'Please wait while we download the file...');

      const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);

      if (downloadResult.status === 200) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert('Success', 'File downloaded successfully');
        }
      } else {
        throw new Error('Download failed');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      Alert.alert('Error', 'Failed to download file. Please try again.');
    }
  };

  const handleOpenFile = (fileUrl: string, title: string, fileType: string) => {
    if (Platform.OS === 'web') {
      window.open(fileUrl, '_blank');
    } else {
      Alert.alert(
        title,
        'What would you like to do?',
        [
          {
            text: 'View',
            onPress: () => Linking.openURL(fileUrl),
          },
          {
            text: 'Download',
            onPress: () => handleDownloadFile(fileUrl, title, fileType),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  // Group guides by category
  const groupedGuides = guides.reduce((acc, guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = [];
    }
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<string, typeof guides>);

  const categories: ('Employee HandBooks' | 'Full Menus' | 'Cheat Sheets' | 'Events Flyers')[] = [
    'Employee HandBooks',
    'Full Menus',
    'Cheat Sheets',
    'Events Flyers',
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Guides & Training',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.employeeAccent} />
            <Text style={styles.loadingText}>Loading guides...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <IconSymbol 
              ios_icon_name="exclamationmark.triangle.fill" 
              android_material_icon_name="error" 
              color={colors.error} 
              size={48} 
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.introText}>
              Access all training materials, guides, handbooks, and resources here.
            </Text>

            {categories.map((category) => {
              const categoryGuides = groupedGuides[category] || [];
              if (categoryGuides.length === 0) return null;

              return (
                <View key={category} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <IconSymbol 
                      ios_icon_name="folder.fill" 
                      android_material_icon_name="folder" 
                      color={colors.employeeAccent} 
                      size={24} 
                    />
                    <Text style={styles.categoryTitle}>{category}</Text>
                  </View>
                  {categoryGuides.map((guide) => {
                    const icon = getIconForType(guide.file_type);
                    return (
                      <Pressable
                        key={guide.id}
                        style={commonStyles.employeeCard}
                        onPress={() => handleOpenFile(guide.file_url, guide.title, guide.file_type)}
                      >
                        <View style={styles.guideHeader}>
                          <View style={styles.guideIcon}>
                            <IconSymbol 
                              ios_icon_name={icon.ios as any}
                              android_material_icon_name={icon.android}
                              color={colors.employeeAccent} 
                              size={24} 
                            />
                          </View>
                          <View style={styles.guideInfo}>
                            <Text style={styles.guideTitle}>{guide.title}</Text>
                            {guide.description && (
                              <Text style={styles.guideDescription}>{guide.description}</Text>
                            )}
                            <View style={styles.guideFooter}>
                              <Text style={styles.guideType}>{guide.file_type.toUpperCase()}</Text>
                              {guide.file_size && (
                                <Text style={styles.guideSize}>
                                  {(guide.file_size / 1024 / 1024).toFixed(2)} MB
                                </Text>
                              )}
                            </View>
                          </View>
                          <IconSymbol 
                            ios_icon_name="chevron.right" 
                            android_material_icon_name="chevron_right" 
                            color={colors.textSecondary} 
                            size={20} 
                          />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}

            {guides.length === 0 && (
              <View style={styles.emptyState}>
                <IconSymbol 
                  ios_icon_name="doc.text.magnifyingglass" 
                  android_material_icon_name="search" 
                  color={colors.textSecondary} 
                  size={64} 
                />
                <Text style={styles.emptyStateText}>No guides available yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Check back later for training materials and resources
                </Text>
              </View>
            )}

            <View style={styles.helpCard}>
              <IconSymbol 
                ios_icon_name="questionmark.circle.fill" 
                android_material_icon_name="help" 
                color={colors.employeeAccent} 
                size={24} 
              />
              <Text style={styles.helpText}>
                Need help or have questions? Contact your manager or the training department.
              </Text>
            </View>
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.employeePrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  guideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guideType: {
    fontSize: 12,
    color: colors.employeeAccent,
    fontWeight: '600',
  },
  guideSize: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  helpCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
  },
});
